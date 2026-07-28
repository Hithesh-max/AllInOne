import requests
import xml.etree.ElementTree as ET
from sqlalchemy.orm import Session
from app.database.connection import SessionLocal
from app.database.models import GlobalInternship
import re

def scrape_internships():
    print("Starting HackerNews Jobs RSS fetch...")
    url = "https://hnrss.org/jobs"
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            root = ET.fromstring(response.content)
            
            db: Session = SessionLocal()
            try:
                db.query(GlobalInternship).delete()
                db.commit()
                
                added = 0
                for item in root.findall('.//item')[:50]:
                    title = item.find('title').text if item.find('title') is not None else "Unknown Role"
                    link = item.find('link').text if item.find('link') is not None else ""
                    pub_date = item.find('pubDate').text if item.find('pubDate') is not None else ""
                    
                    # Try to extract company from title "Company is hiring Role"
                    company = title.split(' is hiring ')[0] if ' is hiring ' in title else "Tech Startup"
                    role = title.split(' is hiring ')[1] if ' is hiring ' in title else title
                    
                    internship = GlobalInternship(
                        company=company[:100],
                        role=role[:100],
                        location="Remote / On-site",
                        stipend="Competitive",
                        deadline=pub_date,
                        description="View full listing for details.",
                        url=link
                    )
                    db.add(internship)
                    added += 1
                db.commit()
                print(f"Internships fetch complete. Added {added} internships.")
            finally:
                db.close()
        else:
            print(f"Failed to fetch Internships. Status code: {response.status_code}")
    except Exception as e:
        print(f"Error fetching Internships: {e}")

if __name__ == "__main__":
    scrape_internships()
