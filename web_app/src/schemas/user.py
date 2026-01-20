# Внешние зависимости
from typing import Annotated, Optional
from datetime import date
import html
from pydantic import BaseModel, Field, model_validator



# Схема обновления информации пользователя
class UserUpdate(BaseModel):
    name: Optional[Annotated[str, Field(strict=True, max_length=64)]]
    surname: Optional[Annotated[str, Field(strict=True, max_length=64)]]
    patronymic: Optional[Annotated[str, Field(strict=True, max_length=64)]]
    date_of_birth: Optional[date]
    phone: Optional[Annotated[str, Field(strict=True, max_length=11)]]
    about: Optional[Annotated[str, Field(strict=True, max_length=255)]]

    @model_validator(mode='before')
    @classmethod
    def clean_strings(cls, data: dict) -> dict:
        """Проходим по всем полям, и если это строка — чистим её"""
        if not isinstance(data, dict):
            return data

        for field, value in data.items():
            if isinstance(value, str):
                # Убираем пробелы и экранируем HTML-символы
                data[field] = html.escape(value.strip())
        return data
