import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function DELETE(request: NextRequest) {
  try {
    const { imagePath } = await request.json();

    if (!imagePath) {
      return NextResponse.json({ error: 'נדרש נתיב לתמונה' }, { status: 400 });
    }

    // וידוא שהנתיב הוא בתיקיית התמונות בלבד (אבטחה)
    const normalizedPath = path.normalize(imagePath);
    if (!normalizedPath.startsWith('/images/')) {
      return NextResponse.json({ error: 'נתיב לא חוקי' }, { status: 400 });
    }

    // בניית הנתיב המלא
    const fullPath = path.join(process.cwd(), 'public', normalizedPath);

    // בדיקה שהקובץ קיים
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ error: 'הקובץ לא נמצא' }, { status: 404 });
    }

    // מחיקת הקובץ
    fs.unlinkSync(fullPath);

    return NextResponse.json({ 
      success: true, 
      message: 'התמונה נמחקה בהצלחה',
      deletedPath: imagePath 
    });

  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json({ error: 'שגיאה במחיקת התמונה' }, { status: 500 });
  }
}

