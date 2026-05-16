from uuid import UUID, uuid4
from datetime import datetime
from sqlalchemy import String, Enum, func
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(primary_key=True, default_factory=uuid4, init=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(
        Enum("admin", "member", name="user_role"),
        default="member",
    )
    created_at: Mapped[datetime] = mapped_column(server_default=func.now(), init=False)
