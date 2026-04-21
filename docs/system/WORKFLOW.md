# Development Workflow

Acceptance-Test-Driven Incremental Delivery. Agents MUST NOT skip phases or proceed without required inputs.

---

## Phase Overview

| # | Phase | Role | Core Output |
|---|-------|------|-------------|
| 1 | Architect | Translate PRD → specs + AT cases | 5 spec files + acceptance tests |
| 2 | Designer | Map UI → components + design system | design-system, component-map, page-layouts |
| 3 | Engineer | Implement per batch | Working code + migrations + tests |
| 4 | QA | Verify per batch (3 layers) + full pass | batch-N-report.md / test-report.md |
| ★ | UI Polish (optional) | CSS/layout fidelity per page | ui-polish-{page}-report.md |

---

## Phase 1: Architect

**Role**: Translate PRD into technical specifications and acceptance tests.

**Inputs**:
- `docs/prd/PRD.md` (REQUIRED)
- Design reference (OPTIONAL) — local HTML, Stitch prompt, Figma URL, or none

**Outputs**:
- `docs/specs/technical-spec.md` — Architecture decisions, component boundaries, API contracts
- `docs/specs/data-model.md` — Database schema, relationships, migrations
- `docs/specs/api-spec.md` — Endpoint definitions with request/response examples
- `docs/specs/acceptance-tests.md` — AT-XXX test cases derived from user stories
- `docs/specs/delivery-plan.md` — Batch breakdown: AT-XXX tests mapped to Batch-N

**Validation Gate**:
- All 5 spec files exist
- Every user story has at least one AT-XXX test
- Every batch in delivery-plan.md maps to a set of AT-XXX tests
- Specs reviewed and approved by user

**Responsibilities**:
- Define database models and relationships
- Design API endpoint structure and contracts
- Identify technical risks and dependencies
- Specify authentication flows
- Document integration points between frontend and backend
- Transform acceptance criteria into Given/When/Then test cases with automation hints
- Group acceptance tests into delivery batches

**Agent File**: `.opencode/agents/architect.md`

---

## Phase 2: Designer

**Role**: Map UI requirements to component structure, layout specs, and a design system.

**Inputs**:
- `docs/prd/PRD.md` (REQUIRED)
- `docs/specs/technical-spec.md` (from Phase 1)
- Design source (OPTIONAL) — local HTML (highest priority), Stitch prompt, Figma URL, or none

**Outputs**:
- `docs/specs/design-system.md` — Colors, typography, spacing tokens, border-radius, component style rules
- `docs/specs/component-map.md` — Shadcn components used + custom components needed
- `docs/specs/page-layouts.md` — Page-by-page layout specs with component hierarchy
- `docs/specs/visual-references/` (optional) — Screenshot PNGs for UI Polish Phase

**Validation Gate**:
- Design system covers colors, typography, spacing, and border-radius
- Component map covers all pages defined in PRD
- No hardcoded color/spacing values — tokens only
- User approves design system and component structure

**Responsibilities**:
- Extract design tokens from local HTML, Stitch MCP, Figma MCP, or PRD descriptions
- Map designs to Shadcn UI components
- Generate component suggestions when no design tool is available
- Define responsive layout patterns
- Specify state management approach per page
- Document accessibility requirements

**Agent File**: `.opencode/agents/designer.md`

---

## Phase 3: Engineer (per batch)

**Role**: Implement each delivery batch per specifications, design system, and acceptance tests.

**Inputs**: All specs from Phase 1 + Phase 2

**Outputs** (per batch):
- Working code committed to repository
- Alembic migrations (for new models in this batch)
- Tests (frontend Vitest + backend pytest) covering this batch's AT-XXX items

**Validation Gate** (per batch):
- `pnpm --dir frontend build` passes
- `pnpm --dir frontend test` passes
- `uv --directory backend run pytest` passes
- Code committed to git
- All design tokens from design-system.md used — no hardcoded values

**Responsibilities**:
- Implement frontend components and pages for this batch
- Implement backend API endpoints and business logic
- Write database migrations
- Write unit and integration tests covering this batch's AT-XXX items
- Follow design-system.md — NEVER hardcode colors, spacing, or typography

**Agent File**: `.opencode/agents/engineer.md`

---

## Phase 4: QA (per batch + full verification)

**Role**: Verify each delivery batch against acceptance tests in 3 layers. Full verification after all batches complete.

**Inputs**: All spec files from Phase 1 + Phase 2 + working code from Phase 3

**Outputs**:
- `docs/qa/batch-N-report.md` — Scoped test report for Batch N
- `docs/qa/test-report.md` — Complete test report after full verification

**Validation Gate**:
- Batch mode: All AT-XXX tests for this batch pass all 3 layers
- Full mode: All AT-XXX tests pass, no cross-batch regressions
- Golden path (happy path) verified end-to-end in full mode

