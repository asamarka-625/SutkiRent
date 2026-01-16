# Внешние зависимости
from typing import Annotated, List
from pydantic import BaseModel, Field, ConfigDict


# Схема ответа контента
class ContentResponse(BaseModel):
    title: Annotated[str, Field(strict=True)]
    short_description: Annotated[str, Field(strict=True)]
    content: Annotated[str, Field(strict=True)]
    media: List[str]

    model_config = ConfigDict(from_attributes=True)