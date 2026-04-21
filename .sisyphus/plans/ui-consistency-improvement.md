# UI Consistency Improvement: Two-Phase Delivery with Visual References

## TL;DR

> **Quick Summary**: Add a UI Polish Phase (page-by-page) after feature batches, with screenshot-based visual references from Designer and hard design targets for Engineer. This addresses the root causes of UI inconsistency: cognitive overload from mixing API+UI work, advisory-only Layer 3, text-only design specs, and lenient tolerance rules.
>
> **Deliverables**:
> - Modified `.opencode/agents/designer.md` — New visual reference artifact output
> - Modified `.opencode/agents/architect.md` — UI Polish batches in delivery plan
> - Modified `.opencode/agents/engineer.md` — UI Polish Mode with hard design target
> - Modified `.opencode/agents/qa.md` — UI Polish verification mode with blocking Layer 3
> - Modified `AGENTS.md` — UI Polish Phase in workflow lifecycle
> - Modified `.agents/skills/design-to-components/SKILL.md` — Visual reference generation step + local HTML Priority 0 fix
>
> **Estimated Effort**: Medium
> **Parallel Execution**: YES — 4 waves
> **Critical Path**: Task 1 (designer) → Task 3 (engineer) → Task 5 (AGENTS.md) → Task 7 (consistency)

---

## Context

### Original Request

User observes that despite V2 workflow improvements (acceptance-test-driven delivery, 3-layer QA, design system), UI consistency issues persist. User proposed: (1) page-by-page batches, (2) UI design as hard target, (3) allowing interaction stubs for visual fidelity.

### Interview Summary

**Key Discussions**:
- V2 workflow redesign fully executed (all 7 tasks complete). Introduced AT-XXX acceptance tests, delivery batches, design system, 3-layer QA, dual mode, test account self-registration.
- Root cause analysis identified 6 issues: feature-scoped batches cause cognitive overload, QA Layer 3 is advisory, design specs are text-only, tolerance too lenient, no visual baseline, design compliance is last priority.
- User confirmed Three-Phase approach over pure page-per-batch.

**Design Decisions Confirmed**:

| Decision | Conclusion |
|----------|-----------|
| Batch strategy | Two-Phase: Feature Batches (V2, unchanged) → UI Polish Phase (NEW, page-by-page) |
| Visual references | Designer produces screenshot-based visual reference artifacts |
| Design as hard target | YES — during UI Polish, design reference is the hard, blocking target |
| Stub boundaries | Navigation + auth must work; other interactions can be stubbed during UI Polish |
| Layer 3 in feature batches | Keep as advisory (unchanged from V2) |
| UI Polish optionality | OPTIONAL — user can skip and go directly to full QA verification |

### Metis Review

**Identified Gaps (all addressed in plan)**:

| Gap | Resolution |
|-----|-----------|
| When does Designer produce visual references? Phase 2 has no running app | Visual references = design tool output (Stitch screenshots, Figma frames, HTML renders), produced during Phase 2 as static artifacts — not running app screenshots |
| Visual reference artifact format and storage | PNG/HTML screenshots stored at `docs/specs/visual-references/{page-name}.png` with defined format spec |
| Shared layout components during polish | Shared layouts (sidebar, header, footer) are polished FIRST as their own batch unit before page-specific polish |
| Dark mode / responsive scope | Only in scope if visual references exist for those variants; otherwise excluded |
| Pages without visual references | EXCLUDED from UI Polish; Designer must produce references retroactively if needed |
| UI Polish fix breaks L1/L2 | Regression gate: `pnpm --dir frontend build && pnpm --dir frontend test` after EVERY page polish. 2-cycle limit then escalate. |
| Backend changes during UI Polish | Backend is FROZEN. If visual fix needs API changes, escalate to user as spec conflict |
| design-to-components SKILL.md inconsistency | Skill still has 3-tier priority (missing local HTML as Priority 0 from V2). Fix in this plan |
| Architect needs UI Polish batch support | delivery-plan.md format expanded with optional UI Polish section. UI Polish batches auto-derived from page inventory |
| "Polish becomes redesign" scope creep | Explicit guardrail: UI Polish MUST match visual reference, not improve upon it. No new components, no functional changes |

---

## Work Objectives

### Core Objective

Add a UI Polish Phase to the agent workflow that enables page-by-page visual fidelity improvement after feature batches are complete, using screenshot-based visual references as the hard design target.

### Concrete Deliverables

- 6 modified markdown files defining the enhanced workflow
- UI Polish Phase fully specified as an optional workflow phase
- Visual reference artifact format defined and integrated into Designer → Engineer → QA pipeline

### Definition of Done

- [ ] All 6 files modified and internally consistent
- [ ] UI Polish Phase defined as optional, page-by-page, visual-fidelity-focused
- [ ] Visual reference artifact format specified in designer.md with storage path
- [ ] Engineer has UI Polish Mode with hard design target and stub boundary rules
- [ ] QA has UI Polish verification mode with blocking Layer 3
- [ ] AGENTS.md accurately describes the enhanced workflow with UI Polish Phase
- [ ] design-to-components skill includes visual reference generation step
- [ ] No contradictions between any two files

### Must Have

- Visual reference artifact specification (format, storage path, generation workflow)
- UI Polish Phase as optional phase after feature batch completion
- Page-by-page batching in UI Polish (shared layouts FIRST, then individual pages)
- Hard design target during UI Polish (Layer 3 becomes BLOCKING)
- Stub boundary rules (nav + auth must work, rest can stub)
- Backend freeze during UI Polish (frontend CSS/layout changes only)
- Regression gate per page (build + test after each page polish)
- 2-cycle fix limit per page (then escalate to user)
- Explicit guardrails against scope creep (no redesign, no new components, no functional changes)

### Must NOT Have (Guardrails)

- **No changes to existing feature batch workflow** — Phases 1→2→3→4 loop unchanged; Layer 3 stays advisory during feature batches
- **No template project code changes** — only markdown agent definition files
- **No new agent files** — extend existing agents with new mode
- **No tooling requirements** — no Percy, Chromatic; use Playwright screenshots via existing QA capabilities
- **No dark mode/responsive polish** unless visual references exist for those variants
- **No functional changes during UI Polish** — CSS classes, Tailwind utilities, JSX nesting, spacing, colors, typography ONLY
- **No backend modifications during UI Polish** — backend is frozen; escalate if needed
- **No "improving" upon the design** — match it, don't make it better
- **No new component creation during UI Polish** — only restyle existing components

---

## Verification Strategy

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ALL tasks in this plan MUST be verifiable WITHOUT any human action.

### Test Decision

- **Infrastructure exists**: N/A (deliverables are markdown files)
- **Automated tests**: None (documentation changes)
- **Framework**: N/A

### Agent-Executed QA Scenarios

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
├── Task 1: Modify designer.md (define visual reference artifact)
└── Task 2: Modify architect.md (add UI Polish to delivery plan)

Wave 2 (After Wave 1):
├── Task 3: Modify engineer.md (add UI Polish Mode)
└── Task 4: Modify qa.md (add UI Polish verification mode)

Wave 3 (After Wave 2):
├── Task 5: Modify AGENTS.md (add UI Polish Phase to workflow)
└── Task 6: Update design-to-components SKILL.md (visual reference step)

Wave 4 (After Wave 3):
└── Task 7: Cross-file consistency review

