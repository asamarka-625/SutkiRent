# Внешние зависимости
from typing import Optional, List, Set
from datetime import date
import sqlalchemy as sa
import sqlalchemy.orm as so
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError, IntegrityError, NoResultFound
from fastapi import HTTPException, status
# Внутренние модули
from models import (Apartment, ApartmentAvailability, Favorite, TypeApartment, MetroStation, Window,
                    Bathroom, Item, ApartmentItem)
from web_app.src.core import cfg, connection
from web_app.src.schemas import (ApartmentResponse, ObjectsResponse, PriceFilter, SleepFilter,
                                 FloorFilter, AreaFilter, RoomFilter, ApartmentDetailResponse,
                                 DataFiltersResponse, ApartmentType, ApartmentMetro, ApartmentWindow,
                                 ApartmentBathroom, ApartmentItem as ApartmentItemScheme)


# Поиск объектов по фильтрам
@connection
async def sql_get_available_apartments(
    session: AsyncSession,
    quantity: int = 1,
    page: int = 1,
    page_size: int = 10,
    region_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    children_count: Optional[int] = None,
    price: Optional[PriceFilter] = None,
    sleeping_places: Optional[SleepFilter] = None,
    floor: Optional[FloorFilter] = None,
    area: Optional[AreaFilter] = None,
    room: Optional[RoomFilter] = None,
    type_apartment_ids: Optional[Set[int]] = None,
    bathroom_ids: Optional[Set[int]] = None,
    metro_ids: Optional[Set[int]] = None,
    window_ids: Optional[Set[int]] = None,
    item_ids: Optional[Set[int]] = None
) -> ObjectsResponse:
    try:
        nights_count = (end_date - start_date).days if (start_date and end_date) else 0
        if start_date and end_date and nights_count <= 0:
            return ObjectsResponse(next_page=False, count=0, apartments=[])

        # 1. Собираем базовые фильтры для Apartment в список
        filters = [Apartment.capacity >= quantity, Apartment.visibility.is_(True)]
        if region_id:
            filters.append(Apartment.region_id == region_id)

        if children_count is not None:
            filters.append(Apartment.max_children_count >= children_count)

        if sleeping_places:
            if sleeping_places.min: filters.append(Apartment.capacity >= sleeping_places.min)
            if sleeping_places.max: filters.append(Apartment.capacity <= sleeping_places.max)

        if floor:
            if floor.min: filters.append(Apartment.floor >= floor.min)
            if floor.max: filters.append(Apartment.floor <= floor.max)

        if area:
            if area.min: filters.append(Apartment.area >= area.min)
            if area.max: filters.append(Apartment.area <= area.max)

        if room:
            if room.min: filters.append(Apartment.rooms >= room.min)
            if room.max: filters.append(Apartment.rooms <= room.max)

        if type_apartment_ids:
            filters.append(Apartment.apartment_type_id.in_(type_apartment_ids))

        if bathroom_ids:
            filters.append(Apartment.bathrooms.any(Bathroom.id.in_(bathroom_ids)))

        if window_ids:
            filters.append(Apartment.windows.any(Window.id.in_(window_ids)))

        if metro_ids:
            filters.append(Apartment.metro_stations.any(MetroStation.id.in_(metro_ids)))

        if item_ids:
            for i_id in item_ids:
                filters.append(
                    Apartment.apartment_items.any(
                        ApartmentItem.item_id == i_id
                    )
                )

        # 2. Формируем запрос
        if nights_count > 0:
            avail = sa.orm.aliased(ApartmentAvailability)

            # Считаем сумму только за ночи проживания (НЕ включая день выезда)
            total_cost_expr = sa.func.sum(
                sa.case(
                    (avail.date < end_date, avail.price),
                    else_=0
                )
            )

            query = (
                sa.select(Apartment, total_cost_expr.label("total_cost"))
                .join(avail, sa.and_(
                    Apartment.id == avail.apartment_id,
                    avail.date >= start_date,
                    avail.date <= end_date,
                    avail.is_available == True,
                    avail.price.is_not(None),
                    avail.price > 0
                ))
                .where(*filters)
                .group_by(Apartment.id)
                # Ожидаем nights_count ночей + 1 день выезда
                .having(sa.func.count(avail.id) == nights_count + 1)
            )

            arrival_check = sa.select(1).where(
                ApartmentAvailability.apartment_id == Apartment.id,
                ApartmentAvailability.date == start_date,
                ApartmentAvailability.closed_on_arrival == False,
                ApartmentAvailability.min_stay <= nights_count
            ).exists()
            query = query.where(arrival_check)

            departure_check = sa.select(1).where(
                ApartmentAvailability.apartment_id == Apartment.id,
                ApartmentAvailability.date == end_date,
                ApartmentAvailability.closed_on_departure == False
            ).exists()
            query = query.where(departure_check)

            if price:
                price_filters = []
                if price.min is not None: price_filters.append(total_cost_expr >= price.min)
                if price.max is not None: price_filters.append(total_cost_expr <= price.max)
                if price_filters:
                    query = query.having(sa.and_(*price_filters))

        else:
            query = sa.select(
                Apartment,
                sa.cast(sa.literal(0), sa.Float).label("total_cost")
            ).where(*filters)

        # 3. Опции загрузки, пагинация и выполнение
        query = query.options(
            so.selectinload(Apartment.apartment_type),
            so.selectinload(Apartment.bathrooms),
            so.selectinload(Apartment.photos),
            so.selectinload(Apartment.metro_stations)
        ).limit(page_size + 1).offset((page - 1) * page_size).order_by(Apartment.priority.desc())

        result = await session.execute(query)
        rows = result.all()

        # 4. Обработка пагинации
        next_flag = len(rows) > page_size
        if next_flag:
            rows = rows[:page_size]

        # 5. Формирование ответа
        apartments_response = []
        for apt, t_cost in rows:
            main_photo = None
            if apt.photos:
                main_photo = next((p.url for p in apt.photos if p.order == 0), apt.photos[0].url)

            if apt.increase_capacity and apt.increase_capacity_price:
                increase_capacity = quantity - apt.increase_capacity
                increase_cost = increase_capacity * apt.increase_capacity_price if increase_capacity > 0 else 0

            else:
                increase_cost = 0

            apartments_response.append(ApartmentResponse(
                id=apt.id,
                title=apt.title,
                type=apt.apartment_type.title if apt.apartment_type else None,
                bathroom=[bathroom.title for bathroom in apt.bathrooms],
                cost=float(t_cost) + increase_cost if t_cost else 0.0,
                price=apt.price_without_discount,
                rooms=apt.rooms,
                sleeps=apt.sleeps,
                floor=apt.floor,
                capacity=apt.capacity,
                address=apt.address,
                metro=[m.title for m in apt.metro_stations],
                media=[main_photo] if main_photo else [],
                latitude=apt.latitude,
                longitude=apt.longitude
            ))

        return ObjectsResponse(
            next_page=next_flag,
            count=len(apartments_response),
            apartments=apartments_response
        )

    except SQLAlchemyError as e:
        cfg.logger.error(f"Database error get available apartments: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error")

    except Exception as e:
        import traceback
        traceback.print_exc()
        cfg.logger.error(f"Unexpected error get available apartments: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unexpected server error")


