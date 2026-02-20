# Внешние зависимости
from sqladmin import ModelView
# Внутренние модули
from models import Brand


# Админка для Brand
class BrandAdmin(ModelView, model=Brand):
    column_list = [
        Brand.id,
        Brand.title
    ]

    searchable_columns = [Brand.title]

    column_labels = {
        Brand.id: "Идентификатор",
        Brand.title: "Название",
        Brand.created_at: "Дата создания",
        Brand.apartment_items: "Предметы на объектах"
    }

    column_searchable_list = [Brand.title] # список столбцов, которые можно искать
    column_sortable_list = [
        Brand.id,
        Brand.title
    ]  # список столбцов, которые можно сортировать

    column_default_sort = [(Brand.id, True)]

    form_create_rules = [
        "title"
    ]

    column_details_list = [
        Brand.id,
        Brand.title,
        Brand.created_at,
        Brand.apartment_items
    ]

    form_edit_rules = [
        "title"
    ]

    can_create = True # право создавать
    can_edit = True # право редактировать
    can_delete = True # право удалять
    can_view_details = True # право смотреть всю информацию
    can_export = True # право экспортировать

    name = "Бренд" # название
    name_plural = "Бренды" # множественное название
    icon = "fa-solid fa-layer-group" # иконка
    category = "Объекты" # категория
    category_icon = "fa-solid fa-list" # иконка категории

    page_size = 10
    page_size_options = [10, 25, 50, 100]