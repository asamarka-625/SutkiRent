# Внешние зависимости
from typing import List
import sqlalchemy as sa
import sqlalchemy.orm as so
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.dialects.postgresql import insert as pg_insert
from fastapi import HTTPException, status
# Внутренние модули
from models import (Item, ApartmentItem, Brand)
from web_app.src.core import cfg, connection
from web_app.src.schemas import InventoryResponse, ItemResponse, BrandResponse, UpdateInventoryRequest


# Получаем инвентарь объекта по ID объекта
@connection
async def sql_get_inventory_by_apartment_id(
    apartment_id: int,
    session: AsyncSession
) -> List[InventoryResponse]:
    try:
        inventory_result = await session.execute(
            sa.select(ApartmentItem)
            .options(
                so.joinedload(ApartmentItem.item),
                so.joinedload(ApartmentItem.brand)
            )
            .where(ApartmentItem.apartment_id == apartment_id)
        )
        inventory = inventory_result.scalars()

        return [
            InventoryResponse(
                item_id=el.item_id,
                item=el.item.title,
                brand_id=el.brand_id,
                brand=el.brand.title,
                quantity=el.quantity,
                price=el.price
            )
            for el in inventory
        ]

    except SQLAlchemyError as e:
        cfg.logger.error(f"Database error get inventory by apartment_id = {apartment_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error")

    except Exception as e:
        cfg.logger.error(f"Unexpected error get inventory by apartment_id = {apartment_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unexpected server error")


# Получаем предметы
@connection
async def sql_get_items(
    session: AsyncSession
) -> List[ItemResponse]:
    try:
        items_result = await session.execute(
            sa.select(Item.id, Item.title)
        )
        items = items_result.all()

        return [
            ItemResponse(
                id=item[0],
                title=item[1]
            )
            for item in items
        ]

    except SQLAlchemyError as e:
        cfg.logger.error(f"Database error get items: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error")

    except Exception as e:
        cfg.logger.error(f"Unexpected error get items: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unexpected server error")


# Получаем бренды
@connection
async def sql_get_brands(
    session: AsyncSession
) -> List[BrandResponse]:
    try:
        brands_result = await session.execute(
            sa.select(Brand.id, Brand.title)
        )
        brands = brands_result.all()

        return [
            BrandResponse(
                id=brand[0],
                title=brand[1]
            )
            for brand in brands
        ]

    except SQLAlchemyError as e:
        cfg.logger.error(f"Database error get brands: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error")

    except Exception as e:
        cfg.logger.error(f"Unexpected error get brands: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unexpected server error")


# Обновляем инвентарь объекта
@connection
async def sql_update_inventory_by_apartment_id(
    apartment_id: int,
    data: List[UpdateInventoryRequest],
    session: AsyncSession
) -> None:
    try:
        if not data:
            await session.execute(
                sa.delete(ApartmentItem)
                .where(ApartmentItem.apartment_id == apartment_id)
            )
            await session.commit()
            return

        requested_item_ids = {el.item_id for el in data}
        requested_brand_ids = {el.brand_id for el in data}

        # Проверяем наличие всех item_id
        items_query = await session.execute(
            sa.select(Item.id)
            .where(Item.id.in_(requested_item_ids))
        )
        existing_item_ids = {row[0] for row in items_query.all()}

        # Проверяем наличие всех brand_id
        brands_query = await session.execute(
            sa.select(Brand.id)
            .where(Brand.id.in_(requested_brand_ids))
        )
        existing_brand_ids = {row[0] for row in brands_query.all()}

        # Если чего-то не хватает, кидаем 400 ошибку
        missing_items = requested_item_ids - existing_item_ids
        missing_brands = requested_brand_ids - existing_brand_ids

        if missing_items or missing_brands:
            error_msg = (f"Invalid IDs: items {missing_items if missing_items else 'ok'},"
                         f" brands {missing_brands if missing_brands else 'ok'}")
            cfg.logger.warning(f"Validation failed for apartment {apartment_id}: {error_msg}")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error_msg)

        unique_values_map = {}
        for el in data:
            key = (el.item_id, el.brand_id)
            unique_values_map[key] = {
                "apartment_id": apartment_id,
                "item_id": el.item_id,
                "brand_id": el.brand_id,
                "quantity": el.quantity,
                "price": el.price
            }

        values = list(unique_values_map.values())

        active_keys = list(unique_values_map.keys())

        # Удаляем записи, которых нет в новом списке
        await session.execute(
            sa.delete(ApartmentItem).where(
                ApartmentItem.apartment_id == apartment_id,
                sa.tuple_(ApartmentItem.item_id, ApartmentItem.brand_id).not_in(active_keys)
            )
        )

        if values:
            # UPSERT (вставляем новые или обновляем существующие)
            stmt = pg_insert(ApartmentItem).values(values)
            update_stmt = stmt.on_conflict_do_update(
                constraint="uq_apartment_item_fields",
                set_={
                    "quantity": stmt.excluded.quantity,
                    "price": stmt.excluded.price,
                }
            )
            await session.execute(update_stmt)

        await session.commit()

    except HTTPException:
        raise

    except SQLAlchemyError as e:
        cfg.logger.error(f"Database error update inventory by apartment_id = {apartment_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error")

    except Exception as e:
        cfg.logger.error(f"Unexpected error update inventory by apartment_id = {apartment_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unexpected server error")