from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.contact import Contact
from app.repositories.base_repo import BaseRepository


class ContactRepository(BaseRepository[Contact]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, Contact)

    async def update(self, contact: Contact, **kwargs) -> Contact:
        for key, value in kwargs.items():
            if hasattr(contact, key):
                setattr(contact, key, value)
        await self.db.commit()
        await self.db.refresh(contact)
        return contact

    async def list_by_customer(
        self, customer_id: UUID, limit: int = 50, offset: int = 0
    ) -> tuple[list[Contact], int]:
        result = await self.db.execute(
            select(Contact).where(Contact.customer_id == customer_id).limit(limit).offset(offset)
        )
        items = list(result.scalars().all())
        count_result = await self.db.execute(
            select(func.count()).select_from(Contact).where(Contact.customer_id == customer_id)
        )
        return items, count_result.scalar() or 0

    async def set_primary(self, customer_id: UUID, contact_id: UUID) -> None:
        all_contacts = await self.db.execute(
            select(Contact).where(Contact.customer_id == customer_id)
        )
        for c in all_contacts.scalars().all():
            c.is_primary = c.id == contact_id
        await self.db.commit()
