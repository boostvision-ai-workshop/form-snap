# Form Snap PRD

## 0. Visual Assets (Source of Truth for Brand & Layout)

These files are the authoritative visual reference. Phase 2 (Designer) must extract tokens, layouts, and component variants from them. Phase 3 (Engineer) must match the rendered UI against the mockup for every page delivered.

### 0.1 Product Brand Icon
- **SVG (vector, preferred)**: [`docs/prd/form-snap.svg`](./form-snap.svg)
- **Raster fallback**: [`docs/prd/format-snap.png`](./format-snap.png)
- **Palette extracted from SVG gradient** (authoritative brand palette):
  - Primary cyan: `#29B6F6`
  - Brand blue (mid-stop): `#4361EE`
  - Brand violet: `#8A2BE2`
  - Accent sparkle gradient: `#2DA9FF` → `#B62CFF`
  - Neutral surface (document body): `#F6F7FF`
  - Neutral pill / chip: `#CDD4F9`, `#DCE6FF`, `#EDEBFF`
- **Usage**:
  - App favicon + marketing header logo → use SVG.
  - OG/social share cards + email signatures → use PNG.
  - Brand color tokens in `design-system.md` must be derived from the palette above.
  - Accent buttons (primary CTA, "Publish", "Upgrade") should reuse the sparkle gradient or the brand blue `#4361EE`.

### 0.2 Full UI Reference Mockup
- **File**: [`docs/prd/formsnap_prd_design.png`](./formsnap_prd_design.png)
- **Covers** (row-by-row in the mockup):
  1. Marketing homepage (hero + "Trusted by" logo strip)
  2. Auth: Sign in / Sign up / Forgot password (3 panels)
  3. Pricing page (4 tiers, Monthly / Yearly toggle, "Most popular" highlight)
  4. App Dashboard (4 KPI cards + submissions-over-time line chart + top forms)
  5. Forms list (table with status toggle, per-row actions)
  6. Form Builder (3-column: field library / canvas / field settings)
  7. Submissions list (search + date filter + paginated table)
  8. Analytics (KPI cards + bar chart of submissions + donut of submissions by form)
  9. Settings — General tab
  10. Billing (current plan card + payment method + invoice history)
  11. Team (member table with roles)
  12. Integrations (vendor cards with Connect CTAs)
- **Rules for Designer**:
  - Layout spacing, sidebar width, header height, card border radius, and table density must match this mockup.
  - Typography hierarchy (page title → section title → card title → body → muted meta) must match.
  - Colors beyond the brand palette above (success/warn/danger, muted text, border) should be sampled from this mockup and documented in `design-system.md`.
  - Iconography style (lucide-react or equivalent) must match the mockup's line-icon aesthetic.
- **Rules for Engineer**:
  - Each page implemented in Phase 3 must be side-by-side comparable to its region in this mockup.
  - QA Phase 4 Layer 3 (UI Design) verifies against this file.

---

## 1. Product Overview

### 1.1 Product Name
**Form Snap**

### 1.2 Product Type
SaaS form builder platform

### 1.3 Product Summary
Form Snap is a SaaS product that allows users to create forms, publish them, collect submissions, analyze response data, manage integrations, collaborate with team members, and manage billing and workspace settings.

### 1.4 Product Vision
Make form creation, publishing, and submission analysis simple, fast, and professional for teams and businesses.

### 1.5 Phase Goal
This phase focuses on delivering a polished, production-style SaaS product shell with complete page coverage, realistic UX details, and strong extensibility.  
Implementation should prioritize:

1. complete information architecture  
2. polished page-level UX  
3. reusable components  
4. mock data first  
5. backend-ready structure later

---

## 2. Product Goals

### 2.1 Primary Goals
- Enable users to create and manage forms easily
- Let users collect and review submissions
- Provide analytics and response insights
- Support workspace-level settings and billing management
- Support collaboration through team and member roles
- Prepare the product for future real backend integrations

