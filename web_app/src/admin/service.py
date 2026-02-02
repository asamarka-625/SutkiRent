# Внешние зависимости
from sqladmin import ModelView
# Внутренние модули
from models import Service


# Админка для Service
class ServiceAdmin(ModelView, model=Service):
    column_list = [
        Service.id,
        Service.title
    ]

    column_labels = {
        Service.id: "Идентификатор",
        Service.title: "Название",
        Service.created_at: "Дата создания"
    }

    column_searchable_list = [Service.id] # список столбцов, которые можно искать
    column_sortable_list = [
        Service.id
    ]  # список столбцов, которые можно сортировать

    column_default_sort = [(Service.id, True)]

    column_details_list = [
        Service.id,
        Service.title,
        Service.created_at
    ]

    can_create = False # право создавать
    can_edit = False # право редактировать
    can_delete = False # право удалять
    can_view_details = True # право смотреть всю информацию
    can_export = True # право экспортировать

    name = "Услуг" # название
    name_plural = "Услуги" # множественное название
    icon = "fa-solid fa-layer-group" # иконка
    category = "Объекты" # категория
    category_icon = "fa-solid fa-list" # иконка категории

    page_size = 10
    page_size_options = [10, 25, 50, 100]