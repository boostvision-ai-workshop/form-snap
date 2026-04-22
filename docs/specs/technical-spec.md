# Technical Specification: FormSnap

> Phase 1 architecture for FormSnap, a backend-as-an-endpoint for static-site forms.
> Stack is locked by `AGENTS.md` (FastAPI + Firebase Auth + Supabase Postgres + Next.js 16 + Shadcn UI v2 + Tailwind v4). All decisions below honor those constraints. The PRD's "Technical Considerations" (PRD §8) explicitly overrides the original brief's mention of Next.js API Routes / Supabase Auth / Resend — only the locked stack is implemented.

> **Reconciliation note (2026-04-22)**: PRD §0 "Visual Assets" was added after Batches 1–4 shipped. This spec has been updated **in place** to reference the new brand palette and full-UI mockup without altering the delivered architecture, data model, API contracts, or batch boundaries. All §0-related work is layered onto Phase 2 (Designer) token derivation and Phase 4 (QA Layer 3) visual parity checks; no backend or schema change is implied.

## 0. Visual Assets — Source-of-Truth Linkage (PRD §0)

PRD §0 declares two authoritative visual-reference artifacts that downstream phases MUST consume. This spec does NOT duplicate their content; it only anchors them for the Designer and Engineer phases.

### 0.1 Brand icon & palette (from `docs/prd/form-snap.svg`)

- Authoritative palette (derived from the icon gradient; Designer MUST surface these as `design-system.md` tokens):
  - Primary cyan `#29B6F6`
  - Brand blue (mid-stop) `#4361EE`
  - Brand violet `#8A2BE2`
  - Sparkle gradient `#2DA9FF → #B62CFF` (reserved for primary CTAs: "Create form", "Publish", "Upgrade", marketing Hero CTA)
  - Neutral surface (document body) `#F6F7FF`
  - Neutral pills / chips `#CDD4F9`, `#DCE6FF`, `#EDEBFF`
- Raster fallback: `docs/prd/format-snap.png` (OG / social share / email signatures only).
- Usage rules (carried over from PRD §0.1):
  - SVG is preferred for favicon + marketing header logo.
  - All Tailwind v4 CSS custom properties in `frontend/src/app/globals.css` that represent brand color MUST be derived from this palette (no ad-hoc hex values in components).
  - Primary CTA gradient is the sparkle gradient OR solid `#4361EE` — Designer picks per surface; Engineer implements via CSS variables tokenized in `design-system.md`.

### 0.2 Full UI reference mockup (`docs/prd/formsnap_prd_design.png`)

- Treated as the **authoritative layout and visual source of truth** for every page the product ships.
- Scope of the mockup (row-by-row) is documented in PRD §0.2. For **this spec**, the implemented surfaces (the narrower "static-site forms backend" product — Batches 1–4) map to the mockup's rows as follows:

  | Implemented surface | Mockup row | Notes |
  |---------------------|-----------|-------|
  | `/` (marketing landing) | Row 1 — Marketing homepage | Hero + "Trusted by" logo strip |
  | `/sign-in`, `/sign-up`, `/forgot-password` | Row 2 — Auth panels | Three-panel composition — FormSnap ships sign-in + sign-up; forgot-password reference is used for visual consistency only (not a shipped route in Batches 1–4) |
  | `/dashboard` (form list) | Row 5 — Forms list | Table with status + per-row actions; FormSnap's "Create form" + row actions map 1:1 |
  | `/dashboard/forms/{formId}` (Inbox + Settings tabs) | Rows 6 + 7 — Builder / Submissions list | Inbox tab uses row-7 table density; Settings tab uses row-9 "General" layout |
  | `/submitted` | Derived from Row 1 success copy conventions | Minimal thank-you page |

  Rows covering pricing (Row 3), dashboard KPI (Row 4), analytics (Row 8), billing (Row 10), team (Row 11), and integrations (Row 12) are **out of scope** for the currently-shipped product but MUST remain in the mockup reference so Designer can establish a consistent token + layout vocabulary.

- Consumer rules:
  - **Designer (Phase 2)** MUST extract layout spacing, sidebar width, header height, card border radius, table density, typography hierarchy, and non-brand colors (success / warn / danger, muted, border) from this PNG into `design-system.md` and `page-layouts.md`.
  - **Engineer (Phase 3)** MUST render each implemented page to be side-by-side comparable with its corresponding region of the mockup. The mockup is the single visual acceptance target.
  - **QA (Phase 4 Layer 3)** MUST perform side-by-side visual parity checks between the live UI and `docs/prd/formsnap_prd_design.png` for every page shipped in Batches 1–4.

### 0.3 Impact on this spec

- **No file structure change** is implied by §0.
- **No API contract change** is implied by §0.
- **No database schema change** is implied by §0.
- The `globals.css` Tailwind v4 tokens should be *audited* against the §0.1 palette during Phase 2 (Designer) and refreshed if they drift. This audit is not an AT because PRD §0 is a visual-source-of-truth declaration, not a new user-visible feature — visual parity is already covered by QA Layer 3 in `delivery-plan.md`.

