# Внешние зависимости
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqladmin import Admin
from prometheus_fastapi_instrumentator import Instrumentator
# Внутренние модули
from web_app.src.core import cfg, setup_database, engine
from web_app.src.routers import router
from web_app.src.admin import (ContentAdmin, PhotoContentAdmin, CategoryContentAdmin, ApartmentAdmin,
                               MetroStationAdmin, CityAdmin, RegionAdmin, PhotoApartmentAdmin, UserAdmin,
                               ServiceAdmin, TypeApartmentAdmin, BathroomAdmin, ItemAdmin, WindowAdmin,
                               ParkingAdmin, ApartmentItemAdmin, BrandAdmin, OrderAdmin,
                               ContactAdmin, authentication_backend)
from web_app.src.utils import redis_service


async def startup():
    cfg.logger.info("Запускаем приложение...")

    cfg.logger.info("Инициализируем базу данных")
    await setup_database()

    cfg.logger.info("Инициализируем redis")
    await redis_service.init_redis()


async def shutdown():
    cfg.logger.info("Закрываем соединение с redis")
    await redis_service.close_redis()

    await engine.dispose()
    cfg.logger.info("Ресурсы освобождены")

    cfg.logger.info("Останавливаем приложение...")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup логика
    await startup()
    yield
    # Shutdown логика
    await shutdown()


app = FastAPI(lifespan=lifespan)

# Подключение маршрутов
app.include_router(router)

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=cfg.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "OPTIONS"],
    allow_headers=[
        "Accept",
        "Accept-Language",
        "Authorization",
        "Content-Type",
        "Content-Language",
        "Origin",
        "Referer",
        "User-Agent",
        "X-CSRF-Token",
        "X-Requested-With",
    ],
    max_age=600
)

"""
# Admin Starlette
from starlette_admin.contrib.sqla import Admin

admin = Admin(
    engine=engine,
    title="Панель управления",
    base_url="/admin",  # URL админки
    route_name="admin",
    # auth_provider=BasicAuthProvider(),  # если нужна аутентификация
    # middlewares=[Middleware(SessionMiddleware, secret_key="secret")],
    # templates_dir=None,  # можно указать свой кастомный шаблон
    # logo_url=None,  # URL логотипа
    # login_logo_url=None,  # URL логотипа на странице входа
)

admin.add_view(ApartmentAdmin(Apartment))
admin.add_view(BathroomAdmin(Bathroom))
admin.add_view(BrandAdmin(Brand))
admin.add_view(CityAdmin(City))
admin.add_view(ApartmentItemAdmin(ApartmentItem))
admin.add_view(ItemAdmin(Item))
admin.add_view(RegionAdmin(Region))
admin.add_view(ServiceAdmin(Service))
admin.add_view(TypeApartmentAdmin(TypeApartment))
admin.add_view(WindowAdmin(Window))

# Монтируем админку к приложению
admin.mount_to(app)
"""

# Метрики /metrics
instrumentator = Instrumentator()
instrumentator.instrument(app).expose(app)

# Админка
admin = Admin(app, engine, authentication_backend=authentication_backend)
admin.add_view(CategoryContentAdmin)
admin.add_view(PhotoContentAdmin)
admin.add_view(ContentAdmin)
admin.add_view(ApartmentAdmin)
admin.add_view(MetroStationAdmin)
admin.add_view(CityAdmin)
admin.add_view(RegionAdmin)
admin.add_view(PhotoApartmentAdmin)
admin.add_view(UserAdmin)
admin.add_view(ServiceAdmin)
admin.add_view(TypeApartmentAdmin)
admin.add_view(BathroomAdmin)
admin.add_view(ItemAdmin)
admin.add_view(BrandAdmin)
admin.add_view(OrderAdmin)
admin.add_view(ApartmentItemAdmin)
admin.add_view(WindowAdmin)
admin.add_view(ContactAdmin)
admin.add_view(ParkingAdmin)


if __name__ == '__main__':
    import uvicorn
    uvicorn.run('main:app', port=8000, reload=False)