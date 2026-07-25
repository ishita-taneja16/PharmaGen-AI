import uuid
import os
from typing import Optional, List
from fastapi import APIRouter, Depends, UploadFile, File, Form, BackgroundTasks, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.domain.models import ScientificPaper, User
from app.domain.schemas import PaperSearchRequest, PaperSearchResponse
from app.services.paper_service import PaperService
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/upload", status_code=status.HTTP_202_ACCEPTED)
async def upload_paper(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    title: str = Form(...),
    authors: Optional[str] = Form(None),
    journal: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Accepts PDF paper upload, registers record, and triggers background OCR & vector embedding pipeline.
    """
    upload_dir = "uploads/papers"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, f"{uuid.uuid4().hex}_{file.filename}")

    with open(file_path, "wb") as f:
        f.write(await file.read())

    paper_service = PaperService(db)
    paper = await paper_service.create_paper_record(
        user_id=current_user.id,
        file_path=file_path,
        title=title,
        authors=authors,
        journal=journal
    )

    # Launch background processing task
    background_tasks.add_task(paper_service.execute_background_ingestion, paper.id)

    return {
        "paper_id": paper.id,
        "title": paper.title,
        "status": paper.processing_status,
        "progress_percentage": paper.progress_percentage,
        "message": "Paper upload accepted. Background OCR and vector embedding initiated."
    }

@router.get("/{paper_id}/status")
async def get_paper_status(paper_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    stmt = select(ScientificPaper).where(ScientificPaper.id == paper_id)
    res = await db.execute(stmt)
    paper = res.scalar_one_or_none()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")

    return {
        "paper_id": paper.id,
        "title": paper.title,
        "status": paper.processing_status,
        "progress_percentage": paper.progress_percentage,
        "error_message": paper.error_message
    }

@router.get("/{paper_id}")
async def get_paper_detail(paper_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    stmt = select(ScientificPaper).where(ScientificPaper.id == paper_id)
    res = await db.execute(stmt)
    paper = res.scalar_one_or_none()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")

    return {
        "id": paper.id,
        "title": paper.title,
        "authors": paper.authors,
        "journal": paper.journal,
        "total_pages": paper.total_pages,
        "status": paper.processing_status,
        "progress_percentage": paper.progress_percentage,
        "executive_summary": paper.executive_summary,
        "keywords": paper.keywords,
        "citations": paper.citations,
        "uploaded_at": paper.uploaded_at
    }

@router.get("")
async def list_papers(db: AsyncSession = Depends(get_db)):
    stmt = select(ScientificPaper).order_by(ScientificPaper.uploaded_at.desc())
    res = await db.execute(stmt)
    papers = res.scalars().all()

    return [
        {
            "id": p.id,
            "title": p.title,
            "authors": p.authors,
            "journal": p.journal,
            "status": p.processing_status,
            "progress_percentage": p.progress_percentage,
            "uploaded_at": p.uploaded_at
        }
        for p in papers
    ]

@router.post("/search", response_model=PaperSearchResponse)
async def search_papers(request: PaperSearchRequest, db: AsyncSession = Depends(get_db)):
    paper_service = PaperService(db)
    return await paper_service.search_papers_hybrid(request.query, request.top_k, request.min_similarity)
