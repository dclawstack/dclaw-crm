from datetime import date
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.deal import Deal

router = APIRouter()

OPEN_STAGES = ["prospecting", "qualification", "proposal", "negotiation"]


@router.get("/")
async def get_forecast(
    from_date: date | None = Query(None),
    to_date: date | None = Query(None),
    db: AsyncSession = Depends(get_db),
    _: object = Depends(get_current_user),
):
    query = select(Deal).where(Deal.stage.in_(OPEN_STAGES))

    if from_date and to_date:
        query = query.where(
            Deal.expected_close_date >= from_date,
            Deal.expected_close_date <= to_date,
        )
    elif from_date:
        query = query.where(Deal.expected_close_date >= from_date)
    elif to_date:
        query = query.where(Deal.expected_close_date <= to_date)

    result = await db.execute(query)
    deals = list(result.scalars().all())

    weighted_pipeline = sum(d.value * (d.probability / 100) for d in deals)
    best_case = sum(d.value for d in deals)
    commit = sum(d.value for d in deals if d.stage == "negotiation" and d.probability >= 80)

    return {
        "weighted_pipeline": round(weighted_pipeline, 2),
        "best_case": round(best_case, 2),
        "commit": round(commit, 2),
        "deal_count": len(deals),
        "deals": [
            {
                "id": str(d.id),
                "title": d.title,
                "value": d.value,
                "probability": d.probability,
                "stage": d.stage,
                "expected_close_date": d.expected_close_date.isoformat() if d.expected_close_date else None,
            }
            for d in deals
        ],
    }
