"""Public submission router — POST /f/{form_id}.

No authentication required. Handles both HTML form (urlencoded / multipart)
and JSON submissions. Email notification is fired as a BackgroundTask.
"""

from __future__ import annotations

import json
import uuid

from fastapi import APIRouter, BackgroundTasks, Depends, Request
from fastapi.responses import JSONResponse, RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.dependencies import get_db
from app.schemas.submission import PublicSubmissionAck
from app.services import email as email_service
from app.services import form as form_service
from app.services import submission as submission_service

router = APIRouter(tags=["public"])

_HONEYPOT_UUID = "00000000-0000-0000-0000-000000000000"

# Allowed Content-Type values
_URLENCODED = "application/x-www-form-urlencoded"
_JSON_CT = "application/json"
_MULTIPART = "multipart/form-data"


@router.post("/f/{form_id}", response_model=None)
async def submit_public(
    form_id: uuid.UUID,
    request: Request,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
) -> JSONResponse | RedirectResponse:
    """Accept a public form submission.

    Content negotiation:
    - JSON Content-Type → 200 JSON ack
    - Accept: application/json (no text/html) → 200 JSON ack
    - Otherwise → 303 redirect

    Honeypot: if _gotcha field is non-empty → success-shaped response, nothing stored.
    Body limit: enforced by BodySizeLimitMiddleware at 100 KB.
    """
    # --- Resolve form (404 if not found or soft-deleted) ---
    form = await form_service.get_form_for_public_submit(db, form_id)
    if form is None:
        return _error_response(request, "form_not_found", 404)

    # --- Parse body ---
    content_type = request.headers.get("content-type", "").split(";")[0].strip()

    if content_type == _JSON_CT:
        body = await _parse_json(request)
        if body is None:
            return _error_response(request, "invalid_body", 400)
        use_json_response = True
    elif content_type in (_URLENCODED, _MULTIPART):
        body = await _parse_form(request)
        if body is None:
            return _error_response(request, "invalid_body", 400)
        use_json_response = _wants_json(request)
    elif content_type == "":
        # No Content-Type — try JSON first, then form
        raw = await request.body()
        if raw:
            try:
                body = json.loads(raw)
                if not isinstance(body, dict):
                    return _error_response(request, "invalid_body", 400)
            except Exception:
                return _error_response(request, "invalid_body", 400)
        else:
            body = {}
        use_json_response = _wants_json(request)
    else:
        return _error_response(request, "unsupported_media_type", 415)

    # --- Honeypot check ---
    if body.get("_gotcha"):
        # Silent drop — respond as if successful, persist nothing
        if use_json_response:
            return JSONResponse(
                content=PublicSubmissionAck(ok=True, id=_HONEYPOT_UUID).model_dump(),
                status_code=200,
            )
        return RedirectResponse(
            url=_resolve_redirect(body, form),
            status_code=303,
        )

    # --- Strip reserved fields before persistence ---
    redirect_override = body.pop("_redirect", None)
    body.pop("_gotcha", None)  # remove even if empty

    # Validate _redirect: must be an absolute http(s) URL
    redirect_url = _validate_redirect(redirect_override, form)

    # --- Persist submission ---
    submission = await submission_service.persist_submission(db, form.id, body)

    # --- Schedule email notification as background task ---
    background_tasks.add_task(
        email_service.send_notification_with_retry,
        submission.id,
    )

    # --- Respond ---
    if use_json_response:
        return JSONResponse(
            content=PublicSubmissionAck(ok=True, id=str(submission.id)).model_dump(),
            status_code=200,
        )
    return RedirectResponse(url=redirect_url, status_code=303)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _wants_json(request: Request) -> bool:
    """Return True if the client prefers JSON over HTML."""
    accept = request.headers.get("accept", "")
    wants_json = "application/json" in accept
    wants_html = "text/html" in accept
    # Accept: application/json → True; Accept: text/html → False;
    # Accept: */*, application/json → True unless text/html also present
    return wants_json and not wants_html


async def _parse_json(request: Request) -> dict | None:
    """Parse the request body as JSON. Returns None on error."""
    try:
        raw = await request.body()
        parsed = json.loads(raw)
        if not isinstance(parsed, dict):
            return None
        return parsed
    except Exception:
        return None


async def _parse_form(request: Request) -> dict | None:
    """Parse urlencoded/multipart form data. Text fields only; files dropped."""
    try:
        form_data = await request.form()
        result: dict = {}
        for key, value in form_data.multi_items():
            # Drop file uploads silently
            if isinstance(value, str):
                result[key] = value
        return result
    except Exception:
        return None


def _resolve_redirect(body: dict, form) -> str:
    """Return the redirect URL after stripping _redirect from body.

    Precedence: _redirect field > form.redirect_url > default success page.
    Note: body._redirect has already been popped from the dict before calling.
    """
    return _validate_redirect(body.get("_redirect"), form)


def _validate_redirect(redirect_override: str | None, form) -> str:
    """Validate and return the redirect target URL.

    Precedence:
    1. redirect_override if an absolute http(s) URL
    2. form.redirect_url if set
    3. <DASHBOARD_BASE_URL>/submitted
    """
    default = f"{settings.DASHBOARD_BASE_URL.rstrip('/')}/submitted"

    if redirect_override:
        if isinstance(redirect_override, str) and redirect_override.startswith(
            ("http://", "https://")
        ):
            return redirect_override
        # Invalid _redirect → fall through to form.redirect_url

    if form.redirect_url:
        return form.redirect_url

    return default


def _error_response(request: Request, error_code: str, status: int) -> JSONResponse:
    """Return a public-endpoint error JSON response."""
    return JSONResponse(
        content={"ok": False, "error": error_code},
        status_code=status,
    )