Critical Path: Task 1 → Task 3 → Task 5 → Task 7
Parallel Speedup: ~35% faster than sequential
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|-----------|--------|---------------------|
| 1 (designer.md) | None | 3, 4, 5 | 2 |
| 2 (architect.md) | None | 3, 4, 5 | 1 |
| 3 (engineer.md) | 1, 2 | 5 | 4 |
| 4 (qa.md) | 1, 2 | 5 | 3 |
| 5 (AGENTS.md) | 1, 2, 3, 4 | 7 | 6 |
| 6 (SKILL.md) | 1 | 7 | 5 |
| 7 (consistency) | All | None | None (final) |

### Agent Dispatch Summary

| Wave | Tasks | Recommended |
|------|-------|-------------|
| 1 | 1, 2 | Parallel: both define new artifacts/structures |
| 2 | 3, 4 | Parallel: both consume Wave 1 outputs |
| 3 | 5, 6 | Parallel: AGENTS.md is meta-doc; SKILL.md is standalone |
| 4 | 7 | Sequential: final cross-file validation |

---

## TODOs

---

- [ ] 1. Modify `.opencode/agents/designer.md` — Add Visual Reference Artifact Output

  **What to do**:

  **1.1 — Update Core Mission section (line 23)**:
  - Change "produce three specification documents" to "produce four specification documents"
  - Add 4th output:
    - `docs/specs/visual-references/` — A directory of page-level screenshots/renders from the design source, one per page, serving as the visual fidelity target for the UI Polish Phase

  **1.2 — Add Visual Reference output specification in Produced Outputs section**:
  Insert after the existing design-system.md output spec (after approximately line 131). New output:

  ```markdown
  ### Output 4: `docs/specs/visual-references/`

  **Purpose**: Provide page-level visual targets for the UI Polish Phase. Each file represents
  the intended visual appearance of one page at desktop viewport.

  **Artifact Format**:
  - One file per page defined in `page-layouts.md`
  - File naming: `{page-name}.png` (e.g., `dashboard.png`, `login.png`, `settings.png`)
  - Source: Captured from the design tool output:
    - Priority 0 (Local HTML): Browser screenshot of the HTML file at 1440×900
    - Priority 1 (Stitch): Screenshot from `get_screen_image` output
    - Priority 2 (Figma): Frame export via Figma MCP
    - Priority 3 (PRD only): SKIP — no visual reference produced (UI Polish Phase unavailable)
  - Viewport: Desktop (1440×900) by default. If design source provides mobile/tablet variants,
    include as `{page-name}-mobile.png`, `{page-name}-tablet.png`
  - State: Each screenshot shows the page in a "populated" state (with sample data, not empty)

  **Coverage Rule**: Every page in `page-layouts.md` SHOULD have a visual reference.
  Pages without visual references are excluded from the UI Polish Phase.

  **NOT a visual reference**: Loading states, error states, empty states. These are
  handled by design system tokens and component defaults, not pixel-level matching.

  **Storage**: `docs/specs/visual-references/` directory, committed to git alongside other specs.
  ```

  **1.3 — Add Visual Reference generation step to workflow**:
  Insert a new workflow step after the design system extraction step and component mapping.
  This step runs AFTER component mapping is complete:

  New step: "Generate Visual References"
  - If Priority 0 (Local HTML): Use Playwright (via playwright skill) to open the HTML file(s) in a browser and capture screenshots at 1440×900 viewport. Save to `docs/specs/visual-references/`.
  - If Priority 1 (Stitch): Use `get_screen_image` from Stitch MCP for each generated screen. Save to `docs/specs/visual-references/`.
  - If Priority 2 (Figma): Use Figma MCP to export each key frame as PNG. Save to `docs/specs/visual-references/`.
  - If Priority 3 (PRD only): SKIP this step entirely. Log: "No visual references available — UI Polish Phase will be unavailable."
  - Verify: Each file in `docs/specs/visual-references/` has a matching page in `page-layouts.md`.

  **1.4 — Update Validation Gate (around line 358-368)**:
  Add validation for visual references:
  - If design source is Priority 0/1/2: `docs/specs/visual-references/` exists and contains at least one `.png` file
  - Every page in `page-layouts.md` has a corresponding file in `docs/specs/visual-references/` (or is explicitly documented as excluded)
  - If Priority 3 (PRD only): Validate that Designer logged "UI Polish Phase unavailable"

  **1.5 — Update Handoff Checklist**:
  Add `docs/specs/visual-references/` to the list of files presented for human review during Phase 2 approval. Note: "Review visual references — these become the hard target for UI Polish Phase."

  **Must NOT do**:
  - Do NOT remove or modify existing outputs (design-system.md, component-map.md, page-layouts.md)
  - Do NOT change the design source priority order
  - Do NOT make visual references mandatory when design source is PRD-only (Priority 3)
  - Do NOT add complex annotation tooling — simple screenshots are sufficient

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Defining a new artifact type with format spec, generation workflow, and validation rules
  - **Skills**: [`git-master`]
    - `git-master`: For committing changes
  - **Skills Evaluated but Omitted**:
    - `playwright`: The Designer agent may USE Playwright for screenshots, but we're modifying the agent definition, not running Playwright
    - `design-to-components`: Will be updated in Task 6 separately

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 2)
  - **Blocks**: Tasks 3, 4, 5, 6
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References** (existing content to preserve/extend):
  - `.opencode/agents/designer.md:22-29` — Current Core Mission (3 outputs → 4 outputs)
  - `.opencode/agents/designer.md:62-131` — Current Produced Outputs section (add Output 4 after design-system.md)
  - `.opencode/agents/designer.md:313-327` — Current Step 2b: Extract Design System workflow (insert visual reference step after)
  - `.opencode/agents/designer.md:358-368` — Current Validation Gate (add visual reference checks)
  - `.opencode/agents/designer.md:37-39` — Current design source priority (Priority 0 local HTML already defined — reference for screenshot generation logic)

  **Architecture References**:
  - `AGENTS.md:279-288` — Phase Handoff Artifacts table (visual references will be added to Phase 2 outputs in Task 5)

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Core Mission updated to 4 outputs
    Tool: Bash (grep)
    Steps:
      1. grep -c "four specification documents" .opencode/agents/designer.md
      2. Assert: count >= 1
      3. grep "visual-references" .opencode/agents/designer.md
      4. Assert: output mentions visual-references directory
    Expected Result: 4th output (visual references) added to Core Mission
    Evidence: grep output captured

  Scenario: Visual reference artifact format specified
    Tool: Bash (grep)
    Steps:
      1. grep -c "visual-references" .opencode/agents/designer.md
      2. Assert: count >= 5 (mission + output spec + workflow + validation + handoff)
      3. grep "1440" .opencode/agents/designer.md
      4. Assert: viewport size specified
      5. grep "{page-name}.png" .opencode/agents/designer.md
      6. Assert: file naming convention specified
    Expected Result: Complete artifact format specification exists
    Evidence: grep output captured

  Scenario: Visual reference generation workflow exists
    Tool: Bash (grep)
    Steps:
      1. grep -i "generate visual\|visual reference.*step\|capture screenshot" .opencode/agents/designer.md
      2. Assert: generation workflow step exists
      3. grep "get_screen_image\|Playwright\|Figma MCP" .opencode/agents/designer.md
      4. Assert: generation methods specified per priority tier
    Expected Result: Clear generation instructions for each design source priority
    Evidence: grep output captured

  Scenario: Existing outputs preserved
    Tool: Bash (grep)
    Steps:
      1. grep "design-system.md" .opencode/agents/designer.md
      2. Assert: still referenced
      3. grep "component-map.md" .opencode/agents/designer.md
      4. Assert: still referenced
      5. grep "page-layouts.md" .opencode/agents/designer.md
      6. Assert: still referenced
    Expected Result: All 3 original outputs preserved alongside new 4th output
    Evidence: grep output captured
  ```

  **Commit**: YES (groups with Task 2 as Wave 1)
  - Message: `docs(agents): add visual reference artifact output to designer`
  - Files: `.opencode/agents/designer.md`
  - Pre-commit: `grep -c "visual-references" .opencode/agents/designer.md` → 5+

---

- [ ] 2. Modify `.opencode/agents/architect.md` — Add UI Polish Phase to Delivery Plan

  **What to do**:

  **2.1 — Update delivery-plan.md output specification (around lines 92-98)**:
  Expand the delivery-plan.md format to include an optional UI Polish Phase section:

  ```markdown
  ### UI Polish Phase (Optional Section in delivery-plan.md)

  If the Designer produced visual references (`docs/specs/visual-references/` exists),
  include a UI Polish section at the end of delivery-plan.md:

  ```
  ## UI Polish Phase (Optional — requires visual references from Designer)

  Execute after ALL feature batches pass QA Layers 1+2.
  User decides whether to run this phase or skip to Full QA Verification.

  ### UI-Polish-0: Shared Layout Components
  - Scope: Sidebar, header, footer, navigation bar — all shared layout components
  - Pages affected: All pages using this layout
  - Visual references: docs/specs/visual-references/{layout-related pages}
  - Dependencies: All feature batches complete

  ### UI-Polish-1: {Page Name}
  - Scope: {page-name} page visual fidelity
  - Visual reference: docs/specs/visual-references/{page-name}.png
  - Dependencies: UI-Polish-0 (shared layouts)
  - Stub OK: Non-navigation, non-auth interactions

  ### UI-Polish-2: {Next Page Name}
  ...
  ```

  **Rules for UI Polish batches**:
  - UI-Polish-0 (shared layouts) ALWAYS comes first
  - Subsequent UI-Polish-N batches are one page each, ordered by user-facing importance
  - Only pages WITH visual references appear as UI Polish batches
  - Each UI Polish batch references its specific visual reference file
  - UI Polish batches do NOT have AT-XXX acceptance tests — the visual reference IS the acceptance criteria
  ```

  **2.2 — Update delivery batch rules in Critical Rules section**:
  Add:
  - "If Designer produces visual references, delivery-plan.md MUST include a UI Polish Phase section"
  - "UI Polish batches are named `UI-Polish-N: {Page/Component Name}` to distinguish from feature batches (`Batch-N: {Module Name}`)"
  - "UI Polish Phase is always the LAST section in delivery-plan.md, after all feature batches"

  **2.3 — Update Step 8 (Define Delivery Batches) workflow**:
  Add a sub-step at the end of the batch definition process:
  - After defining all feature batches, check if `docs/specs/visual-references/` will be produced by Designer
  - If YES: Generate UI Polish batches from the page inventory in `page-layouts.md`
  - If NO: Note "UI Polish Phase: N/A — no visual references available"
  - UI-Polish-0 covers shared layout components; subsequent batches cover individual pages

  **Must NOT do**:
  - Do NOT change the existing feature batch structure or naming
  - Do NOT make UI Polish Phase mandatory (it's optional, contingent on visual references)
  - Do NOT create AT-XXX acceptance tests for UI Polish batches (visual reference IS the criteria)
  - Do NOT modify the existing acceptance test format or workflow steps 1-7

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Relatively small changes — adding an optional section to an existing output format
  - **Skills**: [`git-master`]
    - `git-master`: For committing changes

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: Tasks 3, 4, 5
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `.opencode/agents/architect.md:92-98` — Current delivery-plan.md output spec (extend with UI Polish section)
  - `.opencode/agents/architect.md:394-404` — Current Step 8: Define Delivery Batches (add UI Polish sub-step)
  - `.opencode/agents/architect.md:87-91` — Current batch naming convention (add UI-Polish-N naming)

  **Cross-file References**:
  - `.opencode/agents/designer.md` (after Task 1) — visual-references artifact path and coverage
  - `AGENTS.md:292-308` — Incremental Delivery Cycle (will be updated in Task 5)

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: UI Polish Phase section defined for delivery-plan.md
    Tool: Bash (grep)
    Steps:
      1. grep -i "UI Polish Phase" .opencode/agents/architect.md
      2. Assert: appears in delivery-plan.md output specification
      3. grep "UI-Polish-0\|UI-Polish-N" .opencode/agents/architect.md
      4. Assert: batch naming convention defined
    Expected Result: UI Polish Phase format specified in architect
    Evidence: grep output captured

  Scenario: UI Polish is optional
    Tool: Bash (grep)
    Steps:
      1. grep -i "optional\|contingent\|if.*visual reference" .opencode/agents/architect.md
      2. Assert: optionality clearly stated
    Expected Result: UI Polish Phase not mandatory
    Evidence: grep output captured

  Scenario: Shared layouts first rule exists
    Tool: Bash (grep)
    Steps:
      1. grep -i "shared layout\|UI-Polish-0" .opencode/agents/architect.md
      2. Assert: shared layouts as first UI Polish batch documented
    Expected Result: Clear ordering rule for UI Polish batches
    Evidence: grep output captured

  Scenario: Existing feature batch structure preserved
    Tool: Bash (grep)
    Steps:
      1. grep "Batch-N\|Batch-1\|Batch-2" .opencode/agents/architect.md
      2. Assert: feature batch naming still present
      3. grep "AT-XXX\|AT-001" .opencode/agents/architect.md
      4. Assert: acceptance test format still present
    Expected Result: No regression to existing batch structure
    Evidence: grep output captured
  ```

  **Commit**: YES (groups with Task 1 as Wave 1)
  - Message: `docs(agents): add UI Polish Phase to architect delivery plan`
  - Files: `.opencode/agents/architect.md`
  - Pre-commit: `grep -c "UI Polish" .opencode/agents/architect.md` → 3+

