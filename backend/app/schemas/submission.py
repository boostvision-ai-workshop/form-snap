"""Pydantic schemas for submission endpoints."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict


class PublicSubmissionAck(BaseModel):
    """Response for successful public form submission (JSON mode)."""

    ok: bool = True
    id: str  # UUID string; "00000000-0000-0000-0000-000000000000" for honeypot


class SubmissionResponse(BaseModel):
    """Single submission item as returned in the inbox list."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    created_at: datetime
    data: dict
    email_status: Literal["pending", "sent", "failed"]
    email_attempts: int


class SubmissionPage(BaseModel):
    """Paginated response for GET /api/v1/forms/{id}/submissions."""

    items: list[SubmissionResponse]
    page: int
    page_size: int
    total: int
