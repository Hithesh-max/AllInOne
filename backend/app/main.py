import datetime
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from app.database.connection import engine, Base, get_db
from app.database.models import (
    User, UserProfile, InternshipApplication, HackathonRegistration,
    ScholarshipApplication, CalendarEvent, Expense, StudyPlan,
    HealthRecord, TravelPlan, ChatMessage
)
from app.auth.router import router as auth_router, get_current_user
from app.schemas.schemas import (
    ChatMessageCreate, ChatQueryResponse,
    InternshipApplicationCreate, InternshipApplicationResponse,
    HackathonRegistrationCreate, HackathonRegistrationResponse,
    ScholarshipApplicationCreate, ScholarshipApplicationResponse,
    CalendarEventCreate, CalendarEventResponse,
    ExpenseCreate, ExpenseResponse,
    StudyPlanCreate, StudyPlanResponse,
    HealthRecordCreate, HealthRecordResponse,
    TravelPlanCreate, TravelPlanResponse,
    UserProfileSchema
)
from app.tools.pdf_parser import extract_text_from_pdf
from app.services.memory_service import update_user_memory_from_dict, get_or_create_profile
from app.agents.graph import run_agentic_workflow

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CampusCopilot AI Backend", version="1.0.0")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For local development simplicity
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Auth Router
app.include_router(auth_router, prefix="/api")