---

- [ ] 3. Modify `.opencode/agents/engineer.md` — Add UI Polish Mode with Hard Design Target

  **What to do**:

  **3.1 — Add UI Polish Mode section** (new major section, insert after the QA Feedback Loop section at line 103):

  ```markdown
  ## UI Polish Mode

  After ALL feature batches pass QA verification (Layers 1+2), the user may invoke
  UI Polish Mode. In this mode, you work page-by-page matching the visual reference
  screenshots from `docs/specs/visual-references/`.

  ### When UI Polish Mode Activates

  - User explicitly requests it (e.g., "Start UI Polish for {page}")
  - `delivery-plan.md` contains a UI Polish Phase section
  - `docs/specs/visual-references/` contains visual reference files

  ### UI Polish Workflow (Per Page)

  1. **Read the visual reference**: Open `docs/specs/visual-references/{page-name}.png`
     with the multimodal look_at tool. Understand the exact visual layout, spacing,
     colors, typography, and component arrangement.
  2. **Read current implementation**: Navigate to the page in the running app using
     Playwright (via playwright skill). Take a screenshot for comparison.
  3. **Identify discrepancies**: Compare the visual reference against the current
     implementation. List every visual difference: spacing, colors, alignment,
     typography, component sizing, border-radius, shadows.
  4. **Fix discrepancies**: Modify ONLY CSS classes, Tailwind utilities, and JSX
     structure (nesting, ordering) to match the visual reference. See "Allowed Changes"
     below.
  5. **Regression gate**: After each page, run:
     ```bash
     pnpm --dir frontend build && pnpm --dir frontend test
     ```
     If either fails, REVERT the page changes and report the conflict.
  6. **Self-verify**: Take a new screenshot via Playwright and compare against
     the visual reference. If satisfied, hand off to QA.
  7. **Hand off to QA**: Deliver with UI Polish batch identifier (e.g., "UI-Polish-1: Dashboard")
     and the visual reference path.

  ### Hard Design Target Rule

  **During UI Polish, the visual reference is the HARD TARGET.**

  - The visual reference defines what the page MUST look like.
  - "Good enough" is NOT acceptable. Match the reference.
  - If matching exactly requires layout restructuring (moving divs, changing
    flex-direction, reorganizing grid areas), DO IT.
  - If matching requires changing component spacing, sizing, or arrangement, DO IT.
  - The ONLY exception: Shadcn UI components (`frontend/src/components/ui/`)
    remain unmodified. Work AROUND them.

  ### Allowed Changes (UI Polish ONLY)

  | Allowed | NOT Allowed |
  |---------|-------------|
  | CSS classes and Tailwind utilities | New API endpoints or modifications |
  | JSX nesting and element ordering | New state management or data fetching |
  | Spacing, padding, margin values | New component creation |
  | Color token application | Business logic changes |
  | Typography adjustments | Database schema changes |
  | Border-radius and shadow tokens | New dependencies or imports of external libs |
  | Responsive breakpoint tweaks | Modifications to Shadcn UI components |

  ### Stub Boundary Rules

  During UI Polish, functional completeness is secondary to visual fidelity:

  - **MUST work**: Page navigation (links, router), authentication state (logged in/out),
    core layout rendering
  - **CAN be stubbed**: Tooltips, hover state previews, secondary modal contents,
    notification popups, animation sequences, drag-and-drop, real-time updates
  - **Stub implementation**: Use `onClick={() => {}}` or `disabled` state with
    correct visual styling. The element MUST be visually present and correctly
    styled even if non-functional.

  ### Escalation Rules

  - **Fix cycle limit**: If a page's UI Polish cycles more than 2 times between
    Engineer and QA, escalate to user as a design-implementation conflict.
  - **Backend dependency**: If matching the visual reference requires backend changes
    (new endpoint, schema change, different data format), STOP and escalate to user.
    Backend is FROZEN during UI Polish.
  - **Shadcn conflict**: If a Shadcn component's built-in styling prevents matching
    the visual reference, document the discrepancy and skip. Do NOT modify Shadcn
    components.

  ### UI Polish Batch Order

  Follow the order in `delivery-plan.md`:
  1. **UI-Polish-0: Shared Layout Components** — Sidebar, header, footer, navigation.
     These affect ALL pages, so polish them first.
  2. **UI-Polish-1 through UI-Polish-N**: Individual pages, ordered by delivery plan.
  3. After all UI Polish batches: user decides whether to proceed to Full QA Verification.
  ```

  **3.2 — Update Per-Batch Implementation section (line 80-90)**:
  Add a note clarifying the distinction:
  - "The Per-Batch Implementation workflow above applies to **feature batches** (Batch-N: {Module Name}). For **UI Polish batches** (UI-Polish-N: {Page Name}), see the UI Polish Mode section below."

  **3.3 — Update QA Feedback Loop section (line 92-103)**:
  Add a UI Polish-specific feedback loop variant:
  - "For UI Polish QA failures: fix ONLY visual discrepancies. Do NOT introduce functional changes to fix visual issues. If a functional change is required to achieve visual compliance, escalate."

  **Must NOT do**:
  - Do NOT change the existing feature batch workflow (Per-Batch Implementation stays as-is)
  - Do NOT modify Design System Compliance Rules section (it already covers what's needed)
  - Do NOT add UI Polish logic into the existing Step 1-7 implementation flow
  - Do NOT remove any existing content — this is purely additive

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: New major section with complex workflow, boundary rules, and escalation logic
  - **Skills**: [`git-master`]
    - `git-master`: For committing changes
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: We're defining instructions, not implementing UI
    - `playwright`: Referenced in the instructions but not needed for writing them

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Task 4)
  - **Blocks**: Task 5
  - **Blocked By**: Tasks 1, 2

  **References**:

  **Pattern References**:
  - `.opencode/agents/engineer.md:80-90` — Current Per-Batch Implementation (add distinction note)
  - `.opencode/agents/engineer.md:92-103` — Current QA Feedback Loop (add UI Polish variant)
  - `.opencode/agents/engineer.md:276-307` — Current Design System Compliance Rules (referenced by UI Polish but not modified)
  - `.opencode/agents/engineer.md:310-340` — Current Critical Frontend Rules (UI Polish must respect these)

  **Cross-file References** (must be consistent with):
  - `.opencode/agents/designer.md` (after Task 1) — visual-references path and format
  - `.opencode/agents/architect.md` (after Task 2) — UI-Polish-N batch naming
  - `.opencode/agents/qa.md` (Task 4) — UI Polish verification mode

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: UI Polish Mode section exists
    Tool: Bash (grep)
    Steps:
      1. grep "## UI Polish Mode" .opencode/agents/engineer.md
      2. Assert: major section heading exists
      3. grep -c "UI Polish" .opencode/agents/engineer.md
      4. Assert: count >= 10 (section + workflow + rules + references)
    Expected Result: Comprehensive UI Polish Mode section added
    Evidence: grep output captured

  Scenario: Hard design target rule exists
    Tool: Bash (grep)
    Steps:
      1. grep -i "hard.*target\|HARD TARGET" .opencode/agents/engineer.md
      2. Assert: hard target rule stated
      3. grep "visual reference" .opencode/agents/engineer.md
      4. Assert: visual reference consumption instructions exist
    Expected Result: Design reference is explicitly the hard target
    Evidence: grep output captured

  Scenario: Stub boundary rules defined
    Tool: Bash (grep)
    Steps:
      1. grep -i "stub.*boundary\|MUST work\|CAN be stub" .opencode/agents/engineer.md
      2. Assert: stub rules exist
      3. grep -i "navigation\|authentication" .opencode/agents/engineer.md | grep -i "must\|work"
      4. Assert: nav+auth marked as must-work
    Expected Result: Clear stub boundaries with nav+auth as mandatory
    Evidence: grep output captured

  Scenario: Allowed vs not allowed changes table exists
    Tool: Bash (grep)
    Steps:
      1. grep -i "allowed.*changes\|NOT allowed\|Allowed.*NOT" .opencode/agents/engineer.md
      2. Assert: change boundary table exists
      3. grep "API endpoint\|business logic\|database schema" .opencode/agents/engineer.md
      4. Assert: these are marked as NOT allowed during UI Polish
    Expected Result: Clear boundary between allowed and forbidden changes
    Evidence: grep output captured

  Scenario: Escalation rules defined
    Tool: Bash (grep)
    Steps:
      1. grep -i "escalat\|fix cycle\|2.*cycle\|backend.*frozen" .opencode/agents/engineer.md
      2. Assert: escalation rules exist
    Expected Result: 2-cycle limit and backend freeze documented
    Evidence: grep output captured

  Scenario: Existing feature batch workflow preserved
    Tool: Bash (grep)
    Steps:
      1. grep "Per-Batch Implementation" .opencode/agents/engineer.md
      2. Assert: section still exists
      3. grep "QA Feedback Loop" .opencode/agents/engineer.md
      4. Assert: section still exists
      5. grep "Design System Compliance" .opencode/agents/engineer.md
      6. Assert: section still exists
    Expected Result: All existing sections preserved
    Evidence: grep output captured
  ```

  **Commit**: YES (groups with Task 4 as Wave 2)
  - Message: `docs(agents): add UI Polish Mode with hard design target to engineer`
  - Files: `.opencode/agents/engineer.md`
  - Pre-commit: `grep -c "UI Polish" .opencode/agents/engineer.md` → 10+

---

- [ ] 4. Modify `.opencode/agents/qa.md` — Add UI Polish Verification Mode with Blocking Layer 3

  **What to do**:

  **4.1 — Add Mode 3 to Operating Modes section (after line 69)**:

  ```markdown
  ### Mode 3: UI Polish Verification
  - **Trigger**: Engineer delivers a UI Polish batch (e.g., "UI-Polish-1: Dashboard")
  - **Scope**: Verify ONLY visual fidelity of the specified page against its visual reference
  - **Verification**: Layer 3 ONLY — but as a BLOCKING layer (not advisory)
  - **Method**: Side-by-side screenshot comparison against `docs/specs/visual-references/{page-name}.png`
  - **On Pass**: Generate `docs/qa/ui-polish-{page-name}-report.md` → Pause for human review
  - **On Fail**: Return to Engineer with specific visual discrepancies and screenshot evidence
  - **Regression Check**: Also verify `pnpm --dir frontend build` and `pnpm --dir frontend test`
    still pass (no functional regressions from CSS/layout changes)

  **Important**: In UI Polish mode, Layer 3 is the PRIMARY and BLOCKING verification layer.
  This is different from Batch/Full mode where Layer 3 is the last (advisory) layer.
  ```

  **4.2 — Add UI Polish Verification Workflow (new section after Design Tolerance Rules, around line 277)**:

  ```markdown
  ## UI Polish Verification Workflow

  When operating in Mode 3 (UI Polish Verification), follow this workflow:

  ### Step 1: Regression Gate
  Before any visual verification, confirm no functional regressions:
  ```bash
  pnpm --dir frontend build  # Must pass
  pnpm --dir frontend test   # Must pass
  ```
  If either fails → IMMEDIATE FAIL. Return to Engineer. Visual verification skipped.

  ### Step 2: Load Visual Reference
  Read the visual reference file using the multimodal look_at tool:
  - Path: `docs/specs/visual-references/{page-name}.png`
  - Understand: layout structure, spacing, colors, typography, component arrangement

  ### Step 3: Capture Current Implementation
  Use Playwright (via playwright skill) to:
  1. Navigate to the page URL
  2. Wait for page to fully load (network idle)
  3. Set viewport to 1440×900 (matching visual reference)
  4. Take a full-page screenshot
  5. Save to `docs/qa/evidence/ui-polish-{page-name}-current.png`

  ### Step 4: Side-by-Side Comparison
  Compare the visual reference against the current screenshot:

  **Check these aspects in order:**
  1. **Layout structure**: Major sections in correct positions? Correct flex/grid arrangement?
  2. **Spacing**: Padding and margins match? White space consistent?
  3. **Colors**: Background, text, border colors match design system tokens?
  4. **Typography**: Font family, size, weight, line-height correct?
  5. **Component sizing**: Buttons, inputs, cards at correct dimensions?
  6. **Border-radius and shadows**: Match design system tokens?
  7. **Content alignment**: Text alignment, vertical centering, horizontal distribution?

  **What to IGNORE during comparison:**
  - Exact text content (data may differ from reference)
  - Third-party rendered content (charts, maps, embeds) — check container only
  - Hover/focus states (not visible in static screenshots)
  - Animations/transitions (not captured in screenshots)
  - Dark mode (unless dark mode visual reference exists)
  - Mobile/tablet layout (unless mobile/tablet visual reference exists)

  ### Step 5: Generate Report
  Create `docs/qa/ui-polish-{page-name}-report.md`:

  ```markdown
  # UI Polish Report: {Page Name}

  **Batch**: UI-Polish-N: {Page Name}
  **Date**: {date}
  **Visual Reference**: docs/specs/visual-references/{page-name}.png

  ## Regression Gate
  - Frontend build: PASS/FAIL
  - Frontend tests: PASS/FAIL

  ## Visual Comparison

  ### Discrepancies Found
  | # | Aspect | Expected (Reference) | Actual (Current) | Severity | File:Line |
  |---|--------|---------------------|------------------|----------|-----------|
  | 1 | {aspect} | {description} | {description} | Major/Minor | {file:line} |

  ### Screenshots
  - Reference: docs/specs/visual-references/{page-name}.png
  - Current: docs/qa/evidence/ui-polish-{page-name}-current.png

  ## Verdict: PASS / FAIL
  - Total discrepancies: {count}
  - Major discrepancies: {count} (these must be fixed)
  - Minor discrepancies: {count} (acceptable if within design tolerance)

  ## Notes
  - {Any observations about stub interactions, Shadcn limitations, etc.}
  ```

  ### Verdict Criteria (UI Polish Mode)
  - **PASS**: Zero major discrepancies. Minor discrepancies (±2px, slightly different shade)
    are acceptable.
  - **FAIL**: One or more major discrepancies exist. Major = wrong layout, missing
    elements, wrong color family, incorrect typography weight/family, broken alignment.
  ```

  **4.3 — Update Design Tolerance Rules (lines 252-276)**:
  Add a subsection distinguishing tolerance by mode:

  ```markdown
  ### Mode-Specific Tolerance

  **Feature Batch Mode (Mode 1/2)**: Current tolerance rules apply as-is. Design-unspecified
  areas are NOT automatic failures. Layer 3 is advisory.

  **UI Polish Mode (Mode 3)**: TIGHTER tolerance. The visual reference IS the specification.
  - Design-specified areas (everything in the visual reference): HARD MATCH required.
    Discrepancies = FAIL.
  - Areas not visible in the visual reference (below-fold, scrolled content): Apply
    standard tolerance rules.
  - Shadcn component defaults: Still acceptable unless reference explicitly shows
    different styling.
  ```

  **4.4 — Update the report output paths**:
  Ensure `docs/qa/` directory structure accommodates UI Polish reports:
  - Feature batch reports: `docs/qa/batch-N-report.md` (unchanged)
  - Full verification: `docs/qa/test-report.md` (unchanged)
  - UI Polish reports: `docs/qa/ui-polish-{page-name}-report.md` (NEW)
  - Evidence screenshots: `docs/qa/evidence/` (NEW subdirectory)

  **Must NOT do**:
  - Do NOT change Mode 1 (Batch) or Mode 2 (Full) behavior
  - Do NOT change Layer 3 behavior during feature batch verification (stays advisory)
  - Do NOT remove existing Design Tolerance Rules (only add mode-specific subsection)
  - Do NOT require automated pixel-diff tooling (visual comparison is agent-performed)
  - Do NOT change the read-only constraint (QA never modifies code)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: New operating mode with detailed workflow, report format, and verdict criteria
  - **Skills**: [`git-master`, `playwright`]
    - `git-master`: For committing changes
    - `playwright`: For understanding Playwright screenshot capabilities referenced in workflow
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: Not modifying UI, just defining verification rules

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Task 3)
  - **Blocks**: Task 5
  - **Blocked By**: Tasks 1, 2

  **References**:

  **Pattern References**:
  - `.opencode/agents/qa.md:55-70` — Current Operating Modes (add Mode 3 after Mode 2)
  - `.opencode/agents/qa.md:209-240` — Current Layer 3 verification (reference for what becomes blocking in Mode 3)
  - `.opencode/agents/qa.md:252-276` — Current Design Tolerance Rules (add mode-specific subsection)
  - `.opencode/agents/qa.md:356-400` — Current Layer 3 report section (pattern for UI Polish report)

  **Cross-file References**:
  - `.opencode/agents/designer.md` (after Task 1) — visual-references path format
  - `.opencode/agents/engineer.md` (Task 3) — UI Polish batch naming, stub boundary rules
  - `.opencode/agents/architect.md` (Task 2) — UI-Polish-N naming convention

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Mode 3 (UI Polish Verification) defined
    Tool: Bash (grep)
    Steps:
      1. grep "Mode 3" .opencode/agents/qa.md
      2. Assert: UI Polish mode exists
      3. grep -i "UI Polish Verification" .opencode/agents/qa.md
      4. Assert: mode name correct
      5. grep "BLOCKING" .opencode/agents/qa.md
      6. Assert: Layer 3 marked as blocking in UI Polish mode
    Expected Result: Third operating mode defined with blocking Layer 3
    Evidence: grep output captured

  Scenario: UI Polish verification workflow exists
    Tool: Bash (grep)
    Steps:
      1. grep "## UI Polish Verification Workflow" .opencode/agents/qa.md
      2. Assert: section heading exists
      3. grep "visual reference\|visual-references" .opencode/agents/qa.md
      4. Assert: visual reference consumption documented
      5. grep "side-by-side\|Side-by-Side\|comparison" .opencode/agents/qa.md
      6. Assert: comparison methodology documented
    Expected Result: Complete verification workflow specified
    Evidence: grep output captured

  Scenario: Mode-specific tolerance rules exist
    Tool: Bash (grep)
    Steps:
      1. grep -i "mode-specific tolerance\|tighter tolerance\|UI Polish Mode.*Mode 3" .opencode/agents/qa.md
      2. Assert: mode-specific tolerance documented
      3. grep "HARD MATCH\|hard match" .opencode/agents/qa.md
      4. Assert: hard match requirement for UI Polish stated
    Expected Result: Tolerance is tighter in UI Polish mode
    Evidence: grep output captured

  Scenario: UI Polish report format defined
    Tool: Bash (grep)
    Steps:
      1. grep "ui-polish-.*report" .opencode/agents/qa.md
      2. Assert: report path format defined
      3. grep "Verdict.*PASS.*FAIL\|Major.*discrepanc" .opencode/agents/qa.md
      4. Assert: pass/fail criteria defined
    Expected Result: Clear report format with verdict criteria
    Evidence: grep output captured

  Scenario: Existing modes preserved
    Tool: Bash (grep)
    Steps:
      1. grep "Mode 1.*Batch Verification" .opencode/agents/qa.md
      2. Assert: Mode 1 still exists
      3. grep "Mode 2.*Full Verification" .opencode/agents/qa.md
      4. Assert: Mode 2 still exists
    Expected Result: Original operating modes unchanged
    Evidence: grep output captured
  ```

  **Commit**: YES (groups with Task 3 as Wave 2)
  - Message: `docs(agents): add UI Polish verification mode with blocking Layer 3 to QA`
  - Files: `.opencode/agents/qa.md`
  - Pre-commit: `grep -c "Mode 3\|UI Polish" .opencode/agents/qa.md` → 5+

