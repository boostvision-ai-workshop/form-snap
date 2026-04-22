# API Specification: FormSnap

> Eight endpoints. One public (`POST /f/{formId}`), seven authenticated (`/api/v1/*`). All authenticated endpoints expect `Authorization: Bearer <firebase_id_token>`.
>
> Routing roots:
> - `POST /f/{formId}` — mounted on the FastAPI `app` directly (NOT under `/api/v1`). PRD §8 makes this a public contract.
> - `GET/POST/PATCH/DELETE /api/v1/...` — mounted on `app.api.v1.router.api_router` with prefix `/api/v1`.

---

## 1. Authentication

### 1.1 Bearer token verification

Every authenticated endpoint depends on `app.core.security.get_current_user` (existing). The dependency:
1. Reads `Authorization: Bearer <token>`.
2. Calls `verify_firebase_token(token)` (Firebase Admin SDK).
3. Returns the decoded claims dict on success, raises 401 on any failure.

Two convenience wrappers used by FormSnap routes (defined in `app/dependencies.py`):
- `get_current_profile(db, claims)` → `User` row (lazy-creates the row on first call).
- `require_verified_profile(user)` → re-checks `user.email_verified` from the just-decoded claim; raises 403 `email_not_verified` otherwise.

### 1.2 Standard error responses (authenticated endpoints)

| Status | Body | When |
|--------|------|------|
| 401 Unauthorized | `{"detail": "Token has expired"}` (or `"Invalid authentication token"` / `"Token has been revoked"`) | Missing, malformed, expired, or revoked token |
| 403 Forbidden | `{"detail": "email_not_verified"}` | Endpoint requires verified email; user's token claim says false |
| 404 Not Found | `{"detail": "form_not_found"}` | Resource does not exist OR is owned by another user |

### 1.3 CORS

| Router | Allowed origins | Credentials | Methods | Headers |
|--------|-----------------|-------------|---------|---------|
| `/f/*` (public) | `*` (wildcard) | `false` | `POST, OPTIONS` | `Content-Type, Accept` |
| `/api/v1/*` (dashboard) | `BACKEND_CORS_ORIGINS` (e.g., `http://localhost:3000` in dev) | `true` | `*` | `*` |

---

## 2. Public submission endpoint

### Endpoint: POST /f/{formId}

**Path**: `POST /f/{formId}`
**Auth**: None.
**Purpose**: Accept a form submission, persist it, fire notification email, redirect or ack.

#### Path parameters

| Param | Type | Notes |
|-------|------|-------|
| `formId` | string (UUID format) | Must resolve to an existing, non-deleted `forms.id`. Invalid UUIDs and unknown ids both yield 404. |

#### Request

Accepted `Content-Type` values:
- `application/x-www-form-urlencoded`
- `application/json` (must be a JSON object — arrays / scalars rejected with 400)
- `multipart/form-data` (text fields kept; file fields silently dropped)

Body limit: **100 KB** (post-`Content-Length` check; chunked uploads are streamed and aborted on overflow). Exceeded → 413.

Reserved fields (recognized in any of the three encodings; stripped before persistence):
- `_redirect` — string, optional. If a syntactically valid http(s) URL, takes precedence over `form.redirect_url`.
- `_gotcha` — honeypot. If present and non-empty: behave as if the submission succeeded (return the appropriate 303 / 200 ack) but DO NOT persist and DO NOT email.

#### Response negotiation

1. If `Content-Type: application/json` → JSON ack.
2. Else if `Accept` contains `application/json` and not `text/html` → JSON ack.
3. Else → 303 redirect (browser HTML form flow).

#### Response — JSON mode

**200 OK** (real submission):
```json
{ "ok": true, "id": "8f5b6e7c-1234-5678-9abc-def012345678" }
```

**200 OK** (honeypot trip — same shape, no real id; opaque to the bot):
```json
{ "ok": true, "id": "00000000-0000-0000-0000-000000000000" }
```

