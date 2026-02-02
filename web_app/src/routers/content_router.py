# Внешние зависимости
from typing import Annotated, List
from pydantic import Field
from fastapi import APIRouter
# Внутренние модули
from web_app.src.crud import sql_get_contents_by_category, sql_get_content_by_id
from web_app.src.schemas import ContentResponse


router = APIRouter(
    prefix="/api/content",
    tags=["Content"]
)


@router.get(
    "/category/{category_id}",
    response_model=List[ContentResponse],
    summary="Получаем список контента"
)
async def get_contents_by_category(
    category_id: Annotated[int, Field(ge=1)]
):
    response = await sql_get_contents_by_category(
        category_id=category_id
    )

    return response


@router.get(
    "/id/{content_id}",
    response_model=ContentResponse,
    summary="Получаем контент по ID"
)
async def get_contents_by_category(
    content_id: Annotated[int, Field(ge=1)]
):
    response = await sql_get_content_by_id(
        content_id=content_id
    )

    return response