from uuid import UUID
from datetime import datetime, date
from pydantic import BaseModel, ConfigDict


class CustomerSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    email: str
    phone: str | None
    company: str | None
    status: str
    created_at: datetime


class DealSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    value: float
    stage: str
    probability: int
    expected_close_date: date | None
    created_at: datetime


class ActivitySummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    activity_type: str
    description: str
    scheduled_at: datetime | None
    completed: bool
    created_at: datetime