#### Response — Redirect mode

**303 See Other** with `Location` header per the precedence rule:
1. `_redirect` body field if a valid absolute http(s) URL.
2. `form.redirect_url` if set and valid.
3. `<DASHBOARD_BASE_URL>/submitted` (default success page).

Honeypot tripped: same 303 to the same redirect target (indistinguishable).

#### Pydantic schemas

```python
# app/schemas/submission.py
from pydantic import BaseModel

class PublicSubmissionAck(BaseModel):
    ok: bool = True
    id: str  # uuid string; "0000…0000" placeholder for honeypot
```

Public submission INPUT is not modeled with Pydantic (the body is opaque) — it is parsed manually in the route handler from `await request.form()` or `await request.json()`.

#### Error responses

| Status | Body | When |
|--------|------|------|
| 404 | `{"ok": false, "error": "form_not_found"}` | `formId` does not exist or is soft-deleted |
| 400 | `{"ok": false, "error": "invalid_body"}` | JSON not an object; urlencoded body unparseable |
| 413 | `{"ok": false, "error": "payload_too_large"}` | Body > 100 KB |
| 415 | `{"ok": false, "error": "unsupported_media_type"}` | Content-Type not in the accepted set |
| 500 | `{"ok": false, "error": "internal_error"}` | Unhandled exception. Submission persistence MUST happen before any external (email) call to keep this case rare. |

#### Service flow

```python
# Pseudocode in app/api/public.py
@router.post("/f/{form_id}")
async def submit_public(
    form_id: UUID,
    request: Request,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    form = await form_service.get_form_for_public_submit(db, form_id)
    if form is None:
        return _ack(request, redirect=DEFAULT_404_REDIRECT, status=404,
                    error_code="form_not_found")

    body = await _parse_body(request)              # 400 / 413 / 415 raised inside
    if body.get("_gotcha"):
        # silent drop, success-shaped response
        return _success_ack(request, form, body)

    redirect_override = body.pop("_redirect", None)
    body.pop("_gotcha", None)

    submission = await submission_service.persist_submission(db, form.id, body)
    background_tasks.add_task(
        email_service.send_notification_with_retry, submission.id
    )
    return _success_ack(request, form, body, redirect_override, submission.id)
```

---

## 3. Authenticated endpoints

### 3.1 Endpoint: GET /api/v1/me

**Path**: `GET /api/v1/me`
**Auth**: Required.
**Purpose**: Return (and lazy-create) the authenticated user's profile.

#### Response 200 OK

```json
{
  "uid": "firebase-uid-string",
  "id": "8f5b6e7c-1234-5678-9abc-def012345678",
  "email": "user@example.com",
  "email_verified": true,
  "display_name": null,
  "avatar_url": null,
  "created_at": "2026-04-21T10:00:00Z"
}
```

#### Pydantic schema

```python
# app/schemas/user.py — promoted to required where appropriate
class UserMeResponse(BaseModel):
    uid: str
    id: str
    email: str
    email_verified: bool
    display_name: str | None = None
    avatar_url: str | None = None
    created_at: datetime
```

#### Errors

- 401 — invalid / missing token.
- 503 — DB not configured (re-uses existing `get_db` behavior; should not occur in prod).

#### Service method

`get_or_create_user(db, firebase_uid, email, display_name, avatar_url, email_verified)` — extends existing function with `email_verified` parameter.

---

### 3.2 Endpoint: GET /api/v1/forms

**Path**: `GET /api/v1/forms`
**Auth**: Required.
**Purpose**: List the user's forms with submission stats.

#### Request

No body. No query parameters in MVP (full list — typical user has < 50 forms).

#### Response 200 OK

```json
[
  {
    "id": "8f5b6e7c-1234-5678-9abc-def012345678",
    "name": "Personal site contact",
    "redirect_url": "https://example.com/thanks",
    "submission_count": 17,
    "last_submission_at": "2026-04-20T15:32:11Z",
    "submit_url": "https://api.formsnap.example/f/8f5b6e7c-1234-5678-9abc-def012345678",
    "created_at": "2026-04-01T08:12:00Z",
    "updated_at": "2026-04-15T09:45:00Z"
  }
]
```

