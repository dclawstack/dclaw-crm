from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.customer import Customer
from app.repositories.base_repo import BaseRepository


class CustomerRepository(BaseRepository[Customer]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, Customer)

    async def update(self, customer: Customer, **kwargs) -> Customer:
        for key, value in kwargs.items():
            if value is not None and hasattr(customer, key):
                setattr(customer, key, value)
        await self.db.commit()
        await self.db.refresh(customer)
        return customer

    async def get_by_email(self, email: str) -> Customer | None:
        result = await self.db.execute(
            select(Customer).where(Customer.email == email)
        )
        return result.scalar_one_or_none()
