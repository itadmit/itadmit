import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { del } from '@vercel/blob';

export const runtime = 'nodejs';

export async function DELETE(request: NextRequest) {
  try {
    const { imagePath } = await request.json();

    if (!imagePath || typeof imagePath !== 'string') {
      return NextResponse.json({ error: 'נדרש נתיב לתמונה' }, { status: 400 });
    }

    // Blob URL — מחיקה דרך Vercel Blob API
    if (/^https?:\/\//i.test(imagePath)) {
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        return NextResponse.json(
          { error: 'לא מוגדר טוקן של Vercel Blob' },
          { status: 500 }
        );
      }
      await del(imagePath);
      return NextResponse.json({
        success: true,
        message: 'התמונה נמחקה בהצלחה',
        deletedPath: imagePath,
      });
    }

    // מחיקה מהפילסיסטם המקומי
    const normalizedPath = path.normalize(imagePath);
    if (!normalizedPath.startsWith('/images/')) {
      return NextResponse.json({ error: 'נתיב לא חוקי' }, { status: 400 });
    }

    const fullPath = path.join(process.cwd(), 'public', normalizedPath);
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ error: 'הקובץ לא נמצא' }, { status: 404 });
    }

    fs.unlinkSync(fullPath);
    return NextResponse.json({
      success: true,
      message: 'התמונה נמחקה בהצלחה',
      deletedPath: imagePath,
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    const msg =
      error instanceof Error ? error.message : 'שגיאה במחיקת התמונה';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
