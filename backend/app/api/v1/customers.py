import csv
import io
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, BackgroundTasks
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.repositories.customer_repo import CustomerRepository
from app.repositories.activity_repo import ActivityRepository
from app.repositories.audit_log_repo import AuditLogRepository
from app.schemas.customer import CustomerCreate, CustomerUpdate, CustomerResponse, CustomerListResponse
from app.models.customer import Customer
from app.models.activity import Activity
from app.services import enrichment_service

router = APIRouter()

VALID_STATUSES = {"lead", "prospect", "active", "inactive", "churned"}


@router.get("/", response_model=CustomerListResponse)
async def list_customers(
    limit: int = Query(20, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    repo = CustomerRepository(db)
    items, total = await repo.list_all(limit=limit, offset=offset)
    return CustomerListResponse(items=items, total=total)


@router.post("/", response_model=CustomerResponse, status_code=201)
async def create_customer(
    data: CustomerCreate,
    db: AsyncSession = Depends(get_db),
):
    repo = CustomerRepository(db)
    existing = await repo.get_by_email(data.email)
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")
    customer = Customer(**data.model_dump())
    created = await repo.create(customer)
    audit = AuditLogRepository(db)
    await audit.log("customer", str(created.id), "created")
    return created


@router.get("/export")
async def export_customers(db: AsyncSession = Depends(get_db)):
    repo = CustomerRepository(db)
    items, _ = await repo.list_all(limit=10000, offset=0)
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["name", "email", "phone", "company", "status"])
    for c in items:
        writer.writerow([c.name, c.email, c.phone or "", c.company or "", c.status])
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=customers.csv"},
    )


@router.post("/import")
async def import_customers(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    repo = CustomerRepository(db)
    content = await file.read()
    reader = csv.DictReader(io.StringIO(content.decode("utf-8")))
    imported = 0
    skipped = 0
    errors: list[str] = []

    for i, row in enumerate(reader, start=2):
        email = (row.get("email") or "").strip()
        name = (row.get("name") or "").strip()
        if not email or not name:
            errors.append(f"Row {i}: missing name or email")
            skipped += 1
            continue
        existing = await repo.get_by_email(email)
        if existing:
            errors.append(f"Row {i}: email {email} already exists")
            skipped += 1
            continue
        status = (row.get("status") or "lead").strip()
        if status not in VALID_STATUSES:
            status = "lead"
        customer = Customer(
            name=name,
            email=email,
            phone=(row.get("phone") or "").strip() or None,
            company=(row.get("company") or "").strip() or None,
            status=status,
        )
        await repo.create(customer)
        imported += 1

    return {"imported": imported, "skipped": skipped, "errors": errors}


@router.get("/{customer_id}", response_model=CustomerResponse)
async def get_customer(
    customer_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    repo = CustomerRepository(db)
    customer = await repo.get_by_id(customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


@router.put("/{customer_id}", response_model=CustomerResponse)
async def update_customer(
    customer_id: UUID,
    data: CustomerUpdate,
    db: AsyncSession = Depends(get_db),
):
    repo = CustomerRepository(db)
    customer = await repo.get_by_id(customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    update_data = {k: v for k, v in data.model_dump(exclude_unset=True).items() if v is not None}
    audit = AuditLogRepository(db)
    for field, new_val in update_data.items():
        old_val = str(getattr(customer, field, ""))
        await audit.log("customer", str(customer_id), "updated", field, old_val, str(new_val))
    updated = await repo.update(customer, **update_data)
    return updated


@router.delete("/{customer_id}", status_code=204)
async def delete_customer(
    customer_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    repo = CustomerRepository(db)
    customer = await repo.get_by_id(customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    audit = AuditLogRepository(db)
    await audit.log("customer", str(customer_id), "deleted")
    await repo.delete(customer)


@router.patch("/{customer_id}/status", response_model=CustomerResponse)
async def update_customer_status(
    customer_id: UUID,
    status: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    if status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {VALID_STATUSES}")
    repo = CustomerRepository(db)
    customer = await repo.get_by_id(customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    old_status = customer.status
    updated = await repo.update(customer, status=status)

    audit = AuditLogRepository(db)
    await audit.log("customer", str(customer_id), "updated", "status", old_status, status)

    act_repo = ActivityRepository(db)
    act = Activity(
        customer_id=customer_id,
        activity_type="status_change",
        description=f"Status changed from {old_status} to {status}",
    )
    await act_repo.create(act)

    return updated


@router.post("/{customer_id}/enrich", status_code=200)
async def enrich_customer(
    customer_id: UUID,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    repo = CustomerRepository(db)
    customer = await repo.get_by_id(customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    if not customer.company:
        raise HTTPException(status_code=400, detail="Customer has no company set")

    result = await enrichment_service.enrich_company(customer.company)

    if result["status"] == "completed" and result.get("data"):
        data = result["data"]
        update_data = {k: v for k, v in data.items() if hasattr(customer, k) and v}
        if update_data:
            await repo.update(customer, **update_data)

        act_repo = ActivityRepository(db)
        fields = ", ".join(result["enriched_fields"])
        act = Activity(
            customer_id=customer_id,
            activity_type="enrichment",
            description=f"Company enriched: {fields}",
        )
        await act_repo.create(act)

    return result
