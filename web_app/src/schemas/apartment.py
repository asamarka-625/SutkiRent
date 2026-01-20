# Внешние зависимости
from typing import Optional, Annotated, List
from datetime import date
from pydantic import BaseModel, Field, HttpUrl, ConfigDict


# Схема детей
class ChildFilter(BaseModel):
    age: Annotated[int, Field(ge=1, le=17)]


# Схема цены
class PriceFilter(BaseModel):
    min: Optional[Annotated[float, Field(ge=0)]] = None
    max: Optional[Annotated[float, Field(ge=1)]] = None


# Схема спальных мест
class SleepFilter(BaseModel):
    min: Optional[Annotated[int, Field(ge=0)]] = None
    max: Optional[Annotated[int, Field(ge=1)]] = None


# Схема этажа
class FloorFilter(BaseModel):
    min: Optional[Annotated[int, Field()]] = None
    max: Optional[Annotated[int, Field()]] = None


# Схема площади
class AreaFilter(BaseModel):
    min: Optional[Annotated[float, Field(ge=0)]] = None
    max: Optional[Annotated[float, Field(ge=1)]] = None


# Схема комнаты
class RoomFilter(BaseModel):
    min: Optional[Annotated[float, Field(ge=0)]] = None
    max: Optional[Annotated[float, Field(ge=1)]] = None


# Схема фильтров запроса
class ApartmentFilter(BaseModel):
    page: Annotated[int, Field(ge=1)] = 1
    page_size: Annotated[int, Field(ge=1, le=20)] = 10
    adults: Annotated[int, Field(ge=1)] = 1
    children: List[ChildFilter] = []
    region_id: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    price: Optional[PriceFilter] = None
    sleep: Optional[SleepFilter] = None
    floor: Optional[FloorFilter] = None
    area: Optional[AreaFilter] = None
    room: Optional[RoomFilter] = None


# Схема ответа объекта
class ApartmentResponse(BaseModel):
    id: Annotated[int, Field(ge=1)]
    title: Annotated[str, Field(strict=True)]
    cost: Annotated[float, Field(ge=0)]
    rooms: Annotated[int, Field(ge=0)]
    sleeps: Annotated[str, Field(strict=True)]
    floor: Annotated[int, Field()]
    capacity: Annotated[int, Field(ge=0)]
    address: Annotated[str, Field(strict=True)]
    metro: List[Annotated[str, Field(strict=True)]]
    media: List[HttpUrl]
    latitude: Annotated[float, Field()]
    longitude: Annotated[float, Field()]

    model_config = ConfigDict(from_attributes=True)


# Схема вывода объектов
class ObjectsResponse(BaseModel):
    next_page: bool
    count: Annotated[int, Field(ge=0)]
    apartments: List[ApartmentResponse]


# Схема запроса для избранного
class FavoriteRequest(BaseModel):
    apartment_id: Annotated[int, Field(ge=1)]