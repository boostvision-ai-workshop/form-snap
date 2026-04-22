# Page Layouts — FormSnap

> Design source: **Priority 0 (mockup `docs/prd/formsnap_prd_design.png` + SVG)**.
> Every layout below references a specific row in the mockup PNG.
> Spacing, sidebar width, header height, card radius, and table density are sampled from
> the mockup and MUST match it side-by-side (per QA Layer 3).
>
> All color values use CSS variable names from `design-system.md`. No hex values in this file.

---

## Layout Pattern Reference

### Public / Marketing Layout

**File**: `frontend/src/app/(marketing)/layout.tsx`
**Mockup chrome**: Row 1 header conventions.

```
<div class="min-h-screen flex flex-col bg-[var(--background)]">   ← lavender bg #F6F7FF
  <MarketingHeader />    ← sticky top-0 z-50; white bg; bottom border; h-16
  <main class="flex-1">
    {children}
  </main>
  <MarketingFooter />
</div>
```

**MarketingHeader** (`h-16` = 64px, white `bg-card`, `border-b border-[var(--border)]`):
```
<header class="sticky top-0 z-50 w-full bg-card border-b border-[var(--border)]">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
    ├── Logo (SVG icon + "FormSnap" wordmark, links to /)
    ├── nav.hidden.md:flex.items-center.gap-6
    │   ├── <a> Features
    │   ├── <a> Templates
    │   ├── <a> Pricing
    │   └── <a> Docs
    └── div.flex.items-center.gap-3
        ├── Button (ghost, sm) "Sign in" → /sign-in
        └── Button (primary, sm, bg-primary h-9) "Sign up" → /sign-up
  </div>
</header>
```

---

### Auth Layout

**File**: `frontend/src/app/(auth)/layout.tsx`
**Mockup chrome**: Row 2 — full-screen lavender background, centered white card.

```
<div class="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
  {children}          ← Card (max-w-md w-full, white, shadow-[var(--shadow-dialog)], rounded-lg)
</div>
```

Used for: `/sign-in`, `/sign-up`, `/forgot-password`, `/verify-email`

---

### Dashboard Layout

**File**: `frontend/src/app/(dashboard)/layout.tsx`
**Mockup chrome**: Rows 4–12 sidebar + header chrome.

```
<div class="flex h-screen overflow-hidden bg-[var(--background)]">
  <Sidebar />                         ← w-60 (240px) fixed left; Sheet on < lg:; white bg
  <div class="flex flex-col flex-1 min-w-0 overflow-hidden">
    <DashboardHeader />               ← h-14 (56px) white; border-b; sticky
    <main class="flex-1 overflow-y-auto p-6">
      {children}
    </main>
  </div>
</div>
```

**Sidebar** (w-60, `bg-card`, `border-r border-[var(--sidebar-border)]`):
```
Sidebar
├── div.h-14.flex.items-center.px-4.border-b — Logo: SVG icon (h-6 w-6) + "FormSnap" (font-semibold)
├── ScrollArea.flex-1.py-4
│   └── SidebarNav
│       ├── nav group "Primary"
│       │   ├── NavItem: Dashboard → /app/dashboard
│       │   ├── NavItem: Forms → /app/forms
│       │   ├── NavItem: Submissions → /app/submissions
│       │   └── NavItem: Analytics → /app/analytics
│       ├── Separator.my-2
│       ├── nav group "Workflows"
│       │   ├── NavItem: Integrations → /app/integrations
│       │   └── NavItem: Webhooks → /app/integrations/webhooks
│       ├── Separator.my-2
│       └── nav group "Workspace"
│           ├── NavItem: Settings → /app/settings/general
│           ├── NavItem: Billing → /app/billing
│           ├── NavItem: Team → /app/team
│           └── NavItem: Activity Log → /app/activity
└── div.border-t.p-3 — UserMenu (bottom-pinned)
    └── DropdownMenu
        ├── Trigger: div.flex.items-center.gap-2.rounded-md.p-2.hover:bg-accent
        │   ├── Avatar (initials fallback, h-8 w-8)
        │   └── div
        │       ├── p.text-sm.font-medium — user display name
        │       └── p.text-xs.text-muted-foreground — user email
        └── DropdownMenuContent
            ├── DropdownMenuGroup
            │   └── DropdownMenuLabel — "My account"
            ├── DropdownMenuSeparator
            ├── DropdownMenuItem — "Settings" → /app/settings/general
            ├── DropdownMenuSeparator
            └── DropdownMenuItem — "Sign out"
```

**Nav item active state** (from mockup):
```
active:   bg-[var(--sidebar-accent)] text-[var(--sidebar-primary)] font-medium
          border-l-2 border-[var(--sidebar-primary)] -ml-[2px]
inactive: text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]
```

**DashboardHeader** (`h-14`, `bg-card`, `border-b border-[var(--border)]`):
```
<header class="h-14 border-b border-[var(--border)] bg-card flex items-center px-6 gap-4">
  ├── Button (ghost, icon, lg: hidden) — hamburger → opens Sheet sidebar
  ├── slot: page title / breadcrumb (passed from page)
  ├── div.flex-1
  └── div.flex.items-center.gap-2
      ├── ThemeToggle
      └── [notification bell — placeholder]
```

**Mobile sidebar**: `<Sheet side="left">` with same Sidebar content; triggered by hamburger button in header. Breakpoint: `lg:` (1024px).

---

## Pages

---

### Marketing Landing Page (`/`)

**Route**: `/`
**Mockup row**: Row 1 — hero + "Trusted by" logo strip
**Layout**: Marketing
**Rendering**: SSR
**Polish batch**: UI-Polish-1

#### Component Hierarchy

