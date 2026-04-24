# Внешние зависимости
from sqladmin import ModelView
# Внутренние модули
from models import Contact


# Админка для Contact
class ContactAdmin(ModelView, model=Contact):
    column_list = [
        Contact.id,
        Contact.number
    ]

    column_labels = {
        Contact.id: "Идентификатор",
        Contact.number: "Номер",
        Contact.created_at: "Дата создания",
        Contact.apartments: "Объекты"
    }

    column_searchable_list = [Contact.id] # список столбцов, которые можно искать
    column_sortable_list = [
        Contact.id
    ]  # список столбцов, которые можно сортировать

    column_default_sort = [(Contact.id, True)]

    form_create_rules = [
        "number"
    ]

    column_details_list = [
        Contact.id,
        Contact.number,
        Contact.created_at,
        Contact.apartments
    ]

    form_edit_rules = [
        "number"
    ]

    can_create = True # право создавать
    can_edit = True # право редактировать
    can_delete = True # право удалять
    can_view_details = True # право смотреть всю информацию
    can_export = True # право экспортировать

    name = "Контакт" # название
    name_plural = "Контакты" # множественное название
    icon = "fa-solid fa-layer-group" # иконка
    category = "Объекты" # категория
    category_icon = "fa-solid fa-list" # иконка категории

    page_size = 10
    page_size_options = [10, 25, 50, 100]