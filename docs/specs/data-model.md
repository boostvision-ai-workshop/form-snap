# Data Model Specification: FormSnap

> Three entities: `profile` (Firebase mirror), `form` (owned endpoint), `submission` (opaque payload).
> Per `technical-spec.md` §2.3, the `profile` entity reuses the existing `users` table; we add one column (`email_verified`) via migration `0002`. Two new tables (`forms`, `submissions`) are added in `0003` and `0004`.

> **Reconciliation note (2026-04-22)**: Batches 1–4 have been shipped; migrations `0001` → `0004` exist in `backend/alembic/versions/` and match this spec. PRD §0 "Visual Assets" was added after ship — it is a presentation-layer declaration and has **zero impact on schema, columns, indexes, constraints, or migrations**. No change to this document was required beyond this reconciliation note.

---

## 1. Entity: profile (table: `users` — existing)

Backend-side mirror of the Firebase user. Foreign-key target for `forms.owner_id`. Provisioned lazily on first authenticated API call.

### Table: `users`

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| `id` | UUID | PRIMARY KEY, `default uuid4()` | Server-assigned profile id |
| `firebase_uid` | String(128) | NOT NULL, UNIQUE, INDEX | Firebase Auth UID; lookup key for token verification |
| `email` | String(255) | NOT NULL, INDEX | Notification destination; mirrors token claim |
| `email_verified` | Boolean | NOT NULL, default `false` | **NEW (added in 0002)** — mirrors Firebase `email_verified` claim; gates form creation |
| `display_name` | String(255) | NULL | Existing scaffolding column — kept for compatibility |
| `avatar_url` | String(2048) | NULL | Existing scaffolding column — kept for compatibility |
| `created_at` | DateTime(tz=True) | NOT NULL, server_default `now()` | Account creation |
| `updated_at` | DateTime(tz=True) | NOT NULL, server_default `now()`, onupdate `now()` | Last sync |

### Indexes

| Name | Columns | Unique | Purpose |
|------|---------|--------|---------|
| `ix_users_firebase_uid` (existing) | `firebase_uid` | YES | Login resolution |
| `ix_users_email` (existing) | `email` | NO | Application-level uniqueness check before insert; analytics; NOT a DB-enforced unique constraint (Firebase handles real-world uniqueness; defense-in-depth at the app layer is via `get_or_create_user`) |

### Relationships

- One-to-many with `form` via `forms.owner_id` (`back_populates="forms"`).

### Lifecycle

- **Insert**: `get_or_create_user` on first authenticated request resolves UID → row, creating if absent.
- **Update**: every `/api/v1/me` call re-syncs `email` and `email_verified` from the decoded Firebase claim.
- **Delete**: out of MVP scope (Firebase account deletion is not exposed in dashboard).

### SQLAlchemy model snippet

```python
# backend/app/models/user.py — modified
import uuid
from datetime import datetime
from sqlalchemy import Boolean, DateTime, String, func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    firebase_uid: Mapped[str] = mapped_column(
        String(128), unique=True, nullable=False, index=True
    )
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    email_verified: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default=sa.text("false")
    )
    display_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    forms: Mapped[list["Form"]] = relationship(
        back_populates="owner", cascade="all, delete-orphan"
    )
```

### Tenant-isolation note

The `User` row is the canonical owner. Every owner-scoped service function takes `owner_id: UUID` (the `User.id`, NOT the `firebase_uid`) and filters by it. Routes never pass a raw Firebase UID into a query.

---

## 2. Entity: form (table: `forms` — new)

A logical "endpoint" the owner exposes for submissions. The form's `id` UUID, in its standard string form, IS the public `formId` in `POST /f/{formId}`.