---

## 1. Overview

FormSnap exposes one public ingest endpoint (`POST /f/{formId}`) plus a small authenticated CRUD API for the dashboard. The public endpoint persists the submission, fires a notification email to the form owner, and either redirects (browser flow) or acks JSON (XHR flow). The dashboard, a Next.js 16 client-rendered app under `(dashboard)/`, lets owners create / edit / delete forms, browse the inbox, and export CSV.

**Three-service shape**:

```
[ Static site / browser ]                [ Dashboard browser ]
        | POST /f/{formId}                       | bearer Firebase ID token
        v                                        v
+--------------------------------- FastAPI -----------------------------+
| /f/{formId}        (public, CORS *, no auth)                          |
| /api/v1/me         (auth: Firebase Bearer)                            |
| /api/v1/forms*     (auth: Firebase Bearer, owner-scoped)              |
+--------+-------------------+-----------------------------+------------+
         |                   |                             |
   SQLAlchemy 2.x       Email Provider               Firebase Admin SDK
   (Supabase             (abstraction +             (token verification,
    Postgres)            Resend adapter)             email_verified read)
```

Three persistent tables back the product: `profile` (Firebase mirror, lazy-provisioned), `form` (owner-scoped logical endpoint), `submission` (opaque JSONB payload). See `data-model.md` for schema.

---

## 2. Architecture Decisions

### 2.1 Two router roots, not one

The public submission endpoint must live at `/f/{formId}` (PRD §8 — "this is a public contract"), NOT under `/api/v1`. We mount it as a top-level router on the FastAPI `app`, parallel to the `api_router` at `/api/v1`.

- `app.include_router(submissions_public_router)` → `/f/{formId}`
- `app.include_router(api_router, prefix="/api/v1")` → `/api/v1/...`

### 2.2 CORS posture is split per router

| Router | Allowed origins | Credentials | Methods |
|--------|----------------|-------------|---------|
| `/f/*` (public ingest) | `*` (wildcard) | `false` | `POST, OPTIONS` |
| `/api/v1/*` (dashboard) | `BACKEND_CORS_ORIGINS` (dashboard origin only) | `true` | `*` |

`fastapi.middleware.cors.CORSMiddleware` cannot trivially differentiate by route. We will register **two CORSMiddleware instances** in the right order, OR (preferred) handle CORS for `/f/*` with a small per-router middleware (`@router.middleware("http")`) that sets `Access-Control-Allow-Origin: *` and 204s the preflight, while the global `CORSMiddleware` covers the dashboard origin only. Implementation choice goes to the Engineer; the spec is "ingest is wide open, dashboard is locked to the dashboard origin".

### 2.3 The existing `users` table IS the FormSnap `profile` entity

The repo already ships a `users` table seeded by Alembic `0001` and a matching SQLAlchemy `User` model. Its purpose (Firebase identity mirror, FK target for owned objects) is exactly the PRD's `profile`. Rather than create a parallel table, **we reuse `users` as `profile`** and add the one missing field via a new migration: `email_verified bool not null default false`.

- SQLAlchemy class: `app.models.user.User` (existing — extended with `email_verified`)
- Table name: `users` (existing — unchanged)
- The PRD will refer to "profile" semantically; the table name stays `users` for backward-compat with the existing scaffolding.
- Foreign keys from `forms.owner_id` reference `users.id`.

This keeps existing tests, dependencies, and `/api/v1/users/me` route working while satisfying the PRD's data-entity definition.

### 2.4 Existing `/api/v1/users/me` is renamed to `/api/v1/me`

PRD §5 explicitly defines `GET /api/v1/me`. The existing scaffolding mounts it at `/api/v1/users/me`. Engineer will:
- Move handler from `app/api/v1/users.py` to a new `app/api/v1/me.py` mounted at prefix `""` (so the route is exactly `GET /api/v1/me`).
- Update `app/api/v1/router.py` accordingly.
- Delete the old `users` router (its only endpoint moves; nothing else lives there).

The response shape adds `email_verified` (already a Firebase claim) and matches the PRD.

### 2.5 Email provider abstraction

Email delivery is behind an interface so the concrete provider is swappable:

```python
# app/services/email/base.py
from typing import Protocol

class EmailProvider(Protocol):
    async def send(
        self,
        *,
        to: str,
        subject: str,
        text: str,
        html: str | None = None,
    ) -> str:  # returns provider message-id
        ...
```

**Default provider for MVP: Resend** (HTTP API, no SMTP infrastructure, free tier covers MVP volume, matches PRD §7 suggestion).

```python
# app/services/email/resend_provider.py
class ResendProvider:
    def __init__(self, api_key: str, from_address: str): ...
    async def send(self, *, to, subject, text, html=None) -> str: ...
```

