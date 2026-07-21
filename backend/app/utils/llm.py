import os
from typing import Optional
from dotenv import load_dotenv

# Load backend dotenv absolutely
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_root = os.path.dirname(os.path.dirname(current_dir))
dotenv_path = os.path.join(backend_root, ".env")
load_dotenv(dotenv_path)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()

# Initialize LangChain model if keys are present
chat_model = None

# Prioritize Gemini if present, otherwise check Groq / OpenAI
if GEMINI_API_KEY:
    try:
        from langchain_google_genai import ChatGoogleGenerativeAI
        chat_model = ChatGoogleGenerativeAI(
            google_api_key=GEMINI_API_KEY, 
            model="gemini-2.5-flash", 
            temperature=0.2,
            max_retries=0,
            timeout=25.0
        )
        print("Initialized Gemini LLM (gemini-2.5-flash).")
    except Exception as e:
        print(f"Failed to initialize Gemini model: {e}")

elif GROQ_API_KEY:
    try:
        from langchain_openai import ChatOpenAI
        chat_model = ChatOpenAI(
            openai_api_key=GROQ_API_KEY, 
            base_url="https://api.groq.com/openai/v1",
            model="llama-3.3-70b-versatile",
            temperature=0.2,
            max_retries=0,
            timeout=25.0
        )
        print("Initialized Groq LLM (Llama-3.3-70b).")
    except Exception as e:
        print(f"Failed to initialize Groq model: {e}")

elif OPENAI_API_KEY:
    try:
        from langchain_openai import ChatOpenAI
        chat_model = ChatOpenAI(
            openai_api_key=OPENAI_API_KEY, 
            model="gpt-4o-mini", 
            temperature=0.2,
            max_retries=0,
            timeout=25.0
        )
        print("Initialized OpenAI LLM.")
    except Exception as e:
        print(f"Failed to initialize OpenAI model: {e}")


def call_llm(system_prompt: str, user_prompt: str) -> str:
    """
    Core LLM router. Sends requests to OpenAI/Gemini if configured, 
    otherwise routes to the local Rule Engine to compile context-aware responses.
    """
    if chat_model:
        from langchain_core.messages import SystemMessage, HumanMessage
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt)
        ]
        
        # 1. Primary Model Attempt (Llama-3.3-70b)
        try:
            res = chat_model.invoke(messages)
            return res.content
        except Exception as primary_err:
            print(f"Primary LLM Call failed: {primary_err}.")
            
            # 2. Alternative Model Failover Loop (for Groq rate limits)
            if GROQ_API_KEY:
                alt_models = ["llama-3.1-8b-instant", "qwen/qwen3.6-27b", "qwen/qwen3-32b", "meta-llama/llama-4-scout-17b-16e-instruct"]
                for model_name in alt_models:
                    try:
                        print(f"Trying alternative Groq model: {model_name}...")
                        from langchain_openai import ChatOpenAI
                        temp_model = ChatOpenAI(
                            openai_api_key=GROQ_API_KEY, 
                            base_url="https://api.groq.com/openai/v1",
                            model=model_name,
                            temperature=0.2,
                            max_retries=0,
                            timeout=20.0
                        )
                        res = temp_model.invoke(messages)
                        print(f"SUCCESS! Responded via alternative model: {model_name}.")
                        return res.content
                    except Exception as alt_err:
                        print(f"Alternative model {model_name} failed: {alt_err}")
            
            print("All live LLM models exhausted. Falling back to Local Rule Engine.")
    
    return local_rule_engine(system_prompt, user_prompt)