```
MarketingLayout
├── MarketingHeader (sticky, h-16, white)
└── main
    ├── HeroSection
    │   └── section.py-24.lg:py-32 (lavender bg — inherits --background)
    │       └── div.max-w-6xl.mx-auto.px-4.sm:px-6.lg:px-8
    │           └── div.text-center.max-w-3xl.mx-auto
    │               ├── Badge (secondary variant, rounded-full) "Free to start"
    │               ├── h1.text-5xl.font-bold.leading-tight.mt-4
    │               │   "The modern way to collect anything"
    │               ├── p.text-lg.text-muted-foreground.mt-4.leading-relaxed
    │               │   — hero sub-copy
    │               ├── div.flex.flex-col.sm:flex-row.gap-4.justify-center.mt-8
    │               │   ├── Button (btn-gradient, h-11, px-8) "Get started free" → /sign-up
    │               │   └── Button (outline, h-11, px-8) "View demo"
    │               ├── p.text-sm.text-muted-foreground.mt-4
    │               │   "No credit card required · 14-day free trial · Easy setup"
    │               └── div.mt-12 — product preview card
    │                   (white card, shadow-[var(--shadow-dialog)], rounded-xl, border)
    │                   showing form builder / dashboard screenshot mockup
    │
    ├── TrustStrip
    │   └── section.py-12.border-y.border-[var(--border)]
    │       └── div.max-w-6xl.mx-auto.px-4
    │           ├── p.text-center.text-sm.text-muted-foreground "Trusted by teams at"
    │           └── div.flex.items-center.justify-center.gap-12.mt-6.opacity-60
    │               — placeholder brand logo slots (SVG or text)
    │
    ├── FeatureGrid
    │   └── section.py-20
    │       └── div.max-w-6xl.mx-auto.px-4
    │           ├── div.text-center.mb-12
    │           │   ├── h2.text-3xl.font-bold "Simple, powerful forms"
    │           │   └── p.text-muted-foreground.mt-3
    │           └── div.grid.grid-cols-1.md:grid-cols-2.lg:grid-cols-3.gap-6
    │               └── Card[] (6 feature cards)
    │                   └── CardContent.p-6
    │                       ├── div.rounded-md.bg-secondary.p-2.w-fit — icon
    │                       ├── h3.font-semibold.mt-4
    │                       └── p.text-sm.text-muted-foreground.mt-2
    │
    ├── PricingTeaser (abbreviated 4-tier row, links to /pricing)
    │
    └── CTAFooter
        └── section.py-20.bg-primary.text-primary-foreground
            └── div.max-w-2xl.mx-auto.text-center.px-4
                ├── h2.text-3xl.font-bold "Start building for free"
                ├── p.mt-4
                └── Button (btn-gradient, h-11, px-8, mt-8) "Get started free"
```

#### Responsive Behavior

| Breakpoint | Layout change |
|------------|--------------|
| Mobile (< 640px) | Hero single column; feature grid 1 col; CTA buttons stacked; nav links hidden |
| Tablet (≥ 768px `md:`) | Feature grid 2 cols; hero sub-copy tighter |
| Desktop (≥ 1024px `lg:`) | Feature grid 3 cols; hero paddings increase; nav links visible in header |

**Content max-width**: `max-w-6xl mx-auto` (1152px) on all sections.

#### Dark Mode
Inherits `next-themes`. Hero background is `--background` (deep navy in dark mode). Feature cards use `bg-card`. No page-level overrides.

#### Interactions
- "Get started free" and "Sign up" navigate to `/sign-up`.
- "View demo" — modal video or scroll to product preview section.

---

### Pricing Page (`/pricing`)

**Route**: `/pricing`
**Mockup row**: Row 3 — 4-tier cards, monthly/yearly toggle, "Most popular" highlight
**Layout**: Marketing
**Rendering**: SSR shell + `"use client"` for toggle
**Polish batch**: UI-Polish-1

#### Component Hierarchy

```
MarketingLayout
└── main
    └── section.py-20
        └── div.max-w-6xl.mx-auto.px-4
            ├── div.text-center.mb-10
            │   ├── h1.text-4xl.font-bold "Simple, transparent pricing"
            │   └── p.text-muted-foreground.mt-3
            ├── BillingToggle (Monthly / Yearly switch + "Save 20%" badge)
            │   └── div.flex.items-center.justify-center.gap-4.mt-6
            │       ├── span "Monthly"
            │       ├── Switch (controlled, updates price display)
            │       └── span "Yearly"  Badge "Save 20%"
            └── div.grid.grid-cols-1.md:grid-cols-2.lg:grid-cols-4.gap-6.mt-10
                ├── PricingCard (Free)
                ├── PricingCard (Pro)  ← "Most popular" — blue bg, white text, badge
                ├── PricingCard (Team)
                └── PricingCard (Enterprise)
```

**PricingCard "Most popular"** (from mockup):
- `bg-primary text-primary-foreground` fills card (brand blue background)
- Badge "Most popular" — white text on darker blue
- CTA button — `btn-gradient` (sparkle gradient) on white background or inverted
- Border: none (filled card is self-contained)

#### Responsive Behavior

| Breakpoint | Layout |
|------------|--------|
| Mobile | 1-column stacked cards |
| Tablet (≥ 768px) | 2-column grid |
| Desktop (≥ 1024px) | 4-column grid |

---

### Sign-up Page (`/sign-up`)

**Route**: `/sign-up`
**Mockup row**: Row 2 — auth composition (sign-up panel)
**Layout**: Auth (centered card)
**Rendering**: SSR shell + `"use client"` in `signup-form.tsx`
**Polish batch**: UI-Polish-2

#### Component Hierarchy

