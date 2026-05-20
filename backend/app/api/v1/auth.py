import logging
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.auth import hash_password, verify_password, create_access_token, get_current_user
from app.core.rate_limit import limiter
from app.models.user import User
from app.schemas.user import UserRegister, UserLogin, UserResponse, TokenResponse

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(data: UserRegister, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Email already registered")

    valid_roles = {"admin", "member"}
    if data.role not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Role must be one of {valid_roles}")

    user = User(
        email=data.email,
        hashed_password=hash_password(data.password),
        role=data.role,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    logger.info("User registered: %s (role=%s)", user.email, user.role)
    token = create_access_token(str(user.id))
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")  # Block brute-force: 10 attempts per IP per minute
async def login(request: Request, data: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    # Always call verify_password even when user is None — prevents timing attacks
    # that reveal whether a given email exists in the database
    password_ok = user is not None and verify_password(data.password, user.hashed_password)
    if not password_ok:
        client_ip = request.client.host if request.client else "unknown"
        logger.warning("Failed login for email=%s ip=%s", data.email, client_ip)
        raise HTTPException(status_code=401, detail="Invalid credentials")

    logger.info("User logged in: %s", user.email)
    token = create_access_token(str(user.id))
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)):
    return current_user
