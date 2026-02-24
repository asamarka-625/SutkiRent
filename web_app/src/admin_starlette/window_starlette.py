# Внешние зависимости
from starlette_admin.contrib.sqla import ModelView
from starlette_admin.fields import IntegerField, StringField, DateTimeField, HasMany


# Админка для Window
class WindowAdmin(ModelView):
    identity = "windows"
    name = "Вид из окна"
    label = "Виды из окон"

    page_size = 10

    fields = [
        IntegerField("id", label="Идентификатор"),
        StringField("title", label="Название"),

        # Связь с объектами (для отображения)
        HasMany(
            "apartments",
            identity="apartments",
            label="Объекты"
        )
    ]

    # Поля для поиска
    searchable_fields = ["id", "title"]

    # Поля для сортировки
    sortable_fields = ["id", "title", "created_at"]

    # Сортировка по умолчанию
    default_sort = [("id", True)]

    # Поля для создания
    create_fields = ["title"]

    # Поля для редактирования
    edit_fields = ["title"]