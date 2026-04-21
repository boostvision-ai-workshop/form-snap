---
name: fastapi-crud
description: Step-by-step process for creating FastAPI CRUD endpoints with SQLAlchemy models
---

# FastAPI CRUD Endpoint Creation

## When to Use

Use this skill when the Engineer agent needs to create a new resource with full CRUD operations:
- Adding a new database table with model, schema, service, and API endpoints
- Implementing standard Create, Read, Update, Delete operations
- Following the established backend architecture patterns

## Prerequisites

Before starting, ensure you have:
- Data model specification from Architect (`docs/specs/data-model.md`)
- API specification from Architect (`docs/specs/api-spec.md`)
- Understanding of the resource's domain logic and business rules
- Database connection configured (`DATABASE_URL` in `.env`)

## Step-by-Step Process

### Step 1: Create SQLAlchemy Model

Create `backend/app/models/{resource}.py` following the User model pattern:

```python
import uuid
from datetime import datetime
from sqlalchemy import DateTime, String, func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base

class ResourceName(Base):
    """
    Brief description of what this resource represents.
    """
    __tablename__ = "resource_names"
    
    # Primary key (always UUID)
    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid.uuid4
    )
    
    # Add your resource-specific fields here
    # Examples:
    # name: Mapped[str] = mapped_column(String(255), nullable=False)
    # description: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    # is_active: Mapped[bool] = mapped_column(default=True, nullable=False)
    
    # Timestamps (required for all models)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        onupdate=func.now(), 
        nullable=False
    )
```

**Key Points:**
- Always extend `Base` from `app.models.base`
- Use `Mapped[type]` for all columns (SQLAlchemy 2.x style)
- Primary key is always `UUID` type
- Include `created_at` and `updated_at` timestamps
- Use `nullable=True` for optional fields (represented as `Type | None`)

### Step 2: Import Model in Models __init__.py

If `backend/app/models/__init__.py` exists, add your model import:

```python
from app.models.base import Base
from app.models.user import User
from app.models.resource import ResourceName  # Add this line

__all__ = ["Base", "User", "ResourceName"]
```

This ensures Alembic can discover your model for migration generation.

### Step 3: Create Pydantic Schemas

Create `backend/app/schemas/{resource}.py` with three schema classes:

```python
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field

class ResourceCreate(BaseModel):
    """Schema for creating a new resource."""
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = Field(None, max_length=1000)
    # Add all fields required for creation (no id, timestamps)

class ResourceUpdate(BaseModel):
    """Schema for updating an existing resource. All fields optional."""
    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = Field(None, max_length=1000)
    # All fields should be optional for partial updates

class ResourceResponse(BaseModel):
    """Schema for resource responses."""
    id: UUID
    name: str
    description: str | None
    created_at: datetime
    updated_at: datetime
    # Include all fields that should be returned to clients
    
    class Config:
        from_attributes = True  # Allows conversion from SQLAlchemy models
```

**Key Points:**
- `ResourceCreate`: Required fields for creation (no id/timestamps)
- `ResourceUpdate`: All fields optional for PATCH operations
- `ResourceResponse`: Complete representation including id and timestamps
- Use Pydantic's `Field` for validation rules
- Set `from_attributes = True` to work with SQLAlchemy models

### Step 4: Create Service Layer

Create `backend/app/services/{resource}.py` with business logic:

```python
import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.resource import ResourceName

async def get_resource_by_id(
    db: AsyncSession, 
    resource_id: uuid.UUID
) -> ResourceName | None:
    """Retrieve a single resource by ID."""
    result = await db.execute(
        select(ResourceName).where(ResourceName.id == resource_id)
    )
    return result.scalar_one_or_none()

async def list_resources(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 100
) -> list[ResourceName]:
    """List resources with pagination."""
    result = await db.execute(
        select(ResourceName)
        .offset(skip)
        .limit(limit)
        .order_by(ResourceName.created_at.desc())
    )
    return list(result.scalars().all())

async def create_resource(
    db: AsyncSession,
    name: str,
    description: str | None = None,
    # Add other creation parameters
) -> ResourceName:
    """Create a new resource."""
    resource = ResourceName(
        name=name,
        description=description,
        # Set other fields
    )
    db.add(resource)
    await db.commit()
    await db.refresh(resource)
    return resource

async def update_resource(
    db: AsyncSession,
    resource: ResourceName,
    **kwargs
) -> ResourceName:
    """Update an existing resource with provided fields."""
    for key, value in kwargs.items():
        if value is not None and hasattr(resource, key):
            setattr(resource, key, value)
    
    await db.commit()
    await db.refresh(resource)
    return resource

async def delete_resource(
    db: AsyncSession,
    resource: ResourceName
) -> None:
    """Delete a resource."""
    await db.delete(resource)
    await db.commit()
```

