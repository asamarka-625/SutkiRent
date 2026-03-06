# Внешние зависимости
from typing import Annotated, Optional, List
from datetime import date, time
from pydantic import BaseModel, Field, ConfigDict, field_validator


class GuestRequest(BaseModel):
    adults: Annotated[int, Field(ge=1)]
    children: List[int] = []


# Схема запроса на создание брони
class CreateBookingRequest(BaseModel):
    apartment_id: Annotated[int, Field(ge=1)]
    begin_date: date
    end_date: date
    phone: Annotated[str, Field(max_length=25)]
    first_name: str
    last_name: str
    guests: GuestRequest
    email: Optional[str] = None,
    wish: Optional[str] = None

    model_config = ConfigDict(frozen=True, str_strip_whitespace=True)

    @field_validator("phone")
    @classmethod
    def clean_phone(cls, v: str) -> str:
        # Оставляем только цифры
        digits = "".join(filter(str.isdigit, v))
        # Если номер начинается с 8, заменяем на 7 (опционально, для РФ)
        if len(digits) == 11 and digits.startswith("8"):
            digits = "7" + digits[1:]

        if len(digits) != 11:
            raise ValueError("Номер телефона должен содержать 11 цифр")
        return digits


# Схема запроса на получения стоимости бронирования
class PriceBookingRequest(BaseModel):
    apartment_id: Annotated[int, Field(ge=1)]
    arrival_time: Optional[time] = None
    begin_date: date
    departure_time: Optional[time] = None
    end_date: date
    guests: GuestRequest


# Схема запроса на получения календаря объекта
class CalendarBookingRequest(BaseModel):
    apartment_id: Annotated[int, Field(ge=1)]
    begin_date: date
    end_date: date
    guests: GuestRequest