Registered via factory in `app/services/email/__init__.py` based on `EMAIL_PROVIDER` env var; default `"resend"`. A `NoopProvider` (logs only, returns fake id) is used when `EMAIL_PROVIDER=noop` for local dev / test.

### 2.6 Email send is in-process, not enqueued (MVP)

PRD §8 latency requires the redirect to NOT wait for SMTP. We use FastAPI's `BackgroundTasks` to fire-and-monitor the send AFTER the response is committed:

```python
@router.post("/f/{form_id}")
async def submit(..., background_tasks: BackgroundTasks):
    submission = await persist_submission(...)
    background_tasks.add_task(send_notification_with_retry, submission.id)
    return redirect_or_ack(...)
```

`send_notification_with_retry` does up to 3 attempts with exponential backoff (1s, 4s, 16s) and writes back `email_status` + `email_attempts` on the `submission` row. No external queue (Celery / RQ) for MVP — re-evaluate if volume justifies it.

**Risk note**: in-process tasks are lost if the process crashes between persisting and sending. Acceptable for MVP because (a) the submission itself IS persisted, (b) PRD §3 explicitly requires the failure to be *visible* (badge in inbox) not silent, and (c) volume is low. Documented in §6 below.

### 2.7 Submission body parsing — content-type matrix

| Request `Content-Type` | Parse strategy | Response strategy |
|------------------------|----------------|--------------------|
| `application/x-www-form-urlencoded` | `await request.form()` → flat dict | 303 redirect (per redirect rules) |
| `application/json` | `await request.json()` (must be a JSON object) | `200 {"ok": true, "id": "<uuid>"}` |
| `multipart/form-data` | `await request.form()` — text fields kept, file fields dropped | 303 redirect (browser flow) |
| anything else | 415 Unsupported Media Type | JSON error |

Body size is capped *before* parsing using a Starlette middleware that reads `Content-Length` and rejects > 100 KB with 413. For chunked uploads without `Content-Length`, the middleware streams up to 100 KB and aborts on overflow. This must run before the body is consumed by the route handler.

### 2.8 Response mode (HTML vs JSON) negotiation

Precedence:
1. If `Content-Type` is `application/json` → JSON ack.
2. Else if `Accept` header contains `application/json` and not `text/html` → JSON ack.
3. Else (browser HTML form) → 303 redirect.

This yields the PRD's required behavior (HTML form submitter sees redirect; `fetch({headers:{Accept:'application/json'}})` sees JSON).

### 2.9 Redirect target precedence

Per PRD §3 and §6:
1. `_redirect` field in the submitted body (if present and a syntactically valid absolute http(s) URL).
2. The form's `redirect_url` (if set and valid).
3. Default: `<DASHBOARD_BASE_URL>/submitted` (the FormSnap-hosted success page).

Invalid URLs at any step fall through to the next. Validation: `urllib.parse.urlparse` + scheme in `{http, https}` + non-empty netloc. Logged on rejection, never raises to the user.

### 2.10 Honeypot handling (`_gotcha`)

If `_gotcha` is present and non-empty: the request returns the same success-shaped response (303 / 200) but **nothing is persisted** and **no email is sent**. This must be indistinguishable from a real success to a probing bot. The event is logged with the IP, user-agent, and `formId` for ops visibility but is not surfaced in the dashboard.

Both reserved fields (`_redirect`, `_gotcha`) are stripped from `submission.data` before persistence.

### 2.11 Dashboard rendering

| Route | Group | Strategy | Notes |
|-------|-------|----------|-------|
| `/` | `(marketing)/` | SSR | Marketing landing |
| `/sign-up` | `(marketing)/` (or `(auth)/`) | SSR shell + `"use client"` form | Form interactivity needs CSR; route shell can be SSR |
| `/sign-in` | same | same | |
| `/verify-email` | `(auth)/` | CSR (`"use client"`) | Reads Firebase user state |
| `/submitted` | `(marketing)/` | SSR | Shown to anonymous form submitters |
| `/dashboard` | `(dashboard)/` | CSR | Firebase Auth required |
| `/dashboard/forms/new` | `(dashboard)/` | CSR | Modal preferred over page; both spec'd |
| `/dashboard/forms/[formId]` | `(dashboard)/` | CSR | Tabs: Inbox + Settings |
| `/*` | root | SSR | 404 |

Existing scaffolding has `(auth)/login` and `(auth)/signup`. Engineer renames to `/sign-up` and `/sign-in` per PRD §6. Existing `(dashboard)/dashboard` and `(dashboard)/settings` stay; `forms/[formId]` and `forms/new` are added.

### 2.12 Marketing route group convention

Existing repo has `app/page.tsx` and no `(marketing)/` route group. Per `STANDARDS.md` the marketing group is the canonical home for SSR public pages. Engineer will introduce `app/(marketing)/` and migrate the landing + add `/submitted`. The shell at `app/layout.tsx` stays.

