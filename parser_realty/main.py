# Внешние зависимости
import asyncio
from datetime import date, timedelta
# Внутренние модули
from parser_realty.utils import rc_client
from parser_realty.crud import sql_add_or_update_apartment, sql_get_external_ids_apartments, sql_update_calendar
from parser_realty.core import cfg, setup_database


# Функция обновления календаря для каждого объекта
async def upd_calendar():
    begin_date = date.today()
    end_date = begin_date + timedelta(days=365)

    external_ids = await sql_get_external_ids_apartments()
    for external_id in external_ids:
        response = await rc_client.get_calendar(
            apartment_id=external_id,
            begin_date=begin_date,
            end_date=end_date
        )

        if response.calendar:
            cfg.logger.info(f"Update calendar external_id: {external_id}")
            await sql_update_calendar(
                external_id=external_id,
                data=response.calendar
            )

        await asyncio.sleep(0.1)


# Функция обновления объектов
async def upd_object():
    page = 1
    while True:
        response = await rc_client.get_apartments(page=page)
        if not response.apartments:
            break

        for apartment in response.apartments:
            cfg.logger.info(f"Processing apartment: {apartment.id}")
            await sql_add_or_update_apartment(
                data=apartment
            )

        page += 1


# Основная функция
async def main():
    await setup_database()
    
    while True:
        await upd_object()
        await asyncio.sleep(30)
        await upd_calendar()