---

- [ ] 5. Modify `AGENTS.md` — Add UI Polish Phase to Workflow Lifecycle

  **What to do**:

  **5.1 — Update Phase Handoff Artifacts table (lines 279-288)**:
  Add a new row for the UI Polish Phase. The table currently has 4 phases. Add a 5th:

  | Phase | Role | Input Files | Output Files | Gate Criteria | User Review |
  |-------|------|-------------|--------------|---------------|-------------|
  | **UI Polish** (optional) | Engineer + QA (per page) | Visual references + design system + running code | `docs/qa/ui-polish-{page}-report.md` per page | Visual fidelity matches reference, no functional regressions | Review per-page UI Polish reports + screenshots |

  Also update Phase 2 output to include `docs/specs/visual-references/` alongside existing outputs.

  **5.2 — Update Incremental Delivery Cycle section (lines 292-308)**:
  Add UI Polish Phase after feature batch loop and before full verification:

  ```markdown
  After all feature batches complete:
    5. User decides: Run UI Polish Phase? [Yes/Skip]
    If Yes:
      6. For each UI-Polish-N in delivery-plan.md:
        a. Engineer polishes page visual fidelity (CSS/layout only)
        b. QA verifies visual fidelity (Mode 3: UI Polish Verification)
        c. If FAIL: Engineer fixes → QA re-verifies (max 2 cycles, then escalate)
        d. If PASS: Human reviews UI Polish report
      7. Shared layouts (UI-Polish-0) first, then individual pages
    If Skip or after UI Polish complete:
      8. QA performs full verification → produces docs/qa/test-report.md
      9. Human reviews final test-report.md and approves release
  ```

  **5.3 — Update Designer section in "Responsibilities" area**:
  Add: "Produce visual reference screenshots/renders for the UI Polish Phase"

  **5.4 — Add UI Polish description to Getting Started workflow (around line 430)**:
  Add a new step between current batch completion and full QA verification:
  "Step 5.5: UI Polish Phase (Optional) — If Designer produced visual references, invoke Engineer in UI Polish Mode for each page, then QA in UI Polish Verification Mode. Review each page report. Skip if no visual references or if visual fidelity is acceptable."

  **5.5 — Update Fallback Behaviors table (lines 312-322)**:
  Add row:
  | No visual references | Engineer (UI Polish) | SKIP UI Polish Phase — proceed directly to Full QA Verification |

  **5.6 — Update Version History**:
  Add entry:
  ```
  | 3.0 | 2026-04-17 | UI Polish Phase: page-by-page visual fidelity pass with screenshot-based references, blocking Layer 3, stub boundaries, backend freeze, escalation rules |
  ```

  **Must NOT do**:
  - Do NOT change Tech Stack, Coding Standards, or Global Rules sections
  - Do NOT change existing Phase 1-4 descriptions (only add UI Polish)
  - Do NOT remove any existing content
  - Do NOT change skill descriptions or references

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Central orchestration document; must accurately reflect all changes from Tasks 1-4
  - **Skills**: [`git-master`]
    - `git-master`: For committing changes

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Task 6)
  - **Blocks**: Task 7
  - **Blocked By**: Tasks 1, 2, 3, 4

  **References**:

  **Pattern References**:
  - `AGENTS.md:279-288` — Current Phase Handoff Artifacts table (add UI Polish row)
  - `AGENTS.md:292-308` — Current Incremental Delivery Cycle (insert UI Polish Phase)
  - `AGENTS.md:312-322` — Current Fallback Behaviors (add no-visual-references row)
  - `AGENTS.md:380-452` — Current Getting Started section (add UI Polish step)
  - `AGENTS.md:611-619` — Current Version History (add 3.0 entry)

  **Cross-file References** (must match all agent files):
  - `.opencode/agents/designer.md` — 4 outputs, visual-references path
  - `.opencode/agents/architect.md` — UI-Polish-N naming, optional UI Polish section in delivery-plan.md
  - `.opencode/agents/engineer.md` — UI Polish Mode section
  - `.opencode/agents/qa.md` — Mode 3 UI Polish Verification, blocking Layer 3

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: UI Polish Phase in workflow
    Tool: Bash (grep)
    Steps:
      1. grep -i "UI Polish Phase" AGENTS.md
      2. Assert: appears in workflow description
      3. grep "UI-Polish-0\|UI-Polish-N\|ui-polish" AGENTS.md
      4. Assert: batch naming referenced
    Expected Result: UI Polish Phase documented in AGENTS.md
    Evidence: grep output captured

  Scenario: Phase Handoff table includes UI Polish
    Tool: Read tool
    Steps:
      1. Read the Phase Handoff Artifacts table
      2. Assert: UI Polish row exists with correct input/output/gate
      3. Assert: Phase 2 outputs include visual-references
    Expected Result: Table has all phases including UI Polish
    Evidence: Section content captured

  Scenario: Incremental Delivery Cycle updated
    Tool: Bash (grep)
    Steps:
      1. grep -i "ui polish\|visual fidelity\|page-by-page" AGENTS.md
      2. Assert: UI Polish described in delivery cycle
      3. grep -i "skip.*ui polish\|optional" AGENTS.md
      4. Assert: UI Polish marked as optional/skippable
    Expected Result: Delivery cycle includes optional UI Polish Phase
    Evidence: grep output captured

  Scenario: Version history updated
    Tool: Bash (grep)
    Steps:
      1. grep "3.0" AGENTS.md
      2. Assert: version 3.0 entry exists
    Expected Result: Version history reflects UI Polish addition
    Evidence: grep output captured

  Scenario: Existing content preserved
    Tool: Bash (grep)
    Steps:
      1. grep "Tech Stack" AGENTS.md && grep "Coding Standards" AGENTS.md && grep "Global Rules" AGENTS.md
      2. Assert: all major sections still exist
    Expected Result: No regressions to existing sections
    Evidence: grep output captured
  ```

  **Commit**: YES (groups with Task 6 as Wave 3)
  - Message: `docs: add UI Polish Phase to AGENTS.md workflow lifecycle`
  - Files: `AGENTS.md`
  - Pre-commit: `grep -c "UI Polish" AGENTS.md` → 5+

---

- [ ] 6. Update `.agents/skills/design-to-components/SKILL.md` — Add Visual Reference Step + Fix Local HTML Priority

  **What to do**:

  **6.1 — Fix design source priority (lines 53-76)**:
  The skill currently has a 3-tier priority (Stitch → Figma → PRD). V2 added local HTML as Priority 0 in `designer.md`, but the skill was NOT updated. Fix this inconsistency:

  Update Step 1 to add Priority 0:
  ```markdown
  **PRIORITY 0: If local HTML file is provided (HIGHEST PRIORITY)**:
  - Read the HTML file(s) using the Read tool
  - Analyze inline/embedded CSS for design tokens (colors, fonts, spacing, layout patterns)
  - Extract component patterns from HTML structure
  - Identify reusable component patterns
  - Document design tokens from CSS
  - Use Playwright to render the HTML and capture screenshots for visual references
  ```

  Renumber existing priorities: Stitch → Priority 1 (was Priority 1, unchanged), Figma → Priority 2 (unchanged), PRD → Priority 3 (was unnamed fallback).

  **6.2 — Add visual reference generation step**:
  Insert a new step after the component mapping steps (after current Step 5 or similar):

  ```markdown
  ### Step N: Generate Visual References

  After completing component mapping and design system extraction, generate
  page-level visual references for the UI Polish Phase:

  1. **Identify all pages** from `page-layouts.md` that need visual references
  2. **For each page**, generate a visual reference screenshot:
     - Priority 0 (Local HTML): Use Playwright to open the HTML file at 1440×900 viewport and capture a screenshot
     - Priority 1 (Stitch): Use `get_screen_image` from Stitch MCP to capture each generated screen
     - Priority 2 (Figma): Export key frames as PNG via Figma MCP tools
     - Priority 3 (PRD only): SKIP — log "No visual references available"
  3. **Save screenshots** to `docs/specs/visual-references/{page-name}.png`
  4. **Verify coverage**: Every page in `page-layouts.md` should have a matching visual reference
     (unless Priority 3, where no references are produced)

  **File naming convention**: `{page-name}.png` where page-name matches the page identifier
  used in `page-layouts.md` (e.g., `dashboard.png`, `login.png`, `settings.png`).

  **Viewport**: 1440×900 (desktop). If design source provides mobile/tablet variants,
  also capture as `{page-name}-mobile.png`, `{page-name}-tablet.png`.
  ```

  **Must NOT do**:
  - Do NOT modify the Shadcn component reference list
  - Do NOT change the component mapping workflow (Steps 2-5)
  - Do NOT remove any existing content
  - Do NOT make visual reference generation mandatory for PRD-only mode

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Relatively small changes — adding one priority tier and one step to an existing skill
  - **Skills**: [`git-master`]
    - `git-master`: For committing changes

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Task 5)
  - **Blocks**: Task 7
  - **Blocked By**: Task 1 (needs visual reference format defined)

  **References**:

  **Pattern References**:
  - `.agents/skills/design-to-components/SKILL.md:53-76` — Current 3-tier priority (add Priority 0)
  - `.agents/skills/design-to-components/SKILL.md:77-100+` — Current Steps 2+ (find insertion point for visual reference step)

  **Cross-file References**:
  - `.opencode/agents/designer.md` (after Task 1) — visual-references format must match exactly
  - `.opencode/agents/designer.md:37-39` — Local HTML as highest priority (skill must match)

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Local HTML as Priority 0
    Tool: Bash (grep)
    Steps:
      1. grep "PRIORITY 0\|Priority 0" .agents/skills/design-to-components/SKILL.md
      2. Assert: Priority 0 for local HTML exists
      3. grep -i "local HTML\|\.html" .agents/skills/design-to-components/SKILL.md
      4. Assert: HTML file handling documented
    Expected Result: Local HTML is highest priority design source in skill
    Evidence: grep output captured

  Scenario: Visual reference generation step exists
    Tool: Bash (grep)
    Steps:
      1. grep -i "visual reference\|visual-references" .agents/skills/design-to-components/SKILL.md
      2. Assert: visual reference step exists
      3. grep "1440" .agents/skills/design-to-components/SKILL.md
      4. Assert: viewport size specified
    Expected Result: Visual reference generation workflow in skill
    Evidence: grep output captured

  Scenario: Existing content preserved
    Tool: Bash (grep)
    Steps:
      1. grep "Stitch" .agents/skills/design-to-components/SKILL.md
      2. Assert: Stitch still referenced
      3. grep "Figma" .agents/skills/design-to-components/SKILL.md
      4. Assert: Figma still referenced
    Expected Result: All original design sources preserved
    Evidence: grep output captured
  ```

  **Commit**: YES (groups with Task 5 as Wave 3)
  - Message: `docs(skills): add visual reference step and local HTML priority to design-to-components`
  - Files: `.agents/skills/design-to-components/SKILL.md`
  - Pre-commit: `grep -c "visual-references\|visual reference" .agents/skills/design-to-components/SKILL.md` → 2+

