from uuid import UUID, uuid4
from datetime import datetime
from sqlalchemy import String, Enum, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[UUID] = mapped_column(primary_key=True, default_factory=uuid4, init=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True, default=None)
    company: Mapped[str | None] = mapped_column(String(255), nullable=True, default=None)
    status: Mapped[str] = mapped_column(
        Enum("lead", "active", "churned", name="customer_status"),
        default="lead",
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True, default=None)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now(), init=False)
    updated_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), onupdate=func.now(), init=False
    )

    deals: Mapped[list["Deal"]] = relationship(
        back_populates="customer", lazy="selectin", cascade="all, delete-orphan", init=False
    )
    activities: Mapped[list["Activity"]] = relationship(
        back_populates="customer", lazy="selectin", cascade="all, delete-orphan", init=False
    )
