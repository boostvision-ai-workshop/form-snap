# Design System — FormSnap

> Design source: **Priority 3 (PRD-only)**. No local HTML, Stitch prompt, or Figma URL was provided.
> All tokens below are derived from PRD §1 ("utility-first; a clean, restrained Shadcn-default look")
> and the existing `globals.css` palette. A single blue accent colour is introduced for the
> submission-endpoint copy-button and the primary CTA, consistent with a developer-tool aesthetic.

---

## CSS Custom Properties

All design tokens extend the existing `frontend/src/app/globals.css` `@theme inline` block.
The Engineer MUST add the FormSnap-specific tokens listed in the "FormSnap Extensions" section
to `globals.css` without replacing the Shadcn base tokens already there.

---

### Color Palette

The base neutral palette is already defined in `globals.css` and is re-stated here for
reference. FormSnap adds one accent colour family (blue) and a `code-surface` token for
the HTML-snippet code block.

#### Light mode (`:root`)

| Token | Value | Role |
|-------|-------|------|
| `--background` | `oklch(1 0 0)` | Page background (white) |
| `--foreground` | `oklch(0.145 0 0)` | Default text (near-black) |
| `--card` | `oklch(1 0 0)` | Card surface |
| `--card-foreground` | `oklch(0.145 0 0)` | Card text |
| `--primary` | `oklch(0.205 0 0)` | Primary button background |
| `--primary-foreground` | `oklch(0.985 0 0)` | Primary button text |
| `--secondary` | `oklch(0.97 0 0)` | Secondary button / muted surface |
| `--secondary-foreground` | `oklch(0.205 0 0)` | Secondary button text |
| `--muted` | `oklch(0.97 0 0)` | Muted / disabled surfaces |
| `--muted-foreground` | `oklch(0.556 0 0)` | Muted / placeholder text |
| `--destructive` | `oklch(0.577 0.245 27.325)` | Destructive actions (delete) |
| `--border` | `oklch(0.922 0 0)` | Borders and dividers |
| `--input` | `oklch(0.922 0 0)` | Input border |
| `--ring` | `oklch(0.708 0 0)` | Focus ring |

#### FormSnap Extensions (add to `:root`)

| Token | Value | Role |
|-------|-------|------|
| `--color-accent-blue` | `oklch(0.6 0.2 260)` | Primary CTA and link accent |
| `--color-accent-blue-hover` | `oklch(0.52 0.22 260)` | Hover state for blue accent |
| `--color-accent-blue-foreground` | `oklch(0.985 0 0)` | Text on blue accent |
| `--color-code-surface` | `oklch(0.965 0 0)` | Background for HTML snippet code block |
| `--color-code-foreground` | `oklch(0.25 0 0)` | Text inside code block |
| `--color-code-border` | `oklch(0.88 0 0)` | Border around code block |
| `--color-success` | `oklch(0.6 0.18 145)` | Success badge / email-sent status |
| `--color-warning` | `oklch(0.72 0.17 75)` | Warning badge / email-pending status |
| `--color-error` | `oklch(0.577 0.245 27.325)` | Error badge / email-failed status (reuses destructive) |

#### Dark mode (`.dark`)

The dark mode values below EXTEND the existing `.dark` block in `globals.css`.

| Token | Value | Role |
|-------|-------|------|
| `--color-accent-blue` | `oklch(0.68 0.18 260)` | Blue accent (lighter for dark bg) |
| `--color-accent-blue-hover` | `oklch(0.75 0.16 260)` | Hover (lighter still) |
| `--color-accent-blue-foreground` | `oklch(0.05 0 0)` | Text on blue accent in dark mode |
| `--color-code-surface` | `oklch(0.22 0 0)` | Code block surface in dark mode |
| `--color-code-foreground` | `oklch(0.85 0 0)` | Code text in dark mode |
| `--color-code-border` | `oklch(1 0 0 / 12%)` | Code block border in dark mode |
| `--color-success` | `oklch(0.68 0.16 145)` | Success in dark mode |
| `--color-warning` | `oklch(0.76 0.15 75)` | Warning in dark mode |

---

### Typography Scale

The project uses Geist Sans (sans) and Geist Mono (mono) loaded via `next/font` — already
wired up in the scaffold. No additional font loading is required.

| Token | Value | Role |
|-------|-------|------|
| `--font-sans` | `var(--font-geist-sans)` | Body and UI text (already set) |
| `--font-mono` | `var(--font-geist-mono)` | Code blocks, endpoint URL display (already set) |

#### Scale (Tailwind defaults — no custom overrides needed)

| Alias | rem value | px equivalent | Usage |
|-------|-----------|---------------|-------|
| `text-xs` | 0.75rem | 12px | Badge labels, helper text |
| `text-sm` | 0.875rem | 14px | Table cell text, input text, secondary labels |
| `text-base` | 1rem | 16px | Body text, card descriptions |
| `text-lg` | 1.125rem | 18px | Card headings, section subheadings |
| `text-xl` | 1.25rem | 20px | Page headings within dashboard |
| `text-2xl` | 1.5rem | 24px | Marketing hero subheading |
| `text-3xl` | 1.875rem | 30px | Marketing hero heading |
| `text-4xl` | 2.25rem | 36px | Marketing main headline |

