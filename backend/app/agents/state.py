from typing import TypedDict, Annotated, List, Dict, Any, Optional
import operator
from langchain_core.messages import BaseMessage

class AgentState(TypedDict):
    messages: Annotated[List[BaseMessage], operator.add]
    next_agent: str
    user_id: str
    experiment_id: Optional[str]
    dataset_id: Optional[str]
    paper_query: Optional[str]
    sql_prompt: Optional[str]
    sop_code: Optional[str]
    research_results: Optional[Dict[str, Any]]
    stats_results: Optional[Dict[str, Any]]
    ml_results: Optional[Dict[str, Any]]
    sql_results: Optional[Dict[str, Any]]
    compliance_results: Optional[Dict[str, Any]]
    final_report: Optional[str]
