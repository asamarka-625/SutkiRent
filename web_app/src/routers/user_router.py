# Внешние зависимости
from typing import Dict
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.responses import JSONResponse
# Внутренние модули
from models import User
from web_app.src.crud import sql_update_user_info
from web_app.src.schemas import UserUpdate
from web_app.src.dependencies import get_current_user_by_access_token, get_data_by_refresh_token, verify_csrf_token


router = APIRouter(
    prefix="/api/user",
    tags=["User"]
)


@router.patch(
    "/update",
    response_class=JSONResponse,
    summary="Получаем список контента"
)
async def update_info_user(
    data: UserUpdate,
    current_user: User = Depends(get_current_user_by_access_token),
    token_data: Dict[str, str] = Depends(get_data_by_refresh_token),
    csrf_user_id: str = Depends(verify_csrf_token)
):
    user_id_str = str(current_user.id)
    if not (user_id_str == token_data["user_id"] == csrf_user_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Token user mismatch")

    await sql_update_user_info(
        user_id=current_user.id,
        data=data
    )

    return {"status": "success"}