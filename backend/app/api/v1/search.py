from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.customer import Customer
from app.models.deal import Deal
from app.models.activity import Activity

router = APIRouter()


@router.get("/")
async def global_search(
    q: str = Query(..., min_length=1),
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    pattern = f"%{q}%"
    results = []

    customers = await db.execute(
        select(Customer).where(
            Customer.name.ilike(pattern)
            | Customer.email.ilike(pattern)
            | Customer.company.ilike(pattern)
        ).limit(limit)
    )
    for c in customers.scalars().all():
        results.append({
            "type": "customer",
            "id": str(c.id),
            "title": c.name,
            "subtitle": c.email,
        })

    deals = await db.execute(
        select(Deal).where(Deal.title.ilike(pattern)).limit(limit)
    )
    for d in deals.scalars().all():
        results.append({
            "type": "deal",
            "id": str(d.id),
            "title": d.title,
            "subtitle": f"${d.value:,.0f} · {d.stage}",
        })

    activities = await db.execute(
        select(Activity).where(Activity.description.ilike(pattern)).limit(limit)
    )
    for a in activities.scalars().all():
        results.append({
            "type": "activity",
            "id": str(a.id),
            "title": a.description[:80],
            "subtitle": a.activity_type,
        })

    return {"results": results[:limit]}
