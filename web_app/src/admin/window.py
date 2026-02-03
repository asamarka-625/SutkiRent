# Внешние зависимости
from sqladmin import ModelView
# Внутренние модули
from models import Window


# Админка для Window
class WindowAdmin(ModelView, model=Window):
    column_list = [
        Window.id,
        Window.title
    ]

    column_labels = {
        Window.id: "Идентификатор",
        Window.title: "Название",
        Window.created_at: "Дата создания",
        Window.apartments: "Объекты"
    }

    column_searchable_list = [Window.id] # список столбцов, которые можно искать
    column_sortable_list = [
        Window.id
    ]  # список столбцов, которые можно сортировать

    column_default_sort = [(Window.id, True)]

    form_create_rules = [
        "title"
    ]

    column_details_list = [
        Window.id,
        Window.title,
        Window.created_at,
        Window.apartments
    ]

    form_edit_rules = [
        "title"
    ]

    can_create = True # право создавать
    can_edit = True # право редактировать
    can_delete = True # право удалять
    can_view_details = True # право смотреть всю информацию
    can_export = True # право экспортировать

    name = "Вид из окна" # название
    name_plural = "Виды из окон" # множественное название
    icon = "fa-solid fa-layer-group" # иконка
    category = "Объекты" # категория
    category_icon = "fa-solid fa-list" # иконка категории

    page_size = 10
    page_size_options = [10, 25, 50, 100]