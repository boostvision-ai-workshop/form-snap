# Component Map — FormSnap

> Design source: **Priority 0 (mockup `docs/prd/formsnap_prd_design.png` + SVG icon)**.
> All mappings derived from the 12-surface PRD mockup, PRD §5 (information architecture),
> and `technical-spec.md` §3 (frontend architecture).
>
> **Shipped vs Polish status** per `delivery-plan.md`:
> - `[SHIPPED]` — component was delivered in Batches 1–4 and exists in `frontend/src/`.
> - `[POLISH]` — component exists but needs visual-polish work in a UI-Polish batch.
> - `[NEW]` — component does not yet exist; Engineer must create it.
> - `[PRD-ONLY]` — page is in PRD scope but outside Batches 1–4; defer to future phase.

---

## Overview

FormSnap has three audience surfaces:

1. **Marketing** (`(marketing)/`) — anonymous visitors; SSR; full-width layout with sticky header.
2. **Auth** (`(auth)/`) — sign-in / sign-up / verify; SSR shell + CSR form; centered card layout.
3. **App / Dashboard** (`(dashboard)/`) — authenticated users; CSR; sidebar + header + content.

Strategy:
- Maximise reuse of the 22 pre-installed Shadcn UI components.
- Custom components go in domain directories (`auth/`, `dashboard/`, `marketing/`, `forms/`,
  `billing/`, `team/`, `shared/`). Never modify `ui/`.
- Every color, spacing, and radius reference uses CSS variable names from `design-system.md`
  (e.g. `var(--color-published)`, `var(--border)`). No ad-hoc hex values in components.

---

## Shadcn Components — Global Usage Summary

| Component | Pages / Use cases |
|-----------|-------------------|
| `alert` | Auth error states; email-not-verified gate; form validation hints |
| `avatar` | User menu (sidebar); team member list |
| `badge` | Form status (published/draft/archived); email status; plan badge; role badge |
| `button` | Every CTA, submit, copy, export, delete, nav trigger |
| `card` | Auth container; KPI metric cards; pricing tier cards; integration vendor cards; billing plan card; feature cards |
| `checkbox` | Team invite form; billing "remember" placeholder; settings toggles |
| `command` | Not used in shipped scope |
| `dialog` | Create-form; delete-form; invite member; disconnect integration confirm |
| `dropdown-menu` | Per-row actions (forms list, submissions list, team list); user menu in sidebar |
| `input-group` | Password field with show/hide toggle in auth |
| `input` | All text fields across auth, settings, forms, billing |
| `label` | All form field labels |
| `scroll-area` | Submission inbox table; form builder field library panel; activity log |
| `select` | Role selector (team invite); form filter (submissions page); timezone (settings) |
| `separator` | Sidebar nav group dividers; settings section dividers; pricing card dividers |
| `sheet` | Mobile sidebar drawer (all `(dashboard)/` pages on < lg:) |
| `skeleton` | Loading state for form list, submission table, KPI cards, team list |
| `sonner` | Copy toast; save toast; delete toast; invite sent toast; integration connected toast |
| `switch` | Settings toggles (notifications, close-after-submission); integration enabled toggle |
| `table` | Forms list; submissions list; invoice history; team members; activity log; webhook list |
| `tabs` | Form detail (Inbox / Settings); settings pages (General / Security / Domains / Appearance); analytics filters; builder (Editor / Settings / Share) |
| `textarea` | Success message in form settings; form description in create-form; help text in builder |

---

## Pages and Their Components

### 1. Marketing Landing Page (`/`)

**Route**: `/`
**Mockup row**: Row 1 — hero + "Trusted by" logo strip
**Rendering**: SSR
**Layout group**: `(marketing)/`
**Polish batch**: UI-Polish-1

**Shadcn Components**:
- `button` — hero "Get started free" (gradient CTA, `h-11`); "View demo" (outline); header "Sign in" / "Sign up"
- `card` — feature highlight cards (3-column grid); "Trusted by" logo strip container
- `badge` — "Free to start" hero label; "New" marker on feature callout
- `separator` — between hero / features / pricing teaser / CTA footer sections

**Custom Components**:

| Component | Path | Status | Description |
|-----------|------|--------|-------------|
| `marketing-header.tsx` | `components/marketing/` | `[SHIPPED][POLISH]` | Public nav: logo + nav links + "Sign in" / "Sign up" buttons |
| `marketing-footer.tsx` | `components/marketing/` | `[SHIPPED][POLISH]` | Footer with nav links + "Powered by FormSnap" |
| `hero-section.tsx` | `components/marketing/` | `[NEW]` | Headline, sub-copy, gradient CTA, trust notes, endpoint URL preview |
| `feature-grid.tsx` | `components/marketing/` | `[NEW]` | 3-column card grid of product features |
| `trust-strip.tsx` | `components/marketing/` | `[NEW]` | "Trusted by" logo row (static logos or placeholders) |
| `pricing-teaser.tsx` | `components/marketing/` | `[NEW]` | Condensed pricing table teaser linking to `/pricing` |

