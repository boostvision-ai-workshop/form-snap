"""Pydantic schemas for form CRUD endpoints."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, model_validator


class FormCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    redirect_url: HttpUrl | None = None


class FormUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    redirect_url: HttpUrl | None = None

    @model_validator(mode="after")
    def at_least_one(self) -> "FormUpdate":
        if self.name is None and "redirect_url" not in self.model_fields_set:
            raise ValueError("at least one field must be provided")
        return self


class FormResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    redirect_url: str | None
    submit_url: str
    html_snippet: str
    created_at: datetime
    updated_at: datetime


class FormListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    redirect_url: str | None = None
    submission_count: int
    last_submission_at: datetime | None = None
    submit_url: str
    created_at: datetime
    updated_at: datetime