### Table: `forms`

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| `id` | UUID | PRIMARY KEY, `default uuid4()` | Public `formId` (URL-safe by virtue of being a UUID string) |
| `owner_id` | UUID | NOT NULL, FK → `users.id` ON DELETE CASCADE, INDEX | Form owner |
| `name` | String(255) | NOT NULL | Human label, shown in dashboard + email subject |
| `redirect_url` | String(2048) | NULL | Optional default redirect after submission |
| `created_at` | DateTime(tz=True) | NOT NULL, server_default `now()` | Creation time |
| `updated_at` | DateTime(tz=True) | NOT NULL, server_default `now()`, onupdate `now()` | Last edit |
| `deleted_at` | DateTime(tz=True) | NULL | Soft-delete tombstone — when set, row is treated as non-existent for ALL reads (dashboard + public ingest) |

### Indexes

| Name | Columns | Unique | Purpose |
|------|---------|--------|---------|
| `ix_forms_owner_id` | `owner_id` | NO | List-by-owner queries (dashboard form list) |
| `ix_forms_owner_id_deleted_at` | `(owner_id, deleted_at)` | NO | Live-only filter when listing forms; partial index on `deleted_at IS NULL` is a future optimization but not required at MVP scale |

### Constraints

- `name`: enforced non-empty at the application layer (`Pydantic` `min_length=1, max_length=255`); DB allows any non-null string.
- `redirect_url`: enforced http(s)-absolute at the application layer; DB allows any non-null string up to 2048 chars.

### Relationships

- Many-to-one with `users` via `owner_id` (`back_populates="forms"`).
- One-to-many with `submissions` via `submissions.form_id` (`back_populates="form"`, `cascade="all, delete-orphan"`).

### Lifecycle

- **Create**: `POST /api/v1/forms` (requires verified email). Server generates `id`.
- **Update**: `PATCH /api/v1/forms/{id}` (owner only). `name` and `redirect_url` are mutable.
- **Delete**: `DELETE /api/v1/forms/{id}` (owner only). Service explicitly deletes child submissions, then sets `deleted_at = now()` on the form. Subsequent reads (including `POST /f/{id}`) return 404.
- **Public lookup**: `POST /f/{id}` filters `deleted_at IS NULL`.

### SQLAlchemy model snippet

```python
# backend/app/models/form.py — NEW
import uuid
from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class Form(Base):
    __tablename__ = "forms"

    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    owner_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    redirect_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    deleted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    owner: Mapped["User"] = relationship(back_populates="forms")
    submissions: Mapped[list["Submission"]] = relationship(
        back_populates="form", cascade="all, delete-orphan"
    )
```

---

## 3. Entity: submission (table: `submissions` — new)

One captured form submission. `data` is opaque JSON (the user defines the field shape).

### Table: `submissions`

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| `id` | UUID | PRIMARY KEY, `default uuid4()` | Submission id |
| `form_id` | UUID | NOT NULL, FK → `forms.id` ON DELETE CASCADE, INDEX (composite below) | Parent form |
| `data` | JSONB | NOT NULL, default `'{}'::jsonb` | Submitted payload, with reserved keys (`_redirect`, `_gotcha`) stripped |
| `email_status` | String(16) | NOT NULL, default `'pending'`, CHECK in (`'pending'`, `'sent'`, `'failed'`) | Notification email outcome (CHECK enforced via Postgres CHECK or via an Enum type — see migration §5.3) |
| `email_attempts` | Integer | NOT NULL, default `0`, CHECK `email_attempts >= 0 AND email_attempts <= 3` | Retry counter |
| `created_at` | DateTime(tz=True) | NOT NULL, server_default `now()` | Submission acceptance time (= `submitted_at` in CSV / API responses) |

### Indexes

| Name | Columns | Unique | Purpose |
|------|---------|--------|---------|
| `ix_submissions_form_id_created_at` | `(form_id, created_at DESC)` | NO | Inbox pagination (newest first) and CSV stream |
| `ix_submissions_email_status` | `email_status` | NO | Future "re-drive failed emails" job; small operational benefit |

### Relationships

- Many-to-one with `forms` via `form_id` (`back_populates="submissions"`).

### Lifecycle

