import datetime
import os
import re
from dotenv import load_dotenv
load_dotenv() # Load local environment variables from .env file

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from app.database.connection import engine, Base, get_db, SessionLocal
from app.database.models import (
    User, UserProfile, InternshipApplication, HackathonRegistration,
    ScholarshipApplication, CalendarEvent, Expense, StudyPlan,
    HealthRecord, TravelPlan, ChatMessage, Notification,
    GlobalHackathon, GlobalInternship, GlobalScholarship, GlobalContest
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

import asyncio
from contextlib import asynccontextmanager
from app.services.email_service import send_deadline_email

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start scrapers in background
    from app.scrapers.hackathons import scrape_hackathons
    from app.scrapers.internships import scrape_internships
    from app.scrapers.scholarships import scrape_scholarships
    from app.scrapers.kontests import scrape_contests

    async def run_scrapers():
        while True:
            try:
                await asyncio.to_thread(scrape_hackathons)
                await asyncio.to_thread(scrape_internships)
                await asyncio.to_thread(scrape_scholarships)
                await asyncio.to_thread(scrape_contests)
            except Exception as e:
                print(f"Scraper error: {e}")
            await asyncio.sleep(43200) # 12 hours

    async def check_deadlines():
        while True:
            try:
                def run_check():
                    db = SessionLocal()
                    try:
                        tomorrow = (datetime.datetime.utcnow() + datetime.timedelta(days=1)).date()
                        # Check internships
                        internships = db.query(InternshipApplication).filter(InternshipApplication.deadline == tomorrow, InternshipApplication.status != "Rejected").all()
                        for item in internships:
                            existing = db.query(Notification).filter(Notification.user_id == item.user_id, Notification.title.contains(item.company)).first()
                            if not existing:
                                title = f"Deadline Alert: {item.company}"
                                msg = f"Your application for {item.role} at {item.company} is due tomorrow!"
                                db.add(Notification(user_id=item.user_id, title=title, message=msg))
                                user = db.query(User).filter(User.id == item.user_id).first()
                                if user and user.email:
                                    send_deadline_email(user.email, title, msg)
                        
                        # Check hackathons
                        hackathons = db.query(HackathonRegistration).filter(HackathonRegistration.dates == str(tomorrow)).all()
                        for item in hackathons:
                            existing = db.query(Notification).filter(Notification.user_id == item.user_id, Notification.title.contains(item.name)).first()
                            if not existing:
                                title = f"Deadline Alert: {item.name}"
                                msg = f"Your hackathon {item.name} is starting/due tomorrow!"
                                db.add(Notification(user_id=item.user_id, title=title, message=msg))
                                user = db.query(User).filter(User.id == item.user_id).first()
                                if user and user.email:
                                    send_deadline_email(user.email, title, msg)
                        
                        # Check scholarships
                        scholarships = db.query(ScholarshipApplication).filter(ScholarshipApplication.deadline == tomorrow).all()
                        for item in scholarships:
                            existing = db.query(Notification).filter(Notification.user_id == item.user_id, Notification.title.contains(item.name)).first()
                            if not existing:
                                title = f"Deadline Alert: {item.name}"
                                msg = f"Your scholarship application for {item.name} is due tomorrow!"
                                db.add(Notification(user_id=item.user_id, title=title, message=msg))
                                user = db.query(User).filter(User.id == item.user_id).first()
                                if user and user.email:
                                    send_deadline_email(user.email, title, msg)
                        
                        db.commit()
                    finally:
                        db.close()
                await asyncio.to_thread(run_check)
            except Exception as e:
                print(f"Deadline checker error: {e}")
            await asyncio.sleep(43200) # 12 hours

    task1 = asyncio.create_task(run_scrapers())
    task2 = asyncio.create_task(check_deadlines())
    yield
    task1.cancel()
    task2.cancel()

app = FastAPI(title="CampusCopilot AI Backend", version="1.0.0", lifespan=lifespan)

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
        
    # Fetch relevant past discussions from long-term vector memory!
    from app.services.memory_service import search_vector_memory, add_to_vector_memory
    semantic_memories = search_vector_memory(current_user.id, chat_in.content, limit=6, filename=chat_in.active_document)
        
    # Execute Multi-Agent Graph with semantic context
    result_state = run_agentic_workflow(
        user_id=current_user.id,
        session_id=chat_in.session_id,
        query=chat_in.content,
        profile_dict=profile_dict,
        chat_history=chat_history,
        semantic_memories=semantic_memories
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
    
    # Store this interaction segment in the long-term semantic vector database!
    add_to_vector_memory(current_user.id, chat_in.session_id, chat_in.content, result_state.get("final_response", ""))
    
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


# === RAG DOCUMENT/PHOTO UPLOAD ROUTE ===
@app.post("/api/chat/upload-document")
def upload_rag_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    filename = file.filename
    try:
        content = file.file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read file: {str(e)}")

    extracted_text = ""
    
    # 1. PDF Documents
    if filename.lower().endswith(".pdf"):
        try:
            extracted_text = extract_text_from_pdf(content)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse PDF: {str(e)}")
            
    # 2. Text / Markdown / JSON
    elif filename.lower().endswith((".txt", ".md", ".json")):
        try:
            extracted_text = content.decode("utf-8")
        except Exception:
            try:
                extracted_text = content.decode("latin1")
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Failed to decode text: {str(e)}")
                
    # 3. Photo Notes / Visual Diagrams
    elif filename.lower().endswith((".png", ".jpg", ".jpeg")):
        import base64
        try:
            img_b64 = base64.b64encode(content).decode("utf-8")
            mime_type = "image/png" if filename.lower().endswith(".png") else "image/jpeg"
            
            from app.utils.llm import chat_model
            if chat_model:
                from langchain_core.messages import HumanMessage
                message = HumanMessage(
                    content=[
                        {"type": "text", "text": "You are a highly accurate Document OCR scanner and analyst. Transcribe all text, numbers, handwriting, tables, and notes present in this document image literally and comprehensively. Return ONLY the transcribed text. Do not summarize or add markdown comments unless explaining a chart."},
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:{mime_type};base64,{img_b64}"}
                        }
                    ]
                )
                res = chat_model.invoke([message])
                extracted_text = res.content
            else:
                extracted_text = f"[Image Document Mock OCR for {filename}]: Visual study notes outlining math formulas, logic definitions, and graph workflows."
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Multimodal vision parsing failed: {str(e)}")
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format. Please upload PDF, TXT, or PNG/JPG images.")
        
    if not extracted_text.strip():
        raise HTTPException(status_code=400, detail="Extracted text is empty. The file may be empty or unreadable.")
        
    # Chunking pipeline (1000 characters, 200 overlap)
    chunk_size = 1000
    overlap = 200
    chunks = []
    start = 0
    while start < len(extracted_text):
        end = start + chunk_size
        chunks.append(extracted_text[start:end])
        if end >= len(extracted_text):
            break
        start += chunk_size - overlap
        
    # Index chunks in LocalVectorStore
    from app.services.memory_service import vector_memory
    from datetime import datetime
    
    for idx, chunk in enumerate(chunks):
        doc_id = f"rag_{current_user.id}_{filename}_{idx}_{datetime.utcnow().timestamp()}"
        vector_memory.add_texts(
            texts=[chunk],
            metadatas=[{
                "user_id": current_user.id,
                "filename": filename,
                "type": "rag_document",
                "chunk_idx": idx
            }],
            ids=[doc_id]
        )
        
    return {
        "filename": filename,
        "message": f"Successfully parsed and indexed {len(chunks)} chunks into vector store.",
        "chunk_count": len(chunks)
    }


@app.get("/api/resume/analyze")
def analyze_resume_endpoint(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = get_or_create_profile(db, current_user.id)
    if not profile.resume_text:
        raise HTTPException(status_code=400, detail="No resume has been uploaded yet.")
        
    sys_prompt = """You are the CampusCopilot ATS Resume Reviewer.
    Your task is to analyze the student's actual resume text and provide a genuine, customized, and highly detailed ATS evaluation.
    
    Instructions:
    1. Scan the resume text for actual technical skills and list them in 'skills_found'.
    2. Recommend 3-5 relevant missing skills in 'skills_missing' based on the student's branch/goals.
    3. Identify 2-3 weak or generic bullet points/phrases *actually written* in the resume text, list them in 'original', and provide highly professional, metric-driven rewrites in 'upgraded'.
       CRITICAL: The 'original' text MUST be a direct quote or close paraphrase of a line actually present in the user's resume text. Do not invent placeholder phrases.
    4. Detect any formatting or layout issues (like missing contact info, sections, etc.) and list them in 'formatting_issues'.
    5. Find any skills listed in the resume that lack associated certifications, and suggest actual professional certification courses (e.g. AWS Certified Developer, Oracle Java, Meta React) in 'certification_recommendations'.
    6. Review language proficiency. Suggest adding standard language scores (like Duolingo English Test (DET), IELTS, TOEFL) to validate verbal/written skills in 'language_suggestions'.
    7. Review project list. Check if they have associated links (GitHub, live deployment, etc.). Highlight which projects need links and recommend actions in 'project_checkup'.
    8. Spot any other inconsistencies (e.g., date formats, typos, style mismatches) and list them in 'inconsistencies'.
    9. Draft a cover letter tailored specifically to the skills and projects mentioned in the resume.
    
    You MUST respond with a valid JSON block of the format:
    {
      "ats_score": 85, // Integer between 0 and 100
      "skills_found": ["Skill1", "Skill2"],
      "skills_missing": ["Skill3", "Skill4"],
      "formatting_issues": ["Issue1", "Issue2"],
      "bullet_upgrades": [
        {"original": "quote of weak line from resume", "upgraded": "strong rewrite"}
      ],
      "certification_recommendations": [
        {"skill": "SkillName", "course": "Recommended Course or Exam Name"}
      ],
      "language_suggestions": ["Language suggestion 1", "Language suggestion 2"],
      "project_checkup": [
        {"project": "Project Name", "status": "Missing Link", "recommendation": "Recommendation text"}
      ],
      "inconsistencies": ["Inconsistency 1", "Inconsistency 2"],
      "cover_letter": "Tailored cover letter text..."
    }
    Only output JSON. Do not include any markdown comments, formatting descriptions, or conversational text outside the JSON block."""
    
    user_context = f"Resume Content:\n{profile.resume_text}\nStudent Profile Details: CGPA: {profile.cgpa}, Branch: {profile.branch}"
    
    from app.utils.llm import call_llm
    raw_analysis = call_llm(sys_prompt, user_context)
    
    import json
    import re
    try:
        match = re.search(r"```json\s*(.*?)\s*```", raw_analysis, re.DOTALL)
        json_str = match.group(1) if match else raw_analysis
        analysis = json.loads(json_str)
        # Guarantee score is capped at 100
        analysis["ats_score"] = min(int(analysis.get("ats_score", 70)), 100)
    except Exception:
        # Fall back to a smart, dynamic local rule parser that parses the actual resume lines
        text = profile.resume_text.lower()
        lines = [line.strip() for line in profile.resume_text.split('\n') if len(line.strip()) > 15]
        
        # Deduce skills found dynamically from the user's actual text
        skills = []
        for s in ["python", "react", "java", "sql", "javascript", "c++", "machine learning", "html", "css", "django", "nodejs", "git"]:
            if s in text:
                skills.append(s.title() if s not in ["sql", "html", "css", "git"] else s.upper())
                
        missing = ["Docker", "CI/CD", "Redis", "Kubernetes", "AWS"]
        missing = [m for m in missing if m.lower() not in text]
        
        bullets = []
        # Find actual lines in their resume to suggest upgrades for
        for line in lines:
            if any(h in line.lower() for h in ["education", "experience", "skills", "projects", "summary", "contact", "mit"]):
                continue
            if len(bullets) >= 3:
                break
                
            clean_original = line[:80] + "..." if len(line) > 80 else line
            bullets.append({
                "original": clean_original,
                "upgraded": f"Re-architected and enhanced: {line.rstrip('.')} utilizing industry best-practices and optimization frameworks, yielding a 25% increase in execution performance."
            })
            
        if not bullets:
            bullets.append({
                "original": "Worked on academic and full stack projects.",
                "upgraded": "Architected full-stack React and Python applications, integrating secure REST APIs and SQL databases."
            })
            
        # Recommend certification courses based on found skills lacking certificates
        certifications = []
        for skill in skills:
            if skill == "Python":
                certifications.append({"skill": "Python", "course": "Python for Everybody Specialization (Coursera/UMich)"})
            elif skill == "React":
                certifications.append({"skill": "React", "course": "Meta Front-End Developer Professional Certificate (Coursera)"})
            elif skill == "SQL":
                certifications.append({"skill": "SQL", "course": "HackerRank SQL Gold Badge / PostgreSQL Certification"})
            elif skill == "Machine Learning":
                certifications.append({"skill": "Machine Learning", "course": "Supervised Machine Learning Spec (DeepLearning.AI / Andrew Ng)"})
            elif skill == "Java":
                certifications.append({"skill": "Java", "course": "Oracle Certified Professional: Java SE 17 Developer"})
        
        if not certifications:
            certifications.append({"skill": "Git & Version Control", "course": "Version Control with Git (Coursera / Atlassian)"})
            
        # Dynamic project checkup
        project_names = []
        for line in lines:
            if "project" in line.lower() or "app" in line.lower() or "system" in line.lower() or "model" in line.lower():
                words = line.split()[:4]
                project_names.append(" ".join(words))
            if len(project_names) >= 2:
                break
                
        project_checkup = []
        for proj in project_names:
            # Check if line contains a link
            has_link = "github.com" in text or "http" in text
            if not has_link:
                project_checkup.append({
                    "project": proj,
                    "status": "Missing Repository Link",
                    "recommendation": f"Add a GitHub project repository link or live deployment URL to prove code verification for '{proj}'."
                })
        if not project_checkup:
            project_checkup.append({
                "project": "Full Stack Projects",
                "status": "Missing Repository Link",
                "recommendation": "Add a GitHub repository URL or a live deployment link next to project titles to verify code implementations."
            })
            
        # Inconsistencies detection
        inconsistencies = []
        if "github.com" not in text:
            inconsistencies.append("Missing Developer Profile: We recommend adding a link to your active GitHub account in the header block.")
        if "linkedin.com" not in text:
            inconsistencies.append("Missing Professional Network: Add a hyperlink to your LinkedIn profile in the contact section.")
        inconsistencies.append("Standardize Date Formats: Ensure dates are formatted consistently (e.g. 'July 2026' or '07/2026') across all milestones.")
        
        raw_score = 75 + len(skills) * 3 if skills else 65
        analysis = {
            "ats_score": min(raw_score, 100),
            "skills_found": skills if skills else ["Software Engineering"],
            "skills_missing": missing[:3],
            "formatting_issues": [
                "Include quantifiable metrics (%, $, time saved) for all work experience bullets."
            ],
            "bullet_upgrades": bullets,
            "certification_recommendations": certifications,
            "language_suggestions": [
                "Suggest adding your Duolingo English Test (DET) score (Target: >120) or IELTS/TOEFL scores to authenticate your verbal and written English communication skills for international recruiters."
            ],
            "project_checkup": project_checkup,
            "inconsistencies": inconsistencies,
            "cover_letter": f"Dear Hiring Manager,\n\nI am writing to express my strong interest in software engineering roles. Based on my resume, I have hands-on experience with {', '.join(skills) if skills else 'programming'} and a solid technical foundation. I look forward to contributing to your projects."
        }
        
    return analysis


# === GLOBAL DISCOVER ROUTERS ===
@app.get("/api/discover/internships")
def get_global_internships(db: Session = Depends(get_db)):
    return db.query(GlobalInternship).all()

@app.get("/api/discover/jobs")
def get_global_jobs(db: Session = Depends(get_db)):
    return db.query(GlobalJob).all()

@app.get("/api/discover/news")
def get_global_news(db: Session = Depends(get_db)):
    return db.query(GlobalNews).all()

@app.get("/api/discover/hackathons")
def get_global_hackathons(db: Session = Depends(get_db)):
    return db.query(GlobalHackathon).all()

@app.get("/api/discover/scholarships")
def get_global_scholarships(db: Session = Depends(get_db)):
    return db.query(GlobalScholarship).all()

@app.get("/api/search")
def search_global_opportunities(q: str = "", category: str = "all", db: Session = Depends(get_db)):
    results = []
    q_lower = f"%{q.lower()}%" if q else "%"
    
    if category in ["all", "internships"]:
        internships = db.query(GlobalInternship).filter(
            (GlobalInternship.role.ilike(q_lower)) | (GlobalInternship.company.ilike(q_lower))
        ).all()
        for i in internships:
            results.append({"type": "internship", "id": i.id, "title": i.role, "company": i.company, "url": i.url, "date": i.deadline})
            
    if category in ["all", "jobs"]:
        jobs = db.query(GlobalJob).filter(
            (GlobalJob.title.ilike(q_lower)) | (GlobalJob.company.ilike(q_lower))
        ).all()
        for j in jobs:
            results.append({"type": "job", "id": j.id, "title": j.title, "company": j.company, "url": j.url, "date": j.posted_date})
            
    if category in ["all", "hackathons"]:
        hackathons = db.query(GlobalHackathon).filter(
            (GlobalHackathon.title.ilike(q_lower)) | (GlobalHackathon.host.ilike(q_lower))
        ).all()
        for h in hackathons:
            results.append({"type": "hackathon", "id": h.id, "title": h.title, "company": h.host, "url": h.url, "date": h.date})
            
    if category in ["all", "scholarships"]:
        scholarships = db.query(GlobalScholarship).filter(
            (GlobalScholarship.name.ilike(q_lower)) | (GlobalScholarship.provider.ilike(q_lower))
        ).all()
        for s in scholarships:
            results.append({"type": "scholarship", "id": s.id, "title": s.name, "company": s.provider, "url": s.url, "date": s.deadline})
            
    return {"query": q, "count": len(results), "results": results}

# === SCHEDULE & TODO ROUTERS ===
@app.get("/api/discover/contests")
def get_global_contests(db: Session = Depends(get_db)):
    return db.query(GlobalContest).all()


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

@app.put("/api/internships/{app_id}", response_model=InternshipApplicationResponse)
def update_internship(
    app_id: int,
    application: InternshipApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_app = db.query(InternshipApplication).filter(InternshipApplication.id == app_id, InternshipApplication.user_id == current_user.id).first()
    if not db_app:
        raise HTTPException(status_code=404, detail="Internship application not found")
    for key, value in application.model_dump().items():
        setattr(db_app, key, value)
    db.commit()
    db.refresh(db_app)
    return db_app

@app.delete("/api/internships/{app_id}")
def delete_internship(
    app_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_app = db.query(InternshipApplication).filter(InternshipApplication.id == app_id, InternshipApplication.user_id == current_user.id).first()
    if not db_app:
        raise HTTPException(status_code=404, detail="Internship application not found")
    db.delete(db_app)
    db.commit()
    return {"status": "success"}


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

@app.put("/api/hackathons/{reg_id}", response_model=HackathonRegistrationResponse)
def update_hackathon(
    reg_id: int,
    registration: HackathonRegistrationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_reg = db.query(HackathonRegistration).filter(HackathonRegistration.id == reg_id, HackathonRegistration.user_id == current_user.id).first()
    if not db_reg:
        raise HTTPException(status_code=404, detail="Hackathon registration not found")
    for key, value in registration.model_dump().items():
        setattr(db_reg, key, value)
    db.commit()
    db.refresh(db_reg)
    return db_reg

@app.delete("/api/hackathons/{reg_id}")
def delete_hackathon(
    reg_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_reg = db.query(HackathonRegistration).filter(HackathonRegistration.id == reg_id, HackathonRegistration.user_id == current_user.id).first()
    if not db_reg:
        raise HTTPException(status_code=404, detail="Hackathon registration not found")
    db.delete(db_reg)
    db.commit()
    return {"status": "success"}


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

@app.put("/api/scholarships/{app_id}", response_model=ScholarshipApplicationResponse)
def update_scholarship(
    app_id: int,
    application: ScholarshipApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_app = db.query(ScholarshipApplication).filter(ScholarshipApplication.id == app_id, ScholarshipApplication.user_id == current_user.id).first()
    if not db_app:
        raise HTTPException(status_code=404, detail="Scholarship application not found")
    for key, value in application.model_dump().items():
        setattr(db_app, key, value)
    db.commit()
    db.refresh(db_app)
    return db_app

@app.delete("/api/scholarships/{app_id}")
def delete_scholarship(
    app_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_app = db.query(ScholarshipApplication).filter(ScholarshipApplication.id == app_id, ScholarshipApplication.user_id == current_user.id).first()
    if not db_app:
        raise HTTPException(status_code=404, detail="Scholarship application not found")
    db.delete(db_app)
    db.commit()
    return {"status": "success"}


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

@app.put("/api/study-plans/{plan_id}", response_model=StudyPlanResponse)
def update_study_plan(
    plan_id: int,
    plan: StudyPlanCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_plan = db.query(StudyPlan).filter(StudyPlan.id == plan_id, StudyPlan.user_id == current_user.id).first()
    if not db_plan:
        raise HTTPException(status_code=404, detail="Study plan not found")
    for key, value in plan.model_dump().items():
        setattr(db_plan, key, value)
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
    # 1. Fetch real calendar events
    events = db.query(CalendarEvent).filter(CalendarEvent.user_id == current_user.id).all()
    results = []
    for e in events:
        results.append({
            "id": e.id,
            "user_id": e.user_id,
            "title": e.title,
            "description": e.description,
            "start_time": e.start_time,
            "end_time": e.end_time,
            "event_type": e.event_type
        })
        
    synthetic_id = -1
    
    # 2. Fetch internships deadlines
    internships = db.query(InternshipApplication).filter(InternshipApplication.user_id == current_user.id).all()
    for item in internships:
        if item.deadline:
            start_dt = datetime.datetime.combine(item.deadline, datetime.time(9, 0))
            end_dt = datetime.datetime.combine(item.deadline, datetime.time(18, 0))
            results.append({
                "id": synthetic_id,
                "user_id": current_user.id,
                "title": f"Deadline: {item.company} - {item.role}",
                "description": f"Internship application deadline for {item.company}.\nNotes: {item.notes or ''}",
                "start_time": start_dt,
                "end_time": end_dt,
                "event_type": "Internship"
            })
            synthetic_id -= 1
        
        # Timeline items
        if item.timeline:
            for mil in item.timeline:
                date_str = mil.get("date", "")
                label = mil.get("label", "Timeline event")
                if date_str:
                    try:
                        p_date = datetime.datetime.strptime(date_str, "%Y-%m-%d").date()
                        start_dt = datetime.datetime.combine(p_date, datetime.time(10, 0))
                        end_dt = datetime.datetime.combine(p_date, datetime.time(11, 0))
                        results.append({
                            "id": synthetic_id,
                            "user_id": current_user.id,
                            "title": f"{item.company}: {label}",
                            "description": f"Interview or milestone step for {item.company}.",
                            "start_time": start_dt,
                            "end_time": end_dt,
                            "event_type": "Interview"
                        })
                        synthetic_id -= 1
                    except Exception:
                        pass

    # 3. Fetch hackathons registrations
    hackathons = db.query(HackathonRegistration).filter(HackathonRegistration.user_id == current_user.id).all()
    for item in hackathons:
        if item.timeline:
            for mil in item.timeline:
                date_str = mil.get("date", "")
                label = mil.get("label", "Timeline event")
                if date_str:
                    try:
                        p_date = datetime.datetime.strptime(date_str, "%Y-%m-%d").date()
                        start_dt = datetime.datetime.combine(p_date, datetime.time(9, 0))
                        end_dt = datetime.datetime.combine(p_date, datetime.time(17, 0))
                        results.append({
                            "id": synthetic_id,
                            "user_id": current_user.id,
                            "title": f"Hackathon: {item.name} - {label}",
                            "description": f"Registration status: {item.status or ''}",
                            "start_time": start_dt,
                            "end_time": end_dt,
                            "event_type": "Hackathon"
                        })
                        synthetic_id -= 1
                    except Exception:
                        pass
        elif item.dates:
            try:
                match = re.search(r"(\d{4}-\d{2}-\d{2})", item.dates)
                if match:
                    p_date = datetime.datetime.strptime(match.group(1), "%Y-%m-%d").date()
                else:
                    p_date = datetime.date.today() + datetime.timedelta(days=3)
                start_dt = datetime.datetime.combine(p_date, datetime.time(9, 0))
                end_dt = datetime.datetime.combine(p_date, datetime.time(18, 0))
                results.append({
                    "id": synthetic_id,
                    "user_id": current_user.id,
                    "title": f"Hackathon: {item.name}",
                    "description": f"Hackathon dates: {item.dates}",
                    "start_time": start_dt,
                    "end_time": end_dt,
                    "event_type": "Hackathon"
                })
                synthetic_id -= 1
            except Exception:
                pass

    # 4. Fetch scholarships deadlines
    scholarships = db.query(ScholarshipApplication).filter(ScholarshipApplication.user_id == current_user.id).all()
    for item in scholarships:
        if item.deadline:
            start_dt = datetime.datetime.combine(item.deadline, datetime.time(9, 0))
            end_dt = datetime.datetime.combine(item.deadline, datetime.time(18, 0))
            results.append({
                "id": synthetic_id,
                "user_id": current_user.id,
                "title": f"Scholarship: {item.name} Deadline",
                "description": f"Scholarship criteria: {item.criteria or ''}\nNotes: {item.notes or ''}",
                "start_time": start_dt,
                "end_time": end_dt,
                "event_type": "Scholarship"
            })
            synthetic_id -= 1
            
        if item.timeline:
            for mil in item.timeline:
                date_str = mil.get("date", "")
                label = mil.get("label", "Timeline event")
                if date_str:
                    try:
                        p_date = datetime.datetime.strptime(date_str, "%Y-%m-%d").date()
                        start_dt = datetime.datetime.combine(p_date, datetime.time(10, 0))
                        end_dt = datetime.datetime.combine(p_date, datetime.time(11, 0))
                        results.append({
                            "id": synthetic_id,
                            "user_id": current_user.id,
                            "title": f"{item.name}: {label}",
                            "description": f"Scholarship process milestone.",
                            "start_time": start_dt,
                            "end_time": end_dt,
                            "event_type": "Scholarship"
                        })
                        synthetic_id -= 1
                    except Exception:
                        pass

    # 5. Fetch study plans
    study_plans = db.query(StudyPlan).filter(StudyPlan.user_id == current_user.id).all()
    for item in study_plans:
        if item.exam_date:
            start_dt = datetime.datetime.combine(item.exam_date, datetime.time(9, 0))
            end_dt = datetime.datetime.combine(item.exam_date, datetime.time(12, 0))
            results.append({
                "id": synthetic_id,
                "user_id": current_user.id,
                "title": f"{item.subject} Exam Date",
                "description": f"Prepare for {item.subject}. Completed: {item.completion_pct or 0}%",
                "start_time": start_dt,
                "end_time": end_dt,
                "event_type": "Exam"
            })
            synthetic_id -= 1

    return results

@app.delete("/api/calendar/{event_id}")
def remove_calendar(event_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    evt = db.query(CalendarEvent).filter(CalendarEvent.id == event_id, CalendarEvent.user_id == current_user.id).first()
    if not evt:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(evt)
    db.commit()
    return {"message": "Deleted successfully"}

@app.get("/api/notifications", response_model=List[dict])
def get_notifications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from app.schemas.schemas import NotificationResponse
    nots = db.query(Notification).filter(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).all()
    return [NotificationResponse.model_validate(n).model_dump() for n in nots]

@app.post("/api/notifications/{notif_id}/read")
def read_notification(notif_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    n = db.query(Notification).filter(Notification.id == notif_id, Notification.user_id == current_user.id).first()
    if not n:
        raise HTTPException(status_code=404, detail="Not found")
    n.is_read = True
    db.commit()
    return {"message": "Read successfully"}

@app.get("/api/shopping/compare")
def compare_shopping_prices(query: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not query:
        raise HTTPException(status_code=400, detail="Query is required")
    
    from app.tools.opportunity_search import search_web_tavily
    # Search for product prices in India
    search_query = f"{query} price in india amazon.in flipkart.com croma.com"
    search_results = search_web_tavily(search_query)
    
    deals = []
    
    # Defaults in case parsing finds nothing
    amazon_deal = {"portal": "Amazon India", "price": 0, "coupon": "AMZSTUDENT (Save 5%)", "link": f"https://www.amazon.in/s?k={query.replace(' ', '+')}"}
    flipkart_deal = {"portal": "Flipkart", "price": 0, "coupon": "None active", "link": f"https://www.flipkart.com/search?q={query.replace(' ', '+')}"}
    croma_deal = {"portal": "Croma Retail", "price": 0, "coupon": "CROMASTUDENT (Save ₹500)", "link": f"https://www.croma.com/search/?text={query.replace(' ', '+')}"}
    
    # Parse results
    if search_results:
        for r in search_results:
            url = r.get("url", "").lower()
            snippet = r.get("description", r.get("content", ""))
            # Try to extract numbers that look like prices
            price_match = re.search(r"(?:Rs\.?|₹)\s?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)", snippet)
            price_val = 0
            if price_match:
                try:
                    price_val = int(price_match.group(1).replace(",", "").split(".")[0])
                except Exception:
                    pass
            
            # Check portal
            if "amazon.in" in url or "amazon.com" in url:
                if price_val > 0:
                    amazon_deal["price"] = price_val
                    amazon_deal["link"] = r.get("url")
            elif "flipkart.com" in url:
                if price_val > 0:
                    flipkart_deal["price"] = price_val
                    flipkart_deal["link"] = r.get("url")
            elif "croma.com" in url:
                if price_val > 0:
                    croma_deal["price"] = price_val
                    croma_deal["link"] = r.get("url")
                    
    # Generate realistic simulated prices if parsing returned 0 (in Rupees)
    base_price = 15000
    if "f15" in query.lower():
        base_price = 12999
    elif "poco" in query.lower():
        base_price = 10999
    elif "book" in query.lower() or "textbook" in query.lower():
        base_price = 850
    elif "laptop" in query.lower():
        base_price = 45000
    elif "headphone" in query.lower() or "earphone" in query.lower():
        base_price = 2499
    elif "iphone" in query.lower():
        base_price = 69900
        
    if amazon_deal["price"] == 0:
        amazon_deal["price"] = base_price
    if flipkart_deal["price"] == 0:
        flipkart_deal["price"] = int(base_price * 1.02)
    if croma_deal["price"] == 0:
        croma_deal["price"] = int(base_price * 1.05)
        
    deals.append(amazon_deal)
    deals.append(flipkart_deal)
    deals.append(croma_deal)
    
    return deals

@app.post("/api/study/ai-action")
def study_ai_action(request: dict, current_user: User = Depends(get_current_user)):
    action = request.get("action")
    payload = request.get("payload", {})
    
    from app.utils.llm import call_llm as query_llm
    import re
    import json
    
    if action == "generate_timetable":
        syllabus = payload.get("syllabus", "")
        goals = payload.get("goals", "")
        weekly_hours = payload.get("weekly_hours", "15")
        difficulty = payload.get("difficulty", "Medium")
        college_timetable = payload.get("college_timetable", "")
        
        sys_prompt = "You are an expert AI Study Planner. Create a highly structured, realistic daily study timetable and weekly target roadmap."
        user_prompt = f"""
        User Target Goals: {goals}
        Syllabus / Subjects: {syllabus}
        College Timetable: {college_timetable}
        Weekly Available Study Hours: {weekly_hours} hours
        Syllabus Difficulty Level: {difficulty}
        
        Generate the output in the following JSON format:
        {{
          "daily": [
            {{"time": "09:00 - 10:30", "type": "Focus Study", "topic": "Fourier Transform equations", "goal": "Derive time scaling properties"}},
            ...
          ],
          "weekly": [
            {{"day": "Mon/Wed", "focus": "Discrete Mathematics & Trees"}}
          ]
        }}
        Return ONLY valid JSON. Make sure you use ONLY the subjects, college hours, and target goals entered by the user. Do not invent any unrelated subjects.
        """
        try:
            res_text = query_llm(sys_prompt, user_prompt)
            if "All live LLM models exhausted" in res_text:
                raise ValueError("Offline fallback")
            json_match = re.search(r"(\{.*\})", res_text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(1))
            return json.loads(res_text)
        except Exception:
            # Local syllabus-aware tabular scheduler fallback
            topics = [t.strip() for t in re.split(r'[,;\n.]', syllabus) if t.strip()][:3]
            if not topics or len(topics[0]) < 2:
                topics = ["Syllabus Core Concepts", "Major Revision Blocks"]
                
            goal_items = [g.strip() for g in re.split(r'[,;\n.]', goals) if g.strip()][:3]
            if not goal_items or len(goal_items[0]) < 2:
                goal_items = ["Achieve target milestones", "Solve DSA/Math homeworks"]
            
            daily_timetable = [
                {
                    "time": "09:00 - 10:30",
                    "type": "Focus Study Block",
                    "topic": f"Study: {topics[0]}",
                    "goal": f"Goal: {goal_items[0]}"
                },
                {
                    "time": "11:00 - 12:30",
                    "type": "Practice & Assessment",
                    "topic": f"Verify: {topics[1 % len(topics)]}",
                    "goal": f"Goal: {goal_items[1 % len(goal_items)]}"
                },
                {
                    "time": "15:00 - 16:30",
                    "type": "Timetable College Slot",
                    "topic": f"College Sync: {college_timetable or 'Self schedule review'}",
                    "goal": f"Sync syllabus topics"
                },
                {
                    "time": "18:00 - 19:30",
                    "type": "Revision Review",
                    "topic": f"Review: {topics[2 % len(topics)]}",
                    "goal": "Verify all notes & update study log"
                }
            ]

            weekly_roadmap = []
            days_list = ["Mon/Wed", "Tue/Thu", "Fri/Sat"]
            for i, day in enumerate(days_list):
                topic_focus = topics[i % len(topics)]
                weekly_roadmap.append({"day": day, "focus": f"Review {topic_focus} ({weekly_hours} hrs weekly pool)"})

            return {"daily": daily_timetable, "weekly": weekly_roadmap}
            
    elif action == "generate_mindmap":
        topic = payload.get("topic", "")
        
        sys_prompt = "You are an expert Mind Map Generator. Generate a hierarchical mind map structure for a given topic."
        user_prompt = f"""
        Topic: {topic}
        
        Generate a mind map structured with exactly 1 root node and 3-5 child nodes representing subtopics, connected by links.
        Return ONLY valid JSON in this format:
        {{
          "nodes": [
            {{"id": 1, "text": "Root topic name..."}},
            {{"id": 2, "text": "Subtopic 1..."}},
            {{"id": 3, "text": "Subtopic 2..."}},
            ...
          ],
          "links": [
            {{"from": 1, "to": 2}},
            {{"from": 1, "to": 3}},
            ...
          ]
        }}
        """
        try:
            res_text = query_llm(sys_prompt, user_prompt)
            if "All live LLM models exhausted" in res_text:
                raise ValueError("Offline fallback")
            json_match = re.search(r"(\{.*\})", res_text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(1))
            return json.loads(res_text)
        except Exception:
            t_lower = topic.lower()
            if "data structure" in t_lower or "dsa" in t_lower or "tree" in t_lower:
                return {
                    "nodes": [
                        {"id": 1, "text": topic},
                        {"id": 2, "text": "Binary Trees"},
                        {"id": 3, "text": "Linked Lists"},
                        {"id": 4, "text": "Graphs & Traversals"},
                        {"id": 5, "text": "Dijkstra Algorithm"}
                    ],
                    "links": [
                        {"from": 1, "to": 2},
                        {"from": 1, "to": 3},
                        {"from": 1, "to": 4},
                        {"from": 1, "to": 5}
                    ]
                }
            elif "fourier" in t_lower or "math" in t_lower:
                return {
                    "nodes": [
                        {"id": 1, "text": topic},
                        {"id": 2, "text": "Time Domain"},
                        {"id": 3, "text": "Frequency Domain"},
                        {"id": 4, "text": "Signal Harmonics"},
                        {"id": 5, "text": "Dirac Delta Scaling"}
                    ],
                    "links": [
                        {"from": 1, "to": 2},
                        {"from": 1, "to": 3},
                        {"from": 1, "to": 4},
                        {"from": 1, "to": 5}
                    ]
                }
            elif "operating system" in t_lower or "os" in t_lower or "scheduling" in t_lower:
                return {
                    "nodes": [
                        {"id": 1, "text": topic},
                        {"id": 2, "text": "CPU Scheduling"},
                        {"id": 3, "text": "Process Sync"},
                        {"id": 4, "text": "Deadlocks"},
                        {"id": 5, "text": "Context Switching"}
                    ],
                    "links": [
                        {"from": 1, "to": 2},
                        {"from": 1, "to": 3},
                        {"from": 1, "to": 4},
                        {"from": 1, "to": 5}
                    ]
                }
            else:
                return {
                    "nodes": [
                        {"id": 1, "text": topic},
                        {"id": 2, "text": f"{topic} Core Principles"},
                        {"id": 3, "text": f"{topic} Methods"},
                        {"id": 4, "text": f"{topic} Practice Problems"},
                        {"id": 5, "text": f"{topic} Advanced Theory"}
                    ],
                    "links": [
                        {"from": 1, "to": 2},
                        {"from": 1, "to": 3},
                        {"from": 1, "to": 4},
                        {"from": 1, "to": 5}
                    ]
                }
            
    elif action == "ask_tutor":
        query = payload.get("query", "")
        syllabus = payload.get("syllabus", "")
        language = payload.get("language", "English")
        
        sys_prompt = f"You are an expert AI Personal Tutor. Explain concepts in simple language, with real-life analogies, and in {language}."
        user_prompt = f"""
        User Query: {query}
        Current Syllabus Context: {syllabus}
        
        Explain the topic clearly, using simple analogies and a structured layout.
        """
        try:
            res_text = query_llm(sys_prompt, user_prompt)
            if "All live LLM models exhausted" in res_text or len(res_text) < 100:
                raise ValueError("Offline fallback")
            return {"reply": res_text}
        except Exception:
            q_lower = query.lower()
            reply = ""
            
            if "fourier" in q_lower:
                if language == "Hindi":
                    reply = "🧠 **फ़ोरियर ट्रांसफ़ॉर्म (Fourier Transform)**: यह एक गणितीय तकनीक है जो किसी जटिल सिग्नल को उसके अलग-अलग फ्रीक्वेंसी (आवृत्ति) घटकों में तोड़ती है। जैसे एक स्मूदी (Smoothie) को देखकर उसके फलों की रेसिपी बताना! इसका उपयोग ऑडियो फ़िल्टरिंग और इमेज कंप्रेशन में होता है।"
                elif language == "Kannada":
                    reply = "🧠 **ಫೋರಿಯರ್ ಟ್ರಾನ್ಸ್‌ಫಾರ್ಮ್ (Fourier Transform)**: ಇದು ಒಂದು ಸಂಕೀರ್ಣ ಸಿಗ್ನಲ್ ಅನ್ನು ಅದರ ಪ್ರತ್ಯೇಕ ಆವರ್ತನಗಳಾಗಿ (Frequencies) ವಿಭಜಿಸುವ ಗಣಿತದ ವಿಧಾನವಾಗಿದೆ. ಒಂದು ಹಣ್ಣಿನ ಜ್ಯೂಸ್ ಅನ್ನು ನೋಡಿ ಅದರಲ್ಲಿರುವ ಹಣ್ಣುಗಳ ಪ್ರಮಾಣವನ್ನು ಗುರುತಿಸುವಂತೆ! ಆಡಿಯೋ ಕಂಪ್ರೆಷನ್ ಮತ್ತು ಇಮೇಜ್ ಪ್ರೊಸೆಸಿಂಗ್‌ನಲ್ಲಿ ಇದನ್ನು ಬಳಸಲಾಗುತ್ತದೆ."
                else:
                    reply = "🧠 **Fourier Transform**: A mathematical technique that decomposes a complex signal into its individual frequency components. Think of looking at a smoothie and instantly listing the exact recipe amounts of banana, milk, and strawberries! In CS, it converts time domain f(t) into frequency domain F(w) for audio/image compression."
            
            elif "tree" in q_lower or "traversal" in q_lower or "dsa" in q_lower:
                if language == "Hindi":
                    reply = "💻 **ट्री ट्रैवर्सल (Tree Traversal)**: एक बाइनरी ट्री में नोड्स पर जाने के तरीके। 1. Inorder (बायाँ, रूट, दायाँ) - यह सॉर्टेड क्रम देता है। 2. Preorder (रूट, बायाँ, दायाँ)। 3. Postorder (बायाँ, दायाँ, रूट)।"
                elif language == "Kannada":
                    reply = "💻 **ಟ್ರೀ ಟ್ರಾವರ್ಸಲ್ (Tree Traversal)**: ಬೈನರಿ ಟ್ರೀಯ ಪ್ರತಿ ನೋಡ್ ಅನ್ನು ಭೇಟಿ ಮಾಡುವ ಮಾರ್ಗಗಳು. 1. ಇನ್-ಆರ್ಡರ್ (ಎಡ, ರೂಟ್, ಬಲ) - ಇದು ನೋಡ್‌ಗಳನ್ನು ಕ್ರಮಬದ್ಧವಾಗಿ ನೀಡುತ್ತದೆ. 2. ಪ್ರಿ-ಆರ್ಡರ್ (ರೂಟ್, ಎಡ, ಬಲ). 3. ಪೋಸ್ಟ್-ಆರ್ಡರ್ (ಎಡ, ಬಲ, ರೂಟ್)."
                else:
                    reply = "💻 **Tree Traversal (DSA)**: Methods to visit all nodes in a tree. 1. Inorder (Left, Root, Right) - yields sorted values for BST. 2. Preorder (Root, Left, Right) - useful for cloning. 3. Postorder (Left, Right, Root) - useful for deleting nodes."
            
            elif "cpu" in q_lower or "scheduling" in q_lower or "operating system" in q_lower or "os" in q_lower:
                if language == "Hindi":
                    reply = "⚙️ **सीपीयू शेड्यूलिंग (CPU Scheduling)**: ऑपरेटिंग सिस्टम का वह तंत्र जो तय करता है कि कौन सा प्रोसेस कब सीपीयू पर चलेगा। प्रमुख एल्गोरिदम: FCFS (पहले आओ पहले पाओ), SJF (सबसे छोटा काम पहले), और Round Robin (टाइम शेयरिंग)।"
                elif language == "Kannada":
                    reply = "⚙️ **ಸಿಪಿಯು ಶೆಡ್ಯೂಲಿಂಗ್ (CPU Scheduling)**: ಆಪರೇಟಿಂಗ್ ಸಿಸ್ಟಂನಲ್ಲಿ ಯಾವ ಪ್ರೊಸೆಸ್ ಯಾವಾಗ ಸಿಪಿಯುನಲ್ಲಿ ರನ್ ಆಗಬೇಕು ಎಂಬುದನ್ನು ನಿರ್ಧರಿಸುವ ತಂತ್ರಜ್ಞಾನ. ಪ್ರಮುಖ ವಿಧಾನಗಳು: FCFS (ಮೊದಲು ಬಂದವರಿಗೆ ಮೊದಲ ಆದ್ಯತೆ), SJF (ಚಿಕ್ಕ ಕೆಲಸಕ್ಕೆ ಮೊದಲ ಆದ್ಯತೆ), ಮತ್ತು Round Robin."
                else:
                    reply = "⚙️ **CPU Scheduling (OS)**: The mechanism by which the Operating System decides which process gets CPU core execution time. Standard algorithms: 1. FCFS (First Come First Served). 2. SJF (Shortest Job First). 3. Round Robin (Time-slice sharing)."
            
            elif "radar" in q_lower:
                if language == "Hindi":
                    reply = "📡 **रडार (RADAR)**: Radio Detection and Ranging। यह वस्तुओं का पता लगाने के लिए रेडियो तरंगों का उपयोग करता है। रडार हवा में रेडियो तरंगों को भेजता है और उनके टकराकर वापस आने के समय से वस्तु की दूरी और गति मापता है।"
                elif language == "Kannada":
                    reply = "📡 **ರಾಡಾರ್ (RADAR)**: Radio Detection and Ranging. ಇದು ವಸ್ತುಗಳ ದೂರ ಮತ್ತು ವೇಗವನ್ನು ಪತ್ತೆಹಚ್ಚಲು ರೇಡಿಯೋ ತರಂಗಗಳನ್ನು ಬಳಸುತ್ತದೆ. ರೇಡಿಯೋ ತರಂಗಗಳನ್ನು ಗಾಳಿಯಲ್ಲಿ ಬಿಟ್ಟು, ಅವು ಹಿಂತಿರುಗಿ ಬರುವ ಸಮಯವನ್ನು ಆಧರಿಸಿ ದೂರವನ್ನು ಲೆಕ್ಕಹಾಕಲಾಗುತ್ತದೆ."
                else:
                    reply = "📡 **RADAR (Radio Detection and Ranging)**: A system that uses radio waves to detect the range, angle, and velocity of objects. It transmits electromagnetic waves into space, which bounce off objects and return to the receiver, letting the system calculate distance based on the speed of light."
            
            else:
                if language == "Hindi":
                    reply = f"✨ **ट्यूटर ऑडिट**: आपके प्रश्न '{query}' के बारे में। यह विषय {syllabus or 'आपके अध्ययन क्षेत्र'} का एक मुख्य भाग है। इसे समझने के लिए फॉर्मूलों का अभ्यास करें और स्पष्टीकरणों पर ध्यान दें।"
                elif language == "Kannada":
                    reply = f"✨ **ಟ್ಯೂಟರ್ ಆಡಿಟ್**: ನಿಮ್ಮ ಪ್ರಶ್ನೆ '{query}' ಬಗ್ಗೆ. ಈ ವಿಷಯವು {syllabus or 'ನಿಮ್ಮ ಪಠ್ಯಕ್ರಮದ'} ಪ್ರಮುಖ ಭಾಗವಾಗಿದೆ. ಇದನ್ನು ಸುಲಭವಾಗಿ ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಉದಾಹರಣೆಗಳನ್ನು ಅಭ್ಯಾಸ ಮಾಡಿ."
                else:
                    reply = f"✨ **Tutor Audit**: Regarding your query on '{query}'. This is a core topic in your syllabus: '{syllabus or 'academic track'}'. Try analyzing its sub-formulas and practicing similar problems."
            
            return {"reply": reply}
            
    elif action == "generate_quiz":
        subject = payload.get("subject", "")
        difficulty = payload.get("difficulty", "Medium")
        
        sys_prompt = "You are an expert Quiz Generator. Create structured test questions."
        user_prompt = f"""
        Subject/Topic: {subject}
        Difficulty: {difficulty}
        
        Generate 3 diverse quiz questions (MCQs or short subjective problems) in this JSON format:
        [
          {{"q": "Question text...", "a": "Answer text...", "difficulty": "{difficulty}"}},
          ...
        ]
        Return ONLY valid JSON.
        """
        try:
            res_text = query_llm(sys_prompt, user_prompt)
            if "All live LLM models exhausted" in res_text:
                raise ValueError("Offline fallback")
            json_match = re.search(r"(\[.*\])", res_text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(1))
            return json.loads(res_text)
        except Exception:
            # Local subject-aware quiz generator fallback
            subj_lower = subject.lower()
            if "fourier" in subj_lower:
                return [
                    {"q": f"What does the Fourier Transform convert a signal from and to? (Difficulty: {difficulty})", "a": "It converts a signal from the Time Domain to the Frequency Domain.", "difficulty": difficulty},
                    {"q": f"What is the Fourier Transform of a Dirac delta function? (Difficulty: {difficulty})", "a": "It is a constant value of 1 across all frequencies.", "difficulty": difficulty},
                    {"q": f"State one application of the Fourier Transform in CS. (Difficulty: {difficulty})", "a": "Audio signal compression (like MP3) and image filtering in computer vision.", "difficulty": difficulty}
                ]
            elif "tree" in subj_lower or "bst" in subj_lower or "data structures" in subj_lower or "dsa" in subj_lower:
                return [
                    {"q": f"What is the average time complexity of searching a node in a balanced Binary Search Tree? (Difficulty: {difficulty})", "a": "O(log n)", "difficulty": difficulty},
                    {"q": f"In which tree traversal are the nodes visited in sorted ascending order? (Difficulty: {difficulty})", "a": "Inorder traversal (Left, Root, Right).", "difficulty": difficulty},
                    {"q": f"What is the difference between a tree and a graph? (Difficulty: {difficulty})", "a": "A tree is an acyclic connected graph, while a graph can contain cycles and multiple connected components.", "difficulty": difficulty}
                ]
            elif "cpu" in subj_lower or "scheduling" in subj_lower or "operating system" in subj_lower or "os" in subj_lower:
                return [
                    {"q": f"Which CPU scheduling algorithm is non-preemptive and selects the process with the shortest execution time? (Difficulty: {difficulty})", "a": "Shortest Job First (SJF) scheduling.", "difficulty": difficulty},
                    {"q": f"What is starvation in CPU scheduling? (Difficulty: {difficulty})", "a": "Starvation is when low-priority processes wait indefinitely because high-priority processes keep executing.", "difficulty": difficulty},
                    {"q": f"What is a context switch? (Difficulty: {difficulty})", "a": "It is the process of saving the state of a CPU process so it can be restored and executed later.", "difficulty": difficulty}
                ]
            else:
                return [
                    {"q": f"Explain the core concept of {subject}. (Difficulty: {difficulty})", "a": f"The core concept of {subject} involves mastering its fundamental blocks and solving practical questions.", "difficulty": difficulty},
                    {"q": f"What is one major challenge when studying {subject}? (Difficulty: {difficulty})", "a": "Retaining complex formulas and practicing spaced repetition revision.", "difficulty": difficulty},
                    {"q": f"How can you apply {subject} in real-world scenarios? (Difficulty: {difficulty})", "a": "By analyzing case studies and writing structured solutions to problem areas.", "difficulty": difficulty}
                ]
            
    else:
        raise HTTPException(status_code=400, detail="Invalid action")

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

@app.get("/api/opportunities/search_link")
def search_opportunity_link(query: str):
    if not query:
        raise HTTPException(status_code=400, detail="Query is required")
    
    from app.tools.opportunity_search import search_web_tavily
    # Append 'official registration portal' to target application sites specifically
    search_query = f"{query} official registration portal"
    results = search_web_tavily(search_query)
    if results and len(results) > 0:
        # Return first result URL
        return {"url": results[0]["url"]}
        
    fallback = query.replace(" ", "+")
    return {"url": f"https://www.google.com/search?q={fallback}"}

@app.get("/api/news")
def get_tech_news(interests: str = "all"):
    from app.tools.opportunity_search import search_web_tavily
    import re
    
    def clean_description(desc: str) -> str:
        if not desc:
            return ""
        # 1. Remove markdown images: ![alt](url)
        desc = re.sub(r'!\[.*?\]\(.*?\)', '', desc)
        # 2. Remove markdown links: [text](url) -> keeping only the text
        desc = re.sub(r'\[(.*?)\]\(.*?\)', r'\1', desc)
        # 3. Remove raw URLs
        desc = re.sub(r'https?://\S+', '', desc)
        # 4. Remove multiple spaces and newlines
        desc = re.sub(r'\s+', ' ', desc)
        # 5. Remove navigation markers like "* Products", "* About", "* Blog", "Go up one level"
        desc = re.sub(r'(\*\s*(Products|Research|About|Resources|Overview|Projects|Blog|Toggle|Overview|Open Source|Products|AI Research|Resources|About|BACK|Sign up|Our approach|Latest news|Newsletter|Categories|World of Work|AI in Action|Marketing AI|Utilities|Inside AI|Explore More|Applications|Enterprise|Industries|Explore More|Applications|Enterprise|Industries|Popular|Tom\'s Hardware|Tom\'s Hardware\'s|Tom\'s Hardware Newsletter)\s*\.?\s*)+', '', desc, flags=re.IGNORECASE)
        # 6. Remove social symbols and leftovers
        desc = desc.replace("[]", "").replace("[ ]", "").replace("[![]()]", "").replace("!", "").strip()
        
        # Slice to a nice length and ensure it ends cleanly
        if len(desc) > 280:
            desc = desc[:280] + "..."
        return desc

    def classify_and_resource_news(title: str, desc: str, url: str) -> tuple:
        t = (title + " " + desc + " " + url).lower()
        
        # Clean text to avoid substring matches in links
        clean_t = re.sub(r'https?://\S+', '', t)
        
        # 1. Check ECE / Semiconductor
        if re.search(r'\b(tsmc|semiconductor|fab|silicon|microprocessor|foundry|asic|fpga|microcontroller|embedded|hardware|vlsi|arm|broadcom|qualcomm|micron|asml|amd|nvidia)\b', clean_t):
            category = "Semiconductor & Hardware"
            border_color = "#ef4444"
            text_color = "text-rose-400"
            bg_color = "bg-rose-500/10"
            icon = "Cpu"
            
            if "nvidia" in clean_t:
                resources = [
                    {"type": "💼 Internship", "title": "NVIDIA ASIC Design Intern", "url": "https://nvidia.wd5.myworkdayjobs.com/NVIDIAExternalCareerSite"},
                    {"type": "🎓 Free Course", "title": "CUDA Parallel Programming", "url": "https://developer.nvidia.com/cuda-education"},
                    {"type": "🌟 Repo", "title": "NVIDIA TensorRT Engine", "url": "https://github.com/NVIDIA/TensorRT"}
                ]
            elif "tsmc" in clean_t:
                resources = [
                    {"type": "💼 Internship", "title": "TSMC Fab Process Engineer Intern", "url": "https://www.tsmc.com/static/english/careers/index.htm"},
                    {"type": "🎓 Free Course", "title": "VLSI Design & Fabrication - MIT OCW", "url": "https://ocw.mit.edu"}
                ]
            else:
                resources = [
                    {"type": "💼 Job", "title": "Graduate Hardware Engineer", "url": "https://amazon.jobs"},
                    {"type": "🎓 Free Course", "title": "Introduction to Embedded Systems", "url": "https://ocw.mit.edu"}
                ]
                
        # 2. Check Cybersecurity
        elif re.search(r'\b(cybersecurity|vulnerability|zero-day|cve|malware|ransomware|breach|firewall|ddos|hack|exploit|spyware|bug\s*bounty)\b', clean_t):
            category = "Cybersecurity"
            border_color = "#10b981"
            text_color = "text-emerald-400"
            bg_color = "bg-emerald-500/10"
            icon = "Shield"
            
            resources = [
                {"type": "🏆 Competition", "title": "Google Capture The Flag (CTF)", "url": "https://capturetheflag.withgoogle.com"},
                {"type": "🎓 Free Course", "title": "Cybersecurity Fundamentals (Cisco)", "url": "https://skillsforall.com"},
                {"type": "💼 Internship", "title": "CISA Cybersecurity Internship", "url": "https://cisa.gov"}
            ]
            
        # 3. Check AI & Machine Learning
        elif re.search(r'\b(openai|gpt|deepmind|gemini|anthropic|claude|llm|hugging\s*face|mistral|xai|ai|artificial\s+intelligence|machine\s+learning)\b', clean_t):
            category = "AI & Machine Learning"
            border_color = "#8b5cf6"
            text_color = "text-brand-violet"
            bg_color = "bg-brand-violet/10"
            icon = "Cpu"
            
            if "openai" in clean_t:
                resources = [
                    {"type": "💼 Internship", "title": "OpenAI Research Intern", "url": "https://openai.com/careers"},
                    {"type": "🎓 Free Course", "title": "OpenAI Cookbook Guides", "url": "https://cookbook.openai.com"}
                ]
            elif "meta" in clean_t:
                resources = [
                    {"type": "💼 Internship", "title": "Meta AI Research Intern", "url": "https://careers.meta.com"},
                    {"type": "🌟 Repo", "title": "Meta LLaMA Model Hub", "url": "https://github.com/meta-llama"}
                ]
            else:
                resources = [
                    {"type": "🎓 Free Course", "title": "Google Intro to Large Language Models", "url": "https://grow.google"},
                    {"type": "🏆 Hackathon", "title": "Hugging Face Global AI Challenge", "url": "https://devpost.com"},
                    {"type": "💼 Internship", "title": "AI Research Assistant (Remote)", "url": "https://wellfound.com"}
                ]
                
        # 4. Check Cloud Computing
        elif re.search(r'\b(aws|amazon\s+web|azure|gcp|google\s+cloud|cloudflare|oracle\s+cloud|cloud\s+hosting|serverless)\b', clean_t):
            category = "Cloud Computing"
            border_color = "#3b82f6"
            text_color = "text-blue-400"
            bg_color = "bg-blue-500/10"
            icon = "Cloud"
            
            resources = [
                {"type": "🎓 Benefit", "title": "$200 AWS Cloud Student Credits", "url": "https://aws.amazon.com/education"},
                {"type": "🎓 Free Course", "title": "AWS Skill Builder Fundamentals", "url": "https://aws.amazon.com/training"}
            ]
            
        # 5. Check Programming & Open Source
        elif re.search(r'\b(python|rust|golang|c\+\+|typescript|javascript|react|next\.js|docker|kubernetes|github|open\s*source|repository|vscode|vs\s*code)\b', clean_t):
            category = "Programming & Open Source"
            border_color = "#06b6d4"
            text_color = "text-brand-cyan"
            bg_color = "bg-brand-cyan/10"
            icon = "Code"
            
            resources = [
                {"type": "🌟 Repo", "title": "GitHub Trending Repositories", "url": "https://github.com/trending"},
                {"type": "🎓 Benefit", "title": "GitHub Student Developer Pack", "url": "https://education.github.com"},
                {"type": "💼 Internship", "title": "Google Summer of Code (GSoC)", "url": "https://summerofcode.withgoogle.com"}
            ]
            
        # 6. Check Startups
        elif re.search(r'\b(funding|seed\s+round|acquisition|unicorn|ipo|layoff|startup|venture|series\s+[a-d])\b', clean_t):
            category = "Startups & Funding"
            border_color = "#14b8a6"
            text_color = "text-teal-400"
            bg_color = "bg-teal-500/10"
            icon = "TrendingUp"
            
            resources = [
                {"type": "💼 Job", "title": "Remote Startup Jobs (Wellfound)", "url": "https://wellfound.com"},
                {"type": "🎓 Free Course", "title": "Y Combinator Startup School", "url": "https://startupschool.org"}
            ]

        # 7. Check Government Tech
        elif re.search(r'\b(isro|drdo|barc|cdac|nic|meity|digital\s+india|startup\s+india)\b', clean_t):
            category = "Government & Deep Tech"
            border_color = "#ec4899"
            text_color = "text-pink-400"
            bg_color = "bg-pink-500/10"
            icon = "Rocket"
            
            resources = [
                {"type": "💼 Internship", "title": "DRDO Student Research Internship", "url": "https://drdo.gov.in"},
                {"type": "💼 Internship", "title": "ISRO Project Internships", "url": "https://isro.gov.in"}
            ]

        # 8. Check Scholarships
        elif re.search(r'\b(scholarship|nsp|national\s+scholarship|buddy4study|financial\s+aid|grant)\b', clean_t):
            category = "Scholarships"
            border_color = "#f59e0b"
            text_color = "text-amber-400"
            bg_color = "bg-amber-500/10"
            icon = "GraduationCap"
            
            resources = [
                {"type": "🎓 Portal", "title": "Buddy4Study Scholarships Portal", "url": "https://buddy4study.com"},
                {"type": "🎓 Portal", "title": "National Scholarship Portal India", "url": "https://scholarships.gov.in"}
            ]

        # 9. Check Hackathons
        elif re.search(r'\b(hackathon|devpost|unstop|hackerearth|mlh|coding\s+contest|kaggle)\b', clean_t):
            category = "Hackathons & Contests"
            border_color = "#eab308"
            text_color = "text-yellow-400"
            bg_color = "bg-yellow-500/10"
            icon = "Award"
            
            resources = [
                {"type": "🏆 Portal", "title": "Unstop Hackathons Portal", "url": "https://unstop.com"},
                {"type": "🏆 Portal", "title": "Devpost Global Hackathons Catalog", "url": "https://devpost.com"}
            ]

        # 10. Default to Industry Trends
        else:
            category = "Industry Trends"
            border_color = "#94a3b8"
            text_color = "text-slate-400"
            bg_color = "bg-slate-500/10"
            icon = "Globe"
            
            resources = [
                {"type": "📰 Trends", "title": "MIT Technology Review Analysis", "url": "https://technologyreview.com"},
                {"type": "🎓 Free Course", "title": "Quantum Mechanics Intro - edX", "url": "https://edx.org"}
            ]
            
        return category, border_color, text_color, bg_color, icon, resources

    # Run multiple aggregation queries based on requested interests
    queries = []
    interest_list = [i.strip().lower() for i in interests.split(",") if i.strip()]
    
    if "all" in interest_list or not interest_list:
        queries = [
            "latest technology AI machine learning software development news",
            "semiconductor chips fabrication TSMC Intel NVIDIA ECE tech news",
            "cybersecurity vulnerability zero-day CVE malware data breach news",
            "open source github trending coding hackathons internships news"
        ]
    else:
        # Map specific interests to detailed search terms
        if "ai" in interest_list or "data science" in interest_list:
            queries.append("latest AI machine learning LLM OpenAI DeepMind VentureBeat news")
        if "cybersecurity" in interest_list:
            queries.append("cybersecurity vulnerability zero-day malware breach bleepingcomputer news")
        if "ece" in interest_list or "embedded systems" in interest_list or "robotics" in interest_list or "iot" in interest_list:
            queries.append("semiconductor fabrication TSMC NVIDIA Intel chip processor robotics news")
        if "web development" in interest_list or "cloud" in interest_list or "android" in interest_list:
            queries.append("web development coding framework AWS React Node Docker cloud news")
        if "startups" in interest_list or "finance" in interest_list:
            queries.append("tech startups funding acquisition unicorn TechCrunch VentureBeat news")
        if not queries:
            queries.append("latest technology software engineering computer science news")

    # Run searches (cap to max 3 parallel queries to keep it fast and responsive)
    raw_results = []
    seen_urls = set()
    
    for q in queries[:3]:
        res = search_web_tavily(q)
        if res:
            for item in res:
                if item["url"] not in seen_urls:
                    seen_urls.add(item["url"])
                    raw_results.append(item)
                    
    # Fallback to rich classified news if Tavily is down
    if not raw_results:
        raw_results = [
            {
                "title": "OpenAI Releases GPT-5 with Advanced Multi-File Coding Agents",
                "description": "The new model showcases major performance leaps in mathematical reasoning, codebase edits, and software development tasks.",
                "url": "https://techcrunch.com/2026/openai-gpt-5-launch",
                "source": "TechCrunch"
            },
            {
                "title": "TSMC Announces Next-Gen 1.4nm Silicon Fabrication Foundry Expansion",
                "description": "TSMC begins Taiwan factory work targeting next-generation AI processors and energy-efficient mobile chips.",
                "url": "https://www.theverge.com/2026/tsmc-semiconductor-expansion",
                "source": "The Verge"
            },
            {
                "title": "Critical zero-day vulnerability in Linux Kernel discovered",
                "description": "A high-severity memory leak CVE has been patched in the latest Linux kernel version. Sysadmins are advised to update immediately.",
                "url": "https://thehackernews.com/2026/linux-kernel-zero-day",
                "source": "The Hacker News"
            },
            {
                "title": "NVIDIA Launches GTC 2026 AI Developer Challenge with $100K Prize Pool",
                "description": "Register for the official NVIDIA AI Hackathon. Build high-performance CUDA applications on Jetson or RTX systems.",
                "url": "https://devpost.com/hackathons/nvidia-gtc-challenge",
                "source": "Devpost"
            },
            {
                "title": "Google STEP Internship 2026 Software Engineering roles open",
                "description": "Google Careers has launched application portal for STEP internships. Fresher CS students are eligible to apply.",
                "url": "https://careers.google.com/jobs/results/step-internship-2026",
                "source": "Google Careers"
            }
        ]

    # Classification and styling pipeline
    formatted_news = []
    for r in raw_results:
        raw_title = r.get("title", "")
        raw_desc = r.get("description", r.get("content", ""))
        raw_url = r.get("url", "")
        
        # Clean description to remove raw markdown images, list items, and site navigation templates
        cleaned_desc = clean_description(raw_desc)
        if not cleaned_desc:
            cleaned_desc = clean_description(raw_title)
            
        category, border_color, text_color, bg_color, icon, extra_resources = classify_and_resource_news(raw_title, raw_desc, raw_url)

        # Cleanup source name
        source = r.get("source", "Tech News")
        url_lower = raw_url.lower()
        if "techcrunch" in url_lower: source = "TechCrunch"
        elif "theverge" in url_lower: source = "The Verge"
        elif "wired" in url_lower: source = "Wired"
        elif "github" in url_lower: source = "GitHub"
        elif "ycombinator" in url_lower or "hacker news" in raw_title.lower(): source = "Hacker News"
        elif "dev.to" in url_lower: source = "Dev.to"
        elif "bleepingcomputer" in url_lower: source = "BleepingComputer"
        elif "thehackernews" in url_lower: source = "The Hacker News"

        formatted_news.append({
            "title": raw_title,
            "description": cleaned_desc,
            "url": raw_url,
            "source": source,
            "date": "Recent",
            "category": category,
            "border_color": border_color,
            "text_color": text_color,
            "bg_color": bg_color,
            "icon": icon,
            "resources": extra_resources
        })
        
    return formatted_news
