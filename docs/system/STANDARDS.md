# Coding Standards

Technical standards for all Engineer and QA agents. Load this document when implementing features or running verification.

---

## Frontend

### Directory Structure

```
frontend/src/
├── app/
│   ├── (marketing)/        # Public marketing pages — SSR
│   ├── (auth)/             # Authentication flows — CSR
│   └── (dashboard)/        # Authenticated user area — CSR
├── components/
│   ├── ui/                 # Shadcn UI components — DO NOT MODIFY
│   ├── auth/               # Custom auth domain components
│   ├── dashboard/          # Custom dashboard domain components
│   └── marketing/          # Custom marketing domain components
├── contexts/               # React contexts
├── lib/
│   └── api/                # API client (client.ts, index.ts)
└── __tests__/              # Vitest test files
```

**Shadcn UI components** (22 total — all in `frontend/src/components/ui/`, all read-only):
`alert`, `avatar`, `badge`, `button`, `card`, `checkbox`, `command`, `dialog`, `dropdown-menu`, `input-group`, `input`, `label`, `scroll-area`, `select`, `separator`, `sheet`, `skeleton`, `sonner`, `switch`, `table`, `tabs`, `textarea`

### Key Files

| File | Purpose |
|------|---------|
| `frontend/src/contexts/auth-context.tsx` | Firebase Auth context and hooks |
| `frontend/src/lib/api/client.ts` | Centralized API client with token injection |

### Frontend Rules

- Authenticated pages: always use `"use client"` (CSR)
- Marketing pages: no `"use client"` unless interactive elements require it (SSR)
- **NEVER** modify files in `frontend/src/components/ui/`
- `DropdownMenuTrigger` renders its own button — **never** wrap `<Button>` inside it
- Tailwind v4 CSS-first — **no** `tailwind.config.js` modifications
- All API calls MUST go through `frontend/src/lib/api/client.ts`
- Never access database or environment secrets from client code
- Docker: `output: 'standalone'` required in `next.config.ts`
- Docker build context MUST be repo root (not `frontend/` subdirectory)

---

## Backend

### Directory Structure

```
backend/
├── app/
│   ├── api/v1/
│   │   ├── router.py       # Main API router
│   │   ├── health.py       # Health check endpoint
│   │   └── users.py        # User management endpoints
│   ├── models/
│   │   ├── base.py         # Base model (id, created_at, updated_at)
│   │   └── user.py         # User model
│   ├── schemas/
│   │   └── user.py         # Pydantic request/response schemas
│   ├── services/
│   │   └── user.py         # Business logic layer
│   ├── core/
│   │   ├── firebase.py     # Firebase Admin SDK initialization
│   │   └── security.py     # Token verification and security utilities
│   └── dependencies.py     # get_db (AsyncSession) + get_current_user (auth)
└── alembic/
    └── versions/           # Database migration files
```

### Key Files

| File | Purpose |
|------|---------|
| `backend/app/dependencies.py` | Provides `get_db` (async session) and `get_current_user` (auth) |
| `backend/app/core/firebase.py` | Firebase Admin SDK setup |
| `backend/app/core/security.py` | Token verification logic |
| `backend/app/models/base.py` | Base SQLAlchemy model — includes `id`, `created_at`, `updated_at` |

### Backend Rules

- Every new database model MUST have a corresponding Alembic migration
- Every API endpoint MUST have Pydantic request/response schemas
- Use `AsyncSession` for all database operations
- All protected endpoints MUST use `get_current_user` dependency
- Never expose internal IDs or database structure in responses without filtering
- Business logic goes in `backend/app/services/` — keep routers thin
- pytest-asyncio 1.3.0+: use `@pytest_asyncio.fixture` for async fixtures
- All imports use absolute paths from `app.*` — no relative imports
- Environment variables loaded via `.env` (never committed to git)

---

## Validation Commands

Run before marking any Engineer batch complete:

```bash
pnpm --dir frontend build    # Must exit 0
pnpm --dir frontend test     # All tests green
uv --directory backend run pytest  # All tests green
```

---

## Documentation Conventions

- **Headings**: `##` for major sections, `###` for subsections
- **Code blocks**: always specify language (` ```typescript `, ` ```python `, ` ```bash `)
- **File paths**: backtick inline paths (`docs/prd/PRD.md`)
- **Tables**: markdown tables for structured data
- **Lists**: `-` unordered, `1.` ordered
- **Emphasis**: `**bold**` for critical rules, `*italic*` for hints
- All documentation and code comments in English
