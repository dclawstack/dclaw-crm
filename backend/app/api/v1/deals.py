import csv
import io
import logging
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.auth import get_current_user, require_role
from app.repositories.deal_repo import DealRepository
from app.repositories.customer_repo import CustomerRepository
from app.repositories.activity_repo import ActivityRepository
from app.repositories.audit_log_repo import AuditLogRepository
from app.schemas.deal import DealCreate, DealUpdate, DealResponse, DealListResponse
from app.models.deal import Deal
from app.models.activity import Activity
from app.services.deal_health import compute_deal_health
from app.core.events import event_bus

logger = logging.getLogger(__name__)
router = APIRouter()

VALID_STAGES = {"prospecting", "qualification", "proposal", "negotiation", "closed_won", "closed_lost"}
MAX_IMPORT_BYTES = 5 * 1024 * 1024  # 5 MB


@router.get("/", response_model=DealListResponse)
async def list_deals(
    limit: int = Query(20, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    stage: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    _: object = Depends(get_current_user),  # was unauthenticated
):
    repo = DealRepository(db)
    if stage:
        items, total = await repo.list_by_stage(stage=stage, limit=limit, offset=offset)
    else:
        items, total = await repo.list_all(limit=limit, offset=offset)
    return DealListResponse(items=items, total=total)


@router.post("/", response_model=DealResponse, status_code=201)
async def create_deal(
    data: DealCreate,
    db: AsyncSession = Depends(get_db),
    _: object = Depends(get_current_user),
):
    repo = DealRepository(db)
    deal = Deal(**data.model_dump())
    created = await repo.create(deal)
    audit = AuditLogRepository(db)
    await audit.log("deal", str(created.id), "created")
    logger.info("Deal created: id=%s title=%r", created.id, created.title)
    return created


@router.get("/export")
async def export_deals(
    db: AsyncSession = Depends(get_db),
    _: object = Depends(get_current_user),  # was unauthenticated — full pipeline dump to anyone
):
    repo = DealRepository(db)
    items, _ = await repo.list_all(limit=10000, offset=0)
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["title", "customer_id", "value", "stage", "probability", "expected_close_date"])
    for d in items:
        writer.writerow([
            d.title, str(d.customer_id), d.value, d.stage,
            d.probability, d.expected_close_date or "",
        ])
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=deals.csv"},
    )


@router.post("/import")
async def import_deals(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    _: object = Depends(get_current_user),
):
    from sqlalchemy import select as sa_select
    from app.models.customer import Customer as CustomerModel

    content = await file.read(MAX_IMPORT_BYTES + 1)
    if len(content) > MAX_IMPORT_BYTES:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 5 MB.")

    reader = csv.DictReader(io.StringIO(content.decode("utf-8")))
    errors: list[str] = []
    skipped = 0

    # First pass: collect valid rows and unique customer emails
    valid_rows: list[tuple[int, dict]] = []
    needed_emails: set[str] = set()
    for i, row in enumerate(reader, start=2):
        title = (row.get("title") or "").strip()
        email = (row.get("customer_email") or "").strip()
        if not title or not email:
            errors.append(f"Row {i}: missing title or customer_email")
            skipped += 1
            continue
        valid_rows.append((i, row))
        needed_emails.add(email)

    if not valid_rows:
        return {"imported": 0, "skipped": skipped, "errors": errors}

    # Single query to resolve all referenced customer emails to IDs
    cust_result = await db.execute(
        sa_select(CustomerModel.email, CustomerModel.id).where(CustomerModel.email.in_(needed_emails))
    )
    email_to_id = {row[0]: row[1] for row in cust_result}

    # Second pass: build deal objects
    to_insert: list[Deal] = []
    for i, row in valid_rows:
        email = row.get("customer_email", "").strip()
        customer_id = email_to_id.get(email)
        if not customer_id:
            errors.append(f"Row {i}: customer {email} not found")
            skipped += 1
            continue
        try:
            value = float(row.get("value") or 0)
        except ValueError:
            value = 0.0
        stage = (row.get("stage") or "prospecting").strip()
        if stage not in VALID_STAGES:
            stage = "prospecting"
        to_insert.append(Deal(customer_id=customer_id, title=row.get("title", "").strip(), value=value, stage=stage))

    # Single bulk commit
    if to_insert:
        db.add_all(to_insert)
        await db.commit()

    imported = len(to_insert)
    logger.info("Deal import complete: imported=%d skipped=%d", imported, skipped)
    return {"imported": imported, "skipped": skipped, "errors": errors}


@router.get("/{deal_id}", response_model=DealResponse)
async def get_deal(
    deal_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: object = Depends(get_current_user),  # was unauthenticated
):
    repo = DealRepository(db)
    deal = await repo.get_by_id(deal_id)
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    return deal


@router.put("/{deal_id}", response_model=DealResponse)
async def update_deal(
    deal_id: UUID,
    data: DealUpdate,
    db: AsyncSession = Depends(get_db),
    _: object = Depends(get_current_user),
):
    repo = DealRepository(db)
    deal = await repo.get_by_id(deal_id)
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    # exclude_unset=True without the extra `if v is not None` filter — allows clearing optional fields
    update_data = data.model_dump(exclude_unset=True)

    audit = AuditLogRepository(db)
    for field, new_val in update_data.items():
        old_val = str(getattr(deal, field, ""))
        await audit.log("deal", str(deal_id), "updated", field, old_val, str(new_val))
    updated = await repo.update(deal, **update_data)
    return updated


@router.delete("/{deal_id}", status_code=204)
async def delete_deal(
    deal_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: object = Depends(require_role("admin")),
):
    repo = DealRepository(db)
    deal = await repo.get_by_id(deal_id)
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    audit = AuditLogRepository(db)
    await audit.log("deal", str(deal_id), "deleted")
    await repo.delete(deal)
    logger.info("Deal deleted: id=%s", deal_id)


@router.patch("/{deal_id}/stage", response_model=DealResponse)
async def move_deal_stage(
    deal_id: UUID,
    stage: str = Query(...),
    db: AsyncSession = Depends(get_db),
    _: object = Depends(get_current_user),
):
    if stage not in VALID_STAGES:
        raise HTTPException(status_code=400, detail=f"Invalid stage. Must be one of: {VALID_STAGES}")
    repo = DealRepository(db)
    deal = await repo.get_by_id(deal_id)
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    old_stage = deal.stage
    updated = await repo.update(deal, stage=stage)

    audit = AuditLogRepository(db)
    await audit.log("deal", str(deal_id), "updated", "stage", old_stage, stage)

    act_repo = ActivityRepository(db)
    act = Activity(
        customer_id=updated.customer_id,
        deal_id=deal_id,
        activity_type="stage_change",
        description=f"Stage changed from {old_stage} to {stage}",
    )
    await act_repo.create(act)

    # Broadcast to every connected SSE client so Kanban boards update live
    await event_bus.publish({
        "type": "deal_stage_changed",
        "deal_id": str(deal_id),
        "old_stage": old_stage,
        "stage": stage,
        "title": updated.title,
        "value": updated.value,
        "customer_name": updated.customer.name if updated.customer else "",
        "probability": updated.probability,
    })

    return updated


@router.get("/{deal_id}/health")
async def get_deal_health(
    deal_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: object = Depends(get_current_user),  # was unauthenticated
):
    repo = DealRepository(db)
    deal = await repo.get_by_id(deal_id)
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    return await compute_deal_health(deal, db)
