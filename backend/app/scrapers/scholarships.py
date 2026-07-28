import requests
import xml.etree.ElementTree as ET
from sqlalchemy.orm import Session
from app.database.connection import SessionLocal
from app.database.models import GlobalScholarship
import re

def scrape_scholarships():
    print("Starting Scholarships RSS fetch...")
    url = "https://news.google.com/rss/search?q=student+scholarships+apply+open&hl=en-US&gl=US&ceid=US:en"
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            root = ET.fromstring(response.content)
            
            db: Session = SessionLocal()
            try:
                db.query(GlobalScholarship).delete()
                db.commit()
                
                added = 0
                for item in root.findall('.//item')[:30]:
                    title = item.find('title').text if item.find('title') is not None else "Unknown"
                    link = item.find('link').text if item.find('link') is not None else ""
                    pub_date = item.find('pubDate').text if item.find('pubDate') is not None else ""
                    
                    clean_title = title.split(' - ')[0] if ' - ' in title else title
                    
                    scholarship = GlobalScholarship(
                        name=clean_title,
                        provider="Various",
                        amount="Varies",
                        deadline=pub_date,
                        url=link,
                        description="Read more to see eligibility and apply."
                    )
                    db.add(scholarship)
                    added += 1
                db.commit()
                print(f"Scholarships fetch complete. Added {added} scholarships.")
            finally:
                db.close()
        else:
            print(f"Failed to fetch Scholarships. Status code: {response.status_code}")
    except Exception as e:
        print(f"Error fetching Scholarships: {e}")

if __name__ == "__main__":
    scrape_scholarships()
