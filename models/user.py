# Внешние зависимости
from typing import Optional, List
from datetime import datetime, UTC
import sqlalchemy as sa
import sqlalchemy.orm as so
# Внутренние модули
from models.base import Base


# Таблица пользователей
class User(Base):
    __tablename__ = "users"

    id: so.Mapped[int] = so.mapped_column(sa.Integer, primary_key=True)
    email: so.Mapped[str] = so.mapped_column(sa.String(255), unique=True, nullable=False, index=True)
    username: so.Mapped[Optional[str]] = so.mapped_column(sa.String(100))
    password_hash: so.Mapped[str] = so.mapped_column(sa.String(255), nullable=False)
    is_active: so.Mapped[bool] = so.mapped_column(sa.Boolean, default=True)
    is_admin: so.Mapped[bool] = so.mapped_column(sa.Boolean, default=False)
    created_at: so.Mapped[datetime] = so.mapped_column(sa.DateTime, default=sa.func.now())
    updated_at: so.Mapped[datetime] = so.mapped_column(
        sa.DateTime,
        default=sa.func.now(),
        onupdate=sa.func.now()
    )

    # Связи
    favorites: so.Mapped[List["Favorite"]] = so.relationship(
        back_populates="user",
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}')>"