# Acceptance Tests: FormSnap

> Two-layer format per AT: business scenario (Given/When/Then) + automation hints (API path / UI selector / assertion / preconditions).
> Coverage: every PRD §3 user story has ≥ 1 AT; every endpoint in `api-spec.md` has ≥ 1 API-level AT; all PRD edge cases (invalid formId, body > 100 KB, honeypot, email failure, unverified gating, CSV column union, deletion cascade) are covered.
> UI selectors use `data-testid` attributes the Engineer will add; if no Designer reference is available at code time, selectors marked `[TBD-by-designer]` may be substituted with semantic queries by QA.
> Sequential IDs `AT-001` … `AT-024`. IDs are permanent.

## User-story → AT mapping (forward index)

| PRD User Story (paraphrased) | AT IDs |
|------------------------------|--------|
| US-1: Create a form | AT-002 (UI), AT-003 (API), AT-022 (gated by unverified email) |
| US-2: Delete a form | AT-005 (UI cascade + 404 on public ingest), AT-006 (API) |
| US-3: Browse submission inbox | AT-015 (UI), AT-016 (API pagination) |
| US-4: Export CSV | AT-017 (UI download), AT-018 (CSV column union + empty cells) |
| US-5: Receive email per submission | AT-019 (email sent), AT-020 (failure → badge + retry) |
| US-6: Default vs `redirect_url` vs `_redirect` | AT-010 (default), AT-011 (form redirect), AT-012 (`_redirect` precedence) |
| US-7: HTML form vs JSON `fetch` | AT-008 (HTML 303), AT-009 (JSON 200), AT-013 (invalid formId 404) |
| US-8: Sign up + email verification gate | AT-001 (sign-up), AT-022 (gate disables CTA), AT-023 (verification re-enables) |
| US-9 implicit (auth on `/api/v1/*`): | AT-024 (401 without token) |

## Endpoint → AT mapping (forward index)

| Endpoint | API-level AT IDs |
|----------|------------------|
| `POST /f/{formId}` | AT-008, AT-009, AT-013, AT-014, AT-007 (honeypot), AT-010/011/012 (redirect), AT-019/020 (email) |
| `GET /api/v1/me` | AT-021 |
| `GET /api/v1/forms` | AT-004 |
| `POST /api/v1/forms` | AT-003, AT-022 (403 if unverified) |
| `PATCH /api/v1/forms/{id}` | AT-024 also asserts auth; functional: AT-006a |
| `DELETE /api/v1/forms/{id}` | AT-006 |
| `GET /api/v1/forms/{id}/submissions` | AT-016 |
| `GET /api/v1/forms/{id}/submissions.csv` | AT-018 |

---

## AT-001: Sign-up creates account and sends verification email
**User Story**: US-8
**Batch**: Batch-1
**Priority**: P0

**Scenario (Business Level)**:
Given I am an anonymous visitor on the marketing site
When I open `/sign-up`, enter a fresh email and a valid password, and submit
Then a Firebase user is created
And Firebase sends a verification email to that address
And I am redirected to `/verify-email` with a "check your inbox" reminder

**Automation Hints**:
- UI flow: navigate `/sign-up` → fill `[data-testid="signup-email"]`, `[data-testid="signup-password"]` → click `[data-testid="signup-submit"]`
- API: `GET /api/v1/me` immediately after sign-up returns `200` with `email_verified: false`
- UI Assertion: page URL becomes `/verify-email`; `[data-testid="verify-email-card"]` shows the email address
- Preconditions: Firebase Auth project configured; test creates a unique email each run (e.g., `qa-{uuid}@example.com`)
- Screenshot: `evidence/AT-001-signup-then-verify-reminder.png`

**Notes**: QA can self-register via Firebase Auth REST API (`signUp` endpoint) without UI when running pure API tests.

---

## AT-002: Authenticated, verified user can create a form via the dashboard
**User Story**: US-1
**Batch**: Batch-2
**Priority**: P0

**Scenario (Business Level)**:
Given I am signed in with a verified email and have zero forms
When I open `/dashboard`, click "Create form", enter the name "Personal site contact", and submit
Then the dashboard shows my new form at the top of the list
And the new form's row exposes the public submit URL `https://<host>/f/<formId>`
And the row exposes a one-click "Copy HTML snippet" control

