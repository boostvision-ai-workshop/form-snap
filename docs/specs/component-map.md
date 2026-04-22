# Component Map — FormSnap

> Design source: Priority 3 (PRD-only). All mappings derived from PRD §3 features,
> §6 page inventory, and `technical-spec.md` §3 frontend architecture.

---

## Overview

FormSnap has two audience surfaces: (1) **marketing / auth** pages for anonymous visitors
and (2) **dashboard** pages for authenticated form owners. The component strategy is:

- Maximise reuse of the 22 pre-installed Shadcn UI components.
- Introduce custom components only when business logic or composition complexity
  justifies it.
- All new custom components go into existing domain directories (`auth/`, `dashboard/`,
  `marketing/`) and are listed under "new" below. Never modify `ui/`.

---

## Shadcn Components Used (Global Summary)

| Component | Pages / Use cases |
|-----------|-------------------|
| `alert` | Sign-in error; email-not-verified gate; form validation hints in create-form dialog |
| `avatar` | User menu (sidebar top) — initials fallback |
| `badge` | Email status indicator on submission rows; submission count on form rows |
| `button` | Every CTA, form submit, copy, export, delete, navigation trigger |
| `card` | Auth page container; marketing feature cards; empty-state containers |
| `checkbox` | Not used in MVP scope |
| `command` | Not used in MVP scope |
| `dialog` | Create-form dialog; delete-form confirmation dialog |
| `dropdown-menu` | User menu (sign out + account label) in sidebar |
| `input-group` | Password field with show/hide toggle in auth forms |
| `input` | Form name input; redirect URL input; email and password in auth forms |
| `label` | All form field labels across auth and dashboard |
| `scroll-area` | Submission list scroll container on inbox page |
| `select` | Not used in MVP scope |
| `separator` | Visual divider in sidebar between nav groups; in form-detail settings tab |
| `sheet` | Mobile sidebar drawer (≤ 1024 px) |
| `skeleton` | Loading placeholders on form list, submission table |
| `sonner` | Copy-to-clipboard toast; save-settings success toast; delete error toast |
| `switch` | Not used in MVP scope (reserved for future per-form notification toggle) |
| `table` | Form list table (dashboard home); submission inbox table |
| `tabs` | Form detail page: "Inbox" / "Settings" tab switch |
| `textarea` | Not used in MVP scope |

---

## Pages and Their Components

### Marketing Landing Page (`/`)

**Route**: `/`
**Rendering**: SSR (no `"use client"`)
**Layout group**: `(marketing)/`

**Shadcn Components Used**:
- `button` — "Get started" CTA (hero + header), "Sign in" link-button
- `card` — Feature highlight cards (3-column grid)
- `badge` — "Free to start" or "Open beta" label on hero
- `separator` — Section dividers between hero / features / footer

**Custom Components (existing)**:
- `marketing-header.tsx` — Public nav with "Sign in" / "Sign up" links
- `marketing-footer.tsx` — Footer with "Powered by FormSnap" attribution

**Custom Components (new)**:
- `marketing/hero-section.tsx` — Headline, sub-copy, CTA buttons, endpoint-URL preview
- `marketing/feature-grid.tsx` — 3-column grid of feature cards (uses `card` + icons)

**State Management**: None (purely static SSR content)

---

### Sign-up Page (`/sign-up`)

**Route**: `/sign-up`
**Rendering**: SSR shell + `"use client"` on the form component
**Layout group**: `(auth)/`

**Shadcn Components Used**:
- `card` — Centered form container
- `input` — Email field
- `input-group` — Password field with show/hide eye icon
- `label` — Field labels
- `button` — "Create account" submit; "Sign in instead" link-button
- `alert` — Inline error (e.g., email already in use, weak password)

**Custom Components (existing)**:
- `auth/signup-form.tsx` — Orchestrates inputs + Firebase `createUserWithEmailAndPassword`

**Custom Components (new)**:
- None — existing `signup-form.tsx` covers the PRD requirement after minor copy edits.

**State Management**: Local state in `signup-form.tsx` (controlled inputs, loading flag, error string)

---

### Sign-in Page (`/sign-in`)

**Route**: `/sign-in`
**Rendering**: SSR shell + `"use client"` on the form component
**Layout group**: `(auth)/`

**Shadcn Components Used**:
- `card` — Centered form container
- `input` — Email field
- `input-group` — Password field with show/hide toggle
- `label` — Field labels
- `button` — "Sign in" submit; "Forgot password?" ghost-button; "Sign up" link-button
- `alert` — Inline error (bad credentials; unverified email warning)

