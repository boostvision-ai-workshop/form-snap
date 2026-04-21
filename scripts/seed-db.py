"""Database seed script — inserts sample users for development.

Usage: uv run --project backend python ../scripts/seed-db.py

Or from repo root:
  uv run --project backend python scripts/seed-db.py

Requirements:
- DATABASE_URL environment variable must be set
- Database migrations must be applied first: alembic upgrade head
"""

import asyncio
import os
import sys

# Add backend to path so we can import app modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.services.user import get_or_create_user

SAMPLE_USERS = [
    {
        "firebase_uid": "seed-user-1",
        "email": "admin@example.com",
        "display_name": "Admin User",
    },
    {
        "firebase_uid": "seed-user-2",
        "email": "test@example.com",
        "display_name": "Test User",
    },
]


async def seed_users(session: AsyncSession) -> None:
    """Insert sample users (idempotent — skips existing)."""
    for user_data in SAMPLE_USERS:
        user, created = await get_or_create_user(
            session,
            firebase_uid=user_data["firebase_uid"],
            email=user_data["email"],
            display_name=user_data.get("display_name"),
        )
        status = "CREATED" if created else "EXISTS"
        print(f"  [{status}] {user.email} (firebase_uid={user.firebase_uid})")


async def main() -> None:
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("ERROR: DATABASE_URL environment variable is not set.")
        print("Set it to your Supabase Postgres connection string:")
        print(
            '  export DATABASE_URL="postgresql+asyncpg://user:password@db.xxx.supabase.co:6543/postgres"'
        )
        sys.exit(1)

    print("Connecting to database...")
    engine = create_async_engine(database_url, echo=False)
    async_session = async_sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )

    async with async_session() as session:
        print("Seeding users...")
        await seed_users(session)
        print("Done!")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
