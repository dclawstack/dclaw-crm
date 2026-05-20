import logging
from datetime import datetime, date, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.deal import Deal
from app.models.activity import Activity
from app.core.config import settings

logger = logging.getLogger(__name__)

STAGE_BENCHMARKS = {
    "prospecting": 10,
    "qualification": 25,
    "proposal": 50,
    "negotiation": 75,
    "closed_won": 100,
    "closed_lost": 0,
}


def _utcnow_naive() -> datetime:
    """Returns current UTC time as a timezone-naive datetime.

    The DB stores TIMESTAMP (no timezone), so asyncpg returns naive datetimes.
    This helper keeps all comparisons consistently naive-UTC.
    """
    return datetime.now(timezone.utc).replace(tzinfo=None)


async def compute_deal_health(deal: Deal, db: AsyncSession) -> dict:
    score = 50
    signals: list[dict] = []
    now = _utcnow_naive()

    # Recent activity (+25): a deal with no touchpoint in 7 days is going cold
    week_ago = now - timedelta(days=7)
    result = await db.execute(
        select(func.count())
        .select_from(Activity)
        .where(Activity.deal_id == deal.id, Activity.created_at >= week_ago)
    )
    recent_count = result.scalar() or 0
    if recent_count > 0:
        score += settings.health_activity_recent_points
        signals.append({"label": "Recent activity", "impact": f"+{settings.health_activity_recent_points}"})
    else:
        signals.append({"label": "No activity in 7 days", "impact": "0"})

    # Probability vs stage benchmark (+20): probability should track stage progression
    benchmark = STAGE_BENCHMARKS.get(deal.stage, 0)
    if deal.probability >= benchmark:
        score += settings.health_probability_ok_points
        signals.append({"label": "Probability on track", "impact": f"+{settings.health_probability_ok_points}"})
    else:
        signals.append({"label": "Probability below benchmark", "impact": "0"})

    # Stuck-in-stage penalty (-15 per week): updated_at is naive UTC from asyncpg
    try:
        weeks_in_stage = (now - deal.updated_at).days // 7
    except TypeError:
        # Defensive: if updated_at is somehow timezone-aware, strip it
        logger.warning("deal.updated_at is timezone-aware for deal_id=%s — normalizing", deal.id)
        weeks_in_stage = (now - deal.updated_at.replace(tzinfo=None)).days // 7

    if weeks_in_stage > 0:
        penalty = min(weeks_in_stage * settings.health_stuck_stage_penalty, 45)
        score -= penalty
        signals.append({"label": f"Stuck in stage {weeks_in_stage}w", "impact": f"-{penalty}"})

    # Close date check (+10 / -20)
    today = date.today()
    if deal.expected_close_date:
        if deal.expected_close_date >= today:
            score += settings.health_close_date_set_points
            signals.append({"label": "Close date set", "impact": f"+{settings.health_close_date_set_points}"})
        else:
            score -= settings.health_close_date_overdue_penalty
            signals.append({"label": "Close date overdue", "impact": f"-{settings.health_close_date_overdue_penalty}"})
    else:
        signals.append({"label": "No close date", "impact": "0"})

    score = max(0, min(100, score))
    return {"score": score, "signals": signals}
