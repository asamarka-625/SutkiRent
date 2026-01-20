# Внешние зависимости
from sqladmin import ModelView
# Внутренние модули
from models import Region


# Админка для Region
class RegionAdmin(ModelView, model=Region):
    column_list = [
        Region.id,
        Region.title,
        Region.order
    ]

    column_labels = {
        Region.id: "Идентификатор",
        Region.title: "Название",
        Region.order: "Приоритет выдачи",
        Region.cities: "Города",
        Region.apartments: "Объекты"
    }

    column_searchable_list = [Region.id] # список столбцов, которые можно искать
    column_sortable_list = [
        Region.id,
        Region.order
    ]  # список столбцов, которые можно сортировать

    column_default_sort = [(Region.id, True)]

    form_create_rules = [
        "title",
        "order"
    ]

    column_details_list = [
        Region.id,
        Region.title,
        Region.cities,
        Region.apartments
    ]

    form_edit_rules = [
        "title",
        "order"
    ]

    can_create = True # право создавать
    can_edit = True # право редактировать
    can_delete = True # право удалять
    can_view_details = True # право смотреть всю информацию
    can_export = True # право экспортировать

    name = "Регион" # название
    name_plural = "Регионы" # множественное название
    icon = "fa-solid fa-layer-group" # иконка
    category = "Объекты" # категория
    category_icon = "fa-solid fa-list" # иконка категории

    page_size = 10
    page_size_options = [10, 25, 50, 100]