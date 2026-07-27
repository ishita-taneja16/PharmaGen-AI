from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID
from app.domain.models import UserRole

# --- AUTH SCHEMAS ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str
    role: UserRole = UserRole.RESEARCH_SCIENTIST

class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    full_name: str
    role: UserRole
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int

# --- DASHBOARD SCHEMAS ---
class DashboardMetrics(BaseModel):
    total_papers: int
    total_datasets: int
    total_experiments: int
    total_ml_models: int
    total_compliance_reports: int
    avg_yield_percentage: Optional[float] = None
    avg_model_r2_score: Optional[float] = None
    overall_compliance_rate: Optional[float] = None

class RecentActivityItem(BaseModel):
    id: str
    title: str
    activity_type: str
    user_name: str
    timestamp: datetime
    status: str

class DashboardSummaryResponse(BaseModel):
    metrics: DashboardMetrics
    papers_over_time: List[Dict[str, Any]] = []
    experiments_over_time: List[Dict[str, Any]] = []
    yield_trend: List[Dict[str, Any]] = []
    model_performance: List[Dict[str, Any]] = []
    compliance_distribution: Dict[str, int] = {}
    recent_activity: List[RecentActivityItem] = []

# --- REPORT SCHEMAS ---
class ReportGenerateRequest(BaseModel):
    title: str = "Executive Pharmaceutical R&D Synthesis Report"
    include_literature: bool = True
    include_stats: bool = True
    include_ml: bool = True
    include_compliance: bool = True
    format_type: str = Field("pdf", description="pdf, excel, pptx")

# --- PAPER SCHEMAS ---
class PaperSearchRequest(BaseModel):
    query: str
    top_k: int = 5
    min_similarity: float = 0.70
    filter_journal: Optional[str] = None

class PaperSearchResult(BaseModel):
    paper_id: UUID
    paper_title: str
    chunk_index: int
    content: str
    similarity_score: float
    page_number: Optional[int] = None

class PaperSearchResponse(BaseModel):
    query: str
    results: List[PaperSearchResult]

# --- ANALYTICS SCHEMAS ---
class AnalyticsSummaryResponse(BaseModel):
    dataset_id: UUID
    total_rows: int
    total_columns: int
    columns: List[str]
    missing_values: Dict[str, int]
    outliers_detected: Dict[str, Any]

# --- STATS SCHEMAS ---
class HypothesisTestRequest(BaseModel):
    dataset_id: UUID
    test_type: str = Field(..., description="TTEST_IND, WELCH_TTEST, TTEST_REL, ANOVA, CHISQUARE")
    group_column: str
    target_column: str
    alpha: float = 0.05

class HypothesisTestResponse(BaseModel):
    test_type: str
    statistic: float
    p_value: float
    is_significant: bool
    null_hypothesis: str
    alt_hypothesis: str
    assumptions_passed: Dict[str, bool]
    interpretation: str
    ai_interpretation: Optional[str] = None
    details: Dict[str, Any] = {}

class RegressionRequest(BaseModel):
    dataset_id: UUID
    target_column: str
    feature_columns: List[str]
    regression_type: str = "OLS"

class RegressionResponse(BaseModel):
    r_squared: float
    adj_r_squared: float
    f_statistic: float
    f_p_value: float
    coefficients: Dict[str, float]
    p_values: Dict[str, float]
    residuals_summary: Dict[str, float]

class PCARequest(BaseModel):
    dataset_id: UUID
    feature_columns: List[str]
    n_components: int = 3

class PCAResponse(BaseModel):
    explained_variance_ratio: List[float]
    cumulative_variance: float
    loadings: Dict[str, Dict[str, float]]

# --- ML SCHEMAS ---
class MLTrainRequest(BaseModel):
    dataset_id: UUID
    model_type: str = Field(..., description="xgboost, lightgbm, catboost, random_forest")
    target_column: str
    task_type: str = Field(..., description="regression, classification")
    hyperparameters: Dict[str, Any] = {}

class MLTrainResponse(BaseModel):
    model_id: UUID
    model_name: str
    model_type: str
    mlflow_run_id: Optional[str] = None
    metrics: Dict[str, float]
    cross_val_scores: List[float]
    feature_importance: Dict[str, float]
    shap_summary: Optional[Dict[str, float]] = {}
    ai_model_interpretation: Optional[str] = None


class MLCompareRequest(BaseModel):
    dataset_id: UUID
    target_column: str
    task_type: str = Field(..., description="regression, classification")


class MLCompareResponse(BaseModel):
    target_variable: str
    task_type: str
    best_model: str
    models_benchmark: List[Dict[str, Any]]

class PredictRequest(BaseModel):
    model_id: UUID
    input_features: Dict[str, float]

class PredictResponse(BaseModel):
    model_id: UUID
    prediction: float
    shap_values: Dict[str, float]

# --- SQL SCHEMAS ---
class SQLQueryRequest(BaseModel):
    prompt: str
    dataset_id: Optional[UUID] = None


class SQLQueryResponse(BaseModel):
    generated_sql: str
    execution_status: str
    execution_time_ms: float
    columns: List[str]
    rows: List[List[Any]]
    recommended_chart: Dict[str, Any]
    explanation: str
    scalar_result: Optional[Dict[str, Any]] = None


# --- COMPLIANCE SCHEMAS ---
class SOPCreate(BaseModel):
    sop_code: str
    title: str
    version: str


class ComplianceVerifyRequest(BaseModel):
    experiment_id: UUID
    sop_code: str


class ComplianceVerifyResponse(BaseModel):
    report_id: UUID
    compliance_score: float
    overall_status: str
    risk_level: str
    missing_steps: List[Dict[str, Any]]
    parameter_deviations: List[Dict[str, Any]]
    capa_recommendations: List[str]
    risk_score: float
    audit_log_id: UUID
    payload_hash: str


# --- AGENT SCHEMAS ---
class AgentChatRequest(BaseModel):
    session_id: Optional[UUID] = None
    prompt: str
    experiment_id: Optional[UUID] = None
    dataset_id: Optional[UUID] = None


class AgentChatResponse(BaseModel):
    session_id: UUID
    response_text: str
    active_agents: List[str]
    skipped_agents: List[str] = []
    executed_agent: str = "ResearchAgent"
    artifacts: Dict[str, Any] = {}

class ExperimentCreateRequest(BaseModel):
    dataset_id: UUID
    title: str
    formulation_code: str
    batch_number: str
    parameters: Dict[str, Any] = {}


class ExperimentLogItem(BaseModel):
    step_number: int
    step_description: str


class ExperimentLogRequest(BaseModel):
    logs: list[ExperimentLogItem]