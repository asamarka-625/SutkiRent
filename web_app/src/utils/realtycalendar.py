# Внешние зависимости
from typing import Dict, Any
import httpx
from tenacity import (retry, stop_after_attempt, wait_exponential,
                      retry_if_exception_type, retry_if_exception)
from fastapi import HTTPException
# Внутренние модули
from web_app.src.core import cfg
from web_app.src.schemas import CreateBookingRequest, PriceBookingRequest, CalendarBookingRequest


def is_server_error(exception) -> bool:
    """Проверяем, является ли ошибка ошибкой сервера (5xx)"""
    return (
            isinstance(exception, httpx.HTTPStatusError) and
            exception.response.status_code >= 500
    )


class RealtyCalendarClient:
    def __init__(self):
        self.base_url = cfg.RC_API_URL
        self.headers = {
            'Accept': '*/*',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
            'Content-Type': 'application/json',
            'Origin': 'https://homereserve.ru',
            'Referer': 'https://homereserve.ru/',
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36',
        }
        self.timeout = httpx.Timeout(cfg.RC_TIMEOUT)

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=4, max=10),
        retry=(
                retry_if_exception_type((httpx.NetworkError,)) |
                retry_if_exception(is_server_error)
        ),
        reraise=True
    )
    async def _make_request(
        self,
        method: str,
        endpoint: str,
        **kwargs
    ) -> Dict[str, Any]:
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            url = f"{self.base_url}{endpoint}"
            response = await client.request(
                method, url, headers=self.headers, **kwargs
            )
            response.raise_for_status()
            return response.json()

    async def create_booking(
        self,
        data: CreateBookingRequest
    ) -> Dict[str, Any]:
        try:
            data = {
                "apartment_id": data.apartment_id,
                "begin_date": data.begin_date.isoformat() if data.begin_date else None,
                "end_date": data.end_date.isoformat() if data.end_date else None,
                "phone": data.phone,
                "first_name": data.first_name,
                "last_name": data.last_name,
                "guests": data.guests.model_dump(),
                "email": data.email,
                "wish": data.wish,
                "redirect_url": "/"
            }

            response = await self._make_request(
                "POST", "/confirm", json=data
            )

            return response

        except httpx.HTTPStatusError as e:
            try:
                error_detail = e.response.json()

            except (ValueError, UnicodeDecodeError):
                error_detail = e.response.text or "Internal Server Error"

            cfg.logger.error(f"HTTPStatusError error create booking [{e.response.status_code}]: {error_detail}")
            if e.response.status_code == 500:
                raise HTTPException(status_code=500, detail="The service is temporarily unavailable")

            raise HTTPException(
                status_code=e.response.status_code,
                detail=error_detail
            )

        except Exception as e:
            cfg.logger.error(f"Unexpected error create booking: {e}")
            return {}

    async def get_price_booking(
        self,
        data: PriceBookingRequest
    ) -> Dict[str, Any]:
        try:
            data = {
                "apartment_id": data.apartment_id,
                "arrival_time": data.arrival_time.isoformat(timespec='minutes') if data.arrival_time else None,
                "begin_date": data.begin_date.isoformat() if data.begin_date else None,
                "departure_time": data.departure_time.isoformat(timespec='minutes') if data.departure_time else None,
                "end_date": data.end_date.isoformat() if data.end_date else None,
                "guests": data.guests.model_dump()
            }

            response = await self._make_request(
                "POST", "/price", json=data
            )

            return response

        except httpx.HTTPStatusError as e:
            try:
                error_detail = e.response.json()

            except (ValueError, UnicodeDecodeError):
                error_detail = e.response.text or "Internal Server Error"

            cfg.logger.error(f"HTTPStatusError error get price booking [{e.response.status_code}]: {error_detail}")
            if e.response.status_code == 500:
                raise HTTPException(status_code=500, detail="The service is temporarily unavailable")

            raise HTTPException(
                status_code=e.response.status_code,
                detail=error_detail
            )

        except Exception as e:
            cfg.logger.error(f"Unexpected error get price booking: {e}")
            return {}

    async def get_calendar_booking(
        self,
        data: CalendarBookingRequest
    ) -> Dict[str, Any]:
        try:
            data = {
                "apartment_id": data.apartment_id,
                "begin_date": data.begin_date.isoformat() if data.begin_date else None,
                "end_date": data.end_date.isoformat() if data.end_date else None,
                "guests": data.guests.model_dump()
            }

            response = await self._make_request(
                "POST", "/calendar", json=data
            )

            return response

        except httpx.HTTPStatusError as e:
            try:
                error_detail = e.response.json()

            except (ValueError, UnicodeDecodeError):
                error_detail = e.response.text or "Internal Server Error"

            cfg.logger.error(f"HTTPStatusError error get calendar booking [{e.response.status_code}]: {error_detail}")
            if e.response.status_code == 500:
                raise HTTPException(status_code=500, detail="The service is temporarily unavailable")

            raise HTTPException(
                status_code=e.response.status_code,
                detail=error_detail
            )

        except Exception as e:
            cfg.logger.error(f"Unexpected error get calendar booking: {e}")
            return {}


_instance = None


def get_rc_client() -> RealtyCalendarClient:
    global _instance
    if _instance is None:
        _instance = RealtyCalendarClient()

    return _instance