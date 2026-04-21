"""Tests for POST /f/{formId} — covers AT-007 to AT-014, AT-019, AT-020."""

import asyncio
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.dependencies import get_db
from app.main import app

# ---------------------------------------------------------------------------
# Helpers / fixtures
# ---------------------------------------------------------------------------

FAKE_FORM_ID = uuid.uuid4()
FAKE_SUBMISSION_ID = uuid.uuid4()
FAKE_NOW = datetime(2026, 4, 21, 10, 0, 0, tzinfo=timezone.utc)


def _make_mock_form(
    *,
    form_id: uuid.UUID | None = None,
    redirect_url: str | None = None,
) -> MagicMock:
    form = MagicMock()
    form.id = form_id or FAKE_FORM_ID
    form.name = "Personal contact"
    form.redirect_url = redirect_url
    form.deleted_at = None
    form.owner_id = uuid.uuid4()
    return form


def _make_mock_submission(*, submission_id: uuid.UUID | None = None) -> MagicMock:
    sub = MagicMock()
    sub.id = submission_id or FAKE_SUBMISSION_ID
    sub.form_id = FAKE_FORM_ID
    sub.data = {"name": "Ada"}
    sub.email_status = "pending"
    sub.email_attempts = 0
    sub.created_at = FAKE_NOW
    return sub


def _make_mock_db_session() -> AsyncMock:
    session = AsyncMock()
    session.commit = AsyncMock()
    session.refresh = AsyncMock()
    session.execute = AsyncMock()
    session.add = MagicMock()
    return session


# Fixture that overrides the get_db dependency with a mock session
@pytest.fixture
def db_override():
    """Override get_db with a mock session."""
    mock_session = _make_mock_db_session()

    async def _mock_get_db():
        yield mock_session

    app.dependency_overrides[get_db] = _mock_get_db
    yield mock_session
    app.dependency_overrides.pop(get_db, None)


def _make_session_factory(mock_session: AsyncMock):
    """Return a callable that yields mock_session via async context manager."""

    class _Factory:
        def __call__(self):
            @asynccontextmanager
            async def _ctx():
                yield mock_session

            return _ctx()

    return _Factory()


# ---------------------------------------------------------------------------
# AT-007: Honeypot trip silently dropped
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_honeypot_json_mode_returns_200_placeholder(client, db_override):
    """AT-007: _gotcha non-empty → 200 JSON with placeholder UUID, nothing stored."""
    mock_form = _make_mock_form()

    with (
        patch(
            "app.api.public.router.form_service.get_form_for_public_submit",
            new=AsyncMock(return_value=mock_form),
        ),
        patch(
            "app.api.public.router.submission_service.persist_submission",
            new=AsyncMock(),
        ) as mock_persist,
        patch(
            "app.api.public.router.email_service.send_notification_with_retry",
            new=AsyncMock(),
        ) as mock_email,
    ):
        response = await client.post(
            f"/f/{FAKE_FORM_ID}",
            json={"name": "Bot", "_gotcha": "trapped"},
        )

    assert response.status_code == 200
    body = response.json()
    assert body["ok"] is True
    assert body["id"] == "00000000-0000-0000-0000-000000000000"
    mock_persist.assert_not_called()
    mock_email.assert_not_called()


@pytest.mark.asyncio
async def test_honeypot_form_mode_returns_303(client, db_override):
    """AT-007 (HTML mode): _gotcha → 303 redirect, nothing stored."""
    mock_form = _make_mock_form()

    with (
        patch(
            "app.api.public.router.form_service.get_form_for_public_submit",
            new=AsyncMock(return_value=mock_form),
        ),
        patch(
            "app.api.public.router.submission_service.persist_submission",
            new=AsyncMock(),
        ) as mock_persist,
        patch(
            "app.api.public.router.email_service.send_notification_with_retry",
            new=AsyncMock(),
        ) as mock_email,
    ):
        response = await client.post(
            f"/f/{FAKE_FORM_ID}",
            data={"name": "Bot", "_gotcha": "x"},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            follow_redirects=False,
        )

    assert response.status_code == 303
    mock_persist.assert_not_called()
    mock_email.assert_not_called()


