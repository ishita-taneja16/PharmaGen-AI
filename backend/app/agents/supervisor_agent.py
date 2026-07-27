from typing import Dict, Any, List
import google.generativeai as genai
from langchain_core.messages import AIMessage
from app.core.config import settings
from app.agents.state import AgentState
from app.utils.logger import logger

if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

ALL_DOMAINS = [
    "ResearchAgent",
    "StatisticsAgent",
    "MLAgent",
    "SQLAgent",
    "ComplianceAgent",
    "ReportAgent"
]

async def supervisor_agent_node(state: AgentState) -> Dict[str, Any]:
    """
    Supervisor Router Agent inspecting user intent and routing strictly
    to the required specialized domain agent node.
    Computes active_agents vs skipped_agents.
    """
    user_prompt = state["messages"][0].content if state.get("messages") else "R&D request"
    prompt_lower = user_prompt.lower()

    logger.info("==========================================")
    logger.info(f"User Question: {user_prompt}")

    target_agent = "StatisticsAgent"
    intent_reason = "Default fallback"

    # Intent Classification Rules
    if any(k in prompt_lower for k in ["paper", "research", "journal", "literature", "rag", "publication", "citation", "summarize paper", "summarize uploaded papers"]):
        target_agent = "ResearchAgent"
        intent_reason = "User query asks specifically about literature, research papers, or citations."

    elif any(k in prompt_lower for k in ["statistics", "anova", "t-test", "correlation", "dataset", "features", "columns", "missing values", "outliers", "normality", "how many features", "rows"]):
        target_agent = "StatisticsAgent"
        intent_reason = "User query asks specifically about dataset inspection, statistical metrics, or ANOVA."

    elif any(k in prompt_lower for k in ["model", "xgboost", "random forest", "prediction", "train model", "accuracy", "r2", "r²", "feature importance", "shap", "compare random forest"]):
        target_agent = "MLAgent"
        intent_reason = "User query asks specifically about machine learning algorithms, model comparison, or SHAP importances."

    elif any(k in prompt_lower for k in ["sql", "database", "query", "average", "count", "sum", "select", "natural language sql", "nswprice", "nswdemand"]):
        target_agent = "SQLAgent"
        intent_reason = "User query asks specifically for database queries or Text-to-SQL execution."

    elif any(k in prompt_lower for k in ["sop", "compliance", "audit", "21 cfr", "validation", "capa", "regulation"]):
        target_agent = "ComplianceAgent"
        intent_reason = "User query asks specifically about SOP compliance rules or audit validation."

    elif any(k in prompt_lower for k in ["generate report", "executive summary", "overall analysis", "complete workflow summary"]):
        target_agent = "ReportAgent"
        intent_reason = "User explicitly requested a full executive synthesis report."

    else:
        target_agent = await classify_with_llm(user_prompt)
        intent_reason = "LLM dynamic intent classification."

    active_agents = ["SupervisorAgent", target_agent]
    skipped_agents = [a for a in ALL_DOMAINS if a != target_agent]

    logger.info(f"Intent: {intent_reason}")
    logger.info(f"Selected Agent: {target_agent}")
    logger.info(f"Skipped Agents: {', '.join(skipped_agents)}")
    logger.info("==========================================")

    message = AIMessage(
        content=f"[Supervisor Agent]: Intent identified ('{target_agent}'). Reason: {intent_reason}",
        name="SupervisorAgent"
    )

    return {
        "messages": [message],
        "next_agent": target_agent,
        "active_agents": active_agents,
        "skipped_agents": skipped_agents
    }

async def classify_with_llm(prompt: str) -> str:
    if not settings.GEMINI_API_KEY:
        return "StatisticsAgent"
    try:
        model = genai.GenerativeModel(settings.LLM_MODEL)
        prompt_text = f"""
Classify the user prompt into exactly ONE agent name:
- ResearchAgent (for papers, literature, citations)
- StatisticsAgent (for dataset inspection, features, columns, stats, ANOVA)
- MLAgent (for ML models, XGBoost, Random Forest, R2, SHAP)
- SQLAgent (for text-to-sql, database queries)
- ComplianceAgent (for SOP compliance, 21 CFR Part 11)
- ReportAgent (for executive report generation)

User Prompt: "{prompt}"
Return ONLY the exact agent name string.
"""
        res = await model.generate_content_async(prompt_text)
        txt = res.text.strip().replace("`", "")
        for valid in ALL_DOMAINS:
            if valid.lower() in txt.lower():
                return valid
        return "StatisticsAgent"
    except Exception as e:
        logger.warning(f"Classification LLM fallback: {e}")
        return "StatisticsAgent"
