#!/bin/bash

# סקריפט לארגון תמונות - העברת תמונות רקע לתיקייה הנכונה

PUBLIC_DIR="public/images"
BG_DIR="public/images/bg"

# יצירת תיקיית רקעים
mkdir -p "$BG_DIR"

echo "מארגן תמונות..."
echo "=========================================="

moved=0
skipped=0

# עבור על כל התמונות בתיקייה
for img_file in "$PUBLIC_DIR"/*; do
    # דילוג על תיקיות
    if [ -d "$img_file" ]; then
        continue
    fi
    
    filename=$(basename "$img_file")
    
    # בדיקה אם זה תמונת רקע (לא לוגו)
    # תמונות רקע: מכילות -d (דסקטופ) או -m (מובייל) או bg/background/hero/mobile
    # לוגואים: מכילות -logo או logo
    
    is_background=false
    
    # בדיקה אם זה לוגו - אם כן, נשאיר ב-public/images
    if echo "$filename" | grep -qiE '(logo|-logo)'; then
        echo "שומר לוגו: $filename"
        skipped=$((skipped + 1))
        continue
    fi
    
    # בדיקה אם זה תמונת רקע
    if echo "$filename" | grep -qE '(-d\.|_d\.|desktop|-m\.|_m\.|mobile|מובייל)'; then
        is_background=true
    fi
    
    # בדיקה נוספת לתמונות רקע
    if echo "$filename" | grep -qiE '(bg|background|hero)'; then
        is_background=true
    fi
    
    # אם זה תמונת רקע והיא עדיין לא ב-bg/
    if [ "$is_background" = true ]; then
        dest_path="$BG_DIR/$filename"
        
        # אם הקובץ כבר קיים ביעד, דילוג
        if [ -f "$dest_path" ]; then
            echo "כבר קיים ב-bg/: $filename"
            # מחיקת המקור אם הוא שונה מהיעד
            if [ "$img_file" != "$dest_path" ]; then
                rm -f "$img_file"
                echo "  מחקתי את המקור"
            fi
            skipped=$((skipped + 1))
        else
            # העברת הקובץ
            mv "$img_file" "$dest_path"
            echo "✓ הועבר: $filename -> bg/"
            moved=$((moved + 1))
        fi
    else
        echo "שומר ב-images/: $filename"
        skipped=$((skipped + 1))
    fi
done

echo ""
echo "=========================================="
echo "סיימתי לארגן תמונות!"
echo "הועברו: $moved תמונות"
echo "דולגו/נשארו: $skipped תמונות"
echo ""
echo "מבנה התיקיות:"
echo "----------------"
echo "לוגואים ב-public/images:"
ls -1 "$PUBLIC_DIR"/*.{png,jpg,jpeg,gif,webp,svg} 2>/dev/null | wc -l | xargs echo "  קבצים:"
echo ""
echo "רקעים ב-public/images/bg:"
ls -1 "$BG_DIR"/*.{png,jpg,jpeg,gif,webp,svg} 2>/dev/null | wc -l | xargs echo "  קבצים:"

