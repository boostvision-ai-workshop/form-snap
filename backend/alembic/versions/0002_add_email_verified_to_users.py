"""add email_verified to users

Revision ID: 0002
Revises: 0001
Create Date: 2026-04-21
"""

import sqlalchemy as sa

from alembic import op

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    is_sqlite = bind.dialect.name == "sqlite"

    if is_sqlite:
        # SQLite cannot ALTER COLUMN outside a batch operation.
        # Use batch_alter_table to add the column; server_default removal is
        # skipped because SQLite doesn't enforce it at the DB level.
        with op.batch_alter_table("users") as batch_op:
            batch_op.add_column(
                sa.Column(
                    "email_verified",
                    sa.Boolean(),
                    nullable=False,
                    server_default=sa.text("0"),
                )
            )
    else:
        op.add_column(
            "users",
            sa.Column(
                "email_verified",
                sa.Boolean(),
                nullable=False,
                server_default=sa.text("false"),
            ),
        )
        # Remove the server_default so future inserts rely on the model-level default
        op.alter_column("users", "email_verified", server_default=None)


def downgrade() -> None:
    bind = op.get_bind()
    is_sqlite = bind.dialect.name == "sqlite"

    if is_sqlite:
        with op.batch_alter_table("users") as batch_op:
            batch_op.drop_column("email_verified")
    else:
        op.drop_column("users", "email_verified")
