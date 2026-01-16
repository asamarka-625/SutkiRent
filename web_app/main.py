# Внешние зависимости
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqladmin import Admin
# Внутренние модули
from web_app.src.core import cfg, setup_database, engine
from web_app.src.routers import router
from web_app.src.admin import ContentAdmin, PhotoContentAdmin, CategoryContentAdmin


async def startup():
    cfg.logger.info("Запускаем приложение...")
    await setup_database()


async def shutdown():
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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Админка
admin = Admin(app, engine)
admin.add_view(CategoryContentAdmin)
admin.add_view(PhotoContentAdmin)
admin.add_view(ContentAdmin)


if __name__ == '__main__':
    import uvicorn
    uvicorn.run('main:app', port=8000, reload=False)