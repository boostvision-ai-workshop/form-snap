"""Email service package.

Public surface:
- `get_provider()` — returns the configured EmailProvider instance.
- `send_notification_with_retry` — background task for submission emails.

Configuration (via `app.config.settings`):
- `EMAIL_PROVIDER`: "resend" (default) | "noop"
- `RESEND_API_KEY`: required when provider == "resend"
- `EMAIL_FROM`: sender address for Resend
"""

from app.services.email.base import EmailProvider
from app.services.email.sender import send_notification_with_retry

__all__ = ["EmailProvider", "get_provider", "send_notification_with_retry"]

_provider_instance: "EmailProvider | None" = None


def get_provider() -> "EmailProvider":
    """Return (or lazily create) the configured email provider."""
    global _provider_instance  # noqa: PLW0603

    if _provider_instance is not None:
        return _provider_instance

    from app.config import settings

    provider_name = settings.EMAIL_PROVIDER.lower()

    if provider_name == "noop":
        from app.services.email.noop_provider import NoopProvider

        _provider_instance = NoopProvider()
    else:
        # Default to Resend
        from app.services.email.resend_provider import ResendProvider

        _provider_instance = ResendProvider(
            api_key=settings.RESEND_API_KEY,
            from_address=settings.EMAIL_FROM,
        )

    return _provider_instance


def _reset_provider() -> None:
    """Reset the singleton — used in tests to inject a custom provider."""
    global _provider_instance  # noqa: PLW0603
    _provider_instance = None
