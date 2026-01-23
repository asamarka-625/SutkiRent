# Внешние зависимости
from typing import Dict
import random
import string
from fastapi import APIRouter, Depends, HTTPException, status, Response, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from starlette.responses import JSONResponse
# Внутренние модули
from web_app.src.dependencies import (authenticate_user, create_refresh_token, create_access_token,
                                      create_csrf_token, get_connection_info, get_current_user_by_access_token,
                                      get_data_by_refresh_token, verify_csrf_token)
from web_app.src.core import cfg
from models import User
from web_app.src.utils import redis_service, email_service, get_password_hash, create_reset_token
from web_app.src.schemas import UserCreate, VerifyRequest, EmailBase, PasswordResetConfirmRequest, TokenRequest
from web_app.src.crud import sql_create_user, sql_get_user_by_email, sql_update_password_user_by_email


router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Authentication"]
)


@router.post(
    "/login",
    response_class=JSONResponse,
    summary="Аутентификация пользователя"
)
async def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    connection_info: Dict[str, str] = Depends(get_connection_info)
):
    user = await authenticate_user(form_data.username, form_data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    refresh_token = await create_refresh_token(
        user_id=str(user.id),
        user_agent=connection_info["user_agent"],
        ip=connection_info["ip"]
    )

    response.set_cookie(
        key="refresh_token",
        path="/",
        value=refresh_token,
        httponly=True,
        secure=False, # HTTP
        samesite="lax",
        max_age=cfg.REFRESH_TOKEN_EXPIRE_MINUTES * 60
    )

    tokens = {
        "csrf_token": create_csrf_token(user_id=str(user.id)),
        "access_token": create_access_token(user_id=str(user.id))
    }

    return tokens


@router.post(
    "/refresh",
    response_class=JSONResponse,
    summary="Обновление токена"
)
async def get_refresh_token(
    response: Response,
    token_data: Dict[str, str] = Depends(get_data_by_refresh_token),
    connection_info: Dict[str, str] = Depends(get_connection_info)
):
    refresh_token = await create_refresh_token(
        user_id=token_data["user_id"],
        user_agent=connection_info["user_agent"],
        ip=connection_info["ip"],
        last_token=token_data["jti"]
    )

    response.set_cookie(
        key="refresh_token",
        path="/",
        value=refresh_token,
        httponly=True,
        secure=False, # HTTP
        samesite="lax",
        max_age=cfg.REFRESH_TOKEN_EXPIRE_MINUTES * 60
    )

    tokens = {
        "csrf_token": create_csrf_token(user_id=token_data["user_id"]),
        "access_token": create_access_token(user_id=token_data["user_id"])
    }

    return tokens


@router.post("/logout")
async def logout(
    response: Response,
    current_user: User = Depends(get_current_user_by_access_token),
    token_data: Dict[str, str] = Depends(get_data_by_refresh_token),
    csrf_user_id: str = Depends(verify_csrf_token)
):
    user_id_str = str(current_user.id)
    if not (user_id_str == token_data["user_id"] == csrf_user_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Token user mismatch")

    await redis_service.del_user_refresh_token(
        user_id=token_data["user_id"],
        refresh_uuid=token_data["jti"]
    )

    response.delete_cookie(key="refresh_token", path="/")

    return {"message": "Logout successful", "redirect": "/login"}


@router.post(
    "/register",
    response_class=JSONResponse,
    summary="Регистрация нового пользователя"
)
async def register(
    user: UserCreate,
    background_tasks: BackgroundTasks
):
    try:
        if await sql_get_user_by_email(
            email=user.email,
            not_found_error=False
        ) is not None:
            return {
                "unique": False,
                "message": "Email already exists"
            }

        # Хеширование пароля
        hashed_password = get_password_hash(user.password)

        user_dict = user.model_dump(exclude={"password"})
        user_dict["password_hash"] = hashed_password

        code = ''.join(random.choices(string.digits, k=6))

        success = await redis_service.save_verification_code(
            email=user.email,
            code=code,
            user_data=user_dict
        )

        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error saving registration data"
            )

        background_tasks.add_task(
            email_service.send_verification_email,
            user.email,
            code
        )

        return {
            "unique": True,
            "message": "The confirmation code has been sent to your email"
        }

    except HTTPException:
        raise

    except:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )


@router.post(
    "/verify-email",
    response_class=JSONResponse,
    summary="Верификация пользователя"
)
async def verify_email(request: VerifyRequest):
    try:
        success, user_data, message = await redis_service.verify_code(
            email=request.email,
            code=request.code
        )

        if not success:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)

        await sql_create_user(**user_data)

        return {
            "message": "User registered successfully"
        }

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    except HTTPException:
        raise

    except:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )


@router.post(
    "/resend-code",
    response_class=JSONResponse,
    summary="Повторная отправка кода подтверждения"
)
async def resend_verification_code(
    request: EmailBase,
    background_tasks: BackgroundTasks
):
    # Проверяем, есть ли данные регистрации
    registration_data = await redis_service.get_registration_data(request.email)
    if not registration_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration data not found or expired"
        )

    # Генерируем новый код
    new_code = ''.join(random.choices(string.digits, k=6))

    # Обновляем код в Redis
    success = await redis_service.resend_verification_code(
        email=request.email,
        new_code=new_code
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to send new code"
        )

    # Отправляем email с новым кодом
    background_tasks.add_task(
        email_service.send_verification_email,
        request.email,
        new_code
    )

    return {
        "message": "New verification code sent"
    }


@router.post(
    "/forgot-password",
    response_class=JSONResponse,
    summary="Запрос на восстановление пароля"
)
async def forgot_password(
    request: EmailBase,
    background_tasks: BackgroundTasks
):
    user = await sql_get_user_by_email(email=request.email)
    if user is None:
        return {"message": "Если пользователь с таким email существует, инструкции отправлены"}

    # Создаем токен восстановления
    reset_token = create_reset_token()

    await redis_service.add_reset_password_token(
        token=reset_token,
        email=request.email
    )

    # Отправляем email
    background_tasks.add_task(
        email_service.send_password_reset_email,
        **{
            "email": request.email,
            "reset_token": reset_token,
            "username": user.name
        }
    )

    return {"message": "Если пользователь с таким email существует, инструкции отправлены"}


@router.post(
    "/check-reset-token",
    response_class=JSONResponse,
    summary="Проверка токена для смены пароля"
)
async def check_reset_token(request: TokenRequest):
    # Проверяем токен
    user_email = await redis_service.get_reset_password_token(request.token)
    if not user_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The recovery token is invalid or expired"
        )

    return {
        "message": "Токен валидный",
    }


@router.post(
    "/password-reset-confirm",
    response_class=JSONResponse,
    summary="Подтверждение восстановления пароля и установка нового"
)
async def confirm_password_reset(request: PasswordResetConfirmRequest):
    # Проверяем токен
    user_email = await redis_service.get_reset_password_token(request.token)
    if not user_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The recovery token is invalid or expired"
        )

    # Находим пользователя
    user = await sql_get_user_by_email(email=user_email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Хэшируем новый пароль
    new_password_hash = get_password_hash(request.new_password)

    # Проверяем, не совпадает ли новый пароль со старым
    if user.password_hash == new_password_hash:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The new password cannot be the same as the previous one"
        )

    # Обновляем пароль
    await sql_update_password_user_by_email(
        email=user_email,
        new_password_hash=new_password_hash
    )

    await redis_service.del_reset_password_token(request.token)

    return {
        "message": "Пароль успешно изменен",
        "email": user_email
    }