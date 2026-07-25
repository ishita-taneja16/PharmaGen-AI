import os
import uuid
from fastapi import APIRouter, Depends, status
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.domain.models import User
from app.domain.schemas import ReportGenerateRequest
from app.services.report_service import ReportService
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/pdf")
async def generate_pdf_report(
    req: ReportGenerateRequest,
    current_user: User = Depends(get_current_user)
):
    """Generates and streams a 21 CFR Part 11 compliant PDF report."""
    output_dir = "downloads/reports"
    os.makedirs(output_dir, exist_ok=True)
    file_path = os.path.join(output_dir, f"report_{uuid.uuid4().hex[:8]}.pdf")

    ReportService.generate_pdf_report(file_path, req.title, {})
    return FileResponse(path=file_path, filename="PharmaGen_R&D_Report.pdf", media_type="application/pdf")

@router.post("/excel")
async def generate_excel_report(
    req: ReportGenerateRequest,
    current_user: User = Depends(get_current_user)
):
    """Generates and streams a multi-tab Excel workbook (.xlsx)."""
    output_dir = "downloads/reports"
    os.makedirs(output_dir, exist_ok=True)
    file_path = os.path.join(output_dir, f"report_{uuid.uuid4().hex[:8]}.xlsx")

    ReportService.generate_excel_report(file_path, req.title)
    return FileResponse(path=file_path, filename="PharmaGen_R&D_Data.xlsx", media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")

@router.post("/pptx")
async def generate_pptx_report(
    req: ReportGenerateRequest,
    current_user: User = Depends(get_current_user)
):
    """Generates and streams an executive PowerPoint slide deck (.pptx)."""
    output_dir = "downloads/reports"
    os.makedirs(output_dir, exist_ok=True)
    file_path = os.path.join(output_dir, f"report_{uuid.uuid4().hex[:8]}.pptx")

    ReportService.generate_pptx_report(file_path, req.title)
    return FileResponse(path=file_path, filename="PharmaGen_R&D_Deck.pptx", media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation")
