"""BodySizeLimitMiddleware — enforce a maximum request body size on matching paths.

Applied to /f/* routes (public ingest). Returns 413 with the public-endpoint
error shape when the limit is exceeded.

Uses a pure ASGI middleware (not BaseHTTPMiddleware) to avoid body-caching
issues with Starlette's request stream. The body is read once, checked, and
re-injected via a patched receive callable before passing to the next handler.
"""

import json


class BodySizeLimitMiddleware:
    """ASGI middleware that enforces a body size limit on paths matching path_prefix.

    Implementation as a pure ASGI app (not BaseHTTPMiddleware) so that body
    bytes are correctly re-injected for downstream handlers via the receive
    channel — Starlette BaseHTTPMiddleware has caching behaviour that can
    interfere with form() / json() parsing.
    """

    def __init__(
        self,
        app,
        *,
        max_bytes: int,
        path_prefix: str = "/f/",
    ) -> None:
        self.app = app
        self._max_bytes = max_bytes
        self._path_prefix = path_prefix

    async def __call__(self, scope, receive, send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        path = scope.get("path", "")
        if not path.startswith(self._path_prefix):
            await self.app(scope, receive, send)
            return

        # Fast path: Content-Length header present
        headers = dict(scope.get("headers", []))
        content_length = headers.get(b"content-length")
        if content_length is not None:
            try:
                if int(content_length) > self._max_bytes:
                    await self._send_413(send)
                    return
            except (ValueError, TypeError):
                pass  # Malformed header — let the endpoint handle it

        # Slow path: buffer the body and count bytes
        body_chunks: list[bytes] = []
        total = 0
        too_large = False

        # Drain the receive channel to buffer the full body
        while True:
            message = await receive()
            if message["type"] == "http.request":
                chunk = message.get("body", b"")
                total += len(chunk)
                if total > self._max_bytes:
                    too_large = True
                    break
                body_chunks.append(chunk)
                if not message.get("more_body", False):
                    break
            elif message["type"] == "http.disconnect":
                break

        if too_large:
            await self._send_413(send)
            return

        # Re-inject the buffered body via a wrapped receive callable
        full_body = b"".join(body_chunks)
        body_sent = False

        async def receive_with_body():
            nonlocal body_sent
            if not body_sent:
                body_sent = True
                return {"type": "http.request", "body": full_body, "more_body": False}
            # Subsequent reads get a disconnect
            return {"type": "http.disconnect"}

        await self.app(scope, receive_with_body, send)

    async def _send_413(self, send) -> None:
        body = json.dumps({"ok": False, "error": "payload_too_large"}).encode()
        await send(
            {
                "type": "http.response.start",
                "status": 413,
                "headers": [
                    [b"content-type", b"application/json"],
                    [b"content-length", str(len(body)).encode()],
                ],
            }
        )
        await send(
            {
                "type": "http.response.body",
                "body": body,
                "more_body": False,
            }
        )
