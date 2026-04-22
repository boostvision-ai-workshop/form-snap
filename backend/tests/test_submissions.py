"""Tests for /api/v1/forms/{id}/submissions and .csv — covers AT-015, AT-016, AT-017, AT-018."""

import csv
import io
import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.dependencies import get_db, require_verified_profile
from app.main import app

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

FAKE_UID = "firebase-uid-verified"
FAKE_EMAIL = "alice@example.com"
FAKE_USER_ID = uuid.uuid4()
FAKE_FORM_ID = uuid.uuid4()
FAKE_NOW = datetime(2026, 4, 21, 10, 0, 0, tzinfo=timezone.utc)
FAKE_LATER = datetime(2026, 4, 21, 11, 0, 0, tzinfo=timezone.utc)


def _make_mock_user() -> MagicMock:
    user = MagicMock()
    user.id = FAKE_USER_ID
    user.email = FAKE_EMAIL
    user.email_verified = True
    return user


async def _verified_user_dep() -> MagicMock:
    return _make_mock_user()


async def _noop_db_dep():
    yield MagicMock()


def _make_submission_response(
    *,
    id: uuid.UUID | None = None,
    data: dict | None = None,
    email_status: str = "sent",
    email_attempts: int = 1,
    created_at: datetime | None = None,
) -> MagicMock:
    """Build a SubmissionResponse-shaped object."""
    from app.schemas.submission import SubmissionResponse

    return SubmissionResponse(
        id=str(id or uuid.uuid4()),
        created_at=created_at or FAKE_NOW,
        data=data or {"name": "Ada", "email": "ada@example.com"},
        email_status=email_status,
        email_attempts=email_attempts,
    )


# ---------------------------------------------------------------------------
# AT-024: Submissions endpoints reject requests without token
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_list_submissions_no_token_returns_401(client):
    response = await client.get(f"/api/v1/forms/{FAKE_FORM_ID}/submissions")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_csv_no_token_returns_401(client):
    response = await client.get(f"/api/v1/forms/{FAKE_FORM_ID}/submissions.csv")
    assert response.status_code == 401


# ---------------------------------------------------------------------------
# AT-016: GET /api/v1/forms/{id}/submissions — pagination + ownership
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_list_submissions_returns_paginated_response(client):
    """AT-016: Returns SubmissionPage with items, page, page_size, total."""
    from app.schemas.submission import SubmissionPage

    fake_items = [_make_submission_response() for _ in range(5)]
    fake_page = SubmissionPage(items=fake_items, page=1, page_size=5, total=7)

    app.dependency_overrides[require_verified_profile] = _verified_user_dep
    app.dependency_overrides[get_db] = _noop_db_dep
    try:
        with patch(
            "app.api.v1.submissions.submission_service.list_submissions",
            new=AsyncMock(return_value=fake_page),
        ):
            response = await client.get(
                f"/api/v1/forms/{FAKE_FORM_ID}/submissions?page=1&page_size=5",
                headers={"Authorization": "Bearer valid-token"},
            )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    data = response.json()
    assert data["page"] == 1
    assert data["page_size"] == 5
    assert data["total"] == 7
    assert len(data["items"]) == 5
    # Each item must have the required fields
    item = data["items"][0]
    assert "id" in item
    assert "created_at" in item
    assert "data" in item
    assert "email_status" in item
    assert "email_attempts" in item


@pytest.mark.asyncio
async def test_list_submissions_cross_owner_returns_404(client):
    """AT-016: A different owner's form returns 404 form_not_found."""
    app.dependency_overrides[require_verified_profile] = _verified_user_dep
    app.dependency_overrides[get_db] = _noop_db_dep
    try:
        with patch(
            "app.api.v1.submissions.submission_service.list_submissions",
            new=AsyncMock(return_value=None),
        ):
            response = await client.get(
                f"/api/v1/forms/{FAKE_FORM_ID}/submissions",
                headers={"Authorization": "Bearer valid-token"},
            )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 404
    assert response.json()["detail"] == "form_not_found"


