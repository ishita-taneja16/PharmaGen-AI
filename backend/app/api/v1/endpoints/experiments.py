import uuid
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.deps import get_current_user
from app.domain.models import User
from app.domain.schemas import ExperimentCreateRequest, ExperimentLogRequest
from app.services.experiment_service import ExperimentService

router = APIRouter()


@router.post("/create", status_code=status.HTTP_201_CREATED)
async def create_experiment(
    req: ExperimentCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Creates a new experiment record in the database."""
    service = ExperimentService(db)
    experiment = await service.create_experiment(current_user.id, req)
    return experiment


@router.post("/{experiment_id}/logs", status_code=status.HTTP_200_OK)
async def add_experiment_logs(
    experiment_id: uuid.UUID,
    req: ExperimentLogRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Adds execution log steps to an existing experiment."""
    service = ExperimentService(db)
    logs = await service.add_logs(experiment_id, req)
    return {
        "status": "success",
        "message": f"Successfully added {len(logs)} log entries to experiment {experiment_id}.",
        "logs_count": len(logs),
        "experiment_id": str(experiment_id)
    }
