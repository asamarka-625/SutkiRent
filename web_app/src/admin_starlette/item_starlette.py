# Внешние зависимости
from typing import Any
from starlette_admin.contrib.sqla import ModelView
from starlette_admin.fields import (
    IntegerField,
    StringField,
    BooleanField,
    HasMany as BaseHasMany
)


class DisplayHasMany(BaseHasMany):
    """HasMany field that displays using __str__"""

    async def serialize_value(
            self, value, field, obj, request
    ) -> Any:
        if value is None:
            return None

        # Просто возвращаем строковое представление
        return str(value)


# Админка для Item
class ItemAdmin(ModelView):
    # Настройки отображения
    identity = "items"
    name = "Предмет"
    label = "Предметы"

    # Пагинация
    page_size = 10

    fields = [
        IntegerField("id", label="ID"),
        StringField("title", label="Название"),  # title а не name
        BooleanField("importance", label="Важность"),  # Boolean поле
        DisplayHasMany(
            "apartment_items",
            identity="apartment_items",
            label="Где используется"
        ),
    ]

    # Поля для поиска
    searchable_fields = ["title"]

    # Поля для сортировки
    sortable_fields = ["id", "title", "importance"]

    # Для Boolean поля важно указать представление
    field_parsers = {
        "importance": bool,
    }

    # Сортировка по умолчанию
    default_sort = [("id", True)]

    # Дополнительные настройки
    exclude_fields_from_list = []  # Поля, исключенные из списка
    exclude_fields_from_detail = []  # Поля, исключенные из детального просмотра

    async def serialize_field_value(self, value, field, obj, request):
        print(field.name)


        return await super().serialize_field_value(value, field, obj, request)