from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.auth import get_current_user, require_role
from app.repositories.note_repo import NoteRepository
from app.schemas.note import NoteCreate, NoteUpdate, NoteResponse, NoteListResponse
from app.models.note import Note

router = APIRouter()


@router.get("/", response_model=NoteListResponse)
async def list_notes(
    customer_id: UUID | None = Query(None),
    deal_id: UUID | None = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    _: object = Depends(get_current_user),
):
    repo = NoteRepository(db)
    if customer_id:
        items, total = await repo.list_by_customer(customer_id, limit, offset)
    elif deal_id:
        items, total = await repo.list_by_deal(deal_id, limit, offset)
    else:
        items, total = await repo.list_all(limit, offset)
    return NoteListResponse(items=items, total=total)


@router.post("/", response_model=NoteResponse, status_code=201)
async def create_note(
    data: NoteCreate,
    db: AsyncSession = Depends(get_db),
    _: object = Depends(get_current_user),
):
    repo = NoteRepository(db)
    note = Note(content=data.content, customer_id=data.customer_id, deal_id=data.deal_id)
    return await repo.create(note)


@router.get("/{note_id}", response_model=NoteResponse)
async def get_note(
    note_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: object = Depends(get_current_user),
):
    repo = NoteRepository(db)
    note = await repo.get_by_id(note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note


@router.put("/{note_id}", response_model=NoteResponse)
async def update_note(
    note_id: UUID,
    data: NoteUpdate,
    db: AsyncSession = Depends(get_db),
    _: object = Depends(get_current_user),
):
    repo = NoteRepository(db)
    note = await repo.get_by_id(note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return await repo.update(note, **data.model_dump(exclude_unset=True))


@router.delete("/{note_id}", status_code=204)
async def delete_note(
    note_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: object = Depends(require_role("admin")),
):
    repo = NoteRepository(db)
    note = await repo.get_by_id(note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    await repo.delete(note)
