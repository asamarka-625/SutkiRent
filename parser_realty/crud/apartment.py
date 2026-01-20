# Внешние зависимости
from typing import Sequence, Dict, List, Tuple
import sqlalchemy as sa
import sqlalchemy.orm as so
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError, NoResultFound
# Внутренние модули
from models import (Apartment as ApartmentModel, PhotoApartment, MetroStation as MetroStationModel,
                    Service, City, ApartmentMetro, ApartmentService, PriceHistory,
                    ApartmentAvailability)
from parser_realty.core import cfg, connection
from parser_realty.schemas import Apartment, MetroStation, Calendar


# Получаем объекты
@connection
async def sql_get_apartments(session: AsyncSession) -> Sequence[ApartmentModel]:
    try:
        result = await session.execute(
            sa.select(ApartmentModel)
        )

        return result.scalars().all()

    except SQLAlchemyError as e:
        cfg.logger.error(f"Database error get apartments: {e}")
        raise

    except Exception as e:
        cfg.logger.error(f"Unexpected error get apartments: {e}")
        raise


# Получаем external_id объектов
@connection
async def sql_get_external_ids_apartments(session: AsyncSession) -> Tuple[int, ...]:
    try:
        result = await session.execute(
            sa.select(ApartmentModel.external_id)
        )

        return tuple(result.scalars().all())

    except SQLAlchemyError as e:
        cfg.logger.error(f"Database error get apartments: {e}")
        raise

    except Exception as e:
        cfg.logger.error(f"Unexpected error get apartments: {e}")
        raise


# Записываем станции метро, если они не существуют
@connection
async def sql_add_not_exist_metro(
    metro_stations: List[MetroStation],
    session: AsyncSession
) -> Dict[int, int]:
    stations_ids = tuple(station.id for station in metro_stations)

    stations_result = await session.execute(
        sa.select(MetroStationModel.id, MetroStationModel.external_id)
        .where(MetroStationModel.external_id.in_(stations_ids))
    )
    stations = stations_result.all()
    stations_mapping = {row.external_id: row.id for row in stations}

    stations_to_insert = []
    for station in metro_stations:
        if station.id not in stations_mapping:
            stations_to_insert.append({
                "external_id": station.id,
                "title": station.title
            })

    if stations_to_insert:
        # Используем insert().returning() для получения ID новых записей
        insert_stmt = sa.insert(MetroStationModel).returning(
            MetroStationModel.id,
            MetroStationModel.external_id
        )

        result = await session.execute(insert_stmt, stations_to_insert)

        # Добавляем новые записи в маппинг
        for row in result:
            stations_mapping[row.external_id] = row.id

    return stations_mapping


# Записываем сервисы, если они не существуют
@connection
async def sql_add_not_exist_service(
    titles: List[str],
    session: AsyncSession
) -> Dict[str, int]:
    services_result = await session.execute(
        sa.select(Service.id, Service.title)
        .where(Service.title.in_(
            tuple(title.lower() for title in titles)
        ))
    )
    services = services_result.all()
    services_mapping = {row.title: row.id for row in services}

    services_to_insert = []
    for title in titles:
        if title not in services_mapping:
            services_to_insert.append({
                "title": title.lower()
            })

    if services_to_insert:
        # Используем insert().returning() для получения ID новых записей
        insert_stmt = sa.insert(Service).returning(
            Service.id,
            Service.title
        )

        result = await session.execute(insert_stmt, services_to_insert)

        # Добавляем новые записи в маппинг
        for row in result:
            services_mapping[row.title] = row.id

    return services_mapping