**State Management**: None (static SSR).

---

### 2. Pricing Page (`/pricing`)

**Route**: `/pricing`
**Mockup row**: Row 3 — 4-tier pricing cards with monthly/yearly toggle
**Rendering**: SSR shell + `"use client"` for toggle
**Layout group**: `(marketing)/`
**Polish batch**: UI-Polish-1 (marketing surface)
**Status**: `[PRD-ONLY]` — not in Batches 1–4; structure specified for UI Polish readiness.

**Shadcn Components**:
- `button` — "Get started" / "Start free trial" / "Contact sales" per tier; toggle buttons
- `card` — one per pricing tier (4 cards); "Most popular" card uses brand blue fill + white text
- `badge` — "Most popular" label on Team/Pro tier
- `switch` — Monthly / Yearly billing toggle
- `separator` — between features lists inside cards
- `tabs` — optional tab-style toggle (alternative to switch)

**Custom Components**:

| Component | Path | Status | Description |
|-----------|------|--------|-------------|
| `pricing-cards.tsx` | `components/marketing/` | `[SHIPPED][POLISH]` | 4-tier pricing grid; highlighted "Most popular" card |
| `billing-toggle.tsx` | `components/marketing/` | `[NEW]` | Monthly/Yearly toggle with "Save 20%" badge |
| `pricing-faq.tsx` | `components/marketing/` | `[NEW]` | Accordion FAQ below pricing cards |

**State Management**: Local `useState` for monthly/yearly toggle; pricing values recalculate.

---

### 3. Sign-up Page (`/sign-up`)

**Route**: `/sign-up`
**Mockup row**: Row 2 — auth three-panel composition (rightmost panel)
**Rendering**: SSR shell + `"use client"` in form
**Layout group**: `(auth)/`
**Polish batch**: UI-Polish-2

**Shadcn Components**:
- `card` — centered form container, `max-w-md`, white, `shadow-card`, `rounded-lg`
- `input` — email field
- `input-group` — password field with show/hide toggle suffix
- `label` — all field labels (`text-sm font-medium`)
- `button` — "Create account" (`h-11`, full-width, `bg-primary`); "Sign in instead" (link variant)
- `alert` — inline error (email in use, weak password, network error)

**Custom Components**:

| Component | Path | Status | Description |
|-----------|------|--------|-------------|
| `signup-form.tsx` | `components/auth/` | `[SHIPPED][POLISH]` | Orchestrates inputs + Firebase `createUserWithEmailAndPassword` |
| `social-buttons.tsx` | `components/auth/` | `[SHIPPED]` | "Continue with Google / GitHub" OAuth buttons |

**State Management**: Local state (controlled inputs, loading flag, error string).

---

### 4. Sign-in Page (`/sign-in`)

**Route**: `/sign-in`
**Mockup row**: Row 2 — auth left panel
**Rendering**: SSR shell + `"use client"` in form
**Layout group**: `(auth)/`
**Polish batch**: UI-Polish-2

**Shadcn Components**:
- `card` — centered form container
- `input` — email field
- `input-group` — password field with show/hide toggle
- `label` — field labels
- `button` — "Sign in" (`h-11`, full-width); "Forgot password?" (link, `sm`); "Sign up" (link)
- `alert` — inline error (bad credentials; unverified email)

**Custom Components**:

| Component | Path | Status | Description |
|-----------|------|--------|-------------|
| `login-form.tsx` | `components/auth/` | `[SHIPPED][POLISH]` | Orchestrates inputs + Firebase `signInWithEmailAndPassword`; "Forgot password" link |
| `social-buttons.tsx` | `components/auth/` | `[SHIPPED]` | Reused from sign-up |

**State Management**: Local state in `login-form.tsx`.

---

### 5. Forgot Password Page (`/forgot-password`)

**Route**: `/forgot-password`
**Mockup row**: Row 2 — auth middle panel
**Rendering**: SSR shell + `"use client"` in form
**Layout group**: `(auth)/`
**Polish batch**: UI-Polish-2
**Status**: `[PRD-ONLY]` — not in Batches 1–4; stub route acceptable.

**Shadcn Components**:
- `card` — centered container
- `input` — email field
- `button` — "Send reset link" (`h-11`, full-width); "Back to sign in" (link)
- `alert` — success state ("Check your inbox"); error state (email not found)

**Custom Components**:

| Component | Path | Status | Description |
|-----------|------|--------|-------------|
| `forgot-password-form.tsx` | `components/auth/` | `[NEW]` | Email input + Firebase `sendPasswordResetEmail` + success/error states |

---

### 6. Verify Email Reminder (`/verify-email`)

**Route**: `/verify-email`
**Rendering**: CSR (`"use client"`)
**Layout group**: `(auth)/`
**Polish batch**: UI-Polish-2

**Shadcn Components**:
- `card` — centered info container
- `button` — "Resend verification email"; "I've verified — take me to dashboard" (outline)
- `alert` — success after resend; error if not yet verified after click

**Custom Components**:

