# Внешние зависимости
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, Cookie, Header
from fastapi.responses import JSONResponse
# Внутренние модули
from web_app.src.crud import sql_create_booking
from web_app.src.schemas import CreateBookingRequest, PriceBookingRequest, CalendarBookingRequest
from web_app.src.dependencies import (oauth2_scheme, get_current_user_by_access_token,
                                      get_data_by_refresh_token, verify_csrf_token)
from web_app.src.utils import rc_client


router = APIRouter(
    prefix="/api/booking",
    tags=["Booking"]
)


@router.post(
    "/create",
    response_class=JSONResponse,
    summary="Создаем бронирование"
)
async def create_booking(
    data: CreateBookingRequest,
    background_tasks: BackgroundTasks,
    access_token: Optional[str] = Depends(oauth2_scheme),
    refresh_token: Optional[str] = Cookie(None),
    x_csrf_token: Optional[str] = Header(None, alias="X-CSRF-Token")
):
    final_user_id = None

    if access_token and refresh_token and x_csrf_token:
        user_scheme = await get_current_user_by_access_token(access_token)
        t_data = await get_data_by_refresh_token(refresh_token)
        csrf_id = await verify_csrf_token(x_csrf_token)

        user_id_str = str(user_scheme.id)
        if not (user_id_str == t_data["user_id"] == csrf_id):
            raise HTTPException(status_code=403, detail="Token user mismatch")

        final_user_id = user_scheme.id

    response = await rc_client.create_booking(
        data=data
    )

    background_tasks.add_task(
        sql_create_booking,
        user_id=final_user_id,
        data=data,
        price=100
    )

    return response


@router.post(
    "/price",
    response_class=JSONResponse,
    summary="Получаем стоимость бронирования"
)
async def get_price_for_booking(
    data: PriceBookingRequest
):
    response = await rc_client.get_price_booking(
        data=data
    )

    return response


@router.post(
    "/calendar",
    response_class=JSONResponse,
    summary="Получаем календарь для объекта"
)
async def get_calendar_for_booking(
    data: CalendarBookingRequest
):
    response = await rc_client.get_calendar_booking(
        data=data
    )

    return response