# Внешние зависимости
from sqladmin import ModelView
# Внутренние модули
from models import Apartment


# Админка для Apartment
class ApartmentAdmin(ModelView, model=Apartment):
    column_list = [
        Apartment.id,
        Apartment.external_id,
        Apartment.title,
        Apartment.region_rel,
        Apartment.city_rel,
        Apartment.address,
        Apartment.priority,
        Apartment.visibility
    ]

    column_labels = {
        Apartment.id: "Идентификатор",
        Apartment.external_id: "Внутренний ID",
        Apartment.address: "Адрес",
        Apartment.rooms: "Комнаты",
        Apartment.sleeps: "Формат спальных мест",
        Apartment.floor: "Этаж",
        Apartment.title: "Название",
        Apartment.area: "Площадь м2",
        Apartment.latitude: "Локация (широта)",
        Apartment.longitude: "Локация (долгота)",
        Apartment.capacity: "Вместимость (кол-во человек)",
        Apartment.max_children_count: "Максимальная допустимость детей",
        Apartment.availability: "Доступность",
        Apartment.priority: "Приоритет",
        Apartment.visibility: "Видимость",
        Apartment.price_without_discount: "Цена без скидки",
        Apartment.price_with_discount: "Цена со скидкой",
        Apartment.discount_percent: "Скидка (%)",
        Apartment.price_details: "Детали цены",
        Apartment.min_stay: "Минимальное пребывания (дней)",
        Apartment.region_rel: "Регион",
        Apartment.city_rel: "Город",
        Apartment.metro_stations: "Метро",
        Apartment.photos: "Фотографии",
        Apartment.increase_capacity: "Надбавка к цене от ко-во жильцов",
        Apartment.increase_capacity_price: "Надбавочная цена за ко-во жильцов",
    }

    column_searchable_list = [Apartment.external_id] # список столбцов, которые можно искать
    column_sortable_list = [
        Apartment.id,
        Apartment.external_id,
        Apartment.priority,
        Apartment.visibility
    ]  # список столбцов, которые можно сортировать

    column_default_sort = [(Apartment.id, True)]

    column_details_list = [
        Apartment.id,
        Apartment.external_id,
        Apartment.title,
        Apartment.address,
        Apartment.region_rel,
        Apartment.city_rel,
        Apartment.metro_stations,
        Apartment.priority,
        Apartment.visibility,
        Apartment.floor,
        Apartment.area,
        Apartment.rooms,
        Apartment.sleeps,
        Apartment.capacity,
        Apartment.max_children_count,
        Apartment.increase_capacity,
        Apartment.increase_capacity_price,
        Apartment.min_stay,
        Apartment.availability,
        Apartment.latitude,
        Apartment.longitude,
        Apartment.price_without_discount,
        Apartment.price_with_discount,
        Apartment.discount_percent,
        Apartment.price_details,
        Apartment.photos
    ]

    form_edit_rules = [
        "priority",
        "visibility",
        "region_rel",
        "increase_capacity",
        "increase_capacity_price"
    ]

    can_create = False # право создавать
    can_edit = True # право редактировать
    can_delete = False # право удалять
    can_view_details = True # право смотреть всю информацию
    can_export = True # право экспортировать

    name = "Объект" # название
    name_plural = "Объекты" # множественное название
    icon = "fa-solid fa-layer-group" # иконка
    category = "Объекты" # категория
    category_icon = "fa-solid fa-list" # иконка категории

    page_size = 10
    page_size_options = [10, 25, 50, 100]