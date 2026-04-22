# Page Layouts — FormSnap

> Design source: Priority 3 (PRD-only). All layouts derived from PRD §6 page inventory,
> `technical-spec.md` §2.11 (rendering strategy) and §3.1 (component list), and the
> existing scaffold's layout files.

---

## Layout Pattern Reference

### Auth Layout

**File**: `frontend/src/app/(auth)/layout.tsx`
**Pattern**: Full-screen centered content; no navigation; minimal branding (logo wordmark only).

```
<div class="min-h-screen flex items-center justify-center bg-background">
  {children}          ← Card (max-w-md, centered)
</div>
```

Used for: `/sign-in`, `/sign-up`, `/verify-email`

---

### Dashboard Layout

**File**: `frontend/src/app/(dashboard)/layout.tsx`
**Pattern**: Fixed sidebar on the left + scrollable main content area on the right.

```
<div class="flex h-screen overflow-hidden">
  <Sidebar />                         ← w-64, collapsible to w-14 on toggle; Sheet on mobile
  <div class="flex flex-col flex-1 overflow-hidden">
    <DashboardHeader />               ← h-14, sticky top
    <main class="flex-1 overflow-y-auto p-6">
      {children}
    </main>
  </div>
</div>
```

Used for: `/dashboard`, `/dashboard/forms/new`, `/dashboard/forms/[formId]`

**Sidebar contents**:
```
Sidebar
├── Logo wordmark (top, links to /dashboard)
├── SidebarNav
│   └── NavItem: "Forms" → /dashboard  (only one nav item in MVP)
├── Separator
└── UserMenu (bottom-pinned)
    ├── Avatar (initials fallback)
    └── DropdownMenu
        ├── DropdownMenuGroup
        │   └── DropdownMenuLabel ← user email
        ├── DropdownMenuSeparator
        └── DropdownMenuItem: "Sign out"
```

**Mobile sidebar**: The `<Sidebar>` renders as a `<Sheet>` slide-in panel triggered by a
hamburger `<Button>` in `<DashboardHeader>` on viewports narrower than `lg:` (1024 px).

---

### Marketing Layout

**File**: `frontend/src/app/(marketing)/layout.tsx`  _(new — Engineer creates per `technical-spec.md` §2.12)_
**Pattern**: Sticky header + full-width content sections + footer.

```
<div class="min-h-screen flex flex-col">
  <MarketingHeader />       ← sticky top-0, z-50; logo + nav links + CTA
  <main class="flex-1">
    {children}
  </main>
  <MarketingFooter />
</div>
```

Used for: `/` (landing), `/submitted`

---

## Pages

### Marketing Landing Page (`/`)

**Layout**: Marketing
**Rendering**: SSR (no `"use client"`)
**Route group**: `(marketing)/`

#### Component Hierarchy

```
MarketingLayout
├── MarketingHeader
│   ├── Logo wordmark (link → /)
│   ├── nav links (hidden on mobile, shown md:)
│   └── Button (outline) "Sign in" → /sign-in
│       Button (default) "Get started" → /sign-up
└── main
    ├── HeroSection (custom marketing/hero-section.tsx)
    │   ├── Badge "Free to start"
    │   ├── h1 — headline
    │   ├── p — sub-copy
    │   ├── div.flex.gap-4
    │   │   ├── Button (accent-blue) "Get started free" → /sign-up
    │   │   └── Button (outline) "Sign in" → /sign-in
    │   └── code-preview — simulated endpoint URL (code block style)
    ├── FeatureGrid (custom marketing/feature-grid.tsx)
    │   ├── section heading (h2)
    │   └── div.grid.grid-cols-1.md:grid-cols-3.gap-6
    │       ├── Card — "One endpoint, zero backends"
    │       ├── Card — "Instant email notifications"
    │       └── Card — "Browse & export submissions"
    ├── Separator
    └── MarketingFooter
        ├── p "© FormSnap"
        └── Button (ghost, sm) "Powered by FormSnap"
```

#### Responsive Behavior

