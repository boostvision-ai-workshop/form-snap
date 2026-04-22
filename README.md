# Micro SaaS Agent

A full-stack template for building Micro SaaS products with multi-agent AI assistance. Ships with Next.js 16 frontend, FastAPI backend, Firebase Auth, Supabase Postgres, and an integrated 4-agent development system.

Build, scale, and ship faster with AI-assisted development workflows.

## Features

- **Next.js 16 Frontend** — App Router, React 19, Tailwind CSS v4 (CSS-first), Shadcn UI components
- **FastAPI Backend** — Async SQLAlchemy, Alembic migrations, Pydantic validation, pytest integration
- **Firebase Authentication** — Client-side SDK + Admin SDK for full auth flow
- **Supabase Cloud Postgres** — Production-ready database with automatic backups
- **Multi-Agent AI System** — 4 specialized agents (Architect, Designer, Engineer, QA) for structured development
- **Docker Development** — Unified dev environment with docker-compose
- **Interactive Initialization** — `init.sh` script handles project setup and credential configuration
- **Complete Test Setup** — Vitest + Playwright (frontend), pytest (backend)

## Prerequisites

- Node.js 20+ (recommended: use nvm with `.nvmrc`)
- Python 3.12+
- [pnpm](https://pnpm.io/) (enabled via corepack)
- [uv](https://docs.astral.sh/uv/) (Python package manager)
- [Docker](https://www.docker.com/) (for containerized development)

## Local Development (no Firebase/Supabase required)

Run the full stack offline with SQLite and a mock auth provider. No Firebase project or Supabase credentials are needed.

**Backend**

```bash
# 1. Copy the local env file
cp backend/.env.local.example backend/.env

# 2. Run all Alembic migrations against the local SQLite database
uv run --directory backend alembic upgrade head

# 3. Start the backend
uv run --directory backend uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend**

```bash
# 1. Copy the local env file
cp frontend/.env.local.example frontend/.env.local

# 2. Start the frontend
pnpm --dir frontend dev
```

Open http://localhost:3000. The auth flow runs entirely in-browser using localStorage. Tokens look like `mock:<uid>:<email>:<verified>` and are verified by the backend without contacting Firebase.

To mark your email as verified without a real email link, go to the verify-email page and click **"Local dev: mark email verified"** (visible only in mock mode).

**How it works**

- `AUTH_PROVIDER=mock` tells the backend to accept `mock:` tokens instead of Firebase tokens.
- `DATABASE_URL=sqlite+aiosqlite:///./dev.db` creates a local SQLite file; all Alembic migrations run against it.
- `NEXT_PUBLIC_AUTH_PROVIDER=mock` tells the frontend to use an in-browser auth provider backed by `localStorage` instead of the Firebase SDK.

---

## Getting Started

### Step 1: Use This Template

```bash
Click "Use this template" on https://github.com/boostvision-ai-workshop/micro_saas_dev_agent
```

### Step 2: Run Project Initialization

```bash
./scripts/init.sh
```

This interactive script will:
- Prompt for your project name
- Create `.env` files with placeholders
- Guide you through Firebase + Supabase credential setup
- Install frontend and backend dependencies
- Run database migrations

For non-interactive setup:
```bash
./scripts/init.sh --help  # Show all options
```

### Step 3: Configure Firebase & Supabase

Follow the detailed setup instructions:
- [Setup Guide](docs/setup-guide.md) — Firebase Auth and Supabase Postgres configuration

### Step 4: Start Development

**Using Docker (recommended):**
```bash
docker compose up --build
```

**Local development (two terminals):**

Terminal 1 (Frontend):
```bash
pnpm --dir frontend dev
```

Terminal 2 (Backend):
```bash
cd backend && uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Step 5: Verify

- Frontend: http://localhost:3000
- Backend health check: http://localhost:8000/api/v1/health
- Backend API docs: http://localhost:8000/docs

## Available Scripts

| Script | Description |
|--------|-------------|
| `./scripts/init.sh` | Interactive project initialization (name, env, credentials) |
| `./scripts/init.sh --help` | Show all initialization options |
| `./scripts/setup-components.sh` | Add Shadcn UI components to frontend |
| `./scripts/setup-components.sh --list` | List installed Shadcn components |
| `./scripts/generate-types.sh` | Generate TypeScript types from API schema |
| `python scripts/seed-db.py` | Seed database with sample data |
| `pnpm --dir frontend dev` | Start frontend dev server (port 3000) |
| `pnpm --dir frontend build` | Build frontend for production |
| `pnpm --dir frontend test` | Run frontend tests (Vitest) |
| `pnpm --dir frontend test:e2e` | Run E2E tests (Playwright) |
| `pnpm --dir frontend lint` | Lint frontend code |
| `uv run --project backend pytest` | Run backend tests |
| `uv run --project backend ruff check app/` | Lint backend code |
| `docker compose up --build` | Start all services via Docker |
| `docker compose down` | Stop all services |

## AI Agent System

This template includes a multi-agent development system for structured feature development. Four specialized agents work in sequence:

1. **Architect** — Translate requirements into technical specifications
2. **Designer** — Map UI requirements to Shadcn components
3. **Engineer** — Implement frontend and backend code
4. **QA** — Validate against specifications

The agent system supports two AI coding tools — use whichever fits your workflow:

| Tool | Config | How Agents Work |
|------|--------|-----------------|
| **[OpenCode](https://opencode.ai)** | `.opencode/` | Orchestrator delegates to 4 subagents via `task()` |
| **[Codex CLI](https://github.com/openai/codex)** | `.codex/agents/*.toml` | 4 dedicated subagents, one per phase |

Both tools share the same `AGENTS.md` project standards, `.opencode/agents/*.md` full agent definitions, and `.opencode/skills/` workflow guides.

**Learn more:**
- [AGENTS.md](AGENTS.md) — Complete agent system reference, workflows, and coding standards
- [AGENTS.override.md](AGENTS.override.md) — Codex-specific subagent configuration and quick start
- [PRD Template](docs/prd/PRD_TEMPLATE.md) — Start your first feature here
- [Example PRD](docs/prd/EXAMPLE_PRD.md) — Filled example for reference
- [MCP Setup Guide](docs/mcp-setup-guide.md) — Configure Model Context Protocol for AI integration

## Project Structure

```
├── frontend/              # Next.js 16 (App Router, Tailwind v4, Shadcn UI)
│   ├── src/
│   │   ├── app/          # Route groups: (marketing), (auth), (dashboard)
│   │   ├── components/   # UI (shadcn) + domain components
│   │   ├── contexts/     # React contexts (auth-context.tsx)
│   │   ├── lib/api/      # API client (client.ts, index.ts)
│   │   └── __tests__/    # Vitest tests
│   └── next.config.ts
├── backend/               # FastAPI (Python 3.12, SQLAlchemy, Alembic)
│   ├── app/
│   │   ├── api/v1/       # Route endpoints
│   │   ├── models/       # SQLAlchemy ORM models
│   │   ├── schemas/      # Pydantic request/response models
│   │   ├── services/     # Business logic
│   │   ├── core/         # Firebase, security utilities
│   │   └── dependencies.py
│   ├── alembic/          # Database migrations
│   └── main.py
├── scripts/               # Automation scripts
│   ├── init.sh           # Project initialization
│   ├── setup-components.sh # Add Shadcn components
│   ├── generate-types.sh # Generate TypeScript types
│   └── seed-db.py        # Seed database
├── docs/                   # Documentation
│   ├── setup-guide.md    # Firebase + Supabase setup
│   ├── mcp-setup-guide.md # MCP server configuration
│   └── prd/              # PRD templates
├── .opencode/            # AI agent definitions and skills (OpenCode + Codex shared)
├── .codex/               # Codex CLI subagent TOML definitions
├── docker-compose.yml    # Docker development setup
├── .env.example          # Environment variables template
└── pnpm-workspace.yaml   # Monorepo root
```

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS v4, Shadcn UI
- **Backend**: FastAPI, Python 3.12, SQLAlchemy (async), Alembic
- **Database**: Supabase (cloud Postgres)
- **Auth**: Firebase Authentication
- **Testing**: Vitest + Playwright (frontend), pytest (backend)
- **Package Managers**: pnpm (frontend), uv (backend)
- **Containerization**: Docker + docker-compose

## Environment Configuration

Run `./scripts/init.sh` to configure environment files interactively. For manual setup:

```bash
cp .env.example .env
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
```

Key environment variables:
- `DATABASE_URL` — Supabase Postgres connection string
- `FIREBASE_API_KEY`, `FIREBASE_PROJECT_ID`, etc. — Firebase Auth config
- `NEXT_PUBLIC_API_URL` — Backend API URL (default: http://localhost:8000)
- `BACKEND_CORS_ORIGINS` — Allowed CORS origins

See `.env.example` for complete variable list.

## Documentation

- [AGENTS.md](AGENTS.md) — AI agent system reference, 4-phase workflow, coding standards
- [Setup Guide](docs/setup-guide.md) — Firebase Auth and Supabase Postgres configuration
- [MCP Setup Guide](docs/mcp-setup-guide.md) — Model Context Protocol server setup for AI agents
- [PRD Template](docs/prd/PRD_TEMPLATE.md) — Product Requirements Document template
- [Example PRD](docs/prd/EXAMPLE_PRD.md) — Filled example for reference

## License

MIT
