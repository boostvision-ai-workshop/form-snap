"""Resend email provider — sends transactional emails via the Resend API."""

import logging

import httpx

logger = logging.getLogger(__name__)

RESEND_API_URL = "https://api.resend.com/emails"


class ResendProvider:
    """EmailProvider implementation backed by the Resend HTTP API."""

    def __init__(self, api_key: str, from_address: str) -> None:
        self._api_key = api_key
        self._from_address = from_address

    async def send(
        self,
        *,
        to: str,
        subject: str,
        text: str,
        html: str,
    ) -> None:
        """POST to Resend API. Raises RuntimeError on non-2xx response."""
        payload = {
            "from": self._from_address,
            "to": [to],
            "subject": subject,
            "text": text,
            "html": html,
        }
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                RESEND_API_URL,
                json=payload,
                headers={
                    "Authorization": f"Bearer {self._api_key}",
                    "Content-Type": "application/json",
                },
            )
        if not response.is_success:
            raise RuntimeError(
                f"Resend API error {response.status_code}: {response.text}"
            )
        logger.info(
            "ResendProvider: email sent to=%r subject=%r status=%s",
            to,
            subject,
            response.status_code,
        )