- **Create**: `POST /f/{formId}` after honeypot, body-size, and form-existence checks pass. Created with `email_status='pending'`, `email_attempts=0`.
- **Email update**: `send_notification_with_retry` updates `email_status` and `email_attempts`.
- **Delete**: only via parent form deletion (cascade).

### SQLAlchemy model snippet

```python
# backend/app/models/submission.py — NEW
import uuid
from datetime import datetime
from sqlalchemy import (
    CheckConstraint, DateTime, ForeignKey, Integer, String, func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class Submission(Base):
    __tablename__ = "submissions"
    __table_args__ = (
        CheckConstraint(
            "email_status IN ('pending', 'sent', 'failed')",
            name="ck_submissions_email_status",
        ),
        CheckConstraint(
            "email_attempts >= 0 AND email_attempts <= 3",
            name="ck_submissions_email_attempts_range",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    form_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("forms.id", ondelete="CASCADE"),
        nullable=False,
    )
    data: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    email_status: Mapped[str] = mapped_column(
        String(16), nullable=False, server_default="pending"
    )
    email_attempts: Mapped[int] = mapped_column(
        Integer, nullable=False, server_default="0"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    form: Mapped["Form"] = relationship(back_populates="submissions")
```

---

## 4. Relationship Diagram

```
User (1) ─────< (N) Form (1) ─────< (N) Submission
   id PK              id PK                 id PK
   firebase_uid       owner_id FK→User.id   form_id FK→Form.id (ON DELETE CASCADE)
   email              name                  data (JSONB)
   email_verified     redirect_url          email_status
   display_name       deleted_at            email_attempts
   avatar_url         created_at            created_at
   created_at         updated_at
   updated_at
```

---

## 5. Alembic Migration Plan

Migrations execute in strict numeric order. Each is reversible.

### 5.1 Migration `0002_add_email_verified_to_users.py`

- **Revision**: `0002`
- **Down revision**: `0001`
- **Depends on**: existing `users` table
- **Upgrade**: `op.add_column("users", sa.Column("email_verified", sa.Boolean(), nullable=False, server_default=sa.text("false")))`. Then `op.alter_column("users", "email_verified", server_default=None)` to remove the now-redundant default for future inserts (model-level default still applies).
- **Downgrade**: `op.drop_column("users", "email_verified")`.
- **Risk**: `nullable=False` on a new column requires the `server_default`. Safe for empty + populated tables.

### 5.2 Migration `0003_create_forms_table.py`

- **Revision**: `0003`
- **Down revision**: `0002`
- **Depends on**: `users` table
- **Upgrade**:
  ```python
  op.create_table(
      "forms",
      sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
      sa.Column("owner_id", postgresql.UUID(as_uuid=True), nullable=False),
      sa.Column("name", sa.String(255), nullable=False),
      sa.Column("redirect_url", sa.String(2048), nullable=True),
      sa.Column("created_at", sa.DateTime(timezone=True),
                server_default=sa.func.now(), nullable=False),
      sa.Column("updated_at", sa.DateTime(timezone=True),
                server_default=sa.func.now(), nullable=False),
      sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
      sa.ForeignKeyConstraint(["owner_id"], ["users.id"], ondelete="CASCADE"),
      sa.PrimaryKeyConstraint("id"),
  )
  op.create_index("ix_forms_owner_id", "forms", ["owner_id"])
  op.create_index("ix_forms_owner_id_deleted_at", "forms", ["owner_id", "deleted_at"])
  ```
- **Downgrade**: drop indexes, drop table.

### 5.3 Migration `0004_create_submissions_table.py`