| Component | Path | Status | Description |
|-----------|------|--------|-------------|
| `verify-email-card.tsx` | `components/auth/` | `[SHIPPED][POLISH]` | Firebase `sendEmailVerification`; polls on "I've verified" click |

---

### 7. App Dashboard (`/app/dashboard`)

**Route**: `/app/dashboard`
**Mockup row**: Row 4 — 4 KPI cards + submissions-over-time line chart + top forms
**Rendering**: CSR (`"use client"`)
**Layout group**: `(dashboard)/`
**Polish batch**: UI-Polish-3 (dashboard chrome + forms list)
**Status**: `[PRD-ONLY]` for the full KPI/chart dashboard; the existing `/dashboard` is the FormSnap forms list (mapped separately as item 8 below).

**Shadcn Components**:
- `card` — KPI metric cards (4×); chart container card; "Top forms" card
- `button` — "Create form" (primary, gradient CTA); quick action buttons
- `badge` — form status on top-forms list; plan usage warning
- `skeleton` — loading state for all cards
- `tabs` — optional time range selector (7d / 30d / 90d) on chart card

**Custom Components**:

| Component | Path | Status | Description |
|-----------|------|--------|-------------|
| `kpi-card.tsx` | `components/dashboard/` | `[NEW]` | KPI metric card: icon + label + value + trend delta |
| `submissions-chart.tsx` | `components/dashboard/` | `[NEW]` | Line chart (recharts or similar) — submissions over time |
| `top-forms-list.tsx` | `components/dashboard/` | `[NEW]` | 5-row list of top-performing forms with submission counts |
| `quick-actions.tsx` | `components/dashboard/` | `[NEW]` | 4-button grid: Create form / View submissions / Analytics / Upgrade |
| `plan-usage-teaser.tsx` | `components/dashboard/` | `[NEW]` | Usage meter showing forms used / responses used vs plan limits |
| `dashboard-header.tsx` | `components/dashboard/` | `[SHIPPED][POLISH]` | Page top bar |
| `sidebar.tsx` | `components/dashboard/` | `[SHIPPED][POLISH]` | Sidebar chrome |

**State Management**: `useState` + `useEffect` fetching mock analytics data; `ProfileContext` for plan info.

---

### 8. Forms List (`/dashboard` — shipped, or `/app/forms`)

**Route**: `/dashboard` (shipped Batch-2) / `/app/forms` (PRD IA)
**Mockup row**: Row 5 — table with status toggle, per-row actions
**Rendering**: CSR (`"use client"`)
**Layout group**: `(dashboard)/`
**Polish batch**: UI-Polish-3

**Shadcn Components**:
- `table` — forms table (Name, Status, Responses, Views, Updated, Actions)
- `badge` — status badge per row (`badge-published` / `badge-draft` / `badge-archived`)
- `button` — "New form" / "Create form" (`h-11`, gradient or `bg-primary`); "Import" (outline)
- `input` — search bar in toolbar
- `dialog` — create-form dialog; delete-form confirmation
- `dropdown-menu` — per-row actions (Edit / Share / View submissions / Duplicate / Archive / Delete)
- `skeleton` — loading rows (5×)
- `sonner` — "Form created" / "Form deleted" / "Copied!" toasts
- `alert` — email-not-verified gate banner
- `tabs` — optional filter tabs (All / Draft / Published / Archived) in toolbar
- `select` — bulk action selector (placeholder)

**Custom Components**:

| Component | Path | Status | Description |
|-----------|------|--------|-------------|
| `form-list.tsx` | `components/dashboard/` | `[SHIPPED][POLISH]` | Orchestrates API fetch, loading/empty/error/populated states |
| `form-list-empty-state.tsx` | `components/dashboard/` | `[SHIPPED][POLISH]` | Empty state: icon + copy + CTA |
| `form-row.tsx` | `components/dashboard/` | `[SHIPPED][POLISH]` | Single table row with status badge + action dropdown |
| `create-form-dialog.tsx` | `components/dashboard/` | `[SHIPPED][POLISH]` | Name input + redirect URL input + API call |
| `delete-form-dialog.tsx` | `components/dashboard/` | `[SHIPPED][POLISH]` | Destructive confirm dialog |
| `copy-button.tsx` | `components/dashboard/` | `[SHIPPED][POLISH]` | Clipboard copy + sonner toast |
| `email-verification-gate.tsx` | `components/dashboard/` | `[SHIPPED][POLISH]` | Alert banner + CTA disable when unverified |
| `forms-toolbar.tsx` | `components/forms/` | `[NEW]` | Search input + filter tabs + bulk-action select |

**State Management**: `useState` array; optimistic delete; `ProfileContext` for email-verified gate.

---

### 9. Create Form (`/app/forms/new`)

**Route**: `/app/forms/new`
**Rendering**: CSR; modal preferred over page navigation
**Layout group**: `(dashboard)/`

**Design decision**: Reuses `create-form-dialog.tsx` as a modal triggered from the forms list.
The route `/app/forms/new` is a shallow redirect that opens the dialog.

**Shadcn Components**: Same as `create-form-dialog.tsx` — `dialog`, `input`, `label`, `textarea`, `button`, `alert`.

