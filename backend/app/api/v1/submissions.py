"""Submissions router — GET /api/v1/forms/{formId}/submissions and .csv."""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, require_verified_profile
from app.models.user import User
from app.schemas.submission import SubmissionPage
from app.services import submission as submission_service

router = APIRouter(tags=["submissions"])


@router.get(
    "/forms/{form_id}/submissions",
    response_model=SubmissionPage,
)
async def list_submissions(
    form_id: uuid.UUID,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=25, ge=1, le=100),
    current_user: User = Depends(require_verified_profile),
    db: AsyncSession = Depends(get_db),
) -> SubmissionPage:
    """Paginated submission inbox for a form owned by the authenticated user (AT-015, AT-016)."""
    result = await submission_service.list_submissions(
        db,
        owner_id=current_user.id,
        form_id=form_id,
        page=page,
        page_size=page_size,
    )
    if result is None:
        raise HTTPException(status_code=404, detail="form_not_found")
    return result


@router.get("/forms/{form_id}/submissions.csv")
async def export_submissions_csv(
    form_id: uuid.UUID,
    current_user: User = Depends(require_verified_profile),
    db: AsyncSession = Depends(get_db),
) -> StreamingResponse:
    """Stream all submissions as a CSV file download (AT-017, AT-018)."""
    result = await submission_service.stream_submissions_csv(
        db,
        owner_id=current_user.id,
        form_id=form_id,
    )
    if result is None:
        raise HTTPException(status_code=404, detail="form_not_found")

    generator, filename = result
    return StreamingResponse(
        generator,
        media_type="text/csv; charset=utf-8",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
        },
    )
