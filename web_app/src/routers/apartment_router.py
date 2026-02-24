# Внешние зависимости
from typing import List, Dict, Annotated, Optional
from pydantic import Field
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
# Внутренние модули
from web_app.src.crud import (sql_get_available_apartments, sql_get_regions, sql_add_favorite_for_user,
                              sql_remove_favorite_for_user, sql_get_apartment_by_id, sql_get_data_for_filters,
                              sql_get_inventory_by_apartment_id, sql_get_items, sql_get_brands,
                              sql_update_inventory_by_apartment_id, sql_check_user_has_apartments,
                              sql_check_user_has_apartment_by_id)
from web_app.src.schemas import (ApartmentFilter, ObjectsResponse, RegionResponse, FavoriteRequest,
                                 ApartmentDetailResponse, DataFiltersResponse, UserScheme, InventoryResponse,
                                 ItemResponse, BrandResponse, UpdateInventoryRequest)
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
        room=filter_params.room,
        type_apartment_ids=filter_params.type_apartment,
        bathroom_ids=filter_params.bathrooms,
        metro_ids=filter_params.metro,
        window_ids=filter_params.windows,
        item_ids=filter_params.items
    )

    return apartments


@router.post(
    "/{apartment_id}",
    response_model=ApartmentDetailResponse,
    summary="Получаем объект по ID"
)
async def get_apartment_by_id(
    apartment_id: Annotated[int, Field(ge=1)]
):
    apartment = await sql_get_apartment_by_id(
        apartment_id=apartment_id
    )

    return apartment


@router.get(
    "/regions",
    response_model=List[RegionResponse],
    summary="Получаем список регионов"
)
async def get_regions():
    regions = await sql_get_regions()
    return regions


@router.get(
    "/filters",
    response_model=DataFiltersResponse,
    summary="Получаем данные для фильтров"
)
async def get_data_filters(
    region_id: Optional[Annotated[int, Field(ge=1)]] = None
):
    data = await sql_get_data_for_filters(
        region_id=region_id
    )

    return data


@router.post(
    "/favorite/add",
    response_class=JSONResponse,
    summary="Добавляем объект в избранное пользователю"
)
async def add_favorite_for_user(
    data: FavoriteRequest,
    current_user: UserScheme = Depends(get_current_user_by_access_token),
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
    current_user: UserScheme = Depends(get_current_user_by_access_token),
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


@router.get(
    "/inventory/{apartment_id}",
    response_model=List[InventoryResponse],
    summary="Получаем инвентарь объекта"
)
async def get_inventory_apartment(
    apartment_id: Annotated[int, Field(ge=1)],
    current_user: UserScheme = Depends(get_current_user_by_access_token),
    token_data: Dict[str, str] = Depends(get_data_by_refresh_token),
    csrf_user_id: str = Depends(verify_csrf_token)
):
    user_id_str = str(current_user.id)
    if not (user_id_str == token_data["user_id"] == csrf_user_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Token user mismatch")

    if not await sql_check_user_has_apartment_by_id(
            user_id=current_user.id,
            apartment_id=apartment_id
    ):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    inventory = await sql_get_inventory_by_apartment_id(apartment_id=apartment_id)

    return inventory


@router.get(
    "/items",
    response_model=List[ItemResponse],
    summary="Получаем предметы"
)
async def get_items(
    current_user: UserScheme = Depends(get_current_user_by_access_token),
    token_data: Dict[str, str] = Depends(get_data_by_refresh_token),
    csrf_user_id: str = Depends(verify_csrf_token)
):
    user_id_str = str(current_user.id)
    if not (user_id_str == token_data["user_id"] == csrf_user_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Token user mismatch")

    if not await sql_check_user_has_apartments(user_id=current_user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    items = await sql_get_items()

    return items


@router.get(
    "/brands",
    response_model=List[BrandResponse],
    summary="Получаем бренды"
)
async def get_brands(
    current_user: UserScheme = Depends(get_current_user_by_access_token),
    token_data: Dict[str, str] = Depends(get_data_by_refresh_token),
    csrf_user_id: str = Depends(verify_csrf_token)
):
    user_id_str = str(current_user.id)
    if not (user_id_str == token_data["user_id"] == csrf_user_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Token user mismatch")

    if not await sql_check_user_has_apartments(user_id=current_user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    brands = await sql_get_brands()

    return brands


@router.patch(
    "/inventory/{apartment_id}",
    response_class=JSONResponse,
    summary="Обновляем инвентарь"
)
async def update_inventory(
    apartment_id: Annotated[int, Field(ge=1)],
    data: List[UpdateInventoryRequest],
    current_user: UserScheme = Depends(get_current_user_by_access_token),
    token_data: Dict[str, str] = Depends(get_data_by_refresh_token),
    csrf_user_id: str = Depends(verify_csrf_token)
):
    user_id_str = str(current_user.id)
    if not (user_id_str == token_data["user_id"] == csrf_user_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Token user mismatch")

    if not await sql_check_user_has_apartment_by_id(
        user_id=current_user.id,
        apartment_id=apartment_id
    ):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    await sql_update_inventory_by_apartment_id(
        apartment_id=apartment_id,
        data=data
    )

    return {
        "status": "success"
    }
