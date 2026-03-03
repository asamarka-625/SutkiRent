# Внешние зависимости
from typing import Optional
from datetime import timedelta
import sqlalchemy as sa
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError, NoResultFound
from fastapi import HTTPException, status
# Внутренние модули
from models import Order, ApartmentAvailability, Apartment
from web_app.src.core import cfg, connection
from web_app.src.schemas import CreateBookingRequest


# Создаем бронирование
@connection
async def sql_create_booking(
    user_id: Optional[int],
    price: float,
    data: CreateBookingRequest,
    session: AsyncSession
) -> None:
    try:
        apartment_id_result = await session.execute(
            sa.select(Apartment.id)
            .where(Apartment.external_id == data.external_apartment_id)
        )
        apartment_id = apartment_id_result.scalar_one()

        new_order = Order(
            apartment_id=apartment_id,
            user_id=user_id,
            phone=data.phone,
            first_name=data.first_name,
            last_name=data.last_name,
            adult_count=data.guests.adults,
            children_count=len(data.guests.children),
            email=data.email,
            wish=data.wish,
            price=price
        )
        session.add(new_order)
        await session.flush()

        days = []
        current_date = data.begin_date
        while current_date < data.end_date:
            days.append(current_date)
            current_date += timedelta(days=1)

        result = await session.execute(
            sa.update(ApartmentAvailability)
            .where(
                ApartmentAvailability.apartment_id == apartment_id,
                ApartmentAvailability.date.in_(days)
            )
            .values(
                is_available=False,
                reservation_id=new_order.id
            )
        )

        if result.rowcount == 0:
            cfg.logger.warning(f"No availability rows updated for booking {new_order.id}")

        await session.commit()

    except NoResultFound:
        cfg.logger.info(f"Apartment not found by external_apartment_id: {data.external_apartment_id}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Apartment not found")

    except SQLAlchemyError as e:
        cfg.logger.error(
            f"Database error create booking by external_apartment_id = {data.external_apartment_id}, "
            f"user_id: {user_id}: {e}"
        )
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error")

    except Exception as e:
        cfg.logger.error(
            f"Unexpected error create booking by external_apartment_id = {data.external_apartment_id}, "
            f"user_id: {user_id}: {e}"
        )
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unexpected server error")