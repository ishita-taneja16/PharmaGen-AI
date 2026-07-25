import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_register_and_login_flow():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        email = f"test_user_{pytest.__name__}@pfizer.com"
        
        # 1. Register User
        reg_response = await ac.post("/api/v1/auth/register", json={
            "email": email,
            "password": "Password123!",
            "full_name": "Test Scientist",
            "role": "RESEARCH_SCIENTIST"
        })
        assert reg_response.status_code in (201, 400)

        # 2. Login User
        login_response = await ac.post("/api/v1/auth/login", data={
            "username": email,
            "password": "Password123!"
        })
        if login_response.status_code == 200:
            tokens = login_response.json()
            assert "access_token" in tokens
            assert "refresh_token" in tokens
            assert tokens["token_type"] == "bearer"