`submit_url` is built server-side from `PUBLIC_SUBMIT_BASE_URL` + `/f/{id}` for client convenience.

#### Pydantic schema

```python
# app/schemas/form.py
class FormListItem(BaseModel):
    id: str
    name: str
    redirect_url: str | None = None
    submission_count: int
    last_submission_at: datetime | None = None
    submit_url: str
    created_at: datetime
    updated_at: datetime

# Response is `list[FormListItem]`.
```

#### Errors

- 401.

#### Service method

`list_forms(db, owner_id) -> list[FormListItem]`.

---

### 3.3 Endpoint: POST /api/v1/forms

**Path**: `POST /api/v1/forms`
**Auth**: Required + **email verified** (`require_verified_profile`).
**Purpose**: Create a new form for the signed-in user.

#### Request body

```json
{
  "name": "Personal site contact",
  "redirect_url": "https://example.com/thanks"
}
```

#### Pydantic schema (request)

```python
# app/schemas/form.py
from pydantic import BaseModel, Field, HttpUrl

class FormCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    redirect_url: HttpUrl | None = None
```

`HttpUrl` enforces http(s) absolute URL; invalid → Pydantic raises 422.

#### Response 201 Created

```json
{
  "id": "8f5b6e7c-1234-5678-9abc-def012345678",
  "name": "Personal site contact",
  "redirect_url": "https://example.com/thanks",
  "submit_url": "https://api.formsnap.example/f/8f5b6e7c-…",
  "html_snippet": "<form action=\"https://api.formsnap.example/f/8f5b6e7c-…\" method=\"POST\">\n  <input name=\"name\" type=\"text\" required />\n  <input name=\"email\" type=\"email\" required />\n  <textarea name=\"message\"></textarea>\n  <input type=\"text\" name=\"_gotcha\" style=\"display:none\" />\n  <button type=\"submit\">Send</button>\n</form>",
  "created_at": "2026-04-21T10:00:00Z",
  "updated_at": "2026-04-21T10:00:00Z"
}
```

`html_snippet` is rendered server-side from a template baked into `templates.py` so the dashboard can display it without embedding the template logic in JS.

#### Pydantic schema (response)

```python
class FormResponse(BaseModel):
    id: str
    name: str
    redirect_url: str | None
    submit_url: str
    html_snippet: str
    created_at: datetime
    updated_at: datetime
```

#### Errors

| Status | Body | When |
|--------|------|------|
| 401 | `{"detail": "Invalid authentication token"}` | Missing/invalid token |
| 403 | `{"detail": "email_not_verified"}` | User's email not verified |
| 422 | Pydantic validation error | `name` empty or > 255; `redirect_url` not http(s) absolute |

#### Service method

`create_form(db, owner_id, name, redirect_url) -> Form`. Route maps to `FormResponse` via `_form_to_response(form)` helper that injects `submit_url` and `html_snippet`.

---

### 3.4 Endpoint: PATCH /api/v1/forms/{formId}

**Path**: `PATCH /api/v1/forms/{formId}`
**Auth**: Required (must own the form).
**Purpose**: Rename a form or update its `redirect_url`.

#### Request body

```json
{ "name": "New name", "redirect_url": "https://new.example.com/thanks" }
```

Both fields optional; at least one MUST be provided (else 422).

#### Pydantic schema (request)

```python
class FormUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    redirect_url: HttpUrl | None = None  # None = unset; absent in body = no change

    @model_validator(mode="after")
    def at_least_one(self):
        if self.name is None and "redirect_url" not in self.model_fields_set:
            raise ValueError("at least one field must be provided")
        return self
```

To distinguish "set redirect_url to null" from "don't change it", use `model_fields_set` membership check; `None` in body means "clear".

