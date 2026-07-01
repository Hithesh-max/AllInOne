from typing import List, Dict, Any, TypedDict, Optional

class AgentState(TypedDict):
    user_id: int
    user_query: str
    session_id: str
    profile: Dict[str, Any]
    history: List[Dict[str, str]]
    suggested_agents: List[str]
    active_agents: List[str]
    agent_responses: Dict[str, Any]
    memory_updates: Dict[str, Any]
    reminders: List[Dict[str, Any]]
    final_response: str