# ---------------------------------------------------------------------------
# AT-008 / AT-010: HTML form 303 redirect to default success page
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_html_form_submission_returns_303_default(client, db_override):
    """AT-008 / AT-010: urlencoded POST → 303 to /submitted (no redirect_url set)."""
    mock_form = _make_mock_form(redirect_url=None)
    mock_submission = _make_mock_submission()

    with (
        patch(
            "app.api.public.router.form_service.get_form_for_public_submit",
            new=AsyncMock(return_value=mock_form),
        ),
        patch(
            "app.api.public.router.submission_service.persist_submission",
            new=AsyncMock(return_value=mock_submission),
        ),
        patch(
            "app.api.public.router.email_service.send_notification_with_retry",
            new=AsyncMock(),
        ),
    ):
        response = await client.post(
            f"/f/{FAKE_FORM_ID}",
            data={"name": "Ada", "email": "ada@example.com"},
            headers={
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "text/html",
            },
            follow_redirects=False,
        )

    assert response.status_code == 303
    assert response.headers["location"].endswith("/submitted")


# ---------------------------------------------------------------------------
# AT-009: JSON submission yields 200 ack with submission id
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_json_submission_returns_200_ack(client, db_override):
    """AT-009: JSON POST → 200 {ok: true, id: <uuid>}."""
    mock_form = _make_mock_form()
    mock_submission = _make_mock_submission()

    with (
        patch(
            "app.api.public.router.form_service.get_form_for_public_submit",
            new=AsyncMock(return_value=mock_form),
        ),
        patch(
            "app.api.public.router.submission_service.persist_submission",
            new=AsyncMock(return_value=mock_submission),
        ),
        patch(
            "app.api.public.router.email_service.send_notification_with_retry",
            new=AsyncMock(),
        ),
    ):
        response = await client.post(
            f"/f/{FAKE_FORM_ID}",
            json={"email": "x@y.z"},
        )

    assert response.status_code == 200
    body = response.json()
    assert body["ok"] is True
    assert body["id"] == str(FAKE_SUBMISSION_ID)


# ---------------------------------------------------------------------------
# AT-011: Per-form redirect_url honored
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_per_form_redirect_url_honored(client, db_override):
    """AT-011: form.redirect_url present → 303 to form.redirect_url."""
    mock_form = _make_mock_form(redirect_url="https://example.com/thanks")
    mock_submission = _make_mock_submission()

    with (
        patch(
            "app.api.public.router.form_service.get_form_for_public_submit",
            new=AsyncMock(return_value=mock_form),
        ),
        patch(
            "app.api.public.router.submission_service.persist_submission",
            new=AsyncMock(return_value=mock_submission),
        ),
        patch(
            "app.api.public.router.email_service.send_notification_with_retry",
            new=AsyncMock(),
        ),
    ):
        response = await client.post(
            f"/f/{FAKE_FORM_ID}",
            data={"name": "Ada"},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            follow_redirects=False,
        )

    assert response.status_code == 303
    assert response.headers["location"] == "https://example.com/thanks"


# ---------------------------------------------------------------------------
# AT-012: _redirect body field overrides form redirect_url
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_redirect_override_takes_precedence(client, db_override):
    """AT-012: _redirect field overrides form.redirect_url."""
    mock_form = _make_mock_form(redirect_url="https://example.com/thanks")
    mock_submission = _make_mock_submission()

    with (
        patch(
            "app.api.public.router.form_service.get_form_for_public_submit",
            new=AsyncMock(return_value=mock_form),
        ),
        patch(
            "app.api.public.router.submission_service.persist_submission",
            new=AsyncMock(return_value=mock_submission),
        ) as mock_persist,
        patch(
            "app.api.public.router.email_service.send_notification_with_retry",
            new=AsyncMock(),
        ),
    ):
        response = await client.post(
            f"/f/{FAKE_FORM_ID}",
            data={"name": "Ada", "_redirect": "https://override.example.com"},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            follow_redirects=False,
        )

    assert response.status_code == 303
    assert response.headers["location"] == "https://override.example.com"

    # Verify _redirect was stripped from persisted data
    call_args = mock_persist.call_args
    persisted_data = call_args[0][2]  # 3rd positional arg: data dict
    assert "_redirect" not in persisted_data


@pytest.mark.asyncio
async def test_invalid_redirect_override_falls_back(client, db_override):
    """AT-012 negative: javascript: URL → falls back to form.redirect_url."""
    mock_form = _make_mock_form(redirect_url="https://example.com/thanks")
    mock_submission = _make_mock_submission()

    with (
        patch(
            "app.api.public.router.form_service.get_form_for_public_submit",
            new=AsyncMock(return_value=mock_form),
        ),
        patch(
            "app.api.public.router.submission_service.persist_submission",
            new=AsyncMock(return_value=mock_submission),
        ),
        patch(
            "app.api.public.router.email_service.send_notification_with_retry",
            new=AsyncMock(),
        ),
    ):
        response = await client.post(
            f"/f/{FAKE_FORM_ID}",
            data={"name": "Ada", "_redirect": "javascript:alert(1)"},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            follow_redirects=False,
        )

    assert response.status_code == 303
    assert response.headers["location"] == "https://example.com/thanks"


