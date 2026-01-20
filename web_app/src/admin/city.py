# Внешние зависимости
from sqladmin import ModelView
from wtforms.validators import ValidationError
# Внутренние модули
from models import City
from web_app.src.crud import sql_upd_region_for_apartments


# Админка для City
class CityAdmin(ModelView, model=City):
    column_list = [
        City.id,
        City.external_id,
        City.title
    ]

    column_labels = {
        City.id: "Идентификатор",
        City.external_id: "Внутренний ID",
        City.title: "Название",
        City.region: "Регион",
        City.apartments: "Объекты",
        City.created_at: "Дата создания"
    }

    column_searchable_list = [City.external_id] # список столбцов, которые можно искать
    column_sortable_list = [
        City.id,
        City.external_id
    ]  # список столбцов, которые можно сортировать

    column_default_sort = [(City.id, True)]

    column_details_list = [
        City.id,
        City.external_id,
        City.title,
        City.region,
        City.apartments,
        City.created_at
    ]

    form_edit_rules = [
        "region"
    ]

    async def on_model_change(self, data, model, is_created, request):
        if not isinstance(data['region'], int) and not data['region'].isdigit():
            raise ValidationError(f"Неверно выбран регион!")

        await sql_upd_region_for_apartments(
            city_id=model.id,
            region_id=int(data["region"])
        )

    can_create = False # право создавать
    can_edit = True # право редактировать
    can_delete = False # право удалять
    can_view_details = True # право смотреть всю информацию
    can_export = True # право экспортировать

    name = "Город" # название
    name_plural = "Города" # множественное название
    icon = "fa-solid fa-layer-group" # иконка
    category = "Объекты" # категория
    category_icon = "fa-solid fa-list" # иконка категории

    page_size = 10
    page_size_options = [10, 25, 50, 100]