# Внешние зависимости
from typing import List
from dataclasses import dataclass, field
from dotenv import load_dotenv
import os
import logging
# Внутренние модули
from web_app.src.core.logger import setup_logger


load_dotenv(dotenv_path="web.env")


@dataclass
class Config:
    _database_url: str = field(default_factory=lambda: os.getenv("DATABASE_URL"))
    _redis_url: str = field(default_factory=lambda: os.getenv("REDIS_URL"))
    logger: logging.Logger = field(init=False)

    # Security
    ALGORITHM: str = field(default_factory=lambda: os.getenv("ALGORITHM"))

    REFRESH_TOKEN_EXPIRE_MINUTES: int = field(default_factory=lambda: int(os.getenv("REFRESH_TOKEN_EXPIRE_MINUTES")))
    SECRET_REFRESH_KEY: str = field(default_factory=lambda: os.getenv("SECRET_REFRESH_KEY"))

    ACCESS_TOKEN_EXPIRE_MINUTES: int = field(default_factory=lambda: int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES")))
    SECRET_ACCESS_KEY: str = field(default_factory=lambda: os.getenv("SECRET_ACCESS_KEY"))

    CSRF_TOKEN_EXPIRE_MINUTES: int = field(default_factory=lambda: int(os.getenv("CSRF_TOKEN_EXPIRE_MINUTES")))
    SECRET_CSRF_KEY: str = field(default_factory=lambda: os.getenv("SECRET_CSRF_KEY"))

    USER_CACHE_MINUTES: int = field(default_factory=lambda: int(os.getenv("USER_CACHE_MINUTES")))
    VERIFICATION_CODE_TTL: int = field(default_factory=lambda: int(os.getenv("VERIFICATION_CODE_TTL")))

    # RealtyCalendar
    RC_API_URL: str = field(default_factory=lambda: os.getenv("RC_API_URL"))
    RC_TIMEOUT: int = 30

    SMTP_HOST: str = field(default_factory=lambda: os.getenv("SMTP_HOST"))
    SMTP_PORT: int = field(default_factory=lambda: int(os.getenv("SMTP_PORT")))
    SMTP_USERNAME: str = field(default_factory=lambda: os.getenv("SMTP_USERNAME"))
    SMTP_PASSWORD: str = field(default_factory=lambda: os.getenv("SMTP_PASSWORD"))
    FROM_EMAIL: str = field(default_factory=lambda: os.getenv("FROM_EMAIL"))

    def __post_init__(self):
        self.logger = setup_logger(
            level=os.getenv("LOG_LEVEL", "INFO"),
            log_dir=os.getenv("LOG_DIR", "logs"),
            log_file=os.getenv("LOG_FILE", "web_log")
        )

        self.validate()
        self.logger.info("Configuration initialized")

    # Валидация конфигурации
    def validate(self):
        if not self._database_url:
            self.logger.critical("DATABASE_URL is required in environment variables")
            raise ValueError("DATABASE_URL is required")

        if not self._redis_url:
            self.logger.critical("REDIS_URL is required in environment variables")
            raise ValueError("REDIS_URL is required")

        self.logger.debug("Configuration validation passed")

    @property
    def DATABASE_URL(self) -> str:
        return self._database_url

    @property
    def REDIS_URL(self) -> str:
        return self._redis_url

    @property
    def ALLOWED_ORIGINS(self) -> List[str]:
        return [origin.strip() for origin in self._allowed_origins_env.split(",") if origin.strip()]


    def __str__(self) -> str:
        return f"Config(database={self._database_url}, redis={self._redis_url}, log_level={self.logger.level})"


_instance = None


def get_config() -> Config:
    global _instance
    if _instance is None:
        _instance = Config()

    return _instance