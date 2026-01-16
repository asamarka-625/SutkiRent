# Внешние зависимости
from fastapi import APIRouter
# Внутренние модули
from web_app.src.crud import sql_get_available_apartments
from web_app.src.schemas import ApartmentFilter, ObjectsResponse


router = APIRouter(
    prefix="/api/objects",
    tags=["Objects"]
)


@router.post(
    "/",
    response_model=ObjectsResponse,
    summary="Получаем список объектов по фильтрам"
)
async def get_apartments(
    filter_params: ApartmentFilter
):
    print(filter_params)
    response = await sql_get_available_apartments(
        quantity=(filter_params.adults + len(filter_params.children)),
        page=filter_params.page,
        page_size=filter_params.page_size,
        region_id=filter_params.region_id,
        start_date=filter_params.start_date,
        end_date=filter_params.end_date,
        children_count=len(filter_params.children),
        price=filter_params.price,
        sleeping_places=filter_params.sleep,
        floor=filter_params.floor,
        area=filter_params.area,
        room=filter_params.room
    )

    return response