# Внешние зависимости
from typing import Annotated
from pydantic import BaseModel, Field, ConfigDict


# Схема ответа региона
class RegionResponse(BaseModel):
    id: Annotated[int, Field(ge=1)]
    title: Annotated[str, Field(strict=True)]
    order: Annotated[int, Field(ge=0)]

    model_config = ConfigDict(from_attributes=True)