### 2.2 Non-Goals for Initial Phase
- Deep workflow automation engine
- Full advanced conditional logic builder
- Enterprise-grade audit export and SSO
- Public template marketplace
- AI-generated form creation

These can be prepared structurally but do not need full implementation in phase 1.

---

## 3. Target Users

### 3.1 Solo Creator
Needs simple forms, quick publishing, basic analytics, and affordable pricing.

### 3.2 Startup Team
Needs collaboration, integrations, form organization, export, and shared billing.

### 3.3 Operations / Marketing Team
Needs response collection, dashboards, reporting, and integrations like Sheets, Slack, and webhooks.

### 3.4 Enterprise Buyer
Needs security signals, roles, scale, billing control, support visibility, and extensibility.

---

## 4. Core User Flows

### 4.1 New User Flow
1. Visit marketing homepage
2. Click sign up
3. Create account
4. Land in dashboard
5. Create first form
6. Add fields
7. Publish form
8. Share form link
9. Receive submissions
10. View analytics and responses

### 4.2 Existing User Flow
1. Log in
2. Go to dashboard
3. Review recent activity
4. Open existing form
5. Edit / publish / inspect responses
6. View analytics
7. Manage billing or settings if needed

### 4.3 Team Admin Flow
1. Open team page
2. Invite member
3. Assign role
4. Review billing
5. Review activity log
6. Update workspace settings

---

## 5. Information Architecture

## 5.1 Public Routes
- `/`
- `/pricing`
- `/features`
- `/docs` (optional placeholder)
- `/blog` (optional placeholder)
- `/login`
- `/signup`
- `/forgot-password`

## 5.2 App Routes
- `/app/dashboard`
- `/app/forms`
- `/app/forms/new`
- `/app/forms/:formId/builder`
- `/app/forms/:formId/share`
- `/app/submissions`
- `/app/submissions/:submissionId`
- `/app/analytics`
- `/app/integrations`
- `/app/settings`
- `/app/settings/general`
- `/app/settings/security`
- `/app/settings/domains`
- `/app/settings/appearance`
- `/app/billing`
- `/app/team`
- `/app/activity`

---

## 6. Navigation Structure

## 6.1 Public Header Navigation
- Features
- Templates
- Pricing
- Docs
- Blog
- Log in
- Sign up

## 6.2 App Sidebar Navigation

### Primary
- Dashboard
- Forms
- Submissions
- Analytics

### Workflows
- Integrations
- Webhooks

### Account / Workspace
- Settings
- Billing
- Team
- Activity Log

### Footer Area
- User avatar
- Workspace switcher placeholder
- Theme switcher placeholder
- Sign out

---

## 7. Design Principles

- Clean, modern SaaS UI
- Light-first design
- Simple layout hierarchy
- Strong readability
- Reusable cards, tables, panels, tabs, modals
- Minimize visual noise
- Important actions should always be visible
- Empty states should guide next action
- All core pages should feel implementable, not decorative

---

## 8. Product Entities

## 8.1 User
Fields:
- id
- name
- email
- avatarUrl
- createdAt
- role in workspace
- lastLoginAt

## 8.2 Workspace
Fields:
- id
- name
- slug
- timezone
- language
- logoUrl
- plan
- createdAt

## 8.3 Form
Fields:
- id
- workspaceId
- name
- slug
- description
- status (`draft`, `published`, `archived`)
- theme
- fields
- settings
- publishedAt
- updatedAt
- createdBy

## 8.4 Form Field
Fields:
- id
- type
- label
- placeholder
- helpText
- required
- options
- validationRules
- order
- width
- defaultValue

Supported types:
- short_text
- long_text
- email
- phone
- number
- date
- dropdown
- multiple_choice
- checkbox
- rating
- website
- section
- divider

## 8.5 Submission
Fields:
- id
- formId
- submittedAt
- submitterMeta
- answers
- status
- source
- spamScore placeholder

