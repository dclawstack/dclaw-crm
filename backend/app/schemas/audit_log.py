from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    entity_type: str
    entity_id: str
    action: str
    field_name: str | None
    old_value: str | None
    new_value: str | None
    actor_ip: str | None
    created_at: datetime


class AuditLogListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    items: list[AuditLogResponse]
    total: int
