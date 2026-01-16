# Внешние зависимости
from typing import Optional, List
from datetime import datetime, date
import sqlalchemy as sa
import sqlalchemy.orm as so
# Внутренние модули
from models.base import Base
from models.other import Photo


# Таблица регионов
class Region(Base):
    __tablename__ = "regions"

    id: so.Mapped[int] = so.mapped_column(sa.Integer, primary_key=True)
    title: so.Mapped[str] = so.mapped_column(
        sa.String(200),
        index=True,
        nullable=False,
        unique=True
    )

    # Связи
    cities: so.Mapped[List["City"]] = so.relationship(
        back_populates="region",
        cascade="all, delete-orphan"
    )
    apartments: so.Mapped[List["Apartment"]] = so.relationship(
        back_populates="region_rel",
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Region(id={self.id}, title='{self.title}')>"


# Таблица городов
class City(Base):
    __tablename__ = "cities"

    id: so.Mapped[int] = so.mapped_column(sa.Integer, primary_key=True)
    external_id: so.Mapped[int] = so.mapped_column(
        sa.Integer,
        unique=True,
        index=True,
        nullable=False
    )  # ID из RealtyCalendar
    title: so.Mapped[str] = so.mapped_column(
        sa.String(200),
        nullable=False
    )
    created_at: so.Mapped[datetime] = so.mapped_column(sa.DateTime, default=sa.func.now())

    # Связь с регионом
    region_id: so.Mapped[Optional[int]] = so.mapped_column(
        sa.Integer,
        sa.ForeignKey("regions.id", ondelete="SET NULL"),
        index=True,
        nullable=True
    )

    # Связи
    region: so.Mapped["Region"] = so.relationship(
        back_populates="cities"
    )
    apartments: so.Mapped[List["Apartment"]] = so.relationship(back_populates="city_rel")

    def __repr__(self):
        return f"<City(id={self.id}, title='{self.title}')>"


# Таблица станций метро
class MetroStation(Base):
    __tablename__ = "metro_stations"

    id: so.Mapped[int] = so.mapped_column(sa.Integer, primary_key=True)
    external_id: so.Mapped[int] = so.mapped_column(sa.Integer, unique=True, index=True, nullable=False)
    title: so.Mapped[str] = so.mapped_column(sa.String(200), nullable=False)
    created_at: so.Mapped[datetime] = so.mapped_column(sa.DateTime, default=sa.func.now())

    # Связь многие-ко-многим с апартаментами
    apartments: so.Mapped[List["Apartment"]] = so.relationship(
        secondary="apartment_metro", back_populates="metro_stations"
    )

    def __repr__(self):
        return f"<MetroStation(id={self.id}, title='{self.title}')>"


# Таблица апартаментов (основная)
class Apartment(Base):
    __tablename__ = "apartments"

    id: so.Mapped[int] = so.mapped_column(sa.Integer, primary_key=True)
    external_id: so.Mapped[int] = so.mapped_column(sa.Integer, unique=True, nullable=False, index=True)
    address: so.Mapped[str] = so.mapped_column(sa.String(500))
    rooms: so.Mapped[int] = so.mapped_column(sa.Integer)
    sleeps: so.Mapped[str] = so.mapped_column(sa.String(50))  # "2+1+1"
    description: so.Mapped[Optional[str]] = so.mapped_column(sa.Text)
    floor: so.Mapped[Optional[int]] = so.mapped_column(sa.Integer)
    title: so.Mapped[str] = so.mapped_column(sa.String(500))
    area: so.Mapped[Optional[sa.Float]] = so.mapped_column(sa.Float)
    latitude: so.Mapped[sa.Float] = so.mapped_column(sa.Float)
    longitude: so.Mapped[sa.Float] = so.mapped_column(sa.Float)
    capacity: so.Mapped[int] = so.mapped_column(sa.Integer)
    max_children_count: so.Mapped[int] = so.mapped_column(sa.Integer, default=0)
    availability: so.Mapped[str] = so.mapped_column(sa.String(50), default="available", index=True)

    # Цены (текущие)
    price_without_discount: so.Mapped[sa.Float] = so.mapped_column(sa.Float, nullable=False)
    price_with_discount: so.Mapped[Optional[sa.Float]] = so.mapped_column(sa.Float)
    discount_percent: so.Mapped[int] = so.mapped_column(sa.Integer, default=0)

    # Детали цены (храним как JSON для гибкости)
    price_details: so.Mapped[Optional[dict]] = so.mapped_column(sa.JSON)

    min_stay: so.Mapped[Optional[int]] = so.mapped_column(sa.Integer)

    # Связи с городом и регионом
    city_id: so.Mapped[Optional[int]] = so.mapped_column(
        sa.Integer,
        sa.ForeignKey("cities.id", ondelete="SET NULL"),
        index=True,
        nullable=False
    )
    region_id: so.Mapped[Optional[int]] = so.mapped_column(
        sa.Integer,
        sa.ForeignKey("regions.id", ondelete="SET NULL"),
        index=True,
        nullable=True
    )

    # Технические поля
    last_parsed_at: so.Mapped[datetime] = so.mapped_column(sa.DateTime, default=sa.func.now())
    created_at: so.Mapped[datetime] = so.mapped_column(sa.DateTime, default=sa.func.now())
    updated_at: so.Mapped[datetime] = so.mapped_column(
        sa.DateTime,
        default=sa.func.now(),
        onupdate=sa.func.now()
    )

    # Связи
    city_rel: so.Mapped["City"] = so.relationship(back_populates="apartments")
    region_rel: so.Mapped["Region"] = so.relationship(back_populates="apartments")

    calendar: so.Mapped[List["ApartmentAvailability"]] = so.relationship(
        back_populates="apartment", cascade="all, delete-orphan"
    )
    metro_stations: so.Mapped[List["MetroStation"]] = so.relationship(
        secondary="apartment_metro", back_populates="apartments"
    )
    photos: so.Mapped[List["PhotoApartment"]] = so.relationship(
        back_populates="apartment", cascade="all, delete-orphan"
    )
    services: so.Mapped[List["Service"]] = so.relationship(
        secondary="apartment_service", back_populates="apartments"
    )
    price_history: so.Mapped[List["PriceHistory"]] = so.relationship(
        back_populates="apartment", cascade="all, delete-orphan"
    )
    favorites: so.Mapped[List["Favorite"]] = so.relationship(back_populates="apartment", cascade="all, delete-orphan")

    __table_args__ = (
        sa.Index('idx_apartments_location', 'latitude', 'longitude'),
    )

    def __repr__(self):
        return f"<Apartment(id={self.id}, title='{self.title}')>"


# Календарь объектов
class ApartmentAvailability(Base):
    __tablename__ = "apartment_availability"

    id: so.Mapped[int] = so.mapped_column(sa.Integer, primary_key=True)
    apartment_id: so.Mapped[int] = so.mapped_column(
        sa.Integer,
        sa.ForeignKey("apartments.id", ondelete="CASCADE"),
        index=True,
        nullable=False
    )
    date: so.Mapped[date] = so.mapped_column(sa.Date, nullable=False)
    price: so.Mapped[Optional[float]] = so.mapped_column(sa.Float, nullable=True)
    is_available: so.Mapped[Optional[bool]] = so.mapped_column(sa.Boolean, default=False, nullable=True)
    min_stay: so.Mapped[Optional[int]] = so.mapped_column(sa.Integer, default=1, nullable=True)

    closed_on_arrival: so.Mapped[bool] = so.mapped_column(sa.Boolean, default=False)
    closed_on_departure: so.Mapped[bool] = so.mapped_column(sa.Boolean, default=False)

    __table_args__ = (
        # Составной частичный индекс для ускорения JOIN и фильтрации цен
        sa.Index(
            "idx_apt_avail_search_optimized",
            "apartment_id", "date", "price",
            postgresql_where=sa.text("is_available = true AND price > 0")
        ),
        sa.UniqueConstraint("apartment_id", "date", name="uq_apt_date"),
    )

    apartment: so.Mapped["Apartment"] = so.relationship(back_populates="calendar")

    def __repr__(self):
        return f"<ApartmentAvailability(id={self.id}, date='{self.date}')>"


# Таблица истории цен
class PriceHistory(Base):
    __tablename__ = "price_history"

    id: so.Mapped[int] = so.mapped_column(sa.Integer, primary_key=True)
    apartment_id: so.Mapped[int] = so.mapped_column(
        sa.Integer,
        sa.ForeignKey("apartments.id", ondelete="CASCADE"),
        index=True,
        nullable=False
    )
    price_without_discount: so.Mapped[sa.Float] = so.mapped_column(sa.Float, nullable=False)
    price_with_discount: so.Mapped[Optional[sa.Float]] = so.mapped_column(sa.Float)
    discount_percent: so.Mapped[int] = so.mapped_column(sa.Integer, default=0)
    price_details: so.Mapped[Optional[dict]] = so.mapped_column(sa.JSON)
    changed_at: so.Mapped[datetime] = so.mapped_column(sa.DateTime, default=sa.func.now())

    # Связь
    apartment: so.Mapped["Apartment"] = so.relationship(back_populates="price_history")

    def __repr__(self):
        return f"<PriceHistory(id={self.id}, changed_at='{self.changed_at}')>"


# Таблица фотографий объектов
class PhotoApartment(Photo):
    __tablename__ = "apartment_photos"

    apartment_id: so.Mapped[int] = so.mapped_column(
        sa.Integer,
        sa.ForeignKey("apartments.id", ondelete="CASCADE"),
        index=True,
        nullable=False
    )

    # Связь
    apartment: so.Mapped["Apartment"] = so.relationship(back_populates="photos")

    def __repr__(self):
        return f"<PhotoApartment(id={self.id}, url='{self.url}')>"


# Таблица услуг
class Service(Base):
    __tablename__ = "services"

    id: so.Mapped[int] = so.mapped_column(sa.Integer, primary_key=True)
    title: so.Mapped[str] = so.mapped_column(sa.String(200), index=True, unique=True)
    created_at: so.Mapped[datetime] = so.mapped_column(sa.DateTime, default=sa.func.now())

    # Связи
    apartments: so.Mapped[List["Apartment"]] = so.relationship(
        secondary="apartment_service", back_populates="services"
    )

    def __repr__(self):
        return f"<Service(id={self.id}, title='{self.title}')>"


# Таблица избранного
class Favorite(Base):
    __tablename__ = "favorites"

    id: so.Mapped[int] = so.mapped_column(sa.Integer, primary_key=True)
    user_id: so.Mapped[int] = so.mapped_column(
        sa.Integer,
        sa.ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False
    )
    apartment_id: so.Mapped[int] = so.mapped_column(
        sa.Integer,
        sa.ForeignKey("apartments.id", ondelete="CASCADE"),
        index=True,
        nullable=False
    )
    created_at: so.Mapped[datetime] = so.mapped_column(sa.DateTime, default=sa.func.now())

    # Связи
    user: so.Mapped["User"] = so.relationship(back_populates="favorites")
    apartment: so.Mapped["Apartment"] = so.relationship(back_populates="favorites")

    def __repr__(self):
        return f"<Favorite(id={self.id}, user_id='{self.user_id}, apartment_id={self.apartment_id}')>"


# Промежуточные таблицы для связей многие-ко-многим
class ApartmentMetro(Base):
    __tablename__ = "apartment_metro"

    apartment_id: so.Mapped[int] = so.mapped_column(
        sa.Integer,
        sa.ForeignKey("apartments.id", ondelete="CASCADE"),
        primary_key=True
    )
    metro_station_id: so.Mapped[int] = so.mapped_column(
        sa.Integer,
        sa.ForeignKey("metro_stations.id", ondelete="CASCADE"),
        primary_key=True
    )
    created_at: so.Mapped[datetime] = so.mapped_column(sa.DateTime, default=sa.func.now())

    def __repr__(self):
        return f"<ApartmentMetro(apartment_id='{self.apartment_id}, metro_station_id={self.metro_station_id}')>"


class ApartmentService(Base):
    __tablename__ = "apartment_service"

    apartment_id: so.Mapped[int] = so.mapped_column(
        sa.Integer, sa.ForeignKey("apartments.id", ondelete="CASCADE"),
        primary_key=True
    )
    service_id: so.Mapped[int] = so.mapped_column(
        sa.Integer, sa.ForeignKey("services.id", ondelete="CASCADE"),
        primary_key=True
    )
    created_at: so.Mapped[datetime] = so.mapped_column(sa.DateTime, default=sa.func.now())

    def __repr__(self):
        return f"<ApartmentService(apartment_id='{self.apartment_id}, service_id={self.service_id}')>"