# === CHAT ROUTE ===
@app.post("/api/chat", response_model=ChatQueryResponse)
def ask_assistant(
    chat_in: ChatMessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = get_or_create_profile(db, current_user.id)
    profile_dict = {
        "branch": profile.branch,
        "cgpa": profile.cgpa,
        "skills": profile.skills,
        "interests": profile.interests,
        "budget": profile.budget,
        "preferred_companies": profile.preferred_companies,
        "favorite_domains": profile.favorite_domains,
        "health_goals": profile.health_goals,
        "shopping_preferences": profile.shopping_preferences,
        "travel_preferences": profile.travel_preferences,
        "resume_text": profile.resume_text
    }
    
    # Retrieve past 6 chat messages as history
    history_records = db.query(ChatMessage)\
        .filter(ChatMessage.user_id == current_user.id, ChatMessage.session_id == chat_in.session_id)\
        .order_by(ChatMessage.timestamp.desc())\
        .limit(6).all()
    
    chat_history = []
    for msg in reversed(history_records):
        chat_history.append({"role": msg.role, "content": msg.content})
        
    # Execute Multi-Agent Graph
    result_state = run_agentic_workflow(
        user_id=current_user.id,
        session_id=chat_in.session_id,
        query=chat_in.content,
        profile_dict=profile_dict,
        chat_history=chat_history
    )
    
    # Persist Memory Updates
    memory_updates = result_state.get("memory_updates", {})
    if memory_updates:
        update_user_memory_from_dict(db, current_user.id, memory_updates)
        
    # Persist Scheduled Reminders to DB
    new_reminders = result_state.get("reminders", [])
    for reminder in new_reminders:
        days = reminder.get("days_delta", 1)
        event_time = datetime.datetime.utcnow() + datetime.timedelta(days=days)
        new_event = CalendarEvent(
            user_id=current_user.id,
            title=reminder.get("title", "AI Scheduled Alert"),
            description=f"Automated reminder created by AI Planner. Category: {reminder.get('event_type', 'General')}",
            start_time=event_time,
            end_time=event_time + datetime.timedelta(hours=1),
            event_type=reminder.get("event_type", "General")
        )
        db.add(new_event)
    db.commit()
    
    # Save user query and response to Chat Log
    user_msg = ChatMessage(
        user_id=current_user.id,
        session_id=chat_in.session_id,
        role="user",
        content=chat_in.content
    )
    assistant_msg = ChatMessage(
        user_id=current_user.id,
        session_id=chat_in.session_id,
        role="assistant",
        content=result_state.get("final_response", "")
    )
    db.add(user_msg)
    db.add(assistant_msg)
    db.commit()
    
    return ChatQueryResponse(
        response=result_state.get("final_response", ""),
        active_agents=result_state.get("active_agents", []),
        memory_updates=memory_updates,
        new_reminders=new_reminders
    )


# === RESUME PARSING ROUTE ===
@app.post("/api/resume/upload")
def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF resumes are supported.")
        
    try:
        content = file.file.read()
        extracted_text = extract_text_from_pdf(content)
        
        # Save parsed text to Profile
        profile = get_or_create_profile(db, current_user.id)
        profile.resume_text = extracted_text
        db.commit()
        
        return {"filename": file.filename, "extracted_text_snippet": extracted_text[:500]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse resume: {str(e)}")


# === INTERNSHIPS ROUTER ===
@app.get("/api/internships", response_model=List[InternshipApplicationResponse])
def get_user_internships(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(InternshipApplication).filter(InternshipApplication.user_id == current_user.id).all()

@app.post("/api/internships", response_model=InternshipApplicationResponse)
def create_internship(
    application: InternshipApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_app = InternshipApplication(**application.model_dump(), user_id=current_user.id)
    db.add(db_app)
    db.commit()
    db.refresh(db_app)
    return db_app


# === HACKATHONS ROUTER ===
@app.get("/api/hackathons", response_model=List[HackathonRegistrationResponse])
def get_user_hackathons(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(HackathonRegistration).filter(HackathonRegistration.user_id == current_user.id).all()

@app.post("/api/hackathons", response_model=HackathonRegistrationResponse)
def register_hackathon(
    registration: HackathonRegistrationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_reg = HackathonRegistration(**registration.model_dump(), user_id=current_user.id)
    db.add(db_reg)
    db.commit()
    db.refresh(db_reg)
    return db_reg


# === SCHOLARSHIPS ROUTER ===
@app.get("/api/scholarships", response_model=List[ScholarshipApplicationResponse])
def get_user_scholarships(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(ScholarshipApplication).filter(ScholarshipApplication.user_id == current_user.id).all()

@app.post("/api/scholarships", response_model=ScholarshipApplicationResponse)
def create_scholarship(
    application: ScholarshipApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_app = ScholarshipApplication(**application.model_dump(), user_id=current_user.id)
    db.add(db_app)
    db.commit()
    db.refresh(db_app)
    return db_app


# === EXPENSES ROUTER ===
@app.get("/api/expenses", response_model=List[ExpenseResponse])
def get_expenses(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Expense).filter(Expense.user_id == current_user.id).all()

@app.post("/api/expenses", response_model=ExpenseResponse)
def add_expense(
    expense: ExpenseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_exp = Expense(**expense.model_dump(), user_id=current_user.id)
    db.add(db_exp)
    db.commit()
    db.refresh(db_exp)
    return db_exp


# === STUDY PLAN ROUTER ===
@app.get("/api/study-plans", response_model=List[StudyPlanResponse])
def get_study_plans(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(StudyPlan).filter(StudyPlan.user_id == current_user.id).all()

@app.post("/api/study-plans", response_model=StudyPlanResponse)
def create_study_plan(
    plan: StudyPlanCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_plan = StudyPlan(**plan.model_dump(), user_id=current_user.id)
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan


# === HEALTH ROUTER ===
@app.get("/api/health", response_model=List[HealthRecordResponse])
def get_health_records(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(HealthRecord).filter(HealthRecord.user_id == current_user.id).all()

@app.post("/api/health", response_model=HealthRecordResponse)
def create_health_record(
    record: HealthRecordCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_rec = HealthRecord(**record.model_dump(), user_id=current_user.id)
    db.add(db_rec)
    db.commit()
    db.refresh(db_rec)
    return db_rec


# === TRAVEL ROUTER ===
@app.get("/api/travel", response_model=List[TravelPlanResponse])
def get_travel_plans(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(TravelPlan).filter(TravelPlan.user_id == current_user.id).all()

@app.post("/api/travel", response_model=TravelPlanResponse)
def create_travel_plan(
    plan: TravelPlanCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_plan = TravelPlan(**plan.model_dump(), user_id=current_user.id)
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan


# === CALENDAR ROUTER ===
@app.get("/api/calendar", response_model=List[CalendarEventResponse])
def get_calendar(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(CalendarEvent).filter(CalendarEvent.user_id == current_user.id).all()

@app.post("/api/calendar", response_model=CalendarEventResponse)
def add_calendar(
    event: CalendarEventCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_evt = CalendarEvent(**event.model_dump(), user_id=current_user.id)
    db.add(db_evt)
    db.commit()
    db.refresh(db_evt)
    return db_evt
