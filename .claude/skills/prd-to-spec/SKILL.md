---
name: prd-to-spec
description: Step-by-step process for converting a PRD document into technical specifications
---

# PRD to Technical Specifications Skill

## When to Use

Use this skill when the Architect agent needs to parse a new Product Requirements Document (PRD) and convert it into technical specifications for implementation. This skill is invoked during Phase 1 of the development workflow.

## Prerequisites

- PRD file exists at `docs/prd/PRD.md`
- PRD includes: features, user stories, data requirements, API needs, and business logic

## Step-by-Step Process

### Step 1: Extract Core Requirements

Read `docs/prd/PRD.md` completely and extract:

- **Features**: All user-facing functionality
- **User Stories**: Acceptance criteria and workflows
- **Data Entities**: Objects that need persistence (users, posts, subscriptions, etc.)
- **API Needs**: External integrations, backend endpoints required
- **Business Rules**: Validation logic, permissions, workflows

### Step 2: Define Database Models

For each data entity identified, define a SQLAlchemy model following the pattern in `backend/app/models/user.py`:

**Pattern**:
```python
from uuid import uuid4
from sqlalchemy import String, DateTime, func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base

class EntityName(Base):
    __tablename__ = "entity_names"
    
    id: Mapped[uuid4] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
```

**Key Rules**:
- Use `PG_UUID(as_uuid=True)` for primary keys
- Use `Mapped` + `mapped_column` type annotations
- Use `DateTime(timezone=True)` with `server_default=func.now()` for timestamps
- Extend `Base` from `app.models.base` (AsyncAttrs + DeclarativeBase)
- Define relationships with `relationship()` for foreign keys
- Add indexes for frequently queried columns

### Step 3: Define API Endpoints

For each API need identified, define a FastAPI endpoint following the pattern in `backend/app/api/v1/users.py`:

**Pattern**:
```python
from fastapi import APIRouter, Depends
from app.dependencies import get_current_user, get_db
from app.schemas.entity import EntityResponse, EntityCreate

router = APIRouter(prefix="/entities", tags=["entities"])

@router.get("/me", response_model=EntityResponse)
async def get_my_entity(
    current_user: Mapped[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Implementation
```

**Key Rules**:
- Use `APIRouter(prefix="/{resource}", tags=["{resource}"])`
- Use `Depends(get_current_user)` for protected endpoints
- Use `Depends(get_db)` for database access (or `get_db_optional` for public endpoints)
- Define Pydantic `response_model` for all endpoints
- Include request schemas for POST/PUT/PATCH operations

### Step 4: Map Features to Frontend Pages

For each feature in the PRD, map to frontend pages and route groups:

**Route Groups**:
- `frontend/src/app/(auth)/` — Authentication flows (login, signup, reset password)
  - Use `"use client"` directive (CSR)
  - Example: `(auth)/login/page.tsx`, `(auth)/signup/page.tsx`
  
- `frontend/src/app/(dashboard)/` — Authenticated user area
  - Use `"use client"` directive (CSR)
  - Example: `(dashboard)/page.tsx`, `(dashboard)/settings/page.tsx`
  
- `frontend/src/app/` (root) — Public marketing pages
  - Use SSR (no `"use client"` unless interactive elements)
  - Example: `page.tsx`, `about/page.tsx`, `pricing/page.tsx`

**Authentication Context**:
- All authenticated pages should use `useAuth()` from `frontend/src/contexts/auth-context.tsx`
- API calls go through `frontend/src/lib/api/client.ts` (auto-injects Firebase token)

### Step 5: Write Technical Specification

Create `docs/specs/technical-spec.md` with these sections:

**Template**:
```markdown
# Technical Specification: [Feature Name]

## Overview
Brief description of the feature and its purpose.

## Architecture Decisions
- Frontend approach (SSR vs CSR, state management)
- Backend approach (service layer, business logic location)
- Authentication flow
- Data flow (frontend → API → database)

## Component Breakdown

### Frontend Components
- Page components (route group + file path)
- Custom components needed (domain-specific)
- Shadcn UI components to use
- State management approach

### Backend Components
- API endpoints (router file)
- Service layer functions
- Database models
- Pydantic schemas

## File Structure Plan
List all new files that will be created:
- `frontend/src/app/(group)/path/page.tsx`
- `frontend/src/components/domain/component.tsx`
- `backend/app/api/v1/resource.py`
- `backend/app/services/resource.py`
- `backend/app/models/resource.py`
- `backend/app/schemas/resource.py`

## Technical Risks
- Performance concerns
- Security considerations
- Scalability limitations
- External dependencies

## Integration Points
- Firebase Auth integration
- Supabase database queries
- External APIs (if any)
```

### Step 6: Write Data Model Specification

Create `docs/specs/data-model.md` with all database models:

**Template**:
```markdown
# Data Model Specification: [Feature Name]

## Entity: [EntityName]

**Table Name**: `entity_names`

### Fields
| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| id | UUID | Primary Key | Unique identifier |
| created_at | DateTime(tz) | NOT NULL, default=now() | Creation timestamp |
| updated_at | DateTime(tz) | NOT NULL, onupdate=now() | Last update timestamp |
| field_name | String(255) | NOT NULL | Field description |

### Relationships
- `belongs_to: User` — Foreign key to users.id
- `has_many: RelatedEntity` — One-to-many relationship

### Indexes
- `idx_entity_field` on `field_name` — For search queries
- `idx_entity_user` on `user_id` — For user-scoped queries

### Migration Plan
- Create table with all fields
- Add foreign key constraints
- Add indexes
- Seed data (if needed)

## Relationships Diagram
```
User (1) ──< (N) EntityName
EntityName (1) ──< (N) RelatedEntity
```
```

### Step 7: Write API Specification

Create `docs/specs/api-spec.md` with all endpoint definitions:

**Template**:
```markdown
# API Specification: [Feature Name]

## Endpoint: Get User Entity

**Method**: `GET`  
**Path**: `/api/v1/entities/me`  
**Auth**: Required (Firebase token)

### Request Headers
```
Authorization: Bearer <firebase_token>
```

### Response (200 OK)
```json
{
  "id": "uuid",
  "created_at": "2026-03-25T10:00:00Z",
  "updated_at": "2026-03-25T10:00:00Z",
  "field_name": "value"
}
```

### Error Responses
- `401 Unauthorized` — Invalid or missing token
- `404 Not Found` — Entity not found

---

## Endpoint: Create Entity

**Method**: `POST`  
**Path**: `/api/v1/entities`  
**Auth**: Required

### Request Body
```json
{
  "field_name": "value"
}
```

### Response (201 Created)
```json
{
  "id": "uuid",
  "created_at": "2026-03-25T10:00:00Z",
  "updated_at": "2026-03-25T10:00:00Z",
  "field_name": "value"
}
```

### Validation Rules
- `field_name`: Required, 1-255 characters
```

## Output Templates

### Technical Spec Template

```markdown
# Technical Specification: [Feature Name]
## Overview
## Architecture Decisions
## Component Breakdown
### Frontend Components
### Backend Components
## File Structure Plan
## Technical Risks
## Integration Points
```

### Data Model Template

```markdown
# Data Model Specification: [Feature Name]
## Entity: [EntityName]
**Table Name**: `table_name`
### Fields
### Relationships
### Indexes
### Migration Plan
## Relationships Diagram
```

### API Spec Template

```markdown
# API Specification: [Feature Name]
## Endpoint: [Name]
**Method**: [GET/POST/PUT/DELETE]
**Path**: `/api/v1/resource`
**Auth**: [Required/Optional]
### Request Headers
### Request Body (if applicable)
### Response
### Error Responses
### Validation Rules
```

## Checklist

Before completing Phase 1, verify:

- [ ] All PRD features are covered in technical spec
- [ ] Every data entity has a model definition in data-model.md
- [ ] Every model has migration plan documented
- [ ] Every API endpoint has full specification (method, path, request, response, errors)
- [ ] All protected endpoints specify authentication requirements
- [ ] Frontend pages are mapped to correct route groups (auth/dashboard/root)
- [ ] No orphaned entities (all entities are used by at least one feature)
- [ ] Technical risks are documented
- [ ] Integration points with Firebase Auth and Supabase are specified
- [ ] All 3 spec files exist: technical-spec.md, data-model.md, api-spec.md
- [ ] User has reviewed and approved specifications

## Common Patterns

### Service Layer Pattern

Business logic goes in `backend/app/services/`:

```python
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.entity import Entity

async def get_entity_by_id(db: AsyncSession, entity_id: str) -> Entity | None:
    result = await db.execute(select(Entity).where(Entity.id == entity_id))
    return result.scalar_one_or_none()
```

### API Router Integration

Add new routers to `backend/app/api/v1/router.py`:

```python
from app.api.v1 import entities

api_router.include_router(entities.router)
```

### Dependency Injection

Use these dependencies from `backend/app/dependencies.py`:

- `get_db` — Async database session (required)
- `get_db_optional` — Optional database session (for public endpoints)
- `get_current_user` — Authenticated user (verifies Firebase token)

## Anti-Patterns to Avoid

- Do NOT put business logic in route handlers — use service layer
- Do NOT use relative imports — use absolute imports from `app.*`
- Do NOT skip Pydantic schemas — every endpoint needs request/response models
- Do NOT skip migrations — every model change needs an Alembic migration
- Do NOT access database from frontend — all data flows through FastAPI
- Do NOT create custom auth mechanisms — use Firebase Auth only

## Next Phase

Once all specifications are complete and approved, hand off to Designer agent (Phase 2) with:
- `docs/specs/technical-spec.md`
- `docs/specs/data-model.md`
- `docs/specs/api-spec.md`
