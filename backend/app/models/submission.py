"""Submission model — one captured form submission with opaque JSON payload."""

import uuid
from datetime import datetime

from sqlalchemy import JSON, CheckConstraint, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

# JSONB on Postgres; plain JSON on SQLite (JSONB is unavailable there)
_JSONB_OR_JSON = JSONB().with_variant(JSON(), "sqlite")

from app.models.base import Base


class Submission(Base):
    __tablename__ = "submissions"
    __table_args__ = (
        CheckConstraint(
            "email_status IN ('pending', 'sent', 'failed')",
            name="ck_submissions_email_status",
        ),
        CheckConstraint(
            "email_attempts >= 0 AND email_attempts <= 3",
            name="ck_submissions_email_attempts_range",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    form_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("forms.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    data: Mapped[dict] = mapped_column(_JSONB_OR_JSON, nullable=False, default=dict)
    email_status: Mapped[str] = mapped_column(
        String(16),
        nullable=False,
        server_default="pending",
    )
    email_attempts: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        server_default="0",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    form: Mapped["Form"] = relationship(back_populates="submissions")  # type: ignore[name-defined]

    def __repr__(self) -> str:
        return f"<Submission(id={self.id}, form_id={self.form_id})>"