**Custom Components**: Reuses `dashboard/create-form-dialog.tsx` `[SHIPPED][POLISH]`.

---

### 10. Form Builder (`/app/forms/:formId/builder`)

**Route**: `/app/forms/:formId/builder`
**Mockup row**: Row 6 — 3-column: field library / canvas / field settings
**Rendering**: CSR (`"use client"`)
**Layout group**: `(dashboard)/`
**Status**: `[PRD-ONLY]` — not in Batches 1–4; specified for UI Polish readiness.

**Shadcn Components**:
- `tabs` — top bar: Editor / Settings / Share / Responses count
- `button` — "Back to forms" (ghost); "Save" (outline); "Preview" (outline); "Publish" (primary gradient); "More actions" (icon)
- `input` — field label; placeholder; help text in right panel
- `textarea` — help text (long); success message in form settings tab
- `label` — all field setting labels
- `switch` — "Required" toggle; "Hidden" toggle per field
- `select` — field type selector in library; date format; phone format
- `separator` — between field library sections (Basic / Advanced / Layout)
- `scroll-area` — left panel field library; right panel settings; center canvas
- `checkbox` — "Required" for field options
- `dropdown-menu` — "More actions" menu (Duplicate field / Archive form / Delete form)
- `dialog` — publish confirmation; discard-unsaved-changes warning
- `sonner` — "Saved" / "Published" / "Field added" toasts
- `badge` — form status indicator in top bar; "Beta" badge on advanced field types

**Custom Components**:

| Component | Path | Status | Description |
|-----------|------|--------|-------------|
| `builder-layout.tsx` | `components/forms/` | `[NEW]` | 3-column flex layout wrapper (overrides sidebar layout for full-screen) |
| `builder-top-bar.tsx` | `components/forms/` | `[NEW]` | Top action bar with form title (editable), tabs, and action buttons |
| `field-library-panel.tsx` | `components/forms/` | `[NEW]` | Left panel: categorised draggable field type cards |
| `field-type-card.tsx` | `components/forms/` | `[NEW]` | Individual field type button (icon + label) in library |
| `builder-canvas.tsx` | `components/forms/` | `[NEW]` | Center: live form preview; drop zone for fields; field ordering |
| `canvas-field-item.tsx` | `components/forms/` | `[NEW]` | A placed field on the canvas with drag handle, edit, delete controls |
| `field-settings-panel.tsx` | `components/forms/` | `[NEW]` | Right panel: settings for the selected field (label, placeholder, required, options) |
| `field-options-editor.tsx` | `components/forms/` | `[NEW]` | Editable list of options for dropdown/multiple-choice/checkbox fields |
| `builder-share-tab.tsx` | `components/forms/` | `[NEW]` | Share tab: public link + copy + embed code placeholder |
| `builder-settings-tab.tsx` | `components/forms/` | `[NEW]` | Form-level settings: success message, submit button text, redirect URL, toggles |

**State Management**: Local `useReducer` for form schema (fields array); `useState` for selected field; `useRef` for unsaved-changes tracking.

---

### 11. Submissions List (`/app/submissions`)

**Route**: `/app/submissions`
**Mockup row**: Row 7 — search + date filter + paginated table
**Rendering**: CSR (`"use client"`)
**Layout group**: `(dashboard)/`
**Polish batch**: UI-Polish-4

**Shadcn Components**:
- `table` — submissions table (ID, Form, Submitted at, Submitter email, Status, Actions)
- `input` — search bar
- `button` — "Export" (outline); row "View" action
- `select` — form selector filter; status filter; sort order
- `badge` — submission status; email status badge per row
- `dropdown-menu` — per-row actions (View / Export row / Mark spam / Delete)
- `skeleton` — loading rows
- `scroll-area` — wraps table for tall viewports
- `sonner` — "Exported" / "Deleted" toasts
- `dialog` — delete-submission confirmation

**Custom Components**:

| Component | Path | Status | Description |
|-----------|------|--------|-------------|
| `submission-table.tsx` | `components/dashboard/` | `[SHIPPED][POLISH]` | Paginated table; pagination state; `GET /api/v1/forms/{id}/submissions` |
| `submission-row.tsx` | `components/dashboard/` | `[SHIPPED][POLISH]` | Single row with expand/collapse for detail |
| `submission-detail.tsx` | `components/dashboard/` | `[SHIPPED][POLISH]` | Expanded key-value view of submission data |
| `email-status-badge.tsx` | `components/dashboard/` | `[SHIPPED][POLISH]` | Maps `email_status` to badge classes |
| `csv-export-button.tsx` | `components/dashboard/` | `[SHIPPED][POLISH]` | Fetch-to-Blob download + auth header |
| `submissions-toolbar.tsx` | `components/forms/` | `[NEW]` | Search + form selector + date range + status filter toolbar |
| `date-range-picker.tsx` | `components/shared/` | `[NEW]` | Date range input (start/end, no dependency on a date-picker lib — use two `input[type=date]`) |