### 2.13 Frontend API client usage

All dashboard API calls go through `frontend/src/lib/api/client.ts` (existing — already injects Firebase Bearer token). New convenience modules go in `frontend/src/lib/api/`:

- `forms.ts` — `listForms()`, `createForm()`, `updateForm()`, `deleteForm()`
- `submissions.ts` — `listSubmissions(formId, page, page_size)`, `exportCsvUrl(formId)` (signed URL builder for CSV download)
- `me.ts` — `getMe()`

Each function awaits `apiClient(endpoint, init)` then `.json()` and returns a typed result. Errors thrown as `ApiError` (already defined in client.ts).

---

## 3. Frontend Architecture

> **Visual reference**: Every page described below maps to a region of `docs/prd/formsnap_prd_design.png` per §0.2. Designer (Phase 2) produces the token + layout derivations; Engineer implements against the mockup; QA Layer 3 verifies parity.

### 3.1 Pages, route groups, components

**`(marketing)/`** (SSR):
- `page.tsx` — landing
- `submitted/page.tsx` — default thank-you
- Components reused: `marketing-header`, `marketing-footer` (existing)

**`(auth)/`** (SSR shell + CSR forms):
- `sign-in/page.tsx` — sign-in form
- `sign-up/page.tsx` — sign-up form
- `verify-email/page.tsx` — verification reminder
- Components: `login-form`, `signup-form` (existing — light edits for PRD copy), new `verify-email-card`

**`(dashboard)/`** (CSR):
- `dashboard/page.tsx` — form list (existing — to be replaced with form-list UI)
- `dashboard/forms/new/page.tsx` — create-form (modal preferred; this is the fallback page)
- `dashboard/forms/[formId]/page.tsx` — inbox + settings tabs
- Components (new):
  - `dashboard/form-list.tsx`, `form-list-empty-state.tsx`, `form-row.tsx`
  - `dashboard/create-form-dialog.tsx`
  - `dashboard/form-snippet.tsx` (renders the copy-pastable HTML), `copy-button.tsx`
  - `dashboard/submission-table.tsx`, `submission-row.tsx`, `submission-detail.tsx`
  - `dashboard/form-settings-form.tsx`, `delete-form-dialog.tsx`
  - `dashboard/email-status-badge.tsx`
  - `dashboard/csv-export-button.tsx`
  - `dashboard/email-verification-gate.tsx` (disables "Create form" CTA when unverified)
- Reused components: `dashboard-header`, `sidebar-nav`, `sidebar`, `user-menu` (existing)

### 3.2 Shadcn UI components used

From the locked set in `STANDARDS.md`:

- Form list: `card`, `button`, `badge`, `dropdown-menu`, `dialog` (delete confirm)
- Inbox: `tabs`, `table`, `badge`, `button`, `skeleton`, `scroll-area`
- Create form: `dialog`, `input`, `label`, `button`, `alert` (URL validation hint)
- Settings: `input`, `label`, `button`, `dialog`, `separator`, `switch` (future)
- Auth: `input`, `input-group`, `label`, `button`, `alert`, `card`
- Snippet display: `card`, `button` (copy)
- Toasts on copy / save / error: `sonner`

**No** new Shadcn components are introduced. **No** `ui/` files are modified.

### 3.3 State management

- Auth state: existing `AuthContext` (Firebase `onAuthStateChanged`).
- Form data: per-page local state via `useState` + `useEffect`, calling the typed API client. No SWR / React Query in MVP — keep dependencies minimal.
- Mutations: optimistic for delete (rollback on error); plain submit-then-refetch for create / update.
- Email-verified gate: read `getMe().email_verified` on dashboard mount, store in a small `ProfileContext` or pass via props. PRD §3 requires the "Create form" CTA to be disabled with a clear message when unverified.

### 3.4 API integration

Each dashboard page calls the API client on mount:

| Page | Calls | When |
|------|-------|------|
| `/dashboard` | `GET /api/v1/me`, `GET /api/v1/forms` | On mount |
| `/dashboard/forms/new` | `POST /api/v1/forms` | On submit |
| `/dashboard/forms/[id]` (Inbox) | `GET /api/v1/forms/{id}/submissions?page=&page_size=` | On mount + page change |
| `/dashboard/forms/[id]` (Settings) | `GET /api/v1/forms` (or hydrate from list cache); `PATCH /api/v1/forms/{id}`; `DELETE /api/v1/forms/{id}` | On submit / delete |
| `/dashboard/forms/[id]` CSV button | `GET /api/v1/forms/{id}/submissions.csv` | Click — direct download |

