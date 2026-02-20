# Внешние зависимости
from starlette_admin.contrib.sqla import ModelView
from starlette_admin.fields import IntegerField, StringField


# Админка для Service
class ServiceAdmin(ModelView):
    identity = "services"
    name = "Услуга"
    label = "Услуги"

    page_size = 10

    fields = [
        IntegerField("id", label="Идентификатор"),
        StringField("title", label="Название")
    ]

    # Поля для поиска
    searchable_fields = ["id", "title"]

    # Поля для сортировки
    sortable_fields = ["id", "title", "created_at"]

    # Сортировка по умолчанию
    default_sort = [("id", True)]

    # Поля для создания (не используются)
    create_fields = []

    # Поля для редактирования (не используются)
    edit_fields = []