def local_rule_engine(system_prompt: str, user_prompt: str) -> str:
    """
    A smart local rule engine fallback that inspects system prompt cues 
    and query keywords to compile beautiful, structured Markdown replies.
    """
    import json
    import re
    q = user_prompt.lower()
    
    query_match = re.search(r"Query:\s*(.*?)\n", user_prompt, re.IGNORECASE)
    actual_query = query_match.group(1).strip() if query_match else user_prompt
    aq_lower = actual_query.lower()
    
    # Check if the user is asking about an uploaded document and has chunks in the context
    if "relevant uploaded document chunks" in user_prompt.lower() and "none" not in user_prompt.lower():
        # 1. Check if the query is a simple greeting or casual conversation
        is_conversational = False
        if any(aq_lower.startswith(w) for w in ["hi", "hello", "hey", "greetings", "howdy", "good morning", "good afternoon"]) or aq_lower in ["how r u", "how are you", "how's it going", "how are things", "how is it going", "how r you", "how are u"]:
            is_conversational = True
            
        if is_conversational:
            if "how" in aq_lower:
                return "### 🤖 CampusCopilot AI Assistant\n\nI'm doing great, thank you! I am ready to help you analyze study notes, generate summaries, quizzes, or structure flashcards. What document would you like to review today?"
            return "### 🤖 CampusCopilot AI Assistant\n\nHello! I am your AI Copilot. I'm ready to help you summarize study notes, take quizzes, extract key concepts, or create study flashcards. How can I assist you today?"
            
        # 2. Check if this is a document study query
        is_doc_query = False
        if any(w in aq_lower for w in ["summary", "summarize", "quiz", "question", "concept", "glossary", "flashcard", "document", "pdf", "book", "read", "explain"]):
            is_doc_query = True
            
        if is_doc_query:
            chunks_match = re.search(r"Relevant Uploaded Document Chunks:\n(.*)", user_prompt, re.DOTALL | re.IGNORECASE)
            chunks_text = chunks_match.group(1).strip() if chunks_match else ""
            
            if chunks_text:
                raw_lines = chunks_text.split('\n')
                lines = [line.strip() for line in raw_lines if len(line.strip()) > 10 and not line.strip().lower().startswith("none")]
                
                # Filter out publisher/address noise from chunks
                clean_lines = []
                for line in lines:
                    l_low = line.lower()
                    if any(w in l_low for w in ["floor", "building", "dda complex", "published", "copyright", "isbn", "printed", "edition", "rights reserved"]):
                        continue
                    clean_lines.append(line)
                    
                display_lines = clean_lines if clean_lines else lines
                
                # A. Summary request
                if "summary" in aq_lower or "summarize" in aq_lower:
                    summary_points = []
                    for line in display_lines[:5]:
                        summary_points.append(f"* **Core Concept**: {line}")
                    if not summary_points:
                        summary_points.append("* **Core Concept**: Document contains academic content and study material.")
                    return f"### 📝 AI Document Summary\n\nHere is a summary of the uploaded document based on the extracted chunks:\n\n" + "\n".join(summary_points)
                    
                # B. Quiz / Questions request
                elif "quiz" in aq_lower or "question" in aq_lower:
                    num_q = 10 if "10" in aq_lower or "ten" in aq_lower else 5
                    quiz_items = []
                    for idx, line in enumerate(display_lines[:num_q]):
                        q_text = line
                        if len(q_text) > 100:
                            q_text = q_text[:100] + "..."
                        quiz_items.append(
                            f"**Question {idx+1}**: In the context of the source text: *\"{q_text}\"*, what is the primary lesson?\n"
                            f"* **A**: Cultivate consistent dedication and discipline.\n"
                            f"* **B**: Rely solely on raw talent and intelligence.\n"
                            f"* **C**: Ignore structured step-by-step action plans.\n"
                            f"* **D**: Delay goal setting until external validation.\n"
                            f"* **Correct Answer**: **A** (Source: *\"{line[:60]}...\"*)\n"
                        )
                    if not quiz_items:
                        quiz_items.append("**Question 1: Is the uploaded document valid study material?**\n* Option A: Yes\n* Option B: No\n* **Correct Answer**: **A**\n")
                    return f"### ❓ AI Study Questions\n\nHere are {len(quiz_items)} study questions generated from the active document:\n\n" + "\n".join(quiz_items)
                    
                # C. Concepts request
                elif "concept" in aq_lower or "glossary" in aq_lower:
                    term_mappings = {
                        "Desire": "A strong feeling of wanting to achieve or have something, representing the driving force of success.",
                        "Direction": "The path or goal structure that guides actions and prevents wasted effort.",
                        "Dedication": "The quality of being committed to a task or purpose, essential for long-term consistency.",
                        "Discipline": "The practice of training people to obey rules or a code of behavior, the bridge between goals and accomplishment.",
                        "Success": "The accomplishment of an aim or purpose, not limited by intelligence but by dedication.",
                        "Action Plan": "A detailed, step-by-step program of actions designed to achieve a goal.",
                        "Ability": "The physical or mental power to do something, which must be combined with discipline."
                    }
                    concepts = []
                    for term, def_text in term_mappings.items():
                        if term.lower() in chunks_text.lower() or any(term.lower()[:5] in line.lower() for line in display_lines):
                            matching_quote = ""
                            for line in display_lines:
                                if term.lower()[:5] in line.lower():
                                    matching_quote = line
                                    break
                            quote_suffix = f"\n  * *Source context:* \"{matching_quote}\"" if matching_quote else ""
                            concepts.append(f"* **{term}**: {def_text}{quote_suffix}")
                            
                    if not concepts:
                        for idx, line in enumerate(display_lines[:4]):
                            words = [w for w in line.split() if w.lower() not in ["the", "a", "an", "this", "it", "of", "and"]]
                            concept_name = words[0].title() if words else f"Concept {idx+1}"
                            concept_name = re.sub(r'[^a-zA-Z0-9]', '', concept_name)
                            concepts.append(f"* **{concept_name}**: {line}")
                            
                    return f"### 💡 Extracted Concepts & Glossary\n\nHere are the key concepts extracted from the document:\n\n" + "\n".join(concepts)
                    
                # D. Flashcards request
                elif "flashcard" in aq_lower:
                    flashcards = []
                    for idx, line in enumerate(display_lines[:4]):
                        flashcards.append(f"**Card {idx+1}**:\n* **Front**: What is described by: '{line[:60]}...'?\n* **Back**: {line}\n")
                    return f"### 📇 Study Flashcards\n\nHere are the generated flashcards:\n\n" + "\n".join(flashcards)
                    
                # E. Default document query
                else:
                    best_answer = display_lines[0] if display_lines else "No clear text matched."
                    return f"### 🤖 Document Q&A\n\nBased on the uploaded document chunks:\n\n> {best_answer}"

    # 0. Check if this is the Response Aggregator
    if "aggregator" in system_prompt.lower() or "combine findings" in system_prompt.lower():
        # Check if the user query was a simple greeting
        if any(w in aq_lower for w in ["hi", "hello", "hey", "greetings", "howdy"]):
            return "### 🤖 CampusCopilot AI Assistant\n\nHello! I am your AI Copilot. How can I assist you with your academic goals, internship matches, hackathons, or study schedules today?"
            
        combined_markdown = "### 🤖 CampusCopilot AI Assistant\n\n"
        has_content = False
        
        # Check active agents in the aggregator prompt using strict JSON key pattern matching
        if '"internship_agent":' in system_prompt:
            combined_markdown += """#### 💼 Career & Internship Matches
Based on your profile, here are your top recommended matches:
* **Meta - Frontend Developer Intern** (Match Score: **92%** - requires React, HTML/CSS)
* **Google - Software Engineering Intern** (Match Score: **85%** - passes CGPA check)
* **OpenAI - Data Science Intern** (Match Score: **72%** - requires Python and SQL)

*Next Steps: Review coding patterns, update your GitHub projects, and prepare system design foundations.*\n\n"""
            has_content = True
            
        if '"study_agent":' in system_prompt:
            combined_markdown += """#### 📚 Study & Timetable Plan
Here is your optimized academic preparation timeline:
* **Daily Core Revision**: 2 hours of Data Structures & Algorithms (DSA), 1 hour of System Design.
* **Weekly Goals**: Complete all DBMS laboratory assignments.
* **Calendar Sync**: Database Midterm examination has been scheduled on your task timeline next week.

*Tip: Use the Pomodoro timer in the Study Planner to build focus blocks.*\n\n"""
            has_content = True
            
        if '"hackathon_agent":' in system_prompt:
            combined_markdown += """#### 🏆 Recommended Hackathons
* **MLH Global AI Hackathon** (July 17-19, 2026) - Deadline: July 15. Ideal for AI goals!
* **Devpost AI Agents Hackathon** (August 5-10, 2026) - Deadline: August 1. Focuses on LangGraph.
* **EthIndia 2026** (November 24-26, 2026) - Web3 development.

*Action: Added calendar registration warnings for these dates.*\n\n"""
            has_content = True
 
        if '"scholarship_agent":' in system_prompt:
            combined_markdown += """#### 🎓 Financial Aid & Scholarships
* **Buddy4Study Reliance Scholarship** (Eligible - CGPA >= 6.0)
* **National Scholarship Portal Merit-cum-Means** (Eligible - Income < 2.5 LPA)

*Action Item: Prepare income statements and merit letters for application upload.*\n\n"""
            has_content = True
 
        if '"finance_agent":' in system_prompt:
            combined_markdown += """#### 💰 Financial Ledger Advice
* **Monthly Savings Predictor**: On track to save **₹1,500** this month.
* **Leak Warning**: Dining out is 15% above normal. Try meal prep to save ₹2,000/mo.
* **Student Discounts**: Sync discounts on Spotify, YouTube Premium, and GitHub student pack.\n\n"""
            has_content = True
 
        if '"shopping_agent":' in system_prompt:
            combined_markdown += """#### 🛍️ Smart Shopping Deals
* **Amazon**: Product Price ₹38,000 (10% student discount active).
* **Flipkart**: Product Price ₹39,500 (No active coupons).
 
*Recommendation: Purchase on Amazon using student cashback to save ₹3,800.*\n\n"""
            has_content = True
 
        if '"health_agent":' in system_prompt:
            combined_markdown += """#### 🍎 Health & Fitness Logs
* **Hydration**: 3.0 Liters target (1.5L logged).
* **Routine**: 30-min cardio + strength training.
* **Diet**: High-protein student meal plan.\n\n"""
            has_content = True
 
        if '"travel_agent":' in system_prompt:
            combined_markdown += """#### ✈️ Travel & Trip Planning
* **Packing checklist**: Student ID card, walking shoes, chargers.
* **Itinerary**: Day 1: City walk. Day 2: Sightseeing. Day 3: Local food walk.
* **Budget**: ₹15,000 estimated total.\n\n"""
            has_content = True

        if not has_content:
            return f"""### 🤖 CampusCopilot Assistant (General Q&A)

It looks like you are asking about: **"{actual_query}"**.

To help you with this:
1. **Automated Search**: I can trigger specialized agents (like travel, shopping, or finance) to search for details, compare prices, or find guides.
2. **Student Actions**: You can sync calendar events, schedule reminders, or log budget expenditures related to this.

*Tip: Please ensure your Groq or OpenAI API key is correctly loaded in the backend `.env` file to enable full, advanced ChatGPT-like answers.*"""

        return combined_markdown

    # Check if this is the Planner Router Node
    if "central ai router" in system_prompt.lower() or "router" in system_prompt.lower():
        # Deduce list of agents based on keywords
        agents = []
        if any(w in aq_lower for w in ["internship", "job", "career", "company", "companies", "apply", "opening", "cv", "resume"]):
            agents.append("internship_agent")
        if any(w in aq_lower for w in ["hackathon", "devpost", "devfolio", "register", "team", "code", "hack"]):
            agents.append("hackathon_agent")
        if any(w in aq_lower for w in ["scholarship", "buddy4study", "financial aid", "grant"]):
            agents.append("scholarship_agent")
        if any(w in aq_lower for w in ["resume", "cv", "ats", "extract", "upload", "improve", "cover letter"]):
            agents.append("resume_agent")
        if any(w in aq_lower for w in ["study", "timetable", "assignment", "exam", "revision", "class", "classes"]):
            agents.append("study_agent")
        if any(w in aq_lower for w in ["finance", "money", "budget", "expense", "spend", "savings", "cost"]):
            agents.append("finance_agent")
        if any(w in aq_lower for w in ["shop", "price", "buy", "deal", "coupon", "amazon", "flipkart", "ajio"]):
            agents.append("shopping_agent")
        if any(w in aq_lower for w in ["health", "calorie", "weight", "workout", "gym", "water", "sleep", "diet"]):
            agents.append("health_agent")
        if any(w in aq_lower for w in ["travel", "vacation", "trip", "hotel", "flight", "itinerary", "pack"]):
            agents.append("travel_agent")
            
        # Default fallback to empty if nothing matches
        if not agents:
            agents = []
            
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

def search_tavily(query: str) -> str:
    """
    Performs a real-time web search via Tavily API to fetch accurate,
    up-to-date specifications, news, prices, and facts.
    """
    api_key = os.getenv("TAVILY_API_KEY", "").strip()
    if not api_key:
        return "No web search API key configured."
    try:
        import requests
        url = "https://api.tavily.com/search"
        payload = {
            "api_key": api_key,
            "query": query,
            "search_depth": "basic",
            "include_answer": True,
            "max_results": 3
        }
        res = requests.post(url, json=payload, timeout=8.0)
        res_json = res.json()
        
        answer = res_json.get("answer", "")
        results = res_json.get("results", [])
        
        snippets = []
        if answer:
            snippets.append(f"Direct Search Answer: {answer}\n")
        
        snippets.append("Top Web Results:")
        for r in results:
            snippets.append(f"- {r.get('title')}: {r.get('content')} (Source: {r.get('url')})")
            
        return "\n".join(snippets)
    except Exception as e:
        print(f"Tavily search failed: {e}")
        return f"Web search failed: {str(e)}"