**Custom Components (existing)**:
- `auth/login-form.tsx` — Orchestrates inputs + Firebase `signInWithEmailAndPassword`; needs "forgot password" link added

**Custom Components (new)**:
- None.

**State Management**: Local state in `login-form.tsx`

---

### Verify Email Reminder (`/verify-email`)

**Route**: `/verify-email`
**Rendering**: CSR (`"use client"`)
**Layout group**: `(auth)/`

**Shadcn Components Used**:
- `card` — Centered info container
- `button` — "Resend verification email"; "I've verified — take me to the dashboard"
- `alert` — Success alert after resend; error alert if resend fails

**Custom Components (new)**:
- `auth/verify-email-card.tsx` — Reads Firebase `currentUser.emailVerified`; calls
  `sendEmailVerification()`; polls on "I've verified" click then redirects to `/dashboard`.

**State Management**: Local state (loading, resent flag); reads `useAuth()` context

---

### Dashboard / Form List (`/dashboard`)

**Route**: `/dashboard`
**Rendering**: CSR (`"use client"`)
**Layout group**: `(dashboard)/`

**Shadcn Components Used**:
- `table` — Form list (name, submission count, last submission, actions column)
- `badge` — Submission count chip on each form row
- `button` — "New form" primary CTA; "Delete" ghost-destructive in action column; "Copy endpoint" icon-button
- `dialog` — Delete-form confirmation dialog (destructive variant)
- `skeleton` — Loading state while `GET /api/v1/forms` resolves
- `sonner` — "Copied!" toast; "Form deleted" toast
- `dropdown-menu` — Per-row actions menu (Open inbox / Copy endpoint / Delete)
- `alert` — Unverified-email gate banner at top of page ("Verify your email to create forms")

**Custom Components (existing)**:
- `dashboard/sidebar.tsx`
- `dashboard/sidebar-nav.tsx`
- `dashboard/dashboard-header.tsx`
- `dashboard/user-menu.tsx`

**Custom Components (new)**:
- `dashboard/form-list.tsx` — Renders `table` with form rows; handles empty state branch
- `dashboard/form-list-empty-state.tsx` — Empty state: illustration + "Create your first form" CTA
- `dashboard/form-row.tsx` — Single row in the form table; name, badge, timestamp, action `dropdown-menu`
- `dashboard/create-form-dialog.tsx` — `dialog` containing name `input` + optional `redirect_url` `input` + `alert` for URL validation; calls `POST /api/v1/forms`
- `dashboard/delete-form-dialog.tsx` — Destructive confirm `dialog`; shows form name + submission count; calls `DELETE /api/v1/forms/{id}`
- `dashboard/copy-button.tsx` — Icon-button that copies text to clipboard and fires a `sonner` toast
- `dashboard/email-verification-gate.tsx` — `alert` banner shown when `email_verified = false`; disable logic for "New form" button

**State Management**:
- Form list: `useState` array, fetched on mount from `GET /api/v1/forms`
- Optimistic delete: remove from local array immediately, rollback on API error
- Create: append returned form to local array after `POST` resolves
- Email verified: `useProfile()` from `ProfileContext`

---

### Create Form Page / Modal (`/dashboard/forms/new`)

**Route**: `/dashboard/forms/new`
**Rendering**: CSR
**Layout group**: `(dashboard)/`

**Design decision**: Per `technical-spec.md` §2.11, a modal on `/dashboard` is preferred.
The route `/dashboard/forms/new` exists as a fallback (shallow-routed page that opens the
same `create-form-dialog.tsx` modal). No separate full-page layout is required.

**Shadcn Components Used**: Same as `create-form-dialog.tsx` (see Dashboard section above)

**Custom Components**: Reuses `dashboard/create-form-dialog.tsx`

---

### Form Detail / Inbox (`/dashboard/forms/[formId]`)

**Route**: `/dashboard/forms/[formId]`
**Rendering**: CSR (`"use client"`)
**Layout group**: `(dashboard)/`