```
AuthLayout (lavender bg, flex center)
└── Card (max-w-md w-full, bg-card, shadow-[var(--shadow-dialog)], rounded-lg, border)
    ├── CardHeader.p-6.pb-0
    │   ├── div.flex.justify-center.mb-4 — Logo SVG (h-8 w-8) + wordmark
    │   ├── CardTitle.text-xl.font-semibold.text-center "Create your account"
    │   └── CardDescription.text-center.text-sm.text-muted-foreground
    │       "Start collecting form submissions in minutes."
    └── CardContent.p-6
        └── SignupForm
            ├── div.space-y-4
            │   ├── div.space-y-1.5
            │   │   ├── Label (text-sm font-medium) "Full name"
            │   │   └── Input (h-9, rounded-md) placeholder="Jane Smith"
            │   ├── div.space-y-1.5
            │   │   ├── Label "Email"
            │   │   └── Input type="email" placeholder="you@example.com"
            │   ├── div.space-y-1.5
            │   │   ├── Label "Password"
            │   │   └── InputGroup
            │   │       ├── Input type="password|text"
            │   │       └── suffix: Button (ghost, icon, h-9) eye / eye-off icon
            │   └── Alert (destructive, hidden until error)
            │       └── AlertDescription — error message
            ├── div.space-y-3.mt-6
            │   ├── Button (w-full, h-11, bg-primary) "Create account" [loading: spinner]
            │   └── SocialButtons (optional: "Continue with Google")
            └── p.text-center.text-sm.text-muted-foreground.mt-4
                "Already have an account?"
                Button (variant="link", text-primary) "Sign in" → /sign-in
```

#### Responsive Behavior

| Breakpoint | Layout |
|------------|--------|
| Mobile (< 640px) | Card `w-full mx-4`; full width |
| Tablet / Desktop (≥ 640px) | Card `max-w-md` centered |

#### Interactions
- Submit: loading spinner in button, all inputs disabled.
- Success: redirect to `/verify-email`.
- Error: `alert` appears above buttons with Firebase error message.

---

### Sign-in Page (`/sign-in`)

**Route**: `/sign-in`
**Mockup row**: Row 2 — auth left panel
**Layout**: Auth (centered card)
**Rendering**: SSR shell + `"use client"` in `login-form.tsx`
**Polish batch**: UI-Polish-2

#### Component Hierarchy

```
AuthLayout
└── Card (max-w-md w-full)
    ├── CardHeader.p-6.pb-0
    │   ├── Logo centered
    │   ├── CardTitle "Sign in"
    │   └── CardDescription "Welcome back."
    └── CardContent.p-6
        └── LoginForm
            ├── div.space-y-4
            │   ├── div.space-y-1.5
            │   │   ├── Label "Email"
            │   │   └── Input type="email"
            │   ├── div.space-y-1.5
            │   │   ├── div.flex.items-center.justify-between
            │   │   │   ├── Label "Password"
            │   │   │   └── Button (variant="link", text-xs, text-primary) "Forgot password?"
            │   │   └── InputGroup
            │   │       ├── Input type="password|text"
            │   │       └── suffix: Button (ghost, icon) eye toggle
            │   └── Alert (destructive, hidden until error)
            ├── div.space-y-3.mt-6
            │   ├── Button (w-full, h-11, bg-primary) "Sign in"
            │   └── SocialButtons (optional)
            └── p.text-center.text-sm.text-muted-foreground.mt-4
                "Don't have an account?"
                Button (link) "Sign up" → /sign-up
```

#### Interactions
- "Forgot password?" calls Firebase `sendPasswordResetEmail`; replaces alert slot with
  "Reset email sent — check your inbox." success message.
- Success: redirect to `/app/dashboard` (or return URL query param).

---

### Forgot Password Page (`/forgot-password`)

**Route**: `/forgot-password`
**Mockup row**: Row 2 — auth middle panel
**Layout**: Auth (centered card)
**Polish batch**: UI-Polish-2

#### Component Hierarchy

```
AuthLayout
└── Card (max-w-md w-full)
    ├── CardHeader
    │   ├── Logo
    │   ├── CardTitle "Reset your password"
    │   └── CardDescription "Enter your email and we'll send a reset link."
    └── CardContent
        └── ForgotPasswordForm
            ├── [idle state]
            │   ├── div.space-y-1.5
            │   │   ├── Label "Email"
            │   │   └── Input type="email"
            │   └── Button (w-full, h-11, bg-primary) "Send reset link"
            ├── [success state]
            │   └── Alert (default / success color)
            │       "If an account exists, a reset link has been sent."
            └── Button (link, w-full, mt-4) "Back to sign in" → /sign-in
```

---

### Verify Email Reminder (`/verify-email`)

**Route**: `/verify-email`
**Mockup row**: Derived from Row 2 auth card conventions
**Layout**: Auth (centered card)
**Rendering**: CSR (`"use client"`)
**Polish batch**: UI-Polish-2

#### Component Hierarchy

```
AuthLayout
└── VerifyEmailCard
    └── Card (max-w-md w-full)
        ├── CardHeader.text-center
        │   ├── div — mail icon (h-10 w-10, text-primary, mx-auto)
        │   ├── CardTitle "Check your inbox"
        │   └── CardDescription "We sent a link to {user.email}"
        └── CardContent
            ├── p.text-sm.text-muted-foreground.text-center
            │   "Click the link in your email to verify your account."
            ├── div.flex.flex-col.gap-3.mt-6
            │   ├── Button (w-full, h-11, bg-primary) "Resend verification email"
            │   │   [sent: "Sent! Check your inbox", disabled for 60s]
            │   └── Button (w-full, h-11, outline) "I've verified — go to dashboard"
            └── Alert (hidden; success / error) — shows after button clicks
```

---

### App Dashboard (`/app/dashboard`)

**Route**: `/app/dashboard`
**Mockup row**: Row 4 — 4 KPI cards + submissions-over-time chart + top forms
**Layout**: Dashboard (sidebar + header + main)
**Rendering**: CSR (`"use client"`)

#### Component Hierarchy

