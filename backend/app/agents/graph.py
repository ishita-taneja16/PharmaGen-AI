from langgraph.graph import StateGraph, END
from app.agents.state import AgentState
from app.agents.supervisor_agent import supervisor_agent_node
from app.agents.research_agent import research_agent_node
from app.agents.stats_agent import stats_agent_node
from app.agents.ml_agent import ml_agent_node
from app.agents.sql_agent import sql_agent_node
from app.agents.compliance_agent import compliance_agent_node
from app.agents.report_agent import report_agent_node

def supervisor_router(state: AgentState) -> str:
    return state.get("next_agent", "END")

def build_pharmagen_agent_graph():
    """
    Constructs the stateful multi-agent workflow graph for PharmaGen AI.
    Connects Supervisor, Research, Statistics, ML, SQL, Compliance, and Report Agents.
    """
    workflow = StateGraph(AgentState)

    # Register 7 Domain Nodes
    workflow.add_node("SupervisorAgent", supervisor_agent_node)
    workflow.add_node("ResearchAgent", research_agent_node)
    workflow.add_node("StatisticsAgent", stats_agent_node)
    workflow.add_node("MLAgent", ml_agent_node)
    workflow.add_node("SQLAgent", sql_agent_node)
    workflow.add_node("ComplianceAgent", compliance_agent_node)
    workflow.add_node("ReportAgent", report_agent_node)

    # Entry Point: Supervisor Agent
    workflow.set_entry_point("SupervisorAgent")

    # Conditional Routing Edges
    workflow.add_conditional_edges(
        "SupervisorAgent",
        supervisor_router,
        {
            "ResearchAgent": "ResearchAgent",
            "StatisticsAgent": "StatisticsAgent",
            "MLAgent": "MLAgent",
            "SQLAgent": "SQLAgent",
            "ComplianceAgent": "ComplianceAgent",
            "ReportAgent": "ReportAgent",
            "END": END
        }
    )

    workflow.add_edge("ResearchAgent", END)
    workflow.add_edge("StatisticsAgent", END)
    workflow.add_edge("MLAgent", END)
    workflow.add_edge("SQLAgent", END)
    workflow.add_edge("ComplianceAgent", END)
    workflow.add_edge("ReportAgent", END)

    return workflow.compile()

pharmagen_agent_graph = build_pharmagen_agent_graph()
