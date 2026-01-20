# Внешние зависимости
import secrets
from passlib.context import CryptContext


pwd_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto",
    # Опциональные настройки для большей безопасности
    argon2__time_cost=2,
    argon2__memory_cost=1024,
    argon2__parallelism=2,
)


# Верифицируем пароль
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


# Получаем хэш пароля
def get_password_hash(password):
    return pwd_context.hash(password)


# Генерируем токен для сброса пароля
def create_reset_token():
    return secrets.token_urlsafe(32)