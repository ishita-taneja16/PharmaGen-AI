from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.domain.schemas import DashboardSummaryResponse
from app.services.dashboard_service import DashboardService
from app.api.deps import get_current_user
from app.domain.models import User

router = APIRouter()

@router.get("/summary", response_model=DashboardSummaryResponse)
async def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    dashboard_service = DashboardService(db)
    return await dashboard_service.get_dashboard_summary()