```
DashboardLayout
└── main.p-6
    ├── PageHeader
    │   ├── h1.text-xl.font-semibold "Dashboard"
    │   └── Button (h-11, btn-gradient) "Create form" → opens CreateFormDialog
    │
    ├── div.grid.grid-cols-1.sm:grid-cols-2.lg:grid-cols-4.gap-6.mt-6
    │   ├── KpiCard (Total submissions, value, +delta%)
    │   ├── KpiCard (Form views, value, +delta%)
    │   ├── KpiCard (Completion rate, value%, +delta%)
    │   └── KpiCard (Avg. response time, value, delta%)
    │
    ├── div.grid.grid-cols-1.lg:grid-cols-3.gap-6.mt-6
    │   ├── Card.lg:col-span-2 — SubmissionsChart
    │   │   ├── CardHeader
    │   │   │   ├── CardTitle "Submissions over time"
    │   │   │   └── [time range tabs: 7d / 30d / 90d]
    │   │   └── CardContent — line chart (recharts), brand blue series
    │   └── Card — TopFormsList
    │       ├── CardHeader CardTitle "Top forms"
    │       └── CardContent — 5-row list: form name + count + sparkline
    │
    └── div.grid.grid-cols-1.md:grid-cols-2.gap-6.mt-6
        ├── Card — RecentActivity (latest 5 events)
        └── Card — QuickActions (4 action buttons)
            └── div.grid.grid-cols-2.gap-3
                ├── Button (outline, h-11) "Create form"
                ├── Button (outline, h-11) "View submissions"
                ├── Button (outline, h-11) "Open analytics"
                └── Button (btn-gradient, h-11) "Upgrade plan"
```

#### Responsive Behavior

| Breakpoint | Layout |
|------------|--------|
| Mobile | All sections single column; charts at `h-[200px]` |
| Tablet (≥ 768px) | KPI cards 2-column |
| Desktop (≥ 1024px) | KPI cards 4-column; chart takes lg:col-span-2 |

---

### Forms List (`/dashboard` shipped / `/app/forms`)

**Route**: `/dashboard` (Batches 1–4) or `/app/forms`
**Mockup row**: Row 5 — table with status toggle, per-row action menu
**Layout**: Dashboard
**Rendering**: CSR (`"use client"`)
**Polish batch**: UI-Polish-3

#### Component Hierarchy

```
DashboardLayout
└── main.p-6
    ├── div.flex.items-center.justify-between.mb-6
    │   ├── div
    │   │   ├── h1.text-xl.font-semibold "Forms"
    │   │   └── p.text-sm.text-muted-foreground "Manage your forms"
    │   └── Button (h-11, bg-primary) "New form" → opens CreateFormDialog
    │       [disabled + Tooltip when email_verified=false]
    │
    ├── EmailVerificationGate (Alert banner, visible only when unverified)
    │
    ├── FormsToolbar
    │   └── div.flex.items-center.gap-3.mb-4
    │       ├── SearchInput (w-72, placeholder "Search forms…")
    │       ├── [filter tabs: All / Draft / Published / Archived] — Tabs or ToggleGroup
    │       └── div.ml-auto — [bulk action select — placeholder]
    │
    └── FormList
        ├── [loading] → div.space-y-2 — Skeleton rows (5× h-12)
        ├── [empty]  → FormListEmptyState
        │   └── div.flex.flex-col.items-center.py-20.text-center
        │       ├── div.rounded-full.bg-secondary.p-4 — Forms icon (h-8 w-8, text-primary)
        │       ├── h2.text-lg.font-semibold.mt-4 "No forms yet"
        │       ├── p.text-sm.text-muted-foreground.mt-2
        │       └── Button (h-11, bg-primary, mt-6) "Create your first form"
        └── [populated] →
            Table (w-full)
            ├── TableHeader
            │   └── TableRow (border-b border-[var(--border)])
            │       ├── TableHead "Name" (w-auto)
            │       ├── TableHead "Status"
            │       ├── TableHead "Responses"
            │       ├── TableHead.hidden.sm:table-cell "Views"
            │       ├── TableHead.hidden.md:table-cell "Updated"
            │       └── TableHead.w-10 "" (actions)
            └── TableBody
                └── FormRow[] (h-12 per row, hover:bg-muted/40)
                    ├── TableCell — form name (font-medium, link to /dashboard/forms/{id})
                    ├── TableCell — Badge status (badge-published or badge-draft)
                    ├── TableCell — submission_count
                    ├── TableCell.hidden.sm:table-cell — views count
                    ├── TableCell.hidden.md:table-cell — relative timestamp, text-muted-foreground text-sm
                    └── TableCell — DropdownMenu (row actions)
                        ├── Edit → /app/forms/{id}/builder
                        ├── Share → /app/forms/{id}/share
                        ├── View submissions → /dashboard/forms/{id}
                        ├── Duplicate (placeholder)
                        ├── Archive
                        └── Delete → opens DeleteFormDialog
```

**Overlays**:
- `CreateFormDialog` — `Dialog` with form name + redirect URL inputs + `Alert` for URL error
- `DeleteFormDialog` — destructive confirm with form name + submission count

#### Responsive Behavior

| Breakpoint | Layout |
|------------|--------|
| Mobile (< 640px) | Hide Views + Updated columns; table scrolls horizontally |
| Tablet (≥ 640px) | Show Views column |
| Desktop (≥ 1024px) | All columns visible; sidebar fixed |

---

### Form Builder (`/app/forms/:formId/builder`)

**Route**: `/app/forms/:formId/builder`
**Mockup row**: Row 6 — 3-column: field library / canvas / field settings
**Layout**: Full-screen (overrides dashboard sidebar layout for this route)
**Rendering**: CSR (`"use client"`)

#### Component Hierarchy

