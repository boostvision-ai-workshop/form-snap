"""Seed the local SQLite dev DB with a demo mock user, forms, and submissions.

Run after `alembic upgrade head`:

    uv run --directory backend python -m scripts.seed_local

Matches the deterministic uid that the frontend mockAuth produces:
    uid = "mock-" + email.lower().replace(non-alnum, "-")

So signing in with the seeded email in the mock-auth frontend surfaces
these exact forms and submissions.

Safe to re-run — it upserts by firebase_uid and skips duplicate form names.
"""

from __future__ import annotations

import asyncio
import re
import sys
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path

# Allow running as `python scripts/seed_local.py` from the backend dir.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import async_session_factory
from app.models.form import Form
from app.models.submission import Submission
from app.models.user import User


DEMO_EMAIL = "demo@formsnap.dev"
DEMO_DISPLAY_NAME = "Demo User"


def uid_for(email: str) -> str:
    """Match frontend mockAuth._uidFor: lowercase, non-alnum → '-'."""
    return "mock-" + re.sub(r"[^a-z0-9]", "-", email.lower())


async def _upsert_user(db: AsyncSession, email: str) -> User:
    firebase_uid = uid_for(email)
    existing = (
        await db.execute(select(User).where(User.firebase_uid == firebase_uid))
    ).scalar_one_or_none()
    if existing:
        existing.email = email
        existing.email_verified = True
        existing.display_name = DEMO_DISPLAY_NAME
        await db.flush()
        return existing

    user = User(
        id=uuid.uuid4(),
        firebase_uid=firebase_uid,
        email=email,
        email_verified=True,
        display_name=DEMO_DISPLAY_NAME,
    )
    db.add(user)
    await db.flush()
    return user


async def _get_or_create_form(
    db: AsyncSession, owner: User, name: str, redirect_url: str | None = None
) -> Form:
    existing = (
        await db.execute(
            select(Form).where(Form.owner_id == owner.id, Form.name == name)
        )
    ).scalar_one_or_none()
    if existing:
        return existing
    form = Form(
        id=uuid.uuid4(),
        owner_id=owner.id,
        name=name,
        redirect_url=redirect_url,
    )
    db.add(form)
    await db.flush()
    return form


async def _seed_submissions(db: AsyncSession, form: Form, rows: list[dict]) -> int:
    """Insert rows only if the form currently has no submissions — idempotent."""
    count = (
        await db.execute(select(Submission).where(Submission.form_id == form.id))
    ).first()
    if count:
        return 0
    now = datetime.now(timezone.utc)
    for i, data in enumerate(rows):
        db.add(
            Submission(
                id=uuid.uuid4(),
                form_id=form.id,
                data=data,
                email_status="sent" if i < len(rows) - 1 else "failed",
                email_attempts=1 if i < len(rows) - 1 else 3,
                created_at=now - timedelta(minutes=5 * (len(rows) - i)),
            )
        )
    await db.flush()
    return len(rows)


async def seed(email: str = DEMO_EMAIL) -> None:
    if async_session_factory is None:
        print(
            "ERROR: async_session_factory is None. "
            "Set DATABASE_URL (e.g. sqlite+aiosqlite:///./dev.db) and run "
            "`alembic upgrade head` first.",
            file=sys.stderr,
        )
        sys.exit(1)

    async with async_session_factory() as db:
        user = await _upsert_user(db, email)

        contact_form = await _get_or_create_form(
            db, user, "Contact form", redirect_url=None
        )
        newsletter_form = await _get_or_create_form(
            db, user, "Newsletter sign-up", redirect_url="https://example.com/thanks"
        )

        contact_subs = [
            {"name": "Ada Lovelace", "email": "ada@example.com", "message": "Hi!"},
            {"name": "Alan Turing", "email": "alan@example.com", "message": "Hello"},
            {
                "name": "Grace Hopper",
                "email": "grace@example.com",
                "message": "Ship it",
                "priority": "high",
            },
        ]
        newsletter_subs = [
            {"email": "subscriber1@example.com"},
            {"email": "subscriber2@example.com", "referrer": "twitter"},
        ]

        added_contact = await _seed_submissions(db, contact_form, contact_subs)
        added_news = await _seed_submissions(db, newsletter_form, newsletter_subs)

        await db.commit()

    print(f"Seeded user: {email}  (firebase_uid = {uid_for(email)})")
    print(f"  Forms:        Contact form, Newsletter sign-up")
    print(f"  Submissions:  +{added_contact} contact, +{added_news} newsletter")
    print()
    print("In the mock-auth frontend, sign in with this email (any password).")


def main() -> None:
    email = sys.argv[1] if len(sys.argv) > 1 else DEMO_EMAIL
    asyncio.run(seed(email))


if __name__ == "__main__":
    main()