**Automation Hints**:
- API observed: `POST /api/v1/forms` → `201`; `GET /api/v1/forms` → array of length 1
- UI Selector: `[data-testid="create-form-button"]`, `[data-testid="form-name-input"]`, `[data-testid="create-form-submit"]`, `[data-testid="form-row"]`, `[data-testid="copy-snippet-button"]`
- UI Assertion: form-row text contains "Personal site contact"; submit URL string starts with the configured `PUBLIC_SUBMIT_BASE_URL` and ends with the form's UUID
- Preconditions: signed-in & verified user (use AT-001 result + force `email_verified=true` via Firebase Admin SDK in test setup)
- Screenshot: `evidence/AT-002-form-created.png`

---

## AT-003: POST /api/v1/forms returns full form payload with snippet (API)
**User Story**: US-1
**Batch**: Batch-2
**Priority**: P0

**Scenario (Business Level)**:
Given I have a verified Firebase ID token
When I send `POST /api/v1/forms` with body `{"name": "Beta signup"}` and the Bearer token
Then I receive `201 Created`
And the response body includes `id`, `submit_url`, `html_snippet`, `created_at`, and `name = "Beta signup"`
And `submit_url` matches `^https?://.+/f/[0-9a-f-]{36}$`

**Automation Hints**:
- API: `POST /api/v1/forms` body `{"name":"Beta signup"}` headers `Authorization: Bearer <token>` → `201`; response keys: `id`, `name`, `submit_url`, `html_snippet`, `redirect_url`, `created_at`, `updated_at`
- Assertion: `html_snippet` contains the literal string `<form action="` and the same `submit_url`; `html_snippet` contains `_gotcha`
- Preconditions: verified user; DB available
- No UI

---

## AT-004: GET /api/v1/forms returns owner-scoped list with stats
**User Story**: US-1, US-3
**Batch**: Batch-2
**Priority**: P0

**Scenario (Business Level)**:
Given I own three forms and another user owns five forms
When I call `GET /api/v1/forms`
Then I receive exactly three items
And each item carries `submission_count`, `last_submission_at`, and `submit_url`
And no item belongs to the other user

**Automation Hints**:
- API: `GET /api/v1/forms` → `200`, JSON array length `3`; each item has the listed fields
- Assertion: every `id` corresponds to a form owned by my profile id; cross-tenant ids absent
- Preconditions: two users seeded; my user owns 3 forms with 0 / 1 / 5 submissions

---

## AT-005: Deleting a form removes it from the dashboard and 404s the public endpoint
**User Story**: US-2
**Batch**: Batch-2
**Priority**: P0

**Scenario (Business Level)**:
Given I have a form with two submissions
When I open the form, click "Delete", and confirm
Then the form is removed from my form list
And `POST /f/<the deleted formId>` returns `404`
And the form's submissions are no longer visible on the dashboard

**Automation Hints**:
- UI: `[data-testid="form-row"]` → `[data-testid="row-menu"]` → `[data-testid="delete-form-button"]` → confirm dialog `[data-testid="confirm-delete"]`
- API observed: `DELETE /api/v1/forms/{id}` → `204`; subsequent `POST /f/{id}` (public, no auth) → `404` body `{"ok": false, "error": "form_not_found"}`
- UI Assertion: form-row gone; navigating to `/dashboard/forms/{id}` shows a `[data-testid="form-not-found"]` empty state
- Preconditions: form with 2 seeded submissions
- Screenshot: `evidence/AT-005-delete-confirm-dialog.png`, `evidence/AT-005-list-after-delete.png`

---

## AT-006: DELETE /api/v1/forms/{id} cascades and returns 204 (API)
**User Story**: US-2
**Batch**: Batch-2
**Priority**: P0

**Scenario (Business Level)**:
Given I own a form `F` with three submissions
When I send `DELETE /api/v1/forms/F`
Then I receive `204 No Content`
And `GET /api/v1/forms/F/submissions` returns `404`
And the database row count for `submissions WHERE form_id = F` is `0`

