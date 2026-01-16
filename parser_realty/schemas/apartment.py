# Внешние зависимости
from typing import Annotated, Optional, Dict, List
from datetime import date
from pydantic import BaseModel, Field, ConfigDict, HttpUrl


# Координаты
class Coordinates(BaseModel):
    lat: Annotated[float, Field()]
    lon: Annotated[float, Field()]


# Цены
class PriceDetails(BaseModel):
    amount: Annotated[float, Field(ge=0)]
    discounts: Dict[str, float] = Field(default_factory=dict)
    extras: Dict[str, float] = Field(default_factory=dict)
    pay_now: Dict[str, Optional[float]]
    pay_later: Dict[str, Optional[float]]

    model_config = ConfigDict(from_attributes=True)


class PriceCommon(BaseModel):
    with_discount: Optional[Annotated[float, Field(ge=0)]] = None
    without_discount: Annotated[float, Field(ge=0)]
    discount_percent: Annotated[int, Field(ge=0)] = 0

    model_config = ConfigDict(from_attributes=True)


class Price(BaseModel):
    common: PriceCommon
    details: PriceDetails

    model_config = ConfigDict(from_attributes=True)


# Изображения
class Photo(BaseModel):
    url: HttpUrl

    model_config = ConfigDict(from_attributes=True)


# Станции метро
class MetroStation(BaseModel):
    id: Annotated[int, Field(ge=1)]
    title: Annotated[str, Field(strict=True)]

    model_config = ConfigDict(from_attributes=True)


# Город
class City(BaseModel):
    id: Annotated[int, Field(ge=1)]
    title: Annotated[str, Field(strict=True)]

    model_config = ConfigDict(from_attributes=True)


# Объект
class Apartment(BaseModel):
    id: Annotated[int, Field(ge=1)]
    address: Annotated[str, Field(strict=True)]
    rooms: Annotated[int, Field(ge=0)]
    sleeps: Annotated[str, Field(strict=True)]
    desc: Optional[Annotated[str, Field(strict=True)]]
    floor: Optional[Annotated[int, Field()]]
    title: Annotated[str, Field(strict=True)]
    area: Optional[Annotated[float, Field(ge=0)]]
    coordinates: Coordinates
    price: Price
    min_stay: Optional[Annotated[int, Field(ge=0)]]
    photos: List[Photo]
    metro_stations: List[MetroStation]
    city: City
    services: List[Annotated[str, Field(strict=True)]]
    capacity: Annotated[int, Field(ge=0)]
    max_children_count: Annotated[int, Field(ge=0)]
    availability: Annotated[str, Field(strict=True)]

    model_config = ConfigDict(from_attributes=True)


# Календарь
class Calendar(BaseModel):
    date: date
    available: bool
    price: Optional[Annotated[float, Field(ge=0)]]
    min_stay: Optional[Annotated[int, Field(ge=0)]]
    closed_on_arrival: Optional[bool] = False
    closed_on_departure: Optional[bool] = False


# Ответ на запрос к /apartments
class RealtyApartmentResponse(BaseModel):
    apartments: List[Apartment]

    model_config = ConfigDict(from_attributes=True)


# Ответ на запрос к /calendar
class RealtyCalendarResponse(BaseModel):
    calendar: List[Calendar]

    model_config = ConfigDict(from_attributes=True)