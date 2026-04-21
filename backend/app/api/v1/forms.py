"""Forms CRUD router — /api/v1/forms."""

import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, require_verified_profile
from app.models.user import User
from app.schemas.form import FormCreate, FormListItem, FormResponse, FormUpdate
from app.services import form as form_service

router = APIRouter(prefix="/forms", tags=["forms"])


def _form_to_response(form: object) -> FormResponse:
    """Build FormResponse from a Form ORM object, injecting submit_url and html_snippet."""
    submit_url = form_service._build_submit_url(form.id)  # type: ignore[attr-defined]
    html_snippet = form_service._build_html_snippet(submit_url)
    return FormResponse(
        id=str(form.id),  # type: ignore[attr-defined]
        name=form.name,  # type: ignore[attr-defined]
        redirect_url=form.redirect_url,  # type: ignore[attr-defined]
        submit_url=submit_url,
        html_snippet=html_snippet,
        created_at=form.created_at,  # type: ignore[attr-defined]
        updated_at=form.updated_at,  # type: ignore[attr-defined]
    )


@router.get("", response_model=list[FormListItem])
async def list_forms(
    current_user: User = Depends(require_verified_profile),
    db: AsyncSession = Depends(get_db),
) -> list[FormListItem]:
    """List all non-deleted forms owned by the authenticated user."""
    return await form_service.list_forms(db, current_user.id)


@router.post("", response_model=FormResponse, status_code=201)
async def create_form(
    body: FormCreate,
    current_user: User = Depends(require_verified_profile),
    db: AsyncSession = Depends(get_db),
) -> FormResponse:
    """Create a new form. Requires verified email (AT-022 / AT-023)."""
    redirect_url_str: str | None = None
    if body.redirect_url is not None:
        redirect_url_str = str(body.redirect_url)

    form = await form_service.create_form(
        db,
        owner_id=current_user.id,
        name=body.name,
        redirect_url=redirect_url_str,
    )
    return _form_to_response(form)


@router.patch("/{form_id}", response_model=FormResponse)
async def update_form(
    form_id: uuid.UUID,
    body: FormUpdate,
    current_user: User = Depends(require_verified_profile),
    db: AsyncSession = Depends(get_db),
) -> FormResponse:
    """Update name and/or redirect_url for an owned form (AT-006a)."""
    # Determine whether redirect_url was explicitly set (even to None)
    clear_redirect = "redirect_url" in body.model_fields_set and body.redirect_url is None
    redirect_url_str: str | None = None
    if body.redirect_url is not None:
        redirect_url_str = str(body.redirect_url)

    form = await form_service.update_form(
        db,
        owner_id=current_user.id,
        form_id=form_id,
        name=body.name,
        redirect_url=redirect_url_str,
        clear_redirect_url=clear_redirect,
    )
    if form is None:
        raise HTTPException(status_code=404, detail="form_not_found")
    return _form_to_response(form)


@router.delete("/{form_id}", status_code=204)
async def delete_form(
    form_id: uuid.UUID,
    current_user: User = Depends(require_verified_profile),
    db: AsyncSession = Depends(get_db),
) -> None:
    """Soft-delete a form and hard-delete its submissions (AT-005 / AT-006)."""
    deleted = await form_service.delete_form(db, owner_id=current_user.id, form_id=form_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="form_not_found")
