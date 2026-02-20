# Внешние зависимости
from starlette_admin.contrib.sqla import ModelView
from starlette_admin.fields import (
    IntegerField,
    FloatField,
    HasOne
)
# Внутренние модули
from web_app.src.core import cfg


# Админка для ApartmentItem
class ApartmentItemAdmin(ModelView):
    # Настройки отображения
    identity = "apartment_items"
    name = "Предмет на объекте"
    label = "Предметы на объектах"

    # Пагинация
    page_size = 10

    fields = [
        # Связь с объектом (apartment)
        HasOne(
            "apartment",  # имя поля в модели
            identity="apartments",  # identity связанной модели
            label="Объект",
            required=True
        ),

        # Связь с предметом (item)
        HasOne(
            "item",
            identity="items",
            label="Предмет",
            required=True
        ),

        # Связь с предметом (brand)
        HasOne(
            "brand",
            identity="brands",
            label="Бренд",
            required=True
        ),

        IntegerField("quantity", label="Количество"),
        FloatField("price", label="Цена (1 шт.)")
    ]

    # Поля для поиска (по связанным моделям)
    searchable_fields = [
        "apartment.name",  # поиск по названию объекта
        "item.title",  # поиск по названию предмета
        "brand.name",  # поиск по названию бренда
        "apartment.address"  # можно добавить другие поля
    ]

    # Поля для сортировки
    sortable_fields = [
        "apartment.name",
        "item.title",
        "brand.name",
        "quantity",
        "price"
    ]

    # Сортировка по умолчанию
    default_sort = [("price", True)]

    # Дополнительные настройки
    exclude_fields_from_list = []  # Поля, исключенные из списка
    exclude_fields_from_detail = []  # Поля, исключенные из детального просмотра

    # Кастомное отображение для списка
    async def serialize_field_value(self, value, field, obj, request):
        """Кастомная сериализация полей"""
        try:
            if field.name == "quantity":
                return f"{value} шт." if value is not None else "—"

            elif field.name == "price":
                if value is not None:
                    return f"{float(value):.2f} ₽"
                return "—"


            return await super().serialize_field_value(value, field, obj, request)

        except Exception as e:
            # Логируем ошибку для отладки
            cfg.logger.error(f"[Admin] Error serializing field {field.name}: {e}")
            return "❌ Ошибка"
