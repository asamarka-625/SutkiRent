# Внешние зависимости
from datetime import datetime
import sqlalchemy as sa
import sqlalchemy.orm as so
# Внутренние модули
from models.base import Base


class Photo(Base):
    __abstract__ = True

    id: so.Mapped[int] = so.mapped_column(sa.Integer, primary_key=True)
    url: so.Mapped[str] = so.mapped_column(sa.String(1000), nullable=False)
    order: so.Mapped[int] = so.mapped_column(sa.Integer, default=0)
    created_at: so.Mapped[datetime] = so.mapped_column(sa.DateTime, default=sa.func.now())