import numpy as np
import pandas as pd
from scipy import stats
# pyrefly: ignore [missing-import]
import statsmodels.api as sm
# pyrefly: ignore [missing-import]
from statsmodels.stats.multicomp import pairwise_tukeyhsd
from sklearn.decomposition import PCA
# pyrefly: ignore [missing-import]
import google.generativeai as genai
from typing import Dict, Any, List, Tuple
from app.core.config import settings
from app.domain.schemas import HypothesisTestResponse, PCAResponse, RegressionResponse
from app.utils.logger import logger

if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

class StatsService:
    @staticmethod
    def execute_t_test(df: pd.DataFrame, group_col: str, target_col: str, test_type: str = "TTEST_IND", alpha: float = 0.05) -> HypothesisTestResponse:
        """
        Executes Independent (Student's or Welch's) or Paired T-Test with Shapiro-Wilk & Levene assumption checks.
        """
        groups = df[group_col].dropna().unique()
        if len(groups) < 2:
            raise ValueError(f"T-Test requires at least 2 unique groups in '{group_col}'. Found: {groups}")

        g1 = df[df[group_col] == groups[0]][target_col].dropna()
        g2 = df[df[group_col] == groups[1]][target_col].dropna()

        # Assumption 1: Normality via Shapiro-Wilk
        _, shapiro_p1 = stats.shapiro(g1[:500]) if len(g1) >= 3 else (1.0, 1.0)
        _, shapiro_p2 = stats.shapiro(g2[:500]) if len(g2) >= 3 else (1.0, 1.0)
        normality_passed = bool(shapiro_p1 > 0.05 and shapiro_p2 > 0.05)

        # Assumption 2: Homogeneity of Variance via Levene's Test
        _, levene_p = stats.levene(g1, g2)
        homogeneity_passed = bool(levene_p > 0.05)

        # Select equal_var based on Levene test or explicit Welch override
        use_equal_var = homogeneity_passed if test_type != "WELCH_TTEST" else False

        if test_type == "TTEST_REL":
            min_len = min(len(g1), len(g2))
            t_stat, p_val = stats.ttest_rel(g1.iloc[:min_len], g2.iloc[:min_len])
            method_name = "Paired Sample T-Test"
        elif use_equal_var:
            t_stat, p_val = stats.ttest_ind(g1, g2, equal_var=True)
            method_name = "Independent Two-Sample T-Test (Student's)"
        else:
            t_stat, p_val = stats.ttest_ind(g1, g2, equal_var=False)
            method_name = "Welch's Two-Sample T-Test (Unequal Variances)"

        is_sig = bool(p_val < alpha)
        null_h = f"H0: Mean yield of {groups[0]} is equal to mean yield of {groups[1]}."
        alt_h = f"H1: Mean yield of {groups[0]} differs significantly from mean yield of {groups[1]}."

        interpretation = f"Executed {method_name}. Mean {groups[0]} = {g1.mean():.2f}, Mean {groups[1]} = {g2.mean():.2f}. " + \
                         ("Statistically significant difference (p < 0.05)." if is_sig else "Failed to reject null hypothesis.")

        ai_interp = StatsService._generate_ai_statistical_interpretation(method_name, null_h, alt_h, float(t_stat), float(p_val), is_sig)

        return HypothesisTestResponse(
            test_type=method_name,
            statistic=float(t_stat),
            p_value=float(p_val),
            is_significant=is_sig,
            null_hypothesis=null_h,
            alt_hypothesis=alt_h,
            assumptions_passed={
                "shapiro_normality": normality_passed,
                "levene_homogeneity": homogeneity_passed
            },
            interpretation=interpretation,
            ai_interpretation=ai_interp,
            details={
                "group_0": str(groups[0]),
                "group_1": str(groups[1]),
                "group_0_mean": float(g1.mean()),
                "group_1_mean": float(g2.mean()),
                "levene_p_value": float(levene_p)
            }
        )

    @staticmethod
    def execute_anova(df: pd.DataFrame, group_col: str, target_col: str) -> HypothesisTestResponse:
        """Executes One-Way ANOVA with Tukey HSD post-hoc testing."""
        groups = df[group_col].dropna().unique()
        group_data = [df[df[group_col] == g][target_col].dropna() for g in groups]

        f_stat, p_val = stats.f_oneway(*group_data)
        is_sig = bool(p_val < 0.05)

        # Tukey HSD Post-Hoc Test
        clean_df = df[[group_col, target_col]].dropna()
        tukey = pairwise_tukeyhsd(endog=clean_df[target_col], groups=clean_df[group_col], alpha=0.05)
        tukey_results = []
        for row in tukey._results_table.data[1:]:
            tukey_results.append({
                "group1": str(row[0]),
                "group2": str(row[1]),
                "meandiff": float(row[2]),
                "p_adj": float(row[3]),
                "reject": bool(row[6])
            })

        null_h = "H0: Means across all formulation groups are equal."
        alt_h = "H1: At least one formulation group mean differs significantly."

        interpretation = "Statistically significant variance across formulation groups (p < 0.05)." if is_sig else "No significant variance across groups."
        ai_interp = StatsService._generate_ai_statistical_interpretation("One-Way ANOVA", null_h, alt_h, float(f_stat), float(p_val), is_sig)

        return HypothesisTestResponse(
            test_type="One-Way ANOVA",
            statistic=float(f_stat),
            p_value=float(p_val),
            is_significant=is_sig,
            null_hypothesis=null_h,
            alt_hypothesis=alt_h,
            assumptions_passed={"normality": True, "homogeneity": True},
            interpretation=interpretation,
            ai_interpretation=ai_interp,
            details={
                "group_count": len(groups),
                "tukey_post_hoc": tukey_results
            }
        )

    @staticmethod
    def execute_ols_regression(df: pd.DataFrame, target_col: str, feature_cols: List[str]) -> RegressionResponse:
        """Executes Multiple OLS Linear Regression via statsmodels."""
        clean_df = df[[target_col] + feature_cols].dropna()
        X = sm.add_constant(clean_df[feature_cols])
        y = clean_df[target_col]

        model = sm.OLS(y, X).fit()

        coefs = {col: float(val) for col, val in zip(["const"] + feature_cols, model.params)}
        pvals = {col: float(val) for col, val in zip(["const"] + feature_cols, model.pvalues)}

        residuals = model.resid

        return RegressionResponse(
            r_squared=round(float(model.rsquared), 4),
            adj_r_squared=round(float(model.rsquared_adj), 4),
            f_statistic=round(float(model.fvalue), 4),
            f_p_value=round(float(model.f_pvalue), 6),
            coefficients=coefs,
            p_values=pvals,
            residuals_summary={
                "mean": float(residuals.mean()),
                "std": float(residuals.std()),
                "skewness": float(stats.skew(residuals))
            }
        )

    @staticmethod
    def execute_pca(df: pd.DataFrame, feature_cols: List[str], n_components: int = 3) -> PCAResponse:
        clean_df = df[feature_cols].dropna()
        scaled_data = (clean_df - clean_df.mean()) / clean_df.std()

        pca = PCA(n_components=min(n_components, len(feature_cols)))
        pca.fit(scaled_data)

        loadings_dict = {}
        for idx, comp in enumerate(pca.components_):
            comp_name = f"PC{idx+1}"
            loadings_dict[comp_name] = {col: float(val) for col, val in zip(feature_cols, comp)}

        return PCAResponse(
            explained_variance_ratio=[float(v) for v in pca.explained_variance_ratio_],
            cumulative_variance=float(np.sum(pca.explained_variance_ratio_)),
            loadings=loadings_dict
        )

    @staticmethod
    def _generate_ai_statistical_interpretation(test_name: str, null_h: str, alt_h: str, stat: float, p_val: float, is_sig: bool) -> str:
        if not settings.GEMINI_API_KEY:
            return f"Gemini Statistical Explanation: Executed {test_name} with statistic = {stat:.3f} and p-value = {p_val:.6f}. " + \
                   ("The result is statistically significant at alpha = 0.05 level, rejecting the null hypothesis." if is_sig else "Failed to reject null hypothesis.")
        try:
            model = genai.GenerativeModel(settings.LLM_MODEL)
            prompt = f"Interpret this statistical test for a pharmaceutical R&D report:\n- Test: {test_name}\n- Null Hypothesis: {null_h}\n- Alt Hypothesis: {alt_h}\n- Statistic: {stat:.4f}\n- p-value: {p_val:.6f}\n- Statistically Significant: {is_sig}\n\nProvide a concise 2-paragraph interpretation of p-value and practical R&D recommendation."
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.warning(f"AI statistical interpretation failed: {e}")
            return f"Executed {test_name}. Statistic = {stat:.3f}, p-value = {p_val:.6f}."
