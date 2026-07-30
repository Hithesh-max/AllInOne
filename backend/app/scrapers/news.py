import requests
from sqlalchemy.orm import Session
from app.database.connection import SessionLocal
from app.database.models import GlobalNews
import re

def scrape_news():
    print("Starting Google News RSS fetch for Tech News...")
    # Reliable RSS feed for Technology news from Google News
    url = "https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=en-US&gl=US&ceid=US:en"
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        response = requests.get(url, headers=headers, timeout=15)
        if response.status_code == 200:
            content = response.text
            
            db: Session = SessionLocal()
            try:
                db.query(GlobalNews).delete()
                db.commit()
                
                added = 0
                items = re.findall(r'<item>(.*?)</item>', content, re.DOTALL)
                for item in items[:50]:  # Up to 50 tech news articles
                    t_match = re.search(r'<title>(.*?)</title>', item, re.DOTALL)
                    title = t_match.group(1).replace('<![CDATA[', '').replace(']]>', '') if t_match else "Tech News Update"
                    
                    l_match = re.search(r'<link>(.*?)</link>', item, re.DOTALL)
                    link = l_match.group(1).strip() if l_match else ""
                    
                    d_match = re.search(r'<pubDate>(.*?)</pubDate>', item, re.DOTALL)
                    date = d_match.group(1).strip() if d_match else "Recently"
                    
                    source_match = re.search(r'<source.*?>(.*?)</source>', item, re.DOTALL)
                    source = source_match.group(1).strip() if source_match else "Tech News"
                    
                    news_item = GlobalNews(
                        title=title[:200],
                        source=source[:100],
                        url=link,
                        published_at=date,
                        summary=f"Read the latest technology update from {source}. Click to read full article.",
                        category="Technology",
                        image_url="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400"
                    )
                    db.add(news_item)
                    added += 1
                db.commit()
                print(f"Tech News fetch complete. Added {added} articles.")
            finally:
                db.close()
        else:
            print(f"Failed to fetch News. Status code: {response.status_code}")
    except Exception as e:
        print(f"Error fetching Tech News: {e}")

if __name__ == "__main__":
    scrape_news()
