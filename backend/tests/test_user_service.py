"""Tests for user service layer."""

import uuid
from datetime import UTC, datetime
from unittest.mock import MagicMock

import pytest

from app.services.user import (
    create_user_from_firebase,
    get_or_create_user,
    get_user_by_firebase_uid,
    update_user,
)


def _make_user(
    firebase_uid: str = "test-uid",
    email: str = "test@example.com",
    display_name: str | None = "Test User",
    avatar_url: str | None = None,
) -> MagicMock:
    """Create a mock User instance for testing."""
    user = MagicMock()
    user.id = uuid.uuid4()
    user.firebase_uid = firebase_uid
    user.email = email
    user.display_name = display_name
    user.avatar_url = avatar_url
    user.created_at = datetime.now(UTC)
    user.updated_at = datetime.now(UTC)
    return user


@pytest.mark.asyncio
async def test_get_user_by_firebase_uid_found(mock_db_session):
    """get_user_by_firebase_uid returns user when found."""
    user = _make_user(firebase_uid="existing-uid")

    result_mock = MagicMock()
    result_mock.scalar_one_or_none.return_value = user
    mock_db_session.execute.return_value = result_mock

    result = await get_user_by_firebase_uid(mock_db_session, "existing-uid")
    assert result is user
    mock_db_session.execute.assert_called_once()


@pytest.mark.asyncio
async def test_get_user_by_firebase_uid_not_found(mock_db_session):
    """get_user_by_firebase_uid returns None when not found."""
    result_mock = MagicMock()
    result_mock.scalar_one_or_none.return_value = None
    mock_db_session.execute.return_value = result_mock

    result = await get_user_by_firebase_uid(mock_db_session, "nonexistent-uid")
    assert result is None


@pytest.mark.asyncio
async def test_create_user_from_firebase(mock_db_session):
    """create_user_from_firebase creates and returns new user."""

    async def mock_refresh(user):
        user.id = uuid.uuid4()
        user.created_at = datetime.now(UTC)
        user.updated_at = datetime.now(UTC)

    mock_db_session.refresh.side_effect = mock_refresh

    user = await create_user_from_firebase(
        mock_db_session,
        firebase_uid="new-uid",
        email="new@example.com",
        display_name="New User",
    )

    assert user.firebase_uid == "new-uid"
    assert user.email == "new@example.com"
    assert user.display_name == "New User"
    mock_db_session.add.assert_called_once()
    mock_db_session.commit.assert_called_once()


@pytest.mark.asyncio
async def test_get_or_create_user_creates_new(mock_db_session):
    """get_or_create_user creates new user when not found."""
    result_mock = MagicMock()
    result_mock.scalar_one_or_none.return_value = None
    mock_db_session.execute.return_value = result_mock

    async def mock_refresh(user):
        user.id = uuid.uuid4()
        user.created_at = datetime.now(UTC)
        user.updated_at = datetime.now(UTC)

    mock_db_session.refresh.side_effect = mock_refresh

    user, created = await get_or_create_user(
        mock_db_session,
        firebase_uid="new-uid",
        email="new@example.com",
        display_name="New User",
    )

    assert created is True
    assert user.firebase_uid == "new-uid"
    assert user.email == "new@example.com"


@pytest.mark.asyncio
async def test_get_or_create_user_returns_existing(mock_db_session):
    """get_or_create_user returns existing user."""
    existing_user = _make_user(
        firebase_uid="existing-uid", email="existing@example.com"
    )

    result_mock = MagicMock()
    result_mock.scalar_one_or_none.return_value = existing_user
    mock_db_session.execute.return_value = result_mock

    user, created = await get_or_create_user(
        mock_db_session,
        firebase_uid="existing-uid",
        email="existing@example.com",
    )

    assert created is False
    assert user is existing_user


@pytest.mark.asyncio
async def test_get_or_create_user_syncs_email(mock_db_session):
    """get_or_create_user updates email if it changed in token."""
    existing_user = _make_user(firebase_uid="uid-1", email="old@example.com")

    result_mock = MagicMock()
    result_mock.scalar_one_or_none.return_value = existing_user
    mock_db_session.execute.return_value = result_mock

    user, created = await get_or_create_user(
        mock_db_session,
        firebase_uid="uid-1",
        email="new@example.com",
    )

    assert created is False
    assert user.email == "new@example.com"
    mock_db_session.commit.assert_called_once()


@pytest.mark.asyncio
async def test_update_user(mock_db_session):
    """update_user updates specified fields."""
    user = _make_user()

    updated = await update_user(mock_db_session, user, display_name="Updated Name")

    assert updated.display_name == "Updated Name"
    mock_db_session.commit.assert_called_once()
