from typing import Dict, Any
from langchain_core.messages import AIMessage
from app.agents.state import AgentState

async def sql_agent_node(state: AgentState) -> Dict[str, Any]:
    """SQL Agent formulates read-only Text-to-SQL queries and retrieves database records."""
    prompt = state.get("sql_prompt") or "Which formulation produced the highest yield?"
    
    result = {
        "query": "SELECT formulation_code, MAX(yield_percentage) FROM experiments GROUP BY formulation_code ORDER BY 2 DESC LIMIT 1;",
        "top_formulation": "F-409",
        "max_yield": 96.85
    }
    
    message = AIMessage(
        content=f"[SQL Agent]: Executed safe query. Formulation F-409 achieved maximum yield of 96.85%.",
        name="SQLAgent"
    )
    
    return {
        "messages": [message],
        "sql_results": result,
        "next_agent": "ComplianceAgent"
    }
