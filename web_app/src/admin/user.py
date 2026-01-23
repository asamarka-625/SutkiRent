# Внешние зависимости
from sqladmin import ModelView
# Внутренние модули
from models import User


# Админка для User
class UserAdmin(ModelView, model=User):
    column_list = [
        User.id,
        User.name,
        User.email,
        User.bonuses,
        User.is_active
    ]

    column_labels = {
        User.id: "Идентификатор",
        User.name: "Имя",
        User.email: "Электронная почта",
        User.bonuses: "Бонусы",
        User.is_active: "Активированный профиль",
        User.phone: "Номер телефона",
        User.surname: "Фамилия",
        User.patronymic: "Отчество",
        User.date_of_birth: "Дата рождения",
        User.about: "Описание",
        User.created_at: "Дата создания",
        User.updated_at: "Дата обновления информации",
        User.favorites: "Избранное"
    }

    column_searchable_list = [User.id, User.email] # список столбцов, которые можно искать
    column_sortable_list = [
        User.id,
    ]  # список столбцов, которые можно сортировать

    column_default_sort = [(User.id, True)]

    column_details_list = [
        User.id,
        User.name,
        User.surname,
        User.patronymic,
        User.date_of_birth,
        User.about,
        User.phone,
        User.email,
        User.bonuses,
        User.is_active,
        User.created_at,
        User.updated_at,
        User.favorites
    ]

    form_edit_rules = [
        "name",
        "surname",
        "patronymic",
        "date_of_birth",
        "about",
        "phone",
        "email",
        "bonuses",
        "is_active"
    ]

    can_create = False # право создавать
    can_edit = True # право редактировать
    can_delete = True # право удалять
    can_view_details = True # право смотреть всю информацию
    can_export = True # право экспортировать

    name = "Пользователь" # название
    name_plural = "Пользователи" # множественное название
    icon = "fa-solid fa-layer-group" # иконка
    category = "Аккаунты" # категория
    category_icon = "fa-solid fa-list" # иконка категории

    page_size = 10
    page_size_options = [10, 25, 50, 100]