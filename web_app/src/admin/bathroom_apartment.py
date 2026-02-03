# Внешние зависимости
from sqladmin import ModelView
# Внутренние модули
from models import BathroomApartment


# Админка для BathroomApartment
class BathroomApartmentAdmin(ModelView, model=BathroomApartment):
    column_list = [
        BathroomApartment.id,
        BathroomApartment.title
    ]

    column_labels = {
        BathroomApartment.id: "Идентификатор",
        BathroomApartment.title: "Название",
        BathroomApartment.created_at: "Дата создания",
        BathroomApartment.apartments: "Объекты"
    }

    column_searchable_list = [BathroomApartment.id] # список столбцов, которые можно искать
    column_sortable_list = [
        BathroomApartment.id,
    ]  # список столбцов, которые можно сортировать

    column_default_sort = [(BathroomApartment.id, True)]

    form_create_rules = [
        'title'
    ]

    column_details_list = [
        BathroomApartment.id,
        BathroomApartment.title,
        BathroomApartment.created_at,
        BathroomApartment.apartments
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