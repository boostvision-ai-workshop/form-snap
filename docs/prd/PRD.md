# Product Requirements Document — FormSnap

> Source: `docs/prompt.md` (original product brief, in Chinese). This PRD is the canonical input for Phase 1 (Architect). It restates the brief in product terms, fills in the gaps the brief leaves implicit, and conforms to `docs/prd/PRD_TEMPLATE.md`.
>
> Stack overrides from the brief are **intentionally not adopted** at the PRD level: the project's locked stack (FastAPI + Firebase Auth + Supabase Postgres + Next.js 16, see `AGENTS.md`) takes precedence over the Next.js API Routes / Supabase Auth / Resend stack mentioned in the original brief. The Architect should map "Resend" to a generic transactional email integration in `technical-spec.md` and pick the concrete provider there.

## 1. Product Overview

### Product Name
**FormSnap** — A backend-as-an-endpoint for static-site forms.

### Problem Statement
Owners of static websites (plain HTML, Webflow, Hugo, Jekyll, Astro static export, Notion-published sites, etc.) cannot collect form submissions without either (a) standing up a custom backend, (b) gluing Zapier/Google Forms hacks together, or (c) paying for heavyweight CMSes. This is a recurring source of friction reported in indie-hacker and no-code communities: every freelancer and side-project owner who ships a marketing page eventually needs a contact form, a beta signup, or a feedback widget, and most abandon or duct-tape it.

The pain is concrete and observable:
- Static-site templates ship with `<form>` markup but no `action` URL — the form silently does nothing.
- Existing alternatives (Formspree, Basin, Getform, Netlify Forms) work but lock the user in, charge per submission, or require leaving their preferred host.
- Users repeatedly re-implement the same boring backend (receive POST → store → email me) on every project.

### Target Audience
Primary:
- **Indie hackers and freelancers** shipping marketing landing pages, personal sites, or pre-launch waitlists.
- **Designers and no-code builders** using Webflow, Framer, Carrd, or hand-coded HTML who want to keep their stack static.

Secondary:
- **Static-site bloggers** (Hugo, Jekyll, Astro) who want a simple contact form.
- **Small agencies** that ship many small marketing sites and need a single dashboard to monitor submissions across them.

Out of audience: high-volume enterprise lead-capture; teams that need workflow routing, CRM sync, or compliance-grade audit trails — those needs belong to a heavier product.

### Goals and Success Metrics
- **Primary goal**: A new user can paste an `action="https://formsnap.example/f/<formId>"` into their HTML and receive their first submission (data + email notification) in under 5 minutes from sign-up.
- **Secondary goal**: A returning user can browse, filter, and export submissions for any of their forms without leaving the dashboard.
- **Activation metric**: ≥ 50% of signed-up accounts receive at least one real (non-test) submission within 7 days, measured 90 days post-launch.
- **Reliability metric**: ≥ 99.5% of valid POSTs to `/f/{formId}` result in a stored submission AND a sent notification email within 60 seconds, measured weekly.
- **Stickiness metric**: ≥ 30% of accounts with at least one submission return to the dashboard at least once in the following 30 days.

### Solution Overview
FormSnap exposes a single public endpoint, `POST /f/{formId}`. The user creates a form in the dashboard, gets a `formId`, and pastes it into their static HTML form's `action` attribute. Each submission is:
1. Persisted as a JSON blob keyed to that form.
2. Forwarded to the form owner as a structured email notification.
3. Followed by a redirect — either to a default "thank you" page hosted by FormSnap, or to a `redirect_to` URL the submitter (or form HTML) supplied.

The dashboard lets owners create/list/delete forms, browse submissions per form, and export submissions as CSV.

### Scope Summary
- **In scope (MVP)**:
  - Email/password authentication via Firebase Auth.
  - Form CRUD (create, list, delete; rename optional).
  - Public submission endpoint accepting `application/x-www-form-urlencoded` and `application/json`.
  - Submission storage as opaque JSON.
  - Transactional email notification to the form owner on every accepted submission.
  - Per-form submission browsing and CSV export.
  - Default success page + per-form `redirect_url` override.
- **Out of scope (MVP)**:
  - Spam filtering beyond a basic honeypot field convention (no captcha, no Akismet integration).
  - File / attachment upload handling (text fields only).
  - Webhook / Zapier outbound integrations.
  - Team accounts, multi-user form ownership, role-based access.
  - Custom email templates or branding.
  - Per-form usage quotas / billing — MVP is single-tier.
  - i18n of the dashboard (English only at launch).

