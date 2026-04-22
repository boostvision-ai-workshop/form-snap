"""Tests for GET /api/v1/me — covers AT-021 and AT-024."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest


# ---------------------------------------------------------------------------
# AT-024: All /api/v1/* endpoints reject requests without a Bearer token
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_me_no_token_returns_401(client):
    """GET /api/v1/me without token returns 401."""
    response = await client.get("/api/v1/me")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_me_invalid_token_returns_401(client):
    """GET /api/v1/me with an invalid Firebase token returns 401."""
    with patch("app.core.security.verify_firebase_token") as mock_verify:
        from firebase_admin import auth as firebase_auth

        mock_verify.side_effect = firebase_auth.InvalidIdTokenError("bad token")
        response = await client.get(
            "/api/v1/me",
            headers={"Authorization": "Bearer bad-token"},
        )
        assert response.status_code == 401


# ---------------------------------------------------------------------------
# AT-021: GET /api/v1/me returns the profile (lazy provision when no DB)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_me_valid_token_no_db(client):
    """GET /api/v1/me with valid token but no DB returns 200 with all required fields."""
    fake_claims = {
        "uid": "firebase-uid-001",
        "email": "alice@example.com",
        "email_verified": False,
    }
    with patch("app.core.security.verify_firebase_token", return_value=fake_claims):
        response = await client.get(
            "/api/v1/me",
            headers={"Authorization": "Bearer valid-token"},
        )
    assert response.status_code == 200
    data = response.json()
    assert data["uid"] == "firebase-uid-001"
    assert data["email"] == "alice@example.com"
    assert data["email_verified"] is False
    # id and created_at must be present (AT-021 requires them)
    assert data["id"] is not None
    assert data["created_at"] is not None


@pytest.mark.asyncio
async def test_me_email_verified_propagated(client):
    """email_verified=True in the token is reflected in the response."""
    fake_claims = {
        "uid": "firebase-uid-verified",
        "email": "bob@example.com",
        "email_verified": True,
    }
    with patch("app.core.security.verify_firebase_token", return_value=fake_claims):
        response = await client.get(
            "/api/v1/me",
            headers={"Authorization": "Bearer valid-token"},
        )
    assert response.status_code == 200
    data = response.json()
    assert data["email_verified"] is True


@pytest.mark.asyncio
async def test_me_with_db_creates_and_returns_user(client, mock_db_session):
    """GET /api/v1/me with valid token and a mocked DB lazily provisions and returns
    a user row with all required AT-021 fields.

    Patches app.dependencies.async_session_factory so get_db_optional yields our
    mock session, then patches get_or_create_user so no live SQL is executed.
    """
    import uuid
    from datetime import datetime, timezone

    fake_uid = "firebase-uid-db-test"
    fake_email = "carol@example.com"
    fake_user_id = uuid.uuid4()
    fake_now = datetime(2026, 4, 21, 10, 0, 0, tzinfo=timezone.utc)

    fake_claims = {
        "uid": fake_uid,
        "email": fake_email,
        "email_verified": False,
    }

    # Build a mock User object returned by get_or_create_user
    mock_user = MagicMock()
    mock_user.id = fake_user_id
    mock_user.email = fake_email
    mock_user.email_verified = False
    mock_user.display_name = None
    mock_user.avatar_url = None
    mock_user.created_at = fake_now

    # Provide a non-None factory so get_db_optional branches into the DB path.
    mock_ctx = MagicMock()
    mock_ctx.__aenter__ = AsyncMock(return_value=mock_db_session)
    mock_ctx.__aexit__ = AsyncMock(return_value=False)
    mock_factory = MagicMock(return_value=mock_ctx)

    with (
        patch("app.core.security.verify_firebase_token", return_value=fake_claims),
        # Patch in the dependencies module (where get_db_optional reads it)
        patch("app.dependencies.async_session_factory", mock_factory),
        patch(
            "app.api.v1.me.get_or_create_user",
            new=AsyncMock(return_value=(mock_user, True)),
        ),
    ):
        response = await client.get(
            "/api/v1/me",
            headers={"Authorization": "Bearer valid-token"},
        )

    assert response.status_code == 200
    data = response.json()
    assert data["uid"] == fake_uid
    assert data["id"] == str(fake_user_id)
    assert data["email"] == fake_email
    assert data["email_verified"] is False
    assert data["created_at"] is not None


# ---------------------------------------------------------------------------
# AT-024 extended: other /api/v1/* endpoints also require auth
# (the health endpoint is excluded — it's public by design)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_various_api_v1_endpoints_require_auth(client):
    """A sample of /api/v1/* endpoints return 401 when no token is provided."""
    endpoints = [
        ("GET", "/api/v1/me"),
    ]
    # Batch-2 endpoints (/api/v1/forms, etc.) are tested in test_forms.py
    for method, path in endpoints:
        response = await client.request(method, path)
        assert response.status_code == 401, (
            f"{method} {path} should return 401 but got {response.status_code}"
        )
