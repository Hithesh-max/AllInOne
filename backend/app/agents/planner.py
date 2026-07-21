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
    # Clear active agents and responses from previous turns
    state["active_agents"] = []
    state["suggested_agents"] = []
    state["agent_responses"] = {}
    
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
    
    You MUST respond with a valid JSON block containing:
    {
      "reasoning": "Brief explanation of your routing choice",
      "agents": ["agent_name1", "agent_name2"],
      "memory_updates": {"branch": "Deducted Branch", "cgpa": "Deducted CGPA", "skills": ["new_skill"]},
      "reminders": [{"title": "Reminder title", "days_delta": 2, "event_type": "General"}]
    }
    Only output JSON. Do not write text before or after the JSON block."""
    
    semantic_memories = state.get("semantic_memories", [])
    memories_str = "\n".join(semantic_memories) if semantic_memories else "None"
    
    # Optimize context payload to prevent daily/min token rate limits
    optimized_profile = {k: v for k, v in profile.items() if k != "resume_text"}
    optimized_history = history[-2:] if history else []
    
    user_context = f"Query: {user_query}\nProfile: {json.dumps(optimized_profile)}\nHistory: {json.dumps(optimized_history)}\nPast Relevant Memories: {memories_str}"
    
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

        if not agents:
            agents = []
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
    semantic_memories = state.get("semantic_memories", [])
    
    # 1. Fetch live web search facts for general inquiries (fact-checking)
    web_search_context = ""
    if not active_agents:
        greetings = ["hi", "hello", "hey", "greetings", "howdy", "how r u", "how are you"]
        q_clean = user_query.lower().strip()
        if not any(w in q_clean for w in greetings):
            print(f"Triggering Tavily Live Web Search for: '{user_query}'...")
            try:
                from app.utils.llm import search_tavily
                web_search_context = search_tavily(user_query)
            except Exception as e:
                print(f"Failed to execute Tavily search: {e}")
    
    # Formulate compiler prompt dynamically based on whether specialized agents ran
    if not active_agents:
        sys_prompt = """You are CampusCopilot, a helpful, friendly, and highly intelligent AI assistant.
        The student is asking a general question. Answer it directly, dynamically, and naturally, just like ChatGPT.
        Use clean Markdown formatting, bullet points, and headings where appropriate to deliver a premium response."""
    else:
        sys_prompt = f"""You are the CampusCopilot Response Aggregator.
        Combine findings from the active specialized agents: {json.dumps(active_agents)}
        Agent Individual Outputs: {json.dumps(agent_responses)}
        
        Compile a beautiful, comprehensive, and cohesive Markdown response. Do not repeat greeting messages. 
        Use headers, tables, bold bullet lists, and emoji indicators where appropriate to deliver a polished student digest."""
    
    history = state.get("history", [])
    history_str = "None"
    if history:
        recent_history = history[-5:]
        history_lines = []
        for msg in recent_history:
            if msg.get("role") == "user":
                history_lines.append(f"Student: {msg.get('content')}")
            else:
                content = msg.get("content", "")
                if len(content) > 300:
                    content = content[:300] + "... [truncated digest]"
                history_lines.append(f"Assistant: {content}")
        history_str = "\n".join(history_lines)
        
    memories_str = "\n".join(semantic_memories) if semantic_memories else "None"
    user_context = f"Recent Chat History:\n{history_str}\n\nQuery: {user_query}\nRelevant Uploaded Document Chunks:\n{memories_str}"
    
    if web_search_context:
        user_context += f"\n\nLive Web Search Results (Fact-Check Context):\n{web_search_context}"
        sys_prompt += "\n\nIMPORTANT: Utilize the provided 'Live Web Search Results' to deliver 100% factually accurate, current specifications, prices, and facts. Do not make up or hallucinate hardware numbers, display rates, or features."
    
    if semantic_memories:
        sys_prompt += "\n\nIMPORTANT: The user is asking about an uploaded document. Prioritize the 'Relevant Uploaded Document Chunks' provided in the user context to answer the question, extract concepts, summarize, or build a quiz. Ignore unrelated resume or profile data if they contradict."
        
    final_text = call_llm(sys_prompt, user_context)
    state["final_response"] = final_text
    
    return state
