import requests
import xml.etree.ElementTree as ET
from sqlalchemy.orm import Session
from app.database.connection import SessionLocal
from app.database.models import GlobalScholarship
import re

def scrape_scholarships():
    print("Starting Youthop RSS fetch for Scholarships...")
    url = "https://www.youthop.com/scholarships/feed"
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        response = requests.get(url, headers=headers, timeout=15)
        if response.status_code == 200:
            content = response.text
            
            db: Session = SessionLocal()
            try:
                db.query(GlobalScholarship).delete()
                db.commit()
                
                added = 0
                items = re.findall(r'<item>(.*?)</item>', content, re.DOTALL)
                for item in items[:30]:
                    t_match = re.search(r'<title>(.*?)</title>', item, re.DOTALL)
                    title = t_match.group(1).replace('<![CDATA[', '').replace(']]>', '') if t_match else "Unknown Scholarship"
                    
                    l_match = re.search(r'<link>(.*?)</link>', item, re.DOTALL)
                    link = l_match.group(1).strip() if l_match else ""
                    
                    d_match = re.search(r'<description><!\[CDATA\[(.*?)\]\]></description>', item, re.DOTALL)
                    if not d_match:
                        d_match = re.search(r'<description>(.*?)</description>', item, re.DOTALL)
                    description = d_match.group(1) if d_match else ""
                    
                    clean_desc = re.sub('<[^<]+?>', '', description)[:200] + "..."
                    
                    scholarship = GlobalScholarship(
                        name=title[:100],
                        provider="Youthop Opportunities",
                        amount="Varies",
                        deadline="Check link for deadline",
                        url=link,
                        description=clean_desc
                    )
                    db.add(scholarship)
                    added += 1
                db.commit()
                print(f"Scholarships fetch complete. Added {added} real scholarships.")
            finally:
                db.close()
        else:
            print(f"Failed to fetch Scholarships. Status code: {response.status_code}")
    except Exception as e:
        print(f"Error fetching Scholarships: {e}")

if __name__ == "__main__":
    scrape_scholarships()
