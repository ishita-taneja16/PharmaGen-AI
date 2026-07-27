import uuid
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status

from app.domain.models import Experiment, ExperimentLog
from app.domain.schemas import ExperimentCreateRequest, ExperimentLogRequest, ExperimentLogItem

class ExperimentService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_experiment(
        self,
        user_id: uuid.UUID,
        request: ExperimentCreateRequest
    ) -> Experiment:
        experiment = Experiment(
            user_id=user_id,
            dataset_id=request.dataset_id,
            title=request.title,
            formulation_code=request.formulation_code,
            batch_number=request.batch_number,
            parameters=request.parameters or {}
        )
        self.session.add(experiment)
        await self.session.commit()
        await self.session.refresh(experiment)
        return experiment

    async def add_logs(
        self,
        experiment_id: uuid.UUID,
        log_request: ExperimentLogRequest
    ) -> List[ExperimentLog]:
        stmt = select(Experiment).where(Experiment.id == experiment_id)
        res = await self.session.execute(stmt)
        experiment = res.scalar_one_or_none()

        if not experiment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Experiment not found"
            )

        logs_list = log_request.logs if isinstance(log_request, ExperimentLogRequest) else log_request

        created_logs = []
        for item in logs_list:
            log_entry = ExperimentLog(
                experiment_id=experiment_id,
                step_number=item.step_number,
                step_description=item.step_description,
                measured_values=getattr(item, "measured_values", {}) or {}
            )
            created_logs.append(log_entry)

        self.session.add_all(created_logs)
        await self.session.commit()

        for log in created_logs:
            await self.session.refresh(log)

        return created_logs
