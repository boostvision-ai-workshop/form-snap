from datetime import datetime

from pydantic import BaseModel


class UserMeResponse(BaseModel):
    # Step 2 fields (preserved)
    uid: str
    email: str
    email_verified: bool
    # Step 3 fields (new — all Optional for backward compat when DB is not configured)
    id: str | None = None
    display_name: str | None = None
    avatar_url: str | None = None
    created_at: datetime | None = None


class UserCreate(BaseModel):
    """Internal schema for user creation (not exposed in API)."""

    firebase_uid: str
    email: str
    display_name: str | None = None
    avatar_url: str | None = None
