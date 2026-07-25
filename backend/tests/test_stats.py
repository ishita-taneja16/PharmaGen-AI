import pandas as pd
import numpy as np
from app.services.stats_service import StatsService

def test_anova_execution():
    df = pd.DataFrame({
        "formulation_code": ["F-101"] * 20 + ["F-102"] * 20,
        "yield_percentage": [80.0] * 20 + [95.0] * 20
    })
    res = StatsService.execute_anova(df, "formulation_code", "yield_percentage")
    assert res.is_significant is True
    assert res.p_value < 0.05