```
BuilderLayout (full-screen, no sidebar — replaces DashboardLayout for this route)
├── BuilderTopBar (h-14, white, border-b)
│   ├── Button (ghost, sm) "← Back to forms" → /app/forms
│   ├── div.flex-1.px-4 — Input (borderless, text-sm font-medium) form title (editable)
│   ├── div.flex.items-center.gap-2
│   │   ├── TabsList (sm variant: Editor / Settings / Share / Responses)
│   │   ├── Button (outline, sm) "Save"
│   │   ├── Button (outline, sm) "Preview"
│   │   └── Button (h-9, bg-primary) "Publish"   [or "Unpublish" if published]
│   └── DropdownMenu — "More actions"
│
└── div.flex.flex-1.overflow-hidden
    ├── FieldLibraryPanel (w-60, border-r, bg-card, overflow-y-auto)
    │   └── div.p-4
    │       ├── p.text-xs.font-medium.text-muted-foreground.uppercase "Basic fields"
    │       ├── FieldTypeCard[] — Short text, Long text, Email, Phone, Number, Date, Website
    │       ├── Separator.my-3
    │       ├── p.text-xs.font-medium.text-muted-foreground.uppercase "Choice fields"
    │       ├── FieldTypeCard[] — Dropdown, Multiple choice, Checkbox, Rating
    │       ├── Separator.my-3
    │       ├── p.text-xs.font-medium.text-muted-foreground.uppercase "Layout"
    │       └── FieldTypeCard[] — Section, Divider
    │
    ├── BuilderCanvas (flex-1, bg-[var(--background)], overflow-y-auto, p-8)
    │   └── div.max-w-xl.mx-auto
    │       ├── [empty state] → div.text-center.py-20
    │       │   ├── Icon — InboxIcon or PlusCircle (text-muted-foreground)
    │       │   └── p "Add your first field from the panel on the left"
    │       └── CanvasFieldItem[] (each field, orderable)
    │           └── Card.mb-3 (white, shadow-sm, border, rounded-lg)
    │               ├── div.flex.items-center.gap-2.p-4
    │               │   ├── div.cursor-grab — DragHandle icon
    │               │   ├── div.flex-1 — field label preview
    │               │   └── div.flex.gap-1
    │               │       ├── Button (ghost, icon, sm) — edit (selects field in right panel)
    │               │       ├── Button (ghost, icon, sm) — duplicate
    │               │       └── Button (ghost, icon, sm, text-destructive) — delete
    │               └── [selected state] — highlighted border border-[var(--primary)]
    │
    └── FieldSettingsPanel (w-72, border-l, bg-card, overflow-y-auto)
        └── [no field selected] → p.p-6.text-sm.text-muted-foreground "Select a field to edit"
            [field selected] →
            div.p-4.space-y-4
            ├── p.text-xs.font-medium.text-muted-foreground.uppercase — field type name
            ├── div.space-y-1.5 — Label / Input "Field label"
            ├── div.space-y-1.5 — Label / Input "Placeholder"
            ├── div.space-y-1.5 — Label / Textarea "Help text"
            ├── div.flex.items-center.justify-between — Label "Required" / Switch
            ├── [type-specific settings: options list, min/max, date format etc.]
            └── Separator — below settings
```

#### Responsive Behavior

| Breakpoint | Layout |
|------------|--------|
| Mobile (< 768px) | Field library collapsed to icon bar; settings panel is a Sheet slide-in |
| Tablet (≥ 768px) | 2-column (library + canvas); settings panel as Sheet |
| Desktop (≥ 1024px) | Full 3-column layout |

---

### Submissions List (`/app/submissions`)

**Route**: `/app/submissions`
**Mockup row**: Row 7 — search + date filter + paginated table
**Layout**: Dashboard
**Rendering**: CSR (`"use client"`)
**Polish batch**: UI-Polish-4

#### Component Hierarchy

```
DashboardLayout
└── main.p-6
    ├── div.flex.items-center.justify-between.mb-6
    │   ├── div
    │   │   ├── h1.text-xl.font-semibold "Submissions"
    │   │   └── p.text-sm.text-muted-foreground "All responses across your forms"
    │   └── Button (outline, h-9) "Export CSV"
    │
    ├── SubmissionsToolbar
    │   └── div.flex.flex-wrap.items-center.gap-3.mb-4
    │       ├── SearchInput (w-64, "Search submissions…")
    │       ├── Select (form selector: "All forms" + form names)
    │       ├── DateRangePicker (start / end date inputs)
    │       ├── Select (status: All / New / Reviewed / Spam)
    │       └── Select (sort: Newest first / Oldest first)
    │
    └── SubmissionTable (full page version — all forms, not just one)
        ├── [loading] → Skeleton rows (8×)
        ├── [empty]  → EmptyState (icon + "No submissions yet" + "Publish a form to start")
        └── [populated] →
            Table
            ├── TableHeader
            │   └── TableRow
            │       ├── TableHead "ID"
            │       ├── TableHead "Form"
            │       ├── TableHead "Submitted at"
            │       ├── TableHead.hidden.sm:table-cell "Submitter"
            │       ├── TableHead "Status"
            │       └── TableHead "" (actions)
            └── TableBody
                └── SubmissionRow[] (h-12, expandable)
                    ├── TableCell — short ID (monospace, text-xs)
                    ├── TableCell — form name (link)
                    ├── TableCell — formatted timestamp
                    ├── TableCell.hidden.sm:table-cell — submitter email or "—"
                    ├── TableCell — EmailStatusBadge
                    └── TableCell — DropdownMenu (View / Mark spam / Delete)
            └── [expanded row] → SubmissionDetail (inline key-value)
        └── [pagination] → div.flex.items-center.justify-between.mt-4
            ├── p.text-sm.text-muted-foreground "Showing X–Y of Z"
            ├── Button (outline, sm) "Previous"
            └── Button (outline, sm) "Next"
```

---

### Form Detail / Inbox (`/dashboard/forms/[formId]`)

**Route**: `/dashboard/forms/[formId]`
**Mockup rows**: Row 7 (inbox tab) + Row 9 (settings tab conventions)
**Layout**: Dashboard
**Rendering**: CSR (`"use client"`)
**Polish batch**: UI-Polish-4 (inbox) + UI-Polish-5 (settings tab)

#### Component Hierarchy