CSV download: because the dashboard uses Bearer auth (not cookies), the CSV button cannot be a plain `<a>`. Either (a) fetch the CSV via `apiClient`, build a Blob, then `URL.createObjectURL` and trigger a download anchor, or (b) issue a short-lived signed download URL. **Pick (a)** for MVP — no extra server work, no signed-URL infrastructure. Stream-then-blob is acceptable for ≤ 10k rows.

---

## 4. Backend Architecture

### 4.1 New service-layer modules

```
backend/app/services/
├── user.py              # existing — extended with email_verified sync
├── form.py              # NEW — form CRUD + ownership enforcement
├── submission.py        # NEW — persist, list, CSV stream
└── email/
    ├── __init__.py      # NEW — provider factory
    ├── base.py          # NEW — EmailProvider Protocol
    ├── resend_provider.py  # NEW — Resend HTTP adapter
    ├── noop_provider.py    # NEW — local/test stub
    ├── templates.py     # NEW — render notification subject + body
    └── sender.py        # NEW — send_notification_with_retry(submission_id)
```

### 4.2 Service function inventory

```python
# app/services/form.py
async def create_form(db, owner_id: UUID, name: str, redirect_url: str | None) -> Form
async def list_forms(db, owner_id: UUID) -> list[FormWithSubmissionStats]
async def get_form_for_owner(db, owner_id: UUID, form_id: UUID) -> Form | None
async def get_form_for_public_submit(db, form_id: UUID) -> Form | None  # bypasses owner check
async def update_form(db, owner_id: UUID, form_id: UUID, **patch) -> Form
async def delete_form(db, owner_id: UUID, form_id: UUID) -> None  # cascades submissions

# app/services/submission.py
async def persist_submission(db, form_id: UUID, data: dict) -> Submission
async def list_submissions(db, owner_id: UUID, form_id: UUID, page: int, page_size: int) -> Page
async def stream_submissions_csv(db, owner_id: UUID, form_id: UUID) -> AsyncIterator[str]
async def mark_email_status(db, submission_id: UUID, status: str, increment_attempt: bool) -> None

# app/services/email/sender.py
async def send_notification_with_retry(submission_id: UUID) -> None
async def render_notification(form: Form, submission: Submission, dashboard_url: str) -> Email
```

`get_form_for_owner` enforces tenant isolation: every dashboard read MUST pass the current user's `owner_id`. Routes never query `Form` directly. This satisfies `AGENTS.md` §2.7 + PRD §8 security requirement.

### 4.3 Service-layer ownership enforcement

```python
# Inside every owner-scoped service
async def get_form_for_owner(db, owner_id, form_id):
    result = await db.execute(
        select(Form).where(Form.id == form_id, Form.owner_id == owner_id, Form.deleted_at.is_(None))
    )
    return result.scalar_one_or_none()
```

If the form does not belong to the owner, the service returns `None`. The route handler maps `None` → 404 (NOT 403). This avoids leaking the existence of someone else's `formId`.

### 4.4 Soft-delete vs hard-delete decision

PRD §4 leaves this to the Architect. **Decision: soft delete for `form` (`deleted_at` tombstone), hard delete for `submission` (cascade on form delete).**

Rationale:
- Soft delete on `form` is cheap and keeps the door open for "undo" later (out of MVP but trivial to add).
- All reads filter `deleted_at IS NULL`. Public ingest filters identically — a deleted form's `formId` returns 404.
- Submissions are deleted with the form for storage hygiene and to satisfy the PRD requirement that submissions of deleted forms "must not be readable anywhere" (a hard delete is the simplest guarantee). FK is `ON DELETE CASCADE`. Soft-deleting the form means we delete submissions explicitly in the service before tombstoning the form. (Alternative: keep submissions, rely on the deleted_at filter at read time. We pick the explicit delete because PRD says irreversible and storage is cheaper to free.)

### 4.5 New API routers

```
backend/app/api/v1/
├── router.py        # existing — register me, forms, submissions
├── health.py        # existing — keep
├── me.py            # NEW — replaces users.py for /me
├── forms.py         # NEW — /api/v1/forms* CRUD
└── submissions.py   # NEW — /api/v1/forms/{id}/submissions{,/.csv}

backend/app/api/
└── public.py        # NEW — POST /f/{formId} (mounted at app root, NOT under /api/v1)
```

Registration in `main.py`:
```python
from app.api.public import router as public_router
from app.api.v1.router import api_router

app.include_router(public_router)  # mounts /f/{formId}
app.include_router(api_router, prefix=settings.API_V1_PREFIX)
```

### 4.6 Request size guard

```
backend/app/middleware/
└── body_size_limit.py  # NEW — Starlette middleware enforcing 100 KB on POST /f/*
```

Mount only on the public router or check the path inside the middleware. Returns 413 with JSON body `{"ok": false, "error": "payload_too_large"}`.

### 4.7 Pydantic schemas

```
backend/app/schemas/
├── user.py          # existing — extend with email_verified
├── form.py          # NEW — FormCreate, FormUpdate, FormResponse, FormListItem (with submission_count, last_submission_at)
└── submission.py    # NEW — SubmissionResponse, SubmissionPage, PublicSubmissionAck
```

