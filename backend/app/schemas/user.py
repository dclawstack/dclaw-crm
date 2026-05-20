from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class UserRegister(BaseModel):
    email: str
    password: str
    role: str = "member"


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: str
    role: str
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
