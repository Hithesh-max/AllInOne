import os
import json
import requests
from typing import List, Dict, Any

TAVILY_API_KEY = os.getenv("TAVILY_API_KEY", "")

# Curated Mock Datasets
MOCK_INTERNSHIPS = [
    {
        "company": "Google",
        "role": "Software Engineering Intern",
        "skills": ["Python", "C++", "Java", "Data Structures"],
        "cgpa_req": 8.0,
        "source": "Google Careers",
        "url": "https://careers.google.com",
        "description": "Looking for students in Computer Science. Work on core infrastructure and features.",
        "deadline": "2026-08-15"
    },
    {
        "company": "Meta",
        "role": "Frontend Developer Intern",
        "skills": ["React", "TypeScript", "JavaScript", "HTML/CSS"],
        "cgpa_req": 7.5,
        "source": "Indeed",
        "url": "https://indeed.com",
        "description": "Work with React and Framer Motion to build stunning user interfaces.",
        "deadline": "2026-08-20"
    },
    {
        "company": "OpenAI",
        "role": "Data Science & AI Intern",
        "skills": ["Python", "PyTorch", "SQL", "Machine Learning"],
        "cgpa_req": 8.5,
        "source": "Wellfound",
        "url": "https://wellfound.com",
        "description": "Research and build evaluation suites for next-generation generative AI systems.",
        "deadline": "2026-09-01"
    },
    {
        "company": "Stripe",
        "role": "Backend Engineer Intern",
        "skills": ["Ruby", "Python", "Go", "APIs", "SQL"],
        "cgpa_req": 7.0,
        "source": "LinkedIn",
        "url": "https://linkedin.com",
        "description": "Help construct secure and scalable financial infrastructure APIs.",
        "deadline": "2026-08-10"
    },
    {
        "company": "Flipkart",
        "role": "Mobile App Developer",
        "skills": ["Flutter", "React Native", "Swift", "Kotlin"],
        "cgpa_req": 7.0,
        "source": "Internshala",
        "url": "https://internshala.com",
        "description": "Implement fluid mobile applications for e-commerce platforms.",
        "deadline": "2026-07-28"
    }
]

MOCK_HACKATHONS = [
    {
        "name": "Smart India Hackathon (SIH) 2026",
        "dates": "December 10-15, 2026",
        "eligibility": "Indian college students, CGPA > 6.0",
        "source": "Smart India Hackathon Portal",
        "url": "https://sih.gov.in",
        "domain": "Smart City, Health, Agriculture, Education",
        "deadline": "2026-10-30"
    },
    {
        "name": "EthIndia 2026",
        "dates": "November 24-26, 2026",
        "eligibility": "Open to all, developers, designers, blockchain enthusiasts",
        "source": "Devfolio",
        "url": "https://devfolio.co",
        "domain": "Web3, Blockchain, Ethereum, Security",
        "deadline": "2026-11-01"
    },
    {
        "name": "MLH Global AI Hackathon",
        "dates": "July 17-19, 2026",
        "eligibility": "Open to students worldwide",
        "source": "Major League Hacking (MLH)",
        "url": "https://mlh.io",
        "domain": "Artificial Intelligence, LLMs, Computer Vision",
        "deadline": "2026-07-15"
    },
    {
        "name": "Devpost AI Agents Hackathon",
        "dates": "August 5-10, 2026",
        "eligibility": "Students & Professionals",
        "source": "Devpost",
        "url": "https://devpost.com",
        "domain": "Agentic Workflows, LangGraph, LLMs",
        "deadline": "2026-08-01"
    },
    {
        "name": "Hack2Skill Coding Showdown",
        "dates": "September 12-13, 2026",
        "eligibility": "Engineering branches, CSE/IT preferred",
        "source": "Hack2Skill",
        "url": "https://hack2skill.com",
        "domain": "Competitive Programming, Web Dev",
        "deadline": "2026-09-05"
    }
]

