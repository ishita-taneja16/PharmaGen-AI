import pytest
import numpy as np
from app.services.drift_service import DriftService

def test_no_drift_identical_distributions():
    np.random.seed(42)
    baseline = list(np.random.normal(50, 5, 100))
    production = list(np.random.normal(50, 5, 100))

    res = DriftService.detect_feature_drift(baseline, production, "temperature")
    assert res["drift_detected"] is False
    assert res["p_value"] > 0.05

def test_drift_detected_shifted_distributions():
    np.random.seed(42)
    baseline = list(np.random.normal(50, 5, 100))
    production = list(np.random.normal(70, 5, 100))  # Significant mean shift

    res = DriftService.detect_feature_drift(baseline, production, "temperature")
    assert res["drift_detected"] is True
    assert res["p_value"] < 0.05
    assert "retraining" in res["recommendation"].lower()
