import pandas as pd

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.domain.models import User, Dataset
from app.domain.schemas import (
    MLTrainRequest,
    MLTrainResponse,
    MLCompareResponse,
    PredictRequest,
    PredictResponse,
)
from app.domain.schemas import (
    MLTrainRequest,
    MLTrainResponse,
    MLCompareRequest,
    MLCompareResponse,
    PredictRequest,
    PredictResponse,
)
from app.services.ml_service import MLService
from app.api.deps import get_current_user

router = APIRouter()


async def load_dataset_dataframe(dataset_id, db: AsyncSession) -> pd.DataFrame:
    print("Loading dataset...")

    stmt = select(Dataset).where(Dataset.id == dataset_id)
    result = await db.execute(stmt)
    dataset = result.scalar_one_or_none()

    if not dataset:
        all_datasets_res = await db.execute(select(Dataset.id))
        all_ids = [str(d) for d in all_datasets_res.scalars().all()]
        print(f"Dataset not found for received UUID: {dataset_id}")
        print(f"Available Dataset IDs in database: {all_ids}")
        raise HTTPException(status_code=404, detail=f"Dataset not found: {dataset_id}")

    print("Dataset ID:", dataset.id)
    print("Dataset Path:", dataset.file_path)

    try:
        df = pd.read_csv(dataset.file_path)
        df.columns = df.columns.str.strip()

        print("Dataset shape:", df.shape)
        print("Columns:", df.columns.tolist())

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Unable to read dataset: {str(e)}"
        )

    return df


@router.post("/train", response_model=MLTrainResponse)
async def train_model(
    req: MLTrainRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):

    print("========== TRAIN ENDPOINT HIT ==========")
    print(req)

    df = await load_dataset_dataframe(req.dataset_id, db)

    print("Checking target column...")

    if req.target_column not in df.columns:
        raise HTTPException(
            status_code=400,
            detail=f"Target column '{req.target_column}' not found. Available columns: {df.columns.tolist()}"
        )

    print("Target column OK")

    ml_service = MLService(db)

    print("Calling ML Service...")

    return await ml_service.train_predictive_model(
        current_user.id,
        df,
        req.target_column,
        req.model_type,
        req.task_type,
        req.hyperparameters
    )

@router.post("/compare", response_model=MLCompareResponse)
async def compare_models(
    req: MLCompareRequest,
    db: AsyncSession = Depends(get_db)
):

    print("========== COMPARE ENDPOINT ==========")

    df = await load_dataset_dataframe(req.dataset_id, db)

    if req.target_column not in df.columns:
        raise HTTPException(
            status_code=400,
            detail=f"Target column '{req.target_column}' not found."
        )

    ml_service = MLService(db)

    return await ml_service.compare_predictive_models(
        df,
        req.target_column,
        req.task_type
    )


@router.post("/predict", response_model=PredictResponse)
async def predict_single(
    req: PredictRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Performs real-time prediction.
    """

    ml_service = MLService(db)

    result = ml_service.predict_single(req.input_features)

    return PredictResponse(
        model_id=req.model_id,
        prediction=result["prediction"],
        shap_values=result["shap_values"]
    )