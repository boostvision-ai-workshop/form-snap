# Design System — FormSnap

> Design source: **Priority 0 (Local PNG mockup + SVG icon)**.
> All tokens are derived directly from:
> - `docs/prd/form-snap.svg` — authoritative brand palette (gradient stops, sparkle, neutral surfaces)
> - `docs/prd/formsnap_prd_design.png` — full 12-surface UI mockup (spacing, typography, table density, card radius, status colors, muted text, sidebar chrome)
>
> Every color token in this file traces to one of those two sources. Hex values recorded from
> sampling; OKLCH values are the canonical form used in `globals.css`.

---

## CSS Custom Properties

All design tokens are defined as CSS custom properties. The Engineer MUST update
`frontend/src/app/globals.css` to replace the existing FormSnap extension tokens with
the values below, and to override the Shadcn neutral palette where noted.

Tailwind v4 syntax: tokens live in `:root` / `.dark` blocks; Tailwind utilities that
reference them are wired through the existing `@theme inline` block in `globals.css`.

---

## Color Palette

### Brand Colors (from `docs/prd/form-snap.svg` gradient stops)

| Token | OKLCH | Hex origin | Role |
|-------|-------|------------|------|
| `--brand-cyan` | `oklch(0.77 0.16 215)` | `#29B6F6` | Brand icon start stop; accent sparkle start |
| `--brand-blue` | `oklch(0.50 0.22 264)` | `#4361EE` | Primary CTA, active nav, published badge, chart fill |
| `--brand-violet` | `oklch(0.41 0.26 290)` | `#8A2BE2` | Brand icon end stop; gradient terminus |
| `--sparkle-start` | `oklch(0.68 0.18 225)` | `#2DA9FF` | Sparkle gradient start (hero CTA gradient) |
| `--sparkle-end` | `oklch(0.50 0.28 302)` | `#B62CFF` | Sparkle gradient end |

### Semantic / Functional Colors (sampled from mockup)

These override or extend the Shadcn base. Replace corresponding values in `:root`.

#### Light mode (`:root`)

| Token | OKLCH | Hex origin | Role |
|-------|-------|------------|------|
| `--background` | `oklch(0.977 0.008 264)` | `#F6F7FF` | Page background — lavender-tinted, NOT pure white |
| `--foreground` | `oklch(0.22 0.02 264)` | `#1A1D2E` | Default text (near-navy) |
| `--card` | `oklch(1 0 0)` | `#FFFFFF` | Card, sidebar, header surface |
| `--card-foreground` | `oklch(0.22 0.02 264)` | `#1A1D2E` | Card body text |
| `--popover` | `oklch(1 0 0)` | `#FFFFFF` | Dropdown / popover surface |
| `--popover-foreground` | `oklch(0.22 0.02 264)` | `#1A1D2E` | Dropdown text |
| `--primary` | `oklch(0.50 0.22 264)` | `#4361EE` | Primary button fill; active nav accent |
| `--primary-foreground` | `oklch(1 0 0)` | `#FFFFFF` | Text on primary blue |
| `--secondary` | `oklch(0.956 0.018 264)` | `#EEF2FF` | Secondary button / chip / badge surface |
| `--secondary-foreground` | `oklch(0.50 0.22 264)` | `#4361EE` | Text on secondary surface |
| `--muted` | `oklch(0.965 0.01 264)` | `#F0F2FB` | Muted / disabled surfaces, table hover |
| `--muted-foreground` | `oklch(0.58 0.06 264)` | `#8B91B3` | Muted / placeholder / meta text |
| `--accent` | `oklch(0.956 0.018 264)` | `#EEF2FF` | Nav item hover / focus background |
| `--accent-foreground` | `oklch(0.50 0.22 264)` | `#4361EE` | Nav item hover text |
| `--destructive` | `oklch(0.577 0.245 27.3)` | `#DC2626` | Delete actions, error badges |
| `--border` | `oklch(0.913 0.022 264)` | `#E2E6F9` | Card borders, table dividers, sidebar dividers |
| `--input` | `oklch(0.913 0.022 264)` | `#E2E6F9` | Input border (unfocused) |
| `--ring` | `oklch(0.50 0.22 264)` | `#4361EE` | Focus ring — brand blue |

