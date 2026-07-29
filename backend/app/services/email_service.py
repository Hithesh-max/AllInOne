import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")

def send_deadline_email(to_email: str, subject: str, message_body: str):
    """
    Sends an email notification. If SMTP is not configured, logs to console instead.
    """
    if not SMTP_USERNAME or not SMTP_PASSWORD:
        print(f"[Email Service] Mock Email sent to {to_email}: {subject}")
        return False
        
    msg = MIMEMultipart()
    msg['From'] = SMTP_USERNAME
    msg['To'] = to_email
    msg['Subject'] = subject
    
    # HTML formatted email body
    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #4f46e5;">CampusCopilot Alert</h2>
          <p style="font-size: 16px; color: #333333;">{message_body}</p>
          <hr style="border: 1px solid #eeeeee; margin: 20px 0;">
          <p style="font-size: 12px; color: #888888;">This is an automated notification from CampusCopilot.</p>
        </div>
      </body>
    </html>
    """
    msg.attach(MIMEText(html_content, 'html'))
    
    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        print(f"Successfully sent deadline email to {to_email}")
        return True
    except Exception as e:
        print(f"Failed to send email to {to_email}: {e}")
        return False
