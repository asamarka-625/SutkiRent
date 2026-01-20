# Внешние зависимости
from typing import List, Optional
from datetime import datetime, date
import sqlalchemy as sa
import sqlalchemy.orm as so
# Внутренние модули
from models.base import Base


# Таблица пользователей
class User(Base):
    __tablename__ = "users"

    # Основная информация
    id: so.Mapped[int] = so.mapped_column(sa.Integer, primary_key=True)
    name: so.Mapped[str] = so.mapped_column(sa.String(64), nullable=False)
    email: so.Mapped[str] = so.mapped_column(sa.String(255), unique=True, nullable=False, index=True)
    password_hash: so.Mapped[str] = so.mapped_column(sa.String(255), nullable=False)
    bonuses: so.Mapped[int] = so.mapped_column(sa.Integer, nullable=False, default=0)
    is_active: so.Mapped[bool] = so.mapped_column(sa.Boolean, default=True, nullable=False)
    created_at: so.Mapped[datetime] = so.mapped_column(sa.DateTime, default=sa.func.now())
    updated_at: so.Mapped[datetime] = so.mapped_column(
        sa.DateTime,
        default=sa.func.now(),
        onupdate=sa.func.now()
    )

    # Дополнительная информация
    phone: Optional[so.Mapped[str]] = so.mapped_column(sa.String(11), nullable=True)
    surname: Optional[so.Mapped[str]] = so.mapped_column(sa.String(64), nullable=True)
    patronymic: Optional[so.Mapped[str]] = so.mapped_column(sa.String(64), nullable=True)
    date_of_birth: Optional[so.Mapped[date]] = so.mapped_column(sa.Date, nullable=True)
    about: Optional[so.Mapped[str]] = so.mapped_column(sa.String(255), nullable=True)

    # Связи
    favorites: so.Mapped[List["Favorite"]] = so.relationship(
        back_populates="user",
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}')>"