## 8.6 Integration
Fields:
- id
- workspaceId
- type
- status
- config
- createdAt
- updatedAt

Supported initial types:
- Google Sheets
- Slack
- Zapier
- Webhook

## 8.7 Billing Record
Fields:
- id
- workspaceId
- plan
- amount
- currency
- billingCycle
- status
- invoiceUrl
- createdAt

## 8.8 Team Member
Fields:
- id
- userId
- workspaceId
- role
- invitedAt
- joinedAt
- status

Roles:
- Owner
- Admin
- Editor
- Viewer

---

## 9. Permission Model

## 9.1 Owner
- full workspace access
- billing access
- member management
- settings access
- delete workspace

## 9.2 Admin
- manage forms
- manage submissions
- manage integrations
- manage most settings
- invite members
- no workspace ownership transfer

## 9.3 Editor
- create and edit forms
- view submissions
- view analytics
- limited settings access

## 9.4 Viewer
- read-only access to forms, analytics, and selected responses

---

## 10. Page PRD

# 10.1 Home Page

## Route
`/`

## Purpose
Market the product, explain value, and drive sign-up.

## Sections
1. Header
2. Hero
3. Trust / logo strip
4. Product features
5. Use cases
6. Product preview
7. Templates / form examples
8. Pricing teaser
9. FAQ
10. CTA footer

## Hero Requirements
- headline
- subheadline
- primary CTA: Get started free
- secondary CTA: View demo
- product preview mockup
- small trust notes:
  - No credit card required
  - 14-day free trial
  - Easy setup

## Key Copy Direction
- fast form building
- better response collection
- analytics visibility
- teamwork and integrations

## States
- default marketing state only

## Success Metric
- sign-up CTA click-through

---

# 10.2 Pricing Page

## Route
`/pricing`

## Purpose
Convert users into paid plans.

## Pricing Tiers
- Free
- Pro
- Team
- Enterprise

## Required UI
- monthly / yearly toggle
- pricing cards
- highlighted recommended plan
- feature comparison summary
- FAQ
- CTA buttons

## Example Features by Plan

### Free
- up to 3 forms
- limited responses / month
- basic templates
- CSV export
- branding included

### Pro
- unlimited forms
- higher response limits
- advanced fields
- file upload
- remove branding
- custom redirects

### Team
- collaboration
- shared workspace
- role management
- priority support
- advanced integrations

### Enterprise
- custom limits
- dedicated support
- SSO placeholder
- security review
- custom contract

## Actions
- Get started
- Start free trial
- Contact sales

## States
- normal
- current plan highlighted
- downgrade / upgrade state placeholder

---

# 10.3 Login Page

## Route
`/login`

## Purpose
Authenticate returning users.

## Required Fields
- email
- password

## Secondary Options
- Continue with Google
- Continue with GitHub
- Forgot password link
- Link to sign up

## Validation
- invalid email format
- empty password
- auth failure state

## Actions
- Sign in
- OAuth buttons

## Success Result
Redirect to `/app/dashboard`

---

# 10.4 Sign Up Page

## Route
`/signup`

## Purpose
Create new account.

## Required Fields
- full name
- email
- password

## Optional
- workspace name
- accept terms checkbox

## Secondary Options
- Continue with Google
- Continue with GitHub
- Link to login

## Validation
- valid email
- password min length
- duplicate email state
- required checkbox if shown

## Success Result
Redirect to onboarding-lite or dashboard

---

# 10.5 Forgot Password Page

## Route
`/forgot-password`

## Purpose
Start password reset flow.

## Required Fields
- email

## States
- idle
- loading
- success
- email not found placeholder

## Success Message
“If an account exists for this email, a password reset link has been sent.”

---

# 10.6 App Dashboard

## Route
`/app/dashboard`

## Purpose
Give users a quick operational overview.

## Top Summary Cards
- Total submissions
- Form views
- Completion rate
- Avg. response time

