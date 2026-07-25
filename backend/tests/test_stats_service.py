import pytest
import pandas as pd
import numpy as np
from app.services.stats_service import StatsService

def test_welch_ttest():
    df = pd.DataFrame({
        "group": ["A"] * 30 + ["B"] * 30,
        "yield_pct": np.concatenate([np.random.normal(80, 2, 30), np.random.normal(92, 5, 30)])
    })
    res = StatsService.execute_t_test(df, "group", "yield_pct", test_type="WELCH_TTEST")
    assert res.is_significant is True
    assert "Welch" in res.test_type
    assert res.p_value < 0.05

def test_ols_regression():
    df = pd.DataFrame({
        "temp": [30, 40, 50, 60, 70],
        "pressure": [1, 2, 3, 4, 5],
        "yield_pct": [70, 75, 80, 85, 90]
    })
    res = StatsService.execute_ols_regression(df, "yield_pct", ["temp", "pressure"])
    assert res.r_squared > 0.90
    assert "const" in res.coefficients