All response models opt into `from_attributes=True` for ORM serialization.

### 4.8 Database access patterns

| Service call | Query | Index used |
|--------------|-------|------------|
| `list_forms(owner_id)` | `SELECT … FROM users JOIN forms ON forms.owner_id = users.id WHERE owner_id=? AND deleted_at IS NULL` plus a per-form aggregate `count(submissions)` and `max(submissions.created_at)` | `ix_forms_owner_id` |
| `get_form_for_owner` | `WHERE id=? AND owner_id=? AND deleted_at IS NULL` | PK + `ix_forms_owner_id` |
| `get_form_for_public_submit` | `WHERE id=? AND deleted_at IS NULL` | PK |
| `list_submissions` | `WHERE form_id=? ORDER BY created_at DESC LIMIT ? OFFSET ?` | `ix_submissions_form_id_created_at` (composite) |
| `stream_submissions_csv` | `WHERE form_id=? ORDER BY created_at DESC` (server-side cursor / yield_per) | same |

Submission count + last-submission-at on the form list: a single LEFT JOIN with `GROUP BY` is sufficient at MVP scale; no caching needed below 10k rows per form.

### 4.9 Authentication flow

1. Browser signs in via Firebase JS SDK (`signInWithEmail`). Existing `AuthContext` exposes `user`.
2. Each API call attaches `Authorization: Bearer <idToken>` (existing `apiClient`).
3. `get_current_user` (existing — `app/core/security.py`) verifies via Firebase Admin SDK and returns the decoded claims dict.
4. New helper `get_current_profile(db, claims)` resolves claims → DB `User` row, lazily creating it if absent. Used by every authenticated route. Lives in `app/dependencies.py` (extends existing `get_db`).
5. `email_verified` for the gating rule comes from the **decoded token claim**, not the cached `User.email_verified` column — Firebase is the source of truth in real time. The DB column is a snapshot for analytics, refreshed on each /me call.

```python
# app/dependencies.py — new
async def get_current_profile(
    claims: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> User:
    user, _ = await get_or_create_user(
        db,
        firebase_uid=claims["uid"],
        email=claims.get("email", ""),
        email_verified=claims.get("email_verified", False),
    )
    return user

async def require_verified_profile(user: User = Depends(get_current_profile)) -> User:
    if not user.email_verified:
        raise HTTPException(403, "email_not_verified")
    return user
```

`POST /api/v1/forms` uses `Depends(require_verified_profile)`; all other authenticated routes use `Depends(get_current_profile)`.

---

## 5. File Structure Plan

### 5.1 New backend files

```
backend/app/api/public.py
backend/app/api/v1/me.py
backend/app/api/v1/forms.py
backend/app/api/v1/submissions.py
backend/app/middleware/__init__.py
backend/app/middleware/body_size_limit.py
backend/app/models/form.py
backend/app/models/submission.py
backend/app/schemas/form.py
backend/app/schemas/submission.py
backend/app/services/form.py
backend/app/services/submission.py
backend/app/services/email/__init__.py
backend/app/services/email/base.py
backend/app/services/email/resend_provider.py
backend/app/services/email/noop_provider.py
backend/app/services/email/templates.py
backend/app/services/email/sender.py
backend/alembic/versions/0002_add_email_verified_to_users.py
backend/alembic/versions/0003_create_forms_table.py
backend/alembic/versions/0004_create_submissions_table.py
backend/tests/test_public_submit.py
backend/tests/test_forms_api.py
backend/tests/test_submissions_api.py
backend/tests/test_email_provider.py
```

### 5.2 Modified backend files

```
backend/app/main.py             # register public router + body-size middleware; split CORS
backend/app/api/v1/router.py    # remove users router, add me/forms/submissions
backend/app/config.py           # add EMAIL_PROVIDER, RESEND_API_KEY, EMAIL_FROM, DASHBOARD_BASE_URL, MAX_BODY_BYTES
backend/app/dependencies.py     # add get_current_profile, require_verified_profile
backend/app/models/user.py      # add email_verified column
backend/app/services/user.py    # accept and write email_verified on get_or_create_user
backend/app/schemas/user.py     # add email_verified to UserMeResponse (already implicit; promote to required)
```

### 5.3 Removed backend files

```
backend/app/api/v1/users.py     # endpoint moves to me.py
```

### 5.4 New frontend files

