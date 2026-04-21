# AI Agent System Reference

Micro SaaS template — monorepo, decoupled frontend/backend, REST API only.

> **Sub-documents** (load when needed — do NOT load all upfront):
> | Need to know… | Document |
> |---------------|----------|
> | Directory structure, coding rules, naming | [STANDARDS.md](./docs/system/STANDARDS.md) |
> | Phase handoffs, acceptance tests, batches, fallbacks | [WORKFLOW.md](./docs/system/WORKFLOW.md) |
> | Skills (CRUD, migrations), subagent calls, getting started | [SKILLS_AND_GUIDE.md](./docs/system/SKILLS_AND_GUIDE.md) |

---

## 1. Architecture Snapshot (Locked)

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router) + React 19 + TypeScript (strict) |
| Styling | Tailwind CSS v4 (CSS-first, no tailwind.config.js) |
| UI Components | Shadcn UI v2 (Base UI, not Radix) — **do not modify** |
| Backend | FastAPI + Python 3.12 + SQLAlchemy 2.x (async) + Pydantic v2 |
| Auth | Firebase Auth (JS SDK client-side, Admin SDK server-side) |
| Database | Supabase Cloud Postgres — **backend access only** |
| Migrations | Alembic |
| Package Mgrs | pnpm (frontend) · uv (backend) |

**Do NOT propose alternatives to any of the above. Stack is finalized.**

---

## 2. Global Rules

### Must Do

1. All data flows through FastAPI — frontend NEVER accesses the database directly
2. Firebase Auth for ALL authentication — no alternatives
3. Supabase Postgres — cloud only, no local instances
4. Authenticated pages: `"use client"` (CSR)
5. Marketing pages: no `"use client"` unless interactive
6. All docs and code comments in English
7. Every new model → Alembic migration (no manual schema changes)
8. Every new API endpoint → Pydantic request + response schemas

### Must Not Do

1. **DO NOT** modify `frontend/src/components/ui/` — Shadcn is managed externally
2. **DO NOT** wrap `<Button>` inside `<DropdownMenuTrigger>` — trigger renders its own button
3. **DO NOT** create `tailwind.config.js` customizations — Tailwind v4 CSS-first only
4. **DO NOT** access environment secrets in client code
5. **DO NOT** propose architecture alternatives — stack is locked
6. **DO NOT** skip phase gates — each phase must pass validation before the next starts
7. **DO NOT** put database queries in route handlers — use `backend/app/services/`
8. **DO NOT** use relative imports in backend — use absolute `app.*` paths

---

## 3. Workflow (5 Phases)

Acceptance-Test-Driven Incremental Delivery. Each phase has a **human review gate** — no automated progression.

| Phase | Agent | Produces |
|-------|-------|---------|
| 1 — Architect | `.opencode/agents/architect.md` | 5 spec files + AT-XXX acceptance tests |
| 2 — Designer | `.opencode/agents/designer.md` | design-system, component-map, page-layouts |
| 3 — Engineer (per batch) | `.opencode/agents/engineer.md` | Working code + migrations + tests |
| 4 — QA (per batch + full) | `.opencode/agents/qa.md` | batch-N-report.md / test-report.md |
| ★ UI Polish (optional) | Engineer + QA | ui-polish-{page}-report.md |

→ Full phase definitions, handoff artifacts, delivery cycle, and fallback rules: **[WORKFLOW.md](./docs/system/WORKFLOW.md)**
