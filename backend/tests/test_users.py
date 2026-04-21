"""Tests for /api/v1/users/me endpoint."""

from unittest.mock import patch

import pytest


@pytest.mark.asyncio
async def test_users_me_no_token(client):
    """GET /api/v1/users/me without token returns 401 (HTTPBearer default)."""
    response = await client.get("/api/v1/users/me")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_users_me_invalid_token(client):
    """GET /api/v1/users/me with invalid token returns 401."""
    with patch("app.core.security.verify_firebase_token") as mock_verify:
        from firebase_admin import auth as firebase_auth

        mock_verify.side_effect = firebase_auth.InvalidIdTokenError("bad token")
        response = await client.get(
            "/api/v1/users/me",
            headers={"Authorization": "Bearer fake-token"},
        )
        assert response.status_code == 401


@pytest.mark.asyncio
async def test_users_me_valid_token(client):
    """GET /api/v1/users/me with valid mocked token returns 200."""
    fake_decoded = {
        "uid": "test-uid-123",
        "email": "test@example.com",
        "email_verified": True,
    }
    with patch("app.core.security.verify_firebase_token", return_value=fake_decoded):
        response = await client.get(
            "/api/v1/users/me",
            headers={"Authorization": "Bearer fake-valid-token"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["uid"] == "test-uid-123"
        assert data["email"] == "test@example.com"
        assert data["email_verified"] is True
        assert data["id"] is None
        assert data["display_name"] is None
        assert data["avatar_url"] is None
        assert data["created_at"] is None


@pytest.mark.asyncio
async def test_users_me_without_db(client):
    """GET /api/v1/users/me with valid token but no DB returns token-only data."""
    fake_decoded = {
        "uid": "test-uid-no-db",
        "email": "nodbuser@example.com",
        "email_verified": False,
    }
    with patch("app.core.security.verify_firebase_token", return_value=fake_decoded):
        response = await client.get(
            "/api/v1/users/me",
            headers={"Authorization": "Bearer fake-valid-token"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["uid"] == "test-uid-no-db"
        assert data["email"] == "nodbuser@example.com"
        assert data["email_verified"] is False
        assert data["id"] is None
        assert data["display_name"] is None
        assert data["avatar_url"] is None
        assert data["created_at"] is None
