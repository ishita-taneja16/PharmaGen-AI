import numpy as np
import pandas as pd
from scipy import stats
from typing import Dict, Any, List
from app.utils.logger import logger

class DriftService:
    @staticmethod
    def detect_feature_drift(
        baseline_data: List[float],
        production_data: List[float],
        feature_name: str,
        alpha: float = 0.05
    ) -> Dict[str, Any]:
        """
        Executes Kolmogorov-Smirnov (K-S) two-sample test to detect statistical population 
        drift between baseline training data and production inference feature streams.
        """
        if len(baseline_data) < 5 or len(production_data) < 5:
            return {
                "feature_name": feature_name,
                "drift_detected": False,
                "ks_statistic": 0.0,
                "p_value": 1.0,
                "message": "Insufficient sample size for K-S drift test."
            }

        ks_stat, p_value = stats.ks_2samp(baseline_data, production_data)
        drift_detected = bool(p_value < alpha)

        if drift_detected:
            logger.warning(f"MLOps Alert: Data drift detected for feature '{feature_name}' (K-S stat = {ks_stat:.4f}, p = {p_value:.6f}). Triggering model retraining hook.")

        return {
            "feature_name": feature_name,
            "drift_detected": drift_detected,
            "ks_statistic": round(float(ks_stat), 4),
            "p_value": round(float(p_value), 6),
            "baseline_mean": round(float(np.mean(baseline_data)), 2),
            "production_mean": round(float(np.mean(production_data)), 2),
            "recommendation": "Trigger model retraining pipeline" if drift_detected else "Feature distribution stable"
        }