**Automation Hints**:
- API: `DELETE /api/v1/forms/{id}` → `204`; `GET /api/v1/forms/{id}/submissions` → `404 form_not_found`
- DB assertion (test): `await db.scalar(select(func.count()).where(Submission.form_id == form_id))` == `0`
- Cross-owner: a different user calling `DELETE /api/v1/forms/{id}` returns `404` (not `403`)
- Preconditions: form `F` with 3 submissions; a separate "other-user" token

---

## AT-006a: PATCH /api/v1/forms/{id} updates name and redirect_url
**User Story**: US-1 (form management — implied)
**Batch**: Batch-2
**Priority**: P1

**Scenario (Business Level)**:
Given I own a form with name "Old" and no `redirect_url`
When I send `PATCH /api/v1/forms/{id}` with `{"name": "New", "redirect_url": "https://example.com/done"}`
Then the response shows the updated values
And subsequent `GET /api/v1/forms` reflects them
And cross-owner PATCH returns `404`

**Automation Hints**:
- API: `PATCH /api/v1/forms/{id}` → `200`; response.name == "New"; response.redirect_url == "https://example.com/done"
- API negative: empty body → `422`; non-http URL → `422`; cross-owner token → `404`
- Preconditions: form owned by user A; a user B token

---

## AT-007: Honeypot trip is silently dropped (success-shaped response)
**User Story**: US-7 (edge case from PRD §3 + §4)
**Batch**: Batch-3
**Priority**: P0

**Scenario (Business Level)**:
Given I have a form `F`
When a request to `POST /f/F` arrives with body `{"name": "Bot", "_gotcha": "trapped"}`
Then the response is shaped like a successful submission
And no row is inserted into `submissions`
And no notification email is sent

**Automation Hints**:
- API JSON mode: `POST /f/{id}` `Content-Type: application/json` body `{"name":"Bot","_gotcha":"x"}` → `200 {"ok": true, "id": <uuid>}` (id may be `00000000-…`)
- API HTML mode: `Content-Type: application/x-www-form-urlencoded` body `name=Bot&_gotcha=x` → `303` with `Location` per redirect rules
- DB assertion: `select count(*) from submissions where form_id=?` unchanged before vs. after
- Email mock assertion: `send_notification_with_retry.call_count == 0`
- Preconditions: form `F`; mocked email provider

---

## AT-008: HTML form submission yields 303 redirect to default success page
**User Story**: US-7
**Batch**: Batch-3
**Priority**: P0

**Scenario (Business Level)**:
Given I have a form `F` with no `redirect_url`
When a browser POSTs `application/x-www-form-urlencoded` data to `/f/F`
Then I receive `303 See Other` with `Location: <DASHBOARD_BASE_URL>/submitted`
And the submission is persisted

**Automation Hints**:
- API: `POST /f/{id}` headers `Content-Type: application/x-www-form-urlencoded`, `Accept: text/html`, body `name=Ada&email=ada%40example.com` → `303`; `Location` header == `<DASHBOARD_BASE_URL>/submitted`
- DB assertion: `select count(*) from submissions where form_id=?` increased by 1
- UI follow-up (optional): browser nav to `/submitted` shows `[data-testid="default-success"]`
- Preconditions: form `F` with `redirect_url` null

---

## AT-009: JSON submission yields 200 ack with submission id
**User Story**: US-7
**Batch**: Batch-3
**Priority**: P0

**Scenario (Business Level)**:
Given I have a form `F`
When I `fetch` POST to `/f/F` with `Content-Type: application/json` and body `{"email": "x@y.z"}`
Then I receive `200 OK`
And the JSON body is `{"ok": true, "id": "<uuid>"}` where the id matches the persisted row

**Automation Hints**:
- API: `POST /f/{id}` `Content-Type: application/json` body `{"email":"x@y.z"}` → `200`
- Assertion: response.json()["id"] is a valid UUID; `select id from submissions where form_id=? order by created_at desc limit 1` matches
- Preconditions: form `F`

---

## AT-010: Default success page is the redirect when nothing else is set
**User Story**: US-6
**Batch**: Batch-3
**Priority**: P0

**Scenario (Business Level)**:
Given form `F` has no `redirect_url`
When I submit `application/x-www-form-urlencoded` to `/f/F` without `_redirect`
Then `Location` header equals `<DASHBOARD_BASE_URL>/submitted`

**Automation Hints**:
- API: same as AT-008
- Assertion: `Location` header EQUALS configured default

