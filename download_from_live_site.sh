#!/bin/bash

# סקריפט להורדת תמונות רקע מהאתר החי itadmit.co.il

BG_DIR="public/images/bg"
LOGOS_DIR="public/images/logos"

mkdir -p "$BG_DIR" "$LOGOS_DIR"

echo "מוריד תמונות רקע מהאתר החי..."
echo "=========================================="

downloaded=0
failed=0

download_image() {
    local url="$1"
    local dest="$2"
    
    echo "מוריד: $(basename "$dest")"
    
    curl -L -f -s --max-time 60 \
        -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" \
        -o "$dest" "$url" 2>/dev/null
    
    if [ $? -eq 0 ] && [ -f "$dest" ] && [ -s "$dest" ]; then
        file_size=$(stat -f%z "$dest" 2>/dev/null || stat -c%s "$dest" 2>/dev/null)
        if [ "$file_size" -gt 1000 ]; then
            echo "✓ הורד: $(basename "$dest") ($file_size bytes)"
            downloaded=$((downloaded + 1))
            return 0
        else
            echo "✗ קובץ קטן מדי: $(basename "$dest")"
            rm -f "$dest"
            failed=$((failed + 1))
            return 1
        fi
    else
        echo "✗ שגיאה בהורדת: $(basename "$dest")"
        failed=$((failed + 1))
        return 1
    fi
}

# תמונות רקע
download_image "https://itadmit.co.il/wp-content/uploads/2025/04/67c5c3d3d4273-1-scaled.jpg" "$BG_DIR/hero1.jpg"
download_image "https://itadmit.co.il/wp-content/uploads/2025/04/67c5c887dd3ec-1-scaled.jpg" "$BG_DIR/einav-d.jpg"
download_image "https://itadmit.co.il/wp-content/uploads/2024/08/45.jpg" "$BG_DIR/einav-bg.jpg"
download_image "https://itadmit.co.il/wp-content/uploads/2023/09/WhatsApp-Image-2023-09-05-at-11.45.53.jpeg" "$BG_DIR/aline-d.jpeg"
download_image "https://itadmit.co.il/wp-content/uploads/2021/01/Screen-Shot-2021-01-21-at-14.42.54.png" "$BG_DIR/aline-bg.jpeg"
download_image "https://itadmit.co.il/wp-content/uploads/2025/04/IMG_9352-1-scaled.jpg" "$BG_DIR/talia-bg.jpg"
download_image "https://itadmit.co.il/wp-content/uploads/2023/02/ezgif-3-ce5ae0b748-scaled.jpeg" "$BG_DIR/talia-m.jpg"
download_image "https://itadmit.co.il/wp-content/uploads/2024/08/WhatsApp-Image-2024-08-16-at-12.34.09.jpeg" "$BG_DIR/olier-bg.jpg"
download_image "https://itadmit.co.il/wp-content/uploads/2024/08/Screenshot-2024-08-16-at-12.42.47.png" "$BG_DIR/orshpitz-bg.jpeg"
download_image "https://itadmit.co.il/wp-content/uploads/2024/08/9.jpg" "$BG_DIR/orshpitz-m.jpg"
download_image "https://itadmit.co.il/wp-content/uploads/2021/12/Screen-Shot-2021-12-20-at-17.49.16.png" "$BG_DIR/daniel-bg.jpeg"
download_image "https://itadmit.co.il/wp-content/uploads/2023/02/WhatsApp-Image-2023-02-09-at-18.01.45.jpeg" "$BG_DIR/incense-bg.jpg"
download_image "https://itadmit.co.il/wp-content/uploads/2024/08/6_3721e797-f578-4e41-b7dd-e6ffc4297c6c.jpg" "$BG_DIR/port-d.jpg"
download_image "https://itadmit.co.il/wp-content/uploads/2021/01/Screen-Shot-2021-01-14-at-12.09.25.png" "$BG_DIR/barbercy-bg.jpg"
download_image "https://itadmit.co.il/wp-content/uploads/2023/02/ezgif-1-087e620fe8.jpeg" "$BG_DIR/juv-bg.jpg"
download_image "https://itadmit.co.il/wp-content/uploads/2023/02/cfa920b4-7a86-4bf2-a38c-843f1ff03436.jpeg" "$BG_DIR/jorden-bg.jpg"
download_image "https://itadmit.co.il/wp-content/uploads/2023/02/Screen-Shot-2023-02-09-at-17.14.35.png" "$BG_DIR/eden-bg.jpg"
download_image "https://itadmit.co.il/wp-content/uploads/2022/06/WhatsApp-Image-2022-03-31-at-12.45.49.jpeg" "$BG_DIR/shay-d.jpg"
download_image "https://itadmit.co.il/wp-content/uploads/2021/01/kim3.jpg" "$BG_DIR/kim-d.jpg"
download_image "https://itadmit.co.il/wp-content/uploads/2021/01/kim4.jpg" "$BG_DIR/kim-m.jpg"
download_image "https://itadmit.co.il/wp-content/uploads/2021/03/DSC_6611-scaled-510x765-1.jpg" "$BG_DIR/romi-m.jpg"
download_image "https://itadmit.co.il/wp-content/uploads/2021/01/105958015_2913236648937515_6134103635640990518_n.jpg" "$BG_DIR/barbarsi-d.jpeg"
download_image "https://itadmit.co.il/wp-content/uploads/2021/01/bklyn-section-1.jpg" "$BG_DIR/contact-d.jpg"
download_image "https://itadmit.co.il/wp-content/uploads/2021/01/mobile.jpg" "$BG_DIR/mobile.jpg"

