from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user
from app.dependencies import get_db_optional
from app.schemas.user import UserMeResponse
from app.services.user import get_or_create_user

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserMeResponse)
async def get_me(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession | None = Depends(get_db_optional),
) -> UserMeResponse:
    """Get the current authenticated user's info.

    If database is available, creates/retrieves user record (bootstrap flow).
    If no database, returns Firebase token claims only (graceful degradation).
    """
    uid = current_user["uid"]
    email = current_user.get("email", "")
    email_verified = current_user.get("email_verified", False)

    if db is not None:
        display_name = current_user.get("name")
        avatar_url = current_user.get("picture")

        user, _created = await get_or_create_user(
            db,
            firebase_uid=uid,
            email=email,
            display_name=display_name,
            avatar_url=avatar_url,
        )

        return UserMeResponse(
            uid=uid,
            email=email,
            email_verified=email_verified,
            id=str(user.id),
            display_name=user.display_name,
            avatar_url=user.avatar_url,
            created_at=user.created_at,
        )

    return UserMeResponse(
        uid=uid,
        email=email,
        email_verified=email_verified,
    )