**Shadcn Components Used**:
- `tabs` — "Inbox" tab and "Settings" tab
- `table` — Submission list (timestamp, preview, email status, expand action)
- `badge` — `email-status-badge` (sent / pending / failed) on each submission row
- `button` — "Export CSV"; "Save changes" in settings; "Delete form" destructive; row expand toggle
- `scroll-area` — Wraps the submission table to allow vertical scroll without page scroll
- `skeleton` — Loading placeholders for submission rows
- `input` — Form name field and redirect URL field in Settings tab
- `label` — Field labels in Settings tab
- `separator` — Between "Form settings" and "Danger zone" in Settings tab
- `dialog` — Delete-form confirmation (reuses `delete-form-dialog.tsx`)
- `alert` — Error state when inbox fails to load; URL validation hint in Settings
- `sonner` — "Settings saved"; "Copied!"; "CSV download starting"

**Custom Components (existing)**:
- `dashboard/sidebar.tsx`, `sidebar-nav.tsx`, `dashboard-header.tsx`, `user-menu.tsx`

**Custom Components (new)**:
- `dashboard/submission-table.tsx` — Renders paginated `table` of submissions; manages pagination state; calls `GET /api/v1/forms/{id}/submissions?page=&page_size=`
- `dashboard/submission-row.tsx` — Single submission row; shows `created_at`, one-line field preview, `email-status-badge`; toggling expands inline detail
- `dashboard/submission-detail.tsx` — Expanded row content: key-value list of all `data` fields
- `dashboard/email-status-badge.tsx` — `badge` with custom `.badge-success` / `.badge-warning` class derived from `email_status` enum
- `dashboard/csv-export-button.tsx` — `button` that fetches CSV via `apiClient`, builds a Blob, triggers download anchor; fires `sonner` toast
- `dashboard/form-snippet.tsx` — Renders the copy-pastable HTML `<form>` snippet inside a code block styled with `--color-code-surface`; uses `copy-button.tsx`
- `dashboard/form-settings-form.tsx` — Controlled form with `input` for name and `redirect_url`; submit calls `PATCH /api/v1/forms/{id}`
- `dashboard/copy-button.tsx` — Reused from Dashboard page (see above)
- `dashboard/delete-form-dialog.tsx` — Reused from Dashboard page (see above)

**State Management**:
- Active tab: local `useState` ("inbox" | "settings")
- Submissions: local state, fetched on mount and on page change
- Pagination: local `page` state
- Settings form: controlled local state; submit-then-refetch

---

### Default Submission Success (`/submitted`)

**Route**: `/submitted`
**Rendering**: SSR (static)
**Layout group**: `(marketing)/`

**Shadcn Components Used**:
- `card` — Centered message container (optional; a simple `div` is also acceptable)
- `button` — "Powered by FormSnap" link-button in footer area (ghost variant, small)

**Custom Components**: None — page is a single static component

---

### 404 Not Found (`/*`)

**Route**: `/*` (Next.js `not-found.tsx`)
**Rendering**: SSR
**Layout group**: root

**Shadcn Components Used**:
- `button` — "Go home" link-button

**Custom Components**: None

---

## Component Composition Patterns

### Form Row with DropdownMenu Actions

```tsx
<TableRow key={form.id}>
  <TableCell className="font-medium">{form.name}</TableCell>
  <TableCell>
    <Badge variant="secondary">{form.submission_count}</Badge>
  </TableCell>
  <TableCell className="text-muted-foreground text-sm">
    {form.last_submission_at ? formatRelative(form.last_submission_at) : "No submissions yet"}
  </TableCell>
  <TableCell>
    <DropdownMenu>
      <DropdownMenuTrigger className="cursor-pointer">
        {/* DropdownMenuTrigger renders its own button — do NOT wrap <Button> here */}
        <span className="sr-only">Open actions</span>
        <EllipsisHorizontalIcon className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => router.push(`/dashboard/forms/${form.id}`)}>
          Open inbox
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => copyToClipboard(endpointUrl(form.id))}>
          Copy endpoint URL
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive"
          onSelect={() => setDeleteTarget(form)}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </TableCell>
</TableRow>
```

### Create Form Dialog

