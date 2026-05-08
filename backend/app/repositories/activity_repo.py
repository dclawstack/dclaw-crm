from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.activity import Activity
from app.repositories.base_repo import BaseRepository


class ActivityRepository(BaseRepository[Activity]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, Activity)

    async def update(self, activity: Activity, **kwargs) -> Activity:
        for key, value in kwargs.items():
            if value is not None and hasattr(activity, key):
                setattr(activity, key, value)
        await self.db.commit()
        await self.db.refresh(activity)
        return activity

    async def list_by_customer(
        self, customer_id: UUID, limit: int = 20, offset: int = 0
    ) -> tuple[list[Activity], int]:
        result = await self.db.execute(
            select(Activity)
            .where(Activity.customer_id == customer_id)
            .limit(limit)
            .offset(offset)
        )
        items = list(result.scalars().all())
        count_result = await self.db.execute(
            select(func.count())
            .select_from(Activity)
            .where(Activity.customer_id == customer_id)
        )
        total = count_result.scalar() or 0
        return items, total

    async def list_by_deal(
        self, deal_id: UUID, limit: int = 20, offset: int = 0
    ) -> tuple[list[Activity], int]:
        result = await self.db.execute(
            select(Activity)
            .where(Activity.deal_id == deal_id)
            .limit(limit)
            .offset(offset)
        )
        items = list(result.scalars().all())
        count_result = await self.db.execute(
            select(func.count())
            .select_from(Activity)
            .where(Activity.deal_id == deal_id)
        )
        total = count_result.scalar() or 0
        return items, total
