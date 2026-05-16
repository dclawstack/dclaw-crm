from datetime import date, datetime, timezone
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.auth import get_current_user, require_role
from app.repositories.activity_repo import ActivityRepository
from app.schemas.activity import ActivityCreate, ActivityUpdate, ActivityResponse, ActivityListResponse
from app.models.activity import Activity

router = APIRouter()


@router.get("/due-today", response_model=ActivityListResponse)
async def due_today(db: AsyncSession = Depends(get_db)):
    today = date.today()
    result = await db.execute(
        select(Activity).where(
            Activity.completed.is_(False),
            Activity.scheduled_at.isnot(None),
        )
    )
    items = [
        a for a in result.scalars().all()
        if a.scheduled_at and a.scheduled_at.date() == today
    ]
    return ActivityListResponse(items=items, total=len(items))


@router.get("/overdue", response_model=ActivityListResponse)
async def overdue(db: AsyncSession = Depends(get_db)):
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    result = await db.execute(
        select(Activity).where(
            Activity.completed.is_(False),
            Activity.scheduled_at.isnot(None),
            Activity.scheduled_at < now,
        )
    )
    items = list(result.scalars().all())
    today = date.today()
    items = [a for a in items if a.scheduled_at and a.scheduled_at.date() < today]
    return ActivityListResponse(items=items, total=len(items))


@router.get("/", response_model=ActivityListResponse)
async def list_activities(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    customer_id: UUID | None = Query(None),
    deal_id: UUID | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    repo = ActivityRepository(db)
    if customer_id:
        items, total = await repo.list_by_customer(customer_id=customer_id, limit=limit, offset=offset)
    elif deal_id:
        items, total = await repo.list_by_deal(deal_id=deal_id, limit=limit, offset=offset)
    else:
        items, total = await repo.list_all(limit=limit, offset=offset)
    return ActivityListResponse(items=items, total=total)


@router.post("/", response_model=ActivityResponse, status_code=201)
async def create_activity(
    data: ActivityCreate,
    db: AsyncSession = Depends(get_db),
    _: object = Depends(get_current_user),
):
    repo = ActivityRepository(db)
    activity = Activity(**data.model_dump())
    created = await repo.create(activity)
    return created


@router.get("/{activity_id}", response_model=ActivityResponse)
async def get_activity(
    activity_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    repo = ActivityRepository(db)
    activity = await repo.get_by_id(activity_id)
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    return activity


@router.put("/{activity_id}", response_model=ActivityResponse)
async def update_activity(
    activity_id: UUID,
    data: ActivityUpdate,
    db: AsyncSession = Depends(get_db),
    _: object = Depends(get_current_user),
):
    repo = ActivityRepository(db)
    activity = await repo.get_by_id(activity_id)
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    update_data = {k: v for k, v in data.model_dump(exclude_unset=True).items() if v is not None}
    updated = await repo.update(activity, **update_data)
    return updated


@router.delete("/{activity_id}", status_code=204)
async def delete_activity(
    activity_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: object = Depends(require_role("admin")),
):
    repo = ActivityRepository(db)
    activity = await repo.get_by_id(activity_id)
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    await repo.delete(activity)


@router.patch("/{activity_id}/complete", response_model=ActivityResponse)
async def toggle_complete(
    activity_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: object = Depends(get_current_user),
):
    repo = ActivityRepository(db)
    activity = await repo.get_by_id(activity_id)
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    updated = await repo.update(activity, completed=not activity.completed)
    return updated
