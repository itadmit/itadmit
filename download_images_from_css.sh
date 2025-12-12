#!/bin/bash

# סקריפט להורדת כל התמונות מה-CSS של האתר המקורי

# נשתמש ב-CSS מה-HTML של הדף הראשי
HTML_URL="https://web.archive.org/web/20250815142743/https://www.itadmit.co.il/"
BASE_URL="https://web.archive.org/web/20250815142743im_/https://www.itadmit.co.il"
PUBLIC_DIR="public/images"
BG_DIR="public/images/bg"

# יצירת תיקיות
mkdir -p "$PUBLIC_DIR" "$BG_DIR"

echo "מוריד HTML מהאתר..."
HTML_CONTENT=$(curl -s -L --max-time 30 "$HTML_URL" 2>&1)

if [ -z "$HTML_CONTENT" ] || echo "$HTML_CONTENT" | grep -q "curl:"; then
    echo "✗ שגיאה: לא הצלחתי להוריד את ה-HTML"
    exit 1
fi

echo "✓ HTML הורד בהצלחה"
echo "מחפש תמונות ב-HTML ו-CSS..."

# חילוץ כל התמונות מה-HTML
# מחפש background-image:url("https://...")
CSS_CONTENT="$HTML_CONTENT"

echo "✓ CSS הורד בהצלחה"
echo "מחפש תמונות ב-CSS..."

# חילוץ כל כתובות התמונות מה-CSS
# מחפש background-image:url("https://...")
BG_IMAGES=$(echo "$CSS_CONTENT" | grep -oE 'background-image:url\([^)]+\)' | sed 's/background-image:url(//g' | sed 's/)//g' | sed 's/"//g' | sed "s/'//g" | sort -u)

# גם מחפש כל url(https://...) אחר
OTHER_URLS=$(echo "$CSS_CONTENT" | grep -oE 'url\(["\047]?https?://[^"\047)]+\.(jpg|jpeg|png|gif|webp|svg)["\047]?\)' | sed 's/url(//g' | sed 's/)//g' | sed 's/"//g' | sed "s/'//g" | sort -u)

# שילוב שתי הרשימות
IMAGE_URLS=$(echo -e "$BG_IMAGES\n$OTHER_URLS" | sort -u)

# ספירת תמונות
TOTAL=$(echo "$IMAGE_URLS" | grep -v '^$' | wc -l | tr -d ' ')
echo "נמצאו $TOTAL תמונות"
echo "=========================================="

if [ "$TOTAL" -eq 0 ] || [ -z "$IMAGE_URLS" ]; then
    echo "לא נמצאו תמונות ב-CSS"
    exit 0
fi

downloaded=0
failed=0

# הורדת כל תמונה
while IFS= read -r img_url; do
    if [ -z "$img_url" ]; then
        continue
    fi
    
    # קביעת שם הקובץ
    filename=$(basename "$img_url" | sed 's/%20/_/g' | sed 's/%D7%9C%D7%95%D7%92%D7%95/logo/g')
    
    # דילוג על גרסאות קטנות (300x, 150x וכו')
    if echo "$filename" | grep -qE '-[0-9]+x[0-9]+\.'; then
        echo "דילוג על גרסה קטנה: $filename"
        continue
    fi
    
    # קביעת תיקיית יעד
    if echo "$filename" | grep -qiE '(bg|background|hero|mobile|מובייל)'; then
        dest_path="$BG_DIR/$filename"
    else
        dest_path="$PUBLIC_DIR/$filename"
    fi
    
    # אם הקובץ כבר קיים, דילוג
    if [ -f "$dest_path" ]; then
        echo "דילוג על קובץ קיים: $filename"
        continue
    fi
    
    echo "מוריד: $filename"
    
    # אם ה-URL כבר מכיל את Wayback Machine, השתמש בו ישירות
    if echo "$img_url" | grep -q "web.archive.org"; then
        download_url="$img_url"
    else
        # ניסיון להוריד מ-Wayback Machine
        # חילוץ הנתיב מה-URL המקורי
        img_path=$(echo "$img_url" | sed 's|https\?://[^/]*||')
        wayback_url="${BASE_URL}${img_path}"
        download_url="$wayback_url"
    fi
    
    # ניסיון ראשון - מ-Wayback Machine או מה-URL המקורי
    curl -L -f -s -o "$dest_path" "$download_url" 2>/dev/null
    
    if [ $? -ne 0 ] || [ ! -f "$dest_path" ] || [ ! -s "$dest_path" ]; then
        # ניסיון שני - ישירות מה-URL המקורי (אם לא ניסינו כבר)
        if [ "$download_url" != "$img_url" ]; then
            curl -L -f -s -o "$dest_path" "$img_url" 2>/dev/null
        fi
    fi
    
    if [ $? -eq 0 ] && [ -f "$dest_path" ] && [ -s "$dest_path" ]; then
        file_size=$(stat -f%z "$dest_path" 2>/dev/null || stat -c%s "$dest_path" 2>/dev/null)
        if [ "$file_size" -gt 0 ]; then
            echo "✓ הורד: $filename ($(numfmt --to=iec-i --suffix=B $file_size 2>/dev/null || echo "${file_size}B"))"
            downloaded=$((downloaded + 1))
        else
            echo "✗ קובץ ריק: $filename"
            rm -f "$dest_path"
            failed=$((failed + 1))
        fi
    else
        echo "✗ שגיאה בהורדת: $filename"
        failed=$((failed + 1))
    fi
    
done <<< "$IMAGE_URLS"

echo ""
echo "=========================================="
echo "סיימתי להוריד תמונות!"
echo "הורדו בהצלחה: $downloaded תמונות"
echo "נכשלו: $failed תמונות"
echo ""
echo "התמונות נמצאות ב:"
echo "  - לוגואים: $PUBLIC_DIR"
echo "  - רקעים: $BG_DIR"
echo ""
echo "רשימת קבצים חדשים:"
ls -lh "$PUBLIC_DIR" 2>/dev/null | tail -n +2 | head -10
echo "..."
ls -lh "$BG_DIR" 2>/dev/null | tail -n +2
