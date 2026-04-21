# Codex CLI Operating Instructions

> This file is automatically loaded by [Codex CLI](https://github.com/openai/codex) and merged with `AGENTS.md`. It provides Codex-specific workflow instructions. OpenCode ignores this file.

---

## Subagent Model

Codex uses **4 dedicated subagents**, one per development phase. Each subagent is defined in `.codex/agents/` as a TOML file with specialized instructions. Delegate to the appropriate subagent when the user invokes a phase.

| Phase | Subagent | Trigger Phrases | Produces |
|-------|----------|-----------------|----------|
| **Phase 1** | `architect` | "Phase 1", "Architect", "create specs", "start from PRD" | 5 spec files in `docs/specs/` |
| **Phase 2** | `designer` | "Phase 2", "Designer", "design system", "component map" | 3 spec files in `docs/specs/` |
| **Phase 3** | `engineer` | "Phase 3", "Engineer", "implement Batch N" | Code + tests + migrations |
| **Phase 4** | `qa` | "Phase 4", "QA", "verify Batch N", "full QA" | QA report in `docs/qa/` |

Each subagent reads its `.codex/agents/{name}.toml` `developer_instructions` AND is directed to read the full `.opencode/agents/{name}.md` for complete workflow details, code patterns, and validation criteria.

---

## Subagent Reference

### architect

**File**: `.codex/agents/architect.toml`
**When to invoke**: Phase 1 — User has a PRD at `docs/prd/PRD.md` and needs technical specifications.
**Requires**: `docs/prd/PRD.md`
**Produces**: `technical-spec.md`, `data-model.md`, `api-spec.md`, `acceptance-tests.md`, `delivery-plan.md`
**Skill**: `.opencode/skills/prd-to-spec/SKILL.md`

### designer

**File**: `.codex/agents/designer.toml`
**When to invoke**: Phase 2 — Phase 1 specs are approved and UI component mapping is needed.
**Requires**: `docs/prd/PRD.md`, `docs/specs/technical-spec.md`; optionally a local HTML file, Stitch prompt, or Figma URL
**Produces**: `design-system.md`, `component-map.md`, `page-layouts.md`
**Skill**: `.opencode/skills/design-to-components/SKILL.md`

### engineer

**File**: `.codex/agents/engineer.toml`
**When to invoke**: Phase 3 — All 8 spec files exist and user requests "Implement Batch N".
**Requires**: All 5 Phase 1 specs + all 3 Phase 2 specs
**Produces**: Working code committed to git, Alembic migrations, tests covering batch AT-XXX items
**Skills**: `.opencode/skills/fastapi-crud/SKILL.md`, `.opencode/skills/supabase-migration/SKILL.md`

### qa

**File**: `.codex/agents/qa.toml`
**When to invoke**: Phase 4 — Engineer has delivered a batch; user requests "Verify Batch N" or "Full QA verification".
**Requires**: All spec files + working code from Engineer
**Produces**: `docs/qa/batch-N-report.md` (batch mode) or `docs/qa/test-report.md` (full mode)

---

## Batch Delivery Workflow

Phase 3 (Engineer) and Phase 4 (QA) operate in **incremental batches** as defined in `docs/specs/delivery-plan.md`.

### Per-Batch Cycle

```
User: "Implement Batch 1"
  → Invoke engineer subagent scoped to Batch-1
  → Implements features, writes tests, creates migrations
  → Runs validation gate (build, test, lint)
  → Commits code

User: "Verify Batch 1"
  → Invoke qa subagent scoped to Batch-1
  → Executes 3-layer verification (Layer 1: API → Layer 2: UI Functionality → Layer 3: UI Design)
  → Produces docs/qa/batch-1-report.md
  → Pauses for human review

User reviews report → approves → "Implement Batch 2"
  → Cycle repeats for next batch
```

### After All Batches

```
User: "Full QA verification"
  → Invoke qa subagent in Full Verification mode
  → Verifies ALL acceptance tests, checks cross-batch regressions
  → Produces docs/qa/test-report.md
  → Pauses for human review and release decision
```

**Human checkpoint**: A human MUST review and approve each batch QA report before the next batch begins. No automatic batch-to-batch progression.

---

## Skills Reference

Skills provide step-by-step workflows for specialized tasks. Subagents read skill files directly.

| Skill | File | Used By | Purpose |
|-------|------|---------|---------|
| PRD to Spec | `.opencode/skills/prd-to-spec/SKILL.md` | architect | Converting PRD into 5 technical spec files |
| Design to Components | `.opencode/skills/design-to-components/SKILL.md` | designer | Mapping designs to Shadcn UI components |
| FastAPI CRUD | `.opencode/skills/fastapi-crud/SKILL.md` | engineer | Scaffolding new API endpoints with models and schemas |
| Supabase Migration | `.opencode/skills/supabase-migration/SKILL.md` | engineer | Creating and managing Alembic database migrations |

---

## Key Differences: Codex vs OpenCode

| Aspect | OpenCode | Codex |
|--------|----------|-------|
| Agent model | Multi-agent with subagent delegation via `task()` | 4 dedicated subagents defined in `.codex/agents/*.toml` |
| Phase switching | Separate agent invocations from orchestrator | User invokes specific subagent by phase trigger phrase |
| Agent definitions | `.opencode/agents/*.md` (full instructions) | `.codex/agents/*.toml` (bootstrap) + `.opencode/agents/*.md` (full reference) |
| Research tools | `explore`, `librarian`, `oracle` subagents | Web search, shell commands, file reading |
| Skill loading | `task(load_skills=["skill-name"])` parameter | Subagent reads `.opencode/skills/{name}/SKILL.md` directly |
| Background tasks | Async subagent execution | Sequential execution within session |

---

## Quick Start Guide

### First-Time Setup

```bash
# 1. Ensure Codex CLI is installed
# See: https://github.com/openai/codex

# 2. Start Codex in the project directory
codex
```

### Development Workflow

```
Step 1: Create your PRD
  cp docs/prd/PRD_TEMPLATE.md docs/prd/PRD.md
  # Fill in all sections (see docs/prd/EXAMPLE_PRD.md for reference)

Step 2: "Start Phase 1 — Architect"
  → architect subagent reads docs/prd/PRD.md
  → Produces: technical-spec.md, data-model.md, api-spec.md,
              acceptance-tests.md, delivery-plan.md
  → USER REVIEW: Approve all 5 spec files before proceeding

Step 3: "Start Phase 2 — Designer"
  → designer subagent reads PRD + technical-spec.md
  → Optionally provide: local HTML file path, Stitch prompt, or Figma URL
  → Produces: design-system.md, component-map.md, page-layouts.md
  → USER REVIEW: Approve design system + component structure before proceeding

Step 4: "Implement Batch 1"
  → engineer subagent reads all 8 spec files, implements Batch-1 features
  → Writes backend code, frontend code, tests, Alembic migrations
  → Runs build/test validation gate, commits code
  → USER REVIEW: Verify builds pass, tests green, code committed

Step 5: "Verify Batch 1"
  → qa subagent executes 3-layer verification scoped to Batch-1
  → Produces docs/qa/batch-1-report.md
  → USER REVIEW: Approve batch report before starting next batch

Step 6: Repeat Steps 4–5 for remaining batches
  (Batch 2, Batch 3, ... as defined in delivery-plan.md)

Step 7: "Full QA verification"
  → qa subagent in Full Verification mode
  → Verifies ALL acceptance tests, cross-batch regressions
  → Produces docs/qa/test-report.md
  → USER REVIEW: Final approval for release
```

---

## Reference

- **Project standards**: `AGENTS.md` (project root) — Architecture, tech stack, coding conventions (shared by Codex and OpenCode)
- **Subagent definitions**: `.codex/agents/*.toml` — Codex subagent bootstrap instructions
- **Full agent definitions**: `.opencode/agents/*.md` — Complete role instructions, code patterns, validation criteria
- **Skills**: `.opencode/skills/*/SKILL.md` — Specialized workflow guides
- **PRD template**: `docs/prd/PRD_TEMPLATE.md` — Starting point for feature development
- **Example PRD**: `docs/prd/EXAMPLE_PRD.md` — Filled example for reference
