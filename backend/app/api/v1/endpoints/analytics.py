import uuid
import os
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.domain.models import Dataset, User
from app.domain.schemas import AnalyticsSummaryResponse
from app.services.analytics_service import AnalyticsService
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/ingest-csv", response_model=AnalyticsSummaryResponse)
async def ingest_csv(
    file: UploadFile = File(...),
    name: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Ingests CSV dataset, executes automated data profiling, normality tests, and AI insights."""
    upload_dir = "uploads/csv"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, f"{uuid.uuid4().hex}_{file.filename}")

    with open(file_path, "wb") as f:
        f.write(await file.read())

    analytics_service = AnalyticsService(db)
    return await analytics_service.process_and_register_csv(current_user.id, file_path, name)

@router.get("/{dataset_id}/profile")
async def get_dataset_profile(dataset_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    stmt = select(Dataset).where(Dataset.id == dataset_id)
    res = await db.execute(stmt)
    dataset = res.scalar_one_or_none()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    return {
        "dataset_id": dataset.id,
        "name": dataset.name,
        "row_count": dataset.row_count,
        "column_count": dataset.column_count,
        "column_schema": dataset.column_schema,
        "profiling_results": dataset.data_profiling_results,
        "ai_insights": dataset.ai_insights,
        "uploaded_at": dataset.uploaded_at
    }

@router.post("/{dataset_id}/clean")
async def clean_dataset(
    dataset_id: uuid.UUID,
    impute_strategy: str = "median",
    remove_outliers: bool = True,
    db: AsyncSession = Depends(get_db)
):
    analytics_service = AnalyticsService(db)
    return await analytics_service.clean_dataset(dataset_id, impute_strategy, remove_outliers)

@router.get("/{dataset_id}/export")
async def export_cleaned_dataset(dataset_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    stmt = select(Dataset).where(Dataset.id == dataset_id)
    res = await db.execute(stmt)
    dataset = res.scalar_one_or_none()
    if not dataset or not os.path.exists(dataset.file_path):
        raise HTTPException(status_code=404, detail="Dataset file not found")

    cleaned_path = dataset.file_path.replace(".csv", "_cleaned.csv")
    export_path = cleaned_path if os.path.exists(cleaned_path) else dataset.file_path
    return FileResponse(path=export_path, filename=f"cleaned_{dataset.name}", media_type="text/csv")
