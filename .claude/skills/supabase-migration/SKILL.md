---
name: supabase-migration
description: Step-by-step process for creating and managing Alembic database migrations
---

# Alembic Database Migrations

## When to Use

Use this skill whenever you need to make database schema changes:
- Adding a new table
- Adding, removing, or modifying columns
- Creating or dropping indexes
- Adding or removing constraints (unique, foreign key, check)
- Renaming tables or columns
- Any other structural change to the database schema

## Prerequisites

Before creating migrations, ensure:
- `DATABASE_URL` environment variable is configured in `.env` (pointing to Supabase Postgres)
- Alembic is initialized (directory `backend/alembic/` exists with `env.py`)
- SQLAlchemy model is defined or modified in `backend/app/models/`
- Model is imported so Alembic can discover it (via `backend/app/models/__init__.py` or direct import in `alembic/env.py`)

## How Alembic is Configured

The Alembic configuration for this project is located at `backend/alembic/env.py` and has these key characteristics:

### Async Engine Configuration

```python
from sqlalchemy.ext.asyncio import async_engine_from_config

# Engine configured for async operations
connectable = async_engine_from_config(
    config.get_section(config.config_ini_section),
    prefix="sqlalchemy.",
    poolclass=pool.NullPool,
)
```

### Metadata Import

```python
from app.models.base import Base

# Target metadata for autogenerate
target_metadata = Base.metadata
```

**Critical**: All models must be imported before `Base.metadata` is accessed. This happens either:
1. Via imports in `backend/app/models/__init__.py`, or
2. Via direct imports in `alembic/env.py`

### Connection String

The `DATABASE_URL` environment variable provides the connection string:
- Format: `postgresql+asyncpg://user:pass@host:port/dbname`
- Must use `asyncpg` driver (not `psycopg2`)
- Loaded from `.env` file in development

## Step-by-Step Process

### Step 1: Create or Modify SQLAlchemy Model

First, define your changes in the SQLAlchemy model at `backend/app/models/{model}.py`.

**Example: Creating a new model**

```python
import uuid
from datetime import datetime
from sqlalchemy import DateTime, String, func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base

class Project(Base):
    __tablename__ = "projects"
    
    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(String(1000), nullable=True)
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

**Ensure Model Discovery**: Import the model in `backend/app/models/__init__.py`:

```python
from app.models.base import Base
from app.models.user import User
from app.models.project import Project  # Add this

__all__ = ["Base", "User", "Project"]
```

### Step 2: Generate Migration

Run the autogenerate command from the backend directory:

```bash
cd backend && uv run alembic revision --autogenerate -m "add projects table"
```

**What This Does:**
- Compares current `Base.metadata` (your models) with the actual database schema
- Generates a migration file in `backend/alembic/versions/` with a timestamp prefix
- Creates `upgrade()` and `downgrade()` functions

**Output Example:**

```
INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.
INFO  [alembic.runtime.migration] Will assume transactional DDL.
INFO  [alembic.autogenerate.compare] Detected added table 'projects'
  Generating /path/to/backend/alembic/versions/abc123_add_projects_table.py ... done
