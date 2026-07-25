import pytest
import pandas as pd
import numpy as np
from app.services.ml_service import MLService

def test_single_prediction_shap():
    service = MLService(session=None)
    res = service.predict_single({"temperature": 65.0, "stir_rate": 350.0, "pressure": 2.5})
    assert "prediction" in res
    assert "shap_values" in res
    assert res["prediction"] > 0
    assert "temperature" in res["shap_values"]