```
DashboardLayout
└── main.p-6
    ├── div.flex.items-center.gap-2.text-sm.text-muted-foreground.mb-4 — breadcrumb
    │   ├── a "Forms" → /dashboard
    │   ├── ChevronRight (h-4 w-4)
    │   └── span.text-foreground — form.name
    │
    ├── div.flex.items-center.justify-between.mb-6
    │   ├── h1.text-xl.font-semibold — form.name
    │   └── CsvExportButton — Button (outline, h-9) "Export CSV"
    │
    └── Tabs (defaultValue="inbox")
        ├── TabsList
        │   ├── TabsTrigger "Inbox"
        │   └── TabsTrigger "Settings"
        │
        ├── TabsContent value="inbox".mt-4
        │   └── SubmissionTable (scoped to this formId)
        │       ├── [loading] → Skeleton rows (5×)
        │       ├── [empty]  →
        │       │   Card.p-12.text-center
        │       │   ├── InboxIcon (h-10 w-10, text-muted-foreground, mx-auto)
        │       │   ├── h2.text-lg.font-semibold.mt-4 "No submissions yet"
        │       │   ├── p.text-sm.text-muted-foreground.mt-2
        │       │   │   "Your endpoint is live. Paste this snippet into your site:"
        │       │   └── FormSnippet (code block + copy button)
        │       └── [populated] →
        │           ScrollArea.max-h-[calc(100vh-280px)]
        │           └── Table
        │               ├── TableHeader
        │               │   └── TableRow
        │               │       ├── TableHead "Time"
        │               │       ├── TableHead "Preview"
        │               │       ├── TableHead.hidden.sm:table-cell "Notification"
        │               │       └── TableHead.w-8 ""
        │               └── TableBody
        │                   └── SubmissionRow[] (h-12)
        │                       ├── TableCell — formatted timestamp (text-sm)
        │                       ├── TableCell — one-line field preview (text-sm, truncate)
        │                       ├── TableCell.hidden.sm:table-cell — EmailStatusBadge
        │                       └── TableCell — Button (ghost, icon) ChevronDown / ChevronUp
        │                           [expanded] → SubmissionDetail (inset row)
        │                               └── dl.grid.grid-cols-[auto_1fr].gap-x-4.gap-y-2.p-4.bg-muted/30
        └── [pagination controls below ScrollArea]

        └── TabsContent value="settings".mt-4
            └── div.space-y-8.max-w-2xl
                ├── section
                │   ├── h2.text-base.font-semibold "Form settings"
                │   └── Card
                │       └── CardContent.p-6
                │           └── FormSettingsForm
                │               ├── div.space-y-4
                │               │   ├── div.space-y-1.5 — Label / Input "Form name"
                │               │   ├── div.space-y-1.5 — Label / Input "Redirect URL (optional)"
                │               │   ├── div.space-y-1.5 — Label / Textarea "Success message"
                │               │   └── Alert (hidden; URL validation error)
                │               └── Button (h-9, bg-primary) "Save changes"
                │
                ├── section
                │   ├── h2.text-base.font-semibold "Embed snippet"
                │   └── Card
                │       └── CardContent.p-6
                │           ├── p.text-sm.text-muted-foreground "Paste into your HTML"
                │           └── FormSnippet (code block + CopyButton)
                │
                ├── Separator
                │
                └── section
                    ├── h2.text-base.font-semibold "Danger zone"
                    ├── p.text-sm.text-muted-foreground "Deleting is irreversible…"
                    └── Button (variant="destructive", h-9) "Delete form"
                        → opens DeleteFormDialog
```

#### Responsive Behavior

| Breakpoint | Layout |
|------------|--------|
| Mobile (< 640px) | "Notification" column hidden; submission preview truncated to 1 field |
| Tablet (≥ 640px) | All columns visible |
| Desktop (≥ 1024px) | Full layout; sidebar fixed |

---

### Analytics Page (`/app/analytics`)

**Route**: `/app/analytics`
**Mockup row**: Row 8 — KPI cards + bar chart of submissions + donut of submissions by form
**Layout**: Dashboard
**Rendering**: CSR (`"use client"`)

#### Component Hierarchy

```
DashboardLayout
└── main.p-6
    ├── div.flex.items-center.justify-between.mb-6
    │   ├── h1.text-xl.font-semibold "Analytics"
    │   └── div.flex.gap-3
    │       ├── Select (form: "All forms" / specific forms)
    │       └── Select (date range: Last 7 days / 30 days / 90 days / Custom)
    │
    ├── div.grid.grid-cols-1.sm:grid-cols-2.lg:grid-cols-4.gap-6.mb-6
    │   ├── KpiCard (Total submissions)
    │   ├── KpiCard (Total views)
    │   ├── KpiCard (Completion rate)
    │   └── KpiCard (Drop-off rate)
    │
    └── div.grid.grid-cols-1.lg:grid-cols-3.gap-6
        ├── Card.lg:col-span-2 — SubmissionsBarChart
        │   ├── CardHeader
        │   │   ├── CardTitle "Submissions over time"
        │   │   └── [tabs 7d / 30d / 90d]
        │   └── CardContent.h-64 — bar chart, brand blue bars, grid lines --muted-foreground
        └── Card — SubmissionsByFormDonut
            ├── CardHeader CardTitle "Submissions by form"
            └── CardContent.h-64 — donut chart, legend, --chart-1 through --chart-3
```

---

### Settings — General (`/app/settings/general`)

**Route**: `/app/settings/general`
**Mockup row**: Row 9 — label/input pairs, card sections, Save button
**Layout**: Dashboard
**Rendering**: CSR (`"use client"`)
**Polish batch**: UI-Polish-5

#### Component Hierarchy