**State Management**: `useState` for search, filters, page; fetch on mount + filter change.

---

### 12. Submission Detail (`/app/submissions/:submissionId`)

**Route**: `/app/submissions/:submissionId`
**Rendering**: CSR (`"use client"`)
**Layout group**: `(dashboard)/`
**Status**: `[PRD-ONLY]` — not in Batches 1–4; referenced for completeness.

**Shadcn Components**:
- `card` — submission header card; metadata card; answers card
- `button` — "Back to submissions"; "Export"; "Delete" (destructive); "Mark spam" (outline)
- `badge` — submission status; form name
- `separator` — between metadata and answers sections
- `dialog` — delete confirmation

**Custom Components**:

| Component | Path | Status | Description |
|-----------|------|--------|-------------|
| `submission-detail-page.tsx` | `components/forms/` | `[NEW]` | Full-page view of one submission: header, meta, answers |
| `answer-list.tsx` | `components/forms/` | `[NEW]` | Field-by-field answer display (label + value + field type) |

---

### 13. Analytics Page (`/app/analytics`)

**Route**: `/app/analytics`
**Mockup row**: Row 8 — KPI cards + bar chart + donut chart
**Rendering**: CSR (`"use client"`)
**Layout group**: `(dashboard)/`
**Status**: `[PRD-ONLY]` — not in Batches 1–4.

**Shadcn Components**:
- `card` — KPI cards (4×: Total submissions, Total views, Completion rate, Drop-off); chart containers
- `select` — date range selector; form selector
- `tabs` — optional time granularity (Daily / Weekly / Monthly)
- `skeleton` — loading state for all cards and charts
- `button` — "Export report" (outline)
- `badge` — trend change indicator (+12% vs previous period)

**Custom Components**:

| Component | Path | Status | Description |
|-----------|------|--------|-------------|
| `kpi-card.tsx` | `components/dashboard/` | `[NEW]` | Reused from Dashboard (item 7 above) |
| `submissions-bar-chart.tsx` | `components/dashboard/` | `[NEW]` | Bar chart — submissions over time (recharts) |
| `submissions-by-form-donut.tsx` | `components/dashboard/` | `[NEW]` | Donut chart — submissions per form (recharts) |
| `analytics-toolbar.tsx` | `components/dashboard/` | `[NEW]` | Date range + form selector filters |
| `insight-block.tsx` | `components/dashboard/` | `[NEW]` | "Top performing form" / trend-change callout card |

---

### 14. Integrations Page (`/app/integrations`)

**Route**: `/app/integrations`
**Mockup row**: Row 12 — vendor cards with Connect CTAs
**Rendering**: CSR (`"use client"`)
**Layout group**: `(dashboard)/`
**Status**: `[PRD-ONLY]` — not in Batches 1–4.

**Shadcn Components**:
- `card` — one per integration vendor (Google Sheets, Slack, Zapier, Webhooks); 3-column grid
- `button` — "Connect" (primary outline or small primary); "Manage" (outline, connected state)
- `badge` — "Connected" (success badge); "Error" (destructive badge)
- `switch` — integration enabled/disabled toggle (connected state)
- `dialog` — "Disconnect" confirmation
- `sonner` — "Connected!" / "Disconnected" toasts

**Custom Components**:

| Component | Path | Status | Description |
|-----------|------|--------|-------------|
| `integration-card.tsx` | `components/dashboard/` | `[NEW]` | Vendor logo + name + status + description + Connect/Manage button |
| `integration-settings-modal.tsx` | `components/dashboard/` | `[NEW]` | Dialog for integration-specific config (placeholder for Phase 2) |

---

### 15. Webhooks Page (`/app/integrations/webhooks` or tab)

**Route**: Under `/app/integrations` or standalone
**Rendering**: CSR (`"use client"`)
**Status**: `[PRD-ONLY]`.

**Shadcn Components**:
- `table` — webhook endpoints table (Endpoint URL, Event types, Status, Last delivery, Actions)
- `button` — "Add webhook" (primary); "Test" (outline); "Delete" (destructive icon)
- `input` — endpoint URL field
- `select` — event type multi-select (placeholder)
- `switch` — enabled/disabled per endpoint
- `dialog` — add/edit webhook form; delete confirmation
- `badge` — event type chips; delivery status

**Custom Components**:

| Component | Path | Status | Description |
|-----------|------|--------|-------------|
| `webhook-table.tsx` | `components/dashboard/` | `[NEW]` | CRUD table for webhook endpoints |
| `webhook-form-dialog.tsx` | `components/dashboard/` | `[NEW]` | Add/edit webhook dialog with URL, events, secret fields |

---

### 16. Settings — General (`/app/settings/general`)

**Route**: `/app/settings/general`
**Mockup row**: Row 9 — label/input pairs, section cards, Save button
**Rendering**: CSR (`"use client"`)
**Layout group**: `(dashboard)/`
**Polish batch**: UI-Polish-5