```
frontend/src/app/(marketing)/page.tsx                     # move from app/page.tsx
frontend/src/app/(marketing)/submitted/page.tsx
frontend/src/app/(auth)/sign-in/page.tsx                  # rename from login/
frontend/src/app/(auth)/sign-up/page.tsx                  # rename from signup/
frontend/src/app/(auth)/verify-email/page.tsx
frontend/src/app/(dashboard)/dashboard/forms/new/page.tsx
frontend/src/app/(dashboard)/dashboard/forms/[formId]/page.tsx
frontend/src/components/dashboard/form-list.tsx
frontend/src/components/dashboard/form-list-empty-state.tsx
frontend/src/components/dashboard/form-row.tsx
frontend/src/components/dashboard/create-form-dialog.tsx
frontend/src/components/dashboard/delete-form-dialog.tsx
frontend/src/components/dashboard/form-snippet.tsx
frontend/src/components/dashboard/copy-button.tsx
frontend/src/components/dashboard/submission-table.tsx
frontend/src/components/dashboard/submission-row.tsx
frontend/src/components/dashboard/submission-detail.tsx
frontend/src/components/dashboard/email-status-badge.tsx
frontend/src/components/dashboard/email-verification-gate.tsx
frontend/src/components/dashboard/csv-export-button.tsx
frontend/src/components/dashboard/form-settings-form.tsx
frontend/src/components/auth/verify-email-card.tsx
frontend/src/lib/api/forms.ts
frontend/src/lib/api/submissions.ts
frontend/src/lib/api/me.ts
frontend/src/contexts/profile-context.tsx               # exposes email_verified gate
frontend/src/__tests__/forms-api-client.test.ts
frontend/src/__tests__/submission-table.test.tsx
```

### 5.5 Modified frontend files

```
frontend/src/app/(dashboard)/dashboard/page.tsx           # replace placeholder with FormList
frontend/src/components/auth/auth-guard.tsx               # respect /sign-in path
frontend/src/components/marketing/marketing-header.tsx    # update "Sign in"/"Sign up" hrefs
frontend/src/components/providers.tsx                     # wrap with ProfileProvider
```

### 5.6 Deleted / replaced frontend files

```
frontend/src/app/(auth)/login/page.tsx       # replaced by sign-in
frontend/src/app/(auth)/signup/page.tsx      # replaced by sign-up
frontend/src/app/page.tsx                    # moved into (marketing)/
```

---

## 6. Technical Risks

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|------------|
| R1 | In-process email retry is lost on crash → submission saved but never emailed | Medium | Medium | (a) Persist FIRST, (b) `email_status=pending` on row visible in inbox, (c) provide a small admin/cron job in a future batch to re-drive `pending` rows older than N minutes. Out of MVP code scope; documented assumption. |
| R2 | Body-size middleware bypassed for chunked transfers without `Content-Length` | Low | Medium | Middleware streams and aborts at 100 KB; covered by AT-014. |
| R3 | CORS misconfiguration leaks dashboard origin to `*` or blocks valid `/f/*` POSTs | Medium | High | Two distinct CORS configurations; explicit AT-018 verifies preflight from a foreign origin succeeds for `/f/*` and fails for `/api/v1/*`. |
| R4 | Honeypot trip is observable via response timing or content | Low | Low | Same response shape as real success; do not log latency-sensitive metrics. |
| R5 | Resend API outage blocks notifications | Medium | Medium | Submission still persists; `email_status=failed` after 3 retries; user sees the badge in the inbox. PRD §7 explicitly accepts this. |
| R6 | Firebase email-verified claim is stale (user verified in another tab) | Medium | Low | UI re-fetches `/api/v1/me` on focus and after the user clicks "I just verified". Documented in `verify-email` page spec. |
| R7 | CSV export of large forms exceeds 5s p95 | Low | Low | Stream from DB cursor (`stream_results=True` / `yield_per(500)`) and `StreamingResponse`; covered by AT-020. |
| R8 | Existing `users` table being repurposed conflicts with future "real" user concepts | Low | Low | Renaming is reversible; documented as decision §2.3. |
| R9 | `formId` is a UUID — long URL; users may complain | Low | Low | Acceptable for MVP. URL-safe base32 short id is a future enhancement. |
| R10 | `BackgroundTasks` runs after response in single-process; under multi-worker (uvicorn workers) this is fine, but a future async worker (Gunicorn + uvloop) may need verification | Low | Low | Document; tested by AT-019. |
| R11 | Shipped UI drifts from PRD §0.2 mockup (ad-hoc colors, wrong spacing, off-brand CTA treatment) | Medium | Medium | (a) Designer extracts tokens from §0.1 palette + §0.2 mockup into `design-system.md` as the single source for `globals.css` custom properties; (b) QA Layer 3 performs side-by-side comparison against `docs/prd/formsnap_prd_design.png` for every shipped page; (c) any post-ship visual fix is a follow-up "UI polish" task, not a breaking re-spec. |

---

## 7. Environment Variable Inventory

Each variable is owned by exactly one batch. Mark **(USER MUST PROVISION)** if the user does not yet have it.

### Per-concern groupings

#### Firebase (all batches that touch auth)

| Var | Owner batch | Source | Notes |
|-----|------------|--------|-------|
| `FIREBASE_PROJECT_ID` | Batch-1 | Firebase console | (USER MUST PROVISION) |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Batch-1 | Firebase console → service account | (USER MUST PROVISION) — JSON blob inline |
| `FIREBASE_CREDENTIALS_PATH` | Batch-1 | Local file path alternative to the above | Optional |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Batch-1 (frontend) | Firebase web config | (USER MUST PROVISION) |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Batch-1 (frontend) | same | (USER MUST PROVISION) |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Batch-1 (frontend) | same | (USER MUST PROVISION) |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Batch-1 (frontend) | same | (USER MUST PROVISION) |

#### Supabase Postgres (all batches that read/write data)

| Var | Owner batch | Source | Notes |
|-----|------------|--------|-------|
| `DATABASE_URL` | Batch-1 | Supabase project → connection string (use the *connection pooler* URL, async driver `postgresql+asyncpg://…`) | (USER MUST PROVISION) |

#### Email (Batch-3 only)

| Var | Owner batch | Source | Notes |
|-----|------------|--------|-------|
| `EMAIL_PROVIDER` | Batch-3 | Static — defaults to `resend`; `noop` for local dev | Not user-provided |
| `RESEND_API_KEY` | Batch-3 | Resend dashboard | (USER MUST PROVISION) |
| `EMAIL_FROM` | Batch-3 | e.g., `notifications@formsnap.example` — must be on a Resend-verified domain | (USER MUST PROVISION) |

#### Application config

| Var | Owner batch | Default | Notes |
|-----|------------|---------|-------|
| `BACKEND_CORS_ORIGINS` | Batch-1 | `http://localhost:3000` | Already exists; update to dashboard URL in prod |
| `DASHBOARD_BASE_URL` | Batch-3 | `http://localhost:3000` | Used to build the `/submitted` redirect target and the dashboard deep link in notification emails |
| `MAX_BODY_BYTES` | Batch-3 | `102400` (100 KB) | Submission size cap |
| `PUBLIC_SUBMIT_BASE_URL` | Batch-3 | `http://localhost:8000` | The host included in the copy-pastable HTML snippet shown in the dashboard |
| `NEXT_PUBLIC_API_URL` | Batch-1 (frontend) | `http://localhost:8000` | Already exists; document for prod |

---

## 8. Authentication Flow Summary

```
[Sign-up flow]
Browser → Firebase JS SDK signUpWithEmail
       → Firebase sends verification email
User clicks email link → Firebase marks email_verified=true
Browser → /verify-email page polls or user clicks "I verified" → reload → enters dashboard

[Authenticated API call]
Browser apiClient → fetch with Bearer <idToken>
FastAPI get_current_user → verify_firebase_token (Admin SDK) → claims dict
→ get_current_profile → DB upsert → User row
→ (if endpoint requires) require_verified_profile → 403 if not verified

[Public submission]
Browser POST /f/{formId} → no auth → service path → persist + redirect/ack
```

---

## 9. Operational / Deployment Notes

- **Single environment for MVP**: production. `BACKEND_CORS_ORIGINS` and `PUBLIC_SUBMIT_BASE_URL` differ by env via `.env`.
- **Backups**: rely on Supabase default backups. Documented assumption per PRD §8.
- **Observability**: log structured events for (a) accepted submission, (b) honeypot trip, (c) email send result, (d) 4xx/5xx on `/f/*`. Tooling (Sentry / Logtail / similar) is left to Engineer's discretion at deploy time; no config required at code time.
- **The path `/f/{formId}` is a public contract** (PRD §8) — it MUST NOT change after launch.

---

## 10. Open Assumptions (Flag for User Confirmation Before Phase 2)

1. **Reusing `users` table as `profile`** (decision §2.3). User accepts that the table name on disk stays `users` while we refer to the entity as "profile" in product / docs.
2. **Resend** as the default email provider (PRD §7 explicitly suggests it; no alternative was preferred). User must have a Resend account by Batch-3.
3. **Soft-delete forms, hard-cascade submissions** (decision §4.4). PRD left this to Architect; we picked the simplest semantics that satisfy "submissions of deleted forms must not be readable".
4. **`/sign-in` and `/sign-up` rename** of existing `/login` and `/signup` (decision §2.11). Engineer renames; the UI guard updates to point to `/sign-in`.
5. **In-process email send via `BackgroundTasks`** (decision §2.6). No external queue. User accepts the failure mode in R1.
6. **Move `app/page.tsx` into `(marketing)/`** to honor `STANDARDS.md` route group convention.
7. **PRD §0 visual assets are treated as a layered source-of-truth, not a scope expansion.** The currently-shipped product covers the "static-site forms backend" surfaces (Batches 1–4). Mockup rows outside that scope (pricing, KPI dashboard, analytics, billing, team, integrations) stay in the reference for Designer vocabulary consistency but do NOT imply new features, endpoints, data models, or batches in this spec set.
