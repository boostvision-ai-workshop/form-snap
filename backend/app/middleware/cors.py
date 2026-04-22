"""Path-aware CORS middleware.

Applies different CORS policies to different path prefixes:
- /f/*  → wide-open (allow_origins=["*"], no credentials)
- everything else → restricted (allow_origins from settings, with credentials)

Starlette's CORSMiddleware cannot be stacked per-path, so we implement a
lightweight custom middleware that checks the path and delegates to the
appropriate policy.
"""

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from starlette.types import ASGIApp


class PathAwareCORSMiddleware(BaseHTTPMiddleware):
    """Apply per-path CORS headers.

    For /f/* paths: wide-open CORS (Origin: * allowed, credentials: false).
    For all other paths: restricted to `allowed_origins` with credentials.
    """

    def __init__(
        self,
        app: ASGIApp,
        *,
        public_path_prefix: str = "/f/",
        allowed_origins: list[str],
    ) -> None:
        super().__init__(app)
        self._public_prefix = public_path_prefix
        self._allowed_origins = allowed_origins

    async def dispatch(self, request: Request, call_next) -> Response:
        origin = request.headers.get("origin", "")
        is_public = request.url.path.startswith(self._public_prefix)

        # Handle preflight OPTIONS early
        if request.method == "OPTIONS" and origin:
            return self._preflight_response(origin, is_public, request)

        response = await call_next(request)

        if origin:
            self._add_cors_headers(response, origin, is_public)

        return response

    def _preflight_response(
        self, origin: str, is_public: bool, request: Request
    ) -> Response:
        headers = {}
        self._add_cors_headers_to_dict(headers, origin, is_public)
        # Add preflight-specific headers
        requested_method = request.headers.get(
            "access-control-request-method", "POST"
        )
        requested_headers = request.headers.get(
            "access-control-request-headers", "content-type"
        )
        headers["access-control-allow-methods"] = (
            "POST, OPTIONS" if is_public else requested_method
        )
        headers["access-control-allow-headers"] = (
            "content-type, accept"
            if is_public
            else requested_headers
        )
        headers["access-control-max-age"] = "600"
        return Response(status_code=204, headers=headers)

    def _add_cors_headers(
        self, response: Response, origin: str, is_public: bool
    ) -> None:
        headers_dict: dict[str, str] = {}
        self._add_cors_headers_to_dict(headers_dict, origin, is_public)
        for key, value in headers_dict.items():
            response.headers[key] = value

    def _add_cors_headers_to_dict(
        self, headers: dict, origin: str, is_public: bool
    ) -> None:
        if is_public:
            # Wide-open for /f/*
            headers["access-control-allow-origin"] = "*"
            # Do NOT set access-control-allow-credentials for wildcard origin
        else:
            # Restricted for /api/v1/*
            if origin in self._allowed_origins or self._allowed_origins == ["*"]:
                headers["access-control-allow-origin"] = origin
                headers["access-control-allow-credentials"] = "true"
            # If origin not in allowed list, don't set the header (browser blocks it)
