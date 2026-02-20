# Внешние зависимости
from starlette_admin.contrib.sqla import ModelView
from starlette_admin.fields import (
    IntegerField,
    StringField,
    HasMany
)


# Админка для Bathroom
class BathroomAdmin(ModelView):
    identity = "bathrooms"  # Уникальный идентификатор для связей
    name = "Тип санузла"
    label = "Типы санузлов"

    page_size = 10

    fields = [
        IntegerField("id", label="Идентификатор"),
        StringField("title", label="Название"),

        # Связь с объектами (многие ко многим через apartment_bathroom)
        HasMany(
            "apartments",  # имя поля в модели Bathroom
            identity="apartments",  # identity связанной модели Apartment
            label="Объекты"
        )
    ]

    # Поля для поиска
    searchable_fields = [
        "title",  # поиск по названию
        "id"  # поиск по ID
    ]

    # Поля для сортировки
    sortable_fields = [
        "id",
        "title"
    ]

    # Поля для создания
    create_fields = [
        "title"
    ]

    # Поля для редактирования
    edit_fields = [
        "title"
    ]

    # Сортировка по умолчанию
    default_sort = [("id", True)]
