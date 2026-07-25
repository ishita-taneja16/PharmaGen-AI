import uuid
import pandas as pd
import numpy as np
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.domain.models import User
from app.domain.schemas import (
    MLTrainRequest,
    MLTrainResponse,
    MLCompareResponse,
    PredictRequest,
    PredictResponse,
)
from app.services.ml_service import MLService
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/train", response_model=MLTrainResponse)
async def train_model(
    req: MLTrainRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Trains Random Forest, XGBoost, LightGBM, or CatBoost models with 5-fold CV & MLflow tracking."""
    np.random.seed(42)
    df = pd.DataFrame({
        "temperature": np.random.uniform(30, 80, 200),
        "pressure": np.random.uniform(1, 5, 200),
        "stir_rate": np.random.uniform(100, 500, 200),
        "pH_level": np.random.uniform(5.5, 8.0, 200),
        "yield_percentage": np.random.uniform(70, 99, 200)
    })

    ml_service = MLService(db)
    return await ml_service.train_predictive_model(
        current_user.id, df, req.target_column, req.model_type, req.task_type, req.hyperparameters
    )

@router.post("/compare", response_model=MLCompareResponse)
async def compare_models(
    target_column: str = "yield_percentage",
    task_type: str = "regression",
    db: AsyncSession = Depends(get_db)
):
    """Runs AutoML benchmark across XGBoost, LightGBM, CatBoost, and Random Forest."""
    np.random.seed(42)
    df = pd.DataFrame({
        "temperature": np.random.uniform(30, 80, 150),
        "pressure": np.random.uniform(1, 5, 150),
        "stir_rate": np.random.uniform(100, 500, 150),
        "yield_percentage": np.random.uniform(70, 99, 150)
    })

    ml_service = MLService(db)
    return await ml_service.compare_predictive_models(df, target_column, task_type)

@router.post("/predict", response_model=PredictResponse)
async def predict_single(req: PredictRequest, db: AsyncSession = Depends(get_db)):
    """Performs real-time point prediction and calculates SHAP feature attributions."""
    ml_service = MLService(db)
    res = ml_service.predict_single(req.input_features)
    return PredictResponse(
        model_id=req.model_id,
        prediction=res["prediction"],
        shap_values=res["shap_values"]
    )