# Обновляем регион для всех объектов с определенным городом
@connection
async def sql_upd_region_for_apartments(
    city_id: int,
    region_id: int,
    session: AsyncSession
) -> None:
    try:
        await session.execute(
           sa.update(Apartment)
           .where(Apartment.city_id == city_id)
           .values({
               Apartment.region_id: region_id
           })
        )
        await session.commit()

    except SQLAlchemyError as e:
        cfg.logger.error(
            f"Database error update region for apartments (region_id: {region_id}, city_id: {city_id}): {e}"
        )
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error")

    except Exception as e:
        cfg.logger.error(
            f"Unexpected error update region for apartments (region_id: {region_id}, city_id: {city_id}): {e}"
        )
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unexpected server error")


# Добавить объект в избранного у пользователя
@connection
async def sql_add_favorite_for_user(
    user_id: int,
    apartment_id: int,
    session: AsyncSession
) -> None:
    try:
        await session.execute(
            sa.insert(Favorite)
            .values({
                Favorite.user_id: user_id,
                Favorite.apartment_id: apartment_id
            })
        )
        await session.commit()

    except IntegrityError:
        # Эта ошибка возникнет при нарушении UniqueConstraint (дубликате)
        await session.rollback()
        cfg.logger.warning(f"User {user_id} already has apartment {apartment_id} in favorites")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="The object is already in your favorites"
        )

    except SQLAlchemyError as e:
        cfg.logger.error(f"Database error add apartment ({apartment_id}) in favorite for user ({user_id}): {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error")

    except Exception as e:
        cfg.logger.error(f"Unexpected error add apartment ({apartment_id}) in favorite for user ({user_id}): {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unexpected server error")


