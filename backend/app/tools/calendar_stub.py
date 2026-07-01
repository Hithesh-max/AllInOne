import datetime
from sqlalchemy.orm import Session
from app.database.models import CalendarEvent

def add_calendar_event(
    db: Session,
    user_id: int,
    title: str,
    description: str,
    start_time: datetime.datetime,
    end_time: datetime.datetime,
    event_type: str = "General"
) -> CalendarEvent:
    """
    Creates a new calendar event in the database.
    """
    event = CalendarEvent(
        user_id=user_id,
        title=title,
        description=description,
        start_time=start_time,
        end_time=end_time,
        event_type=event_type
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


def get_calendar_events(
    db: Session,
    user_id: int,
    start_date: datetime.date = None,
    end_date: datetime.date = None
):
    """
    Fetches all calendar events for a specific user, optionally filtered by date.
    """
    query = db.query(CalendarEvent).filter(CalendarEvent.user_id == user_id)
    if start_date:
        query = query.filter(CalendarEvent.start_time >= start_date)
    if end_date:
        query = query.filter(CalendarEvent.end_time <= end_date)
    return query.order_by(CalendarEvent.start_time.asc()).all()


def send_email_stub(to_email: str, subject: str, body: str) -> str:
    """
    Simulates sending an email by printing to standard output or a local log file.
    """
    email_log = f"=== SIMULATED EMAIL ===\nTo: {to_email}\nSubject: {subject}\nBody: {body}\n========================\n"
    print(email_log)
    return "Email successfully queued for delivery (Simulated)."


def schedule_reminder_stub(title: str, alert_time: datetime.datetime, email: str = None) -> dict:
    """
    Simulates scheduling an alert reminder.
    """
    reminder_info = {
        "title": title,
        "alert_time": alert_time.isoformat(),
        "status": "Scheduled",
        "email_notified": email if email else "None"
    }
    print(f"=== SIMULATED REMINDER SCHEDULED ===\nReminder: {title}\nAt: {alert_time.isoformat()}\n=====================================")
    return reminder_info
