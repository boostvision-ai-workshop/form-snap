import logging

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.config import settings
from app.core.mock_provider import verify_mock_token

logger = logging.getLogger(__name__)

security = HTTPBearer()


def verify_firebase_token(token: str) -> dict:
    """Verify a Firebase ID token and return decoded claims.

    This name is kept as a module-level symbol so that existing tests can patch
    ``app.core.security.verify_firebase_token`` without modification.
    """
    from app.core.firebase import verify_firebase_token as _firebase_verify

    return _firebase_verify(token)


def _verify_firebase_with_error_handling(token: str) -> dict:
    """Call verify_firebase_token and map Firebase exceptions to HTTP 401."""
    from firebase_admin import auth as firebase_auth

    try:
        return verify_firebase_token(token)
    except firebase_auth.ExpiredIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except firebase_auth.RevokedIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except firebase_auth.InvalidIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except ValueError:
        # Firebase Admin SDK not initialized
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication service unavailable",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Authentication failed: %s", e)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed",
            headers={"WWW-Authenticate": "Bearer"},
        )


def _verify_mock_with_error_handling(token: str) -> dict:
    """Verify a mock: token for local development."""
    try:
        return verify_mock_token(token)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid mock token: {exc}",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """Verify ID token using the configured auth provider and return decoded claims."""
    token = credentials.credentials
    if settings.AUTH_PROVIDER == "mock":
        return _verify_mock_with_error_handling(token)
    return _verify_firebase_with_error_handling(token)


security_optional = HTTPBearer(auto_error=False)


async def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials | None = Depends(security_optional),
) -> dict | None:
    """Optionally verify token. Returns None if no token provided."""
    if credentials is None:
        return None
    try:
        token = credentials.credentials
        if settings.AUTH_PROVIDER == "mock":
            return _verify_mock_with_error_handling(token)
        return _verify_firebase_with_error_handling(token)
    except HTTPException:
        return None