**Key Points:**
- All functions are `async`
- Use `AsyncSession` from SQLAlchemy
- Keep functions focused on single responsibilities
- Return model instances or None (not dictionaries)
- Commit and refresh after mutations

### Step 5: Create API Endpoint Router

Create `backend/app/api/v1/{resource}.py`:

```python
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user
from app.dependencies import get_db
from app.schemas.resource import ResourceCreate, ResourceResponse, ResourceUpdate
from app.services import resource as resource_service

router = APIRouter(prefix="/resources", tags=["resources"])

@router.get("/", response_model=list[ResourceResponse])
async def list_resources(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """List all resources with pagination."""
    resources = await resource_service.list_resources(db, skip=skip, limit=limit)
    return resources

@router.post("/", response_model=ResourceResponse, status_code=status.HTTP_201_CREATED)
async def create_resource(
    data: ResourceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new resource."""
    resource = await resource_service.create_resource(
        db,
        name=data.name,
        description=data.description,
        # Pass other fields
    )
    return resource

@router.get("/{resource_id}", response_model=ResourceResponse)
async def get_resource(
    resource_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get a single resource by ID."""
    resource = await resource_service.get_resource_by_id(db, resource_id)
    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found"
        )
    return resource

@router.patch("/{resource_id}", response_model=ResourceResponse)
async def update_resource(
    resource_id: uuid.UUID,
    data: ResourceUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update a resource (partial update)."""
    resource = await resource_service.get_resource_by_id(db, resource_id)
    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found"
        )
    
    # Filter out None values from update data
    update_data = data.model_dump(exclude_unset=True)
    updated_resource = await resource_service.update_resource(
        db, resource, **update_data
    )
    return updated_resource

@router.delete("/{resource_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resource(
    resource_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete a resource."""
    resource = await resource_service.get_resource_by_id(db, resource_id)
    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found"
        )
    
    await resource_service.delete_resource(db, resource)
    return None
```

**Key Points:**
- All endpoints require authentication via `get_current_user`
- Use appropriate HTTP status codes (201 for creation, 204 for deletion)
- Return 404 when resource not found
- Use `exclude_unset=True` for PATCH to only update provided fields
- Keep routers thin — delegate logic to service layer

### Step 6: Register Router

Add your router to `backend/app/api/v1/router.py`:

```python
from fastapi import APIRouter
from app.api.v1.health import router as health_router
from app.api.v1.users import router as users_router
from app.api.v1.resources import router as resources_router  # Add import

api_router = APIRouter()
api_router.include_router(health_router, tags=["health"])
api_router.include_router(users_router)
api_router.include_router(resources_router)  # Add router
```

### Step 7: Generate Alembic Migration

Run the autogenerate command:

```bash
cd backend && uv run alembic revision --autogenerate -m "add resources table"
```

This creates a new migration file in `backend/alembic/versions/`.

### Step 8: Apply Migration

Apply the migration to the database:

```bash
cd backend && uv run alembic upgrade head
```

Verify the migration was applied:

```bash
cd backend && uv run alembic current
```

### Step 9: Add Tests

Create `backend/tests/test_{resource}.py`:

```python
import pytest
import pytest_asyncio
from httpx import AsyncClient
from uuid import uuid4

@pytest.mark.asyncio
async def test_create_resource(client: AsyncClient, auth_headers: dict):
    """Test creating a new resource."""
    response = await client.post(
        "/api/v1/resources/",
        json={
            "name": "Test Resource",
            "description": "Test description"
        },
        headers=auth_headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Resource"
    assert "id" in data

@pytest.mark.asyncio
async def test_list_resources(client: AsyncClient, auth_headers: dict):
    """Test listing resources."""
    response = await client.get("/api/v1/resources/", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

@pytest.mark.asyncio
async def test_get_resource(client: AsyncClient, auth_headers: dict, test_resource_id: str):
    """Test getting a single resource."""
    response = await client.get(
        f"/api/v1/resources/{test_resource_id}",
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_resource_id

@pytest.mark.asyncio
async def test_update_resource(client: AsyncClient, auth_headers: dict, test_resource_id: str):
    """Test updating a resource."""
    response = await client.patch(
        f"/api/v1/resources/{test_resource_id}",
        json={"name": "Updated Name"},
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Name"

@pytest.mark.asyncio
async def test_delete_resource(client: AsyncClient, auth_headers: dict, test_resource_id: str):
    """Test deleting a resource."""
    response = await client.delete(
        f"/api/v1/resources/{test_resource_id}",
        headers=auth_headers
    )
    assert response.status_code == 204

@pytest.mark.asyncio
async def test_get_nonexistent_resource(client: AsyncClient, auth_headers: dict):
    """Test getting a resource that doesn't exist."""
    fake_id = str(uuid4())
    response = await client.get(
        f"/api/v1/resources/{fake_id}",
        headers=auth_headers
    )
    assert response.status_code == 404
```