#### Sidebar-specific tokens (`:root`)

| Token | OKLCH | Hex origin | Role |
|-------|-------|------------|------|
| `--sidebar` | `oklch(1 0 0)` | `#FFFFFF` | Sidebar background |
| `--sidebar-foreground` | `oklch(0.22 0.02 264)` | `#1A1D2E` | Sidebar text |
| `--sidebar-primary` | `oklch(0.50 0.22 264)` | `#4361EE` | Active nav item accent |
| `--sidebar-primary-foreground` | `oklch(0.50 0.22 264)` | `#4361EE` | Active nav item text |
| `--sidebar-accent` | `oklch(0.956 0.018 264)` | `#EEF2FF` | Nav item hover background |
| `--sidebar-accent-foreground` | `oklch(0.50 0.22 264)` | `#4361EE` | Nav item hover text |
| `--sidebar-border` | `oklch(0.913 0.022 264)` | `#E2E6F9` | Sidebar right border |
| `--sidebar-ring` | `oklch(0.50 0.22 264)` | `#4361EE` | Sidebar focus ring |

#### Chart tokens (`:root`)

| Token | OKLCH | Role |
|-------|-------|------|
| `--chart-1` | `oklch(0.50 0.22 264)` | Brand blue — primary data series |
| `--chart-2` | `oklch(0.77 0.16 215)` | Cyan — secondary series |
| `--chart-3` | `oklch(0.41 0.26 290)` | Violet — tertiary series |
| `--chart-4` | `oklch(0.72 0.17 75)` | Amber — quaternary |
| `--chart-5` | `oklch(0.58 0.06 264)` | Muted blue-gray — baseline/grid |

#### FormSnap semantic extensions (`:root`)

| Token | OKLCH | Hex origin | Role |
|-------|-------|------------|------|
| `--color-brand-blue` | `oklch(0.50 0.22 264)` | `#4361EE` | Alias for primary; use for gradient CSS |
| `--color-brand-blue-hover` | `oklch(0.44 0.22 264)` | `#3451D1` | Hover on brand-blue buttons |
| `--color-neutral-surface` | `oklch(0.977 0.008 264)` | `#F6F7FF` | Page background (same as --background) |
| `--color-chip-blue` | `oklch(0.93 0.028 264)` | `#CDD4F9` | Blue chip/pill background |
| `--color-chip-lavender` | `oklch(0.944 0.022 264)` | `#DCE6FF` | Folder/tag chip background |
| `--color-chip-violet` | `oklch(0.955 0.018 280)` | `#EDEBFF` | Violet chip/pill background |
| `--color-success` | `oklch(0.64 0.17 142)` | `#22C55E` | Success indicator, email-sent badge |
| `--color-success-surface` | `oklch(0.962 0.05 142)` | `#DCFCE7` | Success badge background |
| `--color-warning` | `oklch(0.72 0.17 75)` | `#F59E0B` | Warning indicator, email-pending badge |
| `--color-warning-surface` | `oklch(0.97 0.055 90)` | `#FEF3C7` | Warning badge background |
| `--color-error` | `oklch(0.577 0.245 27.3)` | `#DC2626` | Error / destructive (reuses --destructive) |
| `--color-error-surface` | `oklch(0.972 0.06 27.3)` | `#FEE2E2` | Error badge background |
| `--color-published` | `oklch(0.50 0.22 264)` | `#4361EE` | Published status badge text |
| `--color-published-surface` | `oklch(0.956 0.018 264)` | `#EEF2FF` | Published status badge background |
| `--color-draft-surface` | `oklch(0.965 0.01 264)` | `#F0F2FB` | Draft status badge background |
| `--color-draft` | `oklch(0.58 0.06 264)` | `#8B91B3` | Draft status badge text |
| `--color-code-surface` | `oklch(0.965 0.01 264)` | `#F0F2FB` | HTML snippet code block background |
| `--color-code-foreground` | `oklch(0.25 0.02 264)` | `#22263A` | Code block text |
| `--color-code-border` | `oklch(0.913 0.022 264)` | `#E2E6F9` | Code block border |

