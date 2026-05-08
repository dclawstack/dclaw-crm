from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.models.customer import Customer
from app.models.deal import Deal
from app.models.activity import Activity

router = APIRouter()


@router.get("/")
async def get_dashboard(db: AsyncSession = Depends(get_db)):
    total_customers_result = await db.execute(select(func.count()).select_from(Customer))
    total_customers = total_customers_result.scalar() or 0

    open_stages = ["prospecting", "qualification", "proposal", "negotiation"]
    open_deals_result = await db.execute(
        select(func.count()).select_from(Deal).where(Deal.stage.in_(open_stages))
    )
    open_deals = open_deals_result.scalar() or 0

    pipeline_result = await db.execute(
        select(func.sum(Deal.value)).select_from(Deal).where(Deal.stage.in_(open_stages))
    )
    total_pipeline_value = pipeline_result.scalar() or 0.0

    won_result = await db.execute(
        select(func.count()).select_from(Deal).where(Deal.stage == "closed_won")
    )
    won_count = won_result.scalar() or 0

    lost_result = await db.execute(
        select(func.count()).select_from(Deal).where(Deal.stage == "closed_lost")
    )
    lost_count = lost_result.scalar() or 0

    total_closed = won_count + lost_count
    win_rate = (won_count / total_closed * 100) if total_closed > 0 else 0.0

    stage_counts_result = await db.execute(
        select(Deal.stage, func.count())
        .select_from(Deal)
        .group_by(Deal.stage)
    )
    stage_rows = stage_counts_result.all()
    deals_by_stage = {
        "prospecting": 0,
        "qualification": 0,
        "proposal": 0,
        "negotiation": 0,
        "closed_won": 0,
        "closed_lost": 0,
    }
    for row in stage_rows:
        deals_by_stage[row[0]] = row[1]

    recent_activities_result = await db.execute(
        select(Activity)
        .order_by(Activity.created_at.desc())
        .limit(10)
    )
    recent_activities = list(recent_activities_result.scalars().all())

    return {
        "total_customers": total_customers,
        "open_deals": open_deals,
        "total_pipeline_value": float(total_pipeline_value),
        "win_rate": round(win_rate, 2),
        "deals_by_stage": deals_by_stage,
        "recent_activities": [
            {
                "id": str(a.id),
                "customer_id": str(a.customer_id),
                "deal_id": str(a.deal_id) if a.deal_id else None,
                "activity_type": a.activity_type,
                "description": a.description,
                "scheduled_at": a.scheduled_at.isoformat() if a.scheduled_at else None,
                "completed": a.completed,
                "created_at": a.created_at.isoformat(),
            }
            for a in recent_activities
        ],
    }
