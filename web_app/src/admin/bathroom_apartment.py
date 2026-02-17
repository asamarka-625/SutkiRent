# Внешние зависимости
from sqladmin import ModelView
# Внутренние модули
from models import Bathroom


# Админка для Bathroom
class BathroomAdmin(ModelView, model=Bathroom):
    column_list = [
        Bathroom.id,
        Bathroom.title
    ]

    column_labels = {
        Bathroom.id: "Идентификатор",
        Bathroom.title: "Название",
        Bathroom.created_at: "Дата создания",
        Bathroom.apartments: "Объекты"
    }

    column_searchable_list = [Bathroom.id] # список столбцов, которые можно искать
    column_sortable_list = [
        Bathroom.id,
    ]  # список столбцов, которые можно сортировать

    column_default_sort = [(Bathroom.id, True)]

    form_create_rules = [
        "title"
    ]

    column_details_list = [
        Bathroom.id,
        Bathroom.title,
        Bathroom.created_at,
        Bathroom.apartments
    ]

    form_edit_rules = [
        "title"
    ]

    can_create = True # право создавать
    can_edit = True # право редактировать
    can_delete = True # право удалять
    can_view_details = True # право смотреть всю информацию
    can_export = True # право экспортировать

    name = "Тип санузла" # название
    name_plural = "Типы санузлов" # множественное название
    icon = "fa-solid fa-layer-group" # иконка
    category = "Объекты" # категория
    category_icon = "fa-solid fa-list" # иконка категории

    page_size = 10
    page_size_options = [10, 25, 50, 100]