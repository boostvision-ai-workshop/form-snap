from datetime import datetime

from pydantic import BaseModel


class UserMeResponse(BaseModel):
    uid: str
    id: str
    email: str
    email_verified: bool
    display_name: str | None = None
    avatar_url: str | None = None
    created_at: datetime


class UserCreate(BaseModel):
    """Internal schema for user creation (not exposed in API)."""

    firebase_uid: str
    email: str
    email_verified: bool = False
    display_name: str | None = None
    avatar_url: str | None = None
