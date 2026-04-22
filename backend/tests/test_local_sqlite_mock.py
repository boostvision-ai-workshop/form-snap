"""Tests for local-dev mode: SQLite + mock auth provider.

These tests exercise:
  - verify_mock_token accepts well-formed mock: tokens
  - verify_mock_token rejects malformed tokens
  - get_current_user dispatches to mock provider when AUTH_PROVIDER=mock
  - Alembic upgrade head runs cleanly against an in-memory SQLite database
  - GET /api/v1/me with a mock bearer creates the user row on SQLite
"""

import asyncio

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient


# ---------------------------------------------------------------------------
# Unit tests: mock token parsing
# ---------------------------------------------------------------------------


def test_mock_token_valid():
    from app.core.mock_provider import verify_mock_token

    claims = verify_mock_token("mock:user1:dev@example.com:false")
    assert claims["uid"] == "user1"
    assert claims["email"] == "dev@example.com"
    assert claims["email_verified"] is False
    assert claims["name"] is None
    assert claims["picture"] is None


def test_mock_token_verified_true():
    from app.core.mock_provider import verify_mock_token

    claims = verify_mock_token("mock:user2:verified@example.com:true")
    assert claims["email_verified"] is True


def test_mock_token_wrong_prefix():
    from app.core.mock_provider import verify_mock_token

    with pytest.raises(ValueError, match="Not a mock token"):
        verify_mock_token("firebase:user1:dev@example.com:false")


def test_mock_token_too_few_parts():
    from app.core.mock_provider import verify_mock_token

    # Should raise because there are only 3 parts
    with pytest.raises(ValueError):
        verify_mock_token("mock:user1:dev@example.com")


def test_mock_token_empty_uid():
    from app.core.mock_provider import verify_mock_token

    with pytest.raises(ValueError, match="uid must not be empty"):
        verify_mock_token("mock::dev@example.com:false")


def test_mock_token_bad_email():
    from app.core.mock_provider import verify_mock_token

    with pytest.raises(ValueError, match="email"):
        verify_mock_token("mock:user1:notanemail:false")


def test_mock_token_bad_verified_flag():
    from app.core.mock_provider import verify_mock_token

    with pytest.raises(ValueError, match="verified flag"):
        verify_mock_token("mock:user1:dev@example.com:yes")


# ---------------------------------------------------------------------------
# Integration: mock provider returns 401 for malformed token via HTTP
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_get_current_user_mock_valid(monkeypatch):
    """When AUTH_PROVIDER=mock, a valid mock: token is accepted."""
    monkeypatch.setenv("AUTH_PROVIDER", "mock")

    # Re-import settings and patch the module-level value used in security.py
    import app.config as cfg
    import app.core.security as sec

    original_provider = cfg.settings.AUTH_PROVIDER
    cfg.settings.AUTH_PROVIDER = "mock"
    try:
        from app.main import app

        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.get(
                "/api/v1/me",
                headers={"Authorization": "Bearer mock:localuser:dev@example.com:false"},
            )
        assert response.status_code == 200
        data = response.json()
        assert data["uid"] == "localuser"
        assert data["email"] == "dev@example.com"
        assert data["email_verified"] is False
    finally:
        cfg.settings.AUTH_PROVIDER = original_provider


@pytest.mark.asyncio
async def test_get_current_user_mock_invalid(monkeypatch):
    """When AUTH_PROVIDER=mock, a malformed token returns 401."""
    import app.config as cfg

    original_provider = cfg.settings.AUTH_PROVIDER
    cfg.settings.AUTH_PROVIDER = "mock"
    try:
        from app.main import app

        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.get(
                "/api/v1/me",
                headers={"Authorization": "Bearer this-is-not-a-mock-token"},
            )
        assert response.status_code == 401
    finally:
        cfg.settings.AUTH_PROVIDER = original_provider


# ---------------------------------------------------------------------------
# Integration: Alembic upgrade head on in-memory SQLite
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_alembic_upgrade_head_sqlite():
    """alembic upgrade head must complete without error on a fresh SQLite DB."""
    import os

    from alembic import command
    from alembic.config import Config

    # Locate alembic.ini relative to the backend directory
    backend_dir = os.path.join(os.path.dirname(__file__), "..")
    alembic_ini = os.path.join(backend_dir, "alembic.ini")

    alembic_cfg = Config(alembic_ini)
    # Use a file-based SQLite DB for Alembic (in-memory doesn't persist across connections)
    db_path = os.path.join(backend_dir, "_test_alembic_tmp.db")
    alembic_cfg.set_main_option(
        "sqlalchemy.url", f"sqlite+aiosqlite:///{db_path}"
    )

    try:
        # Run in a thread because alembic uses asyncio.run internally
        await asyncio.get_event_loop().run_in_executor(
            None, lambda: command.upgrade(alembic_cfg, "head")
        )
    finally:
        if os.path.exists(db_path):
            os.remove(db_path)


# ---------------------------------------------------------------------------
# Integration: GET /api/v1/me creates user on SQLite (mock auth)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_me_sqlite_mock_creates_user(tmp_path):
    """GET /api/v1/me with mock auth and SQLite DB provisions a user row."""
    import os

    from alembic import command
    from alembic.config import Config

    db_file = tmp_path / "test_me.db"
    db_url = f"sqlite+aiosqlite:///{db_file}"

    # Run migrations first
    backend_dir = os.path.join(os.path.dirname(__file__), "..")
    alembic_ini = os.path.join(backend_dir, "alembic.ini")
    alembic_cfg = Config(alembic_ini)
    alembic_cfg.set_main_option("sqlalchemy.url", db_url)
    await asyncio.get_event_loop().run_in_executor(
        None, lambda: command.upgrade(alembic_cfg, "head")
    )

    import app.config as cfg
    import app.database as db_module
    from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

    original_provider = cfg.settings.AUTH_PROVIDER
    original_engine = db_module.engine
    original_factory = db_module.async_session_factory

    test_engine = create_async_engine(db_url, echo=False)
    test_factory = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)

    cfg.settings.AUTH_PROVIDER = "mock"
    db_module.engine = test_engine
    db_module.async_session_factory = test_factory

    try:
        from app.main import app

        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.get(
                "/api/v1/me",
                headers={"Authorization": "Bearer mock:sqliteuser:sqlite@example.com:true"},
            )

        assert response.status_code == 200
        data = response.json()
        assert data["uid"] == "sqliteuser"
        assert data["email"] == "sqlite@example.com"
        assert data["email_verified"] is True
        assert data["id"] is not None
        assert data["created_at"] is not None
    finally:
        cfg.settings.AUTH_PROVIDER = original_provider
        db_module.engine = original_engine
        db_module.async_session_factory = original_factory
        await test_engine.dispose()
