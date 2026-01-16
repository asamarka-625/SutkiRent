# Внешние зависимости
from dataclasses import dataclass, field
from dotenv import load_dotenv
import os
import logging
# Внутренние модули
from parser_realty.core.logger import setup_logger


load_dotenv(dotenv_path="parser.env")


@dataclass
class Config:
    _database_url: str = field(default_factory=lambda: os.getenv("DATABASE_URL"))

    logger: logging.Logger = field(init=False)

    # RealtyCalendar
    RC_API_URL: str = field(default_factory=lambda: os.getenv("RC_API_URL"))
    RC_TIMEOUT: int = 30

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

        self.logger.debug("Configuration validation passed")

    @property
    def DATABASE_URL(self) -> str:
        return self._database_url

    def __str__(self) -> str:
        return f"Config(database={self._database_url}, log_level={self.logger.level})"


_instance = None


def get_config() -> Config:
    global _instance
    if _instance is None:
        _instance = Config()

    return _instance