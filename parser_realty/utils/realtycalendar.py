# Внешние зависимости
from typing import List, Optional, Any
from datetime import date
import httpx
from tenacity import retry, stop_after_attempt, wait_exponential
# Внутренние модули
from parser_realty.core import cfg
from parser_realty.schemas import RealtyApartmentResponse, RealtyCalendarResponse


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
        wait=wait_exponential(multiplier=1, min=4, max=10)
    )
    async def _make_request(
        self,
        method: str,
        endpoint: str,
        **kwargs
    ) -> Any:
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            url = f"{self.base_url}{endpoint}"
            response = await client.request(
                method, url, headers=self.headers, **kwargs
            )
            response.raise_for_status()
            return response.json()

    async def get_apartments(
        self,
        begin_date: Optional[date] = None,
        end_date: Optional[date] = None,
        adults: int = 1,
        children: Optional[List[int]] = None,
        apartment_ids: Optional[List[int]] = None,
        page: int = 1
    ) -> RealtyApartmentResponse:
        try:
            data = {
                "begin_date": begin_date.isoformat() if begin_date else None,
                "end_date": end_date.isoformat() if end_date else None,
                "guests": {
                    "adults": adults,
                    "children": children or []
                },
                "apartment_ids": apartment_ids or [],
                "page": page
            }

            cfg.logger.info(f"Request by /apartments (page: {page})")
            response = await self._make_request(
                "POST", "/apartments", json=data
            )

            return RealtyApartmentResponse(**response)

        except Exception as e:
            cfg.logger.error(f"Error fetching apartments: {str(e)}")
            return RealtyApartmentResponse(apartments=[])

    async def get_calendar(
        self,
        apartment_id: int,
        begin_date: date,
        end_date: date,
        adults: int = 1,
        children: Optional[List[int]] = None
    ) -> RealtyCalendarResponse:
        try:
            data = {
                "begin_date": begin_date.isoformat(),
                "end_date": end_date.isoformat(),
                "guests":{
                    "adults": adults,
                    "children": children or []
                },
                "apartment_id": apartment_id
            }

            cfg.logger.info(f"Request by /calendar (apartment_id: {apartment_id})")
            response = await self._make_request(
                "POST", "/calendar", json=data
            )

            return RealtyCalendarResponse(**response)

        except Exception as e:
            cfg.logger.error(f"Error fetching apartments: {str(e)}")
            return RealtyCalendarResponse(calendar=[])


_instance = None


def get_rc_client() -> RealtyCalendarClient:
    global _instance
    if _instance is None:
        _instance = RealtyCalendarClient()

    return _instance