**Shadcn Components**:
- `tabs` — Settings sub-nav (General / Security / Domains / Appearance)
- `card` — section containers (Workspace info, Preferences)
- `input` — workspace name; slug placeholder
- `select` — timezone selector; language selector
- `label` — all field labels
- `button` — "Save changes" (primary)
- `separator` — between settings sections
- `sonner` — "Settings saved" toast

**Custom Components**:

| Component | Path | Status | Description |
|-----------|------|--------|-------------|
| `settings-layout.tsx` | `components/dashboard/` | `[NEW]` | Settings sidebar sub-nav + content area |
| `workspace-settings-form.tsx` | `components/dashboard/` | `[NEW]` | Workspace name, timezone, language; calls `PATCH /api/v1/workspace` |
| `logo-upload.tsx` | `components/shared/` | `[NEW]` | Logo upload dropzone placeholder (shows current logo or initials avatar) |

---

### 17. Settings — Security (`/app/settings/security`)

**Route**: `/app/settings/security`
**Rendering**: CSR
**Status**: `[PRD-ONLY]` — mostly UI shell / placeholders.

**Shadcn Components**:
- `card` — section containers (Change password, 2FA, Session management)
- `button` — "Change password"; "Enable 2FA"; "Revoke all sessions" (destructive)
- `separator` — between security sections

**Custom Components**:

| Component | Path | Status | Description |
|-----------|------|--------|-------------|
| `security-settings.tsx` | `components/dashboard/` | `[NEW]` | Shell with placeholder sections for password, 2FA, sessions |

---

### 18. Settings — Domains (`/app/settings/domains`)

**Route**: `/app/settings/domains`
**Rendering**: CSR
**Status**: `[PRD-ONLY]`.

**Shadcn Components**:
- `input` — custom domain input
- `button` — "Add domain"; "Verify"; "Remove" (destructive)
- `badge` — verification status (Pending / Verified / Failed)
- `card` — domain list item; DNS instructions card

**Custom Components**:

| Component | Path | Status | Description |
|-----------|------|--------|-------------|
| `domains-settings.tsx` | `components/dashboard/` | `[NEW]` | Domain management shell with DNS instruction panel |

---

### 19. Settings — Appearance (`/app/settings/appearance`)

**Route**: `/app/settings/appearance`
**Rendering**: CSR
**Status**: `[PRD-ONLY]`.

**Shadcn Components**:
- `card` — section containers
- `button` — "Save"; theme mode options
- `switch` — dark/light mode toggle placeholder

**Custom Components**:

| Component | Path | Status | Description |
|-----------|------|--------|-------------|
| `appearance-settings.tsx` | `components/dashboard/` | `[NEW]` | Theme mode selector + brand color placeholder |

---

### 20. Billing Page (`/app/billing`)

**Route**: `/app/billing`
**Mockup row**: Row 10 — current plan card + payment method + invoice history
**Rendering**: CSR (`"use client"`)
**Layout group**: `(dashboard)/`
**Status**: `[PRD-ONLY]`.

**Shadcn Components**:
- `card` — current plan card (blue-tinted for active plan); payment method card; usage card
- `table` — invoice history (Date, Description, Amount, Status, Download)
- `button` — "Manage plan" / "Upgrade" (primary gradient); "Update payment method" (outline); "Download" (icon, outline)
- `badge` — invoice status (Paid / Pending / Failed); plan badge (Pro / Team / Enterprise)
- `separator` — between billing sections
- `skeleton` — loading state for invoice table
- `dialog` — cancel plan confirmation
- `sonner` — "Payment method updated" toast

**Custom Components**:

| Component | Path | Status | Description |
|-----------|------|--------|-------------|
| `billing-plan-card.tsx` | `components/billing/` | `[NEW]` | Current plan: name, cycle, limits, renewal date, Manage CTA |
| `usage-meters.tsx` | `components/billing/` | `[NEW]` | Progress bars for forms used / responses used / seats used |
| `payment-method-card.tsx` | `components/billing/` | `[NEW]` | Masked card number + expiry + update button |
| `invoice-table.tsx` | `components/billing/` | `[NEW]` | Paginated invoice history table with download action |

---

### 21. Team Page (`/app/team`)

**Route**: `/app/team`
**Mockup row**: Row 11 — member table with roles
**Rendering**: CSR (`"use client"`)
**Layout group**: `(dashboard)/`
**Status**: `[PRD-ONLY]`.

**Shadcn Components**:
- `table` — member list (Name, Email, Role, Status, Joined, Actions)
- `avatar` — member avatar with initials fallback
- `badge` — role badge (Owner / Admin / Editor / Viewer); status (Active / Pending)
- `button` — "Invite member" (primary); "Resend invite" (outline); "Remove" (destructive icon)
- `select` — role selector in invite dialog + inline role-change dropdown
- `dialog` — invite member (email + role inputs); remove member confirmation
- `dropdown-menu` — per-row actions (Change role / Resend invite / Remove)
- `input` — email in invite dialog
- `sonner` — "Invite sent" / "Member removed" toasts
- `skeleton` — loading rows

**Custom Components**:

