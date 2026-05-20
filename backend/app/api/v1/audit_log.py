from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.auth import get_current_user
from app.repositories.audit_log_repo import AuditLogRepository
from app.schemas.audit_log import AuditLogListResponse

router = APIRouter()


@router.get("/", response_model=AuditLogListResponse)
async def list_audit_log(
    entity_type: str | None = Query(None),
    entity_id: str | None = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    _: object = Depends(get_current_user),
):
    repo = AuditLogRepository(db)
    if entity_type and entity_id:
        items, total = await repo.list_by_entity(entity_type, entity_id, limit, offset)
    else:
        items, total = await repo.list_all(limit, offset)
    return AuditLogListResponse(items=items, total=total)
