# Внешние зависимости
from sqladmin import ModelView
# Внутренние модули
from models import Order


# Админка для Order
class OrderAdmin(ModelView, model=Order):
    column_list = [
        Order.id,
        "booking_period",
        Order.apartment,
        Order.user,
        Order.price
    ]

    column_labels = {
        Order.id: "Идентификатор",
        "booking_period": "Период проживания",
        Order.apartment: "Объект",
        Order.user: "Пользователь",
        Order.phone: "Номер телефона",
        Order.first_name: "Имя",
        Order.last_name: "Фамилия",
        Order.adult_count: "Кол-во взрослых",
        Order.children_count: "Кол-во детей",
        Order.email: "Эл. почта",
        Order.wish: "Пожелания",
        Order.price: "Стоимость",
        Order.created_at: "Дата создания",
        Order.updated_at: "Дата последнего обновления"
    }

    column_formatters = {
        "booking_period": lambda m, a: (
            f"{min(d.date for d in m.dates).strftime('%d.%m.%Y')} — "
            f"{max(d.date for d in m.dates).strftime('%d.%m.%Y')}"
            if m.dates else "Даты не выбраны"
        ),
        Order.user: lambda m, a: m.user if m.user else "Не указан",
        Order.email: lambda m, a: m.email if m.email else "Не указано",
        Order.wish: lambda m, a: m.wish if m.wish else "Не указано"
    }

    column_searchable_list = [Order.id] # список столбцов, которые можно искать
    column_sortable_list = [
        Order.id,
        Order.created_at
    ]  # список столбцов, которые можно сортировать

    column_default_sort = [(Order.id, True)]

    column_details_list = [
        Order.id,
        "booking_period",
        Order.apartment,
        Order.user,
        Order.phone,
        Order.first_name,
        Order.last_name,
        Order.adult_count,
        Order.children_count,
        Order.email,
        Order.wish,
        Order.price,
        Order.created_at,
        Order.updated_at
    ]

    form_edit_rules = [
        "apartment",
        "user",
        "phone",
        "first_name",
        "last_name",
        "adult_count",
        "children_count",
        "email",
        "wish",
        "price"
    ]

    can_create = False # право создавать
    can_edit = True # право редактировать
    can_delete = True # право удалять
    can_view_details = True # право смотреть всю информацию
    can_export = True # право экспортировать

    name = "Бронирование" # название
    name_plural = "Бронирования" # множественное название
    icon = "fa-solid fa-layer-group" # иконка
    category = "Объекты" # категория
    category_icon = "fa-solid fa-list" # иконка категории

    page_size = 10
    page_size_options = [10, 25, 50, 100]