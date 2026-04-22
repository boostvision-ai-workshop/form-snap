from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user
from app.dependencies import get_db_optional
from app.schemas.user import UserMeResponse
from app.services.user import get_or_create_user

router = APIRouter(tags=["me"])


@router.get("/me", response_model=UserMeResponse)
async def get_me(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession | None = Depends(get_db_optional),
) -> UserMeResponse:
    """Return (and lazy-create) the authenticated user's profile.

    If the database is available, creates or retrieves the user row and syncs
    email_verified from the token claim. If no database, falls back to token
    claims only (used in tests without a live DB).
    """
    uid = current_user["uid"]
    email = current_user.get("email", "")
    email_verified: bool = current_user.get("email_verified", False)
    display_name: str | None = current_user.get("name")
    avatar_url: str | None = current_user.get("picture")

    if db is not None:
        user, _created = await get_or_create_user(
            db,
            firebase_uid=uid,
            email=email,
            email_verified=email_verified,
            display_name=display_name,
            avatar_url=avatar_url,
        )
        return UserMeResponse(
            uid=uid,
            id=str(user.id),
            email=email,
            email_verified=email_verified,
            display_name=user.display_name,
            avatar_url=user.avatar_url,
            created_at=user.created_at,
        )

    # Graceful degradation when no DB (tests / local dev without Supabase)
    import uuid
    from datetime import datetime, timezone

    return UserMeResponse(
        uid=uid,
        id=str(uuid.uuid4()),
        email=email,
        email_verified=email_verified,
        display_name=display_name,
        avatar_url=avatar_url,
        created_at=datetime.now(tz=timezone.utc),
    )
