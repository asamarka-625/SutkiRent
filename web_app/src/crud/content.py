# Внешние зависимости
from typing import List
import sqlalchemy as sa
import sqlalchemy.orm as so
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError, NoResultFound
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
                media=[p.url for p in sorted(c.photos, key=lambda p: p.order)]
            )
            for c in result.scalars().all()
        ]

    except SQLAlchemyError as e:
        cfg.logger.error(f"Database error get contents by category: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error")

    except Exception as e:
        cfg.logger.error(f"Unexpected error get contents by category: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unexpected server error")


# Получаем контент по ID
@connection
async def sql_get_content_by_id(
    content_id: int,
    session: AsyncSession
) -> ContentResponse:
    try:
        content_result = await session.execute(
            sa.select(Content)
            .options(
                so.selectinload(Content.photos)
            )
            .where(Content.id == content_id)
        )
        content = content_result.scalar_one_or_none()

        return ContentResponse(
            title=content.title,
            short_description=content.short_description,
            content=content.content,
            media=[p.url for p in sorted(content.photos, key=lambda p: p.order)]
        )

    except NoResultFound:
        cfg.logger.info(f"Content not found by id: {content_id}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content not found")

    except SQLAlchemyError as e:
        cfg.logger.error(f"Database error get content by id = {content_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error")

    except Exception as e:
        cfg.logger.error(f"Unexpected error get content by id = {content_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unexpected server error")