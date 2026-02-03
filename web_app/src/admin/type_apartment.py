# Внешние зависимости
from sqladmin import ModelView
# Внутренние модули
from models import TypeApartment


# Админка для TypeApartment
class TypeApartmentAdmin(ModelView, model=TypeApartment):
    column_list = [
        TypeApartment.id,
        TypeApartment.title
    ]

    column_labels = {
        TypeApartment.id: "Идентификатор",
        TypeApartment.title: "Название",
        TypeApartment.created_at: "Дата создания",
        TypeApartment.apartments: "Объекты"
    }

    column_searchable_list = [TypeApartment.id] # список столбцов, которые можно искать
    column_sortable_list = [
        TypeApartment.id,
    ]  # список столбцов, которые можно сортировать

    column_default_sort = [(TypeApartment.id, True)]

    form_create_rules = [
        'title'
    ]

    column_details_list = [
        TypeApartment.id,
        TypeApartment.title,
        TypeApartment.created_at,
        TypeApartment.apartments
    ]

    form_edit_rules = [
        "title"
    ]

    can_create = True # право создавать
    can_edit = True # право редактировать
    can_delete = True # право удалять
    can_view_details = True # право смотреть всю информацию
    can_export = True # право экспортировать

    name = "Тип жилья" # название
    name_plural = "Типы жилья" # множественное название
    icon = "fa-solid fa-layer-group" # иконка
    category = "Объекты" # категория
    category_icon = "fa-solid fa-list" # иконка категории

    page_size = 10
    page_size_options = [10, 25, 50, 100]