- **Revision**: `0004`
- **Down revision**: `0003`
- **Depends on**: `forms` table
- **Upgrade**:
  ```python
  op.create_table(
      "submissions",
      sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
      sa.Column("form_id", postgresql.UUID(as_uuid=True), nullable=False),
      sa.Column("data", postgresql.JSONB, nullable=False, server_default=sa.text("'{}'::jsonb")),
      sa.Column("email_status", sa.String(16), nullable=False, server_default="pending"),
      sa.Column("email_attempts", sa.Integer, nullable=False, server_default="0"),
      sa.Column("created_at", sa.DateTime(timezone=True),
                server_default=sa.func.now(), nullable=False),
      sa.ForeignKeyConstraint(["form_id"], ["forms.id"], ondelete="CASCADE"),
      sa.PrimaryKeyConstraint("id"),
      sa.CheckConstraint(
          "email_status IN ('pending', 'sent', 'failed')",
          name="ck_submissions_email_status",
      ),
      sa.CheckConstraint(
          "email_attempts >= 0 AND email_attempts <= 3",
          name="ck_submissions_email_attempts_range",
      ),
  )
  op.create_index(
      "ix_submissions_form_id_created_at",
      "submissions",
      ["form_id", sa.text("created_at DESC")],
  )
  op.create_index("ix_submissions_email_status", "submissions", ["email_status"])
  ```
- **Downgrade**: drop indexes, drop table.

### 5.4 Migration ordering

```
0001 (existing) — users
   ↓
0002 — add users.email_verified
   ↓
0003 — create forms (FK → users)
   ↓
0004 — create submissions (FK → forms)
```

---

## 6. Data Access Patterns

| Caller | Service function | Query shape |
|--------|------------------|-------------|
| `GET /api/v1/me` | `get_or_create_user` | `SELECT * FROM users WHERE firebase_uid=?` (then INSERT if null); UPDATE on email/email_verified change |
| `GET /api/v1/forms` | `list_forms` | `SELECT forms.*, COUNT(submissions.id), MAX(submissions.created_at) FROM forms LEFT JOIN submissions ON submissions.form_id=forms.id WHERE forms.owner_id=? AND forms.deleted_at IS NULL GROUP BY forms.id ORDER BY forms.created_at DESC` |
| `POST /api/v1/forms` | `create_form` | INSERT into forms |
| `PATCH /api/v1/forms/{id}` | `get_form_for_owner` then UPDATE | `SELECT … WHERE id=? AND owner_id=? AND deleted_at IS NULL`; UPDATE on found |
| `DELETE /api/v1/forms/{id}` | `delete_form` | `DELETE FROM submissions WHERE form_id=?`; `UPDATE forms SET deleted_at=now() WHERE id=? AND owner_id=?` |
| `POST /f/{formId}` | `get_form_for_public_submit`, `persist_submission` | `SELECT … WHERE id=? AND deleted_at IS NULL`; INSERT submission |
| `GET /api/v1/forms/{id}/submissions` | `get_form_for_owner`, `list_submissions` | ownership check; `SELECT … FROM submissions WHERE form_id=? ORDER BY created_at DESC LIMIT ? OFFSET ?` |
| `GET /api/v1/forms/{id}/submissions.csv` | `get_form_for_owner`, `stream_submissions_csv` | ownership check; same as above WITHOUT LIMIT, streamed via async cursor (`stream_results=True` / `yield_per(500)`) |
| Background `send_notification_with_retry` | `mark_email_status` | `SELECT submission JOIN form JOIN owner`; `UPDATE submissions SET email_status=?, email_attempts=email_attempts+1 WHERE id=?` |

---

## 7. Tenant-Isolation Invariant

Every dashboard read or mutation goes through `get_form_for_owner(db, owner_id, form_id)`. The service returns `None` when the form's `owner_id` does not match — the route maps `None` to **404**, never **403**, to avoid leaking the existence of someone else's form.

The public `POST /f/{formId}` is the only path that bypasses owner scoping; it has its own dedicated service `get_form_for_public_submit` that filters only by `id` and `deleted_at IS NULL`.

There is NO endpoint that exposes a `submission` without going through its parent `form`'s ownership check.

---

## 8. Retention & Backups

- Submissions: retained indefinitely in MVP. PRD §4 explicitly defers retention policy.
- Backups: rely on Supabase's built-in daily backups. No application-level backup process.
- Deleted forms: tombstoned via `deleted_at` (form row kept), but their submissions are physically deleted at delete time (decision §4.4 in `technical-spec.md`).
