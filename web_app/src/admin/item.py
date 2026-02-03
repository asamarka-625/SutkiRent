# Внешние зависимости
from sqladmin import ModelView
# Внутренние модули
from models import Item


# Админка для Item
class ItemAdmin(ModelView, model=Item):
    column_list = [
        Item.id,
        Item.title,
        Item.importance
    ]

    column_labels = {
        Item.id: "Идентификатор",
        Item.title: "Название",
        Item.importance: "Важность",
        Item.created_at: "Дата создания",
        Item.apartments: "Объекты"
    }

    column_searchable_list = [Item.id, Item.title] # список столбцов, которые можно искать
    column_sortable_list = [
        Item.id,
        Item.importance
    ]  # список столбцов, которые можно сортировать

    column_default_sort = [(Item.id, True)]

    form_create_rules = [
        "title",
        "importance"
    ]

    column_details_list = [
        Item.id,
        Item.title,
        Item.importance,
        Item.created_at,
        Item.apartments
    ]

    form_edit_rules = [
        "title",
        "importance"
    ]

    can_create = True # право создавать
    can_edit = True # право редактировать
    can_delete = True # право удалять
    can_view_details = True # право смотреть всю информацию
    can_export = True # право экспортировать

    name = "Предмет" # название
    name_plural = "Предметы" # множественное название
    icon = "fa-solid fa-layer-group" # иконка
    category = "Объекты" # категория
    category_icon = "fa-solid fa-list" # иконка категории

    page_size = 10
    page_size_options = [10, 25, 50, 100]