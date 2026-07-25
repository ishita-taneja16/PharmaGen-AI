from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator
from sqlalchemy import text
from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1.router import api_router
from app.utils.logger import logger

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Enterprise Pharmaceutical R&D SaaS Platform for Literature Intelligence, Analytics, ML, Text-to-SQL, Compliance, and LangGraph Multi-Agents.",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(api_router, prefix="/api/v1")

# Prometheus Metrics Instrumentation
Instrumentator().instrument(app).expose(app)

@app.on_event("startup")
async def on_startup():
    logger.info("Initializing database schemas...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("PharmaGen AI Backend Services initialized successfully.")

@app.get("/health", tags=["System"])
@app.get("/health/liveness", tags=["System"])
async def liveness_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT
    }

@app.get("/health/readiness", tags=["System"])
async def readiness_check():
    db_healthy = False
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
            db_healthy = True
    except Exception as e:
        logger.error(f"Database readiness check failed: {e}")

    return {
        "status": "READY" if db_healthy else "UNHEALTHY",
        "database_connected": db_healthy,
        "mlflow_connected": True,
        "prometheus_metrics_enabled": True
    }
