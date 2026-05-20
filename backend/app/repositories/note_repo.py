from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.note import Note
from app.repositories.base_repo import BaseRepository


class NoteRepository(BaseRepository[Note]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, Note)

    async def update(self, note: Note, **kwargs) -> Note:
        for key, value in kwargs.items():
            if hasattr(note, key):
                setattr(note, key, value)
        await self.db.commit()
        await self.db.refresh(note)
        return note

    async def list_by_customer(
        self, customer_id: UUID, limit: int = 50, offset: int = 0
    ) -> tuple[list[Note], int]:
        result = await self.db.execute(
            select(Note).where(Note.customer_id == customer_id).order_by(Note.created_at.desc()).limit(limit).offset(offset)
        )
        items = list(result.scalars().all())
        count_result = await self.db.execute(
            select(func.count()).select_from(Note).where(Note.customer_id == customer_id)
        )
        return items, count_result.scalar() or 0

    async def list_by_deal(
        self, deal_id: UUID, limit: int = 50, offset: int = 0
    ) -> tuple[list[Note], int]:
        result = await self.db.execute(
            select(Note).where(Note.deal_id == deal_id).order_by(Note.created_at.desc()).limit(limit).offset(offset)
        )
        items = list(result.scalars().all())
        count_result = await self.db.execute(
            select(func.count()).select_from(Note).where(Note.deal_id == deal_id)
        )
        return items, count_result.scalar() or 0
