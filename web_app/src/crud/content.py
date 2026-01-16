# Внешние зависимости
from typing import List
import sqlalchemy as sa
import sqlalchemy.orm as so
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status
# Внутренние модули
from models import Content
from web_app.src.core import cfg, connection
from web_app.src.schemas import ContentResponse


# Получаем контент по категории
@connection
async def sql_get_contents_by_category(
    category_id: int,
    session: AsyncSession
) -> List[ContentResponse]:
    try:
        result = await session.execute(
            sa.select(Content)
            .options(
                so.selectinload(Content.photos)
            )
            .where(Content.category_id == category_id)
            .order_by(Content.created_at)
        )

        return [
            ContentResponse(
                title=c.title,
                short_description=c.short_description,
                content=c.content,
                media=[p.url for p in c.photos]
            )
            for c in result.scalars().all()
        ]

    except SQLAlchemyError as e:
        cfg.logger.error(f"Database error get contents by category: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error")

    except Exception as e:
        cfg.logger.error(f"Unexpected error get contents by category: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unexpected server error")