---

- [ ] 7. Cross-File Consistency Review

  **What to do**:

  Verify that all 6 modified files are internally consistent with each other. Read-only verification — fix only if inconsistencies found.

  **7.1 — Artifact Name Consistency**:

  | Artifact | Producer | Consumers | Must appear in AGENTS.md |
  |----------|----------|-----------|-------------------------|
  | `docs/specs/visual-references/` | designer.md, SKILL.md | engineer.md, qa.md | YES (Phase 2 output) |
  | `UI-Polish-N` naming | architect.md | engineer.md, qa.md | YES (delivery cycle) |
  | `docs/qa/ui-polish-{page}-report.md` | qa.md | AGENTS.md | YES (Phase handoff) |
  | `docs/qa/evidence/` | qa.md | — | Optional in AGENTS.md |

  **7.2 — Terminology Consistency**:
  - "UI Polish Phase" (not "Visual Polish" or "Design Polish") — consistent across all files
  - "visual reference" (not "design reference" or "screenshot reference") — consistent term
  - "BLOCKING" Layer 3 — used in qa.md, referenced in AGENTS.md
  - "Mode 3" — used in qa.md, referenced in AGENTS.md

  **7.3 — Workflow Consistency**:
  - AGENTS.md delivery cycle matches the sum of all agent mode descriptions
  - Phase handoff table accurately reflects updated Phase 2 outputs
  - UI Polish is consistently described as OPTIONAL in all files
  - Stub boundary rules in engineer.md align with what QA ignores during verification

  **7.4 — Path Consistency**:
  - `docs/specs/visual-references/{page-name}.png` — same path in designer.md, SKILL.md, engineer.md, qa.md
  - `docs/qa/ui-polish-{page-name}-report.md` — same path in qa.md and AGENTS.md
  - `1440×900` viewport — same in designer.md, SKILL.md, qa.md

  **7.5 — Priority Consistency**:
  - designer.md design source priority (0: HTML, 1: Stitch, 2: Figma, 3: PRD) matches SKILL.md
  - This was a V2 gap (SKILL.md had 3 tiers, designer.md had 4) — verify Task 6 fixed it

  **7.6 — Fix any inconsistencies found**:
  If any inconsistency is detected, fix it in the appropriate file.

  **Must NOT do**:
  - Do NOT make substantive content changes (only fix inconsistencies)
  - Do NOT add new features at this stage

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Read-heavy verification with potential small fixes
  - **Skills**: [`git-master`]
    - `git-master`: For committing any fixes

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 (final, sequential)
  - **Blocks**: None (final task)
  - **Blocked By**: Tasks 1, 2, 3, 4, 5, 6

  **References**:

  **All modified files** (read all to verify):
  - `.opencode/agents/designer.md`
  - `.opencode/agents/architect.md`
  - `.opencode/agents/engineer.md`
  - `.opencode/agents/qa.md`
  - `AGENTS.md`
  - `.agents/skills/design-to-components/SKILL.md`

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Visual reference path consistent across files
    Tool: Bash (grep)
    Steps:
      1. grep -rn "visual-references" .opencode/agents/*.md AGENTS.md .agents/skills/design-to-components/SKILL.md
      2. Assert: same path pattern in all files that reference it
    Expected Result: Path `docs/specs/visual-references/` used consistently
    Evidence: grep output captured

  Scenario: UI Polish terminology consistent
    Tool: Bash (grep)
    Steps:
      1. grep -l "UI Polish" .opencode/agents/*.md AGENTS.md .agents/skills/design-to-components/SKILL.md
      2. Assert: at least 5 files use "UI Polish"
      3. grep -l "Visual Polish\|Design Polish" .opencode/agents/*.md AGENTS.md
      4. Assert: returns 0 files (no alternative terms)
    Expected Result: "UI Polish" used consistently, no variant terms
    Evidence: grep output captured

  Scenario: Operating modes count consistent
    Tool: Bash (grep)
    Steps:
      1. grep -c "Mode [0-9]" .opencode/agents/qa.md
      2. Assert: returns 3 (Batch, Full, UI Polish)
    Expected Result: QA has exactly 3 operating modes
    Evidence: grep output captured

  Scenario: Design source priority consistent between designer.md and SKILL.md
    Tool: Bash (grep)
    Steps:
      1. grep "Priority 0" .opencode/agents/designer.md .agents/skills/design-to-components/SKILL.md
      2. Assert: both mention local HTML as Priority 0
    Expected Result: Design source priority matches across files
    Evidence: grep output captured

  Scenario: No dangling references
    Tool: Bash (grep)
    Steps:
      1. grep -rn "visual-references\|ui-polish-.*report\|UI-Polish-" .opencode/agents/*.md AGENTS.md .agents/skills/design-to-components/SKILL.md
      2. Verify each reference points to an artifact defined by some file
    Expected Result: All references valid, no dangling references
    Evidence: Full grep output captured and reviewed
  ```

  **Commit**: YES (only if fixes were needed)
  - Message: `docs(agents): fix cross-file consistency issues for UI Polish Phase`
  - Files: [whichever files needed fixes]
  - Pre-commit: All grep checks above pass

---

## Commit Strategy

| After Tasks | Message | Files | Verification |
|-------------|---------|-------|-------------|
| 1 + 2 (Wave 1) | `docs(agents): add visual references to designer; UI Polish to architect delivery plan` | `designer.md`, `architect.md` | grep checks from Tasks 1-2 |
| 3 + 4 (Wave 2) | `docs(agents): add UI Polish Mode to engineer; UI Polish verification to QA` | `engineer.md`, `qa.md` | grep checks from Tasks 3-4 |
| 5 + 6 (Wave 3) | `docs: update AGENTS.md for UI Polish Phase; fix design-to-components skill` | `AGENTS.md`, `SKILL.md` | grep checks from Tasks 5-6 |
| 7 (Wave 4) | `docs(agents): fix cross-file consistency issues` (only if needed) | [varies] | All cross-file grep checks |

---

## Success Criteria

### Verification Commands

```bash
# Visual references defined in designer
grep -c "visual-references" .opencode/agents/designer.md  # Expected: 5+

# UI Polish Phase in all relevant files
grep -l "UI Polish" .opencode/agents/*.md AGENTS.md .agents/skills/design-to-components/SKILL.md  # Expected: 6 files

# Mode 3 in QA
grep -c "Mode 3" .opencode/agents/qa.md  # Expected: 1+

# Blocking Layer 3 in QA
grep -i "BLOCKING" .opencode/agents/qa.md  # Expected: 1+

# Hard design target in Engineer
grep -i "HARD TARGET" .opencode/agents/engineer.md  # Expected: 1+

# Stub boundary in Engineer
grep -i "stub.*boundary\|MUST work\|CAN be stub" .opencode/agents/engineer.md  # Expected: 1+

# UI-Polish-N naming in Architect
grep "UI-Polish-" .opencode/agents/architect.md  # Expected: 1+

# Local HTML Priority 0 in skill (V2 gap fix)
grep "PRIORITY 0\|Priority 0" .agents/skills/design-to-components/SKILL.md  # Expected: 1+

# Visual reference path consistent
grep -rn "docs/specs/visual-references" .opencode/agents/*.md AGENTS.md .agents/skills/design-to-components/SKILL.md  # Expected: appears in 5+ files

# AGENTS.md version updated
grep "3.0" AGENTS.md  # Expected: version 3.0 entry
```

### Final Checklist

- [ ] Designer produces 4 outputs (was 3), including visual-references directory
- [ ] Visual reference artifact format fully specified (PNG, 1440×900, per-page)
- [ ] Visual reference generation workflow defined per design source priority
- [ ] Architect delivery-plan.md includes optional UI Polish Phase section
- [ ] UI Polish batches named UI-Polish-N, shared layouts first (UI-Polish-0)
- [ ] Engineer has UI Polish Mode with page-by-page workflow
- [ ] Engineer has hard design target rule for UI Polish
- [ ] Engineer has stub boundary rules (nav+auth must work, rest can stub)
- [ ] Engineer has allowed/not-allowed changes table for UI Polish
- [ ] Engineer has escalation rules (2-cycle limit, backend frozen)
- [ ] QA has Mode 3: UI Polish Verification with blocking Layer 3
- [ ] QA has side-by-side comparison workflow with screenshot evidence
- [ ] QA has tighter tolerance rules for UI Polish mode
- [ ] QA has UI Polish report format with verdict criteria
- [ ] AGENTS.md Phase Handoff table includes UI Polish Phase
- [ ] AGENTS.md Incremental Delivery Cycle includes optional UI Polish
- [ ] AGENTS.md version history updated to 3.0
- [ ] design-to-components skill has local HTML as Priority 0 (V2 gap fix)
- [ ] design-to-components skill has visual reference generation step
- [ ] All cross-file references consistent (paths, naming, terminology)
- [ ] No contradictions between any two files
- [ ] All existing capabilities preserved (no regressions)
