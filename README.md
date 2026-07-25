# PharmaGen AI – Intelligent Pharmaceutical R&D Assistant

![PharmaGen AI Banner](https://img.shields.io/badge/Enterprise-Pharmaceutical_R%26D-blue?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI_0.111-009688?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/Frontend-React_18_v3-61DAFB?style=for-the-badge&logo=react)
![PostgreSQL](https://img.shields.io/badge/Vector_DB-PostgreSQL_16_%2B_pgvector-4169E1?style=for-the-badge&logo=postgresql)
![LangGraph](https://img.shields.io/badge/AI_Orchestration-LangGraph-FF6F61?style=for-the-badge)
![MLflow](https://img.shields.io/badge/MLOps-MLflow-0194E2?style=for-the-badge&logo=mlflow)

**PharmaGen AI** is an enterprise-grade, end-to-end SaaS platform engineered specifically for modern pharmaceutical research, drug development, and manufacturing quality control. Built to serve world-leading pharmaceutical enterprises, PharmaGen AI unifies scientific literature intelligence, clinical/experimental analytics, machine learning predictive models, safe Text-to-SQL exploration, 21 CFR Part 11 SOP compliance auditing, and multi-agent AI orchestration.

---

## 📌 Key Features

### 1. Scientific Paper Intelligence
- **PDF Upload & Parsing**: Extraction of text, mathematical formulas, and tables from multi-page scientific papers using PDFPlumber and Tesseract OCR.
- **RAG & Hybrid Search**: Vector embeddings generated via Google Gemini, indexed in PostgreSQL (`pgvector` with HNSW cosine distance).
- **Text Mining & Topic Modeling**: Automated keyword extraction (YAKE/RAKE) and topic modeling (BERTopic/LDA) for literature landscape synthesis.
- **Summarization & Citations**: Automatic executive summarization with inline citation extraction (BibTeX / DOI linking).

### 2. Experiment Analytics
- **CSV Data Ingestion**: Schema validation and automated ingestion of high-throughput experimental datasets.
- **Data Quality & Imputation**: Missing value detection with advanced imputation (KNN, MICE, median/mode).
- **Outlier Detection**: Anomaly detection using Isolation Forests, Z-score thresholds, and Interquartile Range (IQR) filtering.
- **Automated Feature Engineering**: Polynomial features, interaction variables, and logarithmic transformations.

### 3. Statistical Analysis
- **Hypothesis Testing**: Two-sample Independent T-Test, Paired T-Test, One-Way ANOVA, and Chi-Square test of independence.
- **Parametric & Non-Parametric Modeling**: Linear and Logistic Regression modeling with diagnostic residue plots.
- **Dimensionality Reduction**: Principal Component Analysis (PCA) with scree plot analysis and component variance ratios.
- **Confidence Intervals**: Parametric and Bootstrap 95% Confidence Intervals for critical experimental metrics.

### 4. Machine Learning Engine (Drug R&D & Manufacturing)
- **Drug Yield Prediction**: Gradient-boosted regression (XGBoost, LightGBM, CatBoost) to predict active pharmaceutical ingredient (API) yield.
- **Batch Quality Classification**: High-dimensional classification for batch pass/fail prediction.
- **Manufacturing Failure Forecasting**: Anomaly detection to foresee equipment or process degradation.
- **AutoML & Model Comparison**: Comprehensive evaluation comparing RMSE, MAE, R², F1-Score, ROC-AUC across candidate algorithms.
- **Explainable AI (XAI)**: Global and local feature attribution using SHAP (SHapley Additive exPlanations) summary plots and force plots.

### 5. Natural Language SQL (Text-to-SQL)
- **Schema-Aware Query Generation**: Converts natural language prompts (e.g., *"Which formulation produced the highest yield in Q3?"*) into optimized SQL queries.
- **Strict Execution Guardrails**: Enforces read-only AST parsing using `sqlglot`, table/column whitelisting, parameterized bindings, and strict query execution timeouts.
- **Automated Data Visualization**: Automatically maps query result sets to appropriate interactive charts (Plotly / Recharts).

### 6. SOP Compliance Checker & 21 CFR Part 11 Audit
- **Standard Operating Procedure (SOP) Parsing**: Automated extraction of required operational steps from regulatory document PDFs.
- **Experimental Verification**: Automated alignment verification comparing actual lab execution logs against SOP baseline specifications.
- **Risk Scoring & Gap Identification**: Calculates quantitative compliance risk scores, highlights missing/skipped steps, and logs immutable audit events.

### 7. LangGraph Multi-Agent Research Assistant
- Stateful, multi-agent graph architecture executing cross-functional research tasks:
  1. **Research Agent**: Literature synthesis, RAG retrieval, citation verification.
  2. **Statistics Agent**: Formulates hypotheses, executes T-Tests, ANOVA, and PCA.
  3. **ML Agent**: Trains predictive models, tunes hyperparameters, generates SHAP plots.
  4. **SQL Agent**: Formulates safe database queries, retrieves raw tabular metrics.
  5. **Compliance Agent**: Checks experimental procedures against regulatory SOPs.
  6. **Report Agent**: Synthesizes output from all agents into executive PDF/Markdown reports.

---

## 🛠️ Technology Stack & Rationale

| Layer | Technology | Engineering Rationale |
| :--- | :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS | Enterprise-grade UI component architecture with static type safety, sub-second HMR via Vite, and customizable utility-first styling. |
| **Backend API** | FastAPI, Python 3.11, Pydantic v2 | High-performance asynchronous IO, native async/await for I/O heavy AI/ML pipelines, strict input validation via Pydantic. |
| **Database & Vector** | PostgreSQL 16 + `pgvector` | Eliminates dual-database synchronization lag by combining ACID-compliant relational tables with high-density vector search (HNSW index). |
| **LLM & Agent Framework** | Google Gemini 1.5, LangChain, LangGraph | State-of-the-art context window, cost-effective inference, and deterministic stateful multi-agent execution graphs. |
| **ML & Statistics** | Scikit-learn, SciPy, StatsModels, XGBoost, CatBoost, LightGBM, SHAP | De-facto industry standard for classical ML, statistical hypothesis testing, high-performance gradient boosting, and explainability. |
| **MLOps & Monitoring** | MLflow, Prometheus, Grafana | Experiment tracking, model versioning, registry governance, system metrics monitoring, and operational observability. |
| **Security & Auth** | OAuth2 + JWT (Access/Refresh), Passlib (Bcrypt), RBAC | Enterprise RBAC (Admin, Lead Researcher, Scientist, Auditor) with token revocation and encrypted secret handling. |
| **Containerization** | Docker, Docker Compose, Nginx | Modular container orchestration, reverse proxy SSL handling, and reproducible environments across dev/staging/prod. |

---

## 📂 Repository Directory Structure

```
PharmaAI/
├── .github/
│   └── workflows/
│       └── ci-cd.yml             # Automated testing, linting, and deployment pipeline
├── docker/
│   ├── Dockerfile.backend        # FastAPI multi-stage build
│   ├── Dockerfile.frontend       # React + Vite Nginx production build
│   ├── nginx.conf                # Nginx reverse proxy & SSL config
│   └── prometheus.yml            # Prometheus monitoring configuration
├── docker-compose.yml            # Services orchestration (DB, API, Web, MLflow, Prometheus, Grafana)
├── README.md                     # Master documentation & developer guide
├── ARCHITECTURE.md               # Software & Agent Architecture design specification
├── DATABASE.md                   # PostgreSQL DDLs, ER diagram, and index strategies
├── API.md                        # OpenAPI 3.0 endpoints specification & DTO contracts
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── endpoints/    # Auth, Papers, Analytics, Stats, ML, SQL, Compliance, Agents
│   │   │       └── router.py
│   │   ├── core/                 # Config, DB connections, Security, Exception handlers
│   │   ├── domain/               # Domain Entities, Value Objects, Pydantic DTOs
│   │   ├── services/             # Core business logic (Paper, ML, Stats, SQL, Compliance)
│   │   ├── agents/               # LangGraph state machine & 6 specialized agents
│   │   └── utils/                # PDF parser, SQL AST Guard, Logging wrappers
│   ├── tests/                    # PyTest unit & integration tests
│   ├── pyproject.toml
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/           # UI modules (Papers, Analytics, Stats, ML, SQL, Compliance, Assistant)
    │   ├── pages/                # Route level pages
    │   ├── services/             # Axios API client integrations
    │   ├── store/                # Zustand global state stores
    │   ├── types/                # TypeScript interface declarations
    │   ├── App.tsx
    │   └── main.tsx
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.ts
```

---

## 🚀 Quickstart & Installation

### Prerequisites
- Docker Engine v24.0+ & Docker Compose v2.20+
- Python 3.11+
- Node.js 20+ & npm 10+
- Google Gemini API Key

### Environment Setup
Create a `.env` file in the root directory:
```env
# General System Config
PROJECT_NAME="PharmaGen AI"
ENVIRONMENT="development"
SECRET_KEY="your-super-secret-jwt-key-change-in-production"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Database Configuration
POSTGRES_USER="pharmagen"
POSTGRES_PASSWORD="secure_pharma_password_2026"
POSTGRES_DB="pharmagen_db"
POSTGRES_HOST="db"
POSTGRES_PORT=5432
DATABASE_URL="postgresql+asyncpg://pharmagen:secure_pharma_password_2026@db:5432/pharmagen_db"

# LLM & AI Engine
GEMINI_API_KEY="your_google_gemini_api_key_here"
EMBEDDING_MODEL="models/text-embedding-004"
LLM_MODEL="gemini-1.5-pro"

# MLOps Config
MLFLOW_TRACKING_URI="http://mlflow:5000"
```

### Docker Compose Deployment
To build and run all services concurrently:
```bash
docker-compose up --build -d
```
Access points:
- **Frontend Dashboard**: `http://localhost:3000`
- **FastAPI OpenAPI Specs**: `http://localhost:8000/docs`
- **MLflow Tracking Dashboard**: `http://localhost:5000`
- **Grafana Monitoring**: `http://localhost:3001` (admin / admin)

---

## 🗺️ Implementation Roadmap

```
[Phase 1: Architecture & Specs] ──> [Phase 2: Core Infra & Auth] ──> [Phase 3: Domain Services]
                                                                              │
[Phase 6: Enterprise MLOps & CI/CD] <── [Phase 5: Multi-Agent & UI] <────────┘
```

1. **Phase 1: Architecture & Technical Specifications** *(Completed)*
   - Complete system architectural blueprints (`ARCHITECTURE.md`).
   - Relational DDLs & vector index specifications (`DATABASE.md`).
   - Complete REST API & WebSocket contract definitions (`API.md`).
2. **Phase 2: Core Infrastructure & Auth Engine**
   - Async PostgreSQL connection pool setup & Alembic migrations.
   - JWT authentication, refresh token rotation, and RBAC middleware.
3. **Phase 3: Scientific Literature & Statistical Analytics Services**
   - PDF OCR & chunking pipeline; pgvector HNSW indexing.
   - Statistical analysis routines (SciPy/StatsModels) & CSV Analytics engine.
4. **Phase 4: Predictive ML & Safe Text-to-SQL Engines**
   - XGBoost/LightGBM/CatBoost pipelines & SHAP interpretation engine.
   - Read-only AST Text-to-SQL guard & chart auto-generator.
5. **Phase 5: LangGraph Multi-Agent System & React UI Dashboard**
   - 6-Agent state graph orchestration with human-in-the-loop validation.
   - Production React dashboard, interactive visualization, and chat interfaces.
6. **Phase 6: Production Hardening, MLOps & CI/CD**
   - MLflow registry, Prometheus metrics collection, Grafana dashboards.
   - GitHub Actions CI/CD automation & AWS EC2 deployment via Nginx.

---

## 📄 License & Compliance

*Designed under 21 CFR Part 11 regulatory compliance standards for GxP validation. Internal Enterprise Software License – All Rights Reserved.*