| Component | Path | Status | Description |
|-----------|------|--------|-------------|
| `member-table.tsx` | `components/team/` | `[NEW]` | Member list table with avatar + role badge + action menu |
| `invite-member-dialog.tsx` | `components/team/` | `[NEW]` | Email + role selector form; calls `POST /api/v1/team/invites` |
| `member-row.tsx` | `components/team/` | `[NEW]` | Single member row with inline role-change + remove action |

---

### 22. Activity Log Page (`/app/activity`)

**Route**: `/app/activity`
**Rendering**: CSR (`"use client"`)
**Layout group**: `(dashboard)/`
**Status**: `[PRD-ONLY]`.

**Shadcn Components**:
- `table` — activity log (Event type, Actor, Target, Timestamp, Metadata)
- `badge` — event type chip
- `select` — event type filter; date range filter
- `button` — "Export log" (outline)
- `skeleton` — loading rows
- `scroll-area` — tall table scroll

**Custom Components**:

| Component | Path | Status | Description |
|-----------|------|--------|-------------|
| `activity-table.tsx` | `components/dashboard/` | `[NEW]` | Paginated activity event table |
| `activity-filter-bar.tsx` | `components/dashboard/` | `[NEW]` | Event type + date range filter controls |

---

### 23. Default Submission Success (`/submitted`)

**Route**: `/submitted`
**Mockup row**: Derived from Row 1 success copy conventions
**Rendering**: SSR
**Layout group**: `(marketing)/`
**Polish batch**: UI-Polish-1

**Shadcn Components**:
- `card` — centered message container (optional)
- `button` — "Powered by FormSnap" (ghost, small)

**Custom Components**: None — single static component.

---

### 24. Form Detail / Inbox (`/dashboard/forms/[formId]`)

**Route**: `/dashboard/forms/[formId]`
**Mockup row**: Rows 6 (settings tab) + 7 (inbox tab)
**Rendering**: CSR (`"use client"`)
**Layout group**: `(dashboard)/`
**Polish batch**: UI-Polish-4 (inbox) + UI-Polish-5 (settings tab)

**Shadcn Components**:
- `tabs` — "Inbox" / "Settings" tab switch
- `table` — submission list (Time, Preview, Notification status, Expand)
- `badge` — email status badge
- `button` — "Export CSV"; "Save changes"; "Delete form" (destructive); row expand toggle
- `scroll-area` — submission table vertical scroll
- `skeleton` — loading rows
- `input` — form name + redirect URL in Settings tab
- `label` — field labels in Settings tab
- `textarea` — success message in Settings tab
- `separator` — between settings sections and before Danger zone
- `dialog` — delete-form confirmation
- `alert` — inbox load error; URL validation error
- `sonner` — "Settings saved" / "Copied!" / "CSV download starting" toasts

**Custom Components**:

| Component | Path | Status | Description |
|-----------|------|--------|-------------|
| `submission-table.tsx` | `components/dashboard/` | `[SHIPPED][POLISH]` | Paginated table + pagination controls |
| `submission-row.tsx` | `components/dashboard/` | `[SHIPPED][POLISH]` | Expand/collapse row |
| `submission-detail.tsx` | `components/dashboard/` | `[SHIPPED][POLISH]` | Key-value answer view |
| `email-status-badge.tsx` | `components/dashboard/` | `[SHIPPED][POLISH]` | `badge-success` / `badge-warning` / destructive |
| `csv-export-button.tsx` | `components/dashboard/` | `[SHIPPED][POLISH]` | Fetch-to-Blob download |
| `form-snippet.tsx` | `components/dashboard/` | `[SHIPPED][POLISH]` | HTML snippet code block + copy |
| `form-settings-form.tsx` | `components/dashboard/` | `[SHIPPED][POLISH]` | PATCH call + controlled inputs |
| `copy-button.tsx` | `components/dashboard/` | `[SHIPPED][POLISH]` | Reused clipboard button |
| `delete-form-dialog.tsx` | `components/dashboard/` | `[SHIPPED][POLISH]` | Reused destructive confirm |

---

## Shared / Utility Components

| Component | Path | Status | Description |
|-----------|------|--------|-------------|
| `page-header.tsx` | `components/shared/` | `[NEW]` | Reusable page title + description + action slot |
| `empty-state.tsx` | `components/shared/` | `[NEW]` | Generic empty state: icon + title + description + CTA button |
| `confirm-dialog.tsx` | `components/shared/` | `[NEW]` | Generic destructive-confirm dialog (wraps `dialog`); takes title + description + onConfirm |
| `search-input.tsx` | `components/shared/` | `[NEW]` | Search input with debounce and clear button |
| `filter-bar.tsx` | `components/shared/` | `[NEW]` | Reusable filter row: search + selects + date range |
| `data-table.tsx` | `components/shared/` | `[NEW]` | Generic `table` wrapper with toolbar slot, loading/empty slots, and pagination |
| `status-badge.tsx` | `components/shared/` | `[NEW]` | Generic status badge (maps status string → badge class from design-system.md) |
| `plan-badge.tsx` | `components/shared/` | `[NEW]` | Plan name badge (Free / Pro / Team / Enterprise) with appropriate color |
| `theme-toggle.tsx` | `components/` | `[SHIPPED]` | Light/dark mode switcher (existing) |

