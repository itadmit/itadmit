#!/bin/bash

# הורדת תמונות רקע גדולות

BASE_URL="https://web.archive.org/web/20250815142743im_/https://www.itadmit.co.il"
BG_DIR="public/images/bg"

mkdir -p "$BG_DIR"

echo "מוריד תמונות רקע גדולות..."

# תמונות רקע גדולות (לא גרסאות קטנות)
declare -a bg_images=(
    "/wp-content/uploads/2025/04/67c5c3d3d4273-1.jpg"  # עדן פינס - נסה גרסה גדולה
    "/wp-content/uploads/2025/04/67c5c3d3d4273-1-1536x864.jpg"  # עדן פינס - גרסה גדולה
    "/wp-content/uploads/2025/04/67c5c3d3d4273-1-1024x576.jpg"  # עדן פינס - בינונית
)

for img_path in "${bg_images[@]}"; do
    filename=$(basename "$img_path")
    echo "מוריד: $filename"
    curl -L -f -s -o "$BG_DIR/$filename" "${BASE_URL}${img_path}" 2>/dev/null
    
    if [ $? -eq 0 ] && [ -f "$BG_DIR/$filename" ]; then
        file_size=$(stat -f%z "$BG_DIR/$filename" 2>/dev/null || stat -c%s "$BG_DIR/$filename" 2>/dev/null)
        if [ "$file_size" -gt 1000 ]; then
            echo "✓ הורד: $filename ($(numfmt --to=iec-i --suffix=B $file_size 2>/dev/null || echo "${file_size}B"))"
        else
            rm -f "$BG_DIR/$filename"
        fi
    fi
done

# העתקת תמונות גדולות כתמונות רקע
cd public/images
cp Screen-Shot-2021-01-21-at-14.42.54.png ../images/bg/aline-bg.jpeg 2>/dev/null
cp IMG_8467-1.png ../images/bg/talia-bg.jpg 2>/dev/null
cp Screen-Shot-2023-02-09-at-16.29.57.png ../images/bg/olier-bg.jpg 2>/dev/null
cp Screenshot-2024-08-16-at-12.42.47.png ../images/bg/orshpitz-bg.jpeg 2>/dev/null
cp Screen-Shot-2021-12-20-at-17.49.16.png ../images/bg/daniel-bg.jpeg 2>/dev/null
cp Screen-Shot-2023-02-09-at-17.14.35.png ../images/bg/eden-bg.jpg 2>/dev/null  # שימוש זמני
cp Screen-Shot-2021-01-14-at-12.09.25.png ../images/bg/barbercy-bg.jpg 2>/dev/null
cp Screen-Shot-2021-01-21-at-14.42.54.png ../images/bg/jorden-bg.jpg 2>/dev/null

echo ""
echo "רשימת תמונות רקע:"
ls -lh "$BG_DIR" 2>/dev/null

