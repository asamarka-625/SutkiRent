# Внешние зависимости
from typing import List, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
# Внутренние модули
from models import User
from web_app.src.crud import (sql_get_available_apartments, sql_get_regions, sql_add_favorite_for_user,
                              sql_remove_favorite_for_user)
from web_app.src.schemas import ApartmentFilter, ObjectsResponse, RegionResponse, FavoriteRequest
from web_app.src.dependencies import (get_current_user_by_access_token, get_data_by_refresh_token,
                                      verify_csrf_token)


router = APIRouter(
    prefix="/api/objects",
    tags=["Apartment"]
)


@router.post(
    "/",
    response_model=ObjectsResponse,
    summary="Получаем список объектов по фильтрам"
)
async def get_apartments(
    filter_params: ApartmentFilter
):
    children_count = sum(1 for child in filter_params.children if child.age <= 3)

    apartments = await sql_get_available_apartments(
        quantity=(filter_params.adults + len(filter_params.children) - children_count),
        page=filter_params.page,
        page_size=filter_params.page_size,
        region_id=filter_params.region_id,
        start_date=filter_params.start_date,
        end_date=filter_params.end_date,
        children_count=children_count,
        price=filter_params.price,
        sleeping_places=filter_params.sleep,
        floor=filter_params.floor,
        area=filter_params.area,
        room=filter_params.room
    )

    return apartments


@router.get(
    "/regions",
    response_model=List[RegionResponse],
    summary="Получаем список регионов"
)
async def get_regions():
    regions = await sql_get_regions()
    return regions


@router.post(
    "/favorite/add",
    response_class=JSONResponse,
    summary="Добавляем объект в избранное пользователю"
)
async def add_favorite_for_user(
    data: FavoriteRequest,
    current_user: User = Depends(get_current_user_by_access_token),
    token_data: Dict[str, str] = Depends(get_data_by_refresh_token),
    csrf_user_id: str = Depends(verify_csrf_token)
):
    user_id_str = str(current_user.id)
    if not (user_id_str == token_data["user_id"] == csrf_user_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Token user mismatch")

    await sql_add_favorite_for_user(
        user_id=current_user.id,
        apartment_id=data.apartment_id
    )

    return {
        "status": "success"
    }


@router.post(
    "/favorite/remove",
    response_class=JSONResponse,
    summary="Удаляем объект из избранного у пользователя"
)
async def remove_favorite_for_user(
    data: FavoriteRequest,
    current_user: User = Depends(get_current_user_by_access_token),
    token_data: Dict[str, str] = Depends(get_data_by_refresh_token),
    csrf_user_id: str = Depends(verify_csrf_token)
):
    user_id_str = str(current_user.id)
    if not (user_id_str == token_data["user_id"] == csrf_user_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Token user mismatch")

    await sql_remove_favorite_for_user(
        user_id=current_user.id,
        apartment_id=data.apartment_id
    )

    return {
        "status": "success"
    }