"""Test configuration and fixtures."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.fixture(autouse=True)
def _default_auth_provider_firebase(monkeypatch):
    """Default tests to AUTH_PROVIDER=firebase so a local .env (mock mode)
    doesn't break tests that rely on patching verify_firebase_token.

    Tests that want the mock path explicitly set it via monkeypatch themselves.
    """
    from app.config import settings

    monkeypatch.setattr(settings, "AUTH_PROVIDER", "firebase")
    yield


@pytest_asyncio.fixture
async def client():
    """Async HTTP client for testing FastAPI app without external services."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        yield client


@pytest.fixture
def mock_firebase_verify(monkeypatch):
    """Patch verify_firebase_token for tests.

    Also forces AUTH_PROVIDER=firebase so the Firebase dispatch branch runs
    even when a local .env sets AUTH_PROVIDER=mock for dev.
    """
    from app.config import settings

    monkeypatch.setattr(settings, "AUTH_PROVIDER", "firebase")
    with patch("app.core.security.verify_firebase_token") as mock:
        yield mock


@pytest.fixture
def auth_headers():
    """Return auth headers with a fake token."""
    return {"Authorization": "Bearer fake-test-token"}


@pytest.fixture
def mock_db_session():
    """Create a mock AsyncSession for testing."""
    session = AsyncMock()
    session.commit = AsyncMock()
    session.refresh = AsyncMock()
    session.execute = AsyncMock()
    session.add = MagicMock()
    return session