#### Response 200 OK

`FormResponse` (same shape as 3.3).

#### Errors

| Status | Body | When |
|--------|------|------|
| 401 | standard | invalid token |
| 404 | `{"detail": "form_not_found"}` | id unknown OR not owned (no leak) |
| 422 | Pydantic | invalid url or no fields |

#### Service method

`update_form(db, owner_id, form_id, **patch) -> Form | None`. `None` → 404.

---

### 3.5 Endpoint: DELETE /api/v1/forms/{formId}

**Path**: `DELETE /api/v1/forms/{formId}`
**Auth**: Required (must own the form).
**Purpose**: Soft-delete the form; hard-delete its submissions.

#### Request

No body.

#### Response 204 No Content

Empty body.

#### Errors

| Status | Body | When |
|--------|------|------|
| 401 | standard | |
| 404 | `{"detail": "form_not_found"}` | id unknown / not owned / already deleted |

#### Service method

`delete_form(db, owner_id, form_id) -> bool`. Returns `True` on success, `False` if not found / not owned. Inside: `DELETE FROM submissions WHERE form_id=?` then `UPDATE forms SET deleted_at=now() WHERE id=? AND owner_id=? AND deleted_at IS NULL`.

---

### 3.6 Endpoint: GET /api/v1/forms/{formId}/submissions

**Path**: `GET /api/v1/forms/{formId}/submissions`
**Auth**: Required (must own the form).
**Purpose**: Paginated submission inbox.

#### Query parameters

| Param | Type | Default | Constraint |
|-------|------|---------|------------|
| `page` | int | `1` | `>= 1` |
| `page_size` | int | `25` | `1 <= page_size <= 100` |

Pagination uses offset/limit (`(page-1) * page_size`, `limit page_size`). MVP scale (≤ 10k rows per form) tolerates this; cursor-based pagination is a future enhancement.

#### Response 200 OK

```json
{
  "items": [
    {
      "id": "11111111-…",
      "created_at": "2026-04-20T15:32:11Z",
      "data": { "name": "Ada", "email": "ada@example.com", "message": "Hi!" },
      "email_status": "sent",
      "email_attempts": 1
    }
  ],
  "page": 1,
  "page_size": 25,
  "total": 17
}
```

#### Pydantic schema

```python
# app/schemas/submission.py
class SubmissionResponse(BaseModel):
    id: str
    created_at: datetime
    data: dict
    email_status: Literal["pending", "sent", "failed"]
    email_attempts: int

class SubmissionPage(BaseModel):
    items: list[SubmissionResponse]
    page: int
    page_size: int
    total: int
```

#### Errors

| Status | Body | When |
|--------|------|------|
| 401 | standard | |
| 404 | `{"detail": "form_not_found"}` | id unknown / not owned |
| 422 | Pydantic | bad page / page_size |

#### Service method

`list_submissions(db, owner_id, form_id, page, page_size) -> SubmissionPage | None`. Inside: ownership check via `get_form_for_owner`; if `None`, route → 404. Otherwise count + page query.

---

### 3.7 Endpoint: GET /api/v1/forms/{formId}/submissions.csv

**Path**: `GET /api/v1/forms/{formId}/submissions.csv`
**Auth**: Required (must own the form).
**Purpose**: Stream the entire submissions list as CSV.

#### Request

No body. No query parameters.

#### Response 200 OK

- **Content-Type**: `text/csv; charset=utf-8`
- **Content-Disposition**: `attachment; filename="<sanitized-form-name>-submissions.csv"`
- **Body**: streamed CSV.

CSV semantics:
- Column order: `submitted_at`, then the alphabetically sorted **union of all distinct keys** seen across all submissions in this form.
- One row per submission, newest first.
- Empty cell when a submission did not include that field (NOT the literal `null`).
- Values that are nested objects / arrays are JSON-serialized into the cell.
- Header row included.

