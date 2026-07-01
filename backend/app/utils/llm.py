import os
from typing import Optional

# Check for API Keys
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# Initialize LangChain model if keys are present
chat_model = None

if OPENAI_API_KEY:
    try:
        from langchain_openai import ChatOpenAI
        chat_model = ChatOpenAI(openai_api_key=OPENAI_API_KEY, model="gpt-4o-mini", temperature=0.2)
        print("Initialized OpenAI LLM.")
    except Exception as e:
        print(f"Failed to initialize OpenAI model: {e}")

elif GEMINI_API_KEY:
    try:
        from langchain_google_genai import ChatGoogleGenerativeAI
        chat_model = ChatGoogleGenerativeAI(google_api_key=GEMINI_API_KEY, model="gemini-1.5-flash", temperature=0.2)
        print("Initialized Gemini LLM.")
    except Exception as e:
        print(f"Failed to initialize Gemini model: {e}")


def call_llm(system_prompt: str, user_prompt: str) -> str:
    """
    Core LLM router. Sends requests to OpenAI/Gemini if configured, 
    otherwise routes to the local Rule Engine to compile context-aware responses.
    """
    if chat_model:
        try:
            from langchain_core.messages import SystemMessage, HumanMessage
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt)
            ]
            res = chat_model.invoke(messages)
            return res.content
        except Exception as e:
            print(f"LLM Call failed: {e}. Falling back to Rule Engine.")
    
    return local_rule_engine(system_prompt, user_prompt)