## Main Sections
1. summary metrics
2. submissions over time chart
3. top forms
4. recent activity
5. quick actions

## Quick Actions
- Create form
- View submissions
- Open analytics
- Upgrade plan

## Widgets
- recent forms
- recent submissions
- plan usage teaser

## Empty State
No forms created yet:
- message
- create first form button
- optional template CTA

---

# 10.7 Forms List Page

## Route
`/app/forms`

## Purpose
View and manage all forms.

## Required Components
- page header
- create form button
- search bar
- filters
- forms table/list
- bulk actions placeholder

## Table Columns
- Name
- Status
- Responses
- Views
- Updated
- Actions

## Row Actions
- Edit
- Share
- View submissions
- Duplicate
- Archive
- Delete

## Filters
- all
- draft
- published
- archived

## Empty State
- no forms yet
- create form CTA
- browse templates CTA placeholder

---

# 10.8 Create Form Page

## Route
`/app/forms/new`

## Purpose
Let users create a new form quickly.

## Creation Options
- Start from scratch
- Use template
- Duplicate existing form

## Initial Inputs
- form name
- optional description

## Success Result
redirect to form builder

---

# 10.9 Form Builder

## Route
`/app/forms/:formId/builder`

## Purpose
Core product experience for building and editing forms.

## Layout
Three-column layout:

### Left Panel
Field library
- Short text
- Long text
- Email
- Phone
- Number
- Date
- Dropdown
- Multiple choice
- Checkbox
- Rating
- Website
- Section
- Divider

### Center Panel
Live form canvas / preview

### Right Panel
Selected field settings

## Top Bar Actions
- Back to forms
- Form title
- Save
- Preview
- Publish
- More actions menu

## Field Settings
Common:
- label
- placeholder
- help text
- required
- hidden placeholder
- width placeholder

Type-specific:
- options list
- default value
- validation
- min/max for number
- email format
- phone format
- date constraints

## Form-Level Tabs
- Editor
- Settings
- Share
- Responses count preview

## Form Settings Tab
- form name
- description
- success message
- submit button text
- redirect URL
- close after submission toggle
- collect partial responses placeholder
- anti-spam placeholder

## Share Tab
- public link
- copy link button
- embed code placeholder
- custom domain placeholder

## Builder Actions
- add field
- remove field
- duplicate field
- reorder field placeholder
- save draft
- publish

## States
- draft
- unsaved changes
- published
- archived

## Validation
- form must have at least 1 field before publish
- required labels must not be empty
- option-based fields must contain at least 1 option

## Empty Builder State
- no fields added yet
- prompt to add first field

---

# 10.10 Submissions List Page

## Route
`/app/submissions`

## Purpose
Review all collected submissions.

## Required Components
- search
- filters
- form selector
- date range selector
- export button
- submissions table

## Table Columns
- Submission ID or short identifier
- Form
- Submitted at
- Submitter email if available
- Status
- Actions

## Filters
- all forms
- date range
- status
- newest / oldest

## Row Actions
- View details
- Export row placeholder
- Mark spam placeholder
- Delete placeholder

## Empty State
- no submissions yet
- link to publish a form

---

# 10.11 Submission Detail Page

## Route
`/app/submissions/:submissionId`

## Purpose
Inspect one response in detail.

## Required Sections
- submission header
- form info
- timestamp
- submitter metadata
- answers list
- raw payload placeholder
- activity / notes placeholder

## Answer Display
Each field should show:
- field label
- answer value
- field type if useful

## Actions
- back to submissions
- export
- delete
- mark spam placeholder

---

# 10.12 Analytics Page

## Route
`/app/analytics`

## Purpose
Show aggregated performance metrics.

## KPI Cards
- total submissions
- total views
- completion rate
- drop-off rate

## Charts
- submissions over time
- views over time
- submissions by form
- completion by form

## Filters
- date range
- form selector
- workspace-wide vs single form placeholder