---

## AT-011: Per-form `redirect_url` is honored
**User Story**: US-6
**Batch**: Batch-3
**Priority**: P0

**Scenario (Business Level)**:
Given form `F` has `redirect_url = "https://example.com/thanks"`
When I submit urlencoded to `/f/F` without `_redirect`
Then `Location` header equals `https://example.com/thanks`

**Automation Hints**:
- API: `POST /f/{id}` urlencoded → `303`; `Location` == `https://example.com/thanks`
- Preconditions: form `F` with `redirect_url` set via PATCH

---

## AT-012: `_redirect` body field overrides form `redirect_url`
**User Story**: US-6
**Batch**: Batch-3
**Priority**: P0

**Scenario (Business Level)**:
Given form `F` has `redirect_url = "https://example.com/thanks"`
When I submit urlencoded to `/f/F` with body `name=Ada&_redirect=https://override.example.com`
Then `Location` header equals `https://override.example.com`
And `submission.data` does NOT contain the `_redirect` key

**Automation Hints**:
- API: `POST /f/{id}` body `name=Ada&_redirect=https://override.example.com` → `303`; `Location` == `https://override.example.com`
- DB assertion: latest `submissions.data` for `form_id=?` does not contain `_redirect`
- Negative: `_redirect=javascript:alert(1)` → falls back to `form.redirect_url` (then default)

---

## AT-013: Invalid `formId` returns 404 in both modes; nothing stored, no email
**User Story**: US-7 (edge case)
**Batch**: Batch-3
**Priority**: P0

**Scenario (Business Level)**:
Given the URL `/f/<bogus-uuid>` does not resolve to any form
When I POST any body to it (urlencoded or JSON)
Then I receive `404`
And no row is inserted into `submissions`
And no email is sent

**Automation Hints**:
- API JSON: `POST /f/00000000-0000-0000-0000-000000000000` `Content-Type: application/json` body `{"a":"b"}` → `404 {"ok": false, "error": "form_not_found"}`
- API HTML: same id, urlencoded → `404` (NOT a redirect; PRD specifies 404 in both modes)
- DB assertion: row count unchanged
- Email mock assertion: never called
- Preconditions: nonexistent UUID

---

## AT-014: Body > 100 KB returns 413 and stores nothing
**User Story**: edge case (PRD §3)
**Batch**: Batch-3
**Priority**: P0

**Scenario (Business Level)**:
Given I am posting to a valid form
When the request body is 101 KB
Then I receive `413 Payload Too Large`
And no row is inserted
And no email is sent

**Automation Hints**:
- API: `POST /f/{id}` `Content-Type: application/json` body `{"big": "<101 KB string>"}` → `413 {"ok": false, "error": "payload_too_large"}`
- Variant: chunked body (no `Content-Length`) at 101 KB → `413`
- DB assertion: count unchanged

---

## AT-015: Owner can browse submission inbox newest-first with row expansion
**User Story**: US-3
**Batch**: Batch-4
**Priority**: P0

**Scenario (Business Level)**:
Given a form `F` has 30 submissions across two pages
When I open `/dashboard/forms/F`
Then the inbox shows 25 rows on page 1, newest first
And clicking page "2" shows the remaining 5
And clicking a row expands to show the full JSON payload

**Automation Hints**:
- UI Selectors: `[data-testid="submission-row"]` (count == 25 on p1), `[data-testid="pagination-next"]`, `[data-testid="submission-detail-{id}"]` after click
- API observed: `GET /api/v1/forms/{id}/submissions?page=1&page_size=25` and `?page=2`
- Assertion: first row's `created_at` >= second row's; total visible rows across pages == 30
- Preconditions: 30 seeded submissions with monotonically increasing `created_at`

---

## AT-016: GET /api/v1/forms/{id}/submissions paginates and enforces ownership (API)
**User Story**: US-3
**Batch**: Batch-4
**Priority**: P0

**Scenario (Business Level)**:
Given I own form `F` with 7 submissions
When I call `GET /api/v1/forms/F/submissions?page=1&page_size=5`
Then I receive `{ items: [5 items], page: 1, page_size: 5, total: 7 }`
And calling `GET /api/v1/forms/F/submissions` as a different user returns `404`

