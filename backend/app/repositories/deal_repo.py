from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.deal import Deal
from app.repositories.base_repo import BaseRepository


class DealRepository(BaseRepository[Deal]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, Deal)

    async def update(self, deal: Deal, **kwargs) -> Deal:
        for key, value in kwargs.items():
            if value is not None and hasattr(deal, key):
                setattr(deal, key, value)
        await self.db.commit()
        await self.db.refresh(deal)
        return deal

    async def list_by_customer(
        self, customer_id: UUID, limit: int = 20, offset: int = 0
    ) -> tuple[list[Deal], int]:
        result = await self.db.execute(
            select(Deal).where(Deal.customer_id == customer_id).limit(limit).offset(offset)
        )
        items = list(result.scalars().all())
        count_result = await self.db.execute(
            select(func.count()).select_from(Deal).where(Deal.customer_id == customer_id)
        )
        total = count_result.scalar() or 0
        return items, total

    async def list_by_stage(
        self, stage: str, limit: int = 20, offset: int = 0
    ) -> tuple[list[Deal], int]:
        result = await self.db.execute(
            select(Deal).where(Deal.stage == stage).limit(limit).offset(offset)
        )
        items = list(result.scalars().all())
        count_result = await self.db.execute(
            select(func.count()).select_from(Deal).where(Deal.stage == stage)
        )
        total = count_result.scalar() or 0
        return items, total
