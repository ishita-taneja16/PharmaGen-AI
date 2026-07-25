import pandas as pd
import numpy as np
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.domain.schemas import HypothesisTestRequest, HypothesisTestResponse, PCARequest, PCAResponse, RegressionRequest, RegressionResponse
from app.services.stats_service import StatsService

router = APIRouter()

@router.post("/hypothesis-test", response_model=HypothesisTestResponse)
async def run_hypothesis_test(req: HypothesisTestRequest, db: AsyncSession = Depends(get_db)):
    np.random.seed(42)
    df = pd.DataFrame({
        "formulation_code": ["F-101"] * 50 + ["F-102"] * 50 + ["F-103"] * 50,
        "yield_percentage": np.concatenate([
            np.random.normal(82, 3, 50),
            np.random.normal(91, 2.5, 50),
            np.random.normal(87, 4, 50)
        ])
    })

    if req.test_type == "ANOVA":
        return StatsService.execute_anova(df, req.group_column, req.target_column)
    else:
        return StatsService.execute_t_test(df, req.group_column, req.target_column, req.test_type, req.alpha)

@router.post("/regression", response_model=RegressionResponse)
async def run_ols_regression(req: RegressionRequest, db: AsyncSession = Depends(get_db)):
    np.random.seed(42)
    df = pd.DataFrame({
        "temperature": np.random.uniform(30, 80, 100),
        "pressure": np.random.uniform(1, 5, 100),
        "stir_rate": np.random.uniform(100, 500, 100),
        "yield_percentage": np.random.uniform(70, 99, 100)
    })

    return StatsService.execute_ols_regression(df, req.target_column, req.feature_columns)

@router.post("/pca", response_model=PCAResponse)
async def run_pca(req: PCARequest, db: AsyncSession = Depends(get_db)):
    np.random.seed(42)
    df = pd.DataFrame(np.random.rand(100, len(req.feature_columns)), columns=req.feature_columns)
    return StatsService.execute_pca(df, req.feature_columns, req.n_components)
