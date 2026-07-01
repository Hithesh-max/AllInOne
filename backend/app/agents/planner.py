import json
import re
from typing import Dict, Any
from app.agents.state import AgentState
from app.utils.llm import call_llm

def planner_node(state: AgentState) -> AgentState:
    """
    Central brain router. Decides which specialized agents to invoke,
    extracts student profile details, and schedules database reminders.
    """
    user_query = state["user_query"]
    profile = state["profile"]
    history = state["history"]
    
    # Formulate router prompt
    sys_prompt = """You are the CampusCopilot Central AI Router.
    Your task is to parse a student query and decide which specialized agents should handle it.
    
    Available agents:
    - internship_agent: for job search, matches, resume reviews, application tracking.
    - hackathon_agent: for devfolio, devpost, MLH competitions.
    - scholarship_agent: for financial aid, NSP, buddy4study.
    - resume_agent: for improving resume ATS, cover letter generation, skill analysis.
    - study_agent: for class timetables, exam revision, assignment reminders.
    - finance_agent: for expense tracking, monthly saving tips, spending predictions.
    - shopping_agent: for price comparisons, Amazon/Flipkart deals, coupons.
    - health_agent: for calorie counts, weight logging, meals, gym routine.
    - travel_agent: for vacation itineraries, packing checklists, travel budgets.
    
    You MUST respond with a valid JSON block containing:
    {
      "reasoning": "Brief explanation of your routing choice",
      "agents": ["agent_name1", "agent_name2"],
      "memory_updates": {"branch": "Deducted Branch", "cgpa": "Deducted CGPA", "skills": ["new_skill"]},
      "reminders": [{"title": "Reminder title", "days_delta": 2, "event_type": "General"}]
    }
    Only output JSON. Do not write text before or after the JSON block."""
    
    user_context = f"Query: {user_query}\nProfile: {json.dumps(profile)}\nHistory: {json.dumps(history)}"
    
    raw_decision = call_llm(sys_prompt, user_context)
    
    # Robust JSON parsing
    decision = {"reasoning": "", "agents": [], "memory_updates": {}, "reminders": []}
    try:
        # Try to locate JSON code fences
        match = re.search(r"```json\s*(.*?)\s*```", raw_decision, re.DOTALL)
        json_str = match.group(1) if match else raw_decision
        decision = json.loads(json_str)
    except Exception:
        # Simple string heuristics if LLM failed JSON formatting
        decision["reasoning"] = "Deducted via fallback rule matcher."
        agents = []
        if "intern" in user_query.lower() or "job" in user_query.lower():
            agents.append("internship_agent")
        if "hack" in user_query.lower():
            agents.append("hackathon_agent")
        if "scholar" in user_query.lower():
            agents.append("scholarship_agent")
        if "resume" in user_query.lower() or "cv" in user_query.lower():
            agents.append("resume_agent")
        if "study" in user_query.lower() or "exam" in user_query.lower():
            agents.append("study_agent")
        if "expense" in user_query.lower() or "budget" in user_query.lower() or "spend" in user_query.lower():
            agents.append("finance_agent")
        if "shop" in user_query.lower() or "price" in user_query.lower():
            agents.append("shopping_agent")
        if "health" in user_query.lower() or "calorie" in user_query.lower():
            agents.append("health_agent")
        if "travel" in user_query.lower() or "trip" in user_query.lower():
            agents.append("travel_agent")
            
        if not agents:
            agents = ["internship_agent", "study_agent"]
        decision["agents"] = agents
        
    state["suggested_agents"] = decision.get("agents", [])
    state["active_agents"] = decision.get("agents", [])
    state["memory_updates"] = decision.get("memory_updates", {})
    
    # Capture scheduled reminders
    state["reminders"] = decision.get("reminders", [])
    
    return state


def response_node(state: AgentState) -> AgentState:
    """
    Summarizes and merges responses from all triggered specialized agents
    into a beautiful unified Markdown response for the student.
    """
    user_query = state["user_query"]
    agent_responses = state["agent_responses"]
    active_agents = state["active_agents"]
    
    # Formulate compiler prompt
    sys_prompt = f"""You are the CampusCopilot Response Aggregator.
    Combine findings from the active specialized agents: {json.dumps(active_agents)}
    Agent Individual Outputs: {json.dumps(agent_responses)}
    
    Compile a beautiful, comprehensive, and cohesive Markdown response. Do not repeat greeting messages. 
    Use headers, tables, bold bullet lists, and emoji indicators where appropriate to deliver a polished student digest."""
    
    final_text = call_llm(sys_prompt, f"Query: {user_query}")
    state["final_response"] = final_text
    
    return state
