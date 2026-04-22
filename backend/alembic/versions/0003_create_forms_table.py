"""create forms table

Revision ID: 0003
Revises: 0002
Create Date: 2026-04-21
"""

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    is_sqlite = bind.dialect.name == "sqlite"

    uuid_type = sa.Text() if is_sqlite else postgresql.UUID(as_uuid=True)

    op.create_table(
        "forms",
        sa.Column("id", uuid_type, nullable=False),
        sa.Column("owner_id", uuid_type, nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("redirect_url", sa.String(2048), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["owner_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_forms_owner_id", "forms", ["owner_id"])
    op.create_index("ix_forms_owner_id_deleted_at", "forms", ["owner_id", "deleted_at"])


def downgrade() -> None:
    op.drop_index("ix_forms_owner_id_deleted_at", table_name="forms")
    op.drop_index("ix_forms_owner_id", table_name="forms")
    op.drop_table("forms")
