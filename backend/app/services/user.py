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
    display_name: str | None = None,
    avatar_url: str | None = None,
) -> User:
    """Create a new user from Firebase auth data."""
    user = User(
        firebase_uid=firebase_uid,
        email=email,
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
    display_name: str | None = None,
    avatar_url: str | None = None,
) -> tuple[User, bool]:
    """Get existing user or create a new one. Returns (user, created)."""
    user = await get_user_by_firebase_uid(db, firebase_uid)
    if user is not None:
        # Sync email from token if it changed
        if user.email != email:
            user.email = email
            await db.commit()
            await db.refresh(user)
        return user, False

    user = await create_user_from_firebase(
        db, firebase_uid, email, display_name, avatar_url
    )
    return user, True


async def update_user(db: AsyncSession, user: User, **kwargs) -> User:
    """Update user fields. Only updates provided kwargs."""
    for key, value in kwargs.items():
        if hasattr(user, key):
            setattr(user, key, value)
    await db.commit()
    await db.refresh(user)
    return user
