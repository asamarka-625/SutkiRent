# Внешние зависимости
from typing import Optional, Annotated, List, Dict
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
    type_apartment: Optional[List[int]] = None
    metro: Optional[List[int]] = None
    windows: Optional[List[int]] = None
    bathrooms: Optional[List[int]] = None
    items: Optional[List[int]] = None


# Базовая схема объекта
class ApartmentBase(BaseModel):
    id: Annotated[int, Field(ge=1)]
    title: Annotated[str, Field(strict=True)]
    type: Optional[Annotated[str, Field(strict=True)]]
    bathroom: Optional[Annotated[str, Field(strict=True)]]
    price: Annotated[float, Field(ge=0)]
    rooms: Annotated[int, Field(ge=0)]
    sleeps: Annotated[str, Field(strict=True)]
    floor: Annotated[int, Field()]
    capacity: Annotated[int, Field(ge=0)]
    address: Annotated[str, Field(strict=True)]
    metro: List[Annotated[str, Field(strict=True)]]
    latitude: Annotated[float, Field()]
    longitude: Annotated[float, Field()]

    model_config = ConfigDict(from_attributes=True)


# Схема ответа объекта
class ApartmentResponse(ApartmentBase):
    cost: Annotated[float, Field(ge=0)]
    media: List[HttpUrl]


# Детальная схема ответа объекта
class ApartmentDetailResponse(ApartmentBase):
    external_id: Annotated[int, Field(ge=1)]
    description: Annotated[str, Field(strict=True)]
    media: Dict[int, HttpUrl]
    windows: List[str]
    items: List[str]


# Схема вывода объектов
class ObjectsResponse(BaseModel):
    next_page: bool
    count: Annotated[int, Field(ge=0)]
    apartments: List[ApartmentResponse]


# Схема запроса для избранного
class FavoriteRequest(BaseModel):
    apartment_id: Annotated[int, Field(ge=1)]


# Схема тип жилья
class ApartmentType(BaseModel):
    id: Annotated[int, Field(ge=1)]
    title: Annotated[str, Field(strict=True)]


# Схема метро
class ApartmentMetro(BaseModel):
    id: Annotated[int, Field(ge=1)]
    title: Annotated[str, Field(strict=True)]


# Схема вида из окна
class ApartmentWindow(BaseModel):
    id: Annotated[int, Field(ge=1)]
    title: Annotated[str, Field(strict=True)]


# Схема типов санузлов
class ApartmentBathroom(BaseModel):
    id: Annotated[int, Field(ge=1)]
    title: Annotated[str, Field(strict=True)]


# Схема предмета
class ApartmentItem(BaseModel):
    id: Annotated[int, Field(ge=1)]
    title: Annotated[str, Field(strict=True)]


# Схема вывода данных для фильтров
class DataFiltersResponse(BaseModel):
    types: List[ApartmentType]
    metro: List[ApartmentMetro]
    windows: List[ApartmentWindow]
    bathrooms: List[ApartmentBathroom]
    items: List[ApartmentItem]