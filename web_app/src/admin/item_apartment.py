# Внешние зависимости
from sqladmin import ModelView
# Внутренние модули
from models import ApartmentItem


# Админка для ApartmentItem
class ApartmentItemAdmin(ModelView, model=ApartmentItem):
    column_list = [
        ApartmentItem.apartment,
        ApartmentItem.item,
        ApartmentItem.brand,
        ApartmentItem.quantity,
        ApartmentItem.price
    ]

    column_labels = {
        ApartmentItem.apartment: "Объект",
        ApartmentItem.item: "Предмет",
        ApartmentItem.brand: "Бренд",
        ApartmentItem.quantity: "Количество",
        ApartmentItem.price: "Цена (1 шт.)"
    }

    form_ajax_refs = {
        "apartment": {
            "fields": ("address",),
            "order_by": "address",
        },
        "item": {
            "fields": ("title",),
            "order_by": "title",
        },
        "brand": {
            "fields": ("title",),
            "order_by": "title",
        }
    }

    column_searchable_list = [
        "apartment.title",
        "item.title"
    ] # список столбцов, которые можно искать

    form_create_rules = [
        "apartment",
        "item",
        "brand",
        "quantity",
        "price"
    ]

    column_details_list = [
        ApartmentItem.apartment,
        ApartmentItem.item,
        ApartmentItem.brand,
        ApartmentItem.quantity,
        ApartmentItem.price,
        ApartmentItem.created_at
    ]

    form_edit_rules = [
        "apartment",
        "item",
        "brand",
        "quantity",
        "price"
    ]

    can_create = True # право создавать
    can_edit = True # право редактировать
    can_delete = True # право удалять
    can_view_details = True # право смотреть всю информацию
    can_export = True # право экспортировать

    name = "Предмет на объекте" # название
    name_plural = "Предметы на объектах" # множественное название
    icon = "fa-solid fa-layer-group" # иконка
    category = "Объекты" # категория
    category_icon = "fa-solid fa-list" # иконка категории

    page_size = 10
    page_size_options = [10, 25, 50, 100]

    async def get_select_options(self):
        return {
            "apartment": {"selectinload": True},
            "item": {"selectinload": True}
        }