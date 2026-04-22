"""Form service layer — create, list, get, update, delete with tenant isolation."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.form import Form
from app.schemas.form import FormListItem


def _build_submit_url(form_id: uuid.UUID) -> str:
    base = settings.PUBLIC_SUBMIT_BASE_URL.rstrip("/")
    return f"{base}/f/{form_id}"


def _build_html_snippet(submit_url: str) -> str:
    return (
        f'<form action="{submit_url}" method="POST">\n'
        '  <input name="name" type="text" required />\n'
        '  <input name="email" type="email" required />\n'
        '  <textarea name="message"></textarea>\n'
        '  <input type="text" name="_gotcha" style="display:none" />\n'
        '  <button type="submit">Send</button>\n'
        "</form>"
    )


async def create_form(
    db: AsyncSession,
    owner_id: uuid.UUID,
    name: str,
    redirect_url: str | None,
) -> Form:
    """Create a new form for the given owner."""
    form = Form(
        owner_id=owner_id,
        name=name,
        redirect_url=redirect_url,
    )
    db.add(form)
    await db.commit()
    await db.refresh(form)
    return form


async def list_forms(
    db: AsyncSession,
    owner_id: uuid.UUID,
) -> list[FormListItem]:
    """Return all non-deleted forms owned by owner_id with submission stats."""
    from app.models.submission import Submission

    stmt = (
        select(
            Form.id,
            Form.name,
            Form.redirect_url,
            Form.created_at,
            Form.updated_at,
            func.count(Submission.id).label("submission_count"),
            func.max(Submission.created_at).label("last_submission_at"),
        )
        .outerjoin(Submission, Submission.form_id == Form.id)
        .where(Form.owner_id == owner_id, Form.deleted_at.is_(None))
        .group_by(Form.id)
        .order_by(Form.created_at.desc())
    )
    result = await db.execute(stmt)
    rows = result.all()

    items: list[FormListItem] = []
    for row in rows:
        submit_url = _build_submit_url(row.id)
        items.append(
            FormListItem(
                id=str(row.id),
                name=row.name,
                redirect_url=row.redirect_url,
                submission_count=row.submission_count,
                last_submission_at=row.last_submission_at,
                submit_url=submit_url,
                created_at=row.created_at,
                updated_at=row.updated_at,
            )
        )
    return items


async def get_form_for_owner(
    db: AsyncSession,
    owner_id: uuid.UUID,
    form_id: uuid.UUID,
) -> Form | None:
    """Return a non-deleted form only if owned by owner_id. Returns None otherwise."""
    stmt = select(Form).where(
        Form.id == form_id,
        Form.owner_id == owner_id,
        Form.deleted_at.is_(None),
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_form_for_public_submit(
    db: AsyncSession,
    form_id: uuid.UUID,
) -> Form | None:
    """Return a non-deleted form by id without owner check (public submit path)."""
    stmt = select(Form).where(
        Form.id == form_id,
        Form.deleted_at.is_(None),
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def update_form(
    db: AsyncSession,
    owner_id: uuid.UUID,
    form_id: uuid.UUID,
    *,
    name: str | None = None,
    redirect_url: str | None = None,
    clear_redirect_url: bool = False,
) -> Form | None:
    """Update name and/or redirect_url for an owned form. Returns None if not found."""
    form = await get_form_for_owner(db, owner_id, form_id)
    if form is None:
        return None

    if name is not None:
        form.name = name
    if clear_redirect_url:
        form.redirect_url = None
    elif redirect_url is not None:
        form.redirect_url = redirect_url

    await db.commit()
    await db.refresh(form)
    return form


async def delete_form(
    db: AsyncSession,
    owner_id: uuid.UUID,
    form_id: uuid.UUID,
) -> bool:
    """Soft-delete the form and hard-delete its submissions. Returns False if not found."""
    from sqlalchemy import delete as sql_delete

    from app.models.submission import Submission

    form = await get_form_for_owner(db, owner_id, form_id)
    if form is None:
        return False

    # Hard-delete all submissions for this form
    await db.execute(sql_delete(Submission).where(Submission.form_id == form_id))

    # Soft-delete the form
    form.deleted_at = datetime.now(tz=timezone.utc)
    await db.commit()
    return True