## 2. User Roles & Authentication

### User Roles

#### Role: Anonymous Visitor (form submitter)
- Description: An end user filling out a form on the form owner's static site. Does NOT have a FormSnap account.
- Primary goals: Submit form data successfully; land on a sensible success page (or the URL the form owner specified).

#### Role: Authenticated User (form owner)
- Description: A signed-in FormSnap account holder who creates forms, reads submissions, and receives email notifications.
- Primary goals: Get a working `formId` quickly; see new submissions reliably; export historical submissions.

> Marketing/public visitors to FormSnap's own site are also "Anonymous Visitors" but their only product action is sign-up / sign-in. No additional role is needed.

### Permission Levels

| Role | Can View | Can Create | Can Edit | Can Delete | Admin / Special Actions |
|------|----------|------------|----------|------------|--------------------------|
| Anonymous Visitor (submitter) | Marketing pages, sign-in, sign-up, default success page | Submissions (via `POST /f/{formId}` only) | None | None | None |
| Authenticated User (owner) | Their own forms and their own forms' submissions | Forms; the system creates submissions on their behalf | Their own forms (rename, redirect_url) | Their own forms (cascade-deletes submissions); their own submissions | Export CSV of their own submissions |

Ownership rule: every `form` is owned by exactly one user. A user can only see, edit, delete, or export forms and submissions that belong to them. There is no sharing in MVP.

### Authentication Requirements
- Authentication provider: **Firebase Auth** (locked by `AGENTS.md`).
- Sign-in methods: Email + password at launch. Google sign-in is a nice-to-have if the Architect can include it without scope creep.
- Sign-up requirements: Email and password. Email verification is required before the user can create their first form (prevents typo-emails from missing notifications).
- Session expectations: Standard Firebase session — sliding refresh, persists across browser restarts, sign-out clears the session.
- Account recovery needs: Standard Firebase password reset email flow.

### Access and Onboarding Rules
- An anonymous visitor on `/dashboard*` is redirected to `/sign-in` with a return URL.
- After first sign-in, the user lands on the dashboard's empty state with a single primary CTA: "Create your first form".
- After creating their first form, the dashboard shows the form's submission endpoint and a copy-pastable HTML `<form>` snippet so the user knows exactly what to paste into their site.
- The submission endpoint `POST /f/{formId}` is **public and unauthenticated** — it is reachable from any origin, by design.

## 3. Feature Specifications

### Feature List

#### Feature: Public Form Submission Endpoint
- Summary: A public HTTPS endpoint at `POST /f/{formId}` that accepts a form submission, persists it, sends an email to the owner, and either redirects the submitter or returns JSON.
- Primary user: Anonymous Visitor (the form submitter).
- Trigger: An HTML `<form action="…/f/{formId}" method="POST">` is submitted, OR a JSON `fetch` to the same URL.
- Expected outcome: Submission is stored, owner receives an email within 60 seconds, submitter is redirected (browser flow) or receives a `200 OK` JSON ack (XHR flow).
- Priority: Must-have.

#### Feature: Account Sign-up and Sign-in
- Summary: Standard email+password authentication via Firebase Auth, including email verification and password reset.
- Primary user: Authenticated User (owner).
- Trigger: Visitor clicks "Sign up" or "Sign in" on the marketing site or hits a protected dashboard route.
- Expected outcome: New users land in the dashboard with a verified email; returning users land where they last were.
- Priority: Must-have.

#### Feature: Create / List / Delete Forms
- Summary: CRUD UI for the owner's forms. Each form has a name, an auto-generated `formId`, and an optional `redirect_url`.
- Primary user: Authenticated User (owner).
- Trigger: User clicks "New form" in the dashboard, or "Delete" on a form row.
- Expected outcome: Form appears in the user's list with a copy-pastable endpoint URL and HTML snippet; deleting a form removes it and all its submissions after a confirmation prompt.
- Priority: Must-have. (Rename + edit `redirect_url` is should-have for MVP — minimum viable is "delete + recreate".)

#### Feature: Submission Inbox per Form
- Summary: A list/table view showing every submission to a form, newest first, with per-row expansion to inspect the JSON payload.
- Primary user: Authenticated User (owner).
- Trigger: User clicks a form name in the form list.
- Expected outcome: Owner sees all submissions for that form, paginated, with timestamp and the field values readable at a glance.
- Priority: Must-have.