## Insight Blocks
- top performing form
- lowest completion form
- trend change vs previous period

## Empty State
- not enough data yet

---

# 10.13 Integrations Page

## Route
`/app/integrations`

## Purpose
Manage third-party connections.

## Integration Cards
- Google Sheets
- Slack
- Zapier
- Webhooks

## Per-card Details
- name
- status
- short description
- connect/manage button

## States
- not connected
- connected
- error placeholder

## Required Interactions
- connect button
- disconnect button placeholder
- open settings modal placeholder
- test connection placeholder

---

# 10.14 Webhooks Page

## Route
Could be grouped under integrations or standalone tab

## Purpose
Manage outbound webhook endpoints.

## Required Fields
- endpoint URL
- secret placeholder
- event types
- enabled toggle

## Event Types
- submission.created
- form.published
- form.updated placeholder

## Table/List
- endpoint
- event types
- status
- last delivery placeholder
- actions

---

# 10.15 Settings - General

## Route
`/app/settings/general`

## Purpose
Manage workspace-level preferences.

## Fields
- workspace name
- timezone
- language
- logo upload placeholder
- default submission locale placeholder

## Actions
- Save changes

---

# 10.16 Settings - Security

## Route
`/app/settings/security`

## Purpose
Manage security settings.

## Sections
- password change placeholder
- session management placeholder
- 2FA placeholder
- login history placeholder

## Phase 1
Mostly UI shell and placeholders

---

# 10.17 Settings - Domains

## Route
`/app/settings/domains`

## Purpose
Manage branded domains for forms.

## Fields
- custom domain input
- verification status placeholder
- DNS instructions placeholder

## States
- no domain
- pending verification
- verified
- failed verification

---

# 10.18 Settings - Appearance

## Route
`/app/settings/appearance`

## Purpose
Manage workspace appearance and branding.

## Fields
- theme mode placeholder
- brand color placeholder
- logo placeholder
- form style preview placeholder

---

# 10.19 Billing Page

## Route
`/app/billing`

## Purpose
Manage plan, payment method, and invoice history.

## Required Sections
1. current plan card
2. billing cycle
3. usage summary
4. payment method
5. invoice history
6. upgrade / downgrade actions

## Current Plan Card
- plan name
- monthly or yearly
- included limits
- renewal date
- manage plan CTA

## Usage Summary
- forms used
- responses used
- seats used

## Payment Method
- masked card
- expiry
- update payment method button placeholder

## Invoice History Table
- invoice date
- description
- amount
- status
- download action

## States
- free plan
- paid plan
- failed payment placeholder
- canceled plan placeholder

---

# 10.20 Team Page

## Route
`/app/team`

## Purpose
Manage workspace members.

## Required Sections
- invite member button
- member table/list
- roles
- pending invites placeholder

## Member List Columns
- name
- email
- role
- status
- joined date
- actions

## Actions
- change role
- resend invite
- remove member

## Invite Modal
Fields:
- email
- role

---

# 10.21 Activity Log Page

## Route
`/app/activity`

## Purpose
Provide visibility into important workspace events.

## Event Types
- form created
- form updated
- form published
- submission received
- member invited
- plan changed

## Table/List Fields
- event type
- actor
- target
- timestamp
- metadata summary

## Filters
- event type
- date range
- actor placeholder

---

## 11. Shared UX Rules

### 11.1 Loading States
Every page should have:
- skeleton or loading placeholder
- async action loading button states

### 11.2 Empty States
Every data page should provide:
- clear explanation
- contextual CTA

### 11.3 Error States
Use inline alerts or banners for:
- failed save
- failed publish
- failed connection
- failed billing placeholder

### 11.4 Success Feedback
Use toast or inline confirmation for:
- form saved
- form published
- settings updated
- member invited
- billing updated placeholder

### 11.5 Confirmation Dialogs
Needed for:
- delete form
- archive form
- remove member
- disconnect integration

---

## 12. Form Status Model

