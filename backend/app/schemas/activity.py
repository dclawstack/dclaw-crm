from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict

from app.schemas.common import CustomerSummary, DealSummary


class ActivityCreate(BaseModel):
    customer_id: UUID
    deal_id: UUID | None = None
    activity_type: str
    description: str
    scheduled_at: datetime | None = None
    completed: bool = False


class ActivityUpdate(BaseModel):
    customer_id: UUID | None = None
    deal_id: UUID | None = None
    activity_type: str | None = None
    description: str | None = None
    scheduled_at: datetime | None = None
    completed: bool | None = None


class ActivityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    customer_id: UUID
    deal_id: UUID | None
    activity_type: str
    description: str
    scheduled_at: datetime | None
    completed: bool
    created_at: datetime
    updated_at: datetime
    customer: CustomerSummary
    deal: DealSummary | None = None


class ActivityListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    items: list[ActivityResponse]
    total: int
