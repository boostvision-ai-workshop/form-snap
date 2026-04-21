"""Base email provider Protocol and shared data classes."""

from typing import Protocol, runtime_checkable


@runtime_checkable
class EmailProvider(Protocol):
    """Protocol for email notification providers.

    Implementations: ResendProvider (production), NoopProvider (dev/test).
    """

    async def send(
        self,
        *,
        to: str,
        subject: str,
        text: str,
        html: str,
    ) -> None:
        """Send a single email message.

        Raises an exception on failure so the caller can retry.
        """
        ...
