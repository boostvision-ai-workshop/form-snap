"""Public submission router — POST /f/{form_id}.

No authentication required. Handles both HTML form (urlencoded / multipart)
and JSON submissions. Email notification is fired as a BackgroundTask.
"""

from __future__ import annotations

import json
import uuid

from fastapi import APIRouter, BackgroundTasks, Depends, Request
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
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


@router.get("/f/{form_id}", include_in_schema=False)
async def submit_endpoint_info(
    form_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> HTMLResponse:
    """Browser-friendly helper page when someone opens the submit URL via GET.

    This endpoint only accepts POST, so GET would otherwise return
    "405 Method Not Allowed". Instead, render a small HTML page explaining
    how to use the endpoint.
    """
    form = await form_service.get_form_for_public_submit(db, form_id)
    form_known = form is not None
    form_name = form.name if form is not None else "Unknown form"
    submit_url = f"{settings.PUBLIC_SUBMIT_BASE_URL.rstrip('/')}/f/{form_id}"

    status_code = 200 if form_known else 404

    if form_known:
        status_banner = (
            '<div class="banner ok">'
            '<span class="dot"></span>Live endpoint · '
            f'form <strong>{form_name}</strong>'
            '</div>'
        )
        demo_section = f"""
<section class="demo">
  <h2>Try it live</h2>
  <p class="muted">Fill in the form below and submit — it will post to this endpoint
  and a real submission will be stored in your dashboard.</p>
  <form class="demo-form" action="{submit_url}" method="POST">
    <label>
      <span>Email</span>
      <input name="email" type="email" required placeholder="you@example.com" />
    </label>
    <label>
      <span>Name</span>
      <input name="name" placeholder="Ada Lovelace" />
    </label>
    <label>
      <span>Message</span>
      <textarea name="message" rows="3" placeholder="Hello from the demo page!"></textarea>
    </label>
    <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" class="honeypot" />
    <button type="submit">Send submission</button>
  </form>
</section>
"""
    else:
        status_banner = (
            '<div class="banner warn">'
            f'Form <code>{form_id}</code> was not found. '
            'Double-check the URL or re-copy the snippet from the dashboard.'
            '</div>'
        )
        demo_section = ""

    body = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>FormSnap · submit endpoint</title>
<style>
  :root {{
    --bg: #f8fafc; --fg: #0f172a; --muted: #64748b; --border: #e2e8f0;
    --card: #ffffff; --accent: #2563eb; --accent-hover: #1d4ed8;
    --ok-bg: #ecfdf5; --ok-border: #10b981; --ok-fg: #065f46;
    --warn-bg: #fef3c7; --warn-border: #f59e0b; --warn-fg: #78350f;
    --code-bg: #0f172a; --code-fg: #e2e8f0;
  }}
  * {{ box-sizing: border-box; }}
  body {{ font-family: -apple-system, system-ui, 'Segoe UI', sans-serif;
         max-width: 760px; margin: 0 auto; padding: 2.5rem 1.25rem 4rem;
         color: var(--fg); background: var(--bg); line-height: 1.6; }}
  header {{ margin-bottom: 1.5rem; }}
  .brand {{ font-weight: 700; font-size: 0.875rem; letter-spacing: 0.05em;
            text-transform: uppercase; color: var(--accent); }}
  h1 {{ font-size: 1.875rem; margin: 0.25rem 0 0.5rem; line-height: 1.2; }}
  h2 {{ font-size: 1.125rem; margin: 2rem 0 0.75rem; }}
  .muted {{ color: var(--muted); margin: 0; }}
  .banner {{ display: flex; align-items: center; gap: 0.5rem;
             padding: 0.75rem 1rem; border-radius: 8px; margin: 1.25rem 0;
             font-size: 0.9rem; border: 1px solid transparent; }}
  .banner.ok {{ background: var(--ok-bg); border-color: var(--ok-border); color: var(--ok-fg); }}
  .banner.warn {{ background: var(--warn-bg); border-color: var(--warn-border); color: var(--warn-fg); }}
  .dot {{ width: 8px; height: 8px; border-radius: 50%;
          background: var(--ok-border); display: inline-block;
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2); }}
  .endpoint {{ display: flex; gap: 0.5rem; align-items: center;
               background: var(--card); border: 1px solid var(--border);
               padding: 0.75rem 1rem; border-radius: 8px; font-family: ui-monospace, Menlo, monospace;
               font-size: 0.875rem; overflow-x: auto; margin: 0.75rem 0 1.5rem; }}
  .method {{ background: var(--accent); color: white; padding: 0.125rem 0.5rem;
             border-radius: 4px; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.05em; }}
  .demo {{ background: var(--card); border: 1px solid var(--border);
           border-radius: 12px; padding: 1.5rem; margin-top: 1rem;
           box-shadow: 0 1px 2px rgba(0,0,0,0.04); }}
  .demo h2 {{ margin-top: 0; }}
  .demo-form {{ display: grid; gap: 1rem; margin-top: 1rem; }}
  .demo-form label {{ display: grid; gap: 0.375rem; font-size: 0.875rem; font-weight: 500; }}
  .demo-form input, .demo-form textarea {{ font: inherit; padding: 0.625rem 0.75rem;
                     border: 1px solid var(--border); border-radius: 6px;
                     background: var(--bg); color: var(--fg); }}
  .demo-form input:focus, .demo-form textarea:focus {{ outline: 2px solid var(--accent); outline-offset: 1px; }}
  .demo-form button {{ font: inherit; font-weight: 600; background: var(--accent);
                       color: white; border: 0; padding: 0.75rem 1rem;
                       border-radius: 6px; cursor: pointer; transition: background 0.15s; }}
  .demo-form button:hover {{ background: var(--accent-hover); }}
  .honeypot {{ position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden; }}
  pre {{ background: var(--code-bg); color: var(--code-fg); padding: 1rem;
         border-radius: 8px; overflow-x: auto; font-family: ui-monospace, Menlo, monospace;
         font-size: 0.8125rem; line-height: 1.5; }}
  code {{ background: rgba(15, 23, 42, 0.08); padding: 0.125rem 0.375rem;
          border-radius: 4px; font-family: ui-monospace, Menlo, monospace; font-size: 0.875rem; }}
  .tabs {{ display: grid; gap: 1.25rem; margin-top: 1rem; }}
</style>
</head>
<body>
<header>
  <div class="brand">FormSnap</div>
  <h1>Submit endpoint</h1>
  <p class="muted">Point an HTML form's <code>action</code> at this URL, or POST JSON directly.</p>
</header>

<div class="endpoint"><span class="method">POST</span><span>{submit_url}</span></div>

{status_banner}
{demo_section}

<section class="tabs">
  <div>
    <h2>Paste into a static HTML page</h2>
    <pre>&lt;form action="{submit_url}" method="POST"&gt;
  &lt;input name="email" type="email" required /&gt;
  &lt;input name="message" /&gt;
  &lt;button type="submit"&gt;Send&lt;/button&gt;
&lt;/form&gt;</pre>
  </div>

  <div>
    <h2>Or POST JSON with curl</h2>
    <pre>curl -X POST {submit_url} \\
  -H 'Content-Type: application/json' \\
  -d '{{"email":"ada@example.com","message":"hi"}}'</pre>
  </div>
</section>
</body>
</html>"""
    return HTMLResponse(content=body, status_code=status_code)


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