echo ""
echo "=========================================="
echo "מוריד לוגואים..."
echo "=========================================="

download_image "https://itadmit.co.il/wp-content/uploads/2025/04/67c5c3d3b7d56.webp" "$LOGOS_DIR/fifi.webp"
download_image "https://itadmit.co.il/wp-content/uploads/2025/04/67c5c887c3c93.webp" "$LOGOS_DIR/einav.webp"
download_image "https://itadmit.co.il/wp-content/uploads/2023/09/download.webp" "$LOGOS_DIR/aline.webp"
download_image "https://itadmit.co.il/wp-content/uploads/2023/02/%D7%A7%D7%A8%D7%99%D7%A0%D7%99%D7%99%D7%A8-%D7%9C%D7%95%D7%92%D7%95-%D7%99%D7%A8%D7%95%D7%A7-1.webp" "$LOGOS_DIR/talia.webp"
download_image "https://itadmit.co.il/wp-content/uploads/2023/02/%D7%9C%D7%95%D7%92%D7%95-%D7%9C%D7%90%D7%95%D7%9C%D7%99%D7%99%D7%A8.webp" "$LOGOS_DIR/olier.webp"
download_image "https://itadmit.co.il/wp-content/uploads/2024/08/%D7%9C%D7%95%D7%92%D7%95-%D7%9C%D7%91%D7%9F.webp" "$LOGOS_DIR/or.webp"
download_image "https://itadmit.co.il/wp-content/uploads/2021/12/%D7%90%D7%AA%D7%A8-%D7%9E%D7%99%D7%90%D7%9C.webp" "$LOGOS_DIR/miel.webp"
download_image "https://itadmit.co.il/wp-content/uploads/2023/02/%D7%9C%D7%95%D7%92%D7%95-%D7%90%D7%99%D7%A0%D7%A1%D7%A0%D7%A1.webp" "$LOGOS_DIR/incense.webp"
download_image "https://itadmit.co.il/wp-content/uploads/2021/09/port-logo.webp" "$LOGOS_DIR/port.webp"
download_image "https://itadmit.co.il/wp-content/uploads/2021/01/asset-37@4x-1-1.webp" "$LOGOS_DIR/labeaute.webp"
download_image "https://itadmit.co.il/wp-content/uploads/2022/06/JUV-%D7%9C%D7%95%D7%92%D7%95.webp" "$LOGOS_DIR/juv.webp"
download_image "https://itadmit.co.il/wp-content/uploads/2022/06/M-LIKE-%D7%9C%D7%95%D7%92%D7%95.webp" "$LOGOS_DIR/mlikemali.webp"
download_image "https://itadmit.co.il/wp-content/uploads/2022/06/ruze2.webp" "$LOGOS_DIR/ruze.webp"
download_image "https://itadmit.co.il/wp-content/uploads/2021/06/%D7%99%D7%A9%D7%A8%D7%90%D7%9C-%D7%91%D7%99%D7%93%D7%95%D7%A8-%D7%9C%D7%95%D7%92%D7%95.webp" "$LOGOS_DIR/israelbidur.webp"
download_image "https://itadmit.co.il/wp-content/uploads/2021/03/jonelogo_360x.webp" "$LOGOS_DIR/jonebrand.webp"
download_image "https://itadmit.co.il/wp-content/uploads/2021/03/kim-%D7%9C%D7%95%D7%92%D7%95.webp" "$LOGOS_DIR/kim.webp"
download_image "https://itadmit.co.il/wp-content/uploads/2021/03/yochi-%D7%9C%D7%95%D7%92%D7%95.webp" "$LOGOS_DIR/yochi.webp"
download_image "https://itadmit.co.il/wp-content/uploads/2021/03/romis-%D7%9C%D7%95%D7%92%D7%95.webp" "$LOGOS_DIR/romiss.webp"
download_image "https://itadmit.co.il/wp-content/uploads/2021/01/%D7%91%D7%A8%D7%91%D7%A8%D7%A1%D7%99.webp" "$LOGOS_DIR/barbarsi.webp"
download_image "https://itadmit.co.il/wp-content/uploads/2023/02/%D7%99%D7%A8%D7%93%D7%9F-%D7%97%D7%9B%D7%9D-%D7%9C%D7%95%D7%92%D7%95.webp" "$LOGOS_DIR/jorden.webp"

echo ""
echo "=========================================="
echo "סיכום:"
echo "הורדו בהצלחה: $downloaded קבצים"
echo "נכשלו: $failed קבצים"
echo ""
echo "תמונות רקע:"
ls -la "$BG_DIR"
echo ""
echo "לוגואים:"
ls -la "$LOGOS_DIR"