#### Feature: CSV Export
- Summary: Download all submissions for a form as a CSV file. Columns are the union of all observed field names across submissions in the form, plus `submitted_at`.
- Primary user: Authenticated User (owner).
- Trigger: User clicks "Export CSV" on a form's submission inbox.
- Expected outcome: A `.csv` file downloads in the browser containing every submission for that form.
- Priority: Should-have (explicitly called out as MVP-recommended in the source brief).

#### Feature: Email Notification on New Submission
- Summary: When a submission is accepted, the form owner gets a transactional email with the form's name and a clearly formatted dump of the submitted fields.
- Primary user: Authenticated User (owner).
- Trigger: A successful `POST /f/{formId}` for one of their forms.
- Expected outcome: An email arrives at the owner's verified address within 60 seconds, with subject like `New submission to "<form name>"` and a body listing each field/value pair plus a deep link back to the dashboard.
- Priority: Must-have.

#### Feature: Default Success Page + `redirect_url` Override
- Summary: After a successful submission, the submitter sees either FormSnap's default "Thanks, your message was received" page, or — if the form has a `redirect_url` set, or the submission included a `_redirect` field — that URL.
- Primary user: Anonymous Visitor (submitter).
- Trigger: Successful submission via the browser HTML flow (i.e., `Content-Type: application/x-www-form-urlencoded` with `Accept: text/html`).
- Expected outcome: A 303 See Other redirect to the appropriate URL.
- Priority: Must-have.

### User Stories

**As a** form owner, **I want to** create a new form by typing a name and clicking a button, **so that** I get a `formId` and an HTML snippet I can paste into my static site.
**Acceptance Criteria:**
- [ ] After clicking "Create form" with a non-empty name, a new form appears at the top of my form list.
- [ ] The created form shows a complete `<form>` HTML snippet I can copy with one click.
- [ ] The created form shows the submission endpoint URL `POST https://<host>/f/<formId>` clearly.

**As a** form owner, **I want to** delete a form I no longer need, **so that** I stop receiving submissions for it and free up my dashboard.
**Acceptance Criteria:**
- [ ] Clicking "Delete" on a form opens a confirmation dialog showing the form name and submission count.
- [ ] Confirming the delete removes the form from my list and any subsequent `POST /f/<formId>` returns 404.
- [ ] Submissions previously belonging to that form are no longer visible anywhere in the dashboard.

**As a** form owner, **I want to** browse the submissions to one of my forms in a table, **so that** I can see who's contacted me without opening every email.
**Acceptance Criteria:**
- [ ] Clicking a form opens its inbox showing newest submissions first.
- [ ] Each row shows submission time and a one-line preview of the field values.
- [ ] Clicking a row expands to show all submitted fields and values.

**As a** form owner, **I want to** export a form's submissions as CSV, **so that** I can analyze them in a spreadsheet or import them into another tool.
**Acceptance Criteria:**
- [ ] An "Export CSV" button on the inbox triggers a file download.
- [ ] The CSV includes one row per submission and one column per distinct field name observed across all submissions, plus a `submitted_at` column.
- [ ] Empty fields (where a submission did not include that field) are blank cells, not the literal string "null".

**As a** form owner, **I want to** receive an email every time my form gets a new submission, **so that** I notice new leads without opening the dashboard.
**Acceptance Criteria:**
- [ ] When `POST /f/<formId>` succeeds, an email arrives at my account email address within 60 seconds.
- [ ] The email's subject contains the form's name.
- [ ] The email body lists every submitted field name and value in a readable layout.
- [ ] The email contains a link back to the form's inbox in the dashboard.

**As a** form submitter, **I want to** be redirected to a useful page after submitting, **so that** I know my submission worked.
**Acceptance Criteria:**
- [ ] If the form has no `redirect_url` set, I land on FormSnap's default success page.
- [ ] If the form has a `redirect_url` set, I land on that URL.
- [ ] If the submission includes a `_redirect` field with a URL value, that URL takes precedence over the form's `redirect_url`.

**As a** form submitter, **I want to** submit either a classic HTML form or a JSON `fetch`, **so that** the same endpoint works whether I'm using vanilla HTML or a JS framework.
**Acceptance Criteria:**
- [ ] A `Content-Type: application/x-www-form-urlencoded` POST returns a 303 redirect with `Location` set per the redirect rules above.
- [ ] A `Content-Type: application/json` POST returns `200 OK` with a JSON body `{ "ok": true, "id": "<submissionId>" }`.
- [ ] An invalid `formId` returns 404 in both modes; no email is sent and nothing is stored.