#### CTA Gradient (hero + primary CTA buttons)

The sparkle gradient from PRD §0.1 is used for the marketing hero primary CTA button
and the "Create form" / "Publish" / "Upgrade" primary app CTAs.

```css
/* Add to globals.css @layer components */
.btn-gradient {
  background: linear-gradient(135deg, var(--sparkle-start), var(--sparkle-end));
  color: oklch(1 0 0);
}
.btn-gradient:hover {
  background: linear-gradient(135deg, oklch(0.63 0.18 225), oklch(0.45 0.28 302));
  color: oklch(1 0 0);
}
```

Alternatively, for solid-blue CTAs (app dashboard primary actions), use `bg-primary text-primary-foreground`.

---

#### Dark mode (`.dark`)

| Token | OKLCH | Role |
|-------|-------|------|
| `--background` | `oklch(0.155 0.015 264)` | Dark page background (deep navy) |
| `--foreground` | `oklch(0.96 0.008 264)` | Primary text (near white, slight blue tint) |
| `--card` | `oklch(0.21 0.018 264)` | Card / panel background |
| `--card-foreground` | `oklch(0.96 0.008 264)` | Card text |
| `--popover` | `oklch(0.21 0.018 264)` | Popover background |
| `--popover-foreground` | `oklch(0.96 0.008 264)` | Popover text |
| `--primary` | `oklch(0.60 0.20 264)` | Primary buttons (lightened for dark bg) |
| `--primary-foreground` | `oklch(1 0 0)` | Text on primary |
| `--secondary` | `oklch(0.26 0.025 264)` | Secondary surface dark |
| `--secondary-foreground` | `oklch(0.78 0.12 264)` | Secondary text dark |
| `--muted` | `oklch(0.26 0.025 264)` | Muted surface dark |
| `--muted-foreground` | `oklch(0.65 0.04 264)` | Muted text dark |
| `--accent` | `oklch(0.26 0.025 264)` | Accent surface dark |
| `--accent-foreground` | `oklch(0.78 0.12 264)` | Accent text dark |
| `--destructive` | `oklch(0.70 0.19 22.2)` | Destructive dark |
| `--border` | `oklch(1 0 0 / 10%)` | Border dark (translucent white) |
| `--input` | `oklch(1 0 0 / 15%)` | Input border dark |
| `--ring` | `oklch(0.60 0.20 264)` | Focus ring dark |
| `--sidebar` | `oklch(0.21 0.018 264)` | Sidebar dark |
| `--sidebar-foreground` | `oklch(0.96 0.008 264)` | Sidebar text dark |
| `--sidebar-primary` | `oklch(0.60 0.20 264)` | Nav active dark |
| `--sidebar-primary-foreground` | `oklch(1 0 0)` | Nav active text dark |
| `--sidebar-accent` | `oklch(0.30 0.03 264)` | Nav hover background dark |
| `--sidebar-accent-foreground` | `oklch(0.78 0.12 264)` | Nav hover text dark |
| `--sidebar-border` | `oklch(1 0 0 / 10%)` | Sidebar border dark |
| `--sidebar-ring` | `oklch(0.60 0.20 264)` | Sidebar ring dark |
| `--color-success` | `oklch(0.70 0.15 142)` | Success dark |
| `--color-success-surface` | `oklch(0.26 0.06 142)` | Success surface dark |
| `--color-warning` | `oklch(0.76 0.15 75)` | Warning dark |
| `--color-warning-surface` | `oklch(0.26 0.055 75)` | Warning surface dark |
| `--color-code-surface` | `oklch(0.22 0.018 264)` | Code block background dark |
| `--color-code-foreground` | `oklch(0.85 0.01 264)` | Code block text dark |
| `--color-code-border` | `oklch(1 0 0 / 12%)` | Code block border dark |
| `--color-published` | `oklch(0.68 0.16 264)` | Published badge text dark |
| `--color-published-surface` | `oklch(0.26 0.03 264)` | Published badge bg dark |
| `--sparkle-start` | `oklch(0.68 0.18 225)` | Sparkle start (slightly lighter for dark) |
| `--sparkle-end` | `oklch(0.55 0.28 302)` | Sparkle end dark |