**QA Verification Layers** (executed in order):
- **Layer 1 — API**: Endpoint contracts, schemas, status codes, error cases
- **Layer 2 — UI Functionality**: Interactions, data flow, authentication, navigation
- **Layer 3 — UI Design Consistency**: Design system compliance, layout match, visual correctness

**Responsibilities**:
- Execute 3-layer verification for each batch
- Self-register test accounts without Firebase dependency
- Apply design tolerance rules (design-unspecified areas are not automatic failures)
- Document all failures with `file:line` references
- Perform cross-batch regression checks in full verification mode

**Agent File**: `.opencode/agents/qa.md`

---

## Phase Handoff Artifacts

| Phase | Role | Input Files | Output Files | Gate Criteria | User Review |
|-------|------|-------------|--------------|---------------|-------------|
| **1** | Architect | `docs/prd/PRD.md` | `docs/specs/technical-spec.md`<br>`docs/specs/data-model.md`<br>`docs/specs/api-spec.md`<br>`docs/specs/acceptance-tests.md`<br>`docs/specs/delivery-plan.md` | All 5 spec files exist AND reviewed by user | Review all specs: data models, API contracts, acceptance tests, delivery batch breakdown |
| **2** | Designer | `docs/prd/PRD.md`<br>`docs/specs/technical-spec.md`<br>Design source (optional) | `docs/specs/design-system.md`<br>`docs/specs/component-map.md`<br>`docs/specs/page-layouts.md`<br>`docs/specs/visual-references/` (optional) | Design system complete, component map covers all pages AND user approves | Review design system tokens, component map and page layouts |
| **3** | Engineer (per batch) | All specs from Phase 1 + Phase 2 | Working code (committed)<br>Alembic migrations<br>Updated tests | Build + test pass, no hardcoded design values | Run validation commands, review code |
| **4** | QA (per batch + full) | All specs + working code | `docs/qa/batch-N-report.md`<br>`docs/qa/test-report.md` (full) | Batch: all AT-XXX for batch pass 3 layers<br>Full: all AT-XXX pass + golden path | Review batch/final report |
| **UI Polish** (optional) | Engineer + QA (per page) | Visual references + design system + running code | `docs/qa/ui-polish-{page}-report.md` | Visual fidelity matches reference, no functional regressions | Review per-page reports + screenshots |

---

## Incremental Delivery Cycle

```
For each Batch-N in delivery-plan.md:
  1. Engineer implements Batch-N (code + tests + migrations committed)
  2. QA verifies Batch-N in 3 layers → produces docs/qa/batch-N-report.md
  3. Human reviews batch-N-report.md and approves or returns to Engineer
  4. On approval: proceed to Batch-(N+1)

After all feature batches complete:
  5. User decides: Run UI Polish Phase? [Yes / Skip to Full QA]
  If Yes:
    6. For each UI-Polish-N in delivery-plan.md:
       a. Engineer polishes page visual fidelity (CSS/layout only, backend frozen)
       b. QA verifies in Mode 3: UI Polish Verification (Layer 3 BLOCKING)
       c. If FAIL: Engineer fixes → QA re-verifies (max 2 cycles, then escalate to user)
       d. If PASS: Human reviews UI Polish report for this page
    7. Shared layouts (UI-Polish-0) first, then individual pages
  If Skip OR after UI Polish complete:
    8. QA performs full verification → produces docs/qa/test-report.md
    9. Human reviews final test-report.md and approves release
```

**Human checkpoint**: A human must review and approve each batch QA report before the next batch begins. No automated batch-to-batch progression.

---

## Fallback Behaviors

| Missing Input | Affected Agent | Fallback Action |
|---------------|----------------|-----------------|
| No PRD file | Architect | STOP — Ask user to provide PRD at `docs/prd/PRD.md` |
| Incomplete PRD (missing sections) | Architect | List missing sections and request completion before proceeding |
| No design source | Designer | Generate component suggestions from PRD descriptions only (4th tier fallback) |
| Spec files conflict with each other | Engineer | STOP — Report conflict to Architect with specific `file:line` references |
| QA test failure | Engineer (return) | Issues returned to Engineer with detailed `file:line` references for fixes |
| No visual references | Engineer (UI Polish) | SKIP UI Polish Phase — proceed directly to Full QA Verification |

---

## Phase Failure Behavior

**HARD-STOP RULE**: If any phase fails validation or has critical issues, STOP immediately. Do NOT proceed to the next phase.

**User Decision Points**:
- **Retry**: Re-invoke the same agent with the same inputs
- **Adjust Inputs**: Modify PRD or specifications and re-invoke agent
- **Proceed**: Accept minor issues and continue (only for non-critical issues)
- **Abort**: Stop feature development and revisit requirements
