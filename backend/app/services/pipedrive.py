import logging
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)

PIPEDRIVE_BASE = "https://api.pipedrive.com/v1"


class PipedriveService:
    def __init__(self, api_token: str | None = None):
        self.api_token = api_token or settings.PIPEDRIVE_API_TOKEN

    def _params(self) -> dict:
        return {"api_token": self.api_token}

    async def get_persons(self, limit: int = 100, start: int = 0) -> list[dict]:
        if not self.api_token:
            return []
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                f"{PIPEDRIVE_BASE}/persons",
                params={**self._params(), "limit": limit, "start": start},
            )
            resp.raise_for_status()
            data = resp.json()
            return data.get("data") or []

    async def create_person(self, name: str, email: str, phone: str | None = None) -> dict | None:
        if not self.api_token:
            return None
        payload = {"name": name, "email": [{"value": email, "primary": True}]}
        if phone:
            payload["phone"] = [{"value": phone, "primary": True}]
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                f"{PIPEDRIVE_BASE}/persons",
                params=self._params(),
                json=payload,
            )
            resp.raise_for_status()
            return resp.json().get("data")

    async def create_deal(self, title: str, person_id: int, value: float | None = None) -> dict | None:
        if not self.api_token:
            return None
        payload = {"title": title, "person_id": person_id}
        if value is not None:
            payload["value"] = value
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                f"{PIPEDRIVE_BASE}/deals",
                params=self._params(),
                json=payload,
            )
            resp.raise_for_status()
            return resp.json().get("data")

    async def get_deals(self, limit: int = 100, start: int = 0) -> list[dict]:
        if not self.api_token:
            return []
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                f"{PIPEDRIVE_BASE}/deals",
                params={**self._params(), "limit": limit, "start": start},
            )
            resp.raise_for_status()
            return resp.json().get("data") or []

    async def update_deal_stage(self, deal_id: int, stage_id: int) -> dict | None:
        if not self.api_token:
            return None
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.put(
                f"{PIPEDRIVE_BASE}/deals/{deal_id}",
                params=self._params(),
                json={"stage_id": stage_id},
            )
            resp.raise_for_status()
            return resp.json().get("data")

    async def add_note(self, deal_id: int, content: str) -> dict | None:
        if not self.api_token:
            return None
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                f"{PIPEDRIVE_BASE}/notes",
                params=self._params(),
                json={"content": content, "deal_id": deal_id},
            )
            resp.raise_for_status()
            return resp.json().get("data")


pipedrive_service = PipedriveService()