---

## Typography Scale

### Font Families

The project uses **Inter** (or the existing Geist Sans) for body/UI and **Geist Mono** for code.
The mockup shows a clean geometric sans-serif very close to Inter.

| Token | Value | Role |
|-------|-------|------|
| `--font-sans` | `var(--font-geist-sans)` | All UI text, labels, buttons |
| `--font-mono` | `var(--font-geist-mono)` | Code blocks, endpoint URL, snippet display |

### Type Scale (sampled from mockup at 1440px)

| Tailwind class | rem | px | Usage |
|---------------|-----|----|-------|
| `text-xs` | 0.75rem | 12px | Badge labels, helper text, timestamps in table |
| `text-sm` | 0.875rem | 14px | Table cell text, input text, nav labels, card meta |
| `text-base` | 1rem | 16px | Card body text, dialog descriptions |
| `text-lg` | 1.125rem | 18px | Card headings, section subheadings |
| `text-xl` | 1.25rem | 20px | Page title in dashboard header |
| `text-2xl` | 1.5rem | 24px | Section headings, KPI card values |
| `text-3xl` | 1.875rem | 30px | Marketing sub-headline |
| `text-4xl` | 2.25rem | 36px | Marketing hero headline |
| `text-5xl` | 3rem | 48px | Marketing hero main headline (bold) |

### Font Weights

| Class | Weight | Usage |
|-------|--------|-------|
| `font-normal` | 400 | Body text, table cells, nav items (inactive) |
| `font-medium` | 500 | Labels, secondary headings, button text |
| `font-semibold` | 600 | Card titles, page headings, KPI values |
| `font-bold` | 700 | Marketing hero headline |

### Line Heights

| Class | Value | Usage |
|-------|-------|-------|
| `leading-tight` | 1.25 | Headings, KPI numbers |
| `leading-snug` | 1.375 | Card titles, subheadings |
| `leading-normal` | 1.5 | Body text, input fields |
| `leading-relaxed` | 1.625 | Marketing description text |

---

## Spacing System

4 px base grid. All values from Tailwind's default scale — no custom tokens required.

| Token | rem | px | Common use in mockup |
|-------|-----|----|----------------------|
| `spacing-1` | 0.25rem | 4px | Icon gaps, badge inner padding |
| `spacing-2` | 0.5rem | 8px | Row gaps, chip padding |
| `spacing-3` | 0.75rem | 12px | Table cell padding (vertical) |
| `spacing-4` | 1rem | 16px | Card padding (mobile), section gutters |
| `spacing-5` | 1.25rem | 20px | Form field gaps |
| `spacing-6` | 1.5rem | 24px | Card padding (desktop), dialog padding |
| `spacing-8` | 2rem | 32px | Section vertical gaps |
| `spacing-10` | 2.5rem | 40px | Hero section inner padding |
| `spacing-12` | 3rem | 48px | Marketing section separators |
| `spacing-16` | 4rem | 64px | Marketing hero vertical padding |

---

## Border Radius

Sampled from the mockup — card corners and buttons are noticeably rounded.

| Token | Value | Computed | Usage |
|-------|-------|----------|-------|
| `--radius` | `0.625rem` | 10px | Base radius variable (existing) |
| `--radius-sm` | `calc(var(--radius) * 0.6)` | ~6px | Badge pills, small chips |
| `--radius-md` | `calc(var(--radius) * 0.8)` | ~8px | Input fields, buttons |
| `--radius-lg` | `var(--radius)` | 10px | Cards, dialogs, panels |
| `--radius-xl` | `calc(var(--radius) * 1.4)` | ~14px | Larger modal panels |
| `--radius-full` | `9999px` | — | Status pill badges, avatar |

