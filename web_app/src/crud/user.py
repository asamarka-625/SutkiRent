# Внешние зависимости
from typing import Optional
from datetime import date
import sqlalchemy as sa
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError, NoResultFound
from fastapi import HTTPException, status
# Внутренние модули
from models import User
from web_app.src.core import cfg, connection
from web_app.src.schemas import UserUpdate


# Получаем пользователя по email
@connection
async def sql_get_user_by_email(
    email: str,
    session: AsyncSession
) -> User:
    try:
        user_result = await session.execute(
            sa.select(User)
            .where(User.email == email)
        )
        user = user_result.scalar_one()

        return user

    except NoResultFound:
        cfg.logger.info(f"User not found by email: {email}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    except SQLAlchemyError as e:
        cfg.logger.error(f"Database error get user by email: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error")

    except Exception as e:
        cfg.logger.error(f"Unexpected error get user by email: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unexpected server error")


# Получаем пользователя по id
@connection
async def sql_get_user_by_id(
    user_id: int,
    session: AsyncSession
) -> User:
    try:
        user_result = await session.execute(
            sa.select(User)
            .where(User.id == user_id)
        )
        user = user_result.scalar_one()

        return user

    except NoResultFound:
        cfg.logger.info(f"User not found by id: {user_id}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    except SQLAlchemyError as e:
        cfg.logger.error(f"Database error get user by id: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error")

    except Exception as e:
        cfg.logger.error(f"Unexpected error get user by id: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unexpected server error")


# Создаем нового пользователя
@connection
async def sql_create_user(
    name: str,
    email: str,
    password_hash: str,
    session: AsyncSession,
    surname: Optional[str] = None,
    patronymic: Optional[str] = None,
    date_of_birth: Optional[date] = None,
    phone: Optional[str] = None
) -> None:
    try:
       new_user = User(
           name=name,
           email=email,
           password_hash=password_hash,
           surname=surname,
           patronymic=patronymic,
           date_of_birth=date_of_birth,
           phone=phone
       )
       session.add(new_user)
       await session.commit()

    except SQLAlchemyError as e:
        cfg.logger.error(f"Database error create new user: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error")

    except Exception as e:
        cfg.logger.error(f"Unexpected error create new user: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unexpected server error")


# Обновляем пароль пользователя
@connection
async def sql_update_password_user_by_email(
    email: str,
    new_password_hash: str,
    session: AsyncSession
) -> None:
    try:
        await session.execute(
            sa.update(User)
            .where(User.email == email)
            .values({
                User.password_hash: new_password_hash
            })
        )

        await session.commit()

    except SQLAlchemyError as e:
        cfg.logger.error(f"Database error update password user by email: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error")

    except Exception as e:
        cfg.logger.error(f"Unexpected error update password user by email: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unexpected server error")


# Обновляем данные пользователя
@connection
async def sql_update_user_info(
    user_id: int,
    data: UserUpdate,
    session: AsyncSession
) -> None:
    try:
        await session.execute(
            sa.update(User)
            .where(User.id == user_id)
            .values(**data.model_dump())
        )

        await session.commit()

    except SQLAlchemyError as e:
        cfg.logger.error(f"Database error update info user: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error")

    except Exception as e:
        cfg.logger.error(f"Unexpected error update info user: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unexpected server error")