**As a** new visitor, **I want to** sign up with email and password and verify my email, **so that** I can start creating forms.
**Acceptance Criteria:**
- [ ] After successful sign-up, I receive a Firebase verification email.
- [ ] I cannot create a form until my email is verified — the "Create form" button is disabled with a clear message.
- [ ] After clicking the verification link, returning to the dashboard enables form creation.

### Core Workflows

#### Workflow: First-form happy path (new user)
1. Visitor signs up with email and password on the marketing site.
2. They verify their email via the Firebase verification link.
3. They land on the dashboard empty state and click "Create your first form".
4. They name the form (e.g., "Personal site contact") and submit.
5. The dashboard shows the new form with its endpoint URL and a copy-pastable HTML snippet.
6. They paste the snippet into their static HTML site and deploy.
7. A real visitor submits the form on their site.
8. Within 60 seconds the owner receives a notification email; the submission appears at the top of the inbox in the dashboard.

#### Workflow: Submission processing (anonymous submitter)
1. Browser POSTs `application/x-www-form-urlencoded` data to `/f/{formId}`.
2. Backend looks up the form. If not found → 404.
3. Backend parses the body into JSON, ignoring the conventional honeypot field if present and non-empty (silent drop, return success-shaped redirect).
4. Backend persists the submission row (form_id, data jsonb, created_at).
5. Backend enqueues / sends a notification email to the form owner.
6. Backend computes the redirect target (precedence: `_redirect` body field → form's `redirect_url` → default success page) and returns a 303 redirect.
7. Submitter's browser follows the redirect.

#### Workflow: Inbox browsing and CSV export
1. Owner signs in and clicks a form in the form list.
2. Inbox loads paginated submissions (newest first), 25 per page.
3. Owner expands rows to inspect payloads.
4. Owner clicks "Export CSV".
5. Backend streams a CSV containing every submission for that form to the owner.

### Business Rules
- A form's `formId` is globally unique, opaque, and URL-safe; it is generated server-side and never reused.
- A submission is only persisted if its `form_id` resolves to an existing, non-deleted form.
- Deleting a form cascade-deletes its submissions; this action is irreversible and the confirmation dialog must say so.
- A user can only access their own forms and submissions; cross-tenant reads must be impossible.
- A submitted body must be ≤ 100 KB after parsing; larger bodies are rejected with 413.
- A form rejects submissions if the submitted body contains a non-empty `_gotcha` field — this is a basic honeypot. The endpoint still returns the same success-shaped response so bots can't probe the rule.
- Notification emails go to the form owner's account email (no separate notification address in MVP).
- Email verification is required before form creation, but NOT required to receive submissions on already-created forms (so an owner who lapses on verification doesn't lose data).

### Edge Cases and Failure Scenarios
- **Empty inbox**: A form with zero submissions shows an empty state with the endpoint URL and the HTML snippet repeated, plus a "send a test submission" curl command.
- **Invalid `formId`**: `POST /f/<bogus>` returns 404 with a JSON body `{ "ok": false, "error": "form_not_found" }`. No email, no row.
- **Email send fails**: Submission MUST still be stored. The failure is logged for the owner and surfaced as a small badge on the inbox row ("notification not delivered"). The system retries email up to 3 times with backoff.
- **Submitter sends `Content-Type: multipart/form-data`**: Treated like `application/x-www-form-urlencoded` for the field values; file fields are silently dropped in MVP (out of scope) but the text fields and redirect still work.
- **Body exceeds 100 KB**: 413 Payload Too Large; nothing stored, no email.
- **`redirect_url` or `_redirect` is not a valid absolute URL**: Falls back to the default success page; the failure is logged.
- **User is signed in but unverified**: Dashboard renders read-only; form creation is gated; submissions to existing forms still flow.
- **Owner deletes their account**: Out of scope for MVP — Firebase account deletion is not exposed in the dashboard.

## 4. Data Model / Schema

### Data Entity Overview
FormSnap persists three product objects: a per-user **profile** (mirroring the Firebase identity for join purposes), a **form** (owned by a profile), and a **submission** (belonging to a form). Submissions store arbitrary user-supplied JSON because field shapes are unknown at form-creation time. Everything else is metadata.

### Entity Inventory
- profile
- form
- submission

### Entity: profile
Purpose: A backend-side mirror of the Firebase user, used as the foreign-key target for `form.owner_id`. Created lazily on first authenticated request.
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Primary key (server-assigned). |
| firebase_uid | string | Yes | The Firebase Auth UID. Unique. |
| email | string | Yes | The verified email used as the notification destination. |
| email_verified | boolean | Yes | Mirrors Firebase `email_verified` at last sync. |
| created_at | timestamp | Yes | Account creation time. |
| updated_at | timestamp | Yes | Last profile sync time. |
Relationships:
- One-to-many with `form` (a profile owns many forms).
Lifecycle Notes:
- Created on first authenticated API call from a Firebase user without an existing profile.
- Updated whenever the Firebase ID token shows a changed email or verification status.
- Account deletion is out of MVP scope.

### Entity: form
Purpose: A logical "endpoint" the owner exposes for static-site submissions. Each form yields one public URL.
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Primary key; this UUID's URL-safe form is the public `formId`. |
| owner_id | UUID | Yes | FK → `profile.id`. |
| name | string | Yes | Human-readable label shown in the dashboard and in notification emails. |
| redirect_url | string | No | Optional default redirect URL after successful submission. |
| created_at | timestamp | Yes | When the form was created. |
| deleted_at | timestamp | No | Soft-delete tombstone; if set, the form is treated as non-existent for all reads and submissions. (Architect may choose hard delete instead — see note.) |
Relationships:
- Many-to-one with `profile` via `owner_id`.
- One-to-many with `submission`.
Lifecycle Notes:
- Created via the dashboard.
- May be renamed (and `redirect_url` edited) by the owner.
- Deleted via the dashboard with confirmation; semantics (soft vs hard) is an Architect call documented in `data-model.md` — the user-facing requirement is "deleted forms must be gone from the UI and inaccessible via the public endpoint, and their submissions must not be readable anywhere".

### Entity: submission
Purpose: One captured form submission. The shape of `data` is opaque to the system because users define their own form fields.
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Primary key. |
| form_id | UUID | Yes | FK → `form.id`. |
| data | jsonb | Yes | The full submitted payload as a JSON object. Reserved keys (`_redirect`, `_gotcha`) are stripped before persistence. |
| created_at | timestamp | Yes | When the submission was accepted. |
| email_status | enum (`pending`, `sent`, `failed`) | Yes | Tracks the notification email outcome for this submission. |
| email_attempts | integer | Yes | Number of email send attempts so far (capped at 3). |
Relationships:
- Many-to-one with `form` via `form_id`.
Lifecycle Notes:
- Created on accepted `POST /f/{formId}`.
- `email_status` and `email_attempts` updated by the email-send job.
- Cascade-deleted when its parent form is deleted.

### Data Rules
- `profile.firebase_uid` is unique. `profile.email` is unique at the application level (Firebase enforces it for email/password sign-in).
- Every `form` MUST have an `owner_id`. Every `submission` MUST have a `form_id`. No orphans.
- A user can only read forms where `owner_id` matches their profile, and submissions whose form they own. The backend enforces this on every read.
- Submissions are retained indefinitely in MVP. (Retention/archival policy is out of MVP scope.)
- `data.size_bytes` is implicitly capped by the 100 KB request body limit, not stored explicitly.

## 5. API Endpoints

### API Needs Overview
The product needs (a) a single public submission endpoint, and (b) a small CRUD surface for the dashboard, all served by the project's FastAPI backend. The dashboard authenticates with a Firebase ID token (sent as `Authorization: Bearer <token>`) which the backend verifies via the Firebase Admin SDK, per `AGENTS.md`.

### Endpoint Inventory
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | /f/{formId} | Public submission endpoint. Accepts urlencoded or JSON. | No |
| GET | /api/v1/forms | List the authenticated user's forms. | Yes |
| POST | /api/v1/forms | Create a new form for the authenticated user. | Yes |
| PATCH | /api/v1/forms/{formId} | Rename a form or change its `redirect_url`. | Yes |
| DELETE | /api/v1/forms/{formId} | Delete a form (and cascade its submissions). | Yes |
| GET | /api/v1/forms/{formId}/submissions | List submissions for one of the user's forms (paginated). | Yes |
| GET | /api/v1/forms/{formId}/submissions.csv | Stream all submissions for a form as CSV. | Yes |
| GET | /api/v1/me | Return the authenticated user's profile (used to provision profile lazily). | Yes |

### Endpoint Details

#### Endpoint: POST /f/{formId}
- Purpose: Receive a form submission from any static site, store it, notify the owner, and redirect or ack.
- Triggered by: HTML `<form>` POST or `fetch` from any third-party origin.
- Auth required: No.
- Request data: `application/x-www-form-urlencoded`, `application/json`, or `multipart/form-data`. Reserved fields: `_redirect` (target URL override), `_gotcha` (honeypot).
- Response data: 303 redirect for the browser HTML flow; `200 { "ok": true, "id": <uuid> }` for the JSON flow.
- Failure states: 404 if `formId` does not resolve; 413 if body > 100 KB; 400 if body is unparseable; submissions silently treated as success-shaped if honeypot is tripped.

#### Endpoint: POST /api/v1/forms
- Purpose: Create a new form for the signed-in user.
- Triggered by: Dashboard "Create form" action.
- Auth required: Yes; user must be email-verified.
- Request data: `{ "name": string, "redirect_url"?: string }`.
- Response data: The full form object including its `formId` and a ready-to-paste HTML snippet.
- Failure states: 401 if no/invalid token; 403 if email is not verified; 400 if `name` is empty or `redirect_url` is not a valid URL.

#### Endpoint: GET /api/v1/forms
- Purpose: List the user's forms for the dashboard form list.
- Triggered by: Dashboard load.
- Auth required: Yes.
- Request data: None.
- Response data: Array of form objects with submission counts.
- Failure states: 401 if no/invalid token.

#### Endpoint: PATCH /api/v1/forms/{formId}
- Purpose: Rename a form or update its `redirect_url`.
- Triggered by: Dashboard inline edit.
- Auth required: Yes; user must own the form.
- Request data: Partial form object (`name?`, `redirect_url?`).
- Response data: The updated form.
- Failure states: 401, 403 (not owner), 404 (deleted/unknown), 400 (invalid URL).

#### Endpoint: DELETE /api/v1/forms/{formId}
- Purpose: Delete a form and cascade its submissions.
- Triggered by: Dashboard delete confirmation.
- Auth required: Yes; user must own the form.
- Request data: None.
- Response data: 204 No Content.
- Failure states: 401, 403, 404.

#### Endpoint: GET /api/v1/forms/{formId}/submissions
- Purpose: Paginated list of submissions for the inbox view.
- Triggered by: Owner clicks a form.
- Auth required: Yes; user must own the form.
- Request data: Query params `page` (default 1), `page_size` (default 25, max 100).
- Response data: `{ items: [...], page, page_size, total }`. Each item exposes `id`, `created_at`, `data`, `email_status`.
- Failure states: 401, 403, 404.

#### Endpoint: GET /api/v1/forms/{formId}/submissions.csv
- Purpose: Stream all submissions for a form as a downloadable CSV.
- Triggered by: Owner clicks "Export CSV".
- Auth required: Yes; user must own the form.
- Request data: None.
- Response data: `text/csv` stream with `Content-Disposition: attachment; filename="<form-name>-submissions.csv"`. Columns: union of all field names across submissions, plus `submitted_at`.
- Failure states: 401, 403, 404.

#### Endpoint: GET /api/v1/me
- Purpose: Return (and lazily create) the user's profile.
- Triggered by: Dashboard bootstrap.
- Auth required: Yes.
- Request data: None.
- Response data: Profile object including `email_verified`.
- Failure states: 401.

### External API Needs
- **Firebase Auth (server-side, Admin SDK)**: Verifies ID tokens on every authenticated request. Out-of-band: handles password reset and email verification emails.
- **Transactional email provider** (Resend was suggested in the brief; Architect decides the concrete provider in `technical-spec.md`): Sends notification emails to form owners. Required configuration: API key + verified sending domain. Failure mode: retry up to 3 times with backoff; persistent failure leaves the submission with `email_status = failed` (data is still safe).
- The dashboard does **not** call Supabase directly — all data flows through FastAPI per `AGENTS.md` rule §2.

## 6. Page Structure & Navigation

### Page Inventory
| Page Name | Route | Audience | Rendering Preference | Purpose |
|-----------|-------|----------|----------------------|---------|
| Marketing landing | `/` | Anonymous | SSR | Pitch FormSnap; CTAs to sign up / sign in. |
| Sign up | `/sign-up` | Anonymous | SSR | Account creation form. |
| Sign in | `/sign-in` | Anonymous | SSR | Sign-in form + password reset link. |
| Verify email reminder | `/verify-email` | Authenticated, unverified | CSR | Tells the user to check their inbox; "resend" button. |
| Dashboard / form list | `/dashboard` | Authenticated | CSR | List of the user's forms; "Create form" CTA; empty state for new users. |
| New form | `/dashboard/forms/new` | Authenticated | CSR | Form creation modal/page. (Architect may choose a modal on `/dashboard` instead.) |
| Form detail / inbox | `/dashboard/forms/{formId}` | Authenticated | CSR | Submission inbox + CSV export + form settings (rename, redirect_url, delete). |
| Default submission success | `/submitted` | Anonymous | SSR | Generic "Thanks, your submission was received" page used when a form has no `redirect_url`. |
| 404 / Not found | `/*` | Any | SSR | Standard not-found page. |

### Navigation Structure
- Primary navigation: Marketing pages have a top nav with "Sign in" / "Sign up". Authenticated dashboard has a slim sidebar (or top nav) with "Forms" and the user's email + sign-out.
- Secondary navigation: Inside a form detail page, tabs for "Inbox" and "Settings".
- Entry points: The marketing landing is the public entry. Authenticated users typically arrive via direct deep-link to `/dashboard` after sign-in.
- Exit points: "Sign out" from the user menu returns to the marketing landing.

### Page Details

#### Page: Dashboard / form list
- Route: `/dashboard`
- Audience: Authenticated User.
- Rendering preference: CSR (per AGENTS.md rule for authenticated pages).
- Key content: List of the user's forms with name, submission count, and last-submission timestamp. Primary CTA: "Create form".
- Main actions: Open a form, create a form, delete a form (with confirm), copy endpoint URL.
- States: empty (no forms — show onboarding); loading skeleton; populated; error.
- Component needs: data table or card list, primary button, confirm dialog, copy-to-clipboard control.

#### Page: Form detail / inbox
- Route: `/dashboard/forms/{formId}`
- Audience: Authenticated User who owns this form.
- Rendering preference: CSR.
- Key content: Paginated submissions (newest first), expandable rows showing the full JSON. Settings tab shows name, `redirect_url`, endpoint URL, copy-pastable HTML snippet, delete button.
- Main actions: Browse submissions, expand a row, export CSV, edit name/redirect_url, delete the form.
- States: empty inbox (show endpoint + snippet + curl test); loading; populated with pagination; error; delete-confirmation dialog open.
- Component needs: tabs, data table with expandable rows, code block for the HTML snippet, copy-to-clipboard, file-download trigger, edit form, destructive confirm dialog.

#### Page: Sign in
- Route: `/sign-in`
- Audience: Anonymous Visitor.
- Rendering preference: SSR.
- Key content: Email + password fields, "forgot password" link, switch-to-sign-up link.
- Main actions: Sign in; trigger password reset email.
- States: idle, submitting, error (bad credentials, unverified email warning), success → redirect to `/dashboard` (or original return URL).
- Component needs: input, button, inline error, link.

#### Page: Default submission success
- Route: `/submitted`
- Audience: Anonymous Visitor (form submitter).
- Rendering preference: SSR.
- Key content: A short, friendly "Thanks, your submission was received" message. No FormSnap promotional content beyond a small footer (this page is shown to the form owner's end users).
- Main actions: None. May show a "Powered by FormSnap" link in the footer.
- States: Static.
- Component needs: heading, body text, footer link.

### Content and Access Flow
- Public pages: `/`, `/sign-up`, `/sign-in`, `/submitted`, `/*` (404).
- Authentication-required pages: everything under `/dashboard*`.
- Verification-gated action: form creation (the form CRUD endpoint enforces this; the UI mirrors it). Reading existing forms and existing submissions does NOT require verification.

## 7. Third-party Integrations

### Integration Overview
FormSnap depends on three external services: Firebase Auth (identity), the project's Supabase Postgres (data store, reached only by the backend per `AGENTS.md`), and a transactional email provider (notifications). All three are required for MVP.

### Required Integrations

#### Integration: Firebase Auth
- Purpose: User authentication and identity management.
- Product usage: Email/password sign-up and sign-in for form owners; email verification before form creation; password reset; ID-token verification on every authenticated API call.
- Required configuration: Firebase project; web SDK config exposed to the Next.js client; service account JSON for the FastAPI backend; verified sending domain for Firebase's own auth emails.

#### Integration: Supabase Postgres
- Purpose: Primary data store for `profile`, `form`, and `submission`.
- Product usage: Backend-only access via SQLAlchemy + Alembic, per `AGENTS.md`. Frontend never touches Supabase directly.
- Required configuration: Supabase project; backend connection string; Alembic-managed schema.

#### Integration: Transactional email provider (e.g., Resend)
- Purpose: Send notification emails to form owners on every accepted submission.
- Product usage: Backend calls this provider once per submission accept. Resend was suggested in the source brief; the Architect picks the concrete provider in `technical-spec.md`.
- Required configuration: API key, verified sending domain, default "from" address (e.g., `notifications@formsnap.example`).

### Integration Rules and Constraints
- Submissions MUST be persisted before the email is attempted; an email failure must NOT cause a 5xx to the submitter.
- Email sends retry up to 3 times with exponential backoff; persistent failures are surfaced in the dashboard inbox, not silently dropped.
- Firebase outage degrades the dashboard (no sign-in, no form CRUD) but does NOT block the public submission endpoint, which remains unauthenticated.
- All third-party credentials live in backend environment variables; per `AGENTS.md` rule §2.4, none of them may appear in client code.

## 8. Non-functional Requirements

### Performance Requirements
- Dashboard pages: meaningful content visible within 2 seconds on a typical broadband connection.
- `POST /f/{formId}`: p95 latency under 500 ms from request received to response sent (the email send happens in-process or via a quick enqueue; the redirect must not wait for SMTP).
- Inbox pagination: each page (25 rows) returns within 500 ms p95 for a form with up to 10,000 submissions.
- CSV export: streams within 5 seconds for forms with up to 10,000 submissions.

### Security Requirements
- All authenticated endpoints verify the Firebase ID token on every request; no session cookies are trusted without re-verification.
- Tenant isolation: every read of `form` or `submission` MUST filter by `owner_id = current user`. This is enforced in the backend service layer; route handlers do not query the database directly (per `AGENTS.md` rule §2.7).
- Public submission endpoint MUST validate that the body is well-formed and within the 100 KB limit before doing any work.
- Reserved fields (`_redirect`, `_gotcha`) MUST be stripped before persistence so they don't end up in the user-visible payload.
- No third-party secrets reachable from client code.
- Honeypot trip is logged but not counted as a real submission and not emailed.

### Browser and Device Support
- Supported browsers: latest two stable versions of Chrome, Firefox, Safari, and Edge.
- Supported devices: desktop and tablet for full dashboard functionality; mobile is acceptable for inbox browsing but creating/editing forms on mobile is "should work" not "must be polished".
- Responsive behavior: dashboard layout adapts gracefully to ≥ 360px viewports; the marketing landing must look right on mobile.

### Reliability and Support Expectations
- Target availability for `POST /f/{formId}`: 99.9% monthly. (Treat the public endpoint as the highest-criticality surface; the dashboard can tolerate slightly more downtime.)
- Submissions are durable from the moment the endpoint returns 2xx/3xx — they MUST survive a backend crash immediately after.
- No backups are explicitly required at MVP beyond what Supabase provides by default; document this assumption in `technical-spec.md`.

### Technical Considerations
- Stack is locked per `AGENTS.md`: Next.js 16 + React 19 (frontend), FastAPI + SQLAlchemy 2.x async + Pydantic v2 (backend), Firebase Auth, Supabase Postgres, Alembic. The Architect MUST NOT propose alternatives to these. The original brief's mention of Next.js API Routes / Supabase Auth / Resend is a starting point only; the actual implementation lives in FastAPI.
- All backend routes follow the `app.*` import convention and put queries in `backend/app/services/` (per `AGENTS.md` must-not §2.7 and §2.8).
- The public submission endpoint is on the FastAPI backend (not a Next.js route). The path `POST /f/{formId}` is mounted at the backend root, not under `/api/v1`, because users will be typing/pasting it into static HTML and the shorter path is part of the product value.
- CORS on `POST /f/{formId}` is wide open by design (any origin); CORS on `/api/v1/*` is restricted to the dashboard origin.

### Deployment Notes
- Single environment for MVP (production). No staged rollout required.
- The submission endpoint URL format MUST be stable from launch — owners will paste it into HTML they don't control and we cannot break it later. Treat `/f/{formId}` as a public contract.
- Operational expectations: a basic dashboard for backend errors and email send failures is required by launch (the Architect chooses the tool in `technical-spec.md`).

## Design Reference (Optional)

4. **None**: Designer will generate component suggestions from the PRD descriptions above.

> The product is utility-first; a clean, restrained Shadcn-default look is fine for MVP. The Designer may add a single accent color and a code-block aesthetic for the HTML snippet.