Mockup-specific observations:
- Card border-radius: `10px` (`rounded-[10px]` or `rounded-lg`)
- Status badge pills: fully rounded (`rounded-full`)
- Button border-radius: `8px` (`rounded-md`)
- Input fields: `8px` (`rounded-md`)
- Primary CTA buttons: `8px` (`rounded-md`)
- Pricing "Most popular" card: `12px` (`rounded-xl`)

---

## Shadows

Sampled from the mockup — cards have a subtle lavender-tinted shadow.

| Token / class | Value | Usage |
|--------------|-------|-------|
| `shadow-sm` | `0 1px 3px oklch(0.50 0.22 264 / 8%)` | Cards at rest (recommended custom value) |
| `shadow-md` | `0 4px 12px oklch(0.50 0.22 264 / 12%)` | Dialogs, dropdowns, popovers |
| `shadow-lg` | `0 8px 24px oklch(0.50 0.22 264 / 16%)` | Modals, sheet overlays |

Add these to `globals.css` `@theme inline` as custom shadow tokens:

```css
@theme inline {
  /* ... existing tokens ... */
  --shadow-card: 0 1px 3px oklch(0.50 0.22 264 / 8%);
  --shadow-dialog: 0 4px 12px oklch(0.50 0.22 264 / 12%);
  --shadow-modal: 0 8px 24px oklch(0.50 0.22 264 / 16%);
}
```

---

## Component Defaults

Derived from mockup measurements.

| Element | Value | Notes |
|---------|-------|-------|
| Button height (base) | `h-9` (36px) | Shadcn default; matches mockup |
| Button height (large CTA) | `h-11` (44px) | Hero CTA, "New form", "Create form" |
| Input height | `h-9` (36px) | Standard inputs |
| Card padding | `p-6` (24px) | Dashboard cards |
| Card border-radius | `rounded-lg` (10px) | All cards, dialogs |
| Dashboard sidebar width | `w-60` (240px) | Measured from mockup; collapsible to `w-14` |
| Dashboard header height | `h-14` (56px) | Measured from mockup |
| Dashboard content max-width | none | Full remaining width after sidebar |
| Marketing content max-width | `max-w-6xl` (1152px) | Centered |
| Dialog max-width | `max-w-md` (448px) | Simple forms; `max-w-lg` (512px) for settings |
| Table row height | `h-12` (48px) | Standard data table rows |
| Table cell padding | `px-4 py-3` | 16px horizontal, 12px vertical |
| Nav item height | `h-9` (36px) | Sidebar nav items |
| KPI card value size | `text-2xl font-semibold` | Dashboard KPI numbers |
| Badge height | `h-5` / `h-6` | Status pills |
| Code block padding | `p-4` (16px) | HTML snippet block |
| Section gap (dashboard) | `gap-6` (24px) | Between page sections |

---

## Status Badge System

Derived from mockup form status and submission email status indicators.

### Form Status Badges (Forms list, form detail)

| Status | Background token | Text token | Class |
|--------|-----------------|------------|-------|
| `published` | `--color-published-surface` = `#EEF2FF` | `--color-published` = `#4361EE` | `badge-published` |
| `draft` | `--color-draft-surface` = `#F0F2FB` | `--color-draft` = `#8B91B3` | `badge-draft` |
| `archived` | `--muted` | `--muted-foreground` | Shadcn `secondary` variant |

### Email Status Badges (Submission rows)

| `email_status` | Background | Text | Class | Label |
|----------------|-----------|------|-------|-------|
| `sent` | `--color-success-surface` | `--color-success` | `badge-success` | Notified |
| `pending` | `--color-warning-surface` | `--color-warning` | `badge-warning` | Sending… |
| `failed` | Shadcn `destructive` | — | Shadcn `destructive` variant | Not delivered |

Add to `globals.css` `@layer components`:

```css
@layer components {
  .badge-published {
    background-color: var(--color-published-surface);
    color: var(--color-published);
    border: none;
  }
  .badge-draft {
    background-color: var(--color-draft-surface);
    color: var(--color-draft);
    border: none;
  }
  .badge-success {
    background-color: var(--color-success-surface);
    color: var(--color-success);
    border: none;
  }
  .badge-warning {
    background-color: var(--color-warning-surface);
    color: var(--color-warning);
    border: none;
  }
}
```

