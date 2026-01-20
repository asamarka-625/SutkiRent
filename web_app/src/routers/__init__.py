# Внешние зависимости
from fastapi import APIRouter
# Внутренние модули
from web_app.src.routers.apartment_router import router as apartment_router
from web_app.src.routers.content_router import router as content_router
from web_app.src.routers.auth_router import router as auth_router
from web_app.src.routers.user_router import router as user_router


router = APIRouter()
router.include_router(apartment_router)
router.include_router(content_router)
router.include_router(auth_router)
router.include_router(user_router)