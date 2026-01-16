# Внешние зависимости
from typing import List
from datetime import datetime
import sqlalchemy as sa
import sqlalchemy.orm as so
# Внутренние модули
from models.base import Base
from models.other import Photo


# Таблица категорий контента
class CategoryContent(Base):
    __tablename__ = "content_categories"

    id: so.Mapped[int] = so.mapped_column(sa.Integer, primary_key=True)
    title: so.Mapped[str] = so.mapped_column(sa.String(100), nullable=False)

    # Связи
    contents: so.Mapped[List["Content"]] = so.relationship(
        back_populates="category",
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<PhotoContent(id={self.id}, url='{self.title}')>"

    def __str__(self):
        return self.title


# Таблица контента
class Content(Base):
    __tablename__ = "contents"

    id: so.Mapped[int] = so.mapped_column(sa.Integer, primary_key=True)
    title: so.Mapped[str] = so.mapped_column(sa.String(100), nullable=False)
    short_description: so.Mapped[str] = so.mapped_column(sa.String(200), nullable=False)
    content: so.Mapped[str] = so.mapped_column(sa.Text, nullable=False)
    created_at: so.Mapped[datetime] = so.mapped_column(
        sa.DateTime,
        default=sa.func.now(),
        index=True
    )

    # Связь с категорией
    category_id: so.Mapped[int] = so.mapped_column(
        sa.Integer,
        sa.ForeignKey("content_categories.id", ondelete="CASCADE"),
        index=True,
        nullable=True
    )

    # Связи
    category: so.Mapped["CategoryContent"] = so.relationship(
        back_populates="contents"
    )
    photos: so.Mapped[List["PhotoContent"]] = so.relationship(
        back_populates="content", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Content(id={self.id}, title='{self.title}')>"

    def __str__(self):
        return self.title


# Таблица фотографий контента
class PhotoContent(Photo):
    __tablename__ = "content_photos"

    content_id: so.Mapped[int] = so.mapped_column(
        sa.Integer,
        sa.ForeignKey("contents.id", ondelete="CASCADE"),
        index=True,
        nullable=False
    )

    # Связь
    content: so.Mapped["Content"] = so.relationship(back_populates="photos")

    def __repr__(self):
        return f"<PhotoContent(id={self.id}, url='{self.url}')>"