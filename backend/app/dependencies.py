from collections.abc import AsyncGenerator

from fastapi import Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user
from app.database import async_session_factory


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    if async_session_factory is None:
        raise HTTPException(
            status_code=503,
            detail="Database not configured",
        )
    async with async_session_factory() as session:
        yield session


async def get_db_optional() -> AsyncGenerator[AsyncSession | None, None]:
    """Yield a database session if available, or None if no DB configured."""
    if async_session_factory is None:
        yield None
    else:
        async with async_session_factory() as session:
            yield session


async def get_current_profile(
    claims: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Resolve Firebase claims to a User DB row, lazily creating it if absent.

    Syncs email and email_verified from the token on each call.
    Returns the User ORM object. Requires DB to be configured (raises 503 otherwise
    via get_db).
    """
    from app.models.user import User
    from app.services.user import get_or_create_user

    user, _created = await get_or_create_user(
        db,
        firebase_uid=claims["uid"],
        email=claims.get("email", ""),
        email_verified=claims.get("email_verified", False),
        display_name=claims.get("name"),
        avatar_url=claims.get("picture"),
    )
    return user


async def require_verified_profile(
    user=Depends(get_current_profile),
):
    """Like get_current_profile but raises 403 if email is not verified.

    Used by endpoints that require a verified email (e.g. POST /api/v1/forms).
    The check reads user.email_verified which is synced from the token claim in
    get_current_profile, so it reflects the current Firebase state.
    """
    from app.models.user import User as UserModel

    if not user.email_verified:
        raise HTTPException(status_code=403, detail="email_not_verified")
    return user
