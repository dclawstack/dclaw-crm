from uuid import UUID
from datetime import datetime
from typing import Any
from pydantic import BaseModel, ConfigDict


class WebhookEndpointCreate(BaseModel):
    url: str
    events: list[str]
    secret: str
    active: bool = True


class WebhookEndpointResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    url: str
    events: list[str]
    secret: str
    active: bool
    created_at: datetime

    @classmethod
    def from_orm_with_events(cls, obj: Any) -> "WebhookEndpointResponse":
        import json
        events = json.loads(obj.events) if isinstance(obj.events, str) else obj.events
        return cls(
            id=obj.id,
            url=obj.url,
            events=events,
            secret=obj.secret,
            active=obj.active,
            created_at=obj.created_at,
        )


class WebhookDeliveryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    endpoint_id: UUID
    event: str
    status_code: int | None
    attempts: int
    created_at: datetime


class WebhookListResponse(BaseModel):
    items: list[WebhookEndpointResponse]
    total: int