```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button>New form</Button>
  </DialogTrigger>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle>Create a new form</DialogTitle>
      <DialogDescription>
        Give your form a name. You can set a redirect URL later in Settings.
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="form-name">Form name</Label>
        <Input id="form-name" placeholder="e.g. Contact form" value={name} onChange={…} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="redirect-url">Redirect URL (optional)</Label>
        <Input id="redirect-url" placeholder="https://yoursite.com/thanks" value={redirectUrl} onChange={…} />
        {urlError && <Alert variant="destructive"><AlertDescription>{urlError}</AlertDescription></Alert>}
      </div>
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
      <Button onClick={handleCreate} disabled={loading || !name.trim()}>
        {loading ? "Creating…" : "Create form"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Delete Form Confirmation (Destructive Dialog)

```tsx
<Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Delete "{deleteTarget?.name}"?</DialogTitle>
      <DialogDescription>
        This will permanently delete the form and all {deleteTarget?.submission_count} submissions.
        This action is irreversible.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
      <Button variant="destructive" onClick={handleDelete} disabled={loading}>
        {loading ? "Deleting…" : "Delete form"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Email Status Badge

```tsx
// dashboard/email-status-badge.tsx
const STATUS_MAP = {
  sent:    { className: "badge-success", label: "Notified" },
  pending: { className: "badge-warning", label: "Sending…" },
  failed:  { className: "",             label: "Not delivered", variant: "destructive" as const },
}

export function EmailStatusBadge({ status }: { status: "sent" | "pending" | "failed" }) {
  const { className, label, variant } = STATUS_MAP[status]
  return (
    <Badge variant={variant ?? "outline"} className={className}>
      {label}
    </Badge>
  )
}
```

### HTML Snippet Code Block

```tsx
// dashboard/form-snippet.tsx
export function FormSnippet({ formId, publicBaseUrl }: { formId: string; publicBaseUrl: string }) {
  const snippet = `<form action="${publicBaseUrl}/f/${formId}" method="POST">
  <input type="text" name="name" placeholder="Your name" />
  <input type="email" name="email" placeholder="Your email" />
  <textarea name="message" placeholder="Message"></textarea>
  <!-- Honeypot — leave hidden -->
  <input type="text" name="_gotcha" style="display:none" />
  <button type="submit">Send</button>
</form>`

  return (
    <div className="rounded-lg border border-[var(--color-code-border)] bg-[var(--color-code-surface)] p-4">
      <div className="flex items-start justify-between gap-2">
        <pre className="flex-1 overflow-x-auto font-mono text-sm text-[var(--color-code-foreground)] whitespace-pre">
          <code>{snippet}</code>
        </pre>
        <CopyButton text={snippet} />
      </div>
    </div>
  )
}
```

### User Menu (DropdownMenuLabel inside DropdownMenuGroup)

```tsx
// dashboard/user-menu.tsx (existing — ensure this pattern is used)
<DropdownMenuContent>
  <DropdownMenuGroup>
    <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
  </DropdownMenuGroup>
  <DropdownMenuSeparator />
  <DropdownMenuItem onSelect={signOut}>Sign out</DropdownMenuItem>
</DropdownMenuContent>
```

---

## Justification for Custom Components

| Custom Component | Reason not covered by Shadcn alone |
|------------------|------------------------------------|
| `form-list.tsx` | Orchestrates API fetch, loading/empty/error state, and passes data to table; domain logic |
| `form-list-empty-state.tsx` | Product-specific onboarding illustration + copy; reused in both `/dashboard` and submission inbox empty state |
| `form-row.tsx` | Encapsulates per-row state (delete target wiring) and action menu; domain-specific |
| `create-form-dialog.tsx` | URL validation logic + API call; not a pure composition |
| `delete-form-dialog.tsx` | Two-argument confirm dialog (form name + count); domain-specific content |
| `copy-button.tsx` | Clipboard API + `sonner` + animated icon state; reused in ≥ 3 places |
| `email-verification-gate.tsx` | Reads `ProfileContext`, conditionally disables CTA + shows `alert`; domain logic |
| `submission-table.tsx` | Pagination state + API calls + empty-state branch; domain logic |
| `submission-row.tsx` | Expand/collapse toggle state + preview rendering; domain-specific |
| `submission-detail.tsx` | Key-value renderer for arbitrary JSON payload; domain-specific |
| `email-status-badge.tsx` | Maps enum to custom badge classes; domain-specific |
| `csv-export-button.tsx` | Fetch-to-Blob download pattern + auth header; domain logic |
| `form-snippet.tsx` | Generates endpoint-specific HTML snippet with copy; domain-specific |
| `form-settings-form.tsx` | Controlled form with PATCH call + optimistic update; domain logic |
| `verify-email-card.tsx` | Firebase `sendEmailVerification` + polling; auth-domain logic |
| `hero-section.tsx` | Marketing-specific layout composition; single-use |
| `feature-grid.tsx` | 3-column card grid; single-use; keeps marketing page clean |
