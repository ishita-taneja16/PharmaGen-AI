import time
import pandas as pd

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.domain.models import Dataset
from app.domain.schemas import (
    HypothesisTestRequest,
    HypothesisTestResponse,
    RegressionRequest,
    RegressionResponse,
    PCARequest,
    PCAResponse,
)
from app.services.stats_service import StatsService

router = APIRouter()


async def load_dataset_dataframe(dataset_id, db: AsyncSession) -> pd.DataFrame:
    """
    Load uploaded CSV using dataset_id.
    """

    start = time.perf_counter()
    print("Loading dataset from database...")

    stmt = select(Dataset).where(Dataset.id == dataset_id)
    result = await db.execute(stmt)
    dataset = result.scalar_one_or_none()

    if not dataset:
        all_datasets_res = await db.execute(select(Dataset.id))
        all_ids = [str(d) for d in all_datasets_res.scalars().all()]
        print(f"Dataset not found for received UUID: {dataset_id}")
        print(f"Available Dataset IDs in database: {all_ids}")
        raise HTTPException(
            status_code=404,
            detail=f"Dataset not found: {dataset_id}"
        )

    print("Dataset ID:", dataset.id)
    print("Dataset Path:", dataset.file_path)
    print(f"Database lookup: {time.perf_counter() - start:.2f} sec")

    try:
        csv_start = time.perf_counter()
        df = pd.read_csv(dataset.file_path)
        df.columns = df.columns.str.strip()
        print(f"CSV loaded in {time.perf_counter() - csv_start:.2f} sec")
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Unable to read dataset: {str(e)}"
        )

    return df


@router.post("/hypothesis-test", response_model=HypothesisTestResponse)
async def run_hypothesis_test(
    req: HypothesisTestRequest,
    db: AsyncSession = Depends(get_db)
):
    total_start = time.perf_counter()
    print("\n========== HYPOTHESIS TEST START ==========")

    df = await load_dataset_dataframe(req.dataset_id, db)

    required_columns = [
        req.group_column,
        req.target_column,
    ]

    missing = [c for c in required_columns if c not in df.columns]

    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Columns not found in dataset: {missing}"
        )

    stats_start = time.perf_counter()

    if req.test_type.upper() == "ANOVA":
        result = StatsService.execute_anova(
            df,
            req.group_column,
            req.target_column
        )
    else:
        result = StatsService.execute_t_test(
            df,
            req.group_column,
            req.target_column,
            req.test_type,
            req.alpha
        )

    print(f"Statistical test time: {time.perf_counter() - stats_start:.2f} sec")
    print(f"Total endpoint time: {time.perf_counter() - total_start:.2f} sec")
    print("========== HYPOTHESIS TEST END ==========\n")

    return result


@router.post("/regression", response_model=RegressionResponse)
async def run_ols_regression(
    req: RegressionRequest,
    db: AsyncSession = Depends(get_db)
):
    total_start = time.perf_counter()
    print("\n========== REGRESSION START ==========")

    df = await load_dataset_dataframe(req.dataset_id, db)

    required_columns = [
        req.target_column,
        *req.feature_columns
    ]

    missing = [c for c in required_columns if c not in df.columns]

    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Columns not found in dataset: {missing}"
        )

    result = StatsService.execute_ols_regression(
        df,
        req.target_column,
        req.feature_columns
    )

    print(f"Total endpoint time: {time.perf_counter() - total_start:.2f} sec")
    print("========== REGRESSION END ==========\n")

    return result


@router.post("/pca", response_model=PCAResponse)
async def run_pca(
    req: PCARequest,
    db: AsyncSession = Depends(get_db)
):
    total_start = time.perf_counter()
    print("\n========== PCA START ==========")

    df = await load_dataset_dataframe(req.dataset_id, db)

    missing = [
        c for c in req.feature_columns
        if c not in df.columns
    ]

    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Columns not found in dataset: {missing}"
        )

    result = StatsService.execute_pca(
        df,
        req.feature_columns,
        req.n_components
    )

    print(f"Total endpoint time: {time.perf_counter() - total_start:.2f} sec")
    print("========== PCA END ==========\n")

    return result