"""User service layer with CRUD operations."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User


async def get_user_by_firebase_uid(db: AsyncSession, firebase_uid: str) -> User | None:
    """Get a user by their Firebase UID."""
    result = await db.execute(select(User).where(User.firebase_uid == firebase_uid))
    return result.scalar_one_or_none()


async def create_user_from_firebase(
    db: AsyncSession,
    firebase_uid: str,
    email: str,
    email_verified: bool = False,
    display_name: str | None = None,
    avatar_url: str | None = None,
) -> User:
    """Create a new user from Firebase auth data."""
    user = User(
        firebase_uid=firebase_uid,
        email=email,
        email_verified=email_verified,
        display_name=display_name,
        avatar_url=avatar_url,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def get_or_create_user(
    db: AsyncSession,
    firebase_uid: str,
    email: str,
    email_verified: bool = False,
    display_name: str | None = None,
    avatar_url: str | None = None,
) -> tuple[User, bool]:
    """Get existing user or create a new one. Returns (user, created).

    Always syncs email and email_verified from the Firebase token on each call.
    """
    user = await get_user_by_firebase_uid(db, firebase_uid)
    if user is not None:
        # Sync mutable fields from token on each call
        changed = False
        if user.email != email:
            user.email = email
            changed = True
        if user.email_verified != email_verified:
            user.email_verified = email_verified
            changed = True
        if changed:
            await db.commit()
            await db.refresh(user)
        return user, False

    user = await create_user_from_firebase(
        db,
        firebase_uid=firebase_uid,
        email=email,
        email_verified=email_verified,
        display_name=display_name,
        avatar_url=avatar_url,
    )
    return user, True


async def update_user(db: AsyncSession, user: User, **kwargs: object) -> User:
    """Update user fields. Only updates provided kwargs."""
    for key, value in kwargs.items():
        if hasattr(user, key):
            setattr(user, key, value)
    await db.commit()
    await db.refresh(user)
    return user