### Draft
Form is editable and not public

### Published
Form is public and can collect submissions

### Archived
Form is inactive and hidden from normal workflows

---

## 13. Submission Data Model UX

Each submission should optionally include:
- submittedAt
- IP/location placeholder
- browser/device placeholder
- referral/source placeholder
- form name
- answer map

Display should support:
- human-readable answer view
- raw JSON placeholder for future dev tools

---

## 14. Analytics Definitions

### Total Submissions
Count of successful submissions in selected date range

### Form Views
Count of public form visits

### Completion Rate
submissions / views

### Drop-off Rate
1 - completion rate

### Avg. Response Time
Average time taken to complete a form, placeholder in phase 1

---

## 15. Billing Logic

### Plans
- Free
- Pro
- Team
- Enterprise

### Billing Cycles
- Monthly
- Yearly

### Access Control
Only Owner and maybe Admin can access billing

### Upgrade Entry Points
- pricing page
- dashboard usage CTA
- billing page

---

## 16. Notifications Model

Phase 1 can use mock notification center or simple toasts.

Potential event notifications:
- new submission received
- invite accepted
- payment issue placeholder
- integration failed placeholder

---

## 17. Search and Filtering Rules

### Forms
Search by:
- form name
- description placeholder

### Submissions
Search by:
- form name
- submitter email
- submission id

### Activity
Search/filter by:
- event type
- actor
- date

---

## 18. Reusable Component Inventory

The implementation should aim to use or create reusable components for:

- AppLayout
- PublicLayout
- Sidebar
- Header
- PageHeader
- SummaryCard
- StatsCard
- Table
- DataTable Toolbar
- FilterBar
- SearchInput
- Modal
- ConfirmDialog
- Tabs
- EmptyState
- IntegrationCard
- PricingCard
- PlanBadge
- StatusBadge
- MemberAvatarRow
- FormFieldCard
- BuilderCanvas
- BuilderSidebar
- FieldSettingsPanel
- ChartCard
- UsageMeter
- BillingCard
- InvoiceTable

---

## 19. Mock Data Requirements

Until real backend is connected, use realistic mock data for:
- users
- workspaces
- forms
- submissions
- analytics
- billing history
- team members
- integrations
- activity log

Mock data should be centralized and typed.

Suggested structure:
- `mocks/forms.ts`
- `mocks/submissions.ts`
- `mocks/analytics.ts`
- `mocks/billing.ts`
- `mocks/team.ts`
- `mocks/activity.ts`

---

## 20. Technical Architecture Expectations

The codebase should be prepared for:
- auth integration
- database integration
- billing provider integration
- analytics storage
- webhook events
- role-based access

### General Expectations
- modular routes
- reusable components
- typed models
- no over-engineering
- clear folder boundaries
- mock-first, backend-ready

---

## 21. Suggested Folder / Domain Structure

```txt
src/
  app/
    (public)/
    (auth)/
    (dashboard)/
  components/
    ui/
    shared/
    marketing/
    dashboard/
    forms/
    billing/
    team/
  features/
    auth/
    forms/
    submissions/
    analytics/
    billing/
    settings/
    team/
    integrations/
  mocks/
  types/
  lib/
  docs/
```

---

## 22. Phase Breakdown

# Phase 1 — UI Shell + Full Page Coverage
Deliver:
- public pages
- auth pages
- dashboard shell
- forms list
- builder v1
- submissions list/detail
- analytics page
- integrations page
- settings pages
- billing page
- team page
- activity page
- mock data
- reusable components

# Phase 2 — Real Functionality
Deliver:
- real auth
- real CRUD for forms
- form schema persistence
- real submissions
- real analytics aggregation
- real billing integration
- real team invites
- real webhooks/integrations

# Phase 3 — Advanced Product Features
Possible:
- drag-and-drop builder
- conditional logic
- template library
- custom domains
- anti-spam
- file upload
- advanced permissions
- audit exports

---

