from typing import Dict, Any
from langchain_core.messages import AIMessage
from app.agents.state import AgentState

async def report_agent_node(state: AgentState) -> Dict[str, Any]:
    """Report Agent synthesizes outputs from all prior agents into an executive PDF/Markdown report."""
    research = state.get("research_results", {})
    stats = state.get("stats_results", {})
    ml = state.get("ml_results", {})
    sql = state.get("sql_results", {})
    comp = state.get("compliance_results", {})

    report_md = f"""# Executive Pharmaceutical R&D Synthesis Report

## 1. Literature Intelligence
- **Topic Query**: {research.get('query', 'N/A')}
- **Summary**: {research.get('summary', 'N/A')}

## 2. Statistical Analysis
- **Test Executed**: {stats.get('test_type', 'N/A')}
- **Finding**: {stats.get('summary', 'N/A')}

## 3. Predictive Machine Learning
- **Model**: {ml.get('model_type', 'N/A')}
- **R² Metric**: {ml.get('r2_score', 'N/A')}
- **Key Feature Driver**: {ml.get('top_feature', 'N/A')}

## 4. Text-to-SQL Exploration
- **Top Formulation**: {sql.get('top_formulation', 'N/A')} ({sql.get('max_yield', 'N/A')}% Yield)

## 5. Regulatory SOP Compliance (21 CFR Part 11)
- **SOP Code**: {comp.get('sop_code', 'N/A')}
- **Score**: {comp.get('compliance_score', 'N/A')}% ({comp.get('status', 'N/A')})
"""

    message = AIMessage(
        content=f"[Report Agent]: Synthesized comprehensive Executive R&D Report incorporating Literature RAG, ANOVA statistics, XGBoost predictions, SQL metrics, and SOP compliance audit.",
        name="ReportAgent"
    )

    return {
        "messages": [message],
        "final_report": report_md,
        "next_agent": "END"
    }
