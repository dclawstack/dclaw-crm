from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict

from app.schemas.common import DealSummary, ActivitySummary


class CustomerCreate(BaseModel):
    name: str
    email: str
    phone: str | None = None
    company: str | None = None
    status: str = "lead"
    notes: str | None = None


class CustomerUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    company: str | None = None
    status: str | None = None
    notes: str | None = None


class CustomerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    email: str
    phone: str | None
    company: str | None
    status: str
    notes: str | None
    created_at: datetime
    updated_at: datetime
    deals: list[DealSummary] = []
    activities: list[ActivitySummary] = []


class CustomerListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    items: list[CustomerResponse]
    total: int
