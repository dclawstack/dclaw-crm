from uuid import UUID
from datetime import datetime, date
from pydantic import BaseModel, ConfigDict

from app.schemas.common import CustomerSummary, ActivitySummary


class DealCreate(BaseModel):
    customer_id: UUID
    title: str
    value: float = 0.0
    stage: str = "prospecting"
    probability: int = 0
    expected_close_date: date | None = None


class DealUpdate(BaseModel):
    customer_id: UUID | None = None
    title: str | None = None
    value: float | None = None
    stage: str | None = None
    probability: int | None = None
    expected_close_date: date | None = None


class DealResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    customer_id: UUID
    title: str
    value: float
    stage: str
    probability: int
    expected_close_date: date | None
    created_at: datetime
    updated_at: datetime
    customer: CustomerSummary
    activities: list[ActivitySummary] = []


class DealListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    items: list[DealResponse]
    total: int
