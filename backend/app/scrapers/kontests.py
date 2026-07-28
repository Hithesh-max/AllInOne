import requests
from sqlalchemy.orm import Session
from app.database.connection import SessionLocal
from app.database.models import GlobalContest
from datetime import datetime

def scrape_contests():
    print("Starting Codeforces API fetch...")
    url = "https://codeforces.com/api/contest.list"
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "OK":
                db: Session = SessionLocal()
                try:
                    db.query(GlobalContest).delete()
                    db.commit()
                    
                    added = 0
                    for item in data.get("result", [])[:30]:
                        # Only get upcoming contests
                        if item.get("phase") == "BEFORE":
                            # Convert unix timestamp to readable date
                            start_time = item.get("startTimeSeconds", 0)
                            dt = datetime.fromtimestamp(start_time)
                            date_str = dt.strftime("%B %d, %Y")
                            time_str = dt.strftime("%I:%M %p")
                            
                            duration_sec = item.get("durationSeconds", 0)
                            duration_hours = round(float(duration_sec) / 3600, 1)
                            duration_str = f"{duration_hours} Hours"
                            
                            contest = GlobalContest(
                                title=item.get("name", "Codeforces Contest"),
                                platform="Codeforces",
                                date=date_str,
                                time=time_str,
                                duration=duration_str,
                                url="https://codeforces.com/contests"
                            )
                            db.add(contest)
                            added += 1
                    db.commit()
                    print(f"Codeforces API fetch complete. Added {added} contests.")
                finally:
                    db.close()
            else:
                print("Codeforces API returned error status.")
        else:
            print(f"Failed to fetch Contests. Status code: {response.status_code}")
    except Exception as e:
        print(f"Error fetching Contests: {e}")

if __name__ == "__main__":
    scrape_contests()
