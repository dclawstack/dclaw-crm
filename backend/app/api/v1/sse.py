import asyncio
import json
import logging
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.auth import decode_token
from app.core.events import event_bus
from app.models.user import User

logger = logging.getLogger(__name__)
router = APIRouter()

# Keep-alive ping interval in seconds — prevents proxies/load balancers from
# closing idle SSE connections before clients have received any events
_KEEPALIVE_SECONDS = 25


async def _get_user_from_token(token: str, db: AsyncSession) -> User:
    """Validate a raw JWT and return the User.

    Separate from the standard get_current_user dependency because EventSource
    (the browser SSE API) cannot set custom headers, so we accept the token as
    a query parameter instead.
    """
    try:
        user_id = decode_token(token)
        uid = UUID(user_id)
    except (ValueError, Exception):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    result = await db.execute(select(User).where(User.id == uid))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


@router.get("/deals/stream")
async def deals_event_stream(
    token: str = Query(..., description="JWT — passed as query param because EventSource cannot send headers"),
    db: AsyncSession = Depends(get_db),
):
    """Server-Sent Events stream for real-time deal stage changes.

    Clients connect once and receive events whenever any user moves a deal on
    the Kanban board. The stream stays open indefinitely; keep-alive pings are
    sent every 25 seconds to prevent proxy timeouts.
    """
    await _get_user_from_token(token, db)

    queue = event_bus.subscribe()

    async def generator():
        try:
            while True:
                try:
                    event = await asyncio.wait_for(queue.get(), timeout=_KEEPALIVE_SECONDS)
                    payload = json.dumps(event)
                    yield f"data: {payload}\n\n"
                except asyncio.TimeoutError:
                    # Heartbeat — tells the client (and any proxy) the connection is alive
                    yield "data: {\"type\":\"ping\"}\n\n"
        except asyncio.CancelledError:
            pass
        finally:
            event_bus.unsubscribe(queue)

    return StreamingResponse(
        generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            # Tells nginx not to buffer SSE — events would otherwise be held
            # until the buffer fills and delivered in bursts instead of real-time
            "X-Accel-Buffering": "no",
        },
    )
