import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.domain.models import ScientificPaper, Dataset, Experiment, MLModel, ComplianceReport, AuditLog, User
from app.domain.schemas import DashboardSummaryResponse, DashboardMetrics, RecentActivityItem
from app.utils.logger import logger

class DashboardService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_dashboard_summary(self, user_id: uuid.UUID, user_name: str = "Current User") -> DashboardSummaryResponse:
        """
        Aggregates user-specific operational metrics for the authenticated user.
        No hardcoded clamps or fake numbers.
        """
        # 1. Count User Papers
        paper_count_res = await self.session.execute(
            select(func.count(ScientificPaper.id)).where(ScientificPaper.user_id == user_id)
        )
        paper_count = paper_count_res.scalar() or 0

        # 2. Count User Datasets
        dataset_count_res = await self.session.execute(
            select(func.count(Dataset.id)).where(Dataset.user_id == user_id)
        )
        dataset_count = dataset_count_res.scalar() or 0

        # 3. Count User Experiments
        exp_count_res = await self.session.execute(
            select(func.count(Experiment.id)).where(Experiment.user_id == user_id)
        )
        exp_count = exp_count_res.scalar() or 0

        # 4. Count User ML Models
        model_count_res = await self.session.execute(
            select(func.count(MLModel.id)).where(MLModel.user_id == user_id)
        )
        model_count = model_count_res.scalar() or 0

        # 5. Count & Average User Compliance Reports
        comp_count_res = await self.session.execute(
            select(func.count(ComplianceReport.id)).where(ComplianceReport.user_id == user_id)
        )
        comp_count = comp_count_res.scalar() or 0

        avg_compliance_res = await self.session.execute(
            select(func.avg(ComplianceReport.compliance_score)).where(ComplianceReport.user_id == user_id)
        )
        avg_comp = avg_compliance_res.scalar()
        overall_compliance_rate = round(float(avg_comp), 2) if avg_comp is not None else None

        # 6. Average Experiment Yield
        avg_yield_res = await self.session.execute(
            select(func.avg(Experiment.yield_percentage)).where(Experiment.user_id == user_id)
        )
        avg_yield_val = avg_yield_res.scalar()
        avg_yield = round(float(avg_yield_val), 2) if avg_yield_val is not None else None

        # Format User Metrics
        metrics = DashboardMetrics(
            total_papers=paper_count,
            total_datasets=dataset_count,
            total_experiments=exp_count,
            total_ml_models=model_count,
            total_compliance_reports=comp_count,
            avg_yield_percentage=avg_yield,
            avg_model_r2_score=None,
            overall_compliance_rate=overall_compliance_rate
        )

        # 7. Dynamic Compliance Distribution
        comp_dist_stmt = select(
            ComplianceReport.overall_status, func.count(ComplianceReport.id)
        ).where(ComplianceReport.user_id == user_id).group_by(ComplianceReport.overall_status)
        comp_dist_res = await self.session.execute(comp_dist_stmt)
        compliance_distribution = {status: count for status, count in comp_dist_res.all()}

        # 8. User Model Performance Overview
        models_stmt = select(MLModel).where(MLModel.user_id == user_id).order_by(MLModel.trained_at.desc()).limit(5)
        models_res = await self.session.execute(models_stmt)
        user_models = models_res.scalars().all()
        model_performance = [
            {
                "model": m.model_name,
                "r2_score": m.metrics.get("r2_score", 0.0) if m.metrics else 0.0,
                "rmse": m.metrics.get("rmse", 0.0) if m.metrics else 0.0
            }
            for m in user_models
        ]

        # 9. User Audit Trail Recent Activity
        audit_stmt = select(AuditLog).where(AuditLog.user_id == user_id).order_by(AuditLog.timestamp.desc()).limit(5)
        audit_res = await self.session.execute(audit_stmt)
        user_audits = audit_res.scalars().all()
        recent_activities = [
            RecentActivityItem(
                id=str(a.id),
                title=f"{a.action} on {a.entity_type}",
                activity_type=a.action,
                user_name=user_name,
                timestamp=a.timestamp,
                status="SUCCESS"
            )
            for a in user_audits
        ]

        return DashboardSummaryResponse(
            metrics=metrics,
            papers_over_time=[],
            experiments_over_time=[],
            yield_trend=[],
            model_performance=model_performance,
            compliance_distribution=compliance_distribution,
            recent_activity=recent_activities
        )
