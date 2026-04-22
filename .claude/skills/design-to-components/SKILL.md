---
name: design-to-components
description: Step-by-step process for mapping designs to Shadcn UI components
---

# Design to Components Skill

## When to Use

Use this skill when the Designer agent needs to map design sources (local HTML, Stitch MCP, Figma designs, or PRD descriptions) to the available Shadcn UI component library and define the component structure for implementation. This skill is invoked during Phase 2 of the development workflow.

## Prerequisites

- `docs/prd/PRD.md` exists (required)
- `docs/specs/technical-spec.md` from Phase 1 (required)
- Local HTML file (optional — highest priority design source)
- Stitch design prompt (optional — second priority design source)
- Figma URL (optional — third priority design source)
- PRD descriptions (fallback — lowest priority)

## Available Shadcn Components

The template includes 22 pre-installed Shadcn UI v2 components (Base UI, not Radix). All components are in `frontend/src/components/ui/` and **MUST NOT be modified**.

| Component | Use Case |
|-----------|----------|
| **alert** | Alert messages and notifications (info, warning, error, success) |
| **avatar** | User profile images with fallback initials |
| **badge** | Status indicators, tags, labels, and categorical markers |
| **button** | Primary actions, CTAs, form submissions, navigation triggers |
| **card** | Content containers with optional header, body, and footer sections |
| **checkbox** | Boolean form inputs for multi-select options |
| **command** | Command palette, search autocomplete, keyboard shortcuts |
| **dialog** | Modal dialogs for confirmations, forms, or focused content |
| **dropdown-menu** | Context menus, action menus, user menus (renders own button) |
| **input-group** | Text inputs with prefix/suffix decorators (icons, labels) |
| **input** | Standard text form inputs (text, email, password, etc.) |
| **label** | Form field labels with accessibility support |
| **scroll-area** | Scrollable content regions with custom scrollbar styling |
| **select** | Dropdown selection inputs for single-choice options |
| **separator** | Visual dividers between sections or list items |
| **sheet** | Slide-out panels from top, right, bottom, or left edges |
| **skeleton** | Loading state placeholders for content that's being fetched |
| **sonner** | Toast notifications for feedback (success, error, info) |
| **switch** | Toggle controls for on/off boolean settings |
| **table** | Data tables with sortable columns and row actions |
| **tabs** | Tabbed content sections for organizing related information |
| **textarea** | Multi-line text inputs for longer form content |

## Step-by-Step Process

### Step 1: Analyze Design Source

This skill supports a 4-tier design source priority. Use the highest-priority source available:

**PRIORITY 0: If local HTML file is provided (HIGHEST PRIORITY)**:
- Read the HTML file(s) using the Read tool
- Analyze inline/embedded CSS for design tokens (colors, fonts, spacing, layout patterns)
- Extract component patterns from HTML structure
- Identify reusable component patterns
- Document design tokens from CSS
- Use Playwright to render the HTML and capture screenshots for visual references

**PRIORITY 1: If Stitch design prompt is available**:
- Use Stitch MCP tools to generate screens from text prompt
- Call `create_project` to create a new Stitch project
- Call `generate_screen_from_text` with the design prompt (specify deviceType: MOBILE/DESKTOP/TABLET/AGNOSTIC)
- Retrieve generated HTML/CSS using `get_screen_code`
- Retrieve design screenshots using `get_screen_image`
- Extract component patterns from generated output (analyze HTML structure, CSS classes, layout patterns)
- Identify reusable component patterns in generated code
- Document design tokens (colors, spacing, typography) from CSS output

**PRIORITY 2: If Figma URL is available**:
- Use Figma MCP tools to read component tree
- Extract design tokens (colors, spacing, typography)
- Identify reusable component patterns
- Take screenshots of key screens for reference

**PRIORITY 3: If neither (PRD-only mode — fallback)**:
- Extract page descriptions from PRD
- Identify UI elements mentioned (buttons, forms, tables, etc.)
- Infer layout from user stories (e.g., "user sees a list of posts" → table or card grid)
- Use PRD wireframes or mockups if included

### Step 2: Identify All Pages and Sections

From PRD and technical spec, list every page that needs to be built:

**Example Structure**:
```markdown
## Pages

### Marketing (root)
- Landing page (/)
- About page (/about)
- Pricing page (/pricing)

### Auth ((auth)/)
- Login page ((auth)/login)
- Signup page ((auth)/signup)
- Reset password ((auth)/reset-password)

### Dashboard ((dashboard)/)
- Dashboard home ((dashboard)/)
- Settings page ((dashboard)/settings)
- Profile page ((dashboard)/profile)
```

For each page, break down into sections (header, hero, content, sidebar, footer, etc.).

### Step 3: Map Sections to Shadcn Components

For each section identified, find the closest Shadcn component match using the decision tree below.

### Component Mapping Decision Tree

```
┌─────────────────────────────────────────────┐
│  Design Element to Map                      │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│  Does a Shadcn component exist for this?     │
│  (Check Available Shadcn Components table)   │
└──────────┬───────────────────────────────────┘
           │
           ├─── YES ─────────────────────────────────────┐
           │                                             │
           │  Use the Shadcn component as-is             │
           │  (Import from frontend/src/components/ui/)  │
           │                                             │
           └─────────────────────────────────────────────┘
           │
           ├─── MAYBE (can compose) ──────────────────┐
           │                                          │
           │  Compose multiple Shadcn components      │
           │  Example: Card + Avatar + Button         │
           │           = User Profile Card            │
           │                                          │
           └──────────────────────────────────────────┘
           │
           └─── NO ──────────────────────────────────┐
                                                     │
                Is it domain-specific logic?         │
                                                     │
                ├─── YES ────────────────────────────┤
                │                                    │
                │  Create custom component in:       │
                │  - frontend/src/components/auth/   │
                │  - frontend/src/components/dashboard/ │
                │  - frontend/src/components/marketing/ │
                │                                    │
                └────────────────────────────────────┘
```

**Examples**:

| Design Element | Shadcn Match | Custom Component | Reasoning |
|----------------|--------------|------------------|-----------|
| Login form | input, label, button | login-form.tsx | Auth-specific, combines Shadcn primitives |
| User menu | dropdown-menu | user-menu.tsx | Dashboard-specific, uses DropdownMenu |
| Pricing cards | card, button, badge | N/A (use Shadcn directly) | Composable from existing |
| Sidebar navigation | N/A | sidebar-nav.tsx | Dashboard-specific layout |
| Data table with filters | table, input, select | N/A (use Shadcn directly) | Composable from existing |

### Step 4: Define Custom Components

For elements that don't map to Shadcn components, define custom components following the existing organization pattern.

**Component Organization**:

```
frontend/src/components/
├── auth/
│   ├── auth-guard.tsx          (Already exists — wraps protected routes)
│   ├── login-form.tsx          (Already exists — login form with Firebase)
│   ├── signup-form.tsx         (Already exists — signup form with Firebase)
│   └── social-buttons.tsx      (Already exists — OAuth buttons)
├── dashboard/
│   ├── dashboard-header.tsx    (Already exists — top navigation bar)
│   ├── sidebar.tsx             (Already exists — collapsible sidebar)
│   ├── sidebar-nav.tsx         (Already exists — navigation links)
│   └── user-menu.tsx           (Already exists — user dropdown menu)
├── marketing/
│   ├── marketing-header.tsx    (Already exists — public site header)
│   └── marketing-footer.tsx    (Already exists — public site footer)
└── ui/                         (DO NOT MODIFY — Shadcn components)
    ├── alert.tsx
    ├── avatar.tsx
    ├── badge.tsx
    └── ... (22 components total)
```

**When to create new custom components**:
- Domain-specific business logic (e.g., `subscription-status.tsx` for SaaS billing)
- Complex compositions used across multiple pages (e.g., `data-table-with-filters.tsx`)
- Feature-specific UI not covered by Shadcn (e.g., `analytics-chart.tsx`)

### Step 5: Define Component Hierarchy Per Page

For each page, document the component tree from layout to leaf components.

**Example**:

```markdown
## Page: Dashboard Home ((dashboard)/)

### Layout Hierarchy
```
DashboardLayout (from (dashboard)/layout.tsx)
  ├── Sidebar
  │   └── SidebarNav
  └── main
      ├── DashboardHeader
      │   └── UserMenu (DropdownMenu)
      └── Page Content
          ├── Card (title: "Overview")
          │   ├── Badge (status)
          │   └── Button (action)
          ├── Card (title: "Recent Activity")
          │   └── Table
          │       ├── TableHeader
          │       ├── TableBody
          │       └── TableRow[]
          └── Card (title: "Quick Actions")
              └── Button[]
```

### Component Sources
- `DashboardLayout`: (dashboard)/layout.tsx
- `Sidebar`: components/dashboard/sidebar.tsx (custom)
- `SidebarNav`: components/dashboard/sidebar-nav.tsx (custom)
- `DashboardHeader`: components/dashboard/dashboard-header.tsx (custom)
- `UserMenu`: components/dashboard/user-menu.tsx (custom, uses DropdownMenu)
- `Card`, `Badge`, `Button`, `Table`: components/ui/* (Shadcn)
```

### Step 6: Write Component Map Specification

Create `docs/specs/component-map.md`:

**Template**:
```markdown
# Component Map: [Feature Name]

## Shadcn Components Used

List all Shadcn UI components that will be used:

- **button** — CTAs, form submissions, navigation triggers
- **card** — Content containers for dashboard widgets
- **input** — Form text fields (email, password, search)
- **table** — Data display for user lists, transactions
- **dropdown-menu** — User menu, action menus
- (etc.)

## Custom Components Needed

### Auth Domain (frontend/src/components/auth/)
- **existing**: auth-guard.tsx, login-form.tsx, signup-form.tsx, social-buttons.tsx
- **new**: N/A (all auth components already exist)

### Dashboard Domain (frontend/src/components/dashboard/)
- **existing**: dashboard-header.tsx, sidebar.tsx, sidebar-nav.tsx, user-menu.tsx
- **new**:
  - `analytics-widget.tsx` — Custom chart widget for dashboard
  - `subscription-status.tsx` — Displays current plan and billing info

### Marketing Domain (frontend/src/components/marketing/)
- **existing**: marketing-header.tsx, marketing-footer.tsx
- **new**:
  - `pricing-table.tsx` — Custom pricing comparison table
  - `feature-grid.tsx` — Feature showcase grid for landing page

## Component Composition Patterns

### User Profile Card
```tsx
<Card>
  <CardHeader>
    <Avatar src={user.avatar} fallback={user.initials} />
  </CardHeader>
  <CardContent>
    <Label>{user.name}</Label>
    <Badge>{user.role}</Badge>
  </CardContent>
  <CardFooter>
    <Button>Edit Profile</Button>
  </CardFooter>
</Card>
```

### Data Table with Actions
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map(row => (
      <TableRow key={row.id}>
        <TableCell>{row.name}</TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

## Justification

Explain why specific components were chosen or why custom components are needed.
```

### Step 7: Write Page Layouts Specification

Create `docs/specs/page-layouts.md`:

**Template**:
```markdown
# Page Layouts: [Feature Name]

## Layout Pattern Reference

### Auth Layout
- File: `frontend/src/app/(auth)/layout.tsx`
- Pattern: Centered content, no navigation, minimal branding
- Used for: login, signup, password reset

### Dashboard Layout
- File: `frontend/src/app/(dashboard)/layout.tsx`
- Pattern: Sidebar + main content area
- Components:
  - Sidebar (collapsible)
  - DashboardHeader (top bar with user menu)
  - Main content area (scrollable)
- Used for: all authenticated pages

### Marketing Layout (Root)
- File: `frontend/src/app/layout.tsx` (root layout)
- Pattern: Header + content + footer
- Components:
  - MarketingHeader (navigation, logo, CTA)
  - MarketingFooter (links, social, copyright)
- Used for: landing, about, pricing, blog

---

## Page: Landing Page (/)

**Layout**: Marketing (root)  
**Rendering**: SSR (no "use client")

### Sections

#### Hero Section
- Heading (h1)
- Subheading (p)
- CTA Button (Shadcn Button)
- Hero image/illustration

#### Features Section
- Grid layout (3 columns)
- Card per feature (Shadcn Card)
  - Icon
  - Heading
  - Description

#### Pricing Section
- Pricing cards (custom pricing-table.tsx)
  - Badge for "Popular" plan
  - Button for CTA

#### Footer
- MarketingFooter component

---

## Page: Dashboard Home ((dashboard)/)

**Layout**: Dashboard  
**Rendering**: CSR ("use client")

### Components

#### Top Bar
- DashboardHeader
  - Breadcrumbs
  - UserMenu (DropdownMenu)

#### Main Content
- Grid layout (2 columns)
- Cards for widgets:
  - Overview stats (Card + Badge)
  - Recent activity (Card + Table)
  - Quick actions (Card + Button[])

#### Sidebar
- Sidebar component
  - SidebarNav (navigation links)
  - Collapse toggle

---

## Page: Login ((auth)/login)

**Layout**: Auth  
**Rendering**: CSR ("use client")

### Components

- Card (centered container)
  - CardHeader (title + description)
  - CardContent
    - LoginForm (custom auth/login-form.tsx)
      - Input (email)
      - Input (password)
      - Button (submit)
    - Separator
    - SocialButtons (Google OAuth)
  - CardFooter
    - Link to signup

---

## Responsive Breakpoints

Use Tailwind v4 responsive utilities:

- Mobile: default (< 640px)
- Tablet: `sm:` (≥ 640px)
- Desktop: `lg:` (≥ 1024px)
- Wide: `xl:` (≥ 1280px)

### Common Patterns
- Sidebar: Hidden on mobile, visible on `lg:`
- Grid layouts: 1 column mobile → 2-3 columns desktop
- Navigation: Hamburger menu mobile → horizontal desktop
```

## Layout Patterns Reference

### Auth Layout Pattern

File: `frontend/src/app/(auth)/layout.tsx`

```tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      {children}
    </div>
  )
}
```

**Characteristics**:
- Centered content
- No navigation or sidebars
- Minimal branding
- Used for: login, signup, password reset

### Dashboard Layout Pattern

File: `frontend/src/app/(dashboard)/layout.tsx`

```tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

**Characteristics**:
- Sidebar + main content
- Sticky header
- Scrollable content area
- Used for: all authenticated pages

### Marketing Layout Pattern

File: `frontend/src/app/layout.tsx` (root layout)

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <MarketingHeader />
        <main>{children}</main>
        <MarketingFooter />
      </body>
    </html>
  )
}
```

**Characteristics**:
- Header + content + footer
- Full-width sections
- Responsive navigation
- Used for: landing, about, pricing

## Styling Rules

### Tailwind v4 CSS-First Approach

- **DO NOT** create or modify `tailwind.config.js`
- **DO** use CSS variables in `frontend/src/app/globals.css`
- **DO** use OKLCH color space for design tokens

**Example (globals.css)**:
```css
@theme {
  --color-primary: oklch(0.6 0.2 270);
  --color-secondary: oklch(0.4 0.1 240);
  --spacing-card: 1.5rem;
}
```

### Dark Mode

Dark mode is pre-configured via `next-themes` in `frontend/src/components/theme-provider.tsx`.

**Usage**:
```tsx
import { useTheme } from 'next-themes'

const { theme, setTheme } = useTheme()
```

**CSS**:
```css
/* Light mode (default) */
.card {
  background: var(--color-surface);
}

/* Dark mode */
:root[data-theme="dark"] .card {
  background: var(--color-surface-dark);
}
```

## Design Source Fallback Chain

This skill supports a 4-tier design source priority. Always use the highest-priority source available:

### Priority 0: Local HTML (Highest Priority)

When a local HTML file is available, use it before any other source.

**Workflow**:
1. Read the HTML file(s) using the Read tool
2. Analyze inline/embedded CSS for design tokens (colors, fonts, spacing, layout patterns)
3. Extract component patterns from HTML structure
4. Identify reusable component patterns
5. Document design tokens from CSS
6. Use Playwright to render the HTML at 1440×900 and capture screenshots for visual references

**Advantages**:
- Most faithful to the actual implementation intent
- Provides real CSS tokens and layout patterns
- Produces direct visual references for the UI Polish Phase

### Priority 1: Stitch MCP (AI-Generated Designs)

When a Stitch design prompt is available, use Stitch MCP tools to generate screens from text descriptions. This is the **highest priority** source because it produces both visual designs and implementation-ready HTML/CSS code.

**Workflow**:
1. Create a Stitch project using `create_project`
2. Generate screens from text prompt using `generate_screen_from_text`
3. Retrieve HTML/CSS code using `get_screen_code`
4. Retrieve design screenshots using `get_screen_image`
5. Analyze generated HTML structure to identify component patterns
6. Extract design tokens (colors, spacing, typography) from CSS output
7. Map generated components to Shadcn UI equivalents

**Advantages**:
- Generates both design and code from text descriptions
- Provides implementation-ready HTML/CSS structure
- Includes responsive design patterns out of the box
- Can generate multiple design variants via `generate_variants`
- Can iterate on designs via `edit_screens`

### Priority 2: Figma MCP (Existing Designs)

When a Figma URL is provided but no Stitch prompt, use Figma MCP tools to analyze existing designs.

**Workflow**:
1. Use Figma MCP tools to read component tree
2. Extract design tokens (colors, spacing, typography)
3. Identify reusable component patterns
4. Take screenshots of key screens for reference
5. Map Figma components to Shadcn UI equivalents

**Advantages**:
- Leverages existing design work
- Provides high-fidelity visual reference
- Design tokens can be extracted programmatically
- Component hierarchy is well-defined

### Priority 3: PRD Text Descriptions (Fallback)

When neither Stitch nor Figma is available, infer component structure from PRD text descriptions.

**Workflow**:
1. Extract page descriptions from PRD
2. Identify UI elements mentioned (buttons, forms, tables, etc.)
3. Infer layout from user stories (e.g., "user sees a list of posts" → table or card grid)
4. Use PRD wireframes or mockups if included
5. Map inferred components to Shadcn UI equivalents

### Inference Rules

1. **User Story → Component Mapping**:
   - "User can log in" → LoginForm (Input, Button)
   - "User sees a dashboard" → Dashboard layout (Sidebar, Card grid)
   - "User views a list of items" → Table or Card list
   - "User receives notifications" → Toast (Sonner) or Alert

2. **Keywords → Component Mapping**:
   - "form", "input", "submit" → Input, Label, Button
   - "list", "table", "data" → Table
   - "menu", "dropdown", "actions" → DropdownMenu
   - "modal", "popup", "dialog" → Dialog
   - "panel", "drawer", "sidebar" → Sheet or custom Sidebar

3. **Layout Inference**:
   - "admin panel", "dashboard" → Dashboard layout (sidebar + main)
   - "landing page", "marketing" → Marketing layout (header + footer)
   - "login", "signup" → Auth layout (centered)

### Example PRD Parsing

**PRD Excerpt**:
> "Users can view their subscription status on a dedicated settings page. The page displays the current plan name, billing cycle, and renewal date. Users can upgrade or cancel their subscription using action buttons."

**Inferred Components**:
- Page: `(dashboard)/settings/page.tsx`
- Layout: Dashboard (sidebar + main)
- Components:
  - Card (subscription info container)
  - Badge (plan name)
  - Label (billing cycle, renewal date)
  - Button (upgrade, cancel actions)
- Custom component: `subscription-status.tsx` (if reused elsewhere)

## Stitch MCP Tools Reference

Stitch MCP provides AI-powered design generation from text prompts. Use these tools when a Stitch design prompt is available (highest priority design source).

### Core Tools

#### `create_project`
Creates a new Stitch project.

**Returns**: `{ projectId: string }`

**Example**:
```typescript
const { projectId } = await create_project()
```

#### `generate_screen_from_text`
Generates a screen from a text prompt.

**Parameters**:
- `projectId: string` — Project ID from `create_project`
- `prompt: string` — Text description of the screen to generate
- `deviceType: "MOBILE" | "DESKTOP" | "TABLET" | "AGNOSTIC"` — Target device type
- `modelId: "GEMINI_3_PRO" | "GEMINI_3_FLASH"` — AI model to use (PRO for complex, FLASH for speed)

**Returns**: `{ screenId: string }`

**Example**:
```typescript
const { screenId } = await generate_screen_from_text({
  projectId,
  prompt: "A modern dashboard with sidebar navigation, analytics charts, and recent activity table",
  deviceType: "DESKTOP",
  modelId: "GEMINI_3_PRO"
})
```

#### `get_screen`
Retrieves screen details.

**Parameters**:
- `projectId: string`
- `screenId: string`

**Returns**: Screen metadata (name, status, device type, etc.)

#### `list_screens`
Lists all screens in a project.

**Parameters**:
- `projectId: string`

**Returns**: Array of screen metadata

#### `get_screen_code`
Retrieves the HTML content of a screen.

**Parameters**:
- `projectId: string`
- `screenId: string`

**Returns**: `{ html: string }` — Full HTML/CSS implementation of the screen

**Example**:
```typescript
const { html } = await get_screen_code({ projectId, screenId })
// Parse HTML to extract component patterns
```

#### `get_screen_image`
Retrieves a screenshot of the screen.

**Parameters**:
- `projectId: string`
- `screenId: string`

**Returns**: Image data (PNG format)

**Use Case**: Visual reference for component mapping

#### `edit_screens`
Edits an existing screen via text prompt.

**Parameters**:
- `projectId: string`
- `screenId: string`
- `prompt: string` — Text description of changes to make
- `modelId: "GEMINI_3_PRO" | "GEMINI_3_FLASH"`

**Example**:
```typescript
await edit_screens({
  projectId,
  screenId,
  prompt: "Add a search bar to the header and change the color scheme to dark mode",
  modelId: "GEMINI_3_FLASH"
})
```

#### `generate_variants`
Generates design variants of an existing screen.

**Parameters**:
- `projectId: string`
- `screenId: string`
- `count: number` — Number of variants to generate (1-5)
- `modelId: "GEMINI_3_PRO" | "GEMINI_3_FLASH"`

**Returns**: Array of new screen IDs

**Use Case**: Explore alternative design directions

### Workflow Example

```typescript
// 1. Create project
const { projectId } = await create_project()

// 2. Generate dashboard screen
const { screenId } = await generate_screen_from_text({
  projectId,
  prompt: "SaaS dashboard with sidebar, analytics widgets, and user table",
  deviceType: "DESKTOP",
  modelId: "GEMINI_3_PRO"
})

// 3. Get HTML implementation
const { html } = await get_screen_code({ projectId, screenId })

// 4. Get screenshot for visual reference
const screenshot = await get_screen_image({ projectId, screenId })

// 5. Parse HTML to identify component patterns
// Extract: layout structure, CSS classes, component hierarchy

// 6. Map to Shadcn UI components
// Example: <div class="sidebar"> → Sidebar component
//          <div class="card"> → Card component
//          <table> → Table component
```

### Device Type Guidelines

- **DESKTOP**: Use for admin panels, dashboards, data-heavy interfaces
- **MOBILE**: Use for consumer apps, mobile-first experiences
- **TABLET**: Use for hybrid layouts that need both mobile and desktop patterns
- **AGNOSTIC**: Use when responsive design should work across all devices

### Model Selection

- **GEMINI_3_PRO**: Use for complex screens with intricate layouts, multiple components, or sophisticated interactions
- **GEMINI_3_FLASH**: Use for simple screens, rapid iteration, or when speed is more important than complexity

## Critical Shadcn UI Rules

### DropdownMenuTrigger Renders Its Own Button

**WRONG**:
```tsx
<DropdownMenuTrigger>
  <Button>Actions</Button>  {/* DO NOT DO THIS */}
</DropdownMenuTrigger>
```

**CORRECT**:
```tsx
<DropdownMenuTrigger>
  Actions  {/* Trigger renders its own button */}
</DropdownMenuTrigger>
```

### DropdownMenuLabel Must Be Wrapped in DropdownMenuGroup

**WRONG**:
```tsx
<DropdownMenuContent>
  <DropdownMenuLabel>My Account</DropdownMenuLabel>  {/* DO NOT DO THIS */}
  <DropdownMenuItem>Profile</DropdownMenuItem>
</DropdownMenuContent>
```

**CORRECT**:
```tsx
<DropdownMenuContent>
  <DropdownMenuGroup>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
  </DropdownMenuGroup>
  <DropdownMenuItem>Profile</DropdownMenuItem>
</DropdownMenuContent>
```

## Output Templates

### Component Map Template

```markdown
# Component Map: [Feature Name]

## Shadcn Components Used
- component-name — Use case description

## Custom Components Needed
### [Domain] (frontend/src/components/[domain]/)
- **existing**: list-of-existing.tsx
- **new**: list-of-new.tsx — Description

## Component Composition Patterns
(Code examples)

## Justification
(Why these components were chosen)
```

### Page Layouts Template

```markdown
# Page Layouts: [Feature Name]

## Layout Pattern Reference
(Auth, Dashboard, Marketing patterns)

## Page: [Page Name] ([route])
**Layout**: [Auth/Dashboard/Marketing]
**Rendering**: [SSR/CSR]

### Sections
- Section name
  - Component hierarchy
  - Shadcn components used
  - Custom components used

## Responsive Breakpoints
(Mobile → Tablet → Desktop patterns)
```

## Checklist

Before completing Phase 2, verify:

- [ ] All PRD pages have corresponding entries in page-layouts.md
- [ ] Every page specifies: route, layout, rendering mode (SSR/CSR)
- [ ] All Shadcn components used are listed in component-map.md
- [ ] All custom components have clear justification and domain placement
- [ ] Component composition patterns are documented with code examples
- [ ] Layout patterns reference existing layout files (auth, dashboard, root)
- [ ] Responsive breakpoints are specified for all layouts
- [ ] Dark mode considerations are documented
- [ ] DropdownMenu usage follows correct patterns (no wrapped buttons)
- [ ] No modifications to `frontend/src/components/ui/` components
- [ ] Both spec files exist: component-map.md, page-layouts.md
- [ ] User has reviewed and approved component choices

### Step 8: Generate Visual References

After completing component mapping and design system extraction, generate
page-level visual references for the UI Polish Phase:

1. **Identify all pages** from `page-layouts.md` that need visual references
2. **For each page**, generate a visual reference screenshot:
   - Priority 0 (Local HTML): Use Playwright to open the HTML file at 1440×900 viewport
     and capture a full-page screenshot. Save to `docs/specs/visual-references/{page-name}.png`
   - Priority 1 (Stitch): Use `get_screen_image` from Stitch MCP for each generated screen.
     Save to `docs/specs/visual-references/{page-name}.png`
   - Priority 2 (Figma): Use Figma MCP to export each key frame as PNG.
     Save to `docs/specs/visual-references/{page-name}.png`
   - Priority 3 (PRD only): SKIP this step entirely. Log:
     "No visual references available — UI Polish Phase will be unavailable."
3. **Verify coverage**: Every page in `page-layouts.md` should have a matching visual reference
   (unless Priority 3, where no references are produced)

**File naming**: `{page-name}.png` where page-name matches the page identifier
in `page-layouts.md` (e.g., `dashboard.png`, `login.png`, `settings.png`).

**Viewport**: 1440×900 (desktop). If design source provides mobile/tablet variants,
also capture as `{page-name}-mobile.png`, `{page-name}-tablet.png`.

## Common Anti-Patterns to Avoid

- Do NOT modify Shadcn UI components in `frontend/src/components/ui/`
- Do NOT wrap `<Button>` inside `<DropdownMenuTrigger>`
- Do NOT create `tailwind.config.js` customizations — use CSS variables
- Do NOT create one-off components for simple compositions — use Shadcn directly
- Do NOT forget `"use client"` directive for authenticated pages
- Do NOT use SSR for pages that need authentication context

## Next Phase

Once component map and page layouts are complete and approved, hand off to Engineer agent (Phase 3) with:
- `docs/specs/technical-spec.md` (from Phase 1)
- `docs/specs/data-model.md` (from Phase 1)
- `docs/specs/api-spec.md` (from Phase 1)
- `docs/specs/component-map.md` (from Phase 2)
- `docs/specs/page-layouts.md` (from Phase 2)