```
DashboardLayout
└── main.p-6
    ├── PageHeader h1 "Settings"
    │
    └── div.flex.gap-8 (settings sub-nav + content)
        ├── SettingsSubNav (w-48, sticky left nav)
        │   └── nav.space-y-1
        │       ├── NavItem "General" (active)
        │       ├── NavItem "Security"
        │       ├── NavItem "Domains"
        │       └── NavItem "Appearance"
        │
        └── div.flex-1.max-w-2xl.space-y-6
            ├── Card
            │   ├── CardHeader CardTitle "Workspace"
            │   └── CardContent.space-y-4
            │       ├── div.space-y-1.5 — Label / Input "Workspace name"
            │       ├── div.space-y-1.5 — Label / Input "Slug" (muted, read-only placeholder)
            │       └── LogoUpload (avatar + upload button)
            ├── Card
            │   ├── CardHeader CardTitle "Preferences"
            │   └── CardContent.space-y-4
            │       ├── div.space-y-1.5 — Label / Select "Timezone"
            │       └── div.space-y-1.5 — Label / Select "Language"
            └── Button (h-9, bg-primary) "Save changes"
```

---

### Billing Page (`/app/billing`)

**Route**: `/app/billing`
**Mockup row**: Row 10 — plan card + payment method + invoice history
**Layout**: Dashboard
**Rendering**: CSR (`"use client"`)

#### Component Hierarchy

```
DashboardLayout
└── main.p-6
    ├── PageHeader h1 "Billing"
    │
    └── div.space-y-6
        ├── div.grid.grid-cols-1.md:grid-cols-2.gap-6
        │   ├── BillingPlanCard (current plan — blue tint for active paid plan)
        │   │   └── Card (bg-[var(--secondary)] for free; bg-primary for paid)
        │   │       ├── CardHeader — plan name (Badge) + billing cycle
        │   │       ├── CardContent — included limits (forms / responses / seats)
        │   │       │   ├── p "Renews on {date}"
        │   │       │   └── UsageMeters (3× progress bars)
        │   │       └── CardFooter
        │   │           └── Button (btn-gradient, w-full) "Upgrade plan" / "Manage plan"
        │   │
        │   └── PaymentMethodCard
        │       └── Card
        │           ├── CardHeader CardTitle "Payment method"
        │           └── CardContent
        │               ├── div.flex.items-center.gap-3
        │               │   ├── card-brand icon
        │               │   └── p "•••• •••• •••• 4242  Exp 12/26"
        │               └── Button (outline, sm) "Update payment method"
        │
        └── Card
            ├── CardHeader CardTitle "Invoice history"
            └── CardContent
                └── InvoiceTable
                    └── Table
                        ├── TableHeader
                        │   └── TableRow
                        │       ├── TableHead "Date"
                        │       ├── TableHead "Description"
                        │       ├── TableHead "Amount"
                        │       ├── TableHead "Status"
                        │       └── TableHead "" (download)
                        └── TableBody
                            └── TableRow[]
                                ├── TableCell — date
                                ├── TableCell — "Pro plan — Monthly"
                                ├── TableCell — "$29.00"
                                ├── TableCell — Badge (badge-success "Paid")
                                └── TableCell — Button (ghost, icon) Download
```

---

### Team Page (`/app/team`)

**Route**: `/app/team`
**Mockup row**: Row 11 — member table with roles
**Layout**: Dashboard
**Rendering**: CSR (`"use client"`)

#### Component Hierarchy

```
DashboardLayout
└── main.p-6
    ├── div.flex.items-center.justify-between.mb-6
    │   ├── div
    │   │   ├── h1.text-xl.font-semibold "Team"
    │   │   └── p.text-sm.text-muted-foreground "{count} members"
    │   └── Button (h-11, bg-primary) "Invite member" → opens InviteMemberDialog
    │
    └── MemberTable
        ├── [loading] → Skeleton rows (5×)
        └── [populated] →
            Table
            ├── TableHeader
            │   └── TableRow
            │       ├── TableHead "Member"
            │       ├── TableHead "Role"
            │       ├── TableHead "Status"
            │       ├── TableHead.hidden.md:table-cell "Joined"
            │       └── TableHead "" (actions)
            └── TableBody
                └── MemberRow[]
                    ├── TableCell — div.flex.items-center.gap-3
                    │   ├── Avatar (initials fallback, h-8 w-8)
                    │   └── div
                    │       ├── p.text-sm.font-medium — name
                    │       └── p.text-xs.text-muted-foreground — email
                    ├── TableCell — Badge (role: Owner/Admin/Editor/Viewer)
                    ├── TableCell — Badge (Active = badge-success, Pending = badge-warning)
                    ├── TableCell.hidden.md:table-cell — joined date
                    └── TableCell — DropdownMenu
                        ├── Change role (opens role Select inline)
                        ├── Resend invite (if Pending)
                        └── Remove member (destructive)

    (overlay: InviteMemberDialog)
    └── Dialog
        ├── DialogHeader DialogTitle "Invite a team member"
        ├── DialogContent
        │   ├── div.space-y-1.5 — Label / Input "Email address"
        │   └── div.space-y-1.5 — Label / Select "Role" (Editor / Admin / Viewer)
        └── DialogFooter
            ├── Button (outline) "Cancel"
            └── Button (bg-primary) "Send invite"
```

---

### Integrations Page (`/app/integrations`)

**Route**: `/app/integrations`
**Mockup row**: Row 12 — vendor cards with Connect CTAs
**Layout**: Dashboard
**Rendering**: CSR (`"use client"`)

#### Component Hierarchy

```
DashboardLayout
└── main.p-6
    ├── PageHeader h1 "Integrations" p "Connect your favorite tools"
    │
    └── div.grid.grid-cols-1.sm:grid-cols-2.lg:grid-cols-3.gap-6
        └── IntegrationCard[] (4+ vendor cards)
            └── Card (bg-card, border, rounded-lg, shadow-[var(--shadow-card)])
                ├── CardHeader
                │   └── div.flex.items-start.justify-between
                │       ├── div.flex.items-center.gap-3
                │       │   ├── vendor logo (h-8 w-8, rounded-md)
                │       │   └── div
                │       │       ├── CardTitle.text-base — vendor name
                │       │       └── Badge (status: Connected = badge-success / Not connected)
                │       └── Switch (enabled toggle, visible only if connected)
                ├── CardContent
                │   └── p.text-sm.text-muted-foreground — short description
                └── CardFooter
                    └── Button (variant="outline", w-full, h-9)
                        [not connected] "Connect"
                        [connected] "Manage"
```

