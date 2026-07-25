import uuid
from typing import Optional, Sequence
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.domain.models import User, UserRole

class UserRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, user_id: uuid.UUID) -> Optional[User]:
        stmt = select(User).where(User.id == user_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Optional[User]:
        stmt = select(User).where(User.email == email.lower().strip())
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, email: str, password_hash: str, full_name: str, role: UserRole) -> User:
        user = User(
            email=email.lower().strip(),
            password_hash=password_hash,
            full_name=full_name.strip(),
            role=role,
            is_active=True
        )
        self.session.add(user)
        await self.session.flush()
        return user

    async def list_all(self, skip: int = 0, limit: int = 100) -> Sequence[User]:
        stmt = select(User).order_by(User.created_at.desc()).offset(skip).limit(limit)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def update_role(self, user_id: uuid.UUID, new_role: UserRole) -> Optional[User]:
        stmt = (
            update(User)
            .where(User.id == user_id)
            .values(role=new_role)
            .returning(User)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def update_active_status(self, user_id: uuid.UUID, is_active: bool) -> Optional[User]:
        stmt = (
            update(User)
            .where(User.id == user_id)
            .values(is_active=is_active)
            .returning(User)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
