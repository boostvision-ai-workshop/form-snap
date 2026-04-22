"""create submissions table

Revision ID: 0004
Revises: 0003
Create Date: 2026-04-21
"""

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision = "0004"
down_revision = "0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    is_sqlite = bind.dialect.name == "sqlite"

    uuid_type = sa.Text() if is_sqlite else postgresql.UUID(as_uuid=True)
    # JSONB on Postgres; plain JSON on SQLite
    json_type = sa.JSON() if is_sqlite else postgresql.JSONB(astext_type=sa.Text())
    # SQLite does not support the ::jsonb cast syntax in server_default
    json_server_default = sa.text("'{}'") if is_sqlite else sa.text("'{}'::jsonb")

    op.create_table(
        "submissions",
        sa.Column("id", uuid_type, nullable=False),
        sa.Column("form_id", uuid_type, nullable=False),
        sa.Column(
            "data",
            json_type,
            nullable=False,
            server_default=json_server_default,
        ),
        sa.Column(
            "email_status",
            sa.String(16),
            nullable=False,
            server_default="pending",
        ),
        sa.Column(
            "email_attempts",
            sa.Integer(),
            nullable=False,
            server_default="0",
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.CheckConstraint(
            "email_status IN ('pending', 'sent', 'failed')",
            name="ck_submissions_email_status",
        ),
        sa.CheckConstraint(
            "email_attempts >= 0 AND email_attempts <= 3",
            name="ck_submissions_email_attempts_range",
        ),
        sa.ForeignKeyConstraint(["form_id"], ["forms.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    if is_sqlite:
        # SQLite does not support DESC in multi-column index definitions the
        # same way; fall back to a plain index on (form_id, created_at).
        op.create_index(
            "ix_submissions_form_id_created_at",
            "submissions",
            ["form_id", "created_at"],
        )
    else:
        op.create_index(
            "ix_submissions_form_id_created_at",
            "submissions",
            ["form_id", sa.text("created_at DESC")],
        )

    op.create_index(
        "ix_submissions_email_status",
        "submissions",
        ["email_status"],
    )


def downgrade() -> None:
    op.drop_index("ix_submissions_email_status", table_name="submissions")
    op.drop_index("ix_submissions_form_id_created_at", table_name="submissions")
    op.drop_table("submissions")
