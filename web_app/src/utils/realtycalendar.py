# Внешние зависимости
from typing import List, Optional, Dict, Any
from datetime import date
import httpx
from tenacity import retry, stop_after_attempt, wait_exponential
# Внутренние модули
from web_app.src.core import cfg


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
    ) -> Dict[str, Any]:
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            url = f"{self.base_url}{endpoint}"
            response = await client.request(
                method, url, headers=self.headers, **kwargs
            )
            response.raise_for_status()
            return response.json()

    async def get_available_apartments(
        self,
        begin_date: Optional[date] = None,
        end_date: Optional[date] = None,
        city: Optional[str] = None,
        page: int = 1,
        adults: int = 1
    ) -> List[Dict[str, Any]]:
        """Get available apartments from RealtyCalendar"""
        try:
            data = {
                "begin_date": begin_date.isoformat() if begin_date else None,
                "end_date": end_date.isoformat() if end_date else None,
                "guests": {
                    "adults": adults,
                    "children": []
                },
                "apartment_ids": [],
                "page": page
            }

            response = await self._make_request(
                "POST", "/apartments", json=data
            )

            apartments = response.get("apartments", [])

            # Filter by city if specified
            if city:
                apartments = [
                    apt for apt in apartments
                    if city.lower() in apt.get("city", {}).get("title", "").lower()
                ]

            return apartments

        except Exception as e:
            cfg.logger.error(f"Error fetching apartments: {str(e)}")
            return []

    async def get_reservation_info(self, reservation_id: str) -> Optional[Dict[str, Any]]:
        """Get reservation info from RealtyCalendar"""
        endpoints = [
            f"/reservations/{reservation_id}",
            f"/reservation/{reservation_id}",
            f"/booking/{reservation_id}",
        ]

        for endpoint in endpoints:
            try:
                data = await self._make_request("GET", endpoint)
                return data
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 404:
                    continue
                raise

        return None

    async def get_apartment_by_id(self, apartment_id: int) -> Optional[Dict[str, Any]]:
        """Get apartment details by ID"""
        try:
            # Try to get from list first
            apartments = await self.get_available_apartments()
            for apt in apartments:
                if apt.get("id") == apartment_id:
                    return apt

            # If not found, try specific endpoint
            data = await self._make_request("GET", f"/apartments/{apartment_id}")
            return data

        except Exception as e:
            cfg.logger.error(f"Error fetching apartment {apartment_id}: {str(e)}")
            return None


_instance = None


def get_rc_client() -> RealtyCalendarClient:
    global _instance
    if _instance is None:
        _instance = RealtyCalendarClient()

    return _instance