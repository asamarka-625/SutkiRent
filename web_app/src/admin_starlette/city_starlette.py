# Внешние зависимости
from starlette_admin.contrib.sqla import ModelView
from starlette_admin.fields import IntegerField, StringField, HasOne, HasMany
from starlette_admin.exceptions import ActionFailed
import sqlalchemy as sa
# Внутренние модули
from web_app.src.crud import sql_upd_region_for_apartments


# Админка для City
class CityAdmin(ModelView):
    identity = "cities"
    name = "Город"
    label = "Города"

    page_size = 10

    fields = [
        IntegerField("id", label="ID"),
        IntegerField("external_id", label="Внешний ID"),
        StringField("title", label="Название"),
        HasOne("region", identity="regions", label="Регион"),
        HasMany("apartments", identity="apartments", label="Объекты")
    ]

    searchable_fields = ["external_id", "title", "region.name"]
    sortable_fields = ["id", "external_id", "title", "region.name"]

    edit_fields = ["region"]

    async def edit(self, request, pk, data):
        """Редактирование с кастомной логикой"""
        async with self.session_factory() as session:
            # Получаем город
            stmt = sa.select(self.model).where(self.model.id == int(pk))
            result = await session.execute(stmt)
            city = result.scalar_one_or_none()

            if not city:
                raise ActionFailed(f"Город с ID {pk} не найден")

            # Получаем и валидируем регион
            region_id = data.get("region")
            if region_id:
                if isinstance(region_id, str) and not region_id.isdigit():
                    raise ActionFailed("Неверно выбран регион!")

                region_id = int(region_id) if isinstance(region_id, str) else region_id
                city.region_id = region_id

                # Вызываем кастомную функцию
                await sql_upd_region_for_apartments(
                    city_id=city.id,
                    region_id=region_id
                )

                await session.commit()

            return pk