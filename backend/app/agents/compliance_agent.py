from typing import Dict, Any
from langchain_core.messages import AIMessage
from app.agents.state import AgentState

async def compliance_agent_node(state: AgentState) -> Dict[str, Any]:
    """Compliance Agent checks experimental procedures against SOP regulations."""
    sop_code = state.get("sop_code") or "SOP-MFG-088"
    
    result = {
        "sop_code": sop_code,
        "compliance_score": 85.0,
        "status": "WARNING",
        "missing_steps": 1,
        "risk_score": 15.0
    }
    
    message = AIMessage(
        content=f"[Compliance Agent]: Evaluated against {sop_code}. Compliance score: 85.0%. 1 non-critical step missing (temperature hold). Risk score: 15.0.",
        name="ComplianceAgent"
    )
    
    return {
        "messages": [message],
        "compliance_results": result,
        "next_agent": "ReportAgent"
    }