| Breakpoint | Layout |
|------------|--------|
| Mobile (< 768px) | Single-column hero; feature grid stacks to 1 col; nav links hidden (no hamburger — auth links remain as buttons) |
| Tablet (≥ 768px `md:`) | Feature grid 2 columns |
| Desktop (≥ 1024px `lg:`) | Feature grid 3 columns; hero has more horizontal padding; nav links visible |

**Max content width**: `max-w-6xl mx-auto px-4 sm:px-6 lg:px-8` wraps all sections.

#### Dark Mode

Inherits theme from `next-themes`. No page-level overrides. Code-preview block uses
`var(--color-code-surface)` / `var(--color-code-border)`.

#### Interactions

- "Get started free" and "Sign in" buttons navigate to their respective routes.
- No form inputs on this page; no loading states needed.

---

### Sign-up Page (`/sign-up`)

**Layout**: Auth (centered card)
**Rendering**: SSR shell + `"use client"` in `signup-form.tsx`
**Route group**: `(auth)/`

#### Component Hierarchy

```
AuthLayout
└── Card (max-w-md w-full)
    ├── CardHeader
    │   ├── Logo wordmark (small, centered)
    │   ├── CardTitle "Create your account"
    │   └── CardDescription "Start collecting form submissions in minutes."
    └── CardContent
        └── SignupForm (auth/signup-form.tsx)
            ├── div.space-y-4
            │   ├── div.space-y-1
            │   │   ├── Label "Email"
            │   │   └── Input type="email" placeholder="you@example.com"
            │   ├── div.space-y-1
            │   │   ├── Label "Password"
            │   │   └── InputGroup
            │   │       ├── Input type="password" (or "text" when revealed)
            │   │       └── suffix: Button (ghost, icon) — eye / eye-off toggle
            │   └── Alert (destructive, hidden until error) — error message
            ├── Button (full-width) "Create account" [loading: "Creating account…"]
            └── p.text-center.text-sm
                "Already have an account?"
                Button (link variant) "Sign in" → /sign-in
```

#### Responsive Behavior

| Breakpoint | Layout |
|------------|--------|
| Mobile (< 640px) | Card is full-width with `mx-4` padding |
| Tablet / Desktop (≥ 640px `sm:`) | Card centered at `max-w-md` |

#### Dark Mode

Inherits theme. Card uses `bg-card text-card-foreground`. No custom overrides.

#### Interactions

- Real-time: none (no live validation; validate on submit).
- Submit: show spinner in button, disable all inputs; on Firebase error show `alert`.
- Success: redirect to `/verify-email`.

---

### Sign-in Page (`/sign-in`)

**Layout**: Auth (centered card)
**Rendering**: SSR shell + `"use client"` in `login-form.tsx`
**Route group**: `(auth)/`

#### Component Hierarchy

```
AuthLayout
└── Card (max-w-md w-full)
    ├── CardHeader
    │   ├── Logo wordmark
    │   ├── CardTitle "Sign in"
    │   └── CardDescription "Welcome back."
    └── CardContent
        └── LoginForm (auth/login-form.tsx)
            ├── div.space-y-4
            │   ├── div.space-y-1
            │   │   ├── Label "Email"
            │   │   └── Input type="email"
            │   ├── div.space-y-1
            │   │   ├── div.flex.justify-between
            │   │   │   ├── Label "Password"
            │   │   │   └── Button (link, sm) "Forgot password?" → triggers reset email
            │   │   └── InputGroup
            │   │       ├── Input type="password"
            │   │       └── suffix: Button (ghost, icon) — toggle visibility
            │   └── Alert (destructive, hidden until error)
            ├── Button (full-width) "Sign in"
            └── p.text-center.text-sm
                "Don't have an account?"
                Button (link variant) "Sign up" → /sign-up
```

#### Responsive Behavior

Same as Sign-up page.

#### Dark Mode

Inherits theme. No overrides.

#### Interactions

- "Forgot password?" fires `sendPasswordResetEmail()` via Firebase; show inline success message
  replacing the `alert` slot ("Reset email sent — check your inbox.").
- Sign-in success: redirect to `/dashboard` (or return URL query param).

---

### Verify Email Reminder (`/verify-email`)

