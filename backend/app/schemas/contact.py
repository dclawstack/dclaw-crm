from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class ContactCreate(BaseModel):
    customer_id: UUID
    name: str
    email: str | None = None
    phone: str | None = None
    title: str | None = None
    is_primary: bool = False


class ContactUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    title: str | None = None
    is_primary: bool | None = None


class ContactResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    customer_id: UUID
    name: str
    email: str | None
    phone: str | None
    title: str | None
    is_primary: bool
    created_at: datetime
    updated_at: datetime


class ContactListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    items: list[ContactResponse]
    total: int
