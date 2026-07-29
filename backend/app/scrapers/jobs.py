import requests
from sqlalchemy.orm import Session
from app.database.connection import SessionLocal
from app.database.models import GlobalJob
import re

def scrape_jobs():
    print("Starting Arbeitnow API fetch for Jobs...")
    url = "https://www.arbeitnow.com/api/job-board-api"
    try:
        response = requests.get(url, timeout=15)
        if response.status_code == 200:
            data = response.json()
            jobs = data.get("data", [])
            
            db: Session = SessionLocal()
            try:
                db.query(GlobalJob).delete()
                db.commit()
                
                added = 0
                for item in jobs:
                    if added >= 50:
                        break
                    
                    title = item.get("title", "")
                    description = item.get("description", "")
                    clean_desc = re.sub('<[^<]+?>', '', description)[:200] + "..."
                    
                    job = GlobalJob(
                        title=title[:100],
                        company=item.get("company_name", "Unknown Company")[:100],
                        location=item.get("location", "Remote"),
                        job_type="Remote" if item.get("remote") else "On-site",
                        description=clean_desc,
                        url=item.get("url", ""),
                        posted_date=str(item.get("created_at", ""))
                    )
                    db.add(job)
                    added += 1
                        
                db.commit()
                print(f"Jobs fetch complete. Added {added} real jobs.")
            finally:
                db.close()
        else:
            print(f"Failed to fetch Jobs from Arbeitnow. Status code: {response.status_code}")
    except Exception as e:
        print(f"Error fetching Jobs: {e}")

if __name__ == "__main__":
    scrape_jobs()