# Записываем объект или обновляем существующий
@connection
async def sql_add_or_update_apartment(data: Apartment, session: AsyncSession) -> None:
    try:
        data_dict = data.model_dump(exclude={
            "id", "desc", "coordinates", "price",
            "photos", "metro_stations", "city", "services"
        })
        data_dict["external_id"] = data.id
        data_dict["description"] = data.desc
        data_dict["latitude"] = data.coordinates.lat
        data_dict["longitude"] = data.coordinates.lon
        data_dict["price_without_discount"] = data.price.common.without_discount
        data_dict["price_with_discount"] = data.price.common.with_discount
        data_dict["discount_percent"] = data.price.common.discount_percent
        data_dict["price_details"] = data.price.details.model_dump()

        apartment_result = await session.execute(
            sa.select(ApartmentModel)
            .where(ApartmentModel.external_id == data.id)
            .options(
                so.selectinload(ApartmentModel.photos),
                so.selectinload(ApartmentModel.metro_stations),
                so.selectinload(ApartmentModel.services)
            )
        )
        apartment = apartment_result.scalar_one_or_none()

        stations_mapping = await sql_add_not_exist_metro(
            metro_stations=data.metro_stations,
            session=session,
            no_decor=True
        )
        services_mapping = await sql_add_not_exist_service(
            titles=data.services,
            session=session,
            no_decor=True
        )

        city_result = await session.execute(
            sa.select(City.id, City.region_id)
            .where(City.external_id == data.city.id)
        )
        city = city_result.one_or_none()

        if city is None:
            new_city = City(
                external_id=data.city.id,
                title=data.city.title
            )
            session.add(new_city)
            await session.flush()
            data_dict["city_id"] = new_city.id

        else:
            data_dict["city_id"] = city.id
            data_dict["region_id"] = city.region_id

        if apartment is not None:

            apartment_dict = apartment.to_dict()
            price_keys = ("price_without_discount", "price_with_discount",
                          "discount_percent", "price_details")
            upd_price = False
            upd_mapping = {}

            for key, value in data_dict.items():
                if not upd_price and key in price_keys and value != apartment_dict[key]:
                    upd_price = True

                if value != apartment_dict[key]:
                    upd_mapping[key] = value

            if upd_price:
                new_price_history = PriceHistory(
                    apartment_id=apartment.id,
                    price_without_discount=apartment_dict["price_without_discount"],
                    price_with_discount=apartment_dict["price_with_discount"],
                    discount_percent=apartment_dict["discount_percent"],
                    price_details=apartment_dict["price_details"]
                )
                session.add(new_price_history)

            if upd_mapping:
                apartment.update_from_dict(upd_mapping)

            current_photos = {p.order: p for p in apartment.photos}
            new_photos_list = []
            for index, photo in enumerate(data.photos):
                url_str = str(photo.url)
                if index in current_photos:
                    if current_photos[index].url != url_str:
                        current_photos[index].url = url_str
                    new_photos_list.append(current_photos[index])

                else:
                    new_photo = PhotoApartment(
                        apartment_id=apartment.id,
                        url=url_str,
                        order=index
                    )
                    new_photos_list.append(new_photo)

            apartment.photos = new_photos_list

            db_stations_result = await session.execute(
                sa.select(MetroStationModel)
                .where(MetroStationModel.external_id.in_(
                    tuple(stations_mapping.values())
                ))
            )
            new_stations = db_stations_result.scalars().all()

            apartment.metro_stations = list(new_stations)

            db_service_result = await session.execute(
                sa.select(Service)
                .where(Service.id.in_(
                    tuple(services_mapping.values())
                ))
            )
            new_service = db_service_result.scalars().all()

            apartment.services = list(new_service)

        else:
            new_apartment = ApartmentModel(
                **data_dict
            )
            session.add(new_apartment)
            await session.flush()

            for order, photo in enumerate(data.photos):
                new_photo = PhotoApartment(
                    apartment_id=new_apartment.id,
                    url=str(photo.url),
                    order=order
                )
                session.add(new_photo)

            for station_id in stations_mapping.values():
                new_apartment_metro = ApartmentMetro(
                    apartment_id=new_apartment.id,
                    metro_station_id=station_id
                )
                session.add(new_apartment_metro)

            for service_id in services_mapping.values():
                new_apartment_service = ApartmentService(
                    apartment_id=new_apartment.id,
                    service_id=service_id
                )
                session.add(new_apartment_service)

        await session.commit()

    except SQLAlchemyError as e:
        cfg.logger.error(f"Database error add apartment: {e}")
        raise

    except Exception as e:
        cfg.logger.error(f"Unexpected error add apartment: {e}")
        raise


# Обновляем календарь
@connection
async def sql_update_calendar(
    external_id: int,
    data: List[Calendar],
    session: AsyncSession
) -> None:
    try:
        apartment_id_result = await session.execute(
            sa.select(ApartmentModel.id)
            .where(ApartmentModel.external_id == external_id)
        )
        apartment_id = apartment_id_result.scalar_one()

        values = [
            {
                "apartment_id": apartment_id,
                "date": c.date,
                "price": c.price,
                "is_available": c.available,
                "min_stay": c.min_stay,
                "closed_on_arrival": c.closed_on_arrival,
                "closed_on_departure": c.closed_on_departure
            }
            for c in data
        ]

        stmt = pg_insert(ApartmentAvailability).values(values)

        stmt = stmt.on_conflict_do_update(
            constraint="uq_apt_date",
            set_={
                "price": stmt.excluded.price,
                "is_available": stmt.excluded.is_available,
                "min_stay": stmt.excluded.min_stay,
                "closed_on_arrival": stmt.excluded.closed_on_arrival,
                "closed_on_departure": stmt.excluded.closed_on_departure
            }
        )

        await session.execute(stmt)
        await session.commit()

    except NoResultFound:
        cfg.logger.warn(f"Apartment not found by external_id = {external_id}")

    except SQLAlchemyError as e:
        cfg.logger.error(f"Database error update calendar by external_id = {external_id}: {e}")
        raise

    except Exception as e:
        cfg.logger.error(f"Unexpected error update calendar by external_id = {external_id}: {e}")
        raise