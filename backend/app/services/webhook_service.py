import json
import hmac
import hashlib
import asyncio
from uuid import uuid4
from datetime import datetime, timezone

import httpx
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy import select

from app.models.webhook import WebhookEndpoint, WebhookDelivery
from app.core.config import settings


async def _attempt_delivery(
    endpoint: WebhookEndpoint,
    event: str,
    payload: dict,
    db: AsyncSession,
) -> None:
    body = json.dumps(payload)
    sig = hmac.new(endpoint.secret.encode(), body.encode(), hashlib.sha256).hexdigest()
    headers = {
        "Content-Type": "application/json",
        "X-DClaw-Signature": f"sha256={sig}",
        "X-DClaw-Event": event,
    }

    status_code = None
    for attempt in range(3):
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(endpoint.url, content=body, headers=headers)
                status_code = resp.status_code
                if resp.status_code < 500:
                    break
        except Exception:
            status_code = 0
        if attempt < 2:
            await asyncio.sleep(2 ** attempt)

    delivery = WebhookDelivery(
        endpoint_id=endpoint.id,
        event=event,
        payload=body,
        status_code=status_code,
        attempts=attempt + 1,
    )
    db.add(delivery)
    await db.commit()


async def dispatch_webhook(event: str, payload: dict, db: AsyncSession) -> None:
    result = await db.execute(
        select(WebhookEndpoint).where(WebhookEndpoint.active.is_(True))
    )
    endpoints = list(result.scalars().all())
    for endpoint in endpoints:
        subscribed = json.loads(endpoint.events) if isinstance(endpoint.events, str) else endpoint.events
        if event in subscribed:
            asyncio.create_task(_attempt_delivery(endpoint, event, payload, db))
