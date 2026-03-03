# Внешние зависимости
from typing import Annotated, Optional, List
from datetime import date, time
from pydantic import BaseModel, Field, ConfigDict


class GuestRequest(BaseModel):
    adults: Annotated[int, Field(ge=1)]
    children: List[int] = []


# Схема запроса на создание брони
class CreateBookingRequest(BaseModel):
    external_apartment_id: Annotated[int, Field(ge=1)]
    begin_date: date
    end_date: date
    phone: str
    first_name: str
    last_name: str
    guests: GuestRequest
    email: Optional[str] = None,
    wish: Optional[str] = None

    model_config = ConfigDict(frozen=True, str_strip_whitespace=True)


# Схема запроса на получения стоимости бронирования
class PriceBookingRequest(BaseModel):
    external_apartment_id: Annotated[int, Field(ge=1)]
    arrival_time: Optional[time] = None
    begin_date: date
    departure_time: Optional[time] = None
    end_date: date
    guests: GuestRequest
