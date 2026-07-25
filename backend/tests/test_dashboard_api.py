import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_dashboard_summary_requires_auth():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/api/v1/dashboard/summary")
        # Unauthorized without Bearer token
        assert response.status_code in (401, 403)