**Layout**: Auth (centered card)
**Rendering**: CSR (`"use client"`)
**Route group**: `(auth)/`

#### Component Hierarchy

```
AuthLayout
└── VerifyEmailCard (auth/verify-email-card.tsx)
    └── Card (max-w-md w-full)
        ├── CardHeader
        │   ├── CardTitle "Check your inbox"
        │   └── CardDescription "We've sent a verification link to {user.email}."
        └── CardContent
            ├── p.text-sm.text-muted-foreground — explanatory copy
            ├── div.flex.flex-col.gap-3
            │   ├── Button (full-width) "Resend verification email" [loading / sent state]
            │   └── Button (full-width, outline) "I've verified — go to dashboard"
            │       → calls user.reload() then checks emailVerified; redirects if true;
            │         else shows Alert "Email not yet verified."
            └── Alert (hidden until resend success or reload-not-verified)
```

#### Responsive Behavior

Same as auth pages.

#### Dark Mode

Inherits theme.

#### Interactions

- "Resend": calls `sendEmailVerification(currentUser)`, disables button for 60 s to prevent spam.
- "I've verified": calls `currentUser.reload()`, checks `emailVerified`, redirects to `/dashboard`
  if true; shows `alert` if still false.

---

### Dashboard / Form List (`/dashboard`)

**Layout**: Dashboard (sidebar + header + main)
**Rendering**: CSR (`"use client"`)
**Route group**: `(dashboard)/`

#### Component Hierarchy

```
DashboardLayout
├── Sidebar (w-64 fixed left; Sheet on < lg:)
│   ├── Logo
│   ├── SidebarNav
│   │   └── NavItem "Forms" (active)
│   ├── Separator
│   └── UserMenu (bottom-pinned)
│       └── DropdownMenu (see user-menu pattern in component-map.md)
└── main (flex-1, overflow-y-auto, p-6)
    ├── DashboardHeader
    │   ├── h1 "Forms"  (page title)
    │   ├── [hamburger Button — visible < lg:]
    │   └── Button (primary) "New form" → opens CreateFormDialog
    │       [disabled + tooltip if email not verified]
    ├── EmailVerificationGate (alert banner, visible only if email_verified=false)
    └── FormList (dashboard/form-list.tsx)
        ├── [loading state] → Skeleton rows (5×)
        ├── [empty state]  → FormListEmptyState
        │   └── Card.p-12.text-center
        │       ├── illustration / icon
        │       ├── h2 "No forms yet"
        │       ├── p "Create your first form to start collecting submissions."
        │       └── Button "Create your first form" → opens CreateFormDialog
        └── [populated state] →
            Table
            ├── TableHeader
            │   └── TableRow
            │       ├── TableHead "Name"
            │       ├── TableHead "Submissions"
            │       ├── TableHead "Last submission"
            │       └── TableHead "" (actions)
            └── TableBody
                └── FormRow[] (dashboard/form-row.tsx)
                    ├── TableCell — form name (link to /dashboard/forms/{id})
                    ├── TableCell — Badge (submission_count)
                    ├── TableCell — relative timestamp or "—"
                    └── TableCell — DropdownMenu (Open / Copy endpoint / Delete)
```

**Overlays**:
- `CreateFormDialog` — triggered by "New form" button; rendered adjacent to `FormList`
- `DeleteFormDialog` — triggered by DropdownMenu "Delete"; `deleteTarget` state controls open/close

#### Responsive Behavior

| Breakpoint | Layout |
|------------|--------|
| Mobile (< 1024px) | Sidebar hidden; hamburger in header opens `Sheet`; table scrolls horizontally |
| Desktop (≥ 1024px `lg:`) | Sidebar fixed; table has full column set |

**Table column pruning on mobile**: on < `sm:` hide "Last submission" column
(`hidden sm:table-cell`); keep Name, Submissions, Actions.

#### Dark Mode

Inherits theme. Sidebar uses `var(--sidebar)` surface token.

#### Interactions

- On mount: fetch `GET /api/v1/me` (sets `ProfileContext`) and `GET /api/v1/forms`.
- Create: dialog opens; on submit appends form to list; closes dialog; shows `sonner` "Form created."
- Delete: optimistic removal; on API error rolls back + shows `sonner` error.
- Copy endpoint URL: `copy-button.tsx` fires `sonner` "Copied!".

