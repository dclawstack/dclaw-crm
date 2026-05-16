import json
from uuid import UUID, uuid4
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.repositories.webhook_repo import WebhookEndpointRepository, WebhookDeliveryRepository
from app.schemas.webhook import (
    WebhookEndpointCreate,
    WebhookEndpointResponse,
    WebhookDeliveryResponse,
    WebhookListResponse,
)
from app.models.webhook import WebhookEndpoint

router = APIRouter()


def _to_response(endpoint: WebhookEndpoint) -> WebhookEndpointResponse:
    events = json.loads(endpoint.events) if isinstance(endpoint.events, str) else endpoint.events
    return WebhookEndpointResponse(
        id=endpoint.id,
        url=endpoint.url,
        events=events,
        secret=endpoint.secret,
        active=endpoint.active,
        created_at=endpoint.created_at,
    )


@router.get("/", response_model=WebhookListResponse)
async def list_webhooks(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    repo = WebhookEndpointRepository(db)
    items, total = await repo.list_all(limit, offset)
    return WebhookListResponse(items=[_to_response(e) for e in items], total=total)


@router.post("/", response_model=WebhookEndpointResponse, status_code=201)
async def create_webhook(data: WebhookEndpointCreate, db: AsyncSession = Depends(get_db)):
    repo = WebhookEndpointRepository(db)
    endpoint = WebhookEndpoint(
        url=data.url,
        events=json.dumps(data.events),
        secret=data.secret,
        active=data.active,
    )
    created = await repo.create(endpoint)
    return _to_response(created)


@router.delete("/{webhook_id}", status_code=204)
async def delete_webhook(webhook_id: UUID, db: AsyncSession = Depends(get_db)):
    repo = WebhookEndpointRepository(db)
    endpoint = await repo.get_by_id(webhook_id)
    if not endpoint:
        raise HTTPException(status_code=404, detail="Webhook not found")
    await repo.delete(endpoint)


@router.get("/{webhook_id}/deliveries", response_model=list[WebhookDeliveryResponse])
async def get_webhook_deliveries(
    webhook_id: UUID,
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    delivery_repo = WebhookDeliveryRepository(db)
    return await delivery_repo.list_by_endpoint(webhook_id, limit)