**Test Fixtures** (add to `conftest.py` if needed):

```python
@pytest_asyncio.fixture
async def test_resource_id(client: AsyncClient, auth_headers: dict) -> str:
    """Create a test resource and return its ID."""
    response = await client.post(
        "/api/v1/resources/",
        json={"name": "Test Resource", "description": "For testing"},
        headers=auth_headers
    )
    return response.json()["id"]
```

**Key Points:**
- Use `@pytest.mark.asyncio` for async tests
- Use `@pytest_asyncio.fixture` for async fixtures (not `@pytest.fixture`)
- Test all CRUD operations
- Test error cases (404, 400, etc.)
- Use fixtures for test data setup

## Common Patterns

### Foreign Keys

For relationships to other tables:

```python
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship

class Item(Base):
    __tablename__ = "items"
    
    id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), 
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )
    
    # Optional relationship for eager loading
    user: Mapped["User"] = relationship("User", back_populates="items")
```

### Unique Constraints

For fields that must be unique:

```python
email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
```

### Indexes

For frequently queried fields:

```python
from sqlalchemy import Index

class Resource(Base):
    __tablename__ = "resources"
    # ... fields
    
    __table_args__ = (
        Index("ix_resources_name", "name"),
        Index("ix_resources_created_at", "created_at"),
    )
```

### Many-to-Many Relationships

Use an association table:

```python
from sqlalchemy import Table, Column, ForeignKey

resource_tags = Table(
    "resource_tags",
    Base.metadata,
    Column("resource_id", PG_UUID(as_uuid=True), ForeignKey("resources.id")),
    Column("tag_id", PG_UUID(as_uuid=True), ForeignKey("tags.id")),
)

class Resource(Base):
    __tablename__ = "resources"
    # ... fields
    tags: Mapped[list["Tag"]] = relationship("Tag", secondary=resource_tags)
```

## Error Handling Patterns

### Standard HTTP Status Codes

- **200 OK**: Successful GET, PATCH
- **201 Created**: Successful POST
- **204 No Content**: Successful DELETE
- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Authenticated but not authorized
- **404 Not Found**: Resource doesn't exist
- **409 Conflict**: Duplicate resource (e.g., unique constraint violation)
- **422 Unprocessable Entity**: Pydantic validation error (automatic)

### Custom Error Responses

```python
from fastapi import HTTPException, status

# Not found
raise HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail="Resource not found"
)

# Forbidden (user doesn't own resource)
raise HTTPException(
    status_code=status.HTTP_403_FORBIDDEN,
    detail="You don't have permission to access this resource"
)

# Conflict (duplicate)
raise HTTPException(
    status_code=status.HTTP_409_CONFLICT,
    detail="A resource with this name already exists"
)
```

## Completion Checklist

Before considering the CRUD implementation complete, verify:

- [ ] Model created in `backend/app/models/{resource}.py` with all required fields
- [ ] Model imported in `backend/app/models/__init__.py` (if file exists)
- [ ] Schemas created in `backend/app/schemas/{resource}.py` (Create, Update, Response)
- [ ] Service layer created in `backend/app/services/{resource}.py` with all CRUD functions
- [ ] API router created in `backend/app/api/v1/{resource}.py` with all endpoints
- [ ] Router registered in `backend/app/api/v1/router.py`
- [ ] Alembic migration generated and reviewed
- [ ] Migration applied successfully (`alembic upgrade head`)
- [ ] Tests created in `backend/tests/test_{resource}.py`
- [ ] All tests pass: `cd backend && uv run pytest`
- [ ] Backend builds without errors
- [ ] Endpoints tested manually or via automated tests
- [ ] Documentation updated if needed

## Additional Resources

- SQLAlchemy 2.x documentation: https://docs.sqlalchemy.org/en/20/
- FastAPI documentation: https://fastapi.tiangolo.com/
- Pydantic v2 documentation: https://docs.pydantic.dev/latest/
- Alembic documentation: https://alembic.sqlalchemy.org/
