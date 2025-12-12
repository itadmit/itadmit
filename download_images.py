#!/usr/bin/env python3
"""
סקריפט להורדת כל התמונות מהאתר המקורי ב-Wayback Machine
"""
import requests
import os
import re
from urllib.parse import urlparse, unquote
from pathlib import Path

BASE_URL = "https://web.archive.org/web/20250815142743/https://www.itadmit.co.il/"
WAYBACK_IMAGE_BASE = "https://web.archive.org/web/20250815142743im_/https://www.itadmit.co.il"

# תיקיות יעד
PUBLIC_DIR = Path("public/images")
BG_DIR = Path("public/images/bg")

# יצירת תיקיות
PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
BG_DIR.mkdir(parents=True, exist_ok=True)

def download_image(url, dest_path):
    """הורדת תמונה מ-URL"""
    try:
        print(f"מוריד: {url}")
        response = requests.get(url, timeout=30, allow_redirects=True)
        if response.status_code == 200:
            with open(dest_path, 'wb') as f:
                f.write(response.content)
            print(f"✓ הורד בהצלחה: {dest_path.name}")
            return True
        else:
            print(f"✗ שגיאה: קוד {response.status_code} עבור {url}")
            return False
    except Exception as e:
        print(f"✗ שגיאה בהורדת {url}: {e}")
        return False

def extract_images_from_html(html_content):
    """חילוץ כל כתובות התמונות מה-HTML"""
    images = set()
    
    # חיפוש src="..."
    src_pattern = r'src=["\']([^"\']*\.(jpg|jpeg|png|gif|webp|svg))["\']'
    for match in re.finditer(src_pattern, html_content, re.IGNORECASE):
        img_url = match.group(1)
        if 'wp-content/uploads' in img_url:
            images.add(img_url)
    
    # חיפוש background-image: url(...)
    bg_pattern = r'background-image:\s*url\(["\']?([^"\')]*\.(jpg|jpeg|png|gif|webp|svg))["\']?\)'
    for match in re.finditer(bg_pattern, html_content, re.IGNORECASE):
        img_url = match.group(1)
        if 'wp-content/uploads' in img_url:
            images.add(img_url)
    
    return images

def main():
    print("מתחיל להוריד תמונות מהאתר המקורי...")
    print("=" * 60)
    
    # הורדת ה-HTML של האתר
    print("מוריד את ה-HTML של האתר...")
    try:
        response = requests.get(BASE_URL, timeout=30)
        html_content = response.text
    except Exception as e:
        print(f"שגיאה בהורדת HTML: {e}")
        return
    
    # חילוץ כל התמונות
    print("מחפש תמונות...")
    image_urls = extract_images_from_html(html_content)
    
    print(f"נמצאו {len(image_urls)} תמונות")
    print("=" * 60)
    
    # הורדת כל התמונה
    downloaded = 0
    failed = 0
    
    for img_url in sorted(image_urls):
        # ניקוי URL
        if img_url.startswith('//'):
            img_url = 'https:' + img_url
        elif img_url.startswith('/'):
            img_url = WAYBACK_IMAGE_BASE + img_url
        elif not img_url.startswith('http'):
            img_url = WAYBACK_IMAGE_BASE + '/' + img_url
        
        # קביעת שם הקובץ
        parsed = urlparse(img_url)
        filename = os.path.basename(unquote(parsed.path))
        
        # דילוג על גרסאות קטנות (300x, 150x וכו')
        if re.search(r'-\d+x\d+\.', filename):
            print(f"דילוג על גרסה קטנה: {filename}")
            continue
        
        # קביעת תיקיית יעד
        if 'bg' in filename.lower() or 'background' in filename.lower():
            dest_path = BG_DIR / filename
        else:
            dest_path = PUBLIC_DIR / filename
        
        # הורדה
        if download_image(img_url, dest_path):
            downloaded += 1
        else:
            failed += 1
    
    print("=" * 60)
    print(f"סיימתי!")
    print(f"הורדו בהצלחה: {downloaded} תמונות")
    print(f"נכשלו: {failed} תמונות")
    print(f"התמונות נמצאות ב: {PUBLIC_DIR}")

if __name__ == "__main__":
    main()
