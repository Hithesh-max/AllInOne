import requests
from sqlalchemy.orm import Session
from app.database.connection import SessionLocal
from app.database.models import GlobalInternship
import re

def scrape_internships():
    print("Starting Remotive API fetch for Internships...")
    url = "https://remotive.com/api/remote-jobs?search=intern"
    try:
        response = requests.get(url, timeout=15)
        if response.status_code == 200:
            data = response.json()
            jobs = data.get("jobs", [])
            
            db: Session = SessionLocal()
            try:
                db.query(GlobalInternship).delete()
                db.commit()
                
                added = 0
                for item in jobs:
                    if added >= 50:
                        break
                    
                    title = item.get("title", "")
                    
                    company_name = item.get("company_name", "Unknown Company")
                    location = item.get("candidate_required_location", "Remote")
                    description = item.get("description", "")
                    # Simple cleanup of HTML tags for summary
                    clean_desc = re.sub('<[^<]+?>', '', description)[:200] + "..."
                    
                    internship = GlobalInternship(
                        company=company_name[:100],
                        role=title[:100],
                        location=location,
                        stipend="Competitive",
                        deadline="Rolling",
                        description=clean_desc,
                        url=item.get("url", "")
                    )
                    db.add(internship)
                    added += 1
                        
                db.commit()
                print(f"Internships fetch complete. Added {added} real remote internships.")
            finally:
                db.close()
        else:
            print(f"Failed to fetch Internships from Remotive. Status code: {response.status_code}")
    except Exception as e:
        print(f"Error fetching Internships: {e}")

if __name__ == "__main__":
    scrape_internships()