# ---------------------------------------------------------------------------
# AT-013: Invalid formId → 404 in both modes
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_invalid_form_id_json_returns_404(client, db_override):
    """AT-013 (JSON mode): unknown formId → 404 {"ok": false, "error": "form_not_found"}."""
    with patch(
        "app.api.public.router.form_service.get_form_for_public_submit",
        new=AsyncMock(return_value=None),
    ):
        response = await client.post(
            "/f/00000000-0000-0000-0000-000000000000",
            json={"a": "b"},
        )

    assert response.status_code == 404
    body = response.json()
    assert body["ok"] is False
    assert body["error"] == "form_not_found"


@pytest.mark.asyncio
async def test_invalid_form_id_html_returns_404(client, db_override):
    """AT-013 (HTML mode): unknown formId → 404 (NOT a redirect)."""
    with patch(
        "app.api.public.router.form_service.get_form_for_public_submit",
        new=AsyncMock(return_value=None),
    ):
        response = await client.post(
            "/f/00000000-0000-0000-0000-000000000000",
            data={"name": "Ada"},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            follow_redirects=False,
        )

    assert response.status_code == 404


# ---------------------------------------------------------------------------
# AT-014: Body > 100 KB returns 413
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_body_over_100kb_returns_413(client):
    """AT-014: Request body > 100 KB → 413 payload_too_large."""
    big_value = "x" * (101 * 1024)

    response = await client.post(
        f"/f/{FAKE_FORM_ID}",
        content=big_value.encode(),
        headers={
            "Content-Type": "application/json",
            "Content-Length": str(len(big_value.encode())),
        },
    )

    assert response.status_code == 413
    body = response.json()
    assert body["ok"] is False
    assert body["error"] == "payload_too_large"


# ---------------------------------------------------------------------------
# AT-019: Email sent on successful submission
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_email_background_task_scheduled_on_success(client, db_override):
    """AT-019: Successful JSON submission → 200 OK with submission id."""
    mock_form = _make_mock_form()
    mock_submission = _make_mock_submission()

    with (
        patch(
            "app.api.public.router.form_service.get_form_for_public_submit",
            new=AsyncMock(return_value=mock_form),
        ),
        patch(
            "app.api.public.router.submission_service.persist_submission",
            new=AsyncMock(return_value=mock_submission),
        ),
        patch(
            "app.api.public.router.email_service.send_notification_with_retry",
            new=AsyncMock(),
        ),
    ):
        response = await client.post(
            f"/f/{FAKE_FORM_ID}",
            json={"name": "Ada", "email": "ada@x.y", "message": "Hi"},
        )

    assert response.status_code == 200
    body = response.json()
    assert body["ok"] is True
    assert body["id"] == str(FAKE_SUBMISSION_ID)


@pytest.mark.asyncio
async def test_email_provider_send_called_with_correct_content():
    """AT-019 (unit): send_notification_with_retry calls provider.send with correct args."""
    import uuid as _uuid

    from app.services.email import _reset_provider
    from app.services.email.sender import send_notification_with_retry

    _reset_provider()

    submission_id = _uuid.uuid4()
    form_id = _uuid.uuid4()
    owner_id = _uuid.uuid4()

    mock_submission = MagicMock()
    mock_submission.id = submission_id
    mock_submission.form_id = form_id
    mock_submission.data = {"name": "Ada", "email": "ada@x.y"}

    mock_form = MagicMock()
    mock_form.id = form_id
    mock_form.name = "Personal contact"
    mock_form.owner_id = owner_id

    mock_owner = MagicMock()
    mock_owner.id = owner_id
    mock_owner.email = "owner@example.com"

    status_updates: list[dict] = []

    async def capture_mark(db, sid, *, status, attempts):
        status_updates.append({"status": status, "attempts": attempts})

    mock_provider = AsyncMock()
    mock_provider.send = AsyncMock()

    call_count = [0]

    async def mock_execute(stmt):
        result = MagicMock()
        call_count[0] += 1
        n = call_count[0]
        if n == 1:
            result.scalar_one_or_none = MagicMock(return_value=mock_submission)
        elif n == 2:
            result.scalar_one_or_none = MagicMock(return_value=mock_form)
        else:
            result.scalar_one_or_none = MagicMock(return_value=mock_owner)
        return result

    mock_session = AsyncMock()
    mock_session.execute = mock_execute
    mock_session.commit = AsyncMock()

    factory = _make_session_factory(mock_session)

    with (
        patch("app.services.email.sender._get_provider", return_value=mock_provider),
        patch("app.database.async_session_factory", factory),
        patch(
            "app.services.email.sender.mark_email_status",
            new=capture_mark,
        ),
    ):
        await send_notification_with_retry(submission_id)

    mock_provider.send.assert_called_once()
    call_kwargs = mock_provider.send.call_args.kwargs
    assert "Personal contact" in call_kwargs["subject"]
    assert call_kwargs["to"] == "owner@example.com"
    assert "Ada" in call_kwargs["text"]

    assert len(status_updates) == 1
    assert status_updates[0]["status"] == "sent"
    assert status_updates[0]["attempts"] == 1


