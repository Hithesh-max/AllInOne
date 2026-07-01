from pydantic import BaseModel, EmailStr, Field
from typing import List, Dict, Any, Optional
from datetime import datetime, date

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[str] = None

# User schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Profile schemas
class UserProfileSchema(BaseModel):
    branch: Optional[str] = None
    cgpa: Optional[float] = None
    skills: List[str] = []
    interests: List[str] = []
    budget: float = 0.0
    preferred_companies: List[str] = []
    favorite_domains: List[str] = []
    health_goals: Dict[str, Any] = {}
    shopping_preferences: Dict[str, Any] = {}
    travel_preferences: Dict[str, Any] = {}
    resume_text: Optional[str] = None

    class Config:
        from_attributes = True

class UserProfileUpdate(UserProfileSchema):
    pass

# Internship schemas
class InternshipApplicationCreate(BaseModel):
    company: str
    role: str
    status: str = "Applied"
    deadline: Optional[date] = None
    match_score: Optional[int] = None
    notes: Optional[str] = None

class InternshipApplicationResponse(BaseModel):
    id: int
    user_id: int
    company: str
    role: str
    status: str
    deadline: Optional[date] = None
    match_score: Optional[int] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True

# Hackathon schemas
class HackathonRegistrationCreate(BaseModel):
    name: str
    dates: Optional[str] = None
    status: str = "Registered"
    team_status: Optional[str] = None
    notes: Optional[str] = None

class HackathonRegistrationResponse(BaseModel):
    id: int
    user_id: int
    name: str
    dates: Optional[str] = None
    status: str
    team_status: Optional[str] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True

# Scholarship schemas
class ScholarshipApplicationCreate(BaseModel):
    name: str
    criteria: Optional[str] = None
    status: str = "Applied"
    deadline: Optional[date] = None
    notes: Optional[str] = None

class ScholarshipApplicationResponse(BaseModel):
    id: int
    user_id: int
    name: str
    criteria: Optional[str] = None
    status: str
    deadline: Optional[date] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True

# Calendar schemas
class CalendarEventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    event_type: str = "General"

class CalendarEventResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    event_type: str

    class Config:
        from_attributes = True

# Expense schemas
class ExpenseCreate(BaseModel):
    category: str
    amount: float
    description: Optional[str] = None
    date: Optional[date] = None

class ExpenseResponse(BaseModel):
    id: int
    user_id: int
    category: str
    amount: float
    description: Optional[str] = None
    date: date

    class Config:
        from_attributes = True

# StudyPlan schemas
class StudyPlanCreate(BaseModel):
    subject: str
    tasks: List[Dict[str, Any]] = []
    exam_date: Optional[date] = None
    completion_pct: float = 0.0

class StudyPlanResponse(BaseModel):
    id: int
    user_id: int
    subject: str
    tasks: List[Dict[str, Any]]
    exam_date: Optional[date] = None
    completion_pct: float

    class Config:
        from_attributes = True

# HealthRecord schemas
class HealthRecordCreate(BaseModel):
    weight: Optional[float] = None
    water_intake: float = 0.0
    calories_burned: int = 0
    sleep_hours: float = 0.0
    date: Optional[date] = None

class HealthRecordResponse(BaseModel):
    id: int
    user_id: int
    weight: Optional[float] = None
    water_intake: float
    calories_burned: int
    sleep_hours: float
    date: date

    class Config:
        from_attributes = True

# TravelPlan schemas
class TravelPlanCreate(BaseModel):
    destination: str
    departure_date: Optional[date] = None
    return_date: Optional[date] = None
    budget: float = 0.0
    itinerary: List[Dict[str, Any]] = []

class TravelPlanResponse(BaseModel):
    id: int
    user_id: int
    destination: str
    departure_date: Optional[date] = None
    return_date: Optional[date] = None
    budget: float
    itinerary: List[Dict[str, Any]]

    class Config:
        from_attributes = True

# Chat schemas
class ChatMessageCreate(BaseModel):
    session_id: str
    content: str

class ChatMessageResponse(BaseModel):
    id: int
    session_id: str
    role: str
    content: str
    timestamp: datetime

    class Config:
        from_attributes = True

class ChatQueryResponse(BaseModel):
    response: str
    active_agents: List[str]
    memory_updates: Dict[str, Any]
    new_reminders: List[Dict[str, Any]]
