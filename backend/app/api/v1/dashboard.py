from datetime import date
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.models.customer import Customer
from app.models.deal import Deal
from app.models.activity import Activity

router = APIRouter()


@router.get("/")
async def get_dashboard(
    from_date: date | None = Query(None),
    to_date: date | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    total_customers_result = await db.execute(select(func.count()).select_from(Customer))
    total_customers = total_customers_result.scalar() or 0

    open_stages = ["prospecting", "qualification", "proposal", "negotiation"]

    deals_query = select(Deal).where(Deal.stage.in_(open_stages))
    if from_date:
        deals_query = deals_query.where(Deal.created_at >= from_date)
    if to_date:
        deals_query = deals_query.where(Deal.created_at <= to_date)

    open_deals_count_q = select(func.count()).select_from(Deal).where(Deal.stage.in_(open_stages))
    pipeline_q = select(func.sum(Deal.value)).select_from(Deal).where(Deal.stage.in_(open_stages))
    won_q = select(func.count()).select_from(Deal).where(Deal.stage == "closed_won")
    lost_q = select(func.count()).select_from(Deal).where(Deal.stage == "closed_lost")

    if from_date:
        for q in [open_deals_count_q, pipeline_q, won_q, lost_q]:
            q = q.where(Deal.created_at >= from_date)
    if to_date:
        for q in [open_deals_count_q, pipeline_q, won_q, lost_q]:
            q = q.where(Deal.created_at <= to_date)

    open_deals_count_q = select(func.count()).select_from(Deal).where(Deal.stage.in_(open_stages))
    pipeline_q = select(func.sum(Deal.value)).select_from(Deal).where(Deal.stage.in_(open_stages))
    won_q = select(func.count()).select_from(Deal).where(Deal.stage == "closed_won")
    lost_q = select(func.count()).select_from(Deal).where(Deal.stage == "closed_lost")

    if from_date:
        open_deals_count_q = open_deals_count_q.where(Deal.created_at >= from_date)
        pipeline_q = pipeline_q.where(Deal.created_at >= from_date)
        won_q = won_q.where(Deal.created_at >= from_date)
        lost_q = lost_q.where(Deal.created_at >= from_date)
    if to_date:
        open_deals_count_q = open_deals_count_q.where(Deal.created_at <= to_date)
        pipeline_q = pipeline_q.where(Deal.created_at <= to_date)
        won_q = won_q.where(Deal.created_at <= to_date)
        lost_q = lost_q.where(Deal.created_at <= to_date)

    open_deals = (await db.execute(open_deals_count_q)).scalar() or 0
    total_pipeline_value = (await db.execute(pipeline_q)).scalar() or 0.0
    won_count = (await db.execute(won_q)).scalar() or 0
    lost_count = (await db.execute(lost_q)).scalar() or 0

    total_closed = won_count + lost_count
    win_rate = (won_count / total_closed * 100) if total_closed > 0 else 0.0

    stage_counts_query = select(Deal.stage, func.count()).select_from(Deal).group_by(Deal.stage)
    if from_date:
        stage_counts_query = stage_counts_query.where(Deal.created_at >= from_date)
    if to_date:
        stage_counts_query = stage_counts_query.where(Deal.created_at <= to_date)
    stage_rows = (await db.execute(stage_counts_query)).all()
    deals_by_stage = {
        "prospecting": 0,
        "qualification": 0,
        "proposal": 0,
        "negotiation": 0,
        "closed_won": 0,
        "closed_lost": 0,
    }
    for row in stage_rows:
        if row[0] in deals_by_stage:
            deals_by_stage[row[0]] = row[1]

    recent_activities_result = await db.execute(
        select(Activity).order_by(Activity.created_at.desc()).limit(10)
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