# ---------------------------------------------------------------------------
# AT-020: Email failure → email_status='failed' after 3 retries, submission safe
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_email_retry_on_failure_marks_failed():
    """AT-020: provider.send always raises → email_status='failed', attempts=3."""
    import uuid as _uuid

    from app.services.email import _reset_provider
    from app.services.email.sender import send_notification_with_retry

    _reset_provider()

    submission_id = _uuid.uuid4()
    form_id = _uuid.uuid4()
    owner_id = _uuid.uuid4()

    mock_submission = MagicMock()
    mock_submission.id = submission_id
    mock_submission.form_id = form_id
    mock_submission.data = {"name": "Ada"}

    mock_form = MagicMock()
    mock_form.id = form_id
    mock_form.name = "My Form"
    mock_form.owner_id = owner_id

    mock_owner = MagicMock()
    mock_owner.id = owner_id
    mock_owner.email = "owner@example.com"

    status_updates: list[dict] = []

    async def capture_mark(db, sid, *, status, attempts):
        status_updates.append({"status": status, "attempts": attempts})

    flaky_provider = MagicMock()
    flaky_provider.send = AsyncMock(side_effect=RuntimeError("smtp down"))

    call_count = [0]

    async def mock_execute(stmt):
        result = MagicMock()
        call_count[0] += 1
        n = call_count[0]
        if n == 1:
            result.scalar_one_or_none = MagicMock(return_value=mock_submission)
        elif n == 2:
            result.scalar_one_or_none = MagicMock(return_value=mock_form)
        else:
            result.scalar_one_or_none = MagicMock(return_value=mock_owner)
        return result

    mock_session = AsyncMock()
    mock_session.execute = mock_execute
    mock_session.commit = AsyncMock()

    factory = _make_session_factory(mock_session)

    with (
        patch("app.services.email.sender._get_provider", return_value=flaky_provider),
        patch("app.database.async_session_factory", factory),
        patch(
            "app.services.email.sender.mark_email_status",
            new=capture_mark,
        ),
        patch("asyncio.sleep", new=AsyncMock()),
    ):
        await send_notification_with_retry(submission_id)

    assert flaky_provider.send.call_count == 3

    assert len(status_updates) == 1
    assert status_updates[0]["status"] == "failed"
    assert status_updates[0]["attempts"] == 3


# ---------------------------------------------------------------------------
# Submission service unit tests
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_persist_submission_stores_data():
    """Verify persist_submission adds and commits a Submission row."""
    from app.services.submission import persist_submission

    form_id = uuid.uuid4()
    data = {"name": "Ada", "email": "ada@example.com"}

    mock_session = AsyncMock()
    mock_session.add = MagicMock()
    mock_session.commit = AsyncMock()
    mock_session.refresh = AsyncMock()

    await persist_submission(mock_session, form_id, data)

    mock_session.add.assert_called_once()
    mock_session.commit.assert_called_once()


@pytest.mark.asyncio
async def test_mark_email_status_updates_row():
    """Verify mark_email_status updates status and attempts on the row."""
    from app.services.submission import mark_email_status

    submission_id = uuid.uuid4()
    mock_sub = MagicMock()
    mock_sub.id = submission_id
    mock_sub.email_status = "pending"
    mock_sub.email_attempts = 0

    mock_result = MagicMock()
    mock_result.scalar_one_or_none = MagicMock(return_value=mock_sub)

    mock_session = AsyncMock()
    mock_session.execute = AsyncMock(return_value=mock_result)
    mock_session.commit = AsyncMock()

    await mark_email_status(mock_session, submission_id, status="sent", attempts=1)

    assert mock_sub.email_status == "sent"
    assert mock_sub.email_attempts == 1
    mock_session.commit.assert_called_once()