Font weights used:
- `font-normal` (400) — body, table cells
- `font-medium` (500) — labels, secondary headings
- `font-semibold` (600) — card titles, page headings
- `font-bold` (700) — marketing hero headline, CTA buttons (sparingly)

Line heights:
- `leading-tight` (1.25) — headings
- `leading-normal` (1.5) — body text, input fields
- `leading-relaxed` (1.625) — longer description text in marketing sections

---

### Spacing System

4 px base grid. Tailwind's default spacing scale covers all needs — no custom tokens required.

| Token | rem | px | Common use |
|-------|-----|----|------------|
| `spacing-1` | 0.25rem | 4px | Icon gaps, tight padding |
| `spacing-2` | 0.5rem | 8px | Badge padding, small gaps |
| `spacing-3` | 0.75rem | 12px | Input inner padding, row gaps |
| `spacing-4` | 1rem | 16px | Card padding, section gutters |
| `spacing-5` | 1.25rem | 20px | Form field groups |
| `spacing-6` | 1.5rem | 24px | Card padding (desktop), main content padding |
| `spacing-8` | 2rem | 32px | Section vertical gaps |
| `spacing-10` | 2.5rem | 40px | Hero section inner padding |
| `spacing-12` | 3rem | 48px | Marketing section separators |
| `spacing-16` | 4rem | 64px | Marketing hero vertical padding |

---

### Border Radius

All radius values derive from the existing `--radius: 0.625rem` variable (already in `globals.css`)
via the `@theme inline` mappings. No new tokens needed.

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | `calc(var(--radius) * 0.6)` ≈ 0.375rem | Badge, small chips |
| `--radius-md` | `calc(var(--radius) * 0.8)` ≈ 0.5rem | Input fields, buttons |
| `--radius-lg` | `var(--radius)` = 0.625rem | Cards, dialogs |
| `--radius-xl` | `calc(var(--radius) * 1.4)` ≈ 0.875rem | Larger panels |
| `--radius-full` | `9999px` | Avatar, pill badges (use `rounded-full`) |

---

### Shadows

Tailwind default shadow scale is used. No custom shadow tokens required.

| Class | Usage |
|-------|-------|
| `shadow-sm` | Subtle card lift on hover |
| `shadow-md` | Dialog / Sheet overlay |
| `shadow-lg` | Dropdown menus |

---

## Component Defaults

| Element | Default value |
|---------|--------------|
| Button height (base) | `h-9` (36px via Shadcn default) |
| Input height (base) | `h-9` (36px via Shadcn default) |
| Card padding | `p-6` (24px) |
| Dashboard sidebar width | `w-64` (256px, collapsible to icon-only `w-14`) |
| Dashboard content max-width | none (full remaining width after sidebar) |
| Marketing content max-width | `max-w-6xl` (1152px) centered |
| Dialog max-width | `max-w-md` (448px) for simple forms; `max-w-lg` (512px) for form-detail settings |
| Table row height | `h-12` (48px) |
| Code block padding | `p-4` (16px) |

---

## FormSnap-Specific Usage Notes

### Accent Blue

The blue accent (`--color-accent-blue`) is used exclusively for:
1. The "Copy" button when in active/copied state (brief flash, then reverts to default)
2. The primary marketing CTA ("Get started") button
3. Inline links in email-notification-failed warning text

All other primary actions use the default Shadcn `--primary` (near-black / near-white in dark mode)
to keep the UI restrained and developer-focused.

### Code Block (HTML Snippet)

The copy-pastable `<form>` snippet and the endpoint URL display use `font-mono`,
`bg-[var(--color-code-surface)]`, `text-[var(--color-code-foreground)]`,
and `border border-[var(--color-code-border)]` with `rounded-lg` and `p-4`.

### Email Status Badge

The `email-status-badge` component maps `email_status` values to Shadcn `Badge` variants:

| `email_status` | Badge color token | Label |
|----------------|-------------------|-------|
| `sent` | `--color-success` | Notified |
| `pending` | `--color-warning` | Sending… |
| `failed` | `--color-error` | Not delivered |

These require a custom CSS class (`.badge-success`, `.badge-warning`) added to `globals.css`
since Shadcn Badge only ships `default`, `secondary`, `destructive`, and `outline` variants.

```css
/* Add to globals.css @layer base or @layer components */
.badge-success {
  background-color: var(--color-success);
  color: oklch(0.985 0 0);
}
.badge-warning {
  background-color: var(--color-warning);
  color: oklch(0.145 0 0);
}
```

### Dark Mode

All pages inherit dark mode from the existing `next-themes` setup. No page-level dark mode
overrides are needed. The FormSnap extension tokens defined above include dark mode values
inside the `.dark` selector block.

---

## Implementation Notes

- Colors use OKLCH for perceptual uniformity throughout (consistent with existing `globals.css`).
- Spacing follows a strict 4 px grid via Tailwind's default scale.
- No `tailwind.config.js` modifications — all tokens live in `globals.css` via `@theme inline`.
- The Shadcn base neutral palette stays unchanged; FormSnap only adds the six extension tokens.
- Visual references are unavailable (Priority 3 — PRD-only source). The UI Polish Phase is not
  available for this project. The design system above represents the intended visual baseline.

> No visual references available — UI Polish Phase will be unavailable.
