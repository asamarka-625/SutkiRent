# Внешние зависимости
from sqladmin import ModelView
# Внутренние модули
from models import MetroStation


# Админка для MetroStation
class MetroStationAdmin(ModelView, model=MetroStation):
    column_list = [
        MetroStation.id,
        MetroStation.external_id,
        MetroStation.title
    ]

    column_labels = {
        MetroStation.id: "Идентификатор",
        MetroStation.external_id: "Внутренний ID",
        MetroStation.title: "Название",
        MetroStation.created_at: "Дата создания"
    }

    column_searchable_list = [MetroStation.external_id] # список столбцов, которые можно искать
    column_sortable_list = [
        MetroStation.id,
        MetroStation.external_id
    ]  # список столбцов, которые можно сортировать

    column_default_sort = [(MetroStation.id, True)]

    column_details_list = [
        MetroStation.id,
        MetroStation.external_id,
        MetroStation.title,
        MetroStation.created_at
    ]

    can_create = False # право создавать
    can_edit = False # право редактировать
    can_delete = False # право удалять
    can_view_details = True # право смотреть всю информацию
    can_export = True # право экспортировать

    name = "Станция метро" # название
    name_plural = "Станции метро" # множественное название
    icon = "fa-solid fa-layer-group" # иконка
    category = "Объекты" # категория
    category_icon = "fa-solid fa-list" # иконка категории

    page_size = 10
    page_size_options = [10, 25, 50, 100]