Sanitized filename: `re.sub(r'[^A-Za-z0-9._-]+', '-', form.name)` — fallback to `form-{id8}` if empty.

#### Implementation

Two passes when streaming with `StreamingResponse`:
1. First pass: `SELECT data FROM submissions WHERE form_id=? ORDER BY created_at DESC` with `stream_results=True` / `yield_per(500)` to compute the column union (memory-bounded by the union of keys, not by row count).
2. Second pass: same query, render header + rows.

For MVP scale this is acceptable. If volume grows we can replace with a SQL-side `jsonb_object_keys` aggregation.

#### Errors

| Status | Body | When |
|--------|------|------|
| 401 | standard | |
| 404 | `{"detail": "form_not_found"}` | id unknown / not owned |

#### Service method

`stream_submissions_csv(db, owner_id, form_id) -> AsyncIterator[str] | None`. Route returns `StreamingResponse(iterator, media_type="text/csv", headers={...})`.

---

## 4. Schema cross-reference

| Pydantic schema | File | Used by |
|-----------------|------|---------|
| `UserMeResponse` | `app/schemas/user.py` | GET `/api/v1/me` |
| `FormCreate`, `FormUpdate`, `FormResponse`, `FormListItem` | `app/schemas/form.py` | `/api/v1/forms*` |
| `SubmissionResponse`, `SubmissionPage`, `PublicSubmissionAck` | `app/schemas/submission.py` | `/api/v1/forms/{id}/submissions`, `POST /f/{id}` |

All response models use `model_config = ConfigDict(from_attributes=True)` to allow direct ORM serialization where applicable.

---

## 5. Error taxonomy summary

| HTTP | Public ingest body | Authenticated body | Cause |
|------|-------------------|-------------------|-------|
| 200 | `{"ok": true, "id": "<uuid>"}` | resource JSON | Success / honeypot |
| 201 | n/a | resource JSON | POST /api/v1/forms success |
| 204 | n/a | empty | DELETE success |
| 303 | empty + `Location` | n/a | Redirect after submit |
| 400 | `{"ok": false, "error": "invalid_body"}` | n/a | Malformed body |
| 401 | n/a | `{"detail": "..."}` | Auth failure |
| 403 | n/a | `{"detail": "email_not_verified"}` | Verification gate |
| 404 | `{"ok": false, "error": "form_not_found"}` | `{"detail": "form_not_found"}` | Resource missing |
| 413 | `{"ok": false, "error": "payload_too_large"}` | n/a | Body > 100 KB |
| 415 | `{"ok": false, "error": "unsupported_media_type"}` | n/a | Bad Content-Type |
| 422 | n/a | Pydantic detail array | Schema validation |
| 500 | `{"ok": false, "error": "internal_error"}` | `{"detail": "..."}` | Unhandled |
| 503 | n/a | `{"detail": "Database not configured"}` | Misconfig (dev/staging) |

---

## 6. Service-layer mapping (cross-reference)

| Endpoint | Primary service function | File |
|----------|--------------------------|------|
| GET `/api/v1/me` | `get_or_create_user` | `app/services/user.py` |
| GET `/api/v1/forms` | `list_forms` | `app/services/form.py` |
| POST `/api/v1/forms` | `create_form` | `app/services/form.py` |
| PATCH `/api/v1/forms/{id}` | `get_form_for_owner`, `update_form` | `app/services/form.py` |
| DELETE `/api/v1/forms/{id}` | `delete_form` | `app/services/form.py` |
| GET `/api/v1/forms/{id}/submissions` | `get_form_for_owner`, `list_submissions` | `app/services/form.py`, `app/services/submission.py` |
| GET `/api/v1/forms/{id}/submissions.csv` | `get_form_for_owner`, `stream_submissions_csv` | same |
| POST `/f/{formId}` | `get_form_for_public_submit`, `persist_submission`, `send_notification_with_retry` | `app/services/form.py`, `app/services/submission.py`, `app/services/email/sender.py` |