```

### Step 3: Review Generated Migration

**CRITICAL**: Always review the generated migration file before applying it.

Open the file in `backend/alembic/versions/` and check:

1. **Revision Identifiers**: Ensure they form a proper chain
2. **Table Operations**: Verify table names, column types, constraints
3. **Index Operations**: Check indexes are created/dropped correctly
4. **Foreign Keys**: Verify relationships and `ondelete` behavior
5. **Downgrade Logic**: Ensure rollback operations are correct

**Example Migration File:**

```python
"""add projects table

Revision ID: abc123def456
Revises: 0001_create_users_table
Create Date: 2026-03-25 10:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'abc123def456'
down_revision: Union[str, None] = '0001_create_users_table'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create the projects table
    op.create_table('projects',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.String(length=1000), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes
    op.create_index(op.f('ix_projects_name'), 'projects', ['name'], unique=False)


def downgrade() -> None:
    # Drop indexes first
    op.drop_index(op.f('ix_projects_name'), table_name='projects')
    
    # Drop table
    op.drop_table('projects')
```

**Common Issues to Check:**
- Missing indexes that should be created
- Incorrect `nullable` settings
- Missing `ondelete` for foreign keys
- Server defaults not preserved
- Wrong column types

### Step 4: Apply Migration to Cloud Supabase

Once you've reviewed and are satisfied with the migration, apply it:

```bash
cd backend && uv run alembic upgrade head
```

**What This Does:**
- Connects to your Supabase Postgres database
- Runs all pending migrations in order
- Updates the `alembic_version` table to track the current revision

**Output Example:**

```
INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.
INFO  [alembic.runtime.migration] Will assume transactional DDL.
INFO  [alembic.runtime.migration] Running upgrade 0001 -> abc123def456, add projects table
```

**Important Notes:**
- ALL migrations run against cloud Supabase — there is no local database
- Changes are IMMEDIATE and affect the production database (use caution)
- Always test migrations on a staging/dev Supabase project first if possible

### Step 5: Verify Migration Applied

Check the current database revision:

```bash
cd backend && uv run alembic current
```

**Output Example:**

```
INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.
abc123def456 (head)
```

This confirms the migration was applied successfully and the database is at the expected revision.

## Migration Pattern Reference

### Example: First Migration (Users Table)

This is the existing first migration at `backend/alembic/versions/0001_create_users_table.py`:

```python
"""create users table