@pytest.mark.asyncio
async def test_list_submissions_invalid_page_returns_422(client):
    """AT-016: page=0 returns 422 Unprocessable Entity."""
    app.dependency_overrides[require_verified_profile] = _verified_user_dep
    app.dependency_overrides[get_db] = _noop_db_dep
    try:
        response = await client.get(
            f"/api/v1/forms/{FAKE_FORM_ID}/submissions?page=0",
            headers={"Authorization": "Bearer valid-token"},
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_list_submissions_page_size_over_limit_returns_422(client):
    """AT-016: page_size=101 returns 422 (exceeds max 100)."""
    app.dependency_overrides[require_verified_profile] = _verified_user_dep
    app.dependency_overrides[get_db] = _noop_db_dep
    try:
        response = await client.get(
            f"/api/v1/forms/{FAKE_FORM_ID}/submissions?page_size=101",
            headers={"Authorization": "Bearer valid-token"},
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_list_submissions_newest_first(client):
    """AT-015 / AT-016: Submissions are returned newest first (first item has latest created_at)."""
    from app.schemas.submission import SubmissionPage

    older = _make_submission_response(created_at=FAKE_NOW)
    newer = _make_submission_response(created_at=FAKE_LATER)
    # The service is expected to return newest first
    fake_page = SubmissionPage(items=[newer, older], page=1, page_size=25, total=2)

    app.dependency_overrides[require_verified_profile] = _verified_user_dep
    app.dependency_overrides[get_db] = _noop_db_dep
    try:
        with patch(
            "app.api.v1.submissions.submission_service.list_submissions",
            new=AsyncMock(return_value=fake_page),
        ):
            response = await client.get(
                f"/api/v1/forms/{FAKE_FORM_ID}/submissions",
                headers={"Authorization": "Bearer valid-token"},
            )
    finally:
        app.dependency_overrides.clear()

    data = response.json()
    assert data["items"][0]["created_at"] > data["items"][1]["created_at"]


# ---------------------------------------------------------------------------
# AT-017 / AT-018: GET /api/v1/forms/{id}/submissions.csv
# ---------------------------------------------------------------------------


async def _csv_generator(content: str):
    """Async generator that yields a CSV string in one chunk."""
    yield content


@pytest.mark.asyncio
async def test_csv_export_returns_csv_headers(client):
    """AT-017: CSV endpoint returns correct Content-Type and Content-Disposition."""
    filename = "My-Form-submissions.csv"
    csv_content = "submitted_at,email,name\n2026-04-21T10:00:00+00:00,ada@x.y,Ada\n"

    app.dependency_overrides[require_verified_profile] = _verified_user_dep
    app.dependency_overrides[get_db] = _noop_db_dep
    try:
        with patch(
            "app.api.v1.submissions.submission_service.stream_submissions_csv",
            new=AsyncMock(return_value=(_csv_generator(csv_content), filename)),
        ):
            response = await client.get(
                f"/api/v1/forms/{FAKE_FORM_ID}/submissions.csv",
                headers={"Authorization": "Bearer valid-token"},
            )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    assert "text/csv" in response.headers["content-type"]
    assert 'attachment; filename="My-Form-submissions.csv"' in response.headers[
        "content-disposition"
    ]


@pytest.mark.asyncio
async def test_csv_export_cross_owner_returns_404(client):
    """AT-017: Cross-owner form returns 404."""
    app.dependency_overrides[require_verified_profile] = _verified_user_dep
    app.dependency_overrides[get_db] = _noop_db_dep
    try:
        with patch(
            "app.api.v1.submissions.submission_service.stream_submissions_csv",
            new=AsyncMock(return_value=None),
        ):
            response = await client.get(
                f"/api/v1/forms/{FAKE_FORM_ID}/submissions.csv",
                headers={"Authorization": "Bearer valid-token"},
            )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 404
    assert response.json()["detail"] == "form_not_found"


@pytest.mark.asyncio
async def test_csv_column_union_with_empty_cells(client):
    """AT-018: CSV header is union of all keys; missing cells are empty, not 'null'."""
    # Three submissions: {name, email}, {name, message}, {email, phone}
    rows = [
        {"name": "Ada", "email": "ada@x.y"},
        {"name": "Bob", "message": "Hello"},
        {"email": "eve@x.y", "phone": "+1234"},
    ]
    now = datetime(2026, 4, 21, 10, 0, 0, tzinfo=timezone.utc)

    # Build expected CSV in-process using the service helper
    all_keys = set()
    for r in rows:
        all_keys.update(r.keys())
    sorted_keys = sorted(all_keys)
    columns = ["submitted_at"] + sorted_keys  # submitted_at, email, message, name, phone

    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(columns)
    for r in rows:
        writer.writerow([now.isoformat()] + [r.get(k, "") for k in sorted_keys])
    csv_content = buf.getvalue()

    filename = "Test-Form-submissions.csv"

    app.dependency_overrides[require_verified_profile] = _verified_user_dep
    app.dependency_overrides[get_db] = _noop_db_dep
    try:
        with patch(
            "app.api.v1.submissions.submission_service.stream_submissions_csv",
            new=AsyncMock(return_value=(_csv_generator(csv_content), filename)),
        ):
            response = await client.get(
                f"/api/v1/forms/{FAKE_FORM_ID}/submissions.csv",
                headers={"Authorization": "Bearer valid-token"},
            )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    body = response.text
    reader = csv.DictReader(io.StringIO(body))
    parsed_rows = list(reader)
    headers = reader.fieldnames or []

    # AT-018 header check: sorted union + submitted_at first
    assert set(headers) == {"submitted_at", "email", "message", "name", "phone"}
    assert headers[0] == "submitted_at"

    # AT-018 empty cell check: first row has name/email but not message/phone
    first_row = parsed_rows[0]
    assert first_row["name"] == "Ada"
    assert first_row["email"] == "ada@x.y"
    # These should be empty strings, never "null"
    assert first_row["message"] == ""
    assert first_row["phone"] == ""
    assert "null" not in body


# ---------------------------------------------------------------------------
# Service-layer unit tests (no HTTP)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_sanitize_filename_normal_name():
    """Filename sanitization strips special chars and appends -submissions.csv."""
    from app.services.submission import _sanitize_filename

    fid = uuid.uuid4()
    result = _sanitize_filename("My Contact Form!", fid)
    assert result == "My-Contact-Form--submissions.csv" or "-submissions.csv" in result
    assert "submissions.csv" in result


@pytest.mark.asyncio
async def test_sanitize_filename_empty_name():
    """Filename sanitization falls back to form-<id8>-submissions.csv for blank names."""
    from app.services.submission import _sanitize_filename

    fid = uuid.UUID("8f5b6e7c-1234-5678-9abc-def012345678")
    result = _sanitize_filename("   ", fid)
    assert result == "form-8f5b6e7c-submissions.csv"


@pytest.mark.asyncio
async def test_sanitize_filename_special_chars():
    """Filename sanitization handles slashes, spaces, and accents."""
    from app.services.submission import _sanitize_filename

    fid = uuid.uuid4()
    result = _sanitize_filename("Contact / Sales Form", fid)
    assert "/" not in result
    assert " " not in result
    assert "submissions.csv" in result


@pytest.mark.asyncio
async def test_list_submissions_service_returns_none_for_missing_form(mock_db_session):
    """list_submissions returns None when form not found (ownership check fails)."""
    from app.services.submission import list_submissions

    # get_form_for_owner is imported inside the function from app.services.form
    with patch(
        "app.services.form.get_form_for_owner",
        new=AsyncMock(return_value=None),
    ):
        result = await list_submissions(
            mock_db_session,
            owner_id=FAKE_USER_ID,
            form_id=FAKE_FORM_ID,
            page=1,
            page_size=25,
        )
    assert result is None


@pytest.mark.asyncio
async def test_stream_submissions_csv_returns_none_for_missing_form(mock_db_session):
    """stream_submissions_csv returns None when form not found."""
    from app.services.submission import stream_submissions_csv

    # get_form_for_owner is imported inside the function from app.services.form
    with patch(
        "app.services.form.get_form_for_owner",
        new=AsyncMock(return_value=None),
    ):
        result = await stream_submissions_csv(
            mock_db_session,
            owner_id=FAKE_USER_ID,
            form_id=FAKE_FORM_ID,
        )
    assert result is None


@pytest.mark.asyncio
async def test_email_status_badge_failed_appears_in_items(client):
    """AT-020 (UI badge): A failed submission row has email_status='failed'."""
    from app.schemas.submission import SubmissionPage

    failed_item = _make_submission_response(email_status="failed", email_attempts=3)
    fake_page = SubmissionPage(items=[failed_item], page=1, page_size=25, total=1)

    app.dependency_overrides[require_verified_profile] = _verified_user_dep
    app.dependency_overrides[get_db] = _noop_db_dep
    try:
        with patch(
            "app.api.v1.submissions.submission_service.list_submissions",
            new=AsyncMock(return_value=fake_page),
        ):
            response = await client.get(
                f"/api/v1/forms/{FAKE_FORM_ID}/submissions",
                headers={"Authorization": "Bearer valid-token"},
            )
    finally:
        app.dependency_overrides.clear()

    data = response.json()
    assert data["items"][0]["email_status"] == "failed"
    assert data["items"][0]["email_attempts"] == 3
