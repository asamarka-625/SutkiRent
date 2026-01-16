# Внешние зависимости
from fastapi import APIRouter
# Внутренние модули
from web_app.src.routers.object_router import router as object_router
from web_app.src.routers.content_router import router as content_router


router = APIRouter()
router.include_router(object_router)
router.include_router(content_router)