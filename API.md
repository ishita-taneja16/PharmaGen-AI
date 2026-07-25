# API Architecture Specification – PharmaGen AI (OpenAPI 3.0 / WebSocket)

## 1. OpenAPI 3.0 REST Specification Overview

All REST endpoints are prefixed with `/api/v1`. Authentication is enforced via Bearer JWT headers (`Authorization: Bearer <access_token>`). Request and response payloads strictly enforce Pydantic v2 JSON serialization.

---

## 2. Authentication & User Management Endpoints (`/api/v1/auth`)

### 2.1 User Register
- **Endpoint**: `POST /api/v1/auth/register`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "scientist@pfizer.com",
  "password": "StrongPassword123!",
  "full_name": "Dr. Eleanor Vance",
  "role": "RESEARCH_SCIENTIST"
}
```
- **Response** `201 Created`:
```json
{
  "id": "a3b8c9d0-1234-4567-89ab-cdef01234567",
  "email": "scientist@pfizer.com",
  "full_name": "Dr. Eleanor Vance",
  "role": "RESEARCH_SCIENTIST",
  "is_active": true,
  "created_at": "2026-07-25T14:00:00Z"
}
```

### 2.2 User Login (Obtain Tokens)
- **Endpoint**: `POST /api/v1/auth/login`
- **Access**: Public
- **Request Body**: `application/x-www-form-urlencoded` (`username`, `password`)
- **Response** `200 OK`:
```json
{
  "access_token": "eyJhbGciOiJIUzI1Ni...",
  "refresh_token": "d8e9f0a1-2345-6789...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

---

## 3. Scientific Paper Intelligence Endpoints (`/api/v1/papers`)

### 3.1 Upload & Parse PDF Paper
- **Endpoint**: `POST /api/v1/papers/upload`
- **Access**: `LEAD_RESEARCHER`, `RESEARCH_SCIENTIST`
- **Content-Type**: `multipart/form-data` (file: `.pdf`)
- **Response** `202 Accepted`:
```json
{
  "paper_id": "c1d2e3f4-5678-90ab-cdef-1234567890ab",
  "title": "Synthesis and Kinetic Evaluation of Novel API Formulation X-402",
  "total_pages": 18,
  "status": "PROCESSING",
  "message": "PDF uploaded successfully. Background OCR and vector embedding initiated."
}
```

### 3.2 Hybrid RAG Vector Search
- **Endpoint**: `POST /api/v1/papers/search`
- **Access**: All Authenticated Users
- **Request Body**:
```json
{
  "query": "What is the optimal dissolution temperature for formulation X-402?",
  "top_k": 5,
  "min_similarity": 0.75,
  "filter_journal": "Journal of Pharmaceutical Sciences"
}
```
- **Response** `200 OK`:
```json
{
  "query": "What is the optimal dissolution temperature for formulation X-402?",
  "results": [
    {
      "paper_id": "c1d2e3f4-5678-90ab-cdef-1234567890ab",
      "paper_title": "Synthesis and Kinetic Evaluation of Novel API Formulation X-402",
      "chunk_index": 4,
      "content": "The dissolution kinetics of X-402 were evaluated at 37°C ± 0.5°C using USP Apparatus II at 50 rpm...",
      "similarity_score": 0.892,
      "page_number": 6
    }
  ]
}
```

---

## 4. Experiment Analytics Endpoints (`/api/v1/analytics`)

### 4.1 Ingest Dataset & Detect Anomalies
- **Endpoint**: `POST /api/v1/analytics/ingest-csv`
- **Access**: `LEAD_RESEARCHER`, `RESEARCH_SCIENTIST`
- **Content-Type**: `multipart/form-data` (file: `.csv`)
- **Response** `200 OK`:
```json
{
  "dataset_id": "e5f6a7b8-9012-3456-789a-bcdef0123456",
  "summary": {
    "total_rows": 1250,
    "total_columns": 14,
    "missing_values": {
      "temperature": 12,
      "pH_level": 0,
      "yield_pct": 5
    },
    "outliers_detected": {
      "method": "IsolationForest",
      "anomalous_row_count": 18
    }
  }
}
```

---

## 5. Statistical Analysis Endpoints (`/api/v1/stats`)

### 5.1 Execute Hypothesis Testing (T-Test / ANOVA)
- **Endpoint**: `POST /api/v1/stats/hypothesis-test`
- **Access**: `LEAD_RESEARCHER`, `RESEARCH_SCIENTIST`
- **Request Body**:
```json
{
  "dataset_id": "e5f6a7b8-9012-3456-789a-bcdef0123456",
  "test_type": "ANOVA",
  "group_column": "formulation_code",
  "target_column": "yield_percentage",
  "alpha": 0.05
}
```
- **Response** `200 OK`:
```json
{
  "test_type": "One-Way ANOVA",
  "f_statistic": 18.421,
  "p_value": 0.00000412,
  "is_significant": true,
  "degrees_of_freedom": [3, 1246],
  "post_hoc_tukey": [
    { "group_1": "F-101", "group_2": "F-102", "mean_diff": 4.12, "p_adj": 0.001 }
  ],
  "interpretation": "Statistically significant difference in yield across formulation groups (p < 0.001)."
}
```

### 5.2 Execute Dimensionality Reduction (PCA)
- **Endpoint**: `POST /api/v1/stats/pca`
- **Access**: `LEAD_RESEARCHER`, `RESEARCH_SCIENTIST`
- **Request Body**:
```json
{
  "dataset_id": "e5f6a7b8-9012-3456-789a-bcdef0123456",
  "feature_columns": ["temp", "pressure", "ph", "stir_rate", "viscosity"],
  "n_components": 3
}
```
- **Response** `200 OK`:
```json
{
  "explained_variance_ratio": [0.482, 0.291, 0.114],
  "cumulative_variance": 0.887,
  "loadings": {
    "PC1": { "temp": 0.54, "pressure": 0.61, "ph": -0.12, "stir_rate": 0.48, "viscosity": 0.31 }
  }
}
```

---

## 6. Machine Learning Endpoints (`/api/v1/ml`)

### 6.1 Train Predictive Model (Yield / Quality / Failure)
- **Endpoint**: `POST /api/v1/ml/train`
- **Access**: `LEAD_RESEARCHER`
- **Request Body**:
```json
{
  "dataset_id": "e5f6a7b8-9012-3456-789a-bcdef0123456",
  "model_type": "xgboost",
  "target_column": "yield_percentage",
  "task_type": "regression",
  "hyperparameters": {
    "n_estimators": 200,
    "max_depth": 6,
    "learning_rate": 0.05
  }
}
```
- **Response** `200 OK`:
```json
{
  "model_id": "f7a8b9c0-1234-5678-90ab-cdef01234567",
  "mlflow_run_id": "run_9876543210",
  "metrics": {
    "rmse": 1.14,
    "mae": 0.82,
    "r2_score": 0.934
  },
  "feature_importance": {
    "temperature": 0.412,
    "stir_rate": 0.285,
    "pH": 0.181
  }
}
```

### 6.2 Compute SHAP Model Explanations
- **Endpoint**: `POST /api/v1/ml/shap-explain`
- **Access**: All Authenticated Users
- **Request Body**:
```json
{
  "model_id": "f7a8b9c0-1234-5678-90ab-cdef01234567",
  "sample_input": {
    "temperature": 45.2,
    "pressure": 2.1,
    "pH": 6.8,
    "stir_rate": 350
  }
}
```
- **Response** `200 OK`:
```json
{
  "base_value": 82.5,
  "predicted_value": 89.4,
  "shap_values": {
    "temperature": 4.2,
    "stir_rate": 3.1,
    "pH": -0.4
  }
}
```

---

## 7. Natural Language SQL Endpoints (`/api/v1/sql`)

### 7.1 Text-to-SQL Execution
- **Endpoint**: `POST /api/v1/sql/query`
- **Access**: All Authenticated Users
- **Request Body**:
```json
{
  "prompt": "Which formulation produced the highest yield in batch numbers above B-500?"
}
```
- **Response** `200 OK`:
```json
{
  "generated_sql": "SELECT formulation_code, MAX(yield_percentage) AS max_yield FROM experiments WHERE batch_number > 'B-500' GROUP BY formulation_code ORDER BY max_yield DESC LIMIT 1;",
  "execution_status": "SUCCESS",
  "execution_time_ms": 14.2,
  "columns": ["formulation_code", "max_yield"],
  "rows": [
    ["F-409", 96.85]
  ],
  "recommended_chart": {
    "chart_type": "bar",
    "x_axis": "formulation_code",
    "y_axis": "max_yield"
  },
  "explanation": "Formulation F-409 produced the highest yield of 96.85% among all batches higher than B-500."
}
```

---

## 8. Compliance & SOP Endpoints (`/api/v1/compliance`)

### 8.1 Evaluate Experiment Against SOP
- **Endpoint**: `POST /api/v1/compliance/verify`
- **Access**: `LEAD_RESEARCHER`, `AUDITOR`
- **Request Body**:
```json
{
  "experiment_id": "d4e5f6a7-8901-2345-6789-abcdef012345",
  "sop_code": "SOP-MFG-088"
}
```
- **Response** `200 OK`:
```json
{
  "report_id": "b9c0d1e2-3456-7890-abcd-ef0123456789",
  "compliance_score": 85.0,
  "overall_status": "WARNING",
  "missing_steps": [
    { "step_number": 4, "description": "Hold temperature at 60°C for minimum 30 minutes prior to filtration." }
  ],
  "parameter_deviations": [
    { "parameter": "pH", "expected": "6.5 - 7.0", "actual": "7.3" }
  ],
  "risk_score": 35.0,
  "audit_log_id": "a1b2c3d4-5678-90ab-cdef-1234567890ab"
}
```

---

## 9. LangGraph Agent WebSocket Streaming Protocol (`/api/v1/agents/ws`)

### 9.1 WebSocket Connection
- **URL**: `wss://pharmagen-ai.internal/api/v1/agents/ws?token=<jwt_access_token>`

### 9.2 Frame Message Contracts
**Client Request Message**:
```json
{
  "session_id": "session_12345678",
  "prompt": "Synthesize literature on X-402, run an ANOVA test on yield across formulations, and verify compliance with SOP-MFG-088."
}
```

**Server Streaming Response Message (Node Step Execution)**:
```json
{
  "event": "AGENT_STEP",
  "active_agent": "StatisticsAgent",
  "status": "RUNNING",
  "payload": {
    "step_description": "Executing One-Way ANOVA across 4 formulation groups...",
    "partial_output": "ANOVA F-stat: 18.42, p-val: 0.000004"
  }
}
```

**Server Streaming Response Message (Final Synthesis)**:
```json
{
  "event": "AGENT_COMPLETE",
  "session_id": "session_12345678",
  "payload": {
    "final_markdown_report": "# Executive Synthesis Report\n\n...",
    "agents_invoked": ["ResearchAgent", "StatisticsAgent", "ComplianceAgent", "ReportAgent"]
  }
}
```

---

## 10. HTTP Error Response Format

All API errors return a standard JSON payload:

```json
{
  "error_code": "SQL_GUARD_VIOLATION",
  "message": "Forbidden statement type 'DROP' detected in Text-to-SQL candidate query.",
  "timestamp": "2026-07-25T14:05:00Z",
  "path": "/api/v1/sql/query",
  "details": null
}
```

### Standard Status Codes
- `200 OK`: Request succeeded.
- `201 Created`: Resource created.
- `400 Bad Request`: Input validation failure (Pydantic / Malformed JSON).
- `401 Unauthorized`: Missing or expired JWT token.
- `403 Forbidden`: Insufficient RBAC permission.
- `404 Not Found`: Requested record does not exist.
- `422 Unprocessable Entity`: Data schema validation error.
- `500 Internal Server Error`: Unhandled backend exception.