---

### Form Detail / Inbox (`/dashboard/forms/[formId]`)

**Layout**: Dashboard (sidebar + header + main)
**Rendering**: CSR (`"use client"`)
**Route group**: `(dashboard)/`

#### Component Hierarchy

```
DashboardLayout
├── Sidebar (same as dashboard home)
└── main (flex-1, overflow-y-auto, p-6)
    ├── DashboardHeader
    │   ├── Breadcrumb: "Forms" → /dashboard  /  "{form.name}"
    │   └── [hamburger on mobile]
    └── page content
        ├── div.flex.items-center.justify-between.mb-6
        │   ├── h1 "{form.name}"
        │   └── CsvExportButton (dashboard/csv-export-button.tsx)
        │       └── Button (outline) "Export CSV"
        └── Tabs (defaultValue="inbox")
            ├── TabsList
            │   ├── TabsTrigger value="inbox" "Inbox"
            │   └── TabsTrigger value="settings" "Settings"
            │
            ├── TabsContent value="inbox"
            │   └── SubmissionTable (dashboard/submission-table.tsx)
            │       ├── [loading] → Skeleton rows (5×)
            │       ├── [empty]  →
            │       │   Card.p-12.text-center
            │       │   ├── h2 "No submissions yet"
            │       │   ├── p "Your endpoint is live. Try submitting the form below."
            │       │   ├── FormSnippet (endpoint URL + copy)
            │       │   └── code block with curl test command
            │       └── [populated] →
            │           ScrollArea (max-h-[600px])
            │           └── Table
            │               ├── TableHeader
            │               │   └── TableRow
            │               │       ├── TableHead "Time"
            │               │       ├── TableHead "Preview"
            │               │       ├── TableHead "Notification"
            │               │       └── TableHead "" (expand toggle)
            │               └── TableBody
            │                   └── SubmissionRow[] (dashboard/submission-row.tsx)
            │                       ├── TableCell — formatted timestamp
            │                       ├── TableCell — one-line field preview (first 2 fields)
            │                       ├── TableCell — EmailStatusBadge
            │                       └── TableCell — Button (ghost, icon) chevron toggle
            │                           [expanded] → SubmissionDetail (dashboard/submission-detail.tsx)
            │                               └── dl.grid.grid-cols-[auto_1fr].gap-x-4.gap-y-2
            │                                   (key-value pairs from submission.data)
            │
            └── TabsContent value="settings"
                └── div.space-y-8
                    ├── section "Form settings"
                    │   └── FormSettingsForm (dashboard/form-settings-form.tsx)
                    │       ├── div.space-y-4
                    │       │   ├── div.space-y-1
                    │       │   │   ├── Label "Form name"
                    │       │   │   └── Input value={form.name}
                    │       │   ├── div.space-y-1
                    │       │   │   ├── Label "Redirect URL (optional)"
                    │       │   │   └── Input placeholder="https://yoursite.com/thanks"
                    │       │   └── Alert (hidden; shown on URL validation error)
                    │       └── Button "Save changes" [loading state]
                    │
                    ├── section "Embed snippet"
                    │   ├── p.text-sm.text-muted-foreground — "Paste this into your HTML"
                    │   └── FormSnippet (dashboard/form-snippet.tsx)
                    │       (reused: renders code block + CopyButton)
                    │
                    ├── Separator
                    │
                    └── section "Danger zone"
                        ├── p.text-sm.text-muted-foreground "Deleting this form is irreversible…"
                        └── Button (destructive) "Delete form" → opens DeleteFormDialog
```

**Overlays**:
- `DeleteFormDialog` — destructive confirm; on confirm calls `DELETE /api/v1/forms/{id}`;
  on success redirects to `/dashboard`.

#### Pagination Controls (Inbox tab)

Rendered below the `ScrollArea` when `total > page_size`:

