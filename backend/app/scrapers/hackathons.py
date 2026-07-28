import requests
import xml.etree.ElementTree as ET
from sqlalchemy.orm import Session
from app.database.connection import SessionLocal
from app.database.models import GlobalHackathon
import re

def scrape_hackathons():
    print("Starting Hackathon News RSS fetch...")
    url = "https://news.google.com/rss/search?q=hackathon+registration+open&hl=en-US&gl=US&ceid=US:en"
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            root = ET.fromstring(response.content)
            
            db: Session = SessionLocal()
            try:
                db.query(GlobalHackathon).delete()
                db.commit()
                
                added = 0
                for item in root.findall('.//item')[:30]:
                    title = item.find('title').text if item.find('title') is not None else "Unknown"
                    link = item.find('link').text if item.find('link') is not None else ""
                    pub_date = item.find('pubDate').text if item.find('pubDate') is not None else ""
                    
                    # Clean title
                    clean_title = title.split(' - ')[0] if ' - ' in title else title
                    
                    hackathon = GlobalHackathon(
                        title=clean_title,
                        host="Tech Event",
                        platform="Web",
                        description="View link for full details and registration.",
                        registration_deadline=pub_date,
                        date="Upcoming",
                        url=link,
                        mode="Online/Hybrid",
                        scale="Global"
                    )
                    db.add(hackathon)
                    added += 1
                db.commit()
                print(f"Hackathons fetch complete. Added {added} hackathons.")
            finally:
                db.close()
        else:
            print(f"Failed to fetch Hackathons. Status code: {response.status_code}")
    except Exception as e:
        print(f"Error fetching Hackathons: {e}")

if __name__ == "__main__":
    scrape_hackathons()