MOCK_SCHOLARSHIPS = [
    {
        "name": "National Scholarship Portal (NSP) Merit-cum-Means",
        "criteria": "CGPA > 7.5, Annual Income < 2.5 LPA",
        "amount": "INR 50,000 per year",
        "source": "National Scholarship Portal",
        "url": "https://scholarships.gov.in",
        "deadline": "2026-10-15"
    },
    {
        "name": "Buddy4Study Reliance Foundation Undergraduate Scholarship",
        "criteria": "CGPA > 6.0, Any branch, Annual Income < 15 LPA",
        "amount": "Up to INR 2,00,000",
        "source": "Buddy4Study",
        "url": "https://buddy4study.com",
        "deadline": "2026-09-30"
    },
    {
        "name": "Adobe Women-in-Technology Scholarship",
        "criteria": "Female students in CSE/IT, CGPA > 8.0",
        "amount": "USD 20,000 + Internship opportunity",
        "source": "Adobe Careers",
        "url": "https://adobe.com",
        "deadline": "2026-09-10"
    },
    {
        "name": "Government Post-Matric Scholarship",
        "criteria": "Annual Family Income < 2.0 LPA",
        "amount": "Full Tuition Fee Waiver",
        "source": "Government Education Portal",
        "url": "https://education.gov.in",
        "deadline": "2026-11-15"
    },
    {
        "name": "College Alumni Merit Scholarship",
        "criteria": "Top 5% of class, CGPA > 9.0",
        "amount": "INR 30,000",
        "source": "College Scholarship Cell",
        "url": "https://college.edu",
        "deadline": "2026-08-31"
    }
]


def search_web_tavily(query: str) -> List[Dict[str, Any]]:
    """Helper to query Tavily API if key exists"""
    if not TAVILY_API_KEY:
        return []
    try:
        url = "https://api.tavily.com/search"
        payload = {
            "api_key": TAVILY_API_KEY,
            "query": query,
            "search_depth": "basic",
            "max_results": 3
        }
        res = requests.post(url, json=payload, timeout=5)
        if res.status_code == 200:
            results = res.json().get("results", [])
            return [
                {
                    "title": item.get("title", ""),
                    "url": item.get("url", ""),
                    "description": item.get("content", ""),
                    "source": "Tavily Search"
                }
                for item in results
            ]
    except Exception:
        pass
    return []


def get_internships(query: str = "") -> List[Dict[str, Any]]:
    """Search internships combining web results and local mock database"""
    tavily_results = search_web_tavily(f"internships {query}")
    if tavily_results:
        # Mix the web results with the mock database
        formatted_tavily = []
        for res in tavily_results:
            formatted_tavily.append({
                "company": res["title"].split(" - ")[0] if " - " in res["title"] else "Opportunity",
                "role": res["title"],
                "skills": ["AI", "Software Dev", "Engineering"],
                "cgpa_req": 6.5,
                "source": "Web Search",
                "url": res["url"],
                "description": res["description"][:200],
                "deadline": "2026-09-30"
            })
        return formatted_tavily + MOCK_INTERNSHIPS
    
    # Simple keyword filter on mock internships
    if query:
        query_lower = query.lower()
        filtered = [
            item for item in MOCK_INTERNSHIPS
            if query_lower in item["company"].lower() 
            or query_lower in item["role"].lower()
            or any(query_lower in skill.lower() for skill in item["skills"])
        ]
        return filtered if filtered else MOCK_INTERNSHIPS
    return MOCK_INTERNSHIPS


def get_hackathons(query: str = "") -> List[Dict[str, Any]]:
    """Search hackathons combining web results and local mock database"""
    tavily_results = search_web_tavily(f"hackathons {query}")
    if tavily_results:
        formatted_tavily = []
        for res in tavily_results:
            formatted_tavily.append({
                "name": res["title"],
                "dates": "TBD (Check website)",
                "eligibility": "Open registration",
                "source": "Web Search",
                "url": res["url"],
                "domain": "Technology, Hackathon",
                "deadline": "2026-09-30"
            })
        return formatted_tavily + MOCK_HACKATHONS
        
    if query:
        query_lower = query.lower()
        filtered = [
            item for item in MOCK_HACKATHONS
            if query_lower in item["name"].lower() 
            or query_lower in item["domain"].lower()
        ]
        return filtered if filtered else MOCK_HACKATHONS
    return MOCK_HACKATHONS


def get_scholarships(query: str = "") -> List[Dict[str, Any]]:
    """Search scholarships combining web results and local mock database"""
    tavily_results = search_web_tavily(f"scholarships {query}")
    if tavily_results:
        formatted_tavily = []
        for res in tavily_results:
            formatted_tavily.append({
                "name": res["title"],
                "criteria": "Check website for eligibility criteria",
                "amount": "TBD",
                "source": "Web Search",
                "url": res["url"],
                "deadline": "2026-10-15"
            })
        return formatted_tavily + MOCK_SCHOLARSHIPS
        
    if query:
        query_lower = query.lower()
        filtered = [
            item for item in MOCK_SCHOLARSHIPS
            if query_lower in item["name"].lower() 
            or query_lower in item["criteria"].lower()
        ]
        return filtered if filtered else MOCK_SCHOLARSHIPS
    return MOCK_SCHOLARSHIPS
