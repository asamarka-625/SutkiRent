# Внешние зависимости
from starlette_admin.contrib.sqla import ModelView
from starlette_admin.fields import IntegerField, StringField, HasMany


# Админка для Region
class RegionAdmin(ModelView):
    identity = "regions"
    name = "Регион"
    label = "Регионы"

    page_size = 10

    fields = [
        IntegerField("id", label="ID"),
        StringField("title", label="Название"),
        IntegerField("order", label="Приоритет"),
        HasMany("cities", identity="cities", label="Города"),
        HasMany("metro_stations", identity="metro_stations", label="Станции метро"),
        HasMany("apartments", identity="apartments", label="Объекты"),
    ]

    searchable_fields = ["id", "title"]
    sortable_fields = ["id", "title", "order"]

    create_fields = ["title", "order"]
    edit_fields = ["title", "order"]


    default_sort = [("id", True)]