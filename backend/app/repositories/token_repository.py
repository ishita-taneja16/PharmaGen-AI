import uuid
import hashlib
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.domain.models import RefreshToken

class RefreshTokenRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    @staticmethod
    def hash_token(raw_token: str) -> str:
        return hashlib.sha256(raw_token.encode('utf-8')).hexdigest()

    async def create(self, user_id: uuid.UUID, raw_token: str, expires_at: datetime) -> RefreshToken:
        token_hash = self.hash_token(raw_token)
        token_obj = RefreshToken(
            user_id=user_id,
            token_hash=token_hash,
            expires_at=expires_at,
            is_revoked=False
        )
        self.session.add(token_obj)
        await self.session.flush()
        return token_obj

    async def get_valid_token(self, raw_token: str) -> Optional[RefreshToken]:
        token_hash = self.hash_token(raw_token)
        now = datetime.now(timezone.utc)
        stmt = select(RefreshToken).where(
            RefreshToken.token_hash == token_hash,
            RefreshToken.is_revoked == False,
            RefreshToken.expires_at > now
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def revoke_token(self, raw_token: str) -> bool:
        token_hash = self.hash_token(raw_token)
        stmt = (
            update(RefreshToken)
            .where(RefreshToken.token_hash == token_hash)
            .values(is_revoked=True)
        )
        result = await self.session.execute(stmt)
        return result.rowcount > 0

    async def revoke_all_for_user(self, user_id: uuid.UUID) -> int:
        stmt = (
            update(RefreshToken)
            .where(RefreshToken.user_id == user_id)
            .values(is_revoked=True)
        )
        result = await self.session.execute(stmt)
        return result.rowcount
