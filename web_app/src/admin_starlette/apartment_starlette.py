# Внешние зависимости
from starlette_admin.contrib.sqla import ModelView
from starlette_admin.fields import (
    IntegerField,
    StringField,
    FloatField,
    BooleanField,
    TextAreaField,
    JSONField,
    HasOne,
    HasMany,
    EnumField
)
# Внутренние модули
from web_app.src.core import cfg


# Админка для Apartment
class ApartmentAdmin(ModelView):
    identity = "apartments"
    name = "Объект"
    label = "Объекты"

    page_size = 10

    fields = [
        # Основные ID
        IntegerField("id", label="Идентификатор"),
        IntegerField("external_id", label="Внутренний ID"),

        # Название и описание
        StringField("title", label="Название"),
        TextAreaField("description", label="Описание"),

        # Локация
        HasOne("region_rel", identity="regions", label="Регион"),
        HasOne("city_rel", identity="cities", label="Город"),
        HasOne("apartment_type", identity="apartment_types", label="Тип жилья"),
        StringField("address", label="Адрес"),
        FloatField("latitude", label="Локация (широта)"),
        FloatField("longitude", label="Локация (долгота)"),

        # Характеристики
        IntegerField("rooms", label="Комнаты"),
        StringField("sleeps", label="Формат спальных мест"),
        IntegerField("floor", label="Этаж"),
        FloatField("area", label="Площадь м2"),

        # Вместимость
        IntegerField("capacity", label="Вместимость (кол-во человек)"),
        IntegerField("max_children_count", label="Максимальная допустимость детей"),

        # Надбавки
        IntegerField("increase_capacity", label="Надбавка к цене от кол-во жильцов"),
        IntegerField("increase_capacity_price", label="Надбавочная цена за кол-во жильцов"),

        # Статусы
        EnumField("availability", label="Доступность", choices=[
            ("available", "Доступно"),
            ("booked", "Забронировано"),
            ("maintenance", "На обслуживании")
        ]),
        IntegerField("priority", label="Приоритет"),
        BooleanField("visibility", label="Видимость"),

        # Цены
        FloatField("price_without_discount", label="Цена без скидки"),
        FloatField("price_with_discount", label="Цена со скидкой"),
        IntegerField("discount_percent", label="Скидка (%)"),
        JSONField("price_details", label="Детали цены"),

        # Ограничения
        IntegerField("min_stay", label="Минимальное пребывания (дней)"),

        # Связи (многие ко многим и один ко многим)
        HasMany(
            "windows",
            identity="windows",
            label="Вид из окна"
        ),

        HasMany(
            "bathrooms",
            identity="bathrooms",
            label="Тип санузла"
        ),

        HasMany(
            "services",
            identity="services",
            label="Услуги"
        ),

        HasMany(
            "apartment_items",
            identity="apartment_items",
            label="Предметы"
        ),
    ]

    """
    HasMany(
        "metro_stations",
        identity="metro_stations",
        label="Метро"
    ),

    HasMany(
        "photos",
        identity="photos",
        label="Фотографии"
    ),

    HasMany(
        "price_history",
        identity="price_history",
        label="История цен"
    ),
    """

    # Поля для поиска
    searchable_fields = [
        "title",
        "address",
        "external_id",
        "city_rel.name",
        "region_rel.name",
        "metro_stations.name"
    ]

    # Поля для сортировки
    sortable_fields = [
        "id",
        "external_id",
        "title",
        "address",
        "priority",
        "visibility",
        "price_without_discount",
        "created_at",
        "city_rel.name",
        "region_rel.name"
    ]

    # Поля для списка (что показывать в таблице)
    fields_default = [
        IntegerField("id", label="ID"),
        IntegerField("external_id", label="Внешний ID"),
        StringField("title", label="Название"),
        StringField("address", label="Адрес"),
        HasOne("city_rel", identity="cities", label="Город"),
        HasOne("region_rel", identity="regions", label="Регион"),
        IntegerField("priority", label="Приоритет"),
        BooleanField("visibility", label="Видимость"),
        FloatField("price_without_discount", label="Цена")
    ]

    # Поля для создания (недоступно, т.к. can_create=False)
    create_fields = []  # can_create=False, поэтому пусто

    # Поля для редактирования
    edit_fields = [
        "apartment_type",
        "windows",
        "bathrooms",
        "priority",
        "visibility",
        "region_rel",
        "city_rel",
        "increase_capacity",
        "increase_capacity_price",
        "title",
        "description",
        "address",
        "rooms",
        "sleeps",
        "floor",
        "area",
        "capacity",
        "max_children_count",
        "availability",
        "price_without_discount",
        "price_with_discount",
        "discount_percent",
        "price_details",
        "min_stay",
        "metro_stations",
        "services"
    ]

    # Сортировка по умолчанию
    default_sort = [("id", True)]

    # Кастомное отображение полей
    async def serialize_field_value(self, value, field, obj, request):
        """Кастомная сериализация для сложных полей"""
        try:
            if field.name == "price_without_discount":
                return f"{value:.2f} ₽" if value else "—"

            elif field.name == "price_with_discount":
                return f"{value:.2f} ₽" if value else "—"

            elif field.name == "discount_percent":
                return f"{value}%" if value else "0%"

            elif field.name == "area":
                return f"{value:.1f} м²" if value else "—"

            elif field.name == "availability":
                status_map = {
                    "available": "✅ Доступно",
                    "booked": "📅 Забронировано",
                    "maintenance": "🔧 Обслуживание"
                }
                return status_map.get(value, value)

            elif field.name == "visibility":
                return "✅ Да" if value else "❌ Нет"

            return await super().serialize_field_value(value, field, obj, request)

        except Exception as e:
            # Логируем ошибку для отладки
            cfg.logger.error(f"[Admin] Error serializing field {field.name}: {e}")
            return "❌ Ошибка"