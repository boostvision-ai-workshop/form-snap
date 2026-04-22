"""No-op email provider — logs the notification, never delivers anything.

Used in development and tests (EMAIL_PROVIDER=noop).
"""

import logging

logger = logging.getLogger(__name__)


class NoopProvider:
    """EmailProvider implementation that silently discards all emails."""

    async def send(
        self,
        *,
        to: str,
        subject: str,
        text: str,
        html: str,
    ) -> None:
        logger.info(
            "NoopProvider: would send email to=%r subject=%r (suppressed)",
            to,
            subject,
        )
