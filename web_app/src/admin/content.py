# Внешние зависимости
from sqladmin import ModelView
# Внутренние модули
from models import CategoryContent, Content, PhotoContent


# Админка для CategoryContent
class CategoryContentAdmin(ModelView, model=CategoryContent):
    column_list = [CategoryContent.id, CategoryContent.title]
    column_labels = {
        CategoryContent.id: "Идентификатор",
        CategoryContent.title: "Название"
    }

    column_searchable_list = [CategoryContent.id] # список столбцов, которые можно искать
    column_sortable_list = [CategoryContent.id]  # список столбцов, которые можно сортировать
    column_default_sort = [(CategoryContent.id, True)]

    form_create_rules = [
        'title'
    ]

    column_details_list = [CategoryContent.id, CategoryContent.title]

    form_edit_rules = [
        "title"
    ]

    can_create = True # право создавать
    can_edit = True # право редактировать
    can_delete = True # право удалять
    can_view_details = True # право смотреть всю информацию
    can_export = True # право экспортировать

    name = "Категория контента" # название
    name_plural = "Категории контента" # множественное название
    icon = "fa-solid fa-layer-group" # иконка
    category = "Контент" # категория
    category_icon = "fa-solid fa-list" # иконка категории

    page_size = 10
    page_size_options = [10, 25, 50, 100]


# Админка фотографий контента
class PhotoContentAdmin(ModelView, model=PhotoContent):
    column_list = [
        PhotoContent.id,
        PhotoContent.url,
        PhotoContent.order,
        PhotoContent.content
    ]

    column_labels = {
        PhotoContent.id: "Идентификатор",
        PhotoContent.url: "Ссылка",
        PhotoContent.order: "Порядок отображения",
        PhotoContent.created_at: "Дата создания",
        PhotoContent.content: "Прикреплено"
    }

    column_searchable_list = [PhotoContent.id] # список столбцов, которые можно искать
    column_sortable_list = [PhotoContent.id]  # список столбцов, которые можно сортировать
    column_default_sort = [(PhotoContent.id, True)]

    form_create_rules = [
        'url',
        'order',
        'content'
    ]

    column_details_list = [
        PhotoContent.id,
        PhotoContent.url,
        PhotoContent.order,
        PhotoContent.created_at,
        PhotoContent.content
    ]

    form_edit_rules = [
        'url',
        'order',
        'content'
    ]

    can_create = True # право создавать
    can_edit = True # право редактировать
    can_delete = True # право удалять
    can_view_details = True # право смотреть всю информацию
    can_export = True # право экспортировать

    name = "Изображение контента" # название
    name_plural = "Изображения контента" # множественное название
    icon = "fa-solid fa-layer-group" # иконка
    category = "Контент" # категория
    category_icon = "fa-solid fa-list" # иконка категории

    page_size = 10
    page_size_options = [10, 25, 50, 100]


# Админка контента
class ContentAdmin(ModelView, model= Content):
    column_list = [
        Content.id,
        Content.title,
        Content.category
    ]

    column_labels = {
        Content.id: "Идентификатор",
        Content.title: "Название",
        Content.short_description: "Краткое описание",
        Content.content: "Содержание",
        Content.created_at: "Дата создания",
        Content.category: "Категория"
    }

    column_searchable_list = [Content.id] # список столбцов, которые можно искать
    column_sortable_list = [Content.id, Content.created_at]  # список столбцов, которые можно сортировать
    column_default_sort = [(Content.id, True)]

    form_create_rules = [
        'title',
        'short_description',
        'content',
        'category'
    ]

    column_details_list = [
        Content.id,
        Content.title,
        Content.short_description,
        Content.content,
        Content.created_at,
        Content.category
    ]

    form_edit_rules = [
        'title',
        'short_description',
        'content',
        'category'
    ]

    can_create = True # право создавать
    can_edit = True # право редактировать
    can_delete = True # право удалять
    can_view_details = True # право смотреть всю информацию
    can_export = True # право экспортировать

    name = "Контент" # название
    name_plural = "Контент" # множественное название
    icon = "fa-solid fa-layer-group" # иконка
    category = "Контент" # категория
    category_icon = "fa-solid fa-list" # иконка категории

    page_size = 10
    page_size_options = [10, 25, 50, 100]