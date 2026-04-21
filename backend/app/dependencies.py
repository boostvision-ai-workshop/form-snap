from collections.abc import AsyncGenerator

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

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
