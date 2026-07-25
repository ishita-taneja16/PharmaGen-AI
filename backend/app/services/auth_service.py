import uuid
from datetime import datetime, timedelta, timezone
from typing import Tuple, Optional, Sequence
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.user_repository import UserRepository
from app.repositories.token_repository import RefreshTokenRepository
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.config import settings
from app.core.exceptions import PharmaAIException
from app.domain.models import User, UserRole
from app.domain.schemas import UserCreate, TokenResponse
from app.utils.logger import logger
from fastapi import status

class AuthService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.user_repo = UserRepository(session)
        self.token_repo = RefreshTokenRepository(session)

    async def register_user(self, user_in: UserCreate) -> User:
        existing_user = await self.user_repo.get_by_email(user_in.email)
        if existing_user:
            raise PharmaAIException(
                detail="A user with this email address already exists.",
                error_code="EMAIL_ALREADY_EXISTS",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        hashed_password = get_password_hash(user_in.password)
        user = await self.user_repo.create(
            email=user_in.email,
            password_hash=hashed_password,
            full_name=user_in.full_name,
            role=user_in.role
        )
        await self.session.commit()
        await self.session.refresh(user)
        logger.info(f"User registered successfully: {user.email} (Role: {user.role})")
        return user

    async def authenticate_user(self, email: str, password: str) -> TokenResponse:
        user = await self.user_repo.get_by_email(email)
        if not user or not verify_password(password, user.password_hash):
            raise PharmaAIException(
                detail="Incorrect email or password.",
                error_code="INVALID_CREDENTIALS",
                status_code=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_active:
            raise PharmaAIException(
                detail="User account is deactivated.",
                error_code="ACCOUNT_DEACTIVATED",
                status_code=status.HTTP_403_FORBIDDEN
            )

        # Generate Access Token
        access_token = create_access_token(subject=user.id)

        # Generate Refresh Token
        raw_refresh_token = str(uuid.uuid4())
        expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        await self.token_repo.create(user.id, raw_refresh_token, expires_at)

        await self.session.commit()

        return TokenResponse(
            access_token=access_token,
            refresh_token=raw_refresh_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )

    async def refresh_access_token(self, refresh_token_str: str) -> TokenResponse:
        token_record = await self.token_repo.get_valid_token(refresh_token_str)
        if not token_record:
            raise PharmaAIException(
                detail="Invalid or expired refresh token.",
                error_code="INVALID_REFRESH_TOKEN",
                status_code=status.HTTP_401_UNAUTHORIZED
            )

        user = await self.user_repo.get_by_id(token_record.user_id)
        if not user or not user.is_active:
            raise PharmaAIException(
                detail="User associated with token is invalid or inactive.",
                error_code="INACTIVE_USER",
                status_code=status.HTTP_401_UNAUTHORIZED
            )

        # Rotate refresh token
        await self.token_repo.revoke_token(refresh_token_str)
        new_raw_refresh_token = str(uuid.uuid4())
        expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        await self.token_repo.create(user.id, new_raw_refresh_token, expires_at)

        new_access_token = create_access_token(subject=user.id)
        await self.session.commit()

        return TokenResponse(
            access_token=new_access_token,
            refresh_token=new_raw_refresh_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )

    async def logout_user(self, refresh_token_str: str) -> bool:
        revoked = await self.token_repo.revoke_token(refresh_token_str)
        await self.session.commit()
        return revoked

    async def list_users(self, skip: int = 0, limit: int = 100) -> Sequence[User]:
        return await self.user_repo.list_all(skip, limit)

    async def update_user_role(self, user_id: uuid.UUID, new_role: UserRole) -> User:
        user = await self.user_repo.update_role(user_id, new_role)
        if not user:
            raise PharmaAIException(
                detail="User not found.",
                error_code="USER_NOT_FOUND",
                status_code=status.HTTP_404_NOT_FOUND
            )
        await self.session.commit()
        return user
