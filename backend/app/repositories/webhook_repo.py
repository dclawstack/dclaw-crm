from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.webhook import WebhookEndpoint, WebhookDelivery
from app.repositories.base_repo import BaseRepository


class WebhookEndpointRepository(BaseRepository[WebhookEndpoint]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, WebhookEndpoint)

    async def list_active(self) -> list[WebhookEndpoint]:
        result = await self.db.execute(
            select(WebhookEndpoint).where(WebhookEndpoint.active.is_(True))
        )
        return list(result.scalars().all())


class WebhookDeliveryRepository(BaseRepository[WebhookDelivery]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, WebhookDelivery)

    async def list_by_endpoint(
        self, endpoint_id: UUID, limit: int = 10
    ) -> list[WebhookDelivery]:
        result = await self.db.execute(
            select(WebhookDelivery)
            .where(WebhookDelivery.endpoint_id == endpoint_id)
            .order_by(WebhookDelivery.created_at.desc())
            .limit(limit)
        )
        return list(result.scalars().all())
