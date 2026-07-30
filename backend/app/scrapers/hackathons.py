import requests
from sqlalchemy.orm import Session
from app.database.connection import SessionLocal
from app.database.models import GlobalHackathon

def scrape_hackathons():
    print("Starting HackerEarth API fetch for Hackathons...")
    url = "https://www.hackerearth.com/chrome-extension/events/"
    try:
        # Use standard headers to avoid blocks
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        response = requests.get(url, headers=headers, timeout=15)
        if response.status_code == 200:
            data = response.json()
            events = data.get("response", [])
            
            db: Session = SessionLocal()
            try:
                db.query(GlobalHackathon).delete()
                db.commit()
                
                added = 0
                for item in events:
                    if added >= 50:
                        break
                        
                    # Include all hackathons (Upcoming, Ongoing, Closed) to fill the board
                    hackathon = GlobalHackathon(
                        title=item.get("title", "")[:100],
                        host="HackerEarth",
                        platform="HackerEarth",
                        description=item.get("description", "")[:200] + "...",
                        registration_deadline=item.get("end_date", ""),
                        date=item.get("date", ""),
                        url=item.get("url", ""),
                        mode="Online",
                        scale="Global"
                    )
                    db.add(hackathon)
                    added += 1
                        
                db.commit()
                print(f"Hackathons fetch complete. Added {added} real hackathons.")
            finally:
                db.close()
        else:
            print(f"Failed to fetch Hackathons from HackerEarth. Status code: {response.status_code}")
    except Exception as e:
        print(f"Error fetching Hackathons: {e}")

if __name__ == "__main__":
    scrape_hackathons()