```
div.flex.items-center.justify-between.mt-4
├── p.text-sm.text-muted-foreground "Showing {start}–{end} of {total}"
├── Button (outline, sm) "Previous" [disabled if page=1]
└── Button (outline, sm) "Next" [disabled if page=last]
```

#### Responsive Behavior

| Breakpoint | Layout |
|------------|--------|
| Mobile (< 640px) | "Notification" column hidden (`hidden sm:table-cell`); submission preview truncated to 1 field |
| Tablet (≥ 640px) | All columns visible |
| Desktop (≥ 1024px) | Full layout; sidebar fixed |

#### Dark Mode

Inherits theme. Code block uses `var(--color-code-surface)` in both modes (different values
per `design-system.md`). `EmailStatusBadge` custom classes include `.dark` variants.

#### Interactions

- Tab switch: pure client state; no navigation.
- Submission row expand: toggles local boolean per row; smooth height transition.
- CSV export: `csv-export-button.tsx` shows loading spinner in button; on blob ready fires download.
- Settings save: shows loading state; on success fires `sonner` "Settings saved."; on URL error shows inline `alert`.
- Delete: navigate to `/dashboard` after successful delete.

---

### Default Submission Success (`/submitted`)

**Layout**: Marketing (header + footer, minimal)
**Rendering**: SSR (static)
**Route group**: `(marketing)/`

#### Component Hierarchy

```
MarketingLayout
└── main.flex-1.flex.items-center.justify-center.py-16
    └── div.text-center.max-w-sm.px-4
        ├── div.mb-4 — checkmark icon (Heroicon or inline SVG, ~48px, text-success colour)
        ├── h1.text-2xl.font-semibold "Thanks! Your submission was received."
        ├── p.text-muted-foreground.mt-2 "You can close this tab or go back."
        └── div.mt-8
            └── Button (ghost, sm, link-style) "Powered by FormSnap →" → /
```

#### Responsive Behavior

Single-column centered on all viewports. No breakpoint-specific changes needed.

#### Dark Mode

Inherits theme. Icon color uses `var(--color-success)`.

#### Interactions

None (static page).

---

### 404 Not Found (`/*`)

**Layout**: Root (no marketing header/footer — minimal shell)
**Rendering**: SSR
**Route group**: root `not-found.tsx`

#### Component Hierarchy

```
RootLayout (app/layout.tsx)
└── div.min-h-screen.flex.items-center.justify-center
    └── div.text-center.space-y-4
        ├── p.text-muted-foreground "404"
        ├── h1.text-2xl.font-semibold "Page not found"
        ├── p.text-muted-foreground "The page you're looking for doesn't exist."
        └── Button (outline) "Go home" → /
```

#### Responsive Behavior

Single-column centered. No breakpoint changes.

---

## Responsive Breakpoints Summary

All pages use Tailwind v4 responsive utility prefixes on a **mobile-first** basis:

| Prefix | Breakpoint | Usage |
|--------|------------|-------|
| _(none)_ | 0 px+ | Mobile base styles |
| `sm:` | ≥ 640 px | Show additional table columns; card max-width kicks in |
| `md:` | ≥ 768 px | Feature grid goes 2-column on landing; nav links visible in marketing header |
| `lg:` | ≥ 1024 px | Dashboard sidebar fixed (not Sheet); feature grid 3-column |
| `xl:` | ≥ 1280 px | Not required for MVP |

---

## Dark Mode Summary

| Page | Dark mode handling |
|------|--------------------|
| All auth pages | `next-themes` inherited; Card uses `bg-card`; no custom overrides |
| Marketing landing | Inherited; hero background adjusts via `bg-background` |
| `/submitted` | Inherited; icon color via CSS variable |
| Dashboard pages | Inherited; Sidebar uses `var(--sidebar)` / `var(--sidebar-foreground)` already in `globals.css` |
| Code blocks | `var(--color-code-surface)` switches from `oklch(0.965 0 0)` to `oklch(0.22 0 0)` (defined in `design-system.md`) |
| Email status badges | `.badge-success` and `.badge-warning` include `.dark` selector variants |

---

## Visual References

Design source was Priority 3 (PRD-only). No screenshots were generated.

> No visual references available — UI Polish Phase will be unavailable.