---

## Component Composition Patterns

### Active Nav Item (Sidebar)

```tsx
// components/dashboard/sidebar-nav.tsx — visual update for polish
<a
  href="/dashboard"
  className={cn(
    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-primary)] border-l-2 border-[var(--sidebar-primary)] -ml-px"
      : "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]"
  )}
>
  <Icon className="h-5 w-5" />
  {label}
</a>
```

### Status Badge

```tsx
// components/shared/status-badge.tsx
const STATUS_CLASSES: Record<string, string> = {
  published: "badge-published",
  draft:     "badge-draft",
  archived:  "", // use Shadcn secondary variant
  sent:      "badge-success",
  pending:   "badge-warning",
  failed:    "", // use Shadcn destructive variant
  active:    "badge-success",
  invited:   "badge-warning",
}

export function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_CLASSES[status] ?? ""
  const variant = status === "failed" || status === "archived" ? "destructive" : "outline"
  return (
    <Badge variant={variant} className={cls}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}
```

### KPI Card

```tsx
// components/dashboard/kpi-card.tsx
export function KpiCard({ label, value, delta, icon: Icon }: KpiCardProps) {
  return (
    <Card className="shadow-[var(--shadow-card)]">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-semibold">{value}</p>
            {delta && (
              <p className={cn("mt-1 text-xs", delta > 0 ? "text-[var(--color-success)]" : "text-destructive")}>
                {delta > 0 ? "+" : ""}{delta}% vs last period
              </p>
            )}
          </div>
          <div className="rounded-md bg-[var(--secondary)] p-2">
            <Icon className="h-5 w-5 text-[var(--primary)]" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

### DropdownMenu — Row Actions (safe pattern)

```tsx
<DropdownMenu>
  <DropdownMenuTrigger className="cursor-pointer p-1 rounded hover:bg-muted">
    {/* DropdownMenuTrigger renders its own button — do NOT wrap <Button> here */}
    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
    <span className="sr-only">Row actions</span>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuGroup>
      <DropdownMenuLabel className="text-xs text-muted-foreground">Actions</DropdownMenuLabel>
    </DropdownMenuGroup>
    <DropdownMenuSeparator />
    <DropdownMenuItem onSelect={...}>Edit</DropdownMenuItem>
    <DropdownMenuItem className="text-destructive" onSelect={...}>Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Primary Gradient CTA Button

```tsx
// Marketing hero CTA + Upgrade button
<Button
  className="h-11 px-6 btn-gradient border-0 hover:opacity-90"
  asChild
>
  <Link href="/sign-up">Get started free</Link>
</Button>

// App primary action (solid brand blue, not gradient)
<Button className="h-11 bg-primary text-primary-foreground hover:bg-[var(--color-brand-blue-hover)]">
  New form
</Button>
```

---

## Justification for Custom Components

| Custom Component | Reason not covered by Shadcn alone |
|------------------|------------------------------------|
| `kpi-card.tsx` | Domain-specific: icon + value + delta trend; product metric layout |
| `hero-section.tsx` | Marketing-specific layout composition with gradient CTA; single-use |
| `feature-grid.tsx` | 3-column feature card grid; single-use marketing section |
| `trust-strip.tsx` | Logo row with `opacity-60` brand logos; marketing-specific |
| `pricing-cards.tsx` | 4-tier grid with highlighted card variant; complex state for monthly/yearly |
| `builder-canvas.tsx` | Drag-and-drop field canvas; no Shadcn equivalent |
| `field-library-panel.tsx` | Categorised field type picker; product-specific |
| `field-settings-panel.tsx` | Dynamic settings panel based on selected field type; domain logic |
| `integration-card.tsx` | Vendor logo + connect/manage state; domain-specific |
| `billing-plan-card.tsx` | Plan info + usage + upgrade CTA; billing domain |
| `usage-meters.tsx` | Progress bars mapped to plan limits; billing domain |
| `member-table.tsx` | Avatar + role badge + inline role-change; team domain |
| `invite-member-dialog.tsx` | Email + role selector + API call; team domain |
| `activity-table.tsx` | Paginated event log with type badges; activity domain |
| `data-table.tsx` | Generic table wrapper reused across 5+ tables; avoids duplication |
| `empty-state.tsx` | Generic empty state reused across 6+ pages; consistent UX |
| `status-badge.tsx` | Maps domain status strings to design-system badge classes |
| `form-list.tsx` | API fetch + loading/empty/error orchestration; dashboard domain |
| `submission-table.tsx` | Pagination + API + expand state; inbox domain |
| `email-status-badge.tsx` | Maps `email_status` enum to custom badge classes |
| `csv-export-button.tsx` | Fetch-to-Blob + auth header download; domain logic |
| `form-snippet.tsx` | Endpoint-specific HTML snippet + copy; domain-specific |
| `verify-email-card.tsx` | Firebase `sendEmailVerification` + reload polling; auth domain |
