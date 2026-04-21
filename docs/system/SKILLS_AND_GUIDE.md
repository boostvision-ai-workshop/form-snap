# Skills & Developer Guide

Reference for available skills, subagent invocation, and the getting-started workflow for building features.

---

## Available Skills

Agents invoke skills for common, structured tasks. Each skill provides a ready-made workflow with best practices baked in.

### prd-to-spec

**Phase**: 1 (Architect)
**Trigger**: Starting a new feature from a PRD

**What it does**:
- Extracts user stories and requirements from PRD
- Maps requirements to technical architecture decisions
- Generates database schema from domain model
- Defines API endpoints with request/response contracts

**Invocation**: Load when starting Phase 1 (Architect)

---

### design-to-components

**Phase**: 2 (Designer)
**Trigger**: Mapping designs (Stitch, Figma, or PRD text) to Shadcn components

**What it does**:
- Analyzes design output from Stitch MCP or Figma MCP
- Falls back to PRD text descriptions when no design tool is available
- Matches design elements to available Shadcn UI components
- Identifies custom components needed beyond Shadcn
- Generates component hierarchy for each page
- Documents layout patterns (flex, grid, responsive breakpoints)

**Invocation**: Load in Phase 2 (Designer) — works in all 4 design source modes

---

### fastapi-crud

**Phase**: 3 (Engineer)
**Trigger**: Creating new FastAPI CRUD endpoints

**What it does**:
- Scaffolds router, schema, service, and model files
- Implements standard CRUD operations (Create, Read, Update, Delete)
- Adds dependency injection for database and auth
- Generates Pydantic schemas with validation rules
- Includes error handling and status codes

**Invocation**: Load when implementing new API endpoints in Phase 3

---

### supabase-migration

**Phase**: 3 (Engineer)
**Trigger**: Adding or modifying database models

**What it does**:
- Generates Alembic migration from SQLAlchemy model changes
- Handles foreign keys and indexes
- Creates rollback logic (downgrade function)
- Validates migration against existing schema
- Tests migration in development environment

**Invocation**: Load when adding or modifying database models in Phase 3

---

## Invoking Subagents

Agents can delegate specialized tasks to subagents. Use the `call_omo_agent` tool:

```typescript
call_omo_agent({
  subagent_type: "explore",       // explore | librarian | oracle
  prompt: "Research best practices for SQLAlchemy async session management in FastAPI",
  run_in_background: true,
  description: "Research async SQLAlchemy patterns"
})
```

Use `background_output` to retrieve results from async subagents.

| Type | Best For |
|------|----------|
| `explore` | Searching and understanding the current codebase |
| `librarian` | Official docs, remote repo examples, library internals |
| `oracle` | Architecture decisions, hard debugging, multi-system tradeoffs |

---

## Getting Started with Feature Development

### Prerequisites

**REQUIRED**: PRD at `docs/prd/PRD.md`

**OPTIONAL** design source (4-tier priority, highest first):
1. Local HTML file — existing HTML/CSS reference design
2. Stitch design prompt — AI-generated designs via Stitch MCP
3. Figma design URL — existing designs read via Figma MCP
4. Neither — Designer generates component suggestions from PRD text only

---

### Step 1: Create Your PRD

```bash
cp docs/prd/PRD_TEMPLATE.md docs/prd/PRD.md
```

Fill in all required sections: Feature Overview, User Stories, Data Requirements, API Requirements, Business Logic, UI/UX Requirements.

**Reference**: `docs/prd/EXAMPLE_PRD.md`

---

### Step 2: Phase 1 — Architect

Invoke the Architect agent. It produces 5 spec files.

**USER REVIEW GATE** — verify:
- Database models cover all data entities in PRD
- API endpoints match your expected contracts
- Architecture decisions align with project standards
- Every user story has at least one AT-XXX acceptance test
- Delivery batches are well-scoped and sequenced correctly

**If issues found**: STOP. Request Architect to revise. Do NOT proceed to Phase 2 until approved.

---

### Step 3: Phase 2 — Designer

Invoke the Designer agent. Provide a design source if available.

**USER REVIEW GATE** — verify:
- Design system covers colors, typography, spacing, border-radius
- Component map covers all pages defined in PRD
- Layout specifications match expected UI structure
- No hardcoded color or spacing values (tokens only)

**If issues found**: STOP. Request Designer to revise. Do NOT proceed to Phase 3 until approved.

---

### Step 4: Phase 3 — Engineer (per batch)

Invoke the Engineer agent for each batch.

**USER REVIEW GATE** — verify:
```bash
pnpm --dir frontend build    # must pass
pnpm --dir frontend test     # must pass
uv --directory backend run pytest  # must pass
```
- Code committed to git
- No hardcoded design values

**If issues found**: STOP. Report with `file:line` references. Do NOT proceed to Phase 4 until all pass.

---

### Step 5: Phase 4 — QA (per batch)

Invoke the QA agent. It verifies the batch in 3 layers and produces `docs/qa/batch-N-report.md`.

**USER REVIEW GATE** — verify:
- All AT-XXX tests for this batch pass all 3 layers
- No regressions from previous batches
- Implementation matches specifications

**On approval**: proceed to next batch (repeat Steps 4–5).

---

### Step 5.5 (Optional): UI Polish Phase

If `docs/specs/visual-references/` exists, invoke Engineer in UI Polish Mode per page, then QA in Mode 3. Layer 3 is BLOCKING. Max 2 fix cycles per page before escalating to user.

**Skip** if no visual references exist or visual fidelity is already acceptable.

---

### Step 6: QA Full Verification

Once all batches complete, invoke QA for a final full pass → `docs/qa/test-report.md`.

**USER REVIEW GATE** — verify:
- All AT-XXX tests pass all 3 layers
- Golden path (happy path) verified end-to-end
- No cross-batch regressions
- No critical bugs blocking release

---

## Design Source Optionality

| Priority | Source | When to Use | How It Works |
|----------|--------|-------------|--------------|
| **1st** | Local HTML file | Existing HTML/CSS reference | Designer extracts tokens + maps to Shadcn |
| **2nd** | Stitch design prompt | Want AI-generated designs | Designer uses Stitch MCP to generate screens |
| **3rd** | Figma design URL | Designs exist in Figma | Designer uses Figma MCP to read designs |
| **4th** | PRD text only | No design tool available | Designer generates suggestions from PRD descriptions |
