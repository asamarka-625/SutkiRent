# Внешние зависимости
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqladmin import Admin
# Внутренние модули
from web_app.src.core import cfg, setup_database, engine
from web_app.src.routers import router
from web_app.src.admin import (ContentAdmin, PhotoContentAdmin, CategoryContentAdmin, ApartmentAdmin,
                               MetroStationAdmin, CityAdmin, RegionAdmin, PhotoApartmentAdmin, UserAdmin)
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
# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins="*", # cfg.ALLOWED_ORIGINS,
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

# Админка
admin = Admin(app, engine)
admin.add_view(CategoryContentAdmin)
admin.add_view(PhotoContentAdmin)
admin.add_view(ContentAdmin)
admin.add_view(ApartmentAdmin)
admin.add_view(MetroStationAdmin)
admin.add_view(CityAdmin)
admin.add_view(RegionAdmin)
admin.add_view(PhotoApartmentAdmin)
admin.add_view(UserAdmin)


if __name__ == '__main__':
    import uvicorn
    uvicorn.run('main:app', port=8000, reload=False)