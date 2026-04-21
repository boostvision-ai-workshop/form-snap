# Agent Workflow Redesign: Acceptance-Test-Driven Incremental Delivery

## TL;DR

> **Quick Summary**: Redesign the 4-phase agent workflow to be acceptance-test-driven with incremental delivery. Architect produces verifiable test cases and delivery batches upfront; Designer establishes a design system before component mapping; Engineer implements batch-by-batch; QA verifies in 3 layers (API → UI functionality → UI design consistency) per batch, with full verification at the end.
>
> **Deliverables**:
> - Modified `.opencode/agents/architect.md` — expanded with acceptance test + delivery batch outputs
> - Modified `.opencode/agents/designer.md` — new design system output + local HTML support
> - Modified `.opencode/agents/engineer.md` — batch-based workflow + design system compliance
> - Modified `.opencode/agents/qa.md` — 3-layer verification + dual mode + test account self-registration
> - Modified `AGENTS.md` — updated workflow description and phase handoff table
> - Modified `docs/prd/PRD_TEMPLATE.md` — acceptance criteria format guidance
>
> **Estimated Effort**: Large
> **Parallel Execution**: YES — 3 waves + 1 consistency review
> **Critical Path**: Task 1 (architect) → Task 3 (engineer) → Task 4 (qa) → Task 5 (AGENTS.md)

---

## Context

### Original Request

Optimize the Micro SaaS Dev Agent's agent workflow to produce higher-quality outputs matching PRD and design requirements. Focus exclusively on agent workflow files (`.opencode/agents/`), not template project code.

### Interview Summary

**Key Discussions**:
- User encountered 4 problems in practice: design-to-code UI deviations, no design system causing hardcoded styles, QA still missing API errors/UI gaps, Playwright can't handle Firebase Auth login
- User proposed 4 optimization directions: local HTML design input, design system first, test cases before coding with human review, Playwright self-registers test accounts
- User refined workflow to: test cases from PRD+design before any coding, incremental batch delivery, human checkpoint after each batch, QA 3-layer execution order

**Design Decisions Confirmed (All 4)**:

| Decision | Conclusion |
|----------|-----------|
| Phase 0 executor | Extend Architect to produce acceptance tests + delivery batches |
| Test case format | Two-layer: Given/When/Then business scenarios + automation hints |
| Delivery splitting | Architect defines batches by functional module; human reviews priority |
| QA subset selection | Architect pre-maps batches→tests; QA executes in 3 layers: API → UI function → UI design |
| Uncovered design areas | Visual consistency with overall design style is tolerable (not a fail) |
| Human review content | QA subset report + key page screenshots; focus on results |

**Research Findings**:
- Test infrastructure is fully set up (Vitest, pytest, Playwright all configured) but underutilized
- Current QA agent has no test case pre-definition mechanism, no incremental verification, no test account self-creation
- PRD template has acceptance criteria placeholders but no structured executable format
- Firebase token mocking pattern exists in backend tests (`patch("app.core.security.verify_firebase_token")`)

### Metis Review

**Identified Gaps (all addressed in plan)**:
- Section ordering within each agent file must be preserved for readability → addressed via explicit line-range references
- Cross-file consistency (e.g., Architect outputs 5 files, AGENTS.md must match) → addressed via Task 5 and Task 7
- Design system format needs to be concrete enough for Engineer to consume → addressed with CSS variable specification in Task 2
- QA's "design tolerance" rule needs clear criteria → addressed with explicit rule in Task 4
- Batch naming convention needed for cross-agent reference → addressed with `Batch-N: <name>` format

---

## Work Objectives

### Core Objective

Transform the agent workflow from a linear 4-phase waterfall into an acceptance-test-driven incremental delivery system where: (1) test cases are defined and human-reviewed before any code is written, (2) a design system ensures visual consistency, (3) implementation proceeds batch-by-batch with QA verification after each batch, and (4) humans checkpoint after each batch delivery.

### Concrete Deliverables

- 6 modified markdown files defining the new agent workflow
- All files internally consistent with each other
- New workflow fully documented in AGENTS.md

### Definition of Done

- [ ] All 6 files modified and internally consistent
- [ ] New outputs (acceptance-tests.md, delivery-plan.md, design-system.md) fully specified in producer agents
- [ ] New inputs correctly referenced in consumer agents
- [ ] AGENTS.md accurately describes the new workflow
- [ ] No contradictions between any two agent definition files
- [ ] Grep verification: all new artifact names appear in correct producer AND consumer agents

### Must Have

- Two-layer acceptance test format (Given/When/Then + automation hints)
- Batch-to-test-case mapping in Architect's delivery plan
- Design system specification (CSS variables, OKLCH colors, typography, spacing, border-radius)
- 3-layer QA verification order (API → UI functionality → UI design consistency)
- Dual QA mode (batch subset + full verification)
- Test account self-registration protocol
- Design tolerance rule for uncovered areas
- Human checkpoint after each batch QA
- Human total review after full QA

### Must NOT Have (Guardrails)

- **No template project code changes** — only `.opencode/agents/*.md`, `AGENTS.md`, `docs/prd/PRD_TEMPLATE.md`
- **No automated agent chaining** — workflow remains manually driven (user @-mentions each agent)
- **No new agent files** — extend existing agents, don't create new ones
- **No tech stack changes** — Firebase Auth, Supabase Postgres, Next.js, FastAPI all locked
- **No Shadcn UI component modifications** — `frontend/src/components/ui/` untouched
- **No skill file modifications** — existing `.opencode/skills/` stay as-is (but agents may reference them differently)
- **No removal of existing capabilities** — all current agent behaviors preserved; only additive changes
- **No over-specification** — agent files should guide, not micromanage; leave room for agent judgment

---

## Verification Strategy

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ALL tasks in this plan MUST be verifiable WITHOUT any human action.
> Every criterion MUST be verifiable by running a command or using a tool.

### Test Decision

- **Infrastructure exists**: N/A (deliverables are markdown files, not code)
- **Automated tests**: None (markdown documentation changes)
- **Framework**: N/A

### Agent-Executed QA Scenarios

Since all deliverables are markdown files, verification is content-based:

| Type | Tool | How Agent Verifies |
|------|------|-------------------|
| Section exists | Bash (grep) | Search for heading text in file |
| Content correct | Read tool | Read specific sections and verify content |
| Cross-file consistency | Grep + Read | Search for artifact names across all files |
| No contradictions | Read tool | Compare corresponding sections between files |

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
├── Task 1: Modify architect.md (no dependencies)
└── Task 2: Modify designer.md (no dependencies)

Wave 2 (After Wave 1):
├── Task 3: Modify engineer.md (depends: 1, 2)
└── Task 4: Modify qa.md (depends: 1, 2)

Wave 3 (After Wave 2):
├── Task 5: Modify AGENTS.md (depends: 1, 2, 3, 4)
└── Task 6: Modify PRD_TEMPLATE.md (depends: 1)

Wave 4 (After Wave 3):
└── Task 7: Cross-file consistency review (depends: all)

Critical Path: Task 1 → Task 3 → Task 5 → Task 7
Parallel Speedup: ~40% faster than sequential
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|-----------|--------|---------------------|
| 1 (architect.md) | None | 3, 4, 5, 6 | 2 |
| 2 (designer.md) | None | 3, 4, 5 | 1 |
| 3 (engineer.md) | 1, 2 | 5 | 4 |
| 4 (qa.md) | 1, 2 | 5 | 3 |
| 5 (AGENTS.md) | 1, 2, 3, 4 | 7 | 6 |
| 6 (PRD_TEMPLATE.md) | 1 | 7 | 5 |
| 7 (consistency review) | All | None | None (final) |

### Agent Dispatch Summary

| Wave | Tasks | Recommended |
|------|-------|-------------|
| 1 | 1, 2 | Parallel: both are independent agent definition rewrites |
| 2 | 3, 4 | Parallel: both consume Wave 1 outputs but don't depend on each other |
| 3 | 5, 6 | Parallel: AGENTS.md is the orchestrator doc; PRD_TEMPLATE is standalone |
| 4 | 7 | Sequential: final cross-file validation |

---

## TODOs

---

- [ ] 1. Modify `.opencode/agents/architect.md` — Expand with Acceptance Tests + Delivery Batches

  **What to do**:

  **1.1 — Update Core Mission section (lines 18-26)**:
  - Change "producing THREE specification documents" to "producing FIVE specification documents"
  - Add to the output list:
    - `docs/specs/acceptance-tests.md` — Verifiable acceptance test cases derived from PRD user stories + design specifications, in two-layer format (business scenario + automation hints)
    - `docs/specs/delivery-plan.md` — Batch-based delivery plan grouping features into incremental delivery units, with test-case-to-batch mapping

  **1.2 — Update Produced Outputs section (lines 53-81)**:
  - Add new Output 4: `acceptance-tests.md` with full specification:
    - Purpose: Define all verifiable acceptance test cases BEFORE any code is written
    - Format: Two-layer format per test case (see format spec below)
    - Derivation: Each test case traces back to a PRD user story (US-XX reference)
    - Coverage rule: Every user story MUST have at least one acceptance test; every API endpoint in api-spec.md MUST have at least one API-level test
    - ID scheme: `AT-001`, `AT-002`, etc. (sequential, never reused)
  - Add new Output 5: `delivery-plan.md` with full specification:
    - Purpose: Define incremental delivery batches for Engineer-QA cycle
    - Structure: Batch-N naming (`Batch-1: User Authentication`, `Batch-2: Task CRUD`, etc.)
    - Content per batch: list of features/endpoints included, list of acceptance test IDs mapped to this batch, dependencies on other batches (if any), suggested execution order
    - Rule: Every acceptance test ID MUST appear in exactly one batch; every batch MUST have at least one acceptance test
    - Human review note: User may reorder batch priority during review gate

  **1.3 — Add two-layer acceptance test format specification**:
  Insert after the Produced Outputs section (after line 81), a new subsection:

  ```markdown
  ### Acceptance Test Case Format (Two-Layer)

  Every test case in `acceptance-tests.md` MUST follow this exact format:

  ### AT-XXX: [Descriptive Test Case Title]
  **User Story**: US-XX
  **Batch**: Batch-N
  **Priority**: P0 (critical path) | P1 (important) | P2 (nice-to-have)

  **Scenario (Business Level)**:
  Given [precondition in business language]
  When [user action in business language]
  Then [expected outcome in business language]
  And [additional verification if needed]

  **Automation Hints**:
  - API: `METHOD /api/v1/endpoint` → expected_status, key response fields
  - UI Selector: `[data-testid="..."]` or CSS selector for key elements
  - UI Assertion: what the user should see (text content, element state)
  - Screenshot: `evidence/AT-XXX-description.png`
  - Preconditions: test data setup needed, auth state required

  **Notes**: [Edge cases, known limitations, design tolerance notes]
  ```

  **1.4 — Update Critical Rules section (lines 82-106)**:
  Add these rules:
  - "Every PRD user story MUST map to at least one acceptance test case in `acceptance-tests.md`"
  - "Every API endpoint defined in `api-spec.md` MUST have at least one API-level acceptance test"
  - "Acceptance test cases MUST be written in business language first (Given/When/Then), with automation hints as secondary layer"
  - "Delivery batches MUST be ordered by dependency — foundational features (auth, data models) before dependent features"
  - "Each batch SHOULD be independently deployable and verifiable"
  - "Batch sizes SHOULD target 3-8 acceptance tests per batch — small enough for focused QA, large enough for meaningful progress"

  **1.5 — Add new Workflow Steps**:
  After the existing Step 6 (around line 430), insert two new steps:

  **Step 7: Generate Acceptance Test Cases**
  - Input: Completed PRD user stories + api-spec.md + design reference (if available)
  - Process:
    1. For each user story, derive one or more acceptance test scenarios
    2. For each API endpoint in api-spec.md, derive API-level test cases
    3. If design reference is available (HTML/Figma), add UI selectors and visual assertions to automation hints
    4. If no design reference, use placeholder selectors with `[TBD-by-designer]` markers
    5. Assign priority (P0/P1/P2) based on user story criticality
    6. Number sequentially as AT-001, AT-002, ...
  - Output: `docs/specs/acceptance-tests.md`

  **Step 8: Define Delivery Batches**
  - Input: acceptance-tests.md + technical-spec.md (for dependency analysis) + data-model.md (for entity dependencies)
  - Process:
    1. Group acceptance tests by functional module / user story cluster
    2. Order batches by technical dependency (e.g., auth before dashboard, models before CRUD)
    3. Map each AT-XXX to exactly one batch
    4. Verify every AT-XXX appears in a batch (none orphaned)
    5. Add inter-batch dependencies where needed
    6. Add suggested execution order
  - Output: `docs/specs/delivery-plan.md`

  **1.6 — Update Validation Gate (lines 496-508)**:
  - Change from "All THREE spec documents" to "All FIVE spec documents"
  - Add validation checks:
    - `acceptance-tests.md` exists and contains at least one AT-XXX entry
    - `delivery-plan.md` exists and references all AT-XXX IDs from acceptance-tests.md
    - Every user story from PRD has at least one AT-XXX mapped to it
    - Every batch in delivery-plan.md has at least one AT-XXX

  **1.7 — Update Handoff Checklist (around line 540)**:
  - Add `acceptance-tests.md` and `delivery-plan.md` to the list of files presented for human review
  - Add note: "User may adjust batch priority order during review"

  **Must NOT do**:
  - Do NOT remove or modify existing Steps 1-6 (technical spec generation workflow)
  - Do NOT change the file's YAML frontmatter or agent identity
  - Do NOT modify the prd-to-spec skill reference
  - Do NOT add automated agent chaining (keep manual @-mention workflow)
  - Do NOT change the format of existing outputs (technical-spec.md, data-model.md, api-spec.md)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Significant markdown restructuring with precise content specifications; requires understanding agent system architecture
  - **Skills**: [`git-master`]
    - `git-master`: For committing the changes after modification
  - **Skills Evaluated but Omitted**:
    - `prd-to-spec`: This is a skill the Architect agent uses, not relevant to modifying the agent definition file itself

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 2)
  - **Blocks**: Tasks 3, 4, 5, 6
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References** (existing content to preserve/extend):
  - `.opencode/agents/architect.md:18-26` — Current Core Mission section (3 outputs → expand to 5)
  - `.opencode/agents/architect.md:53-81` — Current Produced Outputs section (add 2 new outputs)
  - `.opencode/agents/architect.md:82-106` — Current Critical Rules section (add new rules)
  - `.opencode/agents/architect.md:248-495` — Current Workflow Steps 1-8 (insert new Steps 7-8, renumber existing 7-8 to 9-10)
  - `.opencode/agents/architect.md:496-508` — Current Validation Gate (expand from 3→5 files)
  - `.opencode/agents/architect.md:530-563` — Current Handoff Checklist (add new files)

  **Format References** (for the two-layer test case format):
  - `docs/prd/EXAMPLE_PRD.md` — Example acceptance criteria from TaskFlow PRD (shows the business-level criteria that should map to AT-XXX format)
  - `docs/prd/PRD_TEMPLATE.md:152-186` — User Stories section with acceptance criteria placeholders

  **Architecture References** (constraints to respect):
  - `AGENTS.md:149-258` — Development Workflow section (must remain compatible)
  - `AGENTS.md:82-106` — Global Rules (all agent outputs must follow these)

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Core Mission updated to 5 outputs
    Tool: Bash (grep)
    Steps:
      1. grep -c "FIVE specification documents" .opencode/agents/architect.md
      2. Assert: count >= 1
      3. grep "acceptance-tests.md" .opencode/agents/architect.md
      4. Assert: output contains "acceptance-tests.md"
      5. grep "delivery-plan.md" .opencode/agents/architect.md
      6. Assert: output contains "delivery-plan.md"
    Expected Result: Both new outputs mentioned in Core Mission
    Evidence: grep output captured

  Scenario: Two-layer format specification exists
    Tool: Bash (grep)
    Steps:
      1. grep -c "AT-XXX" .opencode/agents/architect.md
      2. Assert: count >= 3 (format spec + examples)
      3. grep "Given \[" .opencode/agents/architect.md
      4. Assert: output contains Given/When/Then template
      5. grep "Automation Hints" .opencode/agents/architect.md
      6. Assert: output contains automation hints section
    Expected Result: Two-layer format fully specified
    Evidence: grep output captured

  Scenario: Validation Gate expanded
    Tool: Read tool
    Steps:
      1. Read the Validation Gate section
      2. Assert: mentions 5 documents (not 3)
      3. Assert: includes acceptance-tests.md validation
      4. Assert: includes delivery-plan.md validation
    Expected Result: Gate requires all 5 files
    Evidence: Section content captured

  Scenario: Existing workflow steps preserved
    Tool: Bash (grep)
    Steps:
      1. grep -c "Step [0-9]" .opencode/agents/architect.md
      2. Assert: count >= 10 (original 8 + 2 new, renumbered)
      3. grep "Generate Acceptance Test" .opencode/agents/architect.md
      4. Assert: new step exists
      5. grep "Define Delivery Batch" .opencode/agents/architect.md
      6. Assert: new step exists
    Expected Result: All original steps preserved, 2 new steps added
    Evidence: grep output captured
  ```

  **Commit**: YES (groups with Task 2 as Wave 1)
  - Message: `docs(agents): expand architect with acceptance tests and delivery batches`
  - Files: `.opencode/agents/architect.md`
  - Pre-commit: `grep -c "FIVE specification documents" .opencode/agents/architect.md` → 1+

---

- [ ] 2. Modify `.opencode/agents/designer.md` — Add Design System Output + Local HTML Support

  **What to do**:

  **2.1 — Update Core Mission section (lines 21-28)**:
  - Change from 2 outputs to 3 outputs
  - Add `docs/specs/design-system.md` — Design system specification extracted from design reference, defining CSS custom properties, color palette, typography scale, spacing system, and border-radius tokens

  **2.2 — Update Required Inputs section (lines 30-39)**:
  - Add Priority 0 (highest): Local HTML file
    - Path: User provides path to local `.html` file(s) in project or as absolute path
    - How to use: Read the HTML file with the Read tool, analyze its inline/embedded CSS and structure
    - Extract: colors, fonts, spacing patterns, component patterns, layout structure
    - Why highest priority: Most faithful representation of intended design (pixel-perfect reference)
  - Update priority numbering:
    - Priority 0: Local HTML file (NEW — highest fidelity)
    - Priority 1: Stitch design prompt (was Priority 1)
    - Priority 2: Figma design URL (was Priority 2)
    - Priority 3: PRD text only (was Priority 3 — fallback)

  **2.3 — Add Design System Output specification**:
  Insert in Produced Outputs section (after line 125), a new output:

  `docs/specs/design-system.md` structure:

  ```markdown
  # Design System

  ## CSS Custom Properties

  All design tokens are defined as CSS custom properties for use in Tailwind v4
  and custom components. These MUST be added to the project's global CSS file.

  ### Color Palette
  - `--color-primary`: [OKLCH value] — Primary brand color
  - `--color-primary-hover`: [OKLCH value] — Primary hover state
  - `--color-secondary`: [OKLCH value]
  - `--color-background`: [OKLCH value]
  - `--color-surface`: [OKLCH value]
  - `--color-text-primary`: [OKLCH value]
  - `--color-text-secondary`: [OKLCH value]
  - `--color-border`: [OKLCH value]
  - `--color-error`: [OKLCH value]
  - `--color-success`: [OKLCH value]
  - `--color-warning`: [OKLCH value]
  [extend as needed based on design reference]

  ### Typography Scale
  - `--font-family-sans`: [font stack]
  - `--font-family-mono`: [font stack]
  - `--font-size-xs` through `--font-size-4xl`: [rem values]
  - `--font-weight-normal`: [value]
  - `--font-weight-medium`: [value]
  - `--font-weight-semibold`: [value]
  - `--font-weight-bold`: [value]
  - `--line-height-tight` / `--line-height-normal` / `--line-height-relaxed`: [values]

  ### Spacing System
  - `--spacing-1` through `--spacing-16`: [rem values following 4px grid]

  ### Border Radius
  - `--radius-sm`: [value]
  - `--radius-md`: [value]
  - `--radius-lg`: [value]
  - `--radius-full`: 9999px

  ### Shadows
  - `--shadow-sm`: [value]
  - `--shadow-md`: [value]
  - `--shadow-lg`: [value]

  ## Component Defaults
  - Button height: [value]
  - Input height: [value]
  - Card padding: [value]
  - Page max-width: [value]
  - Sidebar width: [value]

  ## Implementation Notes
  - Colors use OKLCH for perceptual uniformity
  - All spacing follows a 4px base grid
  - Typography scale uses a [ratio] ratio
  - [Additional notes from design analysis]
  ```

  **2.4 — Add Design System Extraction workflow step**:
  Insert as a new step BEFORE the component mapping steps (before current Step 3, around line 216).

  New step: "Extract Design System"
  - If Priority 0 (Local HTML): Read the HTML file(s), parse embedded/inline CSS for colors, fonts, spacing, and layout patterns. Extract actual values used.
  - If Priority 1 (Stitch): After Stitch generates screens, extract design tokens from the generated output.
  - If Priority 2 (Figma): Use Figma MCP to read design tokens, styles, and variables from the Figma file.
  - If Priority 3 (PRD only): Define a sensible default design system based on PRD's visual tone descriptions. Use neutral palette with Shadcn defaults as baseline.
  - In ALL cases: Output a complete `design-system.md` with all sections filled.

  **2.5 — Update existing component mapping steps**:
  - In Step 3 "Read Design" (lines 216-237): Add Priority 0 local HTML handling before the existing Stitch/Figma/PRD logic
  - When mapping components, reference design-system.md tokens instead of hardcoded values
  - In page-layouts.md output, use CSS variable names (e.g., `var(--color-primary)`) not hex/rgb values

  **2.6 — Update Validation Gate (lines 265-275)**:
  - Add: `design-system.md` exists and contains at least Color Palette + Typography + Spacing sections
  - Add: `design-system.md` uses OKLCH for colors (grep for "oklch")
  - Add: No hardcoded color values in `component-map.md` or `page-layouts.md` (all reference CSS variables)

  **Must NOT do**:
  - Do NOT remove Stitch or Figma MCP support (they remain as Priority 1 and 2)
  - Do NOT modify the Shadcn component reference list
  - Do NOT change the design-to-components skill file
  - Do NOT add automated design system application to code (that's Engineer's job)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Significant markdown restructuring with design system domain expertise needed
  - **Skills**: [`git-master`]
    - `git-master`: For committing changes
  - **Skills Evaluated but Omitted**:
    - `design-to-components`: Skill used BY the designer agent, not relevant to modifying the agent definition
    - `frontend-ui-ux`: This is about defining agent instructions, not implementing UI

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: Tasks 3, 4, 5
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References** (existing content to preserve/extend):
  - `.opencode/agents/designer.md:21-28` — Current Core Mission (2 outputs → 3)
  - `.opencode/agents/designer.md:30-39` — Current Required Inputs (add Priority 0)
  - `.opencode/agents/designer.md:57-125` — Current Produced Outputs (add design-system.md)
  - `.opencode/agents/designer.md:196-200` — Current Styling Rules (reference design-system.md)
  - `.opencode/agents/designer.md:216-237` — Current Step 2 Read Design (add Priority 0 HTML)
  - `.opencode/agents/designer.md:265-275` — Current Validation Gate (add design system check)

  **Format References** (for design system structure):
  - Tailwind CSS v4 documentation — CSS-first configuration approach (no tailwind.config.js)
  - OKLCH color space — modern perceptual color model

  **Architecture References**:
  - `AGENTS.md:497-511` — Current Design Source Optionality (add local HTML row)

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Design system output specified
    Tool: Bash (grep)
    Steps:
      1. grep "design-system.md" .opencode/agents/designer.md
      2. Assert: appears in Core Mission AND Produced Outputs AND Validation Gate
      3. grep -c "design-system.md" .opencode/agents/designer.md
      4. Assert: count >= 5 (mission + output spec + validation + workflow + handoff)
    Expected Result: design-system.md fully integrated into designer agent
    Evidence: grep output captured

  Scenario: Local HTML support added as Priority 0
    Tool: Bash (grep)
    Steps:
      1. grep "Priority 0" .opencode/agents/designer.md
      2. Assert: output mentions "Local HTML" or "local HTML"
      3. grep "\.html" .opencode/agents/designer.md
      4. Assert: HTML file handling instructions exist
    Expected Result: Local HTML is highest priority design source
    Evidence: grep output captured

  Scenario: OKLCH color format specified
    Tool: Bash (grep)
    Steps:
      1. grep -i "oklch" .opencode/agents/designer.md
      2. Assert: OKLCH mentioned in design system specification
    Expected Result: OKLCH is the specified color format
    Evidence: grep output captured

  Scenario: Existing design sources preserved
    Tool: Bash (grep)
    Steps:
      1. grep "Stitch" .opencode/agents/designer.md
      2. Assert: Stitch MCP still referenced
      3. grep "Figma" .opencode/agents/designer.md
      4. Assert: Figma MCP still referenced
      5. grep "PRD" .opencode/agents/designer.md
      6. Assert: PRD fallback still referenced
    Expected Result: All 3 original design sources preserved alongside new Priority 0
    Evidence: grep output captured
  ```

  **Commit**: YES (groups with Task 1 as Wave 1)
  - Message: `docs(agents): add design system output and local HTML support to designer`
  - Files: `.opencode/agents/designer.md`
  - Pre-commit: `grep -c "design-system.md" .opencode/agents/designer.md` → 5+

---

- [ ] 3. Modify `.opencode/agents/engineer.md` — Batch-Based Workflow + Design System Compliance

  **What to do**:

  **3.1 — Update Required Inputs section (lines 24-36)**:
  Add 3 new required inputs:
  - `docs/specs/acceptance-tests.md` — Acceptance test cases defining what "done" looks like for each feature (from Architect)
  - `docs/specs/delivery-plan.md` — Batch definitions and execution order (from Architect)
  - `docs/specs/design-system.md` — Design tokens and CSS custom properties (from Designer)

  **3.2 — Update Core Mission section (lines 10-20)**:
  - Add: "Implements features in incremental batches as defined in `delivery-plan.md`"
  - Add: "Each batch is a self-contained delivery unit verified by QA before proceeding to the next batch"
  - Add: "All styling MUST use design system tokens from `design-system.md` — no hardcoded color/spacing values"

  **3.3 — Add Batch-Based Implementation Workflow**:
  Restructure the Implementation Workflow section (lines 58-230) to include batch awareness:

  New workflow structure:
  ```
  ### Implementation Workflow

  #### Pre-Implementation Setup (Once)
  1. Read delivery-plan.md to understand batch sequence
  2. Read design-system.md and implement CSS custom properties in global stylesheet
     - Create/update `frontend/src/app/globals.css` with all CSS variables
     - Verify Tailwind v4 can consume these variables
  3. Identify current batch to implement (user specifies or follow delivery-plan.md order)

  #### Per-Batch Implementation (Repeat for each batch)
  1. Read the batch definition from delivery-plan.md
  2. Read all AT-XXX test cases mapped to this batch from acceptance-tests.md
  3. Implement backend first (models → migrations → services → endpoints)
  4. Implement frontend (components → pages → integration)
  5. Run existing test suites: `pnpm --dir frontend build && pnpm --dir frontend test && uv --directory backend run pytest`
  6. Self-verify against the batch's AT-XXX acceptance criteria
  7. Handoff to QA with batch scope clearly stated

  #### QA Feedback Loop
  If QA reports failures:
  1. Read QA's batch report
  2. Address each failure by layer:
     - Layer 1 (API) failures: Fix endpoint logic, schemas, or service layer
     - Layer 2 (UI functionality) failures: Fix component behavior, state, or routing
     - Layer 3 (UI design) failures: Fix styling to match design-system.md tokens
  3. Re-run test suites
  4. Re-handoff to QA for re-verification of fixed items
  ```

  **3.4 — Add Design System Compliance Rules section**:
  Insert new section after Implementation Workflow:

  ```markdown
  ### Design System Compliance Rules

  ALL frontend code MUST adhere to the design system defined in `design-system.md`:

  1. **Colors**: Use CSS custom properties (`var(--color-primary)`, etc.) — NEVER hardcode hex/rgb/hsl values
  2. **Typography**: Use design system font variables — NEVER hardcode font-family or font-size values
  3. **Spacing**: Use design system spacing variables or Tailwind's spacing scale — NEVER use arbitrary pixel values
  4. **Border Radius**: Use design system radius tokens — NEVER hardcode border-radius values
  5. **Shadows**: Use design system shadow tokens — NEVER hardcode box-shadow values

  **Exception**: Shadcn UI components (`frontend/src/components/ui/`) are exempt — they have their own theming system. But custom components built around Shadcn MUST use design system tokens.

  **Verification**: Before handoff to QA, grep frontend source for hardcoded color values:
  `grep -rn "#[0-9a-fA-F]\{3,8\}" frontend/src/ --include="*.tsx" --include="*.ts" --exclude-dir="components/ui"`
  This should return zero results (or only design-system definition file).
  ```

  **3.5 — Update Validation Gate (lines 440-462)**:
  - Scope validation to current batch: "All acceptance tests in current batch's AT-XXX list must be addressed"
  - Add: "No hardcoded color/spacing values in custom components (design system compliance)"
  - Add: "QA handoff includes batch identifier and list of AT-XXX IDs being delivered"

  **3.6 — Update Handoff to QA section (lines 467-480)**:
  - Add batch scope to handoff: "Specify which batch (Batch-N: name) is being delivered"
  - Add: "List all AT-XXX IDs included in this delivery"
  - Add: "Note any known limitations or deviations from acceptance criteria"

  **Must NOT do**:
  - Do NOT change the backend implementation patterns (FastAPI service layer, SQLAlchemy async)
  - Do NOT modify the existing test running commands
  - Do NOT add automated QA triggering (remain manual)
  - Do NOT change the skill references (fastapi-crud, supabase-migration)
  - Do NOT remove existing implementation guidance for frontend or backend

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Complex restructuring of implementation workflow; requires understanding of both frontend and backend patterns
  - **Skills**: [`git-master`]
    - `git-master`: For committing changes
  - **Skills Evaluated but Omitted**:
    - `fastapi-crud`, `supabase-migration`: Skills used BY the engineer agent, not needed for modifying the definition

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Task 4)
  - **Blocks**: Task 5
  - **Blocked By**: Tasks 1, 2

  **References**:

  **Pattern References**:
  - `.opencode/agents/engineer.md:10-20` — Current Core Mission (add batch + design system references)
  - `.opencode/agents/engineer.md:24-36` — Current Required Inputs (add 3 new files)
  - `.opencode/agents/engineer.md:58-230` — Current Implementation Workflow (restructure for batches)
  - `.opencode/agents/engineer.md:186-191` — Current Styling section (expand to design system compliance)
  - `.opencode/agents/engineer.md:440-462` — Current Validation Gate (scope to batch)
  - `.opencode/agents/engineer.md:467-480` — Current Handoff to QA (add batch scope)

  **Cross-file References** (must be consistent with):
  - `.opencode/agents/architect.md` (after Task 1) — acceptance-tests.md format, delivery-plan.md structure
  - `.opencode/agents/designer.md` (after Task 2) — design-system.md structure and token names
  - `.opencode/agents/qa.md` (Task 4) — QA feedback loop format

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: New inputs referenced
    Tool: Bash (grep)
    Steps:
      1. grep "acceptance-tests.md" .opencode/agents/engineer.md
      2. Assert: found in Required Inputs section
      3. grep "delivery-plan.md" .opencode/agents/engineer.md
      4. Assert: found in Required Inputs section
      5. grep "design-system.md" .opencode/agents/engineer.md
      6. Assert: found in Required Inputs section AND Compliance section
    Expected Result: All 3 new inputs properly referenced
    Evidence: grep output captured

  Scenario: Batch-based workflow present
    Tool: Bash (grep)
    Steps:
      1. grep -i "per-batch\|per batch\|batch implementation\|batch-based" .opencode/agents/engineer.md
      2. Assert: batch workflow concept exists
      3. grep "Batch-N\|Batch [0-9]\|current batch" .opencode/agents/engineer.md
      4. Assert: batch references exist in workflow
    Expected Result: Implementation workflow is batch-aware
    Evidence: grep output captured

  Scenario: Design system compliance rules exist
    Tool: Bash (grep)
    Steps:
      1. grep -i "design system compliance" .opencode/agents/engineer.md
      2. Assert: section exists
      3. grep "var(--" .opencode/agents/engineer.md
      4. Assert: CSS variable references present
      5. grep "NEVER hardcode" .opencode/agents/engineer.md
      6. Assert: prohibition on hardcoded values stated
    Expected Result: Clear rules against hardcoded styling values
    Evidence: grep output captured

  Scenario: QA feedback loop defined
    Tool: Bash (grep)
    Steps:
      1. grep -i "qa feedback\|feedback loop" .opencode/agents/engineer.md
      2. Assert: section exists
      3. grep "Layer 1\|Layer 2\|Layer 3" .opencode/agents/engineer.md
      4. Assert: 3-layer failure handling referenced
    Expected Result: Engineer knows how to handle QA rejections by layer
    Evidence: grep output captured
  ```

  **Commit**: YES (groups with Task 4 as Wave 2)
  - Message: `docs(agents): restructure engineer for batch-based delivery with design system compliance`
  - Files: `.opencode/agents/engineer.md`
  - Pre-commit: `grep -c "design-system.md" .opencode/agents/engineer.md` → 3+

---

- [ ] 4. Modify `.opencode/agents/qa.md` — 3-Layer Verification + Dual Mode + Test Account Self-Registration

  **What to do**:

  **4.1 — Update Identity & Role section (lines 10-16)**:
  - Add: "Operates in two modes: Batch Verification (per-batch subset) and Full Verification (all acceptance tests)"
  - Add: "Executes verification in 3 ordered layers: API → UI Functionality → UI Design Consistency"

  **4.2 — Update Core Mission section (lines 18-27)**:
  - Replace mission statement to emphasize acceptance-test-driven verification:
    - "Verify implementation against pre-defined acceptance test cases from `acceptance-tests.md`"
    - "Execute verification in 3 layers, failing fast at earlier layers before proceeding"
    - "Generate actionable reports with specific failure details for Engineer to fix"
    - "Support both batch-scoped verification and full-suite verification"

  **4.3 — Update Required Inputs section (lines 29-48)**:
  Add 3 new required inputs:
  - `docs/specs/acceptance-tests.md` — The acceptance test cases to verify against
  - `docs/specs/delivery-plan.md` — Batch definitions and test-to-batch mapping
  - `docs/specs/design-system.md` — Design tokens for UI design consistency verification (Layer 3)

  **4.4 — Add Operating Modes section** (new section after Required Inputs):

  ```markdown
  ### Operating Modes

  #### Mode 1: Batch Verification
  - **Trigger**: Engineer delivers a specific batch (e.g., "Batch-2: Task CRUD")
  - **Scope**: Execute ONLY the AT-XXX test cases mapped to that batch in delivery-plan.md
  - **On Pass**: Generate batch report → Pause for human review
  - **On Fail**: Generate failure report → Return to Engineer with specific AT-XXX failures and layer

  #### Mode 2: Full Verification
  - **Trigger**: All batches delivered; user requests full verification
  - **Scope**: Execute ALL AT-XXX test cases from acceptance-tests.md
  - **Purpose**: Catch cross-batch regressions and verify end-to-end flows
  - **On Pass**: Generate complete test report → Pause for human total review
  - **On Fail**: Generate failure report with regression identification

  The user specifies which mode to use when invoking QA. If not specified, default to Batch Verification for the most recent batch.
  ```

  **4.5 — Restructure Verification into 3 Layers** (replace lines 111-233):

  ```markdown
  ### 3-Layer Verification Process

  Execute layers IN ORDER. A critical failure in an earlier layer SHOULD be reported
  before proceeding to later layers (but non-blocking failures can be deferred).

  #### Layer 1: API Verification
  For each AT-XXX in scope, verify the API-level assertions from Automation Hints:
  - Run backend test suite: `uv --directory backend run pytest`
  - For each API endpoint referenced in AT-XXX automation hints:
    - Verify endpoint exists and returns expected status code
    - Verify response schema matches expected fields
    - Verify error cases return appropriate error responses
  - Use curl or httpie for manual API verification when test coverage is insufficient
  - **Pass criteria**: All API assertions in scoped AT-XXX cases pass

  #### Layer 2: UI Functionality Verification
  For each AT-XXX in scope, verify the UI-level functional assertions:
  - Run frontend test suite: `pnpm --dir frontend test`
  - Run frontend build: `pnpm --dir frontend build`
  - For each UI assertion in AT-XXX automation hints:
    - Use Playwright to navigate to the relevant page
    - Verify interactive elements work (buttons click, forms submit, navigation works)
    - Verify data flows correctly (API data renders, mutations update UI)
    - Verify authentication flows (login/logout, protected routes redirect)
  - Capture screenshots at key checkpoints: `evidence/AT-XXX-step-description.png`
  - **Pass criteria**: All UI functional assertions in scoped AT-XXX cases pass

  #### Layer 3: UI Design Consistency Verification
  For each AT-XXX in scope that has UI components:
  - Compare rendered UI against design reference (HTML file, Figma, or Stitch output)
  - Verify design system tokens are applied (colors, typography, spacing match design-system.md)
  - Check layout structure matches page-layouts.md specifications
  - Capture full-page screenshots for human review: `evidence/AT-XXX-full-page.png`
  - **Design Tolerance Rule** (see below)
  - **Pass criteria**: Rendered UI is consistent with design reference OR matches overall design style for uncovered areas
  ```

  **4.6 — Add Design Tolerance Rules section** (new section):

  ```markdown
  ### Design Tolerance Rules

  Not all UI areas will be explicitly covered by design specifications. Apply these rules:

  1. **Design-specified areas**: Must closely match the design reference. Minor deviations
     (±2px spacing, slightly different shade) are acceptable. Major deviations (wrong layout,
     missing elements, wrong color family) are failures.

  2. **Design-unspecified areas**: Areas not covered by any design reference (common in practice).
     These are NOT automatic failures. Apply this test:
     - Does it use design system tokens consistently? (colors, fonts, spacing from design-system.md)
     - Does it follow the visual patterns established in design-specified areas?
     - Is it visually coherent with the rest of the application?
     - If YES to all: PASS (note as "design-unspecified, style-consistent")
     - If NO to any: WARN (note the inconsistency but do not hard-fail)

  3. **Shadcn UI default styling**: Components from `frontend/src/components/ui/` use Shadcn's
     built-in theming. These are acceptable as-is unless the design reference explicitly
     shows a different style for that component.
  ```

  **4.7 — Add Test Account Self-Registration Protocol** (new section):

  ```markdown
  ### Test Account Self-Registration Protocol

  QA MUST NOT require pre-existing test accounts or manual user creation.

  #### For Firebase Auth Testing:
  1. **Backend-only tests**: Use the existing mock pattern:
     `patch("app.core.security.verify_firebase_token")` to bypass Firebase
  2. **E2E Playwright tests**: Register a new test account through the app's
     signup flow at the start of each test run:
     - Navigate to signup page
     - Fill registration form with generated test credentials
     - Complete registration flow
     - Use the created account for all subsequent test scenarios
     - Test credentials: `test-{timestamp}@example.com` / auto-generated password
  3. **If signup is not yet implemented** (early batches): Use Firebase Admin SDK
     to create a test user programmatically, or mock auth at the API level

  #### Test Data Cleanup:
  - Test accounts created during QA should be documented in the test report
  - Cleanup is optional for development environments
  - NEVER use production credentials or real user accounts
  ```

  **4.8 — Update Test Report Template** (replace lines 233-321):
  Update the report structure to include:
  - **Report header**: Mode (Batch/Full), Batch scope (if batch mode), date, execution time
  - **Layer 1 Results**: API verification results per AT-XXX
  - **Layer 2 Results**: UI functionality results per AT-XXX
  - **Layer 3 Results**: UI design consistency results per AT-XXX, with screenshot references
  - **Summary**: Total AT-XXX cases in scope, passed, failed, warned (design tolerance)
  - **Regression Notes** (full mode only): Cross-batch regression findings
  - **Screenshots Index**: List of all captured screenshots with paths
  - **Overall Verdict**: PASS / FAIL / PARTIAL (with specific failures listed)

  **4.9 — Update Workflow Process (lines 323-368)**:
  Restructure for dual-mode:
  1. Determine mode (Batch or Full)
  2. Identify AT-XXX scope from acceptance-tests.md + delivery-plan.md
  3. Set up test environment (self-register test account if needed)
  4. Execute Layer 1 (API)
  5. Execute Layer 2 (UI Functionality)
  6. Execute Layer 3 (UI Design Consistency)
  7. Capture evidence screenshots
  8. Generate test report
  9. If FAIL: Return to Engineer with specific failures
  10. If PASS: Present report + screenshots for human review

  **Must NOT do**:
  - Do NOT remove the read-only constraint (QA never modifies code)
  - Do NOT add automated code fixes
  - Do NOT remove existing test suite execution (vitest, pytest)
  - Do NOT change the report output location (`docs/qa/`)
  - Do NOT make design-unspecified areas automatic failures

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Major restructuring of QA agent with new concepts (3 layers, dual mode, self-registration)
  - **Skills**: [`git-master`, `playwright`]
    - `git-master`: For committing changes
    - `playwright`: For understanding Playwright capabilities referenced in QA verification
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: Not modifying UI, just defining verification rules

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Task 3)
  - **Blocks**: Task 5
  - **Blocked By**: Tasks 1, 2

  **References**:

  **Pattern References**:
  - `.opencode/agents/qa.md:10-16` — Current Identity & Role (add dual mode)
  - `.opencode/agents/qa.md:18-27` — Current Core Mission (rewrite for acceptance-test-driven)
  - `.opencode/agents/qa.md:29-48` — Current Required Inputs (add 3 new files)
  - `.opencode/agents/qa.md:111-233` — Current Verification Checklist (restructure into 3 layers)
  - `.opencode/agents/qa.md:161-192` — Current Golden Path (merge into Layer 2)
  - `.opencode/agents/qa.md:233-321` — Current Test Report Template (update for layers + batch)
  - `.opencode/agents/qa.md:323-368` — Current Workflow Process (restructure for dual mode)

  **Cross-file References**:
  - `.opencode/agents/architect.md` (after Task 1) — AT-XXX format, batch structure
  - `.opencode/agents/designer.md` (after Task 2) — design-system.md token names for Layer 3
  - `.opencode/agents/engineer.md` (after Task 3) — QA feedback loop format

  **Test Infrastructure References** (existing patterns to leverage):
  - `backend/tests/conftest.py` — Firebase mock pattern (`patch("app.core.security.verify_firebase_token")`)
  - `frontend/e2e/smoke.spec.ts` — Existing Playwright smoke test patterns
  - `frontend/playwright.config.ts` — Playwright configuration

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: 3-layer verification structure exists
    Tool: Bash (grep)
    Steps:
      1. grep "Layer 1" .opencode/agents/qa.md
      2. Assert: mentions "API" verification
      3. grep "Layer 2" .opencode/agents/qa.md
      4. Assert: mentions "UI Functionality" or "UI functionality"
      5. grep "Layer 3" .opencode/agents/qa.md
      6. Assert: mentions "UI Design" or "design consistency"
    Expected Result: All 3 layers defined with correct focus areas
    Evidence: grep output captured

  Scenario: Dual operating modes defined
    Tool: Bash (grep)
    Steps:
      1. grep -i "batch verification\|batch mode" .opencode/agents/qa.md
      2. Assert: batch mode described
      3. grep -i "full verification\|full mode" .opencode/agents/qa.md
      4. Assert: full mode described
    Expected Result: Both modes clearly documented
    Evidence: grep output captured

  Scenario: Test account self-registration protocol exists
    Tool: Bash (grep)
    Steps:
      1. grep -i "self-registration\|self-register\|test account" .opencode/agents/qa.md
      2. Assert: protocol section exists
      3. grep "verify_firebase_token" .opencode/agents/qa.md
      4. Assert: backend mock pattern referenced
      5. grep -i "playwright.*signup\|signup.*playwright\|registration flow" .opencode/agents/qa.md
      6. Assert: E2E account creation described
    Expected Result: Complete test account strategy for both backend and E2E
    Evidence: grep output captured

  Scenario: Design tolerance rules defined
    Tool: Bash (grep)
    Steps:
      1. grep -i "design tolerance\|design-unspecified" .opencode/agents/qa.md
      2. Assert: tolerance rules section exists
      3. grep -i "not automatic fail\|NOT.*fail\|style-consistent" .opencode/agents/qa.md
      4. Assert: unspecified areas are not auto-failures
    Expected Result: Clear rules for handling uncovered design areas
    Evidence: grep output captured

  Scenario: New inputs referenced
    Tool: Bash (grep)
    Steps:
      1. grep "acceptance-tests.md" .opencode/agents/qa.md
      2. Assert: found in inputs and workflow
      3. grep "delivery-plan.md" .opencode/agents/qa.md
      4. Assert: found in inputs
      5. grep "design-system.md" .opencode/agents/qa.md
      6. Assert: found in Layer 3 verification
    Expected Result: All 3 new inputs properly referenced
    Evidence: grep output captured
  ```

  **Commit**: YES (groups with Task 3 as Wave 2)
  - Message: `docs(agents): restructure QA for 3-layer verification with batch mode and self-registration`
  - Files: `.opencode/agents/qa.md`
  - Pre-commit: `grep -c "Layer [123]" .opencode/agents/qa.md` → 3+

---

- [ ] 5. Modify `AGENTS.md` — Update Workflow Description and Phase Handoff

  **What to do**:

  **5.1 — Update Development Workflow section (lines 149-258)**:
  Replace the current "4-Phase Sequential Process" with the new architecture:

  ```markdown
  ## Development Workflow — Acceptance-Test-Driven Incremental Delivery

  This project uses an acceptance-test-driven workflow with incremental delivery.
  Test cases are defined and human-reviewed BEFORE any code is written. Implementation
  proceeds in batches with QA verification after each batch.

  ### Phase 1: Architect (Expanded)

  **Role**: Translate PRD into technical specifications, acceptance test cases,
  and delivery batch plan.

  **Inputs**:
  - `docs/prd/PRD.md` (REQUIRED)
  - Design reference (OPTIONAL — local HTML, Figma URL, or text descriptions)

  **Outputs**:
  - `docs/specs/technical-spec.md` — Architecture decisions, component boundaries, API contracts
  - `docs/specs/data-model.md` — Database schema, relationships, migrations
  - `docs/specs/api-spec.md` — Endpoint definitions with request/response examples
  - `docs/specs/acceptance-tests.md` — Verifiable acceptance test cases (two-layer format)
  - `docs/specs/delivery-plan.md` — Batch-based delivery plan with test-case mapping

  **Validation Gate**:
  - All 5 spec files exist and are internally consistent
  - Every user story has at least one acceptance test
  - Every batch has at least one acceptance test
  - Specs + tests + batches reviewed and approved by user

  ### Phase 2: Designer

  **Role**: Establish design system and map UI requirements to component structure.

  **Inputs**:
  - `docs/prd/PRD.md` (REQUIRED)
  - `docs/specs/technical-spec.md` (from Phase 1)
  - Design source (OPTIONAL — local HTML file, Stitch prompt, Figma URL, or PRD-only)

  **Outputs**:
  - `docs/specs/design-system.md` — Design tokens: CSS custom properties, colors (OKLCH),
    typography, spacing, border-radius
  - `docs/specs/component-map.md` — Shadcn + custom component mapping
  - `docs/specs/page-layouts.md` — Page-by-page layout specifications

  **Validation Gate**:
  - Design system covers colors, typography, spacing, border-radius
  - Component map covers all pages defined in PRD
  - No hardcoded color/spacing values in component-map or page-layouts
  - User approves design system + component structure

  ### Phase 3-4: Engineer-QA Incremental Delivery Cycle

  Implementation proceeds batch-by-batch as defined in `delivery-plan.md`.

  **For each Batch N:**

  1. **Engineer** implements Batch N features
     - Follows design-system.md for all styling
     - Verifies against Batch N's acceptance tests
     - Hands off to QA with batch scope

  2. **QA** verifies Batch N in 3 layers:
     - Layer 1: API verification (endpoints, schemas, error cases)
     - Layer 2: UI functionality (interactions, data flow, auth)
     - Layer 3: UI design consistency (design system compliance, layout match)

  3. **If QA fails**: Returns to Engineer with specific failures → Engineer fixes → QA re-verifies
  4. **If QA passes**: Human reviews QA batch report + screenshots
     - Human approves → Proceed to Batch N+1
     - Human rejects → Returns to Engineer with feedback

  ### Phase 5: QA Full Verification

  After all batches delivered:
  1. QA executes ALL acceptance tests (full mode)
  2. Checks for cross-batch regressions
  3. Generates complete test report with all evidence
  4. Human performs total review
  ```

  **5.2 — Update Phase Handoff Artifacts table (lines 262-272)**:
  Replace with updated table:

  | Phase | Role | Input Files | Output Files | Gate Criteria | User Review |
  |-------|------|-------------|--------------|---------------|-------------|
  | **1** | Architect | `docs/prd/PRD.md`, design ref (optional) | `technical-spec.md`, `data-model.md`, `api-spec.md`, `acceptance-tests.md`, `delivery-plan.md` | All 5 files exist, every user story has AT-XXX, every batch has AT-XXX | Review specs + acceptance tests + batch plan |
  | **2** | Designer | `docs/prd/PRD.md`, `technical-spec.md`, design source (optional) | `design-system.md`, `component-map.md`, `page-layouts.md` | Design system complete, no hardcoded values | Review design system + components |
  | **3** | Engineer | All specs + design system + acceptance tests + delivery plan | Working code (per batch) | Batch builds pass, tests green, design system compliant | Review code per batch (after QA pass) |
  | **4** | QA | All specs + code | Batch report OR full report in `docs/qa/` | Batch: scoped tests pass; Full: all tests pass | Review batch report + screenshots |

  **5.3 — Add Incremental Delivery Cycle section** (new section):

  ```markdown
  ### Incremental Delivery Cycle

  The Engineer-QA loop operates on batches defined in `delivery-plan.md`:

  ```
  For each Batch in delivery-plan.md:
    @Engineer → Implement Batch features
    @QA → Verify Batch (3-layer)
    If FAIL: @Engineer → Fix → @QA → Re-verify
    If PASS: Human reviews → Approve or send back
  After all batches:
    @QA → Full Verification (all AT-XXX)
    Human → Total Review
  ```

  **Batch Verification Reports**: Each batch produces a scoped test report in
  `docs/qa/batch-N-report.md`. The final full verification produces `docs/qa/test-report.md`.

  **Human Checkpoint**: After each batch QA pass, the user MUST review the batch report
  and key screenshots before the next batch begins. This prevents direction errors
  from compounding across batches.
  ```

  **5.4 — Update Design Source Optionality section (lines 497-511)**:
  Add Local HTML as Priority 0:

  | Priority | Source | When to Use | How It Works |
  |----------|--------|-------------|--------------|
  | **0 (Highest)** | Local HTML file | You have an HTML mockup/export | Designer reads HTML file directly, extracts CSS tokens and layout patterns |
  | **1** | Stitch design prompt | You want AI-generated designs | Provide text prompt; Designer uses Stitch MCP |
  | **2** | Figma design URL | You have existing designs in Figma | Provide Figma URL; Designer uses Figma MCP |
  | **3 (Fallback)** | PRD text only | No design tool available | Designer generates defaults from PRD descriptions |

  **5.5 — Update Version History (lines 550-557)**:
  Add new entry:
  ```
  | 2.0 | 2026-04-14 | Acceptance-test-driven workflow: Architect produces AT cases + delivery batches; Designer produces design system; Engineer implements in batches; QA verifies in 3 layers with dual mode; local HTML design support; test account self-registration |
  ```

  **5.6 — Update Getting Started section (around lines 415-495)**:
  Update Step 2 (Phase 1) to mention 5 outputs and acceptance tests.
  Update Step 3 (Phase 2) to mention design system.
  Update Steps 4-5 (Phase 3-4) to describe batch cycle.
  Add Step 6 for Full Verification.

  **Must NOT do**:
  - Do NOT change Tech Stack section
  - Do NOT change Coding Standards section
  - Do NOT change Global Rules section
  - Do NOT modify skill descriptions
  - Do NOT change agent file paths or names

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Central orchestration document; must accurately reflect all changes from Tasks 1-4
  - **Skills**: [`git-master`]
    - `git-master`: For committing changes
  - **Skills Evaluated but Omitted**:
    - All domain skills: AGENTS.md is the meta-document, doesn't use any domain skill

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Task 6)
  - **Blocks**: Task 7
  - **Blocked By**: Tasks 1, 2, 3, 4

  **References**:

  **Pattern References**:
  - `AGENTS.md:149-258` — Current Development Workflow (rewrite)
  - `AGENTS.md:262-272` — Current Phase Handoff table (replace)
  - `AGENTS.md:415-495` — Current Getting Started section (update steps)
  - `AGENTS.md:497-511` — Current Design Source Optionality (add local HTML)
  - `AGENTS.md:550-557` — Current Version History (add entry)

  **Cross-file References** (must match these exactly):
  - `.opencode/agents/architect.md` (after Task 1) — 5 outputs, AT-XXX format, batch structure
  - `.opencode/agents/designer.md` (after Task 2) — 3 outputs, design-system.md, local HTML priority
  - `.opencode/agents/engineer.md` (after Task 3) — batch workflow, design system compliance
  - `.opencode/agents/qa.md` (after Task 4) — 3 layers, dual mode, self-registration

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: New workflow accurately described
    Tool: Bash (grep)
    Steps:
      1. grep "acceptance-tests.md" AGENTS.md
      2. Assert: appears in Phase 1 outputs
      3. grep "delivery-plan.md" AGENTS.md
      4. Assert: appears in Phase 1 outputs
      5. grep "design-system.md" AGENTS.md
      6. Assert: appears in Phase 2 outputs
      7. grep "3-layer\|3 layer\|three layer" AGENTS.md
      8. Assert: QA verification layers described
    Expected Result: All new artifacts and concepts present in AGENTS.md
    Evidence: grep output captured

  Scenario: Phase handoff table has all new files
    Tool: Read tool
    Steps:
      1. Read the Phase Handoff Artifacts table
      2. Assert: Phase 1 lists 5 output files
      3. Assert: Phase 2 lists 3 output files (including design-system.md)
      4. Assert: Phase 3-4 mentions batch-based delivery
    Expected Result: Table accurately reflects new workflow
    Evidence: Section content captured

  Scenario: Local HTML design source documented
    Tool: Bash (grep)
    Steps:
      1. grep -i "local html\|HTML file\|Priority 0" AGENTS.md
      2. Assert: local HTML mentioned as highest priority design source
    Expected Result: Local HTML in design source table
    Evidence: grep output captured

  Scenario: Version history updated
    Tool: Bash (grep)
    Steps:
      1. grep "2.0" AGENTS.md
      2. Assert: version 2.0 entry exists with acceptance-test-driven description
    Expected Result: Version history reflects the redesign
    Evidence: grep output captured

  Scenario: Existing sections preserved
    Tool: Bash (grep)
    Steps:
      1. grep "Tech Stack" AGENTS.md
      2. Assert: section still exists
      3. grep "Coding Standards" AGENTS.md
      4. Assert: section still exists
      5. grep "Global Rules" AGENTS.md
      6. Assert: section still exists
    Expected Result: Non-workflow sections unchanged
    Evidence: grep output captured
  ```

  **Commit**: YES (groups with Task 6 as Wave 3)
  - Message: `docs: update AGENTS.md for acceptance-test-driven incremental delivery workflow`
  - Files: `AGENTS.md`
  - Pre-commit: `grep -c "acceptance-tests.md" AGENTS.md` → 3+

---

- [ ] 6. Modify `docs/prd/PRD_TEMPLATE.md` — Acceptance Criteria Format Guidance

  **What to do**:

  **6.1 — Update User Stories section (around lines 152-186)**:
  Add guidance text explaining that acceptance criteria will be transformed into structured test cases by the Architect:

  ```markdown
  > **Note**: Write acceptance criteria in plain language here. The Architect agent
  > will transform these into structured acceptance test cases (Given/When/Then format
  > with automation hints) in `docs/specs/acceptance-tests.md`. Focus on describing
  > WHAT should happen, not HOW to test it.
  >
  > Good: "User can create a new task with a title and description"
  > Good: "Dashboard shows count of completed tasks"
  > Avoid: "Click the button with data-testid='create-task'" (too implementation-specific)
  ```

  **6.2 — Add optional two-layer format example**:
  In the acceptance criteria subsection, add an optional example showing what the Architect will produce, so PRD authors understand the downstream format:

  ```markdown
  > **Example of what Architect produces from your criteria**:
  >
  > Your PRD says: "User can create a new task with title and description"
  >
  > Architect produces in acceptance-tests.md:
  > ```
  > ### AT-005: Create task with title and description
  > **User Story**: US-02
  > **Batch**: Batch-2
  >
  > **Scenario**:
  > Given I am logged in and on the dashboard
  > When I click "New Task" and fill in title "Buy groceries" and description "Weekly shopping"
  > Then a new task appears in my task list with the title "Buy groceries"
  >
  > **Automation Hints**:
  > - API: POST /api/v1/tasks → 201
  > - UI Selector: button[data-testid="new-task"]
  > - UI Assertion: .task-list contains "Buy groceries"
  > ```
  ```

  **6.3 — Add Design Reference section** (if not already present):
  Add a section for specifying design reference:

  ```markdown
  ## Design Reference (Optional)

  Provide ONE of the following (in order of preference):

  1. **Local HTML file**: Path to HTML mockup file(s)
     - Path: `designs/mockup.html`
  2. **Stitch prompt**: Describe the desired UI for AI generation
     - Prompt: "[describe UI]"
  3. **Figma URL**: Link to existing Figma designs
     - URL: `https://figma.com/design/...`
  4. **None**: Designer will generate suggestions from PRD descriptions above
  ```

  **Must NOT do**:
  - Do NOT change the overall PRD template structure
  - Do NOT remove existing sections
  - Do NOT make the two-layer format mandatory in the PRD (it's Architect's job)
  - Do NOT add implementation-specific details to the template

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Small, focused changes to a template file; mostly adding guidance text
  - **Skills**: [`git-master`]
    - `git-master`: For committing changes

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Task 5)
  - **Blocks**: Task 7
  - **Blocked By**: Task 1 (needs to know AT-XXX format)

  **References**:

  **Pattern References**:
  - `docs/prd/PRD_TEMPLATE.md:152-186` — Current User Stories section
  - `docs/prd/EXAMPLE_PRD.md` — Filled example showing acceptance criteria in practice

  **Cross-file References**:
  - `.opencode/agents/architect.md` (after Task 1) — AT-XXX format specification (must match example shown in PRD template)

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Guidance text added to acceptance criteria section
    Tool: Bash (grep)
    Steps:
      1. grep -i "architect.*transform\|architect.*will\|Given.*When.*Then" docs/prd/PRD_TEMPLATE.md
      2. Assert: guidance about Architect transformation exists
    Expected Result: PRD authors understand acceptance criteria flow
    Evidence: grep output captured

  Scenario: Design reference section exists
    Tool: Bash (grep)
    Steps:
      1. grep -i "design reference\|local html\|Stitch prompt\|Figma URL" docs/prd/PRD_TEMPLATE.md
      2. Assert: design reference options documented
    Expected Result: PRD template includes design source specification
    Evidence: grep output captured

  Scenario: Existing template structure preserved
    Tool: Bash (grep)
    Steps:
      1. grep "## Feature Overview" docs/prd/PRD_TEMPLATE.md
      2. Assert: section exists
      3. grep "## User Stories" docs/prd/PRD_TEMPLATE.md
      4. Assert: section exists
      5. grep "## Data Requirements" docs/prd/PRD_TEMPLATE.md
      6. Assert: section exists
    Expected Result: All original sections preserved
    Evidence: grep output captured
  ```

  **Commit**: YES (groups with Task 5 as Wave 3)
  - Message: `docs(prd): add acceptance criteria format guidance and design reference section`
  - Files: `docs/prd/PRD_TEMPLATE.md`
  - Pre-commit: `grep -c "acceptance-tests.md\|AT-XXX\|Given.*When.*Then" docs/prd/PRD_TEMPLATE.md` → 1+

---

- [ ] 7. Cross-File Consistency Review

  **What to do**:

  Verify that all 6 modified files are internally consistent with each other. This is a read-only verification task — no file modifications unless inconsistencies are found.

  **7.1 — Artifact Name Consistency**:
  Verify these artifact names appear correctly in all relevant files:

  | Artifact | Producer | Consumers | Must appear in AGENTS.md |
  |----------|----------|-----------|-------------------------|
  | `acceptance-tests.md` | architect.md | engineer.md, qa.md | YES (Phase 1 output) |
  | `delivery-plan.md` | architect.md | engineer.md, qa.md | YES (Phase 1 output) |
  | `design-system.md` | designer.md | engineer.md, qa.md | YES (Phase 2 output) |

  **7.2 — Format Consistency**:
  - AT-XXX format in architect.md matches what qa.md expects to read
  - Batch naming convention (Batch-N: name) is consistent across architect.md, engineer.md, qa.md
  - Design system token names in designer.md match what engineer.md references

  **7.3 — Workflow Consistency**:
  - AGENTS.md workflow description matches the sum of all 4 agent definitions
  - Phase numbering is consistent
  - Input/output chains form a complete DAG (no dangling references)

  **7.4 — No Contradictions**:
  - Architect says 5 outputs → AGENTS.md says Phase 1 has 5 outputs
  - Designer says 3 outputs → AGENTS.md says Phase 2 has 3 outputs
  - QA says 3 layers → AGENTS.md describes 3 layers
  - Design tolerance rules are consistent between qa.md and AGENTS.md

  **7.5 — Fix any inconsistencies found**:
  If any inconsistency is detected, fix it in the appropriate file and document what was changed.

  **Must NOT do**:
  - Do NOT make substantive content changes (only fix inconsistencies)
  - Do NOT add new features or concepts at this stage

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Read-heavy verification task with potential small fixes; mostly grep and read operations
  - **Skills**: [`git-master`]
    - `git-master`: For committing any fixes

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 (final, sequential)
  - **Blocks**: None (final task)
  - **Blocked By**: Tasks 1, 2, 3, 4, 5, 6

  **References**:

  **All modified files** (read all to verify):
  - `.opencode/agents/architect.md`
  - `.opencode/agents/designer.md`
  - `.opencode/agents/engineer.md`
  - `.opencode/agents/qa.md`
  - `AGENTS.md`
  - `docs/prd/PRD_TEMPLATE.md`

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Artifact names consistent across files
    Tool: Bash (grep)
    Steps:
      1. grep -l "acceptance-tests.md" .opencode/agents/*.md AGENTS.md
      2. Assert: appears in architect.md, engineer.md, qa.md, AGENTS.md (4 files)
      3. grep -l "delivery-plan.md" .opencode/agents/*.md AGENTS.md
      4. Assert: appears in architect.md, engineer.md, qa.md, AGENTS.md (4 files)
      5. grep -l "design-system.md" .opencode/agents/*.md AGENTS.md
      6. Assert: appears in designer.md, engineer.md, qa.md, AGENTS.md (4 files)
    Expected Result: All artifacts referenced in all relevant files
    Evidence: grep output captured

  Scenario: Output counts match between agent files and AGENTS.md
    Tool: Bash (grep)
    Steps:
      1. grep "FIVE\|5 spec" .opencode/agents/architect.md AGENTS.md
      2. Assert: both files mention 5 outputs for Phase 1
      3. grep "design-system.md.*component-map.md\|3 output\|THREE" .opencode/agents/designer.md AGENTS.md
      4. Assert: both mention 3 outputs for Phase 2
    Expected Result: Output counts consistent
    Evidence: grep output captured

  Scenario: 3-layer terminology consistent
    Tool: Bash (grep)
    Steps:
      1. grep "Layer 1\|Layer 2\|Layer 3" .opencode/agents/qa.md .opencode/agents/engineer.md AGENTS.md
      2. Assert: Layer references consistent across files
      3. Verify Layer 1=API, Layer 2=UI functionality, Layer 3=UI design in all files
    Expected Result: 3-layer terminology matches everywhere
    Evidence: grep output captured

  Scenario: No orphaned references
    Tool: Bash (grep)
    Steps:
      1. grep -rn "acceptance-tests.md\|delivery-plan.md\|design-system.md" .opencode/agents/*.md AGENTS.md docs/prd/PRD_TEMPLATE.md
      2. Verify each reference points to a file that is actually produced by some agent
      3. Verify no file references a non-existent artifact
    Expected Result: All references valid, no dangling references
    Evidence: Full grep output captured and reviewed
  ```

  **Commit**: YES (only if fixes were needed)
  - Message: `docs(agents): fix cross-file consistency issues`
  - Files: [whichever files needed fixes]
  - Pre-commit: All grep checks above pass

---

## Commit Strategy

| After Tasks | Message | Files | Verification |
|-------------|---------|-------|-------------|
| 1 + 2 (Wave 1) | `docs(agents): expand architect with acceptance tests; add design system to designer` | `architect.md`, `designer.md` | grep checks from Tasks 1-2 |
| 3 + 4 (Wave 2) | `docs(agents): restructure engineer for batches; rebuild QA with 3-layer verification` | `engineer.md`, `qa.md` | grep checks from Tasks 3-4 |
| 5 + 6 (Wave 3) | `docs: update AGENTS.md workflow and PRD template` | `AGENTS.md`, `PRD_TEMPLATE.md` | grep checks from Tasks 5-6 |
| 7 (Wave 4) | `docs(agents): fix cross-file consistency issues` (only if needed) | [varies] | All cross-file grep checks |

---

## Success Criteria

### Verification Commands

```bash
# All new artifacts referenced in correct producer files
grep -c "acceptance-tests.md" .opencode/agents/architect.md  # Expected: 5+
grep -c "delivery-plan.md" .opencode/agents/architect.md     # Expected: 5+
grep -c "design-system.md" .opencode/agents/designer.md      # Expected: 5+

# All new artifacts referenced in consumer files
grep -l "acceptance-tests.md" .opencode/agents/engineer.md .opencode/agents/qa.md AGENTS.md  # Expected: 3 files
grep -l "delivery-plan.md" .opencode/agents/engineer.md .opencode/agents/qa.md AGENTS.md     # Expected: 3 files
grep -l "design-system.md" .opencode/agents/engineer.md .opencode/agents/qa.md AGENTS.md     # Expected: 3 files

# 3-layer verification in QA
grep -c "Layer [123]" .opencode/agents/qa.md  # Expected: 3+

# Design system compliance in Engineer
grep -c "NEVER hardcode" .opencode/agents/engineer.md  # Expected: 1+

# Batch concept in Engineer
grep -ci "batch" .opencode/agents/engineer.md  # Expected: 5+

# AT-XXX format in Architect
grep -c "AT-XXX\|AT-[0-9]" .opencode/agents/architect.md  # Expected: 3+

# Local HTML in Designer
grep -ci "local html\|\.html" .opencode/agents/designer.md  # Expected: 2+

# AGENTS.md version updated
grep "2.0" AGENTS.md  # Expected: version 2.0 entry

# Test account self-registration in QA
grep -ci "self-regist" .opencode/agents/qa.md  # Expected: 1+
```

### Final Checklist

- [ ] Architect produces 5 outputs (was 3)
- [ ] Two-layer acceptance test format fully specified
- [ ] Delivery batch structure fully specified
- [ ] Designer produces 3 outputs (was 2), including design-system.md
- [ ] Local HTML is Priority 0 design source
- [ ] Engineer workflow is batch-based
- [ ] Engineer has design system compliance rules
- [ ] Engineer has QA feedback loop protocol
- [ ] QA has 3-layer verification (API → UI function → UI design)
- [ ] QA has dual mode (batch + full)
- [ ] QA has test account self-registration protocol
- [ ] QA has design tolerance rules
- [ ] AGENTS.md accurately describes new workflow
- [ ] AGENTS.md phase handoff table updated
- [ ] PRD template guides users on acceptance criteria format
- [ ] All cross-file references consistent
- [ ] No contradictions between any two files
- [ ] All existing capabilities preserved (no regressions)
