import json
from app.agents.state import AgentState
from app.utils.llm import call_llm
from app.tools.opportunity_search import get_internships, get_hackathons, get_scholarships

def internship_agent_node(state: AgentState) -> AgentState:
    """
    Evaluates matches, ranks opportunities, and structures applications.
    """
    user_query = state["user_query"]
    profile = state["profile"]
    
    # Query tools for matches
    db_matches = get_internships(user_query)
    
    sys_prompt = f"""You are the CampusCopilot Internship Agent. 
    Your job is to match the student's profile to available internships, calculate ATS compatibility, and build preparation checklists.
    Student Profile: {json.dumps(profile)}
    Search Results: {json.dumps(db_matches)}
    
    Respond in structured Markdown. Compare user skills with internship requirements, compute a match percentage, and list preparation steps."""
    
    response = call_llm(sys_prompt, user_query)
    state["agent_responses"]["internship_agent"] = response
    
    # Deduce memory updates (e.g. skills or preferred companies mentioned in query)
    if "google" in user_query.lower():
        state["memory_updates"]["preferred_companies"] = ["Google"]
    
    return state


def hackathon_agent_node(state: AgentState) -> AgentState:
    """
    Finds hackathons, tracks rounds, and sets calendar registration alarms.
    """
    user_query = state["user_query"]
    profile = state["profile"]
    
    db_hackathons = get_hackathons(user_query)
    
    sys_prompt = f"""You are the CampusCopilot Hackathon Agent.
    Your task is to recommend relevant coding competitions and team challenges.
    Student Profile: {json.dumps(profile)}
    Hackathons Data: {json.dumps(db_hackathons)}
    
    Review deadlines and eligibility, recommend hackathons, and specify registration dates."""
    
    response = call_llm(sys_prompt, user_query)
    state["agent_responses"]["hackathon_agent"] = response
    return state


def scholarship_agent_node(state: AgentState) -> AgentState:
    """
    Performs income, CGPA, and category eligibility filters on scholarship programs.
    """
    user_query = state["user_query"]
    profile = state["profile"]
    
    db_scholarships = get_scholarships(user_query)
    
    sys_prompt = f"""You are the CampusCopilot Scholarship Agent.
    Help students check eligibility for financial aid programs.
    Student Profile: {json.dumps(profile)}
    Scholarship database: {json.dumps(db_scholarships)}
    
    Filter by CGPA, family income, or branch, and suggest application timelines."""
    
    response = call_llm(sys_prompt, user_query)
    state["agent_responses"]["scholarship_agent"] = response
    return state


def resume_agent_node(state: AgentState) -> AgentState:
    """
    Grades resume ATS score, structures improvements, and drafts cover letters.
    """
    user_query = state["user_query"]
    profile = state["profile"]
    
    sys_prompt = f"""You are the CampusCopilot Resume Agent.
    Your job is to analyze the student's resume text, recommend formatting upgrades, missing skills, and write customized cover letters.
    Student Resume text: {profile.get("resume_text", "No resume uploaded yet.")}
    Student Profile: {json.dumps(profile)}
    
    Provide an ATS scoring report, missing keywords, and project suggestions."""
    
    response = call_llm(sys_prompt, user_query)
    state["agent_responses"]["resume_agent"] = response
    return state


def study_agent_node(state: AgentState) -> AgentState:
    """
    Creates exam study planners, assignment checklists, and schedules revision clocks.
    """
    user_query = state["user_query"]
    profile = state["profile"]
    
    sys_prompt = f"""You are the CampusCopilot Study Planner Agent.
    Create timetables, revision plans, and task deadlines for homework/exams.
    Student Profile: {json.dumps(profile)}
    
    Output daily routines, structured review sessions, and add calendar markers."""
    
    response = call_llm(sys_prompt, user_query)
    state["agent_responses"]["study_agent"] = response
    
    # Schedule a calendar alarm reminder for studying
    state["reminders"].append({
        "title": "Revision Study Session",
        "description": "Daily study routine block.",
        "event_type": "Study",
        "days_delta": 1
    })
    return state


def finance_agent_node(state: AgentState) -> AgentState:
    """
    Tracks expenses, forecasts end-of-month balances, and detects leaks.
    """
    user_query = state["user_query"]
    profile = state["profile"]
    
    sys_prompt = f"""You are the CampusCopilot Finance Agent.
    Analyze student spending patterns, warn about budget limits, and suggest saving ideas.
    Student budget: {profile.get("budget", 0.0)}
    
    Provide spending breakdowns, overspending warnings, and monthly financial advice."""
    
    response = call_llm(sys_prompt, user_query)
    state["agent_responses"]["finance_agent"] = response
    return state


def shopping_agent_node(state: AgentState) -> AgentState:
    """
    Compares Amazon, Flipkart, AJIO, and lists active student coupon codes.
    """
    user_query = state["user_query"]
    profile = state["profile"]
    
    sys_prompt = f"""You are the CampusCopilot Shopping Agent.
    Compare prices for student purchases, identify coupons, and check budget limits.
    Budget context: {profile.get("budget", 0.0)}
    
    Evaluate pricing data from major sites and recommend the best purchase options."""
    
    response = call_llm(sys_prompt, user_query)
    state["agent_responses"]["shopping_agent"] = response
    return state


def health_agent_node(state: AgentState) -> AgentState:
    """
    Manages calorie/water logs, generates meal suggestions, and customizes workouts.
    """
    user_query = state["user_query"]
    profile = state["profile"]
    
    sys_prompt = f"""You are the CampusCopilot Health & Fitness Agent.
    Suggest diet meals, hydration goals, sleep hours, and workouts based on student metrics.
    Goals profile: {json.dumps(profile.get("health_goals", {}))}
    
    Structure daily workout plans, caloric targets, and nutrient-dense recipes."""
    
    response = call_llm(sys_prompt, user_query)
    state["agent_responses"]["health_agent"] = response
    return state


def travel_agent_node(state: AgentState) -> AgentState:
    """
    Builds packing lists, travel routes, itineraries, and estimates trip budgets.
    """
    user_query = state["user_query"]
    profile = state["profile"]
    
    sys_prompt = f"""You are the CampusCopilot Travel Agent.
    Generate itineraries, check travel budgets, and build custom packing lists.
    Student Preferences: {json.dumps(profile.get("travel_preferences", {}))}
    
    Provide packing checklist items, day-by-day schedules, and travel budget forecasts."""
    
    response = call_llm(sys_prompt, user_query)
    state["agent_responses"]["travel_agent"] = response
    return state
