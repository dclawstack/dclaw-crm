from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.repositories.deal_repo import DealRepository
from app.schemas.deal import DealCreate, DealUpdate, DealResponse, DealListResponse
from app.models.deal import Deal

router = APIRouter()


@router.get("/", response_model=DealListResponse)
async def list_deals(
    limit: int = Query(20, ge=1, le=100),
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
):
    repo = DealRepository(db)
    deal = Deal(**data.model_dump())
    created = await repo.create(deal)
    return created


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
):
    repo = DealRepository(db)
    deal = await repo.get_by_id(deal_id)
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    update_data = {k: v for k, v in data.model_dump(exclude_unset=True).items() if v is not None}
    updated = await repo.update(deal, **update_data)
    return updated


@router.delete("/{deal_id}", status_code=204)
async def delete_deal(
    deal_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    repo = DealRepository(db)
    deal = await repo.get_by_id(deal_id)
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    await repo.delete(deal)
