import uuid
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.domain.models import User, AuditLog
from app.domain.schemas import ComplianceVerifyRequest, ComplianceVerifyResponse
from app.services.compliance_service import ComplianceService
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/verify", response_model=ComplianceVerifyResponse)
async def verify_compliance(
    req: ComplianceVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Evaluates experiment against SOP baseline, calculates risk score, and logs Part 11 audit record."""
    compliance_service = ComplianceService(db)
    return await compliance_service.evaluate_experiment_compliance(current_user.id, req.experiment_id, req.sop_code)

@router.get("/audit-logs")
async def list_audit_logs(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieves 21 CFR Part 11 audit trail event stream with SHA-256 integrity hashes."""
    stmt = select(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit)
    res = await db.execute(stmt)
    logs = res.scalars().all()

    return [
        {
            "id": log.id,
            "action": log.action,
            "entity_type": log.entity_type,
            "entity_id": log.entity_id,
            "payload_hash": log.payload_hash,
            "timestamp": log.timestamp
        }
        for log in logs
    ]