---

## Icon System

Mockup uses **line icons** throughout — consistent stroke-weight, no filled/solid icons
except for filled checkmark circle on the success (`/submitted`) page.

- Library: `lucide-react` (already in stack; matches mockup's line-icon aesthetic)
- Size: `h-4 w-4` (16px) for inline UI icons; `h-5 w-5` (20px) for nav icons; `h-6 w-6` for card icons
- Color: `text-muted-foreground` for decorative; `text-primary` for active/brand; `text-destructive` for danger

---

## Gradient CTA Usage Rules

From PRD §0.1 and mockup row 1 (hero) and row 3 (pricing):

| Surface | Gradient style | When to use |
|---------|---------------|-------------|
| Marketing hero "Get started free" | `linear-gradient(135deg, var(--sparkle-start), var(--sparkle-end))` | Primary marketing CTA only |
| Pricing "Most popular" card CTA | Same sparkle gradient | Upgrade / Start free trial on highlighted tier |
| App "New form" button | Solid `bg-primary text-primary-foreground` (`#4361EE`) | App primary actions |
| App "Publish" button | Solid `bg-primary` | Publish, Save, Upgrade in app |
| App "Create form" dialog submit | Solid `bg-primary` | Dialog confirms |

---

## Mockup Row-to-Token Mapping Reference

| Mockup row | Key visual observations | Tokens derived |
|-----------|------------------------|----------------|
| Row 1 — Marketing | Lavender background, gradient hero CTA, white card for "Trusted by" | `--background`, `--sparkle-start/end`, `--card` |
| Row 2 — Auth panels | White card, thin border, blue focus ring, muted sub-labels | `--border`, `--ring`, `--muted-foreground` |
| Row 3 — Pricing | 4-column cards; "Most popular" blue-filled card; gradient CTA | `--primary`, sparkle gradient |
| Row 4 — Dashboard KPI | White cards, shadow-sm, KPI value `text-2xl font-semibold`, blue chart | `--chart-1`, `shadow-card` |
| Row 5 — Forms list | White table, `--border` row dividers, `badge-published` / `badge-draft` | status badge tokens |
| Row 6 — Builder | 3-column layout, left/right panels white, center `--background` | sidebar token, `--muted` canvas |
| Row 7 — Submissions | Table density `h-12`, `badge-success`/`badge-warning`, `--muted-foreground` meta | email status badge tokens |
| Row 8 — Analytics | Bar/donut charts brand blue; KPI cards | `--chart-1` through `--chart-3` |
| Row 9 — Settings | Card sections, label/input pairs, `separator` between sections | spacing, `--border` |
| Row 10 — Billing | Plan card blue, invoice table, usage meter | `--primary`, `--chart-1` |
| Row 11 — Team | Member table, role badge, avatar | `--border`, avatar tokens |
| Row 12 — Integrations | 3-col vendor cards, "Connect" outline button | `--card`, `--border` |

---

## Implementation Notes

1. **Replace `--background: oklch(1 0 0)` with `oklch(0.977 0.008 264)`** in `:root` — the page
   background is a very light lavender, NOT pure white. Cards stay white (`--card: oklch(1 0 0)`).
2. **Replace `--primary: oklch(0.205 0 0)` with `oklch(0.50 0.22 264)`** — brand blue replaces the
   default near-black primary. This propagates to all primary buttons, focus rings, active nav.
3. **Update `--ring` to `oklch(0.50 0.22 264)`** — focus rings should be brand blue.
4. **Sidebar width**: change from `w-64` (256px) to `w-60` (240px) to match mockup.
5. All spacing follows a 4 px grid via Tailwind's default scale.
6. No `tailwind.config.js` modifications — all tokens live in `globals.css` via `@theme inline` and `:root`.
7. Colors use OKLCH for perceptual uniformity (consistent with existing `globals.css`).
8. The brand gradient (`--sparkle-start` → `--sparkle-end`) is reserved for high-emphasis CTAs only;
   overuse dilutes brand impact.
9. Dark mode tokens shift the entire palette toward deep navy while preserving brand blue hue.
