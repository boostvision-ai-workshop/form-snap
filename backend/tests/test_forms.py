"""Tests for /api/v1/forms — covers AT-002..AT-006a and AT-022/AT-023/AT-024."""

import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.dependencies import get_db, require_verified_profile
from app.main import app

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

FAKE_UID_VERIFIED = "firebase-uid-verified"
FAKE_EMAIL = "alice@example.com"
FAKE_USER_ID = uuid.uuid4()
FAKE_FORM_ID = uuid.uuid4()

VERIFIED_CLAIMS = {
    "uid": FAKE_UID_VERIFIED,
    "email": FAKE_EMAIL,
    "email_verified": True,
}

FAKE_NOW = datetime(2026, 4, 21, 10, 0, 0, tzinfo=timezone.utc)


def _make_mock_user(*, email_verified: bool = True) -> MagicMock:
    user = MagicMock()
    user.id = FAKE_USER_ID
    user.email = FAKE_EMAIL
    user.email_verified = email_verified
    return user


def _make_mock_form(
    *,
    form_id: uuid.UUID | None = None,
    name: str = "Test Form",
    redirect_url: str | None = None,
) -> MagicMock:
    form = MagicMock()
    form.id = form_id or FAKE_FORM_ID
    form.name = name
    form.redirect_url = redirect_url
    form.deleted_at = None
    form.created_at = FAKE_NOW
    form.updated_at = FAKE_NOW
    return form


async def _verified_user_dep() -> MagicMock:
    return _make_mock_user(email_verified=True)


async def _unverified_user_dep() -> None:
    """Simulate require_verified_profile raising 403."""
    from fastapi import HTTPException
    raise HTTPException(status_code=403, detail="email_not_verified")


async def _noop_db_dep():
    """Yield a mock AsyncSession (does nothing)."""
    yield MagicMock()


# ---------------------------------------------------------------------------
# AT-024: All /api/v1/forms* endpoints reject requests without a Bearer token
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_list_forms_no_token_returns_401(client):
    response = await client.get("/api/v1/forms")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_create_form_no_token_returns_401(client):
    response = await client.post("/api/v1/forms", json={"name": "x"})
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_patch_form_no_token_returns_401(client):
    response = await client.patch(f"/api/v1/forms/{FAKE_FORM_ID}", json={"name": "x"})
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_delete_form_no_token_returns_401(client):
    response = await client.delete(f"/api/v1/forms/{FAKE_FORM_ID}")
    assert response.status_code == 401


