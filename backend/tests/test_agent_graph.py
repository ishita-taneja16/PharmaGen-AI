import pytest
from langchain_core.messages import HumanMessage
from app.agents.graph import pharmagen_agent_graph

@pytest.mark.asyncio
async def test_agent_graph_execution():
    initial_state = {
        "messages": [HumanMessage(content="Test formulation yield query")],
        "next_agent": "SupervisorAgent",
        "user_id": "usr_001",
        "paper_query": "formulation yield",
        "sql_prompt": "highest yield",
        "sop_code": "SOP-MFG-088"
    }

    final_state = await pharmagen_agent_graph.ainvoke(initial_state)

    assert "final_report" in final_state
    assert final_state["final_report"] is not None
    assert "Literature Intelligence" in final_state["final_report"]
    assert "SOP Compliance" in final_state["final_report"]
