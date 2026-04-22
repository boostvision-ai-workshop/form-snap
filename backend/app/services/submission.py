"""Submission service — persist incoming submissions, update email status, list and export."""

import csv
import io
import re
import uuid
from collections.abc import AsyncIterator
from typing import TYPE_CHECKING

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.submission import Submission

if TYPE_CHECKING:
    from app.schemas.submission import SubmissionPage, SubmissionResponse


async def persist_submission(
    db: AsyncSession,
    form_id: uuid.UUID,
    data: dict,
) -> Submission:
    """Insert a new submission row with email_status='pending' and email_attempts=0."""
    submission = Submission(
        form_id=form_id,
        data=data,
    )
    db.add(submission)
    await db.commit()
    await db.refresh(submission)
    return submission


async def mark_email_status(
    db: AsyncSession,
    submission_id: uuid.UUID,
    *,
    status: str,
    attempts: int,
) -> None:
    """Update the email_status and email_attempts on a submission row.

    Called by send_notification_with_retry after each attempt cycle.
    `status` must be one of 'pending', 'sent', 'failed'.
    `attempts` is clamped to [0, 3] by the DB CHECK constraint.
    """
    from sqlalchemy import select

    result = await db.execute(
        select(Submission).where(Submission.id == submission_id)
    )
    submission = result.scalar_one_or_none()
    if submission is None:
        return  # Row deleted between persist and email — nothing to update

    submission.email_status = status
    submission.email_attempts = attempts
    await db.commit()


def _sanitize_filename(name: str, form_id: uuid.UUID) -> str:
    """Sanitize form name for use as a CSV filename.

    Replaces any run of non-alphanumeric/dot/underscore/dash characters with
    a single dash. Falls back to ``form-<id8>`` if the result is empty.
    """
    sanitized = re.sub(r"[^A-Za-z0-9._-]+", "-", name).strip("-")
    if not sanitized:
        sanitized = f"form-{str(form_id)[:8]}"
    return f"{sanitized}-submissions.csv"


async def list_submissions(
    db: AsyncSession,
    owner_id: uuid.UUID,
    form_id: uuid.UUID,
    page: int,
    page_size: int,
) -> "SubmissionPage | None":
    """Return a paginated page of submissions for a form owned by owner_id.

    Returns None if the form does not exist or is not owned by owner_id (→ 404).
    """
    from app.schemas.submission import SubmissionPage, SubmissionResponse
    from app.services.form import get_form_for_owner

    form = await get_form_for_owner(db, owner_id=owner_id, form_id=form_id)
    if form is None:
        return None

    # Count total rows
    count_stmt = select(func.count()).where(Submission.form_id == form_id)
    total: int = (await db.execute(count_stmt)).scalar_one()

    # Paginated rows, newest first
    offset = (page - 1) * page_size
    rows_stmt = (
        select(Submission)
        .where(Submission.form_id == form_id)
        .order_by(Submission.created_at.desc())
        .offset(offset)
        .limit(page_size)
    )
    result = await db.execute(rows_stmt)
    rows = result.scalars().all()

    items = [
        SubmissionResponse(
            id=str(row.id),
            created_at=row.created_at,
            data=row.data,
            email_status=row.email_status,
            email_attempts=row.email_attempts,
        )
        for row in rows
    ]

    return SubmissionPage(items=items, page=page, page_size=page_size, total=total)


async def stream_submissions_csv(
    db: AsyncSession,
    owner_id: uuid.UUID,
    form_id: uuid.UUID,
) -> "tuple[AsyncIterator[str], str] | None":
    """Stream all submissions as CSV rows, yielding string chunks.

    Returns None if the form does not exist or is not owned by owner_id (→ 404).
    Returns a tuple of (async_iterator, filename) on success.

    CSV format:
    - Column order: ``submitted_at``, then alphabetically sorted union of all keys.
    - One row per submission, newest first.
    - Empty string for missing fields (never ``null``).
    - Nested dicts/lists JSON-serialized into the cell.
    """
    import json

    from app.services.form import get_form_for_owner

    form = await get_form_for_owner(db, owner_id=owner_id, form_id=form_id)
    if form is None:
        return None

    filename = _sanitize_filename(form.name, form.id)

    # Load all rows for this form (two-pass: collect keys, then render)
    # For MVP scale (≤ 10k rows) this is acceptable; yield_per would be added at scale.
    rows_stmt = (
        select(Submission)
        .where(Submission.form_id == form_id)
        .order_by(Submission.created_at.desc())
    )
    result = await db.execute(rows_stmt)
    all_rows = result.scalars().all()

    # First pass: compute union of all keys alphabetically
    all_keys: set[str] = set()
    for row in all_rows:
        if isinstance(row.data, dict):
            all_keys.update(row.data.keys())
    sorted_keys = sorted(all_keys)
    columns = ["submitted_at"] + sorted_keys

    async def _generate() -> AsyncIterator[str]:
        buf = io.StringIO()
        writer = csv.writer(buf)

        # Header row
        writer.writerow(columns)
        yield buf.getvalue()
        buf.truncate(0)
        buf.seek(0)

        # Data rows
        for row in all_rows:
            data = row.data if isinstance(row.data, dict) else {}
            cells = [row.created_at.isoformat()]
            for key in sorted_keys:
                val = data.get(key, "")
                if isinstance(val, (dict, list)):
                    val = json.dumps(val, ensure_ascii=False)
                elif val is None:
                    val = ""
                cells.append(val)
            writer.writerow(cells)
            yield buf.getvalue()
            buf.truncate(0)
            buf.seek(0)

    return _generate(), filename
