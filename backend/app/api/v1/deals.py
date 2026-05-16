import csv
import io
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

router = APIRouter()

VALID_STAGES = {"prospecting", "qualification", "proposal", "negotiation", "closed_won", "closed_lost"}


@router.get("/", response_model=DealListResponse)
async def list_deals(
    limit: int = Query(20, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    stage: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
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
    return created


@router.get("/export")
async def export_deals(db: AsyncSession = Depends(get_db)):
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
    deal_repo = DealRepository(db)
    customer_repo = CustomerRepository(db)
    content = await file.read()
    reader = csv.DictReader(io.StringIO(content.decode("utf-8")))
    imported = 0
    skipped = 0
    errors: list[str] = []

    for i, row in enumerate(reader, start=2):
        title = (row.get("title") or "").strip()
        customer_email = (row.get("customer_email") or "").strip()
        if not title or not customer_email:
            errors.append(f"Row {i}: missing title or customer_email")
            skipped += 1
            continue
        customer = await customer_repo.get_by_email(customer_email)
        if not customer:
            errors.append(f"Row {i}: customer {customer_email} not found")
            skipped += 1
            continue
        try:
            value = float(row.get("value") or 0)
        except ValueError:
            value = 0.0
        stage = (row.get("stage") or "prospecting").strip()
        if stage not in VALID_STAGES:
            stage = "prospecting"
        deal = Deal(customer_id=customer.id, title=title, value=value, stage=stage)
        await deal_repo.create(deal)
        imported += 1

    return {"imported": imported, "skipped": skipped, "errors": errors}


@router.get("/{deal_id}", response_model=DealResponse)
async def get_deal(
    deal_id: UUID,
    db: AsyncSession = Depends(get_db),
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
    update_data = {k: v for k, v in data.model_dump(exclude_unset=True).items() if v is not None}
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

    return updated


@router.get("/{deal_id}/health")
async def get_deal_health(deal_id: UUID, db: AsyncSession = Depends(get_db)):
    repo = DealRepository(db)
    deal = await repo.get_by_id(deal_id)
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    return await compute_deal_health(deal, db)
