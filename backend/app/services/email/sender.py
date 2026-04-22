"""send_notification_with_retry — background task for submission email notifications.

Retry logic: up to 3 attempts with exponential back-off (1 s, 2 s, 4 s).
After exhausting retries, marks email_status='failed' and email_attempts=3.
On success, marks email_status='sent' and email_attempts=<actual attempt number>.
"""

import asyncio
import logging
import uuid

import app.database as _db_module
from app.models.form import Form
from app.models.submission import Submission
from app.services.email.templates import render_notification
from app.services.submission import mark_email_status

logger = logging.getLogger(__name__)

_MAX_ATTEMPTS = 3
_BACKOFF_BASE = 1.0  # seconds; doubled each retry


async def send_notification_with_retry(submission_id: uuid.UUID) -> None:
    """Background task: fetch submission + form + owner, send email with retry.

    All DB access uses a fresh session opened from app.database.async_session_factory
    (not the request session which may already be closed when the task runs).
    """
    from sqlalchemy import select

    from app.config import settings

    async_session_factory = _db_module.async_session_factory

    if async_session_factory is None:
        logger.warning(
            "send_notification_with_retry: no DB configured, skipping for submission %s",
            submission_id,
        )
        return

    provider = _get_provider()

    # --- Load submission + form + owner in one shot ---
    async with async_session_factory() as db:
        result = await db.execute(
            select(Submission).where(Submission.id == submission_id)
        )
        submission = result.scalar_one_or_none()
        if submission is None:
            logger.warning(
                "send_notification_with_retry: submission %s not found", submission_id
            )
            return

        form_result = await db.execute(
            select(Form).where(Form.id == submission.form_id)
        )
        form = form_result.scalar_one_or_none()
        if form is None:
            logger.warning(
                "send_notification_with_retry: form %s not found for submission %s",
                submission.form_id,
                submission_id,
            )
            return

        # Eagerly load the owner relationship to get the email address
        from app.models.user import User

        owner_result = await db.execute(
            select(User).where(User.id == form.owner_id)
        )
        owner = owner_result.scalar_one_or_none()
        if owner is None:
            logger.warning(
                "send_notification_with_retry: owner not found for form %s", form.id
            )
            return

        owner_email = owner.email
        form_name = form.name
        form_id_str = str(form.id)
        submission_data = submission.data or {}

    subject, text_body, html_body = render_notification(
        form_name=form_name,
        form_id=form_id_str,
        submission_data=submission_data,
        dashboard_base_url=settings.DASHBOARD_BASE_URL,
    )

    last_exc: Exception | None = None
    for attempt in range(1, _MAX_ATTEMPTS + 1):
        try:
            await provider.send(
                to=owner_email,
                subject=subject,
                text=text_body,
                html=html_body,
            )
            # Success — update DB and return
            async with async_session_factory() as db:
                await mark_email_status(
                    db,
                    submission_id,
                    status="sent",
                    attempts=attempt,
                )
            logger.info(
                "send_notification_with_retry: sent for submission %s (attempt %d)",
                submission_id,
                attempt,
            )
            return
        except Exception as exc:
            last_exc = exc
            logger.warning(
                "send_notification_with_retry: attempt %d/%d failed for submission %s: %s",
                attempt,
                _MAX_ATTEMPTS,
                submission_id,
                exc,
            )
            if attempt < _MAX_ATTEMPTS:
                backoff = _BACKOFF_BASE * (2 ** (attempt - 1))
                await asyncio.sleep(backoff)

    # All retries exhausted — mark failed
    async with async_session_factory() as db:
        await mark_email_status(
            db,
            submission_id,
            status="failed",
            attempts=_MAX_ATTEMPTS,
        )
    logger.error(
        "send_notification_with_retry: all %d attempts failed for submission %s: %s",
        _MAX_ATTEMPTS,
        submission_id,
        last_exc,
    )


def _get_provider():
    """Return the configured email provider singleton."""
    from app.services.email import get_provider

    return get_provider()