# Удалить объект из избранного у пользователя
@connection
async def sql_remove_favorite_for_user(
    user_id: int,
    apartment_id: int,
    session: AsyncSession
) -> None:
    try:
        result = await session.execute(
            sa.delete(Favorite)
            .where(
                Favorite.user_id == user_id,
                Favorite.apartment_id == apartment_id
            )
        )

        # Проверяем, была ли удалена хоть одна запись
        if result.rowcount == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Favorite not found"
            )

        await session.commit()

    except HTTPException:
        raise

    except SQLAlchemyError as e:
        cfg.logger.error(f"Database error remove apartment ({apartment_id}) in favorite for user ({user_id}): {e}")
        raise HTTPException(status_code=500, detail="Database error")

    except Exception as e:
        cfg.logger.error(f"Unexpected error remove apartment ({apartment_id}) in favorite for user ({user_id}): {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unexpected server error")


# Получаем объект по ID
@connection
async def sql_get_apartment_by_id(
    apartment_id: int,
    session: AsyncSession
) -> ApartmentDetailResponse:
    try:
        apartment_result = await session.execute(
            sa.select(Apartment)
            .options(
                so.joinedload(Apartment.apartment_type),
                so.joinedload(Apartment.bathrooms),
                so.selectinload(Apartment.photos),
                so.selectinload(Apartment.metro_stations),
                so.selectinload(Apartment.windows),
                so.selectinload(Apartment.apartment_items).joinedload(ApartmentItem.item)
            )
            .where(Apartment.id == apartment_id)
        )
        apartment = apartment_result.scalar_one()

        return ApartmentDetailResponse(
            id=apartment.id,
            external_id=apartment.external_id,
            title=apartment.title,
            type=apartment.apartment_type.title if apartment.apartment_type else None,
            bathroom=[bathroom.title for bathroom in apartment.bathrooms],
            description=apartment.description,
            price=apartment.price_without_discount,
            rooms=apartment.rooms,
            sleeps=apartment.sleeps,
            floor=apartment.floor,
            capacity=apartment.capacity,
            address=apartment.address,
            metro=[m.title for m in apartment.metro_stations],
            media={p.order: p.url for p in apartment.photos},
            latitude=apartment.latitude,
            longitude=apartment.longitude,
            windows=[window.title for window in apartment.windows],
            items=[ai.item.title for ai in apartment.apartment_items]
        )

    except NoResultFound:
        cfg.logger.info(f"Apartment not found by id: {apartment_id}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Apartment not found")

    except SQLAlchemyError as e:
        cfg.logger.error(f"Database error get apartment by id = {apartment_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error")

    except Exception as e:
        cfg.logger.error(f"Unexpected error get apartment by id = {apartment_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unexpected server error")


# Получаем данные для фильтров
@connection
async def sql_get_data_for_filters(
    session: AsyncSession,
    region_id: Optional[int] = None
) -> DataFiltersResponse:
    try:
        queries = {
            "types": sa.select(TypeApartment.id, TypeApartment.title),
            "windows": sa.select(Window.id, Window.title),
            "bathrooms": sa.select(Bathroom.id, Bathroom.title),
            "items": sa.select(Item.id, Item.title).where(Item.importance == True)
        }

        if region_id is not None:
            queries["metro"] = (
                sa.select(MetroStation.id, MetroStation.title)
                .where(MetroStation.region_id == region_id)
        )

        # Собираем словарь результатов
        data = {}
        for key, query in queries.items():
            result = await session.execute(query)
            data[key] = result.all()

        return DataFiltersResponse(
            types=[ApartmentType(id=row[0], title=row[1]) for row in data["types"]],
            metro= [ApartmentMetro(id=row[0], title=row[1]) for row in data["metro"]] \
                if data.get("metro", False) else [],
            windows=[ApartmentWindow(id=row[0], title=row[1]) for row in data["windows"]],
            bathrooms=[ApartmentBathroom(id=row[0], title=row[1]) for row in data["bathrooms"]],
            items=[ApartmentItemScheme(id=row[0], title=row[1]) for row in data["items"]]
        )

    except SQLAlchemyError as e:
        cfg.logger.error(f"Database error get data for filters by region_id = {region_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error")

    except Exception as e:
        cfg.logger.error(f"Unexpected error get data for filters by region_id = {region_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unexpected server error")