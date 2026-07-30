import requests
from sqlalchemy.orm import Session
from app.database.connection import SessionLocal
from app.database.models import GlobalHackathon
import re

def scrape_hackathons():
    print("Starting Google News RSS fetch for Hackathons...")
    url = "https://news.google.com/rss/search?q=hackathon+OR+hackathons+when:30d&hl=en-US&gl=US&ceid=US:en"
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        response = requests.get(url, headers=headers, timeout=15)
        if response.status_code == 200:
            content = response.text
            
            db: Session = SessionLocal()
            try:
                db.query(GlobalHackathon).delete()
                db.commit()
                
                added = 0
                items = re.findall(r'<item>(.*?)</item>', content, re.DOTALL)
                for item in items[:50]:
                    t_match = re.search(r'<title>(.*?)</title>', item, re.DOTALL)
                    title = t_match.group(1).replace('<![CDATA[', '').replace(']]>', '') if t_match else "Upcoming Hackathon"
                    
                    l_match = re.search(r'<link>(.*?)</link>', item, re.DOTALL)
                    link = l_match.group(1).strip() if l_match else ""
                    
                    d_match = re.search(r'<pubDate>(.*?)</pubDate>', item, re.DOTALL)
                    date = d_match.group(1).strip() if d_match else "Upcoming"
                    
                    source_match = re.search(r'<source.*?>(.*?)</source>', item, re.DOTALL)
                    source = source_match.group(1).strip() if source_match else "Global Hub"
                    
                    hackathon = GlobalHackathon(
                        title=title[:100],
                        host=source[:100],
                        platform="Global Hub",
                        description=f"Join the latest hackathon event reported by {source}. Check the link for registration and details.",
                        registration_deadline=date,
                        date=date,
                        url=link,
                        mode="Online/Offline",
                        scale="Global"
                    )
                    db.add(hackathon)
                    added += 1
                        
                db.commit()
                print(f"Hackathons fetch complete. Added {added} real hackathons.")
            finally:
                db.close()
        else:
            print(f"Failed to fetch Hackathons. Status code: {response.status_code}")
    except Exception as e:
        print(f"Error fetching Hackathons: {e}")

if __name__ == "__main__":
    scrape_hackathons()