Revision ID: 0001_create_users_table
Revises: 
Create Date: 2026-03-24 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '0001_create_users_table'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('users',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('firebase_uid', sa.String(length=128), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('display_name', sa.String(length=255), nullable=True),
        sa.Column('avatar_url', sa.String(length=2048), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_users_firebase_uid', 'users', ['firebase_uid'], unique=True)


def downgrade() -> None:
    op.drop_index('ix_users_firebase_uid', table_name='users')
    op.drop_table('users')
```

**Key Patterns:**
- `down_revision = None` for first migration
- Primary key defined via `sa.PrimaryKeyConstraint('id')`
- Unique indexes created separately via `op.create_index(..., unique=True)`
- Downgrade reverses operations in opposite order (indexes first, then table)

## Common Migration Operations

### Add Column

```python
def upgrade() -> None:
    op.add_column('users', sa.Column('phone_number', sa.String(length=20), nullable=True))

def downgrade() -> None:
    op.drop_column('users', 'phone_number')
```

### Drop Column

```python
def upgrade() -> None:
    op.drop_column('projects', 'old_field')

def downgrade() -> None:
    # Must recreate the column in downgrade
    op.add_column('projects', sa.Column('old_field', sa.String(length=100), nullable=True))
```

### Create Table

```python
def upgrade() -> None:
    op.create_table('tags',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

def downgrade() -> None:
    op.drop_table('tags')
```

### Drop Table

```python
def upgrade() -> None:
    op.drop_table('old_table')

def downgrade() -> None:
    # Must recreate entire table structure in downgrade
    op.create_table('old_table',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        # ... all columns
        sa.PrimaryKeyConstraint('id')
    )
```

### Create Index

```python
def upgrade() -> None:
    op.create_index('ix_projects_name', 'projects', ['name'], unique=False)

def downgrade() -> None:
    op.drop_index('ix_projects_name', table_name='projects')
```

**Unique Index:**

```python
def upgrade() -> None:
    op.create_index('ix_users_email', 'users', ['email'], unique=True)

def downgrade() -> None:
    op.drop_index('ix_users_email', table_name='users')
```

**Composite Index:**

```python
def upgrade() -> None:
    op.create_index('ix_projects_user_name', 'projects', ['user_id', 'name'], unique=False)

def downgrade() -> None:
    op.drop_index('ix_projects_user_name', table_name='projects')
```

### Add Foreign Key

```python
def upgrade() -> None:
    op.create_foreign_key(
        'fk_projects_user_id',  # Constraint name
        'projects',             # Source table
        'users',                # Target table
        ['user_id'],            # Source columns
        ['id'],                 # Target columns
        ondelete='CASCADE'      # Delete behavior
    )

def downgrade() -> None:
    op.drop_constraint('fk_projects_user_id', 'projects', type_='foreignkey')
```

**Common `ondelete` Options:**
- `CASCADE`: Delete child records when parent is deleted
- `SET NULL`: Set foreign key to NULL when parent is deleted
- `RESTRICT`: Prevent deletion of parent if children exist

### Rename Column

```python
def upgrade() -> None:
    op.alter_column('users', 'old_name', new_column_name='new_name')

def downgrade() -> None:
    op.alter_column('users', 'new_name', new_column_name='old_name')
```

### Modify Column Type

```python
def upgrade() -> None:
    op.alter_column('users', 'phone_number',
        existing_type=sa.String(length=20),
        type_=sa.String(length=30),
        existing_nullable=True
    )

def downgrade() -> None:
    op.alter_column('users', 'phone_number',
        existing_type=sa.String(length=30),
        type_=sa.String(length=20),
        existing_nullable=True
    )
```

### Add Unique Constraint

```python
def upgrade() -> None:
    op.create_unique_constraint('uq_users_email', 'users', ['email'])

def downgrade() -> None:
    op.drop_constraint('uq_users_email', 'users', type_='unique')
```

### Add Check Constraint

```python
def upgrade() -> None:
    op.create_check_constraint(
        'ck_users_age_positive',
        'users',
        'age > 0'
    )

def downgrade() -> None:
    op.drop_constraint('ck_users_age_positive', 'users', type_='check')
```

## Rollback Process

### Roll Back One Migration

```bash
cd backend && uv run alembic downgrade -1
```

This runs the `downgrade()` function of the most recent migration.

### Roll Back to Specific Revision

```bash
cd backend && uv run alembic downgrade abc123def456
```

Replace `abc123def456` with the target revision ID.

### Roll Back All Migrations

```bash
cd backend && uv run alembic downgrade base
```

**WARNING**: This will drop all tables managed by Alembic. Use with extreme caution.

### View Migration History

```bash
cd backend && uv run alembic history
```

**Output Example:**

```
abc123def456 -> def789ghi012 (head), add projects table
0001_create_users_table -> abc123def456, create users table
<base> -> 0001_create_users_table, Initial migration
```

### View Detailed History with Dates

```bash
cd backend && uv run alembic history --verbose
```

## Troubleshooting

### Error: "Target database is not up to date"

**Cause**: Someone else applied migrations, or you're on a different branch.

**Solution**:
```bash
cd backend && uv run alembic upgrade head
```

### Error: "Can't locate revision identified by 'xyz'"

**Cause**: Migration file is missing or revision chain is broken.

**Solution**:
1. Check all migration files exist in `backend/alembic/versions/`
2. Verify `down_revision` values form a valid chain
3. Check database `alembic_version` table: `SELECT * FROM alembic_version;`

### Error: "No changes in schema detected"

**Cause**: Model changes not detected by Alembic autogenerate.

**Solution**:
1. Verify model is imported in `backend/app/models/__init__.py`
2. Ensure model extends `Base` from `app.models.base`
3. Check model uses `Mapped[type]` syntax
4. Try creating migration manually: `alembic revision -m "description"`

### Error: Connection Refused or Timeout

**Cause**: `DATABASE_URL` is incorrect or Supabase instance is down.

**Solution**:
1. Verify `DATABASE_URL` in `.env` file
2. Check format: `postgresql+asyncpg://user:pass@host:port/dbname`
3. Test connection to Supabase from Supabase dashboard
4. Ensure IP allowlist includes your IP (if configured)

### Error: "relation 'table_name' already exists"

**Cause**: Running migration on database that already has the table.

**Solution**:
1. Check current revision: `alembic current`
2. If table was created manually, stamp database: `alembic stamp head`
3. Or drop table manually and re-run migration

### Model Changes Not Detected

**Cause**: Model not imported before `Base.metadata` is accessed.

**Solution**: Ensure model is imported in one of these locations:
1. `backend/app/models/__init__.py` (recommended)
2. Direct import in `backend/alembic/env.py`

**Example `__init__.py`:**

```python
from app.models.base import Base
from app.models.user import User
from app.models.project import Project
from app.models.tag import Tag

__all__ = ["Base", "User", "Project", "Tag"]
```

## Cloud Supabase Notes

### Connection Details

- **Host**: Available in Supabase project settings under "Database"
- **Port**: Default is `5432` (or `6543` for connection pooling)
- **Database**: `postgres` (default)
- **User**: `postgres` (default)
- **Password**: Set during project creation

### Connection String Format

```
postgresql+asyncpg://postgres:[YOUR-PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres
```

**Direct Connection (for migrations):**
```
postgresql+asyncpg://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### Important Considerations

1. **No Local Database**: This template does NOT use local Supabase instances. All migrations run against cloud Supabase.

2. **Authentication**: This project uses Firebase Auth exclusively. Do NOT use Supabase Auth features or tables.

3. **Standard PostgreSQL**: Supabase is standard PostgreSQL — all normal migration operations work.

4. **Connection Pooling**: For application runtime use connection pooling (`6543`), for migrations use direct connection (`5432`).

5. **IP Allowlist**: If enabled in Supabase, ensure your development machine IP is whitelisted.

### Testing Migrations Safely

**Best Practice**: Create a separate Supabase project for development/testing:

1. Create a new Supabase project (e.g., "myapp-dev")
2. Use its `DATABASE_URL` in your `.env` file during development
3. Test all migrations on dev project first
4. Once verified, run migrations on production project

## Command Reference

### Essential Commands

```bash
# Generate migration from model changes
cd backend && uv run alembic revision --autogenerate -m "description"

# Create empty migration (manual)
cd backend && uv run alembic revision -m "description"

# Apply all pending migrations
cd backend && uv run alembic upgrade head

# Apply specific number of migrations
cd backend && uv run alembic upgrade +2

# Roll back one migration
cd backend && uv run alembic downgrade -1

# Roll back to specific revision
cd backend && uv run alembic downgrade abc123def456

# Show current revision
cd backend && uv run alembic current

# Show migration history
cd backend && uv run alembic history

# Show detailed history
cd backend && uv run alembic history --verbose

# Show pending migrations
cd backend && uv run alembic heads

# Stamp database to specific revision (without running migrations)
cd backend && uv run alembic stamp head
```

### Advanced Commands

```bash
# Show SQL for upgrade (dry run)
cd backend && uv run alembic upgrade head --sql

# Show SQL for downgrade (dry run)
cd backend && uv run alembic downgrade -1 --sql

# Merge multiple heads (if branching occurred)
cd backend && uv run alembic merge heads -m "merge branches"
```

## Completion Checklist

Before considering a migration complete:

- [ ] SQLAlchemy model created or modified in `backend/app/models/`
- [ ] Model imported in `backend/app/models/__init__.py` (if file exists)
- [ ] Migration generated via `alembic revision --autogenerate`
- [ ] Migration file reviewed for correctness (table, columns, indexes, foreign keys)
- [ ] `upgrade()` function verified
- [ ] `downgrade()` function verified (properly reverses changes)
- [ ] Migration applied to database: `alembic upgrade head`
- [ ] Current revision verified: `alembic current`
- [ ] Database schema inspected (via Supabase dashboard or SQL client) to confirm changes
- [ ] Application code updated to use new schema
- [ ] Tests updated and passing
- [ ] Migration tested on development/staging environment before production

## Additional Resources

- Alembic Documentation: https://alembic.sqlalchemy.org/
- SQLAlchemy 2.x Documentation: https://docs.sqlalchemy.org/en/20/
- Supabase Database Documentation: https://supabase.com/docs/guides/database
- PostgreSQL Documentation: https://www.postgresql.org/docs/
