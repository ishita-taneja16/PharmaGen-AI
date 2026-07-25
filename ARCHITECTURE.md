# Software & Agent Architecture Specification – PharmaGen AI

## 1. High-Level Architecture Overview

PharmaGen AI is an enterprise-grade R&D intelligence platform designed following **Clean Architecture** (Domain-Driven Design) and **SOLID principles**. The architecture ensures strict separation of concerns, high testability, horizontal scalability, and seamless integration between classical statistical engines, machine learning pipelines, vector similarity search, and multi-agent LLM orchestration.

```
+---------------------------------------------------------------------------------------------------+
|                                      PRESENTATION LAYER                                           |
|  +---------------------------------------------------------------------------------------------+  |
|  | Modern React 18 SPA (TypeScript + Vite + Tailwind CSS + Shadcn UI + Recharts)               |  |
|  | Features: File Dropzone, Interactive Data Grid, Plotly/Recharts UI, Multi-Agent Chat Panel  |  |
|  +---------------------------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  v  (HTTPS / WSS / JWT Auth)
+---------------------------------------------------------------------------------------------------+
|                                   GATEWAY & SECURITY LAYER                                        |
|  +---------------------------------------------------------------------------------------------+  |
|  | Nginx Reverse Proxy (SSL/TLS, Rate Limiting, CORS, Static Asset Caching)                    |  |
|  | OAuth2 / JWT Authentication & RBAC Middleware (Admin, Lead Researcher, Scientist, Auditor)   |  |
|  +---------------------------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
|                                  APPLICATION CORE (FASTAPI BACKEND)                               |
|                                                                                                   |
|  +---------------------------------------------------------------------------------------------+  |
|  | REST & WebSocket API Routers (DTO validation via Pydantic v2)                              |  |
|  +---------------------------------------------------------------------------------------------+  |
|                                                  |                                                |
|  +---------------------------------------------------------------------------------------------+  |
|  | Core Application Services & Domain Handlers                                                  |  |
|  |  ├── Paper Intelligence Service (PDF OCR, Chunking, Keyword/Topic Extraction)               |  |
|  |  ├── Experiment Analytics Service (Data Cleaning, Imputation, Outliers, Feature Eng)        |  |
|  |  ├── Statistical Analysis Service (T-Test, ANOVA, Chi-Square, PCA, Regressions)            |  |
|  |  ├── Machine Learning Service (XGBoost/LightGBM/CatBoost, AutoML, SHAP XAI)                  |  |
|  |  ├── Text-to-SQL Service (Schema Context Engine, sqlglot AST Guard, Execution Engine)      |  |
|  |  └── Compliance Service (SOP Rule Matching, Gap Analysis, Risk Scoring Engine)              |  |
|  +---------------------------------------------------------------------------------------------+  |
|                                                  |                                                |
|  +---------------------------------------------------------------------------------------------+  |
|  | LangGraph Multi-Agent Orchestration Layer                                                  |  |
|  | Shared State Machine Graph: [Supervisor] -> [Research|Stats|ML|SQL|Compliance|Report]        |  |
|  +---------------------------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------------------------+
                                                  |
         +----------------------------------------+---------------------------------------+
         |                                        |                                       |
         v                                        v                                       v
+-----------------------------------+  +----------------------------------+  +--------------------------------+
| DATA LAYER                        |  | MLOPS & OBSERVABILITY            |  | AI INFRASTRUCTURE              |
| ├── PostgreSQL 16 (Relational DB) |  | ├── MLflow (Model Registry)      |  | ├── Google Gemini 1.5 Pro API  |
| └── pgvector (HNSW Index Engine)  |  | ├── Prometheus (Metrics Engine)  |  | └── Gemini Text Embeddings     |
| └── Redis (Cache & Session Store) |  | └── Grafana (Monitoring UI)      |  |                                |
+-----------------------------------+  +----------------------------------+  +--------------------------------+
```

---

## 2. Detailed Module Architecture

### 2.1 Scientific Paper Intelligence Engine
- **Ingestion & OCR Pipeline**: PDF documents are received via async multipart uploads. Scanned pages are processed via `PDFPlumber` (text/tables) and fallback `Tesseract OCR` for image-only layers.
- **Chunking & Embedding**: Text is parsed into semantic overlapping chunks (512 tokens with 50-token overlap). Embeddings are generated asynchronously using `Google Gemini text-embedding-004` (768 dimensions).
- **Indexing & Hybrid RAG**: Embeddings are stored in PostgreSQL using `pgvector` with HNSW cosine distance indexing (`m=16`, `ef_construction=64`). RAG queries employ hybrid search combining full-text lexical search (`tsvector`) and vector similarity via Reciprocal Rank Fusion (RRF).
- **Keyword & Topic Extraction**: Uses YAKE/RAKE algorithms for rapid keyword scoring and BERTopic/LDA for latent topic modeling across scientific paper corpora.
- **Citation Parser**: Regex and LLM-assisted citation parsing extract references into standard BibTeX and CrossRef formats.

### 2.2 Experiment Analytics Engine
- **Ingestion**: Supports CSV/Parquet uploads up to 500MB via streaming chunk validation.
- **Data Quality Assessment**: Computes missingness rates and applies automated strategies (KNN Imputation, MICE, median/mode fill).
- **Outlier Detection**: Employs an ensemble of Isolation Forest (contamination parameter tunable), Z-Score (`|z| > 3`), and IQR (`1.5 * IQR`) methods.
- **Feature Engineering**: Automated generation of polynomial interactions, standard/min-max scaling, logarithmic transforms, and high-cardinality target encoding.

### 2.3 Statistical Analysis Engine
- **Hypothesis Testing**: Interfaces with `SciPy.stats` and `StatsModels` to execute:
  - Two-Sample Independent & Paired T-Tests (checking normality via Shapiro-Wilk and homoscedasticity via Levene's test).
  - One-Way & Two-Way ANOVA with Tukey HSD post-hoc testing.
  - Chi-Square Test of Independence with Cramer's V effect size.
- **Regression Modeling**: Ordinary Least Squares (OLS) Linear Regression, Logistic Regression, Ridge/Lasso regularization with diagnostic residue plots (QQ-plots, residual vs fitted).
- **Dimensionality Reduction**: Principal Component Analysis (PCA) with scree plots, cumulative variance thresholds, and loading vector matrices.
- **Confidence Intervals**: Parametric and non-parametric Bootstrap (10,000 resamples) 95% Confidence Intervals for mean differences and effect sizes.

### 2.4 Machine Learning Engine (R&D & Manufacturing)
- **Model Algorithms**: High-performance gradient boosting frameworks: `XGBoost`, `LightGBM`, and `CatBoost`.
- **Target Workflows**:
  1. *Drug Yield Prediction*: Continuous regression targeting active ingredient yield (%).
  2. *Batch Quality Prediction*: Multi-class and binary classification for pass/fail/rework quality outcomes.
  3. *Manufacturing Failure Forecasting*: Early-warning anomaly detection for bioreactor or tableting press failures.
- **AutoML Pipeline**: Automated feature selection, hyperparameter tuning via Optuna, and cross-validated model selection.
- **Explainable AI (XAI)**: Integrated `SHAP` (SHapley Additive exPlanations) computing TreeExplainer force plots, summary bar charts, and waterfall plots for individual prediction auditability.
- **MLOps Integration**: Every training run registers parameters, metrics (RMSE, R², ROC-AUC, F1), and model artifacts to the MLflow Model Registry.

### 2.5 Safe Natural Language SQL (Text-to-SQL) Engine
- **Schema Context Builder**: Dynamically extracts relational schemas, column data types, foreign key constraints, and sample domain values into a concise prompt template.
- **AST Generation & Parsing**: Google Gemini generates candidate SQL. The candidate SQL is passed to `sqlglot` for Abstract Syntax Tree (AST) validation:
  - Enforces `SELECT`-only read-only statements.
  - Rejects `DROP`, `DELETE`, `UPDATE`, `INSERT`, `ALTER`, `TRUNCATE`, `EXEC`.
  - Enforces table and column whitelisting.
- **Execution Guard**: SQL is executed inside a read-only database transaction with a 3.0-second timeout and strict row limits (`LIMIT 500`).
- **Auto-Visualization**: Query response schema is analyzed to dynamically recommend and format chart JSON (e.g., bar chart for categorical vs numeric, scatter for numeric vs numeric).

### 2.6 Compliance Checker & 21 CFR Part 11 Engine
- **SOP Parsing**: Standard Operating Procedures (SOPs) are indexed into pgvector rules.
- **Verification Matrix**: Experimental log steps are compared sequentially against SOP requirements using semantic text matching and rule evaluation logic.
- **Gap Identification & Risk Score**: Identifies missing steps, out-of-spec parameters (e.g., temperature deviation), and computes a quantitative Risk Score (0-100 scale).
- **Audit Trail**: Every evaluation generates an immutable audit record containing timestamp, user ID, SOP version, experiment ID, checksum, and compliance verdict.

---

## 3. LangGraph Multi-Agent Architecture

The AI Research Assistant is structured as a stateful, multi-agent system built on **LangGraph**. The system utilizes a **Supervisor / Router Pattern** where a central Supervisor Agent inspects the user query and delegates execution to specialized domain agents.

```
                                +-------------------+
                                |    USER QUERY     |
                                +-------------------+
                                          |
                                          v
                                +-------------------+
                                |  SUPERVISOR AGENT |
                                +-------------------+
                                          |
        +------------------+--------------+-------------+------------------+------------------+
        |                  |              |             |                  |                  |
        v                  v              v             v                  v                  v
+---------------+  +---------------+  +----------+  +----------+  +------------------+  +---------------+
| Research Agent|  | Statistics    |  | ML Agent |  | SQL Agent|  | Compliance Agent |  | Report Agent  |
|               |  | Agent         |  |          |  |          |  |                  |  |               |
| • Paper RAG   |  | • T-Test/ANOVA|  | • XGBoost|  | • Text-  |  | • SOP Gap Check  |  | • PDF/MD Sync |
| • Citations   |  | • PCA         |  | • SHAP   |  |   to-SQL |  | • Risk Scoring   |  | • Executive   |
| • Topic Mine  |  | • Regressions |  | • AutoML |  | • Safety |  | • Audit Log      |  |   Summary     |
+---------------+  +---------------+  +----------+  +----------+  +------------------+  +---------------+
        |                  |              |             |                  |                  |
        +------------------+--------------+-------------+------------------+------------------+
                                          |
                                          v
                                +-------------------+
                                | SHARED STATE LIST |
                                +-------------------+
                                          |
                                          v
                                +-------------------+
                                |  FINAL RESPONSE   |
                                +-------------------+
```

### 3.1 Agent Responsibilities
1. **Supervisor Agent**: Inspects user intent, manages routing, validates intermediate outputs, and controls loop iterations.
2. **Research Agent**: Executes paper vector search, extracts literature quotes, parses citations, and formats academic summaries.
3. **Statistics Agent**: Selects appropriate hypothesis tests (T-Test vs ANOVA), prepares dataset inputs, runs SciPy, and interprets p-values.
4. **ML Agent**: Handles model selection, training requests, evaluation metric compilation, and SHAP feature importance extraction.
5. **SQL Agent**: Translates natural language questions to database queries, passes them through the SQL Guard, executes, and formats tabular data.
6. **Compliance Agent**: Compares experimental protocols against uploaded SOPs, highlights protocol gaps, and updates audit records.
7. **Report Agent**: Synthesizes structured data from prior agents into executive R&D reports with integrated markdown tables and charts.

### 3.2 Agent State Schema (`AgentState`)
```python
from typing import TypedDict, Annotated, List, Dict, Any
from langchain_core.messages import BaseMessage
import operator

class AgentState(TypedDict):
    messages: Annotated[List[BaseMessage], operator.add]
    next_agent: str
    current_experiment_id: str | None
    current_dataset_id: str | None
    rag_context: List[Dict[str, Any]]
    statistical_results: Dict[str, Any]
    ml_model_artifacts: Dict[str, Any]
    sql_result: Dict[str, Any]
    compliance_report: Dict[str, Any]
    final_report: str | None
```

---

## 4. Technology Selection & Rationale

| Domain | Selected Technology | Alternative Evaluated | Key Architectural Justification |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React 18 + Vite | Next.js / Angular | Client-heavy SPA interactive dashboard logic requires zero SSR complexity. Vite offers instantaneous HMR and lightweight bundle sizes. |
| **Styling Engine** | Tailwind CSS + Shadcn UI | Material UI / Bootstrap | Utility-first architecture prevents CSS specificity bloat. Shadcn provides accessible, unstyled primitives customizable for pharma theme. |
| **Backend Framework** | FastAPI (Python 3.11) | Django / Flask | Native asynchronous IO, sub-millisecond route dispatch, auto OpenAPI documentation, and seamless integration with PyData/ML stack. |
| **Database & Vector** | PostgreSQL 16 + pgvector | Pinecone / Qdrant + Postgres | Prevents multi-database transactional split-brain issues. Keeps relational metadata and vector embeddings in a single ACID-compliant store. |
| **LLM Provider** | Google Gemini 1.5 Pro | OpenAI GPT-4o / Claude 3.5 | 1M+ token context window enables ingestion of full 50-page scientific papers and multi-table database schemas at lower latency and cost. |
| **Agent Orchestration** | LangGraph | AutoGen / CrewAI | Cyclic state graph support, explicit human-in-the-loop validation breakpoints, and production-grade state persistence. |
| **Machine Learning** | XGBoost + LightGBM + CatBoost | Deep Learning (PyTorch) | Tabular drug formulation datasets perform significantly better with tree-based gradient boosting models than deep neural networks. |
| **Model Tracking** | MLflow | Weights & Biases | Open-source, self-hosted, GxP enterprise compatible with full model registry and artifact storage capabilities. |

---

## 5. Security, RBAC & 21 CFR Part 11 Compliance

### 5.1 Authentication & RBAC
- **Authentication**: Dual-token OAuth2 architecture. Access Tokens (short-lived 30-min JWT signed with HS256/RS256) + Refresh Tokens (7-day duration stored in HTTP-only secure cookies).
- **Role-Based Access Control (RBAC)**:
  - `ADMIN`: User management, system configuration, audit log inspection.
  - `LEAD_RESEARCHER`: Full experiment creation, model training, SOP uploading, report sign-off.
  - `RESEARCH_SCIENTIST`: Run analytics, execute statistics, execute NL-SQL, RAG paper query.
  - `AUDITOR`: Read-only access to compliance reports, experimental data, and immutable audit logs.

### 5.2 21 CFR Part 11 Audit Security
To meet FDA 21 CFR Part 11 regulations for electronic records in pharmaceutical R&D:
- **Audit Trails**: All system actions (data uploads, analysis runs, model predictions, SOP evaluations) automatically append to an append-only `audit_logs` table.
- **Data Integrity**: Audit records store cryptographic SHA-256 hashes of the target payload, user ID, timestamp, and IP address.
- **Non-Repudiation**: Electronic signatures required for final report export and SOP approval.

---

## 6. MLOps, Monitoring & Deployment Architecture

```
                                  +-----------------------+
                                  |  GITHUB ACTIONS CI/CD |
                                  +-----------------------+
                                              |
                                              v
                              +-------------------------------+
                              | DOCKER REGISTRY (IMAGES BUILD)|
                              +-------------------------------+
                                              |
                                              v
                              +-------------------------------+
                              |    AWS EC2 / DOCKER COMPOSE   |
                              +-------------------------------+
                                              |
      +------------------------+--------------+------------------------+
      |                        |                                       |
      v                        v                                       v
+------------------+  +-------------------+                  +------------------+
| FASTAPI BACKEND  |  | POSTGRES + PGVECTOR|                 | MLFLOW SERVICE   |
| (Prometheus Metrics)|(Performance Queries)                  | (Model Registry) |
+------------------+  +-------------------+                  +------------------+
      |                        |                                       |
      +------------------------+--------------+------------------------+
                                              |
                                              v
                                  +-----------------------+
                                  |   GRAFANA DASHBOARD   |
                                  | (Latency, Errors, GPU)|
                                  +-----------------------+
```

- **MLflow Tracking Server**: Stores model run parameters, metrics (RMSE, R², AUC), model binaries, and SHAP summary artifacts.
- **Prometheus Metrics**: Exposes backend API latency histograms, HTTP error rates, DB query durations, and LLM token usage counters.
- **Grafana Dashboards**: Real-time visualization of server health, active user sessions, ML prediction latency, and vector search query times.
- **CI/CD Pipeline**: GitHub Actions automates linting (Ruff/ESLint), unit testing (PyTest), container builds, and deployment to AWS EC2 via Nginx.
