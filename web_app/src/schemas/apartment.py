# Внешние зависимости
from typing import Optional, Annotated, List, Dict, Set
from datetime import date
from decimal import Decimal
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
    type_apartment: Optional[Set[int]] = None
    metro: Optional[Set[int]] = None
    windows: Optional[Set[int]] = None
    parking: Optional[Set[int]] = None
    bathrooms: Optional[Set[int]] = None
    items: Optional[Set[int]] = None


# Базовая схема объекта
class ApartmentBase(BaseModel):
    id: Annotated[int, Field(ge=1)]
    title: Annotated[str, Field(strict=True)]
    type: Optional[Annotated[str, Field(strict=True)]]
    bathroom: List[str]
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
    media: Dict[int, str]
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


# Базовый класс для всех объектов с id и title
class BaseElementScheme(BaseModel):
    id: Annotated[int, Field(ge=1)]
    title: Annotated[str, Field(strict=True)]


# Схема тип жилья
class ApartmentType(BaseElementScheme):
    pass


# Схема метро
class ApartmentMetro(BaseElementScheme):
    pass


# Схема вида из окна
class ApartmentWindow(BaseElementScheme):
    pass


# Схема парковки
class ApartmentParking(BaseElementScheme):
    pass


# Схема типов санузлов
class ApartmentBathroom(BaseElementScheme):
    pass


# Схема предмета
class ApartmentItem(BaseElementScheme):
    pass


# Схема ответа предмета
class ItemResponse(BaseElementScheme):
    pass


# Схема ответа брэнда
class BrandResponse(BaseElementScheme):
    pass


# Схема вывода данных для фильтров
class DataFiltersResponse(BaseModel):
    types: List[ApartmentType]
    metro: List[ApartmentMetro]
    windows: List[ApartmentWindow]
    parking: List[ApartmentParking]
    bathrooms: List[ApartmentBathroom]
    items: List[ApartmentItem]


# Схема ответа инвентаря
class InventoryResponse(BaseModel):
    item_id: Annotated[int, Field(ge=1)]
    item: Annotated[str, Field(strict=True)]
    brand_id: Annotated[int, Field(ge=1)]
    brand: Annotated[str, Field(strict=True)]
    quantity: Annotated[int, Field(ge=0)]
    price: Annotated[Decimal, Field(ge=0)]


# Схема запроса на обновление инвентаря
class UpdateInventoryRequest(BaseModel):
    item_id: Annotated[int, Field(ge=1)]
    brand_id: Annotated[int, Field(ge=1)]
    quantity: Annotated[int, Field(ge=0)]
    price: Annotated[Decimal, Field(ge=0)]


# Схема ответа объектов, принадлежащих пользователю
class ApartmentOwnerResponse(BaseModel):
    id: Annotated[int, Field(ge=1)]
    title: Annotated[str, Field(strict=True)]