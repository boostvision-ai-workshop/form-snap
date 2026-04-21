"""Submission service — persist incoming submissions and update email status."""

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.submission import Submission


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
