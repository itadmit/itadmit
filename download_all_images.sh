#!/bin/bash

# סקריפט להורדת כל התמונות מה-CSS והאתר המקורי

PUBLIC_DIR="public/images"
BG_DIR="public/images/bg"

# יצירת תיקיות
mkdir -p "$PUBLIC_DIR" "$BG_DIR"

echo "מוריד תמונות מה-CSS..."

# רשימת תמונות עם URLים מלאים מה-CSS
declare -a image_urls=(
    "https://web.archive.org/web/20250716111120im_/https://www.itadmit.co.il/wp-content/uploads/2022/06/hero1.jpg"
    "https://web.archive.org/web/20250716111120im_/https://www.itadmit.co.il/wp-content/uploads/2025/04/67c5c887dd3ec-1.jpg"
    "https://web.archive.org/web/20250716111120im_/https://www.itadmit.co.il/wp-content/uploads/2023/09/WhatsApp-Image-2023-09-05-at-11.45.53.jpeg"
    "https://web.archive.org/web/20250716111120im_/https://www.itadmit.co.il/wp-content/uploads/2025/04/IMG_9352-1-scaled.jpg"
    "https://web.archive.org/web/20250716111120im_/https://www.itadmit.co.il/wp-content/uploads/2024/08/WhatsApp-Image-2024-08-16-at-12.34.09.jpeg"
    "https://web.archive.org/web/20250716111120im_/https://www.itadmit.co.il/wp-content/uploads/2021/01/105958015_2913236648937515_6134103635640990518_n.jpg"
    "https://web.archive.org/web/20250716111120im_/https://www.itadmit.co.il/wp-content/uploads/2023/02/WhatsApp-Image-2023-02-09-at-18.01.45.jpeg"
    "https://web.archive.org/web/20250716111120im_/https://www.itadmit.co.il/wp-content/uploads/2024/08/6_3721e797-f578-4e41-b7dd-e6ffc4297c6c.jpg"
    "https://web.archive.org/web/20250716111120im_/https://www.itadmit.co.il/wp-content/uploads/2023/02/ezgif-1-087e620fe8.jpeg"
    "https://web.archive.org/web/20250716111120im_/https://www.itadmit.co.il/wp-content/uploads/2023/02/ezgif-3-ce5ae0b748-scaled.jpeg"
    "https://web.archive.org/web/20250716111120im_/https://www.itadmit.co.il/wp-content/uploads/2023/02/cfa920b4-7a86-4bf2-a38c-843f1ff03436.jpeg"
    "https://web.archive.org/web/20250716111120im_/https://www.itadmit.co.il/wp-content/uploads/2022/06/WhatsApp-Image-2022-03-31-at-12.45.49.jpeg"
    "https://web.archive.org/web/20250716111120im_/https://www.itadmit.co.il/wp-content/uploads/2022/06/WhatsApp-Image-2022-03-31-at-13.13.54-2.jpeg"
    "https://web.archive.org/web/20250716111120im_/https://www.itadmit.co.il/wp-content/uploads/2021/01/WeChat-Image_20210113110437-1280x1068-1.jpg"
    "https://web.archive.org/web/20250716111120im_/https://www.itadmit.co.il/wp-content/uploads/2021/01/unnamed.jpg"
    "https://web.archive.org/web/20250716111120im_/https://www.itadmit.co.il/wp-content/uploads/2021/01/82049624_high-3-1067x800-1.jpg"
    "https://web.archive.org/web/20250716111120im_/https://www.itadmit.co.il/wp-content/uploads/2021/03/82048963_high-4-600x800-1_jpg_92.jpg"
    "https://web.archive.org/web/20250716111120im_/https://www.itadmit.co.il/wp-content/uploads/2021/03/DSC_6611-scaled-510x765-1.jpg"
    "https://web.archive.org/web/20250716111120im_/https://www.itadmit.co.il/wp-content/uploads/2021/03/IMG_2862_jpg_92.jpg"
    "https://web.archive.org/web/20250716111120im_/https://www.itadmit.co.il/wp-content/uploads/2021/01/mobile.jpg"
    "https://web.archive.org/web/20250716111120im_/https://www.itadmit.co.il/wp-content/uploads/2021/01/kim3.jpg"
    "https://web.archive.org/web/20250716111120im_/https://www.itadmit.co.il/wp-content/uploads/2021/01/kim4.jpg"
    "https://web.archive.org/web/20250716111120im_/https://www.itadmit.co.il/wp-content/uploads/2022/06/02.jpg"
    "https://web.archive.org/web/20250716111120im_/https://www.itadmit.co.il/wp-content/uploads/2024/08/45.jpg"
    "https://web.archive.org/web/20250716111120im_/https://www.itadmit.co.il/wp-content/uploads/2023/02/מובייל-דניאל.jpg"
    "https://web.archive.org/web/20250716111120im_/https://www.itadmit.co.il/wp-content/uploads/2024/08/9.jpg"
    "https://web.archive.org/web/20250716111120im_/https://www.itadmit.co.il/wp-content/uploads/2021/01/WhatsApp-Image-2021-01-14-at-12.21.11.jpeg"
    "https://web.archive.org/web/20250716111120im_/https://www.itadmit.co.il/wp-content/uploads/2021/01/bklyn-section-1.jpg"
    "https://web.archive.org/web/20250716111120im_/https://www.itadmit.co.il/wp-content/uploads/2021/01/Untitled-1-1.jpg"
)

TOTAL=${#image_urls[@]}
echo "נמצאו $TOTAL תמונות להורדה"
echo "=========================================="

downloaded=0
failed=0

# הורדת כל תמונה
for img_url in "${image_urls[@]}"; do
    filename=$(basename "$img_url")
    
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
    
    # הורדה מ-Wayback Machine
    curl -L -f -s --max-time 30 -o "$dest_path" "$img_url" 2>/dev/null
    
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
done

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