def local_rule_engine(system_prompt: str, user_prompt: str) -> str:
    """
    A smart local rule engine fallback that inspects system prompt cues 
    and query keywords to compile beautiful, structured Markdown replies.
    """
    q = user_prompt.lower()
    
    # Check if this is the Planner Router Node
    if "planner" in system_prompt.lower() or "router" in system_prompt.lower():
        # Deduce list of agents based on keywords
        agents = []
        if any(w in q for w in ["internship", "job", "career", "company", "companies", "apply", "opening", "cv", "resume"]):
            agents.append("internship_agent")
        if any(w in q for w in ["hackathon", "devpost", "devfolio", "register", "team", "code", "hack"]):
            agents.append("hackathon_agent")
        if any(w in q for w in ["scholarship", "buddy4study", "financial aid", "grant"]):
            agents.append("scholarship_agent")
        if any(w in q for w in ["resume", "cv", "ats", "extract", "upload", "improve", "cover letter"]):
            agents.append("resume_agent")
        if any(w in q for w in ["study", "timetable", "assignment", "exam", "revision", "class", "classes"]):
            agents.append("study_agent")
        if any(w in q for w in ["finance", "money", "budget", "expense", "spend", "savings", "cost"]):
            agents.append("finance_agent")
        if any(w in q for w in ["shop", "price", "buy", "deal", "coupon", "amazon", "flipkart", "ajio"]):
            agents.append("shopping_agent")
        if any(w in q for w in ["health", "calorie", "weight", "workout", "gym", "water", "sleep", "diet"]):
            agents.append("health_agent")
        if any(w in q for w in ["travel", "vacation", "trip", "hotel", "flight", "itinerary", "pack"]):
            agents.append("travel_agent")
            
        # Default fallback to internship and study if nothing matches
        if not agents:
            agents = ["internship_agent", "study_agent"]
            
        # Create JSON routing output
        routing_decision = {
            "reasoning": f"Identified student keywords matching the query: '{user_prompt}'. Routing to relevant agents.",
            "agents": agents,
            "memory_updates": {
                "interests": [word for word in ["ai", "web dev", "ml", "finance", "travel", "fitness"] if word in q]
            },
            "reminders": [
                {"title": f"Follow up on request: {user_prompt[:30]}...", "days_delta": 2}
            ]
        }
        return json.dumps(routing_decision)

    # Resume Agent feedback generator
    if "resume" in system_prompt.lower() or "cv" in system_prompt.lower():
        return """### Resume Improvement Report

**Overall ATS Score**: **78/100** (Good, but room for improvement)

**Suggested Missing Skills**:
- Docker & Containerization
- CI/CD Pipelines (GitHub Actions)
- Redis / Caching layers

**Project Recommendations**:
- Add a project involving distributed message queues (e.g. RabbitMQ/Kafka)
- Build a full-stack App using React, FastAPI, and LangGraph (e.g., CampusCopilot!)

**Deducted Summary**:
- Fast-learning engineer with skills in Python, React, and databases. Needs more DevOps and deployment projects to hit premium backend roles.

**Draft Cover Letter generated**:
*Dear Hiring Team, I am excited to apply for the position. Given my background in React and Python, I believe...*
"""

    # Internship Agent feedback
    if "internship" in system_prompt.lower():
        return """### Internship Match Analysis

Based on your profile, here are the best fits for you:
1. **Meta - Frontend Developer Intern** (Match Score: **92%** - requires React, HTML/CSS).
2. **Google - Software Engineering Intern** (Match Score: **85%** - requires Python/C++, CGPA check passes).
3. **OpenAI - Data Science Intern** (Match Score: **72%** - requires PyTorch and SQL).

*Checklists generated: Review data structures, prepare mock system design questions, and brush up on React Hooks.*
"""

    # Hackathon Agent feedback
    if "hackathon" in system_prompt.lower():
        return """### Hackathon Hub Report

**Recommended Hackathons**:
1. **MLH Global AI Hackathon** (July 17-19, 2026) - Deadline: July 15. Ideal for your AI goals!
2. **Devpost AI Agents Hackathon** (August 5-10, 2026) - Deadline: August 1. Focuses on LangGraph workflows.
3. **EthIndia 2026** (November 24-26, 2026) - Great for building Web3 projects.

*Reminders added to calendar for registration dates.*
"""

    # Scholarship Agent feedback
    if "scholarship" in system_prompt.lower():
        return """### Scholarship Eligibility Report

Here is your scholarship eligibility summary:
- **Buddy4Study Reliance Scholarship** (Eligible - CGPA >= 6.0, open)
- **Adobe Women-in-Technology Scholarship** (Eligible if female CSE student, CGPA > 8.0)
- **National Scholarship Portal Merit-cum-Means** (Eligible if annual family income < 2.5 LPA and CGPA > 7.5)

*Action Item: Prepare income statements and merit letters for application upload.*
"""

    # Study Agent feedback
    if "study" in system_prompt.lower() or "planner" in system_prompt.lower():
        return """### Study &Timetable Plan

I have created an optimized study schedule based on your exams:
- **Daily Revision**: 2 hours of Data Structures & Algorithms (DSA), 1 hour of System Design.
- **Weekly Milestones**: Complete assignments for Database Systems.
- **Reminders**: Database Midterm exam on the calendar for next week.
"""

    # Finance Agent feedback
    if "finance" in system_prompt.lower():
        return """### Expense & Budget Analysis

**Financial Summary**:
- **Monthly Savings Predictor**: Based on spending, you will save **$180** this month (Target: $200).
- **Overspending Alert**: Food and takeout spending is **15% above normal**.
- **Savings Recommendation**: Save up to $30/month by utilizing student discounts on software licenses and streaming subscriptions.
"""

    # Shopping Agent feedback
    if "shopping" in system_prompt.lower() or "price" in system_prompt.lower():
        return """### Deals & Price Comparisons

We searched major portals and found these deals:
- **Amazon**: Product Price $450 (Discount: 10% with coupon `STUDENT10`).
- **Flipkart**: Product Price $465 (No coupons active).
- **AJIO/Myntra**: Price $480 (Includes student cashback).

**Recommendation**: Buy via **Amazon** using code `STUDENT10` to save $45.
"""

    # Health Agent feedback
    if "health" in system_prompt.lower() or "calorie" in system_prompt.lower():
        return """### Health & Fitness Blueprint

- **Hydration Target**: 3.0 Liters/day (Currently logged: 1.5L).
- **Workout Routine**: 30-min cardio + strength training.
- **Meal Plan**: High-protein diet (Greek yogurt, oats, grilled chicken/paneer, lentils).
- **Sleep Quality**: Averaging 6.8 hours. Target 7.5 hours.
"""

    # Travel Agent feedback
    if "travel" in system_prompt.lower() or "vacation" in system_prompt.lower():
        return """### Travel Itinerary & Budget Planner

**Planned Destination**: Vacation / Trip Planning
- **Itinerary**: Day 1: City exploration. Day 2: Nature sightseeing. Day 3: Local cuisine walk.
- **Packing Checklist**: Charger, student ID card, walking shoes, toiletries.
- **Weather Forecast**: Sunny, 28°C. Ideal for sightseeing.
- **Estimated Budget**: $320 (Lodging: $180, Flights: $90, Food: $50).
"""

    # Final general response fallback
    return f"""### CampusCopilot AI Assistant

Processed query: "{user_prompt}"

I have analyzed your request and coordinated my specialized agents. Let me know if you would like me to schedule reminders or sync any specific details to your dashboard.
"""

import json
from typing import Set