---

### Activity Log Page (`/app/activity`)

**Route**: `/app/activity`
**Layout**: Dashboard
**Rendering**: CSR (`"use client"`)

#### Component Hierarchy

```
DashboardLayout
└── main.p-6
    ├── div.flex.items-center.justify-between.mb-6
    │   ├── h1.text-xl.font-semibold "Activity log"
    │   └── Button (outline, h-9) "Export log"
    │
    ├── ActivityFilterBar
    │   └── div.flex.gap-3.mb-4
    │       ├── Select (event type: All / form.created / form.published / submission.received / etc.)
    │       └── DateRangePicker
    │
    └── ActivityTable
        └── Table
            ├── TableHeader
            │   └── TableRow
            │       ├── TableHead "Event"
            │       ├── TableHead "Actor"
            │       ├── TableHead "Target"
            │       ├── TableHead "When"
            │       └── TableHead "Details"
            └── TableBody
                └── TableRow[] (h-12)
                    ├── TableCell — Badge (event type chip)
                    ├── TableCell — actor email
                    ├── TableCell — target name (form name, etc.)
                    ├── TableCell — relative timestamp
                    └── TableCell — metadata summary (text-xs text-muted-foreground)
```

---

### Default Submission Success (`/submitted`)

**Route**: `/submitted`
**Mockup row**: Derived from Row 1 success conventions
**Layout**: Marketing (minimal — header hidden or logo only)
**Rendering**: SSR

#### Component Hierarchy

```
MarketingLayout (or minimal layout — just logo + content)
└── main.flex.items-center.justify-center.min-h-screen
    └── div.text-center.max-w-sm.px-4
        ├── div.mx-auto.mb-6 — CheckCircle icon (h-12 w-12, text-[var(--color-success)])
        ├── h1.text-2xl.font-semibold "Thanks! Your submission was received."
        ├── p.text-muted-foreground.mt-3 "You can close this tab or go back."
        └── div.mt-8
            └── Button (ghost, sm) "Powered by FormSnap →" → /
```

#### Responsive Behavior
Single-column centered on all viewports.

---

## Responsive Breakpoints Summary

All pages use Tailwind v4 mobile-first responsive utility prefixes:

| Prefix | Breakpoint | Key layout changes |
|--------|------------|-------------------|
| _(none)_ | 0 px+ | Base mobile styles; sidebar hidden; tables minimal columns |
| `sm:` | ≥ 640 px | Card max-width kicks in; additional table columns; hero buttons row |
| `md:` | ≥ 768 px | Feature grid 2-col; nav links visible in marketing; billing 2-col |
| `lg:` | ≥ 1024 px | Sidebar fixed (not Sheet); feature grid 3-col; KPI grid 4-col |
| `xl:` | ≥ 1280 px | Not required for MVP; reserved for future dashboard expansions |

---

## Dark Mode Summary

| Page / Surface | Dark mode approach |
|---------------|-------------------|
| All auth pages | `next-themes` inherited; Card `bg-card`; no overrides |
| Marketing landing | Inherited; `--background` deep navy; card sections `bg-card` |
| `/submitted` | Inherited; icon uses `--color-success` |
| Dashboard — all pages | Inherited; sidebar `bg-card`; header `bg-card`; page bg `--background` |
| Form builder | Canvas uses `--background`; panels use `--card` |
| Code blocks (snippet) | `--color-code-surface` switches dark variant (from design-system.md) |
| Email status badges | `.badge-success` / `.badge-warning` included in `@layer components` — no `.dark` variant needed (OKLCH values already contrasted) |
| Status badges (form) | `badge-published` / `badge-draft` — included in `@layer components` |
| KPI cards | Inherit `--card` and `--card-foreground` |
| Charts | Use `--chart-1` through `--chart-5`; grid lines `--muted-foreground / 30%` |

---

## Visual References

Design source: **Priority 0** — `docs/prd/formsnap_prd_design.png` (full 12-surface mockup).

| Page | Mockup row | Reference |
|------|-----------|-----------|
| Marketing landing | Row 1 | `docs/prd/formsnap_prd_design.png` row 1 |
| Auth (sign-in / sign-up / forgot-password) | Row 2 | `docs/prd/formsnap_prd_design.png` row 2 |
| Pricing | Row 3 | `docs/prd/formsnap_prd_design.png` row 3 |
| App dashboard (KPI) | Row 4 | `docs/prd/formsnap_prd_design.png` row 4 |
| Forms list | Row 5 | `docs/prd/formsnap_prd_design.png` row 5 |
| Form builder | Row 6 | `docs/prd/formsnap_prd_design.png` row 6 |
| Submissions list / Inbox tab | Row 7 | `docs/prd/formsnap_prd_design.png` row 7 |
| Analytics | Row 8 | `docs/prd/formsnap_prd_design.png` row 8 |
| Settings (form settings tab / General) | Row 9 | `docs/prd/formsnap_prd_design.png` row 9 |
| Billing | Row 10 | `docs/prd/formsnap_prd_design.png` row 10 |
| Team | Row 11 | `docs/prd/formsnap_prd_design.png` row 11 |
| Integrations | Row 12 | `docs/prd/formsnap_prd_design.png` row 12 |

All pages listed above are the **hard visual targets** for the UI Polish Phase.
`docs/prd/formsnap_prd_design.png` serves as the authoritative visual reference in place of
per-page screenshot files. QA Layer 3 MUST perform side-by-side comparison against this
file for every shipped page.
