# Claude Code Operating Instructions

> This file is automatically loaded by [Claude Code](https://docs.claude.com/claude-code). It layers Claude Code-specific workflow instructions on top of [`AGENTS.md`](./AGENTS.md), which holds the shared architecture and global rules.
>
> **Read `AGENTS.md` first** for: tech stack, must do / must not do rules, phase overview, and links to `docs/system/STANDARDS.md`, `docs/system/WORKFLOW.md`, `docs/system/SKILLS_AND_GUIDE.md`.

---

## 1. Subagent Model

Claude Code uses **4 dedicated project subagents**, one per development phase. Each subagent lives in `.claude/agents/` as a Markdown file with YAML frontmatter (`name`, `description`, `model`). Delegate to a subagent via the **Task tool** with `subagent_type` set to the agent's `name`.

| Phase | Subagent (`subagent_type`) | Trigger Phrases | Produces |
|-------|----------------------------|-----------------|----------|
| **Phase 1** | `architect` | "Phase 1", "Architect", "create specs", "start from PRD" | 5 spec files in `docs/specs/` |
| **Phase 2** | `designer`  | "Phase 2", "Designer", "design system", "component map" | 3 spec files in `docs/specs/` |
| **Phase 3** | `engineer`  | "Phase 3", "Engineer", "implement Batch N" | Code + tests + Alembic migrations |
| **Phase 4** | `qa`        | "Phase 4", "QA", "verify Batch N", "full QA" | QA report in `docs/qa/` |

The Markdown body of each `.claude/agents/*.md` file contains the full role definition, validation criteria, and code patterns. When invoked, the subagent reads the relevant Skill file directly from `.claude/skills/`.

---

## 2. Subagent Reference

### architect
- **File**: `.claude/agents/architect.md`
- **When to invoke**: Phase 1 — User has a PRD at `docs/prd/PRD.md` and needs technical specifications.
- **Requires**: `docs/prd/PRD.md`
- **Produces**: `technical-spec.md`, `data-model.md`, `api-spec.md`, `acceptance-tests.md`, `delivery-plan.md` (all under `docs/specs/`)
- **Skill**: `.claude/skills/prd-to-spec/SKILL.md`

### designer
- **File**: `.claude/agents/designer.md`
- **When to invoke**: Phase 2 — Phase 1 specs are approved and UI component mapping is needed.
- **Requires**: `docs/prd/PRD.md`, `docs/specs/technical-spec.md`; optionally a local HTML file, Stitch prompt, or Figma URL
- **Produces**: `design-system.md`, `component-map.md`, `page-layouts.md`
- **Skill**: `.claude/skills/design-to-components/SKILL.md`

### engineer
- **File**: `.claude/agents/engineer.md`
- **When to invoke**: Phase 3 — All 8 spec files exist and user requests "Implement Batch N".
- **Requires**: All 5 Phase 1 specs + all 3 Phase 2 specs
- **Produces**: Working code committed to git, Alembic migrations, tests covering batch AT-XXX items
- **Skills**: `.claude/skills/fastapi-crud/SKILL.md`, `.claude/skills/supabase-migration/SKILL.md`

### qa
- **File**: `.claude/agents/qa.md`
- **When to invoke**: Phase 4 — Engineer has delivered a batch; user requests "Verify Batch N" or "Full QA verification".
- **Requires**: All spec files + working code from Engineer
- **Produces**: `docs/qa/batch-N-report.md` (batch mode) or `docs/qa/test-report.md` (full mode)

---

## 3. Batch Delivery Workflow

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

## 4. Skills Reference

Skills provide step-by-step workflows for specialized tasks. Subagents read skill files directly from `.claude/skills/<skill-name>/SKILL.md`.

| Skill | File | Used By | Purpose |
|-------|------|---------|---------|
| PRD to Spec | `.claude/skills/prd-to-spec/SKILL.md` | architect | Converting PRD into 5 technical spec files |
| Design to Components | `.claude/skills/design-to-components/SKILL.md` | designer | Mapping designs to Shadcn UI components |
| FastAPI CRUD | `.claude/skills/fastapi-crud/SKILL.md` | engineer | Scaffolding new API endpoints with models and schemas |
| Supabase Migration | `.claude/skills/supabase-migration/SKILL.md` | engineer | Creating and managing Alembic database migrations |

---

## 5. Key Differences: Claude Code vs OpenCode vs Codex

| Aspect | OpenCode | Codex | **Claude Code** |
|--------|----------|-------|-----------------|
| Agent location | `.opencode/agents/*.md` | `.codex/agents/*.toml` (bootstrap) + `.opencode/agents/*.md` (full) | `.claude/agents/*.md` (full, with YAML frontmatter) |
| Skill location | `.opencode/skills/*/SKILL.md` | reuses `.opencode/skills/` | `.claude/skills/*/SKILL.md` |
| Phase invocation | Multi-agent with `task()` delegation | User trigger phrases route to subagent | **Task tool** with `subagent_type: <name>` |
| Research helpers | `explore`, `librarian`, `oracle` subagents | Web search, shell commands | Built-in `Explore` / `Plan` agents + standard tools |
| Orchestration | Async via subagent calls | Sequential within session | Sequential within session; subagents run in isolated context windows |

> The three folder layouts (`.opencode/`, `.codex/`, `.claude/`) coexist on purpose so the same project works across all three CLIs. **Do not delete the others when editing one.**

---

## 6. Quick Start

### First-Time Setup

```bash
# 1. Ensure Claude Code is installed (https://docs.claude.com/claude-code)
# 2. Start Claude in the project root
claude
```

### Development Workflow

```
Step 1: Create your PRD
  cp docs/prd/PRD_TEMPLATE.md docs/prd/PRD.md
  # Fill in all sections (see docs/prd/EXAMPLE_PRD.md for reference)

Step 2: "Start Phase 1 — Architect"
  → Claude invokes the architect subagent (Task tool, subagent_type: architect)
  → Reads docs/prd/PRD.md
  → Produces: technical-spec.md, data-model.md, api-spec.md,
              acceptance-tests.md, delivery-plan.md
  → USER REVIEW: Approve all 5 spec files before proceeding

Step 3: "Start Phase 2 — Designer"
  → Claude invokes the designer subagent
  → Reads PRD + technical-spec.md
  → Optionally provide: local HTML file path, Stitch prompt, or Figma URL
  → Produces: design-system.md, component-map.md, page-layouts.md
  → USER REVIEW: Approve design system + component structure before proceeding

Step 4: "Implement Batch 1"
  → Claude invokes the engineer subagent scoped to Batch-1
  → Writes backend code, frontend code, tests, Alembic migrations
  → Runs build/test validation gate, commits code
  → USER REVIEW: Verify builds pass, tests green, code committed

Step 5: "Verify Batch 1"
  → Claude invokes the qa subagent scoped to Batch-1
  → 3-layer verification → docs/qa/batch-1-report.md
  → USER REVIEW: Approve batch report before starting next batch

Step 6: Repeat Steps 4–5 for remaining batches
  (Batch 2, Batch 3, ... as defined in delivery-plan.md)

Step 7: "Full QA verification"
  → Claude invokes the qa subagent in Full Verification mode
  → docs/qa/test-report.md
  → USER REVIEW: Final approval for release
```

---

## 7. Reference

- **Project standards (shared)**: [`AGENTS.md`](./AGENTS.md) — Architecture, tech stack, coding conventions
- **Codex overrides**: [`AGENTS.override.md`](./AGENTS.override.md) — Codex-only workflow notes (informational for Claude)
- **Subagent definitions**: `.claude/agents/*.md` — Full role instructions with YAML frontmatter
- **Skills**: `.claude/skills/*/SKILL.md` — Specialized workflow guides
- **PRD template**: `docs/prd/PRD_TEMPLATE.md`
- **Filled PRD for current project**: `docs/prd/PRD.md` (if it exists, that's the input for the architect subagent)
- **Example PRD**: `docs/prd/EXAMPLE_PRD.md`
- **System docs**: `docs/system/STANDARDS.md`, `docs/system/WORKFLOW.md`, `docs/system/SKILLS_AND_GUIDE.md`
