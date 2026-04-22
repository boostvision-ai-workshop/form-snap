from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.public.router import router as public_router
from app.api.v1.router import api_router
from app.config import settings
from app.middleware.body_size_limit import BodySizeLimitMiddleware
from app.middleware.cors import PathAwareCORSMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan,
)

# --- Middleware (added in reverse execution order) ---

# 1. Body-size limit for /f/* — runs before body parsing in route handlers.
#    Must be innermost (added last) so it runs before CORS inspection.
app.add_middleware(
    BodySizeLimitMiddleware,
    max_bytes=settings.MAX_BODY_BYTES,
    path_prefix="/f/",
)

# 2. Path-aware CORS:
#    - /f/*      → allow_origins=["*"], no credentials
#    - /api/v1/* → allow_origins from BACKEND_CORS_ORIGINS, with credentials
app.add_middleware(
    PathAwareCORSMiddleware,
    public_path_prefix="/f/",
    allowed_origins=settings.BACKEND_CORS_ORIGINS,
)

# --- Routers ---

# Public submission endpoint: mounted at root (NOT under /api/v1)
app.include_router(public_router)

# Authenticated dashboard API
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/")
async def root():
    return {"message": "API is running"}
