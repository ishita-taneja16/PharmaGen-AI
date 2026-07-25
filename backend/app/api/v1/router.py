from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, dashboard, papers, analytics, stats, ml, sql, compliance, agents, reports, monitoring

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["User Management"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Project Dashboard"])
api_router.include_router(papers.router, prefix="/papers", tags=["Scientific Paper Intelligence"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Experiment Analytics"])
api_router.include_router(stats.router, prefix="/stats", tags=["Statistical Analysis"])
api_router.include_router(ml.router, prefix="/ml", tags=["Machine Learning Engine"])
api_router.include_router(sql.router, prefix="/sql", tags=["Natural Language SQL"])
api_router.include_router(compliance.router, prefix="/compliance", tags=["Compliance Checker"])
api_router.include_router(agents.router, prefix="/agents", tags=["LangGraph Research Assistant"])
api_router.include_router(reports.router, prefix="/reports", tags=["Report Generation Module"])
api_router.include_router(monitoring.router, prefix="/monitoring", tags=["Monitoring & MLOps"])
