import os
import json
import requests
from typing import List, Dict, Any

TAVILY_API_KEY = os.getenv("TAVILY_API_KEY", "")

# Curated Mock Datasets
MOCK_INTERNSHIPS = [
    {
        "company": "Google",
        "role": "STEP Intern (Software Engineering)",
        "skills": ["Python", "C++", "Java", "Data Structures"],
        "cgpa_req": 8.0,
        "source": "Google Careers",
        "url": "https://careers.google.com",
        "description": "A 12-week developmental internship for second-year CS undergraduate students.",
        "deadline": "2026-07-02",
        "match_score": 92,
        "timeline": [
            { "stageName": "Resume Screen", "status": "Completed", "details": "Shortlisted for OA" },
            { "stageName": "Online Assessment", "status": "Pending", "deadline": "2026-06-29T23:59:59Z", "daysLeft": 2, "details": "2 Coding questions on DSA" }
        ]
    },
    {
        "company": "Amazon",
        "role": "SDE Intern",
        "skills": ["Java", "C++", "AWS", "SQL"],
        "cgpa_req": 7.5,
        "source": "Amazon Jobs",
        "url": "https://amazon.jobs",
        "description": "Tackle real-world software problems, database optimization, and cloud deployments.",
        "deadline": "2026-07-09",
        "match_score": 85,
        "timeline": [
            { "stageName": "Application Submitted", "status": "Completed", "details": "Successfully logged" },
            { "stageName": "OA Round 1", "status": "Pending", "deadline": "2026-07-09T23:59:59Z", "daysLeft": 7, "details": "Debugging and coding test" }
        ]
    },
    {
        "company": "Meta",
        "role": "Frontend Developer Intern",
        "skills": ["React", "TypeScript", "JavaScript", "HTML/CSS"],
        "cgpa_req": 7.5,
        "source": "Meta Careers",
        "url": "https://careers.meta.com",
        "description": "Work with React and Framer Motion to build stunning user interfaces.",
        "deadline": "2026-08-20",
        "match_score": 78,
        "timeline": [
            { "stageName": "Resume Review", "status": "Pending", "deadline": "2026-08-20T23:59:59Z", "daysLeft": 45, "details": "Portfolio and Github assessment" }
        ]
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
        "deadline": "2026-10-30",
        "timeline": [
            { "stageName": "Internal College Nomination", "status": "Pending", "deadline": "2026-10-15T23:59:59Z", "daysLeft": 100, "details": "Scored top 5 in college internal round" }
        ]
    },
    {
        "name": "EthIndia 2026",
        "dates": "November 24-26, 2026",
        "eligibility": "Open to all, developers, designers, blockchain enthusiasts",
        "source": "Devfolio",
        "url": "https://devfolio.co",
        "domain": "Web3, Blockchain, Ethereum, Security",
        "deadline": "2026-11-01",
        "timeline": [
            { "stageName": "Devfolio Application", "status": "Completed", "details": "Github synced" },
            { "stageName": "Confirmation Ticket", "status": "Pending", "deadline": "2026-11-01T23:59:59Z", "daysLeft": 115, "details": "Waiting for staking window" }
        ]
    },
    {
        "name": "AngelHack Global Hackathon Series",
        "dates": "July 18-19, 2026",
        "eligibility": "Open to students worldwide",
        "source": "AngelHack Portal",
        "url": "https://angelhack.com",
        "domain": "FinTech, Mobility, AI",
        "deadline": "2026-07-08",
        "timeline": [
            { "stageName": "Form Team", "status": "Completed", "details": "Formed 3-person dev squad" },
            { "stageName": "Aptitude pitch check", "status": "Pending", "deadline": "2026-07-08T23:59:59Z", "daysLeft": 7, "details": "Submit 1-pager proposal idea" }
        ]
    }
]

MOCK_SCHOLARSHIPS = [
    {
        "name": "National Scholarship Portal (NSP) Merit-cum-Means",
        "criteria": "CGPA > 7.5, Annual Income < 2.5 LPA",
        "amount": "INR 50,000 per year",
        "source": "National Scholarship Portal",
        "url": "https://scholarships.gov.in",
        "deadline": "2026-08-30",
        "timeline": [
            { "stageName": "Institute Verification", "status": "Pending", "deadline": "2026-08-15T23:59:59Z", "daysLeft": 40, "details": "Lodge transcripts with college nodals" }
        ]
    },
    {
        "name": "Reliance Foundation Undergraduate Scholarship",
        "criteria": "CGPA > 6.0, Any branch, Annual Income < 8 LPA",
        "amount": "Up to INR 2,00,000",
        "source": "Buddy4Study",
        "url": "https://buddy4study.com",
        "deadline": "2026-07-04",
        "timeline": [
            { "stageName": "Application & Docs Verified", "status": "Completed", "details": "All academic certificates validated" },
            { "stageName": "Interview Round", "status": "Pending", "deadline": "2026-07-04T23:59:59Z", "daysLeft": 3, "details": "Personal interview with foundation board" }
        ]
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
    # Steer the query to pull from company portals, government sites, startup pages, and open-source programs
    search_query = f"{query} internship (Google Careers, Microsoft, Amazon, NVIDIA, Adobe, AICTE, DRDO, ISRO, BARC, GSoC, Internshala, Wellfound, Remotive)"
    tavily_results = search_web_tavily(search_query)
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
    # Steer the query to scrape/aggregate from Devpost, Unstop, HackerEarth, and MLH
    search_query = f"{query} hackathon (Devpost, Unstop, HackerEarth, MLH)"
    tavily_results = search_web_tavily(search_query)
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
    # Steer the query to pull from NSP, AICTE, Buddy4Study, and State Gov portals
    search_query = f"{query} scholarship (National Scholarship Portal India, AICTE, Buddy4Study, State Government portal)"
    tavily_results = search_web_tavily(search_query)
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
