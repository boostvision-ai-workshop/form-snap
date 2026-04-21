"""Smoke tests for health and root endpoints."""

import pytest


@pytest.mark.asyncio
async def test_health_endpoint(client):
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"


@pytest.mark.asyncio
async def test_root_endpoint(client):
    response = await client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "API is running"


@pytest.mark.asyncio
async def test_cors_headers(client):
    response = await client.options(
        "/api/v1/health",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "GET",
        },
    )
    # PathAwareCORSMiddleware returns 204 No Content for OPTIONS preflight
    assert response.status_code in (200, 204)
    assert "access-control-allow-origin" in response.headers
