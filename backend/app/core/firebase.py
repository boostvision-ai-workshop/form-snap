import json
import logging
from functools import lru_cache

import firebase_admin
from firebase_admin import auth, credentials

from app.config import settings

logger = logging.getLogger(__name__)


@lru_cache
def _initialize_firebase() -> firebase_admin.App | None:
    """Initialize Firebase Admin SDK. Lazy - only called when first needed."""
    if firebase_admin._apps:
        return firebase_admin.get_app()

    cred = None
    if settings.FIREBASE_SERVICE_ACCOUNT_JSON:
        try:
            service_account_info = json.loads(settings.FIREBASE_SERVICE_ACCOUNT_JSON)
            cred = credentials.Certificate(service_account_info)
        except (json.JSONDecodeError, ValueError) as e:
            logger.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON: %s", e)
            return None
    elif settings.FIREBASE_CREDENTIALS_PATH:
        try:
            cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
        except Exception as e:
            logger.error("Failed to load Firebase credentials from path: %s", e)
            return None
    else:
        logger.warning(
            "No Firebase credentials configured. "
            "Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_CREDENTIALS_PATH."
        )
        return None

    try:
        return firebase_admin.initialize_app(cred)
    except Exception as e:
        logger.error("Failed to initialize Firebase Admin SDK: %s", e)
        return None


def verify_firebase_token(token: str) -> dict:
    """Verify a Firebase ID token and return the decoded claims."""
    app = _initialize_firebase()
    if app is None:
        raise ValueError("Firebase Admin SDK is not initialized")
    return auth.verify_id_token(token)
