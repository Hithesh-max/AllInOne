import os
import requests
from dotenv import load_dotenv

load_dotenv()

EMAILJS_SERVICE_ID = os.getenv("EMAILJS_SERVICE_ID", "")
EMAILJS_TEMPLATE_ID = os.getenv("EMAILJS_TEMPLATE_ID", "")
EMAILJS_PUBLIC_KEY = os.getenv("EMAILJS_PUBLIC_KEY", "")

def send_deadline_email(to_email: str, subject: str, message_body: str):
    """
    Sends an email notification using EmailJS REST API.
    Requires EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, and EMAILJS_PUBLIC_KEY in env.
    """
    if not EMAILJS_SERVICE_ID or not EMAILJS_TEMPLATE_ID or not EMAILJS_PUBLIC_KEY:
        print(f"[EmailJS Service] Mock Email sent to {to_email}: {subject}")
        return False
        
    url = "https://api.emailjs.com/api/v1.0/email/send"
    
    payload = {
        "service_id": EMAILJS_SERVICE_ID,
        "template_id": EMAILJS_TEMPLATE_ID,
        "user_id": EMAILJS_PUBLIC_KEY,
        "template_params": {
            "to_email": to_email,
            "title": subject,
            "message": message_body
        }
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code == 200:
            print(f"Successfully sent EmailJS deadline email to {to_email}")
            return True
        else:
            print(f"Failed to send EmailJS email to {to_email}: {response.text}")
            return False
    except Exception as e:
        print(f"Exception while sending EmailJS email to {to_email}: {e}")
        return False
