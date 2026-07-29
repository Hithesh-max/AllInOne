import requests
import xml.etree.ElementTree as ET
from sqlalchemy.orm import Session
from app.database.connection import SessionLocal
from app.database.models import GlobalNews
import re

def scrape_news():
    print("Starting TechCrunch RSS fetch for Tech News...")
    url = "https://techcrunch.com/feed/"
    try:
        # Use standard headers
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        response = requests.get(url, headers=headers, timeout=15)
        if response.status_code == 200:
            root = ET.fromstring(response.content)
            
            db: Session = SessionLocal()
            try:
                db.query(GlobalNews).delete()
                db.commit()
                
                added = 0
                for item in root.findall('.//item')[:30]:
                    title = item.find('title').text if item.find('title') is not None else ""
                    link = item.find('link').text if item.find('link') is not None else ""
                    pub_date = item.find('pubDate').text if item.find('pubDate') is not None else ""
                    category = item.find('category').text if item.find('category') is not None else "Tech"
                    description = item.find('description').text if item.find('description') is not None else ""
                    clean_desc = re.sub('<[^<]+?>', '', description)[:200] + "..."
                    
                    news = GlobalNews(
                        title=title[:150],
                        source="TechCrunch",
                        category=category,
                        summary=clean_desc,
                        url=link,
                        published_at=pub_date
                    )
                    db.add(news)
                    added += 1
                        
                db.commit()
                print(f"Tech News fetch complete. Added {added} real news articles.")
            finally:
                db.close()
        else:
            print(f"Failed to fetch Tech News. Status code: {response.status_code}")
    except Exception as e:
        print(f"Error fetching Tech News: {e}")

if __name__ == "__main__":
    scrape_news()
