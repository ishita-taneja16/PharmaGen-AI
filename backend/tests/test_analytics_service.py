import pytest
import pandas as pd
import numpy as np
from app.services.analytics_service import AnalyticsService

def test_impute_missing_values():
    df = pd.DataFrame({
        "temperature": [45.0, np.nan, 50.0, 55.0, 60.0],
        "pressure": [1.0, 2.0, 3.0, 4.0, 5.0]
    })
    imputed_df = AnalyticsService.impute_missing_values(df, strategy="median")
    assert imputed_df["temperature"].isnull().sum() == 0
    assert imputed_df["temperature"].iloc[1] == 52.5

def test_detect_outliers_iqr():
    df = pd.DataFrame({
        "yield_pct": [85.0, 86.0, 87.0, 88.0, 89.0, 150.0]  # 150 is outlier
    })
    outliers_res = AnalyticsService.detect_outliers_iqr(df, "yield_pct")
    assert outliers_res["outlier_count"] == 1
    assert outliers_res["outlier_values"][0] == 150.0
