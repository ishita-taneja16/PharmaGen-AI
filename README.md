# PharmaGen AI – Intelligent Pharmaceutical R&D Assistant

![License](https://img.shields.io/badge/License-Proprietary-blue.svg?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16_%2B_pgvector-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![LangGraph](https://img.shields.io/badge/AI_Orchestration-LangGraph-FF6F61?style=for-the-badge)

**PharmaGen AI** is a specialized, end-to-end pharmaceutical research and development assistant engineered to streamline drug discovery, statistical analytics, predictive machine learning, regulatory compliance verification, and multi-agent AI research workflows.

By unifying literature RAG intelligence, statistical hypothesis testing, AutoML model comparisons, safe text-to-SQL exploration, 21 CFR Part 11 SOP compliance auditing, and intent-routed multi-agent orchestration, PharmaGen AI accelerates experimental synthesis while ensuring strict data integrity.

---

## 📋 Table of Contents

- [✨ Key Features](#-key-features)
- [🏗️ System Architecture](#️-system-architecture)
- [🛠️ Technology Stack](#️-technology-stack)
- [📂 Project Folder Structure](#-project-folder-structure)
- [🚀 Quickstart & Installation](#-quickstart--installation)
- [⚙️ Environment Variables](#️-environment-variables)
- [💻 Usage Instructions](#-usage-instructions)
- [📸 Application Screenshots](#-application-screenshots)
- [🗺️ Implementation Roadmap & Future Enhancements](#️-implementation-roadmap--future-enhancements)
- [📄 License & Compliance](#-license--compliance)

---

## ✨ Key Features

### 📊 1. Dynamic Personalized Executive Dashboard
* **User-Scoped Metrics**: Aggregates real-time counts and metrics for the logged-in user (Indexed Papers, Active Experiments, Predictive Models, Compliance Rate).
* **Dynamic Time-Series & Charts**: Live visualization of model performance and compliance score distribution.
* **Audit Trail Stream**: Logs historical user actions and system events.
* **Interactive Skeletons & Empty States**: Clean loading skeletons and helpful action prompts when datasets or models are first created.

### 🤖 2. Intelligent Intent-Routed Multi-Agent Assistant
* **Supervisor Agent Router**: Evaluates user queries and routes execution to **ONLY** the required domain agent node, skipping unneeded agents.
* **Domain-Specific Agents**:
  * 📘 **Research Agent**: Scientific paper indexing, literature RAG, and citation summaries.
  * 📊 **Statistics Agent**: Descriptive statistics, feature lists, correlation matrices, and ANOVA.
  * 🤖 **ML Agent**: AutoML framework comparison (XGBoost, LightGBM, CatBoost, Random Forest) and SHAP feature importances.
  * 🔍 **SQL Agent**: Safe Text-to-SQL query generation and in-memory SQLite execution.
  * 🛡️ **Compliance Agent**: SOP compliance rule checking and 21 CFR Part 11 audit logging.
  * 📄 **Report Agent**: Comprehensive executive report synthesis generated on demand.
* **Rich AI Response Renderer**: Converts raw response data into interactive React cards, KPI metric badges (`🏆 Best Model`, `⚡ Fastest`, `✔ Validated`), visual SHAP progress bars, and action buttons.
* **Multi-Turn Conversation Memory**: Maintains context for seamless follow-up inquiries.

### 🔬 3. Scientific Paper Intelligence (RAG & Literature Mining)
* **PDF Document Upload & Processing**: Extraction of paper titles, executive summaries, YAKE keywords, and citations.
* **Vector RAG Indexing**: Document embeddings indexed in PostgreSQL using `pgvector` with HNSW cosine distance search.
* **Live Ingestion Polling**: Asynchronous status polling dialog with step-by-step pipeline progress.

### 📈 4. Experiment Analytics & Dataset Workflow
* **CSV Dataset Ingestion UX**: Centered modal with progress bar, missing value detection, and automated data profiling.
* **Dataset ID Persistence**: Auto-links uploaded datasets across statistical analysis, AutoML, and Text-to-SQL modules via persistent application state.

### 📐 5. Statistical Analysis Engine
* **Hypothesis Testing & EDA**: Independent T-Tests, Paired T-Tests, One-Way ANOVA, and Chi-Square tests.
* **Dimensionality Reduction**: Principal Component Analysis (PCA) with variance ratio analysis.
* **Diagnostic Analytics**: Correlation matrices and 95% Confidence Intervals.

### 🧠 6. Predictive Machine Learning Engine
* **Drug Yield & Quality Forecasting**: Predicts active pharmaceutical ingredient (API) yield percentage and quality parameters.
* **AutoML Framework Comparison**: Benchmarks XGBoost, LightGBM, CatBoost, and Random Forest using 5-Fold Cross-Validation, R², RMSE, MAE, and Training Time.
* **Explainable AI (XAI)**: Visualizes global feature attribution using SHAP importance scores.

### 🔍 7. Natural Language SQL (Text-to-SQL)
* **Dataset-Aware Text-to-SQL**: Generates and executes SQL queries directly against the uploaded CSV dataset loaded into an in-memory SQLite engine.
* **Safe AST Execution Guard**: AST parsing via `sqlglot` enforcing strict read-only `SELECT` queries.
* **Automated Data Visualizations**: Formats query result sets into scalar KPI cards, dynamic auto-charts, and interactive tables.

### 🛡️ 8. SOP Compliance Checker & 21 CFR Part 11 Audit
* **Lab Protocol Audit**: Compares experiment execution logs against active Standard Operating Procedures (SOP-MFG-088).
* **Database Verification**: Validates pre-existing `Experiment` records before generating compliance reports to prevent foreign key violations.
* **Immutable Audit Trail**: Logs compliance scores, risk evaluations, and SHA-256 payload hashes.

### 🔐 9. User Authentication & Security
* **JWT Authentication**: OAuth2 Bearer token authentication with password hashing via Bcrypt.
* **State Persistence**: Secure token storage with automatic session sync and Login Modal integration.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Client ["Frontend (React 18 + Vite + TypeScript)"]
        UI[User Dashboard & Chat Interface]
        State[Zustand Global State]
        APIClient[Axios API Client + JWT]
        UI --> State
        UI --> APIClient
    end

    subgraph Gateway ["FastAPI Backend (Python 3.11)"]
        Auth[OAuth2 / JWT Security]
        Router[API Router /api/v1]
        APIClient --> Auth
        Auth --> Router
    end

    subgraph MultiAgent ["LangGraph Multi-Agent Orchestrator"]
        Supervisor[Supervisor Intent Router]
        Research[Research Agent]
        Stats[Statistics Agent]
        ML[ML Agent]
        SQL[SQL Agent]
        Comp[Compliance Agent]
        Report[Report Agent]

        Router --> Supervisor
        Supervisor -->|Literature Intent| Research
        Supervisor -->|Stats Intent| Stats
        Supervisor -->|ML Intent| ML
        Supervisor -->|Database Intent| SQL
        Supervisor -->|SOP Intent| Comp
        Supervisor -->|Full Report| Report
    end

    subgraph Data ["Data & Storage Layer"]
        PG[(PostgreSQL 16 + pgvector)]
        SQLite[(In-Memory SQLite Dataset Table)]
        Gemini[Google Gemini API]

        Research --> PG
        Research --> Gemini
        Stats --> Gemini
        ML --> Gemini
        SQL --> SQLite
        Comp --> PG
    end
```

---

## 🛠️ Technology Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS | Type-safe modular components, fast HMR build times, and clean UI styling. |
| **State Management** | Zustand | Lightweight global state handling for dataset ID, active experiment ID, and session tokens. |
| **Backend API** | FastAPI, Python 3.11, Pydantic v2 | High-performance async endpoints with automatic OpenAPI validation and documentation. |
| **Database & Vector** | PostgreSQL 16 + `pgvector`, SQLAlchemy 2.0 | Unified relational storage and HNSW vector search for literature embeddings. |
| **AI & Orchestration** | LangGraph, LangChain, Google Gemini 2.5 Flash API | Stateful intent-routed multi-agent state machines with LLM inference. |
| **ML & Statistics** | Scikit-learn, SciPy, StatsModels, XGBoost, CatBoost, LightGBM, SHAP | Comprehensive machine learning pipelines, statistical testing, and model explainability. |
| **Text-to-SQL Engine** | SQLite, `sqlglot` | Isolated in-memory SQL execution over uploaded CSV data with AST safety validation. |
| **Security & Auth** | OAuth2 + JWT, Passlib (Bcrypt) | Secure password hashing, token verification, and route protection. |

---

## 📂 Project Folder Structure

```
PharmaAI/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── deps.py             # Auth dependencies & current user injection
│   │   │   └── v1/
│   │   │       ├── endpoints/      # Auth, Dashboard, Papers, Analytics, Stats, ML, SQL, Compliance, Agents
│   │   │       └── router.py       # API route registry
│   │   ├── core/                   # Security, Database config, Settings
│   │   ├── domain/
│   │   │   ├── models.py           # SQLAlchemy database entities (User, Dataset, Experiment, MLModel, etc.)
│   │   │   └── schemas.py          # Pydantic DTO validation schemas
│   │   ├── services/               # Core business services (Dashboard, Paper, Stats, ML, SQL, Compliance)
│   │   ├── agents/                 # LangGraph state machine & domain agent nodes
│   │   └── utils/                  # PDF parser, logger, helper functions
│   ├── main.py                     # FastAPI application entrypoint
│   └── requirements.txt            # Python dependencies
└── frontend/
    ├── src/
    │   ├── components/             # React feature modules (Dashboard, Papers, Analytics, Stats, ML, SQL, Compliance, Assistant)
    │   ├── services/               # Axios API client & endpoint calls
    │   ├── store/                  # Zustand global store (`useStore.ts`, `useAuthStore.ts`)
    │   ├── types/                  # TypeScript interface definitions
    │   ├── App.tsx                 # Main application view with Login Modal
    │   └── main.tsx
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.ts
```

---

## 🚀 Quickstart & Installation

### Prerequisites
- Python 3.11+
- Node.js 20+ & npm 10+
- PostgreSQL 16 with `pgvector` extension enabled
- Google Gemini API Key

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI dev server
uvicorn app.main:app --reload
```
The API server will run at `http://localhost:8000`. OpenAPI documentation is available at `http://localhost:8000/docs`.

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite dev server
npm run dev
```
The React frontend application will run at `http://localhost:5173`.

---

## ⚙️ Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
# Core Configuration
PROJECT_NAME="PharmaGen AI"
ENVIRONMENT="development"
SECRET_KEY="your-secret-key-change-this-in-production"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Database Configuration
POSTGRES_USER="pharmagen"
POSTGRES_PASSWORD="your_postgres_password"
POSTGRES_DB="pharmagen_db"
POSTGRES_HOST="localhost"
POSTGRES_PORT=5432
DATABASE_URL="postgresql+asyncpg://pharmagen:your_postgres_password@localhost:5432/pharmagen_db"

# LLM Configuration
GEMINI_API_KEY="your_google_gemini_api_key_here"
EMBEDDING_MODEL="text-embedding-005"
LLM_MODEL="gemini-2.5-flash"
```

---

## 💻 Usage Instructions

1. **Authentication**:
   - Open the web application at `http://localhost:5173`.
   - Log in or register an account. Upon authentication, a JWT token is stored securely.

2. **Executive Dashboard**:
   - View your user-specific counts (Indexed Papers, Active Experiments, Predictive Models, Compliance Rate).
   - Review model performance metrics and recent audit log streams.

3. **Experiment Analytics & CSV Ingestion**:
   - Select "Ingest CSV" to upload an experimental dataset (e.g., `electricity.csv`).
   - Monitor real-time upload status; the returned `dataset_id` is automatically saved for downstream tools.

4. **Multi-Agent R&D Assistant**:
   - Navigate to the **AI Assistant** tab.
   - Ask domain questions (e.g. *"How many features are in my dataset?"*, *"Compare Random Forest with XGBoost"*, *"Summarize uploaded papers"*).
   - Observe the **Supervisor Agent** classify the intent, invoke the specific agent node, and render rich card outputs with action buttons.

5. **Statistical & ML Workflows**:
   - Run hypothesis tests, ANOVA, or correlation matrices in the **Statistical Analysis** tab.
   - Train and compare XGBoost, LightGBM, CatBoost, and Random Forest models in the **ML Engine** tab.

6. **Natural Language SQL & Compliance**:
   - Query your dataset using plain English in **Text-to-SQL**.
   - Audit laboratory logs against standard operating procedures in **SOP Compliance**.

---

## 📸 Application Screenshots

*(Place screenshots in the `docs/screenshots/` folder to view application previews)*

| Module | Preview Placeholder |
| :--- | :--- |
| **Executive Dashboard** | `![Executive Dashboard](docs/screenshots/dashboard.png)` |
| **Multi-Agent Assistant** | `![Multi-Agent Assistant](docs/screenshots/assistant.png)` |
| **ML Engine & Benchmark** | `![ML Engine Comparison](docs/screenshots/ml_engine.png)` |
| **Text-to-SQL Interface** | `![Text to SQL Interface](docs/screenshots/text_to_sql.png)` |

---

## 🗺️ Implementation Roadmap & Future Enhancements

- [x] **Phase 1: Core System & Authentication** – JWT Auth, PostgreSQL schema, Pydantic DTOs.
- [x] **Phase 2: RAG & Literature Mining** – Document parsing, `pgvector` HNSW embeddings, research summaries.
- [x] **Phase 3: Analytics & Statistical Engine** – CSV ingestion UX, data profiling, ANOVA, T-Tests.
- [x] **Phase 4: Predictive AutoML & Text-to-SQL** – XGBoost/LightGBM/CatBoost benchmarks, SHAP plots, safe SQLite Text-to-SQL.
- [x] **Phase 5: LangGraph Multi-Agent System & Dynamic UI** – Supervisor intent router, rich AI response renderer, user-specific dynamic executive dashboard.
- [ ] **Phase 6: Advanced Multi-Modal OCR** – Enhanced table extraction for scanned historical patent documents.
- [ ] **Phase 7: Cloud Deployment & CI/CD Pipelines** – Automated GitHub Actions testing and containerized cloud deployment.

---

## 📄 License & Compliance

*Designed under 21 CFR Part 11 regulatory compliance standards for GxP validation. Internal Enterprise Software License – All Rights Reserved.*
