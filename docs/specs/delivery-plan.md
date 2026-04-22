# Delivery Plan: FormSnap

> Four feature batches, executed in order. Every AT-XXX from `acceptance-tests.md` appears in **exactly one** batch (no orphans, no duplicates).

> **Reconciliation note (2026-04-22)**: Batches 1–4 shipped. AT IDs and batch boundaries are **frozen** per user instruction. PRD §0 "Visual Assets" (added 2026-04-22) now provides a formal visual source of truth (`docs/prd/form-snap.svg` + `docs/prd/formsnap_prd_design.png`), which upgrades this plan's footer from "No UI Polish Phase" to a **UI Polish Phase** scoped to the five user-visible surfaces the product actually ships (see §UI Polish Phase below). The UI Polish Phase contains **no AT-XXX** — its acceptance criterion is visual parity with the PRD §0 mockup, per Architect rule §17. The 25 feature-level ATs are unchanged.

---

## Total AT count: 25

| Batch | AT count | AT IDs |
|-------|----------|--------|
| Batch-1: Auth + Profile bootstrap | 5 | AT-001, AT-021, AT-022, AT-023, AT-024 |
| Batch-2: Form CRUD | 6 | AT-002, AT-003, AT-004, AT-005, AT-006, AT-006a |
| Batch-3: Public submission endpoint + email | 10 | AT-007, AT-008, AT-009, AT-010, AT-011, AT-012, AT-013, AT-014, AT-019, AT-020 |
| Batch-4: Submission inbox + CSV export | 4 | AT-015, AT-016, AT-017, AT-018 |

**Total: 25**. Every AT appears in exactly one batch.

---

## Batch-1: Auth + Profile bootstrap

**Goal**: Users can sign up, sign in, verify their email, and the backend lazily provisions their `profile` row. Authenticated routes are guarded.

### Scope

**Backend**:
- Add `email_verified` column to `users` table (Alembic `0002`).
- Update `app.models.user.User` and `app.services.user.get_or_create_user` to write/sync `email_verified`.
- Move `/api/v1/users/me` → `/api/v1/me` (new `app.api.v1.me` router; remove `users.py`).
- Add `app.dependencies.get_current_profile` and `require_verified_profile` (the latter shipped here, exercised in Batch-2).
- Update `app.schemas.user.UserMeResponse` to require `id`, `email_verified`, `created_at`.

**Frontend**:
- Rename existing `(auth)/login` → `(auth)/sign-in`, `(auth)/signup` → `(auth)/sign-up`.
- Add `(auth)/verify-email/page.tsx`.
- Wire `marketing-header.tsx` and `auth-guard.tsx` to the new paths.
- Add `frontend/src/lib/api/me.ts` and `frontend/src/contexts/profile-context.tsx`.
- Add `email-verification-gate.tsx` (used by Batch-2's "Create form" CTA, but the component itself ships in Batch-1).
- Move `app/page.tsx` into `app/(marketing)/page.tsx` (route group restructure).

### AT-XXX covered (5)

- **AT-001** — Sign-up creates account + verification email
- **AT-021** — `GET /api/v1/me` lazily provisions profile
- **AT-022** — Unverified user cannot create form (UI gate + 403)
- **AT-023** — After verification, form creation enabled
- **AT-024** — All `/api/v1/*` reject requests without Bearer token

### Endpoints implemented

- `GET /api/v1/me`
- (`POST /api/v1/forms` server-side gate stub for AT-022 / AT-023 — the endpoint itself is functionally implemented in Batch-2 but the 403 unverified-gate path lands here. Engineer may ship the gate as part of the placeholder route in Batch-1 and complete the create logic in Batch-2.)

### Required env vars

- `DATABASE_URL` — **(USER MUST PROVISION)** Supabase connection string with async driver.
- `FIREBASE_PROJECT_ID` — **(USER MUST PROVISION)**.
- `FIREBASE_SERVICE_ACCOUNT_JSON` (or `FIREBASE_CREDENTIALS_PATH`) — **(USER MUST PROVISION)**.
- `NEXT_PUBLIC_FIREBASE_API_KEY` — **(USER MUST PROVISION)**.
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` — **(USER MUST PROVISION)**.
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` — **(USER MUST PROVISION)**.
- `NEXT_PUBLIC_FIREBASE_APP_ID` — **(USER MUST PROVISION)**.
- `NEXT_PUBLIC_API_URL` — defaults to `http://localhost:8000` (already exists).
- `BACKEND_CORS_ORIGINS` — defaults to `http://localhost:3000` (already exists).

### Dependencies

None. This is the foundational batch; everything else depends on it.

### Done when

- Alembic up to revision `0002`.
- A signed-up user lands on `/verify-email`.
- After verifying, `GET /api/v1/me` returns `email_verified: true`.
- All 5 AT-XXX above pass QA Layers 1+2.

---

## Batch-2: Form CRUD

**Goal**: Verified users can create, list, rename, edit `redirect_url`, and delete forms via the dashboard. Ownership is enforced server-side.

### Scope

**Backend**:
- Alembic `0003` — create `forms` table.
- `app.models.form.Form` model.
- `app.schemas.form` — `FormCreate`, `FormUpdate`, `FormResponse`, `FormListItem`.
- `app.services.form` — `create_form`, `list_forms`, `get_form_for_owner`, `update_form`, `delete_form`. Tenant isolation enforced inside every function.
- `app.api.v1.forms` router — five routes (list, create, patch, delete; submissions endpoints are in Batch-4).
- `_form_to_response` helper that injects `submit_url` (built from `PUBLIC_SUBMIT_BASE_URL`) and `html_snippet` (rendered from a small template).

**Frontend**:
- `frontend/src/lib/api/forms.ts` typed client.
- `(dashboard)/dashboard/page.tsx` — replace placeholder with FormList.
- `dashboard/form-list.tsx`, `form-list-empty-state.tsx`, `form-row.tsx`.
- `dashboard/create-form-dialog.tsx` (modal preferred; the `forms/new/page.tsx` route is a redirect to `/dashboard?create=1` if used).
- `dashboard/delete-form-dialog.tsx`.
- `dashboard/form-snippet.tsx`, `dashboard/copy-button.tsx`.
- `dashboard/form-settings-form.tsx` (used in Batch-4 inside the form detail page; the component lands here).
- `(dashboard)/dashboard/forms/[formId]/page.tsx` shell (Inbox tab is a "coming next batch" placeholder; Settings tab is functional).

### AT-XXX covered (6)

- **AT-002** — Create form via dashboard UI
- **AT-003** — `POST /api/v1/forms` API
- **AT-004** — `GET /api/v1/forms` owner-scoped list
- **AT-005** — Delete form UI + cascade
- **AT-006** — `DELETE /api/v1/forms/{id}` API + cascade
- **AT-006a** — `PATCH /api/v1/forms/{id}` rename + redirect_url

### Endpoints implemented

- `GET /api/v1/forms`
- `POST /api/v1/forms`
- `PATCH /api/v1/forms/{formId}`
- `DELETE /api/v1/forms/{formId}`

### Required env vars

- `PUBLIC_SUBMIT_BASE_URL` — defaults to `http://localhost:8000`. Used to build `submit_url` and the HTML snippet shown in the dashboard. Document for prod.
- All Batch-1 vars remain required.

### Dependencies

- **Batch-1** must be done (auth, `users` table, `get_current_profile`).

### Done when

- Alembic up to revision `0003`.
- A verified user can create, list, rename, and delete forms via the dashboard.
- Cross-tenant access returns 404.
- All 6 AT-XXX above pass QA Layers 1+2.

---

## Batch-3: Public submission endpoint + email

**Goal**: Static-site forms can POST to `/f/{formId}`. Submissions persist, owners get email, redirects work, body limit + honeypot enforced.

### Scope

**Backend**:
- Alembic `0004` — create `submissions` table.
- `app.models.submission.Submission` model.
- `app.schemas.submission` — `SubmissionResponse`, `PublicSubmissionAck`. (`SubmissionPage` ships in Batch-4.)
- `app.services.submission.persist_submission`, `mark_email_status`.
- `app.services.form.get_form_for_public_submit` (no owner check).
- `app.services.email/` — `base.EmailProvider` Protocol, `resend_provider.ResendProvider`, `noop_provider.NoopProvider`, `templates.render_notification`, `sender.send_notification_with_retry`, factory in `__init__.py`.
- `app.middleware.body_size_limit.BodySizeLimitMiddleware` — enforces 100 KB on `/f/*`.
- `app.api.public.router` — `POST /f/{formId}` with content-negotiation, redirect precedence, honeypot, BackgroundTasks for email.
- `app.main` — register public router (NOT under `/api/v1`); register two CORS posters (wide-open `/f/*`, restricted `/api/v1/*`); register body-size middleware.

**Frontend**:
- `(marketing)/submitted/page.tsx` — default success page (SSR; minimal copy).

### AT-XXX covered (10)

- **AT-007** — Honeypot trip silently dropped
- **AT-008** — HTML form 303 redirect to default
- **AT-009** — JSON 200 ack
- **AT-010** — Default redirect target
- **AT-011** — Per-form `redirect_url` honored
- **AT-012** — `_redirect` precedence over form `redirect_url`
- **AT-013** — Invalid `formId` returns 404 (both modes), nothing stored, no email
- **AT-014** — Body > 100 KB returns 413
- **AT-019** — Email sent on successful submission within 60 s
- **AT-020** — Email failure → `email_status=failed` after 3 retries; submission still persisted

### Endpoints implemented

- `POST /f/{formId}`

### Required env vars

- `EMAIL_PROVIDER` — defaults to `resend`; `noop` for dev/test (not user-provided).
- `RESEND_API_KEY` — **(USER MUST PROVISION)** from Resend dashboard.
- `EMAIL_FROM` — **(USER MUST PROVISION)** verified-domain sender address (e.g., `notifications@formsnap.example`).
- `DASHBOARD_BASE_URL` — defaults to `http://localhost:3000`. Used for default `/submitted` redirect target and dashboard deep links in notification emails.
- `MAX_BODY_BYTES` — defaults to `102400`.
- `PUBLIC_SUBMIT_BASE_URL` — already required by Batch-2.
- All Batch-1 / Batch-2 vars remain required.

### Dependencies

- **Batch-1** (DB + auth scaffolding for tests).
- **Batch-2** (forms table; can't submit to a form that doesn't exist).

### Done when

- Alembic up to revision `0004`.
- A `curl -d 'name=Ada' http://localhost:8000/f/<formId>` returns `303` to `/submitted`.
- A `curl -X POST -H 'Content-Type: application/json' -d '{"name":"Ada"}' …/f/<id>` returns `200 {"ok":true,"id":"…"}`.
- The form owner's mailbox (Resend test mode) receives an email within 60 s.
- A 101 KB body returns `413`.
- A `_gotcha` body looks like a success but persists nothing.
- All 10 AT-XXX above pass QA Layers 1+2.

---

## Batch-4: Submission inbox + CSV export

**Goal**: Owners can browse submissions in a paginated table, expand rows, and download all submissions as CSV.

### Scope

**Backend**:
- `app.schemas.submission.SubmissionPage`.
- `app.services.submission.list_submissions`, `stream_submissions_csv`.
- `app.api.v1.submissions` router — `GET /api/v1/forms/{id}/submissions` and `GET /api/v1/forms/{id}/submissions.csv`.
- Filename sanitization helper.

**Frontend**:
- `frontend/src/lib/api/submissions.ts` typed client + CSV download helper (fetch via `apiClient` → blob → download anchor).
- `(dashboard)/dashboard/forms/[formId]/page.tsx` — Inbox tab functional.
- `dashboard/submission-table.tsx`, `submission-row.tsx`, `submission-detail.tsx`.
- `dashboard/email-status-badge.tsx` (used by AT-020 visualization).
- `dashboard/csv-export-button.tsx`.

### AT-XXX covered (4)

- **AT-015** — Inbox UI: paginated newest-first, expandable rows
- **AT-016** — `GET /api/v1/forms/{id}/submissions` API: pagination + ownership
- **AT-017** — Export CSV button triggers download
- **AT-018** — CSV column union + empty cells

### Endpoints implemented

- `GET /api/v1/forms/{formId}/submissions`
- `GET /api/v1/forms/{formId}/submissions.csv`

### Required env vars

- All Batch-1/2/3 vars remain required. No new vars.

### Dependencies

- **Batch-2** (form ownership lookup, form detail page shell).
- **Batch-3** (submission persistence — without it there's nothing to list / export; AT-020 surfaces the failed badge that Batch-3 produces).

### Done when

- The form detail page renders a paginated inbox.
- "Export CSV" downloads a CSV with the union-of-keys schema.
- All 4 AT-XXX above pass QA Layers 1+2.

---

## Cross-batch verification (after all 4 batches)

After all four batches pass per-batch QA, the QA agent runs a Full Verification pass per `WORKFLOW.md` Phase 4:
- Every AT-XXX from this plan passes Layers 1 + 2 + 3.
- Golden path: sign up → verify email → create form → paste snippet into a test page → submit → see submission in inbox → export CSV → end-to-end with no regressions.

---

## Suggested execution order

The order above (Batch-1 → 2 → 3 → 4) is the only viable order: Batch-2 needs auth (Batch-1), Batch-3 needs forms (Batch-2), Batch-4 needs submissions (Batch-3).

User MAY reorder during the review gate but this plan does not anticipate any reasonable alternative order.

---

## Env var summary table (all batches)

| Var | First needed by | Provisioned by user? | Where it lives |
|-----|-----------------|----------------------|----------------|
| `DATABASE_URL` | Batch-1 | YES (Supabase) | backend `.env` |
| `FIREBASE_PROJECT_ID` | Batch-1 | YES | backend `.env` |
| `FIREBASE_SERVICE_ACCOUNT_JSON` (or `FIREBASE_CREDENTIALS_PATH`) | Batch-1 | YES | backend `.env` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Batch-1 | YES | frontend `.env.local` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Batch-1 | YES | frontend `.env.local` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Batch-1 | YES | frontend `.env.local` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Batch-1 | YES | frontend `.env.local` |
| `NEXT_PUBLIC_API_URL` | Batch-1 | NO (default `http://localhost:8000`) | frontend `.env.local` |
| `BACKEND_CORS_ORIGINS` | Batch-1 | NO (default `http://localhost:3000`) | backend `.env` |
| `PUBLIC_SUBMIT_BASE_URL` | Batch-2 | NO (default `http://localhost:8000`) | backend `.env` |
| `EMAIL_PROVIDER` | Batch-3 | NO (default `resend`; `noop` in dev/test) | backend `.env` |
| `RESEND_API_KEY` | Batch-3 | YES (Resend) | backend `.env` |
| `EMAIL_FROM` | Batch-3 | YES (verified domain) | backend `.env` |
| `DASHBOARD_BASE_URL` | Batch-3 | NO (default `http://localhost:3000`) | backend `.env` |
| `MAX_BODY_BYTES` | Batch-3 | NO (default `102400`) | backend `.env` |

**Things the user must obtain before runtime verification can start**:
1. A Firebase project with email/password auth enabled and a service account JSON.
2. A Supabase project with its async-driver connection string.
3. A Resend account with a verified sending domain and an API key.

Items (1) and (2) block Batch-1 runtime verification. Item (3) blocks Batch-3 runtime verification (Batch-3 unit tests can use the `noop` provider).

---

## UI Polish Phase (requires PRD §0 visual references)

Execute **after** all four feature batches pass QA Layers 1+2. The user decides whether to run this phase or skip directly to Full QA Verification.

UI Polish batches have **no AT-XXX acceptance tests** — the visual reference (`docs/prd/form-snap.svg` brand + `docs/prd/formsnap_prd_design.png` layout mockup) **is** the acceptance criterion, per Architect rule §17. Each batch below carries a specific mockup region to match.

### UI-Polish-0: Shared Layout & Brand Tokens
- **Scope**: Tailwind v4 tokens in `frontend/src/app/globals.css`; shared `Sidebar`, `Header`, `Footer`, and navigation bar; favicon + marketing logo swap to `docs/prd/form-snap.svg`.
- **Token derivation** (Designer → Engineer):
  - Brand palette from PRD §0.1: `#29B6F6`, `#4361EE`, `#8A2BE2`, sparkle gradient `#2DA9FF→#B62CFF`.
  - Neutral surfaces from PRD §0.1: `#F6F7FF`, `#CDD4F9`, `#DCE6FF`, `#EDEBFF`.
  - Success / warn / danger / muted / border colors sampled by Designer from `docs/prd/formsnap_prd_design.png` and documented in `design-system.md`.
  - Sidebar width, header height, card border-radius, table density, primary typography scale — sampled from the mockup.
- **Pages affected**: all authenticated pages + marketing shell.
- **Dependencies**: all feature batches (1–4) complete.
- **Visual references**: `docs/prd/form-snap.svg`, `docs/prd/formsnap_prd_design.png` (rows 1, 4, 5, 6, 7, 9 for chrome conventions).
- **Done when**: every `globals.css` custom property representing brand / neutral / semantic color is derived from the Designer's tokens (no ad-hoc hex values in components), and the sidebar + header render identically to the mockup at the shipped widths.

### UI-Polish-1: Marketing landing (`/`) + `/submitted`
- **Scope**: `frontend/src/app/(marketing)/page.tsx` and `frontend/src/app/(marketing)/submitted/page.tsx`.
- **Visual reference**: `docs/prd/formsnap_prd_design.png` — row 1 (Marketing homepage hero + "Trusted by" logo strip).
- **Dependencies**: UI-Polish-0.
- **Done when**: Hero headline / sub / primary CTA gradient / trust-strip layout match row 1 side-by-side.

### UI-Polish-2: Auth pages (`/sign-in`, `/sign-up`, `/verify-email`)
- **Scope**: Three `(auth)/` pages.
- **Visual reference**: `docs/prd/formsnap_prd_design.png` — row 2 (three-panel auth composition).
- **Dependencies**: UI-Polish-0.
- **Done when**: panel framing, input group styling, primary CTA treatment, and secondary link typography match row 2.

### UI-Polish-3: Dashboard — Forms list (`/dashboard`)
- **Scope**: `(dashboard)/dashboard/page.tsx`, `form-list.tsx`, `form-row.tsx`, `form-list-empty-state.tsx`, `create-form-dialog.tsx`, `delete-form-dialog.tsx`.
- **Visual reference**: `docs/prd/formsnap_prd_design.png` — row 5 (Forms list table + status toggle + per-row actions).
- **Dependencies**: UI-Polish-0.
- **Done when**: table density, column typography, status badge palette, row-action menu, and the "Create form" gradient CTA match row 5.

### UI-Polish-4: Form detail — Inbox tab (`/dashboard/forms/[formId]`)
- **Scope**: Inbox tab: `submission-table.tsx`, `submission-row.tsx`, `submission-detail.tsx`, `email-status-badge.tsx`, `csv-export-button.tsx`.
- **Visual reference**: `docs/prd/formsnap_prd_design.png` — row 7 (Submissions list: search + date filter + paginated table).
- **Dependencies**: UI-Polish-0, UI-Polish-3 (row actions share patterns).
- **Done when**: toolbar, filters, pagination, row-expand animation, and the email-status badge colors match row 7 tokens.

### UI-Polish-5: Form detail — Settings tab (`/dashboard/forms/[formId]`)
- **Scope**: Settings tab: `form-settings-form.tsx`, `form-snippet.tsx`, `copy-button.tsx`.
- **Visual reference**: `docs/prd/formsnap_prd_design.png` — row 9 (Settings — General tab conventions).
- **Dependencies**: UI-Polish-0.
- **Done when**: label / input pairings, section spacing, "Save" primary button, and snippet card framing match row 9.

### UI Polish execution order

```
UI-Polish-0 (tokens + chrome)          ← MUST run first
  → UI-Polish-1 (marketing)
  → UI-Polish-2 (auth)
  → UI-Polish-3 (forms list)
  → UI-Polish-4 (inbox)
  → UI-Polish-5 (settings)
```

UI-Polish-0 is mandatory; subsequent polish batches can be run in user-preferred order because none depend on each other beyond the shared tokens.

### QA posture for the UI Polish Phase

- QA Layer 1 (API) and Layer 2 (UI functionality) — **already green** from feature batches; no re-run required unless a polish batch edits logic.
- QA Layer 3 (UI Design) — **this is the phase's primary gate**. QA performs side-by-side screenshot comparison of each shipped page against its mockup region and records a per-batch visual-parity report in `docs/qa/ui-polish-<N>-report.md`.
- No regressions to feature-level AT-XXX are permitted. If a polish edit breaks a functional AT, the Engineer rolls back and re-approaches via CSS-only changes.
