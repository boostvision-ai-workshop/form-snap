"""Test configuration and fixtures."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest_asyncio.fixture
async def client():
    """Async HTTP client for testing FastAPI app without external services."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        yield client


@pytest.fixture
def mock_firebase_verify():
    """Patch verify_firebase_token for tests."""
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