## 23. Acceptance Criteria

### Product-Level Acceptance
- all major routes exist
- each route feels production-like, not placeholder-only
- layouts are consistent
- mock data is believable
- navigation is complete
- actions and states are represented
- forms product experience is coherent
- billing/settings/team are not ignored
- implementation is extensible

### Builder Acceptance
- can add fields
- can edit common field settings
- can preview form
- can save draft state
- can show publish state

### Dashboard Acceptance
- KPI cards visible
- chart visible
- top forms visible
- empty state available

### Billing Acceptance
- current plan visible
- payment method visible
- invoices visible
- upgrade CTA visible

### Team Acceptance
- members shown
- roles shown
- invite flow represented

---

## 24. Copy Direction

Tone:
- modern
- clear
- calm
- professional
- not overly corporate
- not too playful

Examples:
- “Create forms that convert.”
- “Collect responses without friction.”
- “Publish in minutes. Analyze instantly.”
- “Built for teams that move fast.”

---

## 25. Accessibility Requirements

- semantic headings
- keyboard-focusable controls
- visible focus states
- sufficient contrast
- label-input association
- form validation messages should be readable
- interactive elements should not rely on color only

---

## 26. Performance Expectations

Even in mock phase:
- avoid heavy page bloat
- component reuse over duplication
- charts should be lightweight
- avoid unnecessary complex state machinery

---

## 27. Future Integrations Preparation

The implementation should leave room for:
- Stripe
- Supabase / Postgres
- Clerk / Auth provider
- Resend / email provider
- Slack API
- Google Sheets sync
- webhook delivery service

---

## 28. Developer Notes for Implementation

1. Reuse existing template layout and design system as much as possible  
2. Prefer adapting existing cards, tables, charts, tabs, and forms over rebuilding  
3. Keep route naming consistent  
4. Use typed mock data and avoid hardcoding random structures across pages  
5. Create shared state patterns only when justified  
6. Builder schema should be isolated from visual components  
7. Use clean page-level sections and strong empty/error/loading states  
8. Avoid fake complexity; prioritize believable SaaS UX

---

## 29. Implementation Order Recommendation

1. branding and navigation
2. route scaffolding
3. home + pricing
4. auth pages
5. dashboard
6. forms list
7. builder v1
8. submissions
9. analytics
10. integrations
11. settings
12. billing
13. team
14. activity log

---

## 30. Deliverables Required from the Coding Agent

The coding agent should produce:

- working route structure
- reusable page components
- typed mock data
- page-level UX states
- clear folder organization
- reasonable placeholder interactions
- implementation notes where backend will later plug in

Optional docs:
- `docs/form-snap-page-map.md`
- `docs/form-snap-data-model.md`
- `docs/form-snap-phase-plan.md`

---

## 31. Final Instruction to Implementation Agent

Build Form Snap as a polished, realistic SaaS product using the existing template architecture.  
Do not treat pages like flat mockups.  
Treat them like real product surfaces with:
- information hierarchy
- user actions
- realistic states
- internal consistency
- extensible component design

Start with mock data, but structure everything so the product can evolve into a real full-stack SaaS app.

---

## Execution Note for Claude Code / OpenCode

```text
Use the existing template as the base architecture and transform it into Form Snap.

Read docs/form-snap-prd.md first.

Execution rules:
1. Reuse as much of the current template as possible.
2. Do not rebuild components that already exist in a similar form.
3. Implement complete route coverage first.
4. Use typed mock data.
5. Prioritize realistic SaaS UX details: empty states, loading states, action buttons, filters, status badges, tables, tabs, and settings panels.
6. The Form Builder is the core feature and should be implemented as a scalable v1.
7. Billing, Team, Settings, and Activity pages must feel complete, not ignored.
8. Keep architecture modular and backend-ready.
9. Avoid over-engineering and avoid inventing unnecessary product complexity.
10. When uncertain, choose the most practical SaaS-standard pattern.
```
