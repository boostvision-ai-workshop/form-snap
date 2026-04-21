# Base stage with uv
FROM python:3.12-slim AS base
RUN pip install uv
WORKDIR /app
ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy

# Dependencies stage
FROM base AS deps
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-install-project

# Development target
FROM base AS development
COPY --from=deps /app/.venv /app/.venv
COPY . .
EXPOSE 8000
ENV PATH="/app/.venv/bin:$PATH"
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# Production target
FROM base AS production

# Create non-root user
RUN addgroup --system --gid 1001 appuser && \
    adduser --system --uid 1001 appuser

COPY --from=deps --chown=appuser:appuser /app/.venv /app/.venv
COPY --chown=appuser:appuser . .

USER appuser

EXPOSE 8000
ENV PATH="/app/.venv/bin:$PATH" \
    PYTHONUNBUFFERED=1

CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
