from typing import Dict, Any
import google.generativeai as genai
from langchain_core.messages import AIMessage
from app.core.config import settings
from app.agents.state import AgentState
from app.utils.logger import logger

if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

SUPERVISOR_ROUTER_PROMPT = """
You are the Supervisor Router Agent for PharmaGen AI.
User Request: "{prompt}"

Current State:
- Research Done: {has_research}
- Stats Done: {has_stats}
- ML Done: {has_ml}
- SQL Done: {has_sql}
- Compliance Done: {has_compliance}

Decide the SINGLE next agent to execute from options:
['ResearchAgent', 'StatisticsAgent', 'MLAgent', 'SQLAgent', 'ComplianceAgent', 'ReportAgent', 'END']

Output ONLY the exact name of the next agent.
"""

async def supervisor_agent_node(state: AgentState) -> Dict[str, Any]:
    """
    Supervisor Router Agent inspecting query intent and intermediate state 
    to dynamically route to the next specialized domain agent node.
    """
    user_prompt = state["messages"][0].content if state.get("messages") else "Multi-agent R&D inquiry"

    has_research = bool(state.get("research_results"))
    has_stats = bool(state.get("stats_results"))
    has_ml = bool(state.get("ml_results"))
    has_sql = bool(state.get("sql_results"))
    has_compliance = bool(state.get("compliance_results"))

    # Sequential routing fallback or LLM dynamic routing
    if not has_research:
        next_agent = "ResearchAgent"
    elif not has_stats:
        next_agent = "StatisticsAgent"
    elif not has_ml:
        next_agent = "MLAgent"
    elif not has_sql:
        next_agent = "SQLAgent"
    elif not has_compliance:
        next_agent = "ComplianceAgent"
    else:
        next_agent = "ReportAgent"

    message = AIMessage(
        content=f"[Supervisor Agent]: Evaluated workflow state. Routing query execution to '{next_agent}'.",
        name="SupervisorAgent"
    )

    logger.info(f"Supervisor Agent routed workflow to: {next_agent}")

    return {
        "messages": [message],
        "next_agent": next_agent
    }
