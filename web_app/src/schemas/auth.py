# Внешние зависимости
from typing import Annotated, Optional
from datetime import date
import html
from pydantic import BaseModel, Field, field_validator, model_validator
from email_validator import validate_email, EmailNotValidError


# Схема email
class EmailBase(BaseModel):
    email: Annotated[str, Field(strict=True, max_length=255)]

    @field_validator('email')
    @classmethod
    def validate_and_normalize_email(cls, value: str) -> str:
        """Валидирует и нормализует email адрес"""
        if not value:
            raise ValueError('Email не может быть пустым')

        try:
            # Используем email-validator для полноценной проверки
            email_info = validate_email(value.strip(), check_deliverability=False)
            return email_info.normalized.lower()
        except EmailNotValidError as e:
            raise ValueError(f'Некорректный email адрес: {str(e)}')


# Схема user
class UserBase(EmailBase):
    name: Annotated[str, Field(strict=True, max_length=64)]
    surname: Optional[Annotated[str, Field(strict=True, max_length=64)]]
    patronymic: Optional[Annotated[str, Field(strict=True, max_length=64)]]
    date_of_birth: Optional[date]
    phone: Optional[Annotated[str, Field(strict=True, max_length=11)]]

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


# Схема создания пользователя
class UserCreate(UserBase):
    password: Annotated[str, Field(strict=True, max_length=100)]


# Схема верификации пользователя
class VerifyRequest(EmailBase):
    code: Annotated[str, Field(strict=True, max_length=6)]

    @field_validator('code')
    @classmethod
    def validate_verification_code(cls, value: str) -> str:
        """Проверяет, что код состоит только из цифр"""
        if not value:
            raise ValueError('Код подтверждения не может быть пустым')

        value = value.strip()

        if not value.isdigit():
            raise ValueError('Код подтверждения должен содержать только цифры')

        return value


# Схема токена смены пароля
class TokenRequest(BaseModel):
    token: Annotated[str, Field(strict=True)]


# Схема создания нового пароля
class PasswordResetConfirmRequest(TokenRequest):
    new_password: Annotated[str, Field(strict=True, max_length=100)]
