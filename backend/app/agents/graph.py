from langgraph.graph import StateGraph, END
from app.agents.state import AgentState
from app.agents.planner import planner_node, response_node
from app.agents.specialized.agents import (
    internship_agent_node,
    hackathon_agent_node,
    scholarship_agent_node,
    resume_agent_node,
    study_agent_node,
    finance_agent_node,
    shopping_agent_node
)

# Initialize workflow
workflow = StateGraph(AgentState)

# Add central nodes
workflow.add_node("planner", planner_node)
workflow.add_node("response", response_node)

# Add specialized agent nodes
workflow.add_node("internship_agent", internship_agent_node)
workflow.add_node("hackathon_agent", hackathon_agent_node)
workflow.add_node("scholarship_agent", scholarship_agent_node)
workflow.add_node("resume_agent", resume_agent_node)
workflow.add_node("study_agent", study_agent_node)
workflow.add_node("finance_agent", finance_agent_node)
workflow.add_node("shopping_agent", shopping_agent_node)

# Checkpoint node to redirect states in the loop
def checkpoint_fn(state: AgentState) -> AgentState:
    return state

workflow.add_node("checkpoint", checkpoint_fn)

# Router edge logic
def router_edge(state: AgentState) -> str:
    active = state.get("active_agents", [])
    responses = state.get("agent_responses", {})
    
    # Route to the first active agent that has not yet run
    for agent in active:
        if agent not in responses:
            return agent
            
    # Route to the compiler once all active agents have reported
    return "response"

# Map of destinations for router
routing_map = {
    "internship_agent": "internship_agent",
    "hackathon_agent": "hackathon_agent",
    "scholarship_agent": "scholarship_agent",
    "resume_agent": "resume_agent",
    "study_agent": "study_agent",
    "finance_agent": "finance_agent",
    "shopping_agent": "shopping_agent",
    "response": "response"
}

# Entrypoint flows to Planner
workflow.set_entry_point("planner")

# From planner, we check what needs to run next
workflow.add_conditional_edges("planner", router_edge, routing_map)

# Connect specialized agents to the checkpoint node
for agent in routing_map.keys():
    if agent != "response":
        workflow.add_edge(agent, "checkpoint")

# From checkpoint, we evaluate the router edge again
workflow.add_conditional_edges("checkpoint", router_edge, routing_map)

# Finally, response compiles and terminates
workflow.add_edge("response", END)

# Compile graph
app_graph = workflow.compile()


def run_agentic_workflow(user_id: int, session_id: str, query: str, profile_dict: dict, chat_history: list, semantic_memories: list = None) -> dict:
    """
    Executes the compiled LangGraph workflow.
    """
    initial_state = AgentState(
        user_id=user_id,
        user_query=query,
        session_id=session_id,
        profile=profile_dict,
        history=chat_history,
        semantic_memories=semantic_memories or [],
        suggested_agents=[],
        active_agents=[],
        agent_responses={},
        memory_updates={},
        reminders=[],
        final_response=""
    )
    
    final_state = app_graph.invoke(initial_state)
    return final_state