**Automation Hints**:
- API: `GET /api/v1/forms/{id}/submissions?page=1&page_size=5` → `200`; response keys `items`, `page`, `page_size`, `total`
- API negative: cross-owner token → `404 form_not_found`
- API negative: `page=0` or `page_size=101` → `422`

---

## AT-017: CSV export downloads a file from the inbox
**User Story**: US-4
**Batch**: Batch-4
**Priority**: P1

**Scenario (Business Level)**:
Given form `F` has 12 submissions
When I click "Export CSV" in the inbox
Then a file `<form-name>-submissions.csv` downloads
And the file contains 13 lines (1 header + 12 data rows)

**Automation Hints**:
- UI Selector: `[data-testid="export-csv-button"]`; assert browser download triggered (Playwright `page.expectDownload`)
- API observed: `GET /api/v1/forms/{id}/submissions.csv` → `200` `Content-Type: text/csv; charset=utf-8`; `Content-Disposition` contains `attachment; filename=`
- Assertion: downloaded file line count == 13; first line starts with `submitted_at,`

---

## AT-018: CSV columns are union of fields; missing cells are blank
**User Story**: US-4
**Batch**: Batch-4
**Priority**: P0

**Scenario (Business Level)**:
Given form `F` has three submissions: `{name, email}`, `{name, message}`, `{email, phone}`
When I download the CSV
Then the header row is `submitted_at,email,message,name,phone`
And the row for the first submission has its `name` and `email` populated and the `message` and `phone` cells empty (NOT the literal `null`)

**Automation Hints**:
- API: `GET /api/v1/forms/{id}/submissions.csv` → parse with `csv.DictReader`
- Assertion: header set == `{"submitted_at","email","message","name","phone"}`; cell value `''` (empty), never `'null'`
- Preconditions: 3 specific submissions seeded

---

## AT-019: Successful submission sends a notification email within 60 s
**User Story**: US-5
**Batch**: Batch-3
**Priority**: P0

**Scenario (Business Level)**:
Given I own form `F` named "Personal contact"
When a real submission `{"name":"Ada","email":"ada@x.y","message":"Hi"}` is POSTed to `/f/F`
Then within 60 seconds my email provider is invoked exactly once
And the message subject contains `"Personal contact"`
And the message body lists each field/value pair
And the `submission.email_status` row is `sent` and `email_attempts` is `1`

**Automation Hints**:
- API: `POST /f/{id}` JSON body → `200`
- Mock provider assertion: `provider.send.call_count == 1`; `subject` contains form name; `text` contains `"Ada"`, `"ada@x.y"`, `"Hi"`
- DB assertion: `submissions.email_status == 'sent'`, `submissions.email_attempts == 1` after background task completes
- Preconditions: in-test mocked `EmailProvider`; `EMAIL_PROVIDER=noop` swapped for a stub that records calls

---

## AT-020: Email send failure surfaces as inbox badge; submission still safe
**User Story**: US-5 (edge case from PRD §3)
**Batch**: Batch-3 (backend) + Batch-4 (UI badge)
**Priority**: P0

**Scenario (Business Level)**:
Given the email provider raises an exception on every call
When a submission is POSTed
Then the submission row is still persisted
And after 3 retries the row's `email_status = "failed"` and `email_attempts = 3`
And the inbox row in `/dashboard/forms/{id}` shows a "notification not delivered" badge

**Automation Hints**:
- Mock provider raises `RuntimeError("smtp down")`
- API: `POST /f/{id}` → `200`/`303` regardless (background task is fire-and-monitor)
- DB assertion (after background task settles or polled): `email_status == 'failed'`, `email_attempts == 3`
- UI Selector: `[data-testid="email-status-badge"][data-status="failed"]` text contains "notification not delivered"

---

## AT-021: GET /api/v1/me returns and lazily provisions the profile
**User Story**: US-8 (and bootstrap of every authenticated user)
**Batch**: Batch-1
**Priority**: P0

**Scenario (Business Level)**:
Given I have a Firebase ID token but no profile row exists
When I call `GET /api/v1/me`
Then a profile row is created
And the response includes my `uid`, `id`, `email`, `email_verified`, `created_at`

**Automation Hints**:
- API: `GET /api/v1/me` headers `Authorization: Bearer <token>` → `200`; response keys `uid`, `id`, `email`, `email_verified`, `created_at`
- DB assertion: `select count(*) from users where firebase_uid=?` was 0 before, 1 after
- Second call: same `id` returned (idempotent)

---

## AT-022: Unverified user cannot create a form (UI gate + 403)
**User Story**: US-8
**Batch**: Batch-1 (UI gate) + Batch-2 (server enforcement)
**Priority**: P0

**Scenario (Business Level)**:
Given I am signed in but `email_verified` is false
When I open the dashboard
Then the "Create form" button is disabled
And a message tells me to verify my email first
And calling `POST /api/v1/forms` directly returns `403 email_not_verified`

**Automation Hints**:
- UI Selector: `[data-testid="create-form-button"]` is `disabled`; `[data-testid="verify-email-banner"]` is visible
- API: `POST /api/v1/forms` body `{"name":"x"}` with unverified-user token → `403 {"detail": "email_not_verified"}`
- Preconditions: Firebase user exists with `email_verified=false`

---

## AT-023: After email verification, form creation is enabled
**User Story**: US-8
**Batch**: Batch-1 (UI re-enable) + Batch-2 (server allow)
**Priority**: P1

**Scenario (Business Level)**:
Given I just verified my email (via Firebase verification link)
When I refresh the dashboard
Then the "Create form" button is enabled
And `POST /api/v1/forms` succeeds with `201`

**Automation Hints**:
- Test setup: use Firebase Admin SDK to flip `email_verified=true` on the test user, then re-fetch token (`forceRefresh=true`)
- UI Selector: `[data-testid="create-form-button"]` no longer disabled; banner gone
- API: `POST /api/v1/forms` → `201`

---

## AT-024: Authenticated endpoints reject requests without a Bearer token
**User Story**: implicit (PRD §8 security)
**Batch**: Batch-1
**Priority**: P0

**Scenario (Business Level)**:
Given I have no `Authorization` header (or an expired token)
When I call any `/api/v1/*` endpoint
Then I receive `401 Unauthorized` with a JSON `detail`
And no data is returned or mutated

**Automation Hints**:
- API matrix (all without token):
  - `GET /api/v1/me` → `401`
  - `GET /api/v1/forms` → `401`
  - `POST /api/v1/forms` → `401`
  - `PATCH /api/v1/forms/{id}` → `401`
  - `DELETE /api/v1/forms/{id}` → `401`
  - `GET /api/v1/forms/{id}/submissions` → `401`
  - `GET /api/v1/forms/{id}/submissions.csv` → `401`
- API matrix (with expired token): same → `401 {"detail":"Token has expired"}`
- Public endpoint `POST /f/{id}` is NOT in this matrix — it must remain unauthenticated by design

---

## Coverage Verification (Architect self-check)

- **All 9 PRD user stories covered**: US-1 (AT-002, AT-003, AT-006a), US-2 (AT-005, AT-006), US-3 (AT-015, AT-016), US-4 (AT-017, AT-018), US-5 (AT-019, AT-020), US-6 (AT-010, AT-011, AT-012), US-7 (AT-008, AT-009, AT-013), US-8 (AT-001, AT-022, AT-023), implicit auth story (AT-024).
- **All 8 endpoints covered**: `POST /f/{id}` (AT-007/008/009/010/011/012/013/014/019/020), `GET /api/v1/me` (AT-021), `GET /api/v1/forms` (AT-004), `POST /api/v1/forms` (AT-003, AT-022), `PATCH /api/v1/forms/{id}` (AT-006a, AT-024), `DELETE /api/v1/forms/{id}` (AT-005, AT-006, AT-024), `GET /api/v1/forms/{id}/submissions` (AT-016, AT-024), `GET /api/v1/forms/{id}/submissions.csv` (AT-017, AT-018, AT-024).
- **Edge cases from PRD §3 covered**: invalid formId (AT-013), body > 100 KB (AT-014), honeypot (AT-007), email send failure (AT-020), unverified user gating (AT-022/023), CSV column union (AT-018), deletion cascade (AT-005/006).
- **AT count: 25** (AT-001 through AT-024, plus AT-006a). All assigned to exactly one batch in `delivery-plan.md`.
