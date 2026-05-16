from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class NoteCreate(BaseModel):
    content: str
    customer_id: UUID | None = None
    deal_id: UUID | None = None


class NoteUpdate(BaseModel):
    content: str | None = None


class NoteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    content: str
    customer_id: UUID | None
    deal_id: UUID | None
    created_at: datetime
    updated_at: datetime


class NoteListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    items: list[NoteResponse]
    total: int
