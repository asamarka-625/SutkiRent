# Внешние зависимости
from starlette_admin.contrib.sqla import ModelView
from starlette_admin.fields import IntegerField, StringField, DateTimeField, HasMany


# Админка для Brand
class BrandAdmin(ModelView):
    # Настройки отображения
    identity = "brands"
    name = "Бренд"
    label = "Бренды"
    icon = "fa-solid fa-layer-group"

    page_size = 25

    fields = [
        IntegerField("id", label="ID"),
        StringField("title", label="Название"),  # title а не name
        DateTimeField("created_at", label="Дата создания"),
        HasMany(
            "apartment_items",
            identity="apartment_items",
            label="Товары этого бренда",
            display_template="""
            {% if value %}
                <ul>
                {% for item in value %}
                    <li>{{ item.apartment.name }}: {{ item.item.title }} - {{ item.quantity }} шт.</li>
                {% endfor %}
                </ul>
            {% else %}
                —
            {% endif %}
            """
        ),
    ]

    searchable_fields = ["title"]  # search by title
    sortable_fields = ["id", "title", "created_at"]