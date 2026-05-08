from uuid import UUID, uuid4
from datetime import datetime, date
from sqlalchemy import String, Enum, ForeignKey, Integer, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class Deal(Base):
    __tablename__ = "deals"

    id: Mapped[UUID] = mapped_column(primary_key=True, default_factory=uuid4, init=False)
    customer_id: Mapped[UUID] = mapped_column(
        ForeignKey("customers.id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    value: Mapped[float] = mapped_column(default=0.0)
    stage: Mapped[str] = mapped_column(
        Enum(
            "prospecting",
            "qualification",
            "proposal",
            "negotiation",
            "closed_won",
            "closed_lost",
            name="deal_stage",
        ),
        default="prospecting",
    )
    probability: Mapped[int] = mapped_column(default=0)
    expected_close_date: Mapped[date | None] = mapped_column(nullable=True, default=None)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now(), init=False)
    updated_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), onupdate=func.now(), init=False
    )

    customer: Mapped["Customer"] = relationship(
        back_populates="deals", lazy="selectin", init=False
    )
    activities: Mapped[list["Activity"]] = relationship(
        back_populates="deal", lazy="selectin", cascade="all, delete-orphan", init=False
    )
