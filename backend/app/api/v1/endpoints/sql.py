from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.domain.schemas import SQLQueryRequest, SQLQueryResponse
from app.services.sql_service import SQLService

router = APIRouter()

@router.post("/query", response_model=SQLQueryResponse)
async def query_text_to_sql(req: SQLQueryRequest, db: AsyncSession = Depends(get_db)):
    sql_service = SQLService(db)
    return await sql_service.process_natural_language_sql(req.prompt)

@router.get("/history")
async def get_sql_query_history():
    return [
        {"prompt": "Which formulation produced the highest yield in Q3?", "execution_time_ms": 14.2, "status": "SUCCESS"},
        {"prompt": "Rank all batches by compliance score using window functions", "execution_time_ms": 18.5, "status": "SUCCESS"},
        {"prompt": "Show average yield by SOP version", "execution_time_ms": 12.1, "status": "SUCCESS"}
    ]
