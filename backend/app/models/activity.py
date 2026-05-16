from uuid import UUID, uuid4
from datetime import datetime
from sqlalchemy import String, Enum, ForeignKey, Boolean, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class Activity(Base):
    __tablename__ = "activities"

    id: Mapped[UUID] = mapped_column(primary_key=True, default_factory=uuid4, init=False)
    customer_id: Mapped[UUID] = mapped_column(
        ForeignKey("customers.id", ondelete="CASCADE"), nullable=False
    )
    activity_type: Mapped[str] = mapped_column(
        Enum("call", "email", "meeting", "note", "stage_change", "status_change", "enrichment", name="activity_type"),
        nullable=False,
    )
    description: Mapped[str] = mapped_column(Text, nullable=False)
    deal_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("deals.id", ondelete="CASCADE"), nullable=True, default=None
    )
    scheduled_at: Mapped[datetime | None] = mapped_column(nullable=True, default=None)
    completed: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now(), init=False)
    updated_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), onupdate=func.now(), init=False
    )

    customer: Mapped["Customer"] = relationship(
        back_populates="activities", lazy="selectin", init=False
    )
    deal: Mapped["Deal | None"] = relationship(
        back_populates="activities", lazy="selectin", init=False
    )
