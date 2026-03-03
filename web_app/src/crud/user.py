# Внешние зависимости
from typing import Optional, List
from datetime import date
import sqlalchemy as sa
import sqlalchemy.orm as so
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError, NoResultFound
from fastapi import HTTPException, status
# Внутренние модули
from models import User, ApartmentOwner
from web_app.src.core import cfg, connection
from web_app.src.schemas import UserUpdate, ApartmentOwnerResponse


# Получаем пользователя по email
@connection
async def sql_get_user_by_email(
    email: str,
    session: AsyncSession,
    not_found_error: bool = True
) -> Optional[User]:
    try:
        user_result = await session.execute(
            sa.select(User)
            .where(User.email == email)
        )

        if not_found_error:
            user = user_result.scalar_one()

        else:
            user = user_result.scalar_one_or_none()

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

        if not user.is_active:
            cfg.logger.info(f"User not active: {user_id}")
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not active")

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


# Проверяем, является ли пользователь owner
@connection
async def sql_check_user_has_apartments(
    user_id: int,
    session: AsyncSession
) -> bool:
    try:
        stmt = sa.select(
            sa.exists().where(ApartmentOwner.user_id == user_id)
        )
        result = await session.execute(stmt)
        return result.scalar()

    except SQLAlchemyError as e:
        cfg.logger.error(f"Database error check user has apartments: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error")

    except Exception as e:
        cfg.logger.error(f"Unexpected error check user has apartments: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unexpected server error")


# Проверяем, является ли пользователь owner для объекта
@connection
async def sql_check_user_has_apartment_by_id(
    user_id: int,
    apartment_id: int,
    session: AsyncSession
) -> bool:
    try:
        stmt = sa.select(
            sa.exists()
            .where(
                ApartmentOwner.user_id == user_id,
                ApartmentOwner.apartment_id == apartment_id
            )
        )
        result = await session.execute(stmt)
        return result.scalar()

    except SQLAlchemyError as e:
        cfg.logger.error(f"Database error check user has apartments: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error")

    except Exception as e:
        cfg.logger.error(f"Unexpected error check user has apartments: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unexpected server error")


# Выводим объекты, прикрепленные к пользователю
@connection
async def sql_get_user_apartments(
    user_id: int,
    session: AsyncSession
) -> List[ApartmentOwnerResponse]:
    try:
        user_result = await session.execute(
            sa.select(User)
            .where(User.id == user_id)
            .options(
                so.selectinload(User.apartments)
            )
        )
        user = user_result.scalar_one_or_none()
        return [
            ApartmentOwnerResponse(
                id=apartment.id,
                title=apartment.title
            )
            for apartment in user.apartments
        ]

    except SQLAlchemyError as e:
        cfg.logger.error(f"Database error check user has apartments: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error")

    except Exception as e:
        cfg.logger.error(f"Unexpected error check user has apartments: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unexpected server error")