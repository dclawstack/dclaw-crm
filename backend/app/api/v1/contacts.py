from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.repositories.contact_repo import ContactRepository
from app.schemas.contact import ContactCreate, ContactUpdate, ContactResponse, ContactListResponse
from app.models.contact import Contact

router = APIRouter()


@router.get("/customers/{customer_id}/contacts/", response_model=ContactListResponse)
async def list_contacts(
    customer_id: UUID,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    repo = ContactRepository(db)
    items, total = await repo.list_by_customer(customer_id, limit, offset)
    return ContactListResponse(items=items, total=total)


@router.post("/customers/{customer_id}/contacts/", response_model=ContactResponse, status_code=201)
async def create_contact(
    customer_id: UUID,
    data: ContactCreate,
    db: AsyncSession = Depends(get_db),
):
    repo = ContactRepository(db)
    contact = Contact(
        customer_id=customer_id,
        name=data.name,
        email=data.email,
        phone=data.phone,
        title=data.title,
        is_primary=data.is_primary,
    )
    created = await repo.create(contact)
    if data.is_primary:
        await repo.set_primary(customer_id, created.id)
        await db.refresh(created)
    return created


@router.put("/contacts/{contact_id}", response_model=ContactResponse)
async def update_contact(
    contact_id: UUID,
    data: ContactUpdate,
    db: AsyncSession = Depends(get_db),
):
    repo = ContactRepository(db)
    contact = await repo.get_by_id(contact_id)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    update_data = {k: v for k, v in data.model_dump(exclude_unset=True).items() if v is not None}
    updated = await repo.update(contact, **update_data)
    if data.is_primary:
        await repo.set_primary(contact.customer_id, contact_id)
        await db.refresh(updated)
    return updated


@router.delete("/contacts/{contact_id}", status_code=204)
async def delete_contact(contact_id: UUID, db: AsyncSession = Depends(get_db)):
    repo = ContactRepository(db)
    contact = await repo.get_by_id(contact_id)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    await repo.delete(contact)