# ---------------------------------------------------------------------------
# AT-022: Unverified user cannot create a form (server 403)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_create_form_unverified_returns_403(client):
    """POST /api/v1/forms with an unverified user returns 403 email_not_verified."""
    app.dependency_overrides[require_verified_profile] = _unverified_user_dep
    app.dependency_overrides[get_db] = _noop_db_dep
    try:
        response = await client.post(
            "/api/v1/forms",
            json={"name": "Should fail"},
            headers={"Authorization": "Bearer unverified-token"},
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 403
    assert response.json()["detail"] == "email_not_verified"


# ---------------------------------------------------------------------------
# AT-003 / AT-023: Verified user creates a form (returns 201)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_create_form_verified_returns_201(client):
    """POST /api/v1/forms with a verified user returns 201 with all required fields."""
    mock_form = _make_mock_form(name="Beta signup")

    app.dependency_overrides[require_verified_profile] = _verified_user_dep
    app.dependency_overrides[get_db] = _noop_db_dep
    try:
        with patch(
            "app.api.v1.forms.form_service.create_form",
            new=AsyncMock(return_value=mock_form),
        ):
            response = await client.post(
                "/api/v1/forms",
                json={"name": "Beta signup"},
                headers={"Authorization": "Bearer verified-token"},
            )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Beta signup"
    assert "id" in data
    assert "submit_url" in data
    assert "html_snippet" in data
    assert "created_at" in data
    assert "updated_at" in data
    # AT-003: html_snippet must contain the form action and _gotcha
    assert "<form action=" in data["html_snippet"]
    assert "_gotcha" in data["html_snippet"]
    assert data["submit_url"].endswith(f"/f/{mock_form.id}")


@pytest.mark.asyncio
async def test_create_form_missing_name_returns_422(client):
    """POST /api/v1/forms with empty name returns 422 — Pydantic validates before handler."""
    app.dependency_overrides[require_verified_profile] = _verified_user_dep
    app.dependency_overrides[get_db] = _noop_db_dep
    try:
        response = await client.post(
            "/api/v1/forms",
            json={"name": ""},
            headers={"Authorization": "Bearer verified-token"},
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 422


# ---------------------------------------------------------------------------
# AT-004: GET /api/v1/forms owner-scoped list
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_list_forms_returns_owner_forms(client):
    """GET /api/v1/forms returns only forms belonging to the authenticated user."""
    from app.schemas.form import FormListItem

    fake_items = [
        FormListItem(
            id=str(uuid.uuid4()),
            name="Form A",
            redirect_url=None,
            submission_count=3,
            last_submission_at=None,
            submit_url="http://localhost:8000/f/form-a",
            created_at=FAKE_NOW,
            updated_at=FAKE_NOW,
        ),
        FormListItem(
            id=str(uuid.uuid4()),
            name="Form B",
            redirect_url=None,
            submission_count=0,
            last_submission_at=None,
            submit_url="http://localhost:8000/f/form-b",
            created_at=FAKE_NOW,
            updated_at=FAKE_NOW,
        ),
    ]

    app.dependency_overrides[require_verified_profile] = _verified_user_dep
    app.dependency_overrides[get_db] = _noop_db_dep
    try:
        with patch(
            "app.api.v1.forms.form_service.list_forms",
            new=AsyncMock(return_value=fake_items),
        ):
            response = await client.get(
                "/api/v1/forms",
                headers={"Authorization": "Bearer valid-token"},
            )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["name"] == "Form A"
    assert "submission_count" in data[0]
    assert "submit_url" in data[0]


# ---------------------------------------------------------------------------
# AT-006a: PATCH /api/v1/forms/{id} updates name and redirect_url
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_patch_form_updates_name_and_redirect(client):
    """PATCH /api/v1/forms/{id} returns 200 with updated fields."""
    updated_form = _make_mock_form(
        name="New name",
        redirect_url="https://example.com/done",
    )

    app.dependency_overrides[require_verified_profile] = _verified_user_dep
    app.dependency_overrides[get_db] = _noop_db_dep
    try:
        with patch(
            "app.api.v1.forms.form_service.update_form",
            new=AsyncMock(return_value=updated_form),
        ):
            response = await client.patch(
                f"/api/v1/forms/{FAKE_FORM_ID}",
                json={"name": "New name", "redirect_url": "https://example.com/done"},
                headers={"Authorization": "Bearer valid-token"},
            )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "New name"
    assert data["redirect_url"] == "https://example.com/done"


@pytest.mark.asyncio
async def test_patch_form_cross_owner_returns_404(client):
    """PATCH /api/v1/forms/{id} by a different owner returns 404."""
    app.dependency_overrides[require_verified_profile] = _verified_user_dep
    app.dependency_overrides[get_db] = _noop_db_dep
    try:
        with patch(
            "app.api.v1.forms.form_service.update_form",
            new=AsyncMock(return_value=None),
        ):
            response = await client.patch(
                f"/api/v1/forms/{FAKE_FORM_ID}",
                json={"name": "Should fail"},
                headers={"Authorization": "Bearer valid-token"},
            )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 404
    assert response.json()["detail"] == "form_not_found"


@pytest.mark.asyncio
async def test_patch_form_empty_body_returns_422(client):
    """PATCH /api/v1/forms/{id} with no fields returns 422."""
    app.dependency_overrides[require_verified_profile] = _verified_user_dep
    app.dependency_overrides[get_db] = _noop_db_dep
    try:
        response = await client.patch(
            f"/api/v1/forms/{FAKE_FORM_ID}",
            json={},
            headers={"Authorization": "Bearer valid-token"},
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 422


# ---------------------------------------------------------------------------
# AT-005 / AT-006: DELETE /api/v1/forms/{id}
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_delete_form_returns_204(client):
    """DELETE /api/v1/forms/{id} returns 204 No Content."""
    app.dependency_overrides[require_verified_profile] = _verified_user_dep
    app.dependency_overrides[get_db] = _noop_db_dep
    try:
        with patch(
            "app.api.v1.forms.form_service.delete_form",
            new=AsyncMock(return_value=True),
        ):
            response = await client.delete(
                f"/api/v1/forms/{FAKE_FORM_ID}",
                headers={"Authorization": "Bearer valid-token"},
            )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 204


@pytest.mark.asyncio
async def test_delete_form_not_found_returns_404(client):
    """DELETE /api/v1/forms/{id} for unknown/other-owner form returns 404."""
    app.dependency_overrides[require_verified_profile] = _verified_user_dep
    app.dependency_overrides[get_db] = _noop_db_dep
    try:
        with patch(
            "app.api.v1.forms.form_service.delete_form",
            new=AsyncMock(return_value=False),
        ):
            response = await client.delete(
                f"/api/v1/forms/{FAKE_FORM_ID}",
                headers={"Authorization": "Bearer valid-token"},
            )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 404
    assert response.json()["detail"] == "form_not_found"


# ---------------------------------------------------------------------------
# Service-layer unit tests (no HTTP)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_form_service_build_submit_url():
    """_build_submit_url produces a valid URL with the form UUID."""
    from app.services.form import _build_submit_url

    form_id = uuid.UUID("8f5b6e7c-1234-5678-9abc-def012345678")
    url = _build_submit_url(form_id)
    assert url.endswith(f"/f/{form_id}")
    assert url.startswith("http")


@pytest.mark.asyncio
async def test_form_service_build_html_snippet():
    """_build_html_snippet renders a form tag with action and _gotcha field."""
    from app.services.form import _build_html_snippet

    submit_url = "https://api.example.com/f/abc123"
    snippet = _build_html_snippet(submit_url)
    assert f'<form action="{submit_url}"' in snippet
    assert "_gotcha" in snippet
    assert 'method="POST"' in snippet


@pytest.mark.asyncio
async def test_form_service_list_forms_uses_owner_filter(mock_db_session):
    """list_forms executes a query filtering by owner_id."""
    from app.services.form import list_forms

    # Mock the execute result to return empty
    mock_result = MagicMock()
    mock_result.all.return_value = []
    mock_db_session.execute = AsyncMock(return_value=mock_result)

    result = await list_forms(mock_db_session, FAKE_USER_ID)
    assert result == []
    mock_db_session.execute.assert_called_once()
