import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON, Date, Boolean
from sqlalchemy.orm import relationship
from app.database.connection import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    internships = relationship("InternshipApplication", back_populates="user", cascade="all, delete-orphan")
    hackathons = relationship("HackathonRegistration", back_populates="user", cascade="all, delete-orphan")
    scholarships = relationship("ScholarshipApplication", back_populates="user", cascade="all, delete-orphan")
    calendar_events = relationship("CalendarEvent", back_populates="user", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="user", cascade="all, delete-orphan")
    study_plans = relationship("StudyPlan", back_populates="user", cascade="all, delete-orphan")
    health_records = relationship("HealthRecord", back_populates="user", cascade="all, delete-orphan")
    travel_plans = relationship("TravelPlan", back_populates="user", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    branch = Column(String, nullable=True)
    cgpa = Column(Float, nullable=True)
    skills = Column(JSON, nullable=True, default=list)  # list of strings
    interests = Column(JSON, nullable=True, default=list)  # list of strings
    budget = Column(Float, nullable=True, default=0.0)
    preferred_companies = Column(JSON, nullable=True, default=list)  # list of strings
    favorite_domains = Column(JSON, nullable=True, default=list)  # list of strings
    health_goals = Column(JSON, nullable=True, default=dict)  # dict of goals
    shopping_preferences = Column(JSON, nullable=True, default=dict)
    travel_preferences = Column(JSON, nullable=True, default=dict)
    resume_text = Column(Text, nullable=True)

    user = relationship("User", back_populates="profile")


class InternshipApplication(Base):
    __tablename__ = "internship_applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    company = Column(String, nullable=False)
    role = Column(String, nullable=False)
    status = Column(String, default="Applied")  # Applied, Interviewing, Offered, Rejected, Bookmarked
    deadline = Column(Date, nullable=True)
    match_score = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)
    timeline = Column(JSON, nullable=True, default=list)

    user = relationship("User", back_populates="internships")


class HackathonRegistration(Base):
    __tablename__ = "hackathon_registrations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    dates = Column(String, nullable=True)
    status = Column(String, default="Registered")  # Registered, In Progress, Submitted, Ended, Bookmarked
    team_status = Column(String, nullable=True)  # Solo, Team Formed, Looking for Team
    notes = Column(Text, nullable=True)
    timeline = Column(JSON, nullable=True, default=list)

    user = relationship("User", back_populates="hackathons")


class ScholarshipApplication(Base):
    __tablename__ = "scholarship_applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    criteria = Column(String, nullable=True)
    status = Column(String, default="Applied")  # Draft, Applied, Awarded, Rejected, Bookmarked
    deadline = Column(Date, nullable=True)
    notes = Column(Text, nullable=True)
    timeline = Column(JSON, nullable=True, default=list)

    user = relationship("User", back_populates="scholarships")


class CalendarEvent(Base):
    __tablename__ = "calendar_events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    event_type = Column(String, default="General")  # Exam, Interview, Study, Travel, Hackathon, General

    user = relationship("User", back_populates="calendar_events")


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category = Column(String, nullable=False)  # Food, Rent, Books, Travel, Entertainment, Other
    amount = Column(Float, nullable=False)
    description = Column(Text, nullable=True)
    date = Column(Date, default=datetime.date.today)

    user = relationship("User", back_populates="expenses")


class StudyPlan(Base):
    __tablename__ = "study_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject = Column(String, nullable=False)
    tasks = Column(JSON, nullable=True, default=list)  # list of dicts {"task": str, "completed": bool}
    exam_date = Column(Date, nullable=True)
    completion_pct = Column(Float, default=0.0)

    user = relationship("User", back_populates="study_plans")


class HealthRecord(Base):
    __tablename__ = "health_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    weight = Column(Float, nullable=True)
    water_intake = Column(Float, nullable=True, default=0.0)  # in Litres
    calories_burned = Column(Integer, nullable=True, default=0)
    sleep_hours = Column(Float, nullable=True, default=0.0)
    date = Column(Date, default=datetime.date.today)

    user = relationship("User", back_populates="health_records")


class TravelPlan(Base):
    __tablename__ = "travel_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    destination = Column(String, nullable=False)
    departure_date = Column(Date, nullable=True)
    return_date = Column(Date, nullable=True)
    budget = Column(Float, nullable=True, default=0.0)
    itinerary = Column(JSON, nullable=True, default=list)  # list of dicts {"day": int, "activities": list}

    user = relationship("User", back_populates="travel_plans")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_id = Column(String, nullable=False, index=True)
    role = Column(String, nullable=False)  # user, assistant, system
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="chat_messages")


# === GLOBAL SCRAPED DATA MODELS ===

class GlobalHackathon(Base):
    __tablename__ = "global_hackathons"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    host = Column(String, nullable=True)
    platform = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    registration_deadline = Column(String, nullable=True)
    date = Column(String, nullable=True)
    url = Column(String, nullable=True)
    tags = Column(JSON, nullable=True, default=list)
    mode = Column(String, nullable=True)
    scale = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class GlobalInternship(Base):
    __tablename__ = "global_internships"

    id = Column(Integer, primary_key=True, index=True)
    company = Column(String, nullable=False)
    role = Column(String, nullable=False)
    location = Column(String, nullable=True)
    stipend = Column(String, nullable=True)
    deadline = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class GlobalScholarship(Base):
    __tablename__ = "global_scholarships"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    provider = Column(String, nullable=True)
    amount = Column(String, nullable=True)
    deadline = Column(String, nullable=True)
    url = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class GlobalContest(Base):
    __tablename__ = "global_contests"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    platform = Column(String, nullable=True)
    date = Column(String, nullable=True)
    time = Column(String, nullable=True)
    duration = Column(String, nullable=True)
    url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    type = Column(String, default="deadline")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="notifications")
