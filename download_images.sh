#!/bin/bash

# סקריפט להורדת כל התמונות מהאתר המקורי

BASE_URL="https://web.archive.org/web/20250815142743im_/https://www.itadmit.co.il"
PUBLIC_DIR="public/images"
BG_DIR="public/images/bg"

# יצירת תיקיות
mkdir -p "$PUBLIC_DIR" "$BG_DIR"

echo "מוריד HTML של האתר..."
HTML=$(curl -s "https://web.archive.org/web/20250815142743/https://www.itadmit.co.il/")

# חילוץ כל כתובות התמונות
echo "מחפש תמונות..."
IMAGES=$(echo "$HTML" | grep -oE 'https://[^"]*wp-content/uploads/[^"]*\.(jpg|jpeg|png|gif|webp|svg)' | sort -u)

# רשימת תמונות ספציפיות להורדה (לוגואים ופרויקטים)
declare -a specific_images=(
    # לוגו ראשי
    "/wp-content/uploads/2021/01/logo.png"
    "/wp-content/uploads/2016/10/rgb-logo-to-door.png"
    
    # לוגואים פרויקטים
    "/wp-content/uploads/2025/04/67c5c3d3d4273-1.jpg"  # עדן פינס
    "/wp-content/uploads/2023/09/WhatsApp-Image-2023-09-05-at-11.43.45.jpeg"  # עינב בובליל
    "/wp-content/uploads/2025/04/Screenshot-2025-04-03-at-17.25.48-1.png"  # אלין כהן
    "/wp-content/uploads/2024/08/IMG_8467-1.png"  # טליה עובדיה
    "/wp-content/uploads/2023/02/Screen-Shot-2023-02-09-at-16.29.57.png"  # אולייר פריז
    "/wp-content/uploads/2024/08/Screenshot-2024-08-16-at-12.42.47.png"  # אור שפיץ
    "/wp-content/uploads/2021/12/Screen-Shot-2021-12-20-at-17.49.16.png"  # מיאל
    "/wp-content/uploads/2023/02/Screen-Shot-2023-02-09-at-17.14.35.png"  # אינסנס
    "/wp-content/uploads/2021/02/M_Like_Mali_Logo_2-e1599999927724-1024x240-1.png"  # M LIKE MALI
    "/wp-content/uploads/2021/01/ruze2.png"  # RUZE
    "/wp-content/uploads/2021/01/1200px-ישראל_בידור.png"  # ישראל בידור
    "/wp-content/uploads/2021/01/Screen-Shot-2021-01-21-at-14.42.54.png"  # J ONE
    "/wp-content/uploads/2022/06/jonelogo_360x.png"  # J ONE logo
    "/wp-content/uploads/2021/01/Screen-Shot-2021-01-21-at-15.15.48.png"  # kim kassas
    "/wp-content/uploads/2021/03/Screen-Shot-2021-03-12-at-11.08.16.jpeg"  # יוכי אפוליאון
    "/wp-content/uploads/2021/01/Screen-Shot-2021-01-21-at-15.28.11-e1611235738717.png"  # רומיס
    "/wp-content/uploads/2021/01/Screen-Shot-2021-01-14-at-12.09.25.png"  # ברברסי
    "/wp-content/uploads/2021/03/logo.png"  # לוגו נוסף
    "/wp-content/uploads/2022/06/CMYK_Pink.png"  # לוגו ורוד
    "/wp-content/uploads/2021/01/לוגו-2-רקע-שקוף.png"  # לוגו שקוף
)

echo "מוריד תמונות ספציפיות..."
for img_path in "${specific_images[@]}"; do
    filename=$(basename "$img_path")
    # ניקוי שם הקובץ
    safe_filename=$(echo "$filename" | sed 's/%20/_/g' | sed 's/%D7%9C%D7%95%D7%92%D7%95/logo/g')
    
    # החלפת תווים עבריים
    safe_filename=$(echo "$safe_filename" | iconv -f UTF-8 -t ASCII//TRANSLIT 2>/dev/null || echo "$safe_filename")
    
    echo "מוריד: $filename -> $safe_filename"
    curl -L -f -s -o "$PUBLIC_DIR/$safe_filename" "${BASE_URL}${img_path}" 2>/dev/null
    
    if [ $? -eq 0 ] && [ -f "$PUBLIC_DIR/$safe_filename" ]; then
        file_size=$(stat -f%z "$PUBLIC_DIR/$safe_filename" 2>/dev/null || stat -c%s "$PUBLIC_DIR/$safe_filename" 2>/dev/null)
        if [ "$file_size" -gt 0 ]; then
            echo "✓ הורד: $safe_filename ($(numfmt --to=iec-i --suffix=B $file_size 2>/dev/null || echo "${file_size}B"))"
        else
            echo "✗ קובץ ריק: $safe_filename"
            rm -f "$PUBLIC_DIR/$safe_filename"
        fi
    else
        echo "✗ שגיאה בהורדת: $filename"
    fi
done

# הורדת תמונות רקע גדולות (לא גרסאות קטנות)
echo ""
echo "מחפש תמונות רקע..."
BG_IMAGES=$(echo "$HTML" | grep -oE 'wp-content/uploads/[^"]*\.(jpg|jpeg|png)' | grep -vE '-\d+x\d+\.' | sort -u | head -20)

for img_path in $BG_IMAGES; do
    if [[ "$img_path" == wp-content/uploads/* ]]; then
        filename=$(basename "$img_path")
        # דילוג על תמונות קטנות
        if echo "$filename" | grep -qE '-\d+x\d+\.'; then
            continue
        fi
        
        echo "מוריד רקע: $filename"
        curl -L -f -s -o "$BG_DIR/$filename" "${BASE_URL}/${img_path}" 2>/dev/null
        
        if [ $? -eq 0 ] && [ -f "$BG_DIR/$filename" ]; then
            file_size=$(stat -f%z "$BG_DIR/$filename" 2>/dev/null || stat -c%s "$BG_DIR/$filename" 2>/dev/null)
            if [ "$file_size" -gt 10000 ]; then  # רק תמונות גדולות מ-10KB
                echo "✓ הורד רקע: $filename"
            else
                rm -f "$BG_DIR/$filename"
            fi
        fi
    fi
done

echo ""
echo "=========================================="
echo "סיימתי להוריד תמונות!"
echo "התמונות נמצאות ב: $PUBLIC_DIR"
echo "תמונות רקע נמצאות ב: $BG_DIR"
echo ""
echo "רשימת קבצים שהורדו:"
ls -lh "$PUBLIC_DIR" 2>/dev/null | tail -n +2
echo ""
ls -lh "$BG_DIR" 2>/dev/null | tail -n +2
