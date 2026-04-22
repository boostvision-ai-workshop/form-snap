from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config import settings

# Lazy engine creation - only if DATABASE_URL is set
engine = None
async_session_factory = None

if settings.DATABASE_URL:
    _is_sqlite = settings.DATABASE_URL.startswith("sqlite")

    _engine_kwargs: dict = {"echo": False}
    if not _is_sqlite:
        # pool_pre_ping keeps Postgres connections healthy; not supported on SQLite
        _engine_kwargs["pool_pre_ping"] = True

    engine = create_async_engine(settings.DATABASE_URL, **_engine_kwargs)
    async_session_factory = async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
