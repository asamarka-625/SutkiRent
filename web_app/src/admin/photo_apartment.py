# Внешние зависимости
from sqladmin import ModelView
# Внутренние модули
from models import PhotoApartment


# Админка для PhotoApartment
class PhotoApartmentAdmin(ModelView, model=PhotoApartment):
    column_list = [
        PhotoApartment.id,
        PhotoApartment.url,
        PhotoApartment.order,
        PhotoApartment.apartment
    ]

    column_labels = {
        PhotoApartment.id: "Идентификатор",
        PhotoApartment.url: "Ссылка",
        PhotoApartment.order: "Порядок",
        PhotoApartment.apartment: "Объект",
        PhotoApartment.created_at: "Дата создания"
    }

    column_searchable_list = [PhotoApartment.id] # список столбцов, которые можно искать
    column_sortable_list = [
        PhotoApartment.id
    ]  # список столбцов, которые можно сортировать

    column_default_sort = [(PhotoApartment.id, True)]

    column_details_list = [
        PhotoApartment.id,
        PhotoApartment.url,
        PhotoApartment.order,
        PhotoApartment.apartment,
        PhotoApartment.created_at
    ]

    can_create = False # право создавать
    can_edit = False # право редактировать
    can_delete = False # право удалять
    can_view_details = True # право смотреть всю информацию
    can_export = True # право экспортировать

    name = "Фотография объекта" # название
    name_plural = "Фотографии объектов" # множественное название
    icon = "fa-solid fa-layer-group" # иконка
    category = "Объекты" # категория
    category_icon = "fa-solid fa-list" # иконка категории

    page_size = 10
    page_size_options = [10, 25, 50, 100]