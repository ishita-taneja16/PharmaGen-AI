import uuid
from typing import List
from fastapi import APIRouter, Depends, status, Body
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.domain.models import User, UserRole
from app.domain.schemas import UserResponse
from app.services.auth_service import AuthService
from app.api.deps import get_current_user, require_roles

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("", response_model=List[UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.LEAD_RESEARCHER)),
    db: AsyncSession = Depends(get_db)
):
    auth_service = AuthService(db)
    return await auth_service.list_users(skip, limit)

@router.patch("/{user_id}/role", response_model=UserResponse)
async def update_user_role(
    user_id: uuid.UUID,
    new_role: UserRole = Body(..., embed=True),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    auth_service = AuthService(db)
    return await auth_service.update_user_role(user_id, new_role)
