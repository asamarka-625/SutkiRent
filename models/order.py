# Внешние зависимости
from typing import List, Optional
from datetime import datetime
import sqlalchemy as sa
import sqlalchemy.orm as so
# Внутренние модули
from models.base import Base


# Таблица заказов
class Order(Base):
    __tablename__ = "orders"

    # Основная информация
    id: so.Mapped[int] = so.mapped_column(sa.Integer, primary_key=True)
    phone: so.Mapped[str] = so.mapped_column(sa.String(11), nullable=False)
    first_name: so.Mapped[str] = so.mapped_column(sa.String(64), nullable=False)
    last_name: so.Mapped[str] = so.mapped_column(sa.String(64), nullable=False)
    adult_count: so.Mapped[int] = so.mapped_column(sa.Integer, nullable=False)
    children_count: so.Mapped[int] = so.mapped_column(
        sa.Integer,
        nullable=False,
        default=0
    )
    email: so.Mapped[Optional[str]] = so.mapped_column(sa.String(255), nullable=True)
    wish: so.Mapped[Optional[str]] = so.mapped_column(sa.String(512), nullable=True)
    price: so.Mapped[float] = so.mapped_column(sa.Float, nullable=False)

    created_at: so.Mapped[datetime] = so.mapped_column(
        sa.DateTime,
        default=sa.func.now(),
        index=True
    )
    updated_at: so.Mapped[datetime] = so.mapped_column(
        sa.DateTime,
        default=sa.func.now(),
        onupdate=sa.func.now()
    )

    # Связи
    apartment_id: so.Mapped[int] = so.mapped_column(
        sa.Integer,
        sa.ForeignKey("apartments.id"),
        index=True,
        nullable=False
    )
    user_id: so.Mapped[Optional[int]] = so.mapped_column(
        sa.Integer,
        sa.ForeignKey("users.id", ondelete="SET NULL"),
        index=True,
        nullable=True
    )

    dates: so.Mapped[List["ApartmentAvailability"]] = so.relationship(
        back_populates="reservation",
        lazy="selectin"
    )
    apartment: so.Mapped["Apartment"] = so.relationship(back_populates="reservations")
    user: so.Mapped["User"] = so.relationship(back_populates="reservations")

    def __repr__(self):
        return f"<Order(id={self.id}, created_at='{self.created_at}')>"

    def __str__(self):
        return self.created_at.strftime("%d.%m.%Y")
