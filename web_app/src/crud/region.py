# Внешние зависимости
from typing import List
import sqlalchemy as sa
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status
# Внутренние модули
from models import Region
from web_app.src.core import cfg, connection
from web_app.src.schemas import RegionResponse


# Получаем все регионы
@connection
async def sql_get_regions(
    session: AsyncSession
) -> List[RegionResponse]:
    try:
        result = await session.execute(
            sa.select(Region.id, Region.title, Region.order)
        )

        return [
            RegionResponse(
                id=r[0],
                title=r[1],
                order=r[2]
            )
            for r in result.all()
        ]

    except SQLAlchemyError as e:
        cfg.logger.error(f"Database error get regions: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error")

    except Exception as e:
        cfg.logger.error(f"Unexpected error get regions: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unexpected server error")