import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { verifySession } from '@/lib/auth';
import { cookies } from 'next/headers';
import {
  safeUploadBasename,
  validateImageBuffer,
} from '@/lib/image-upload-guard';

export async function POST(request: Request) {
  try {
    // בדיקת אימות
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin_session')?.value;
    if (!sessionToken || !verifySession(sessionToken)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'logo' או 'background'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!type || (type !== 'logo' && type !== 'background')) {
      return NextResponse.json({ error: 'Invalid type. Must be "logo" or "background"' }, { status: 400 });
    }

    // קביעת התיקייה לפי סוג הקובץ
    const uploadDir = type === 'logo' 
      ? join(process.cwd(), 'public', 'images', 'logos')
      : join(process.cwd(), 'public', 'images', 'bg');

    // יצירת התיקייה אם לא קיימת
    await mkdir(uploadDir, { recursive: true });

    // שמירת הקובץ
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const validated = validateImageBuffer(buffer);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.reason }, { status: 400 });
    }

    const fileName = safeUploadBasename(file.name);
    const ext = fileName.toLowerCase().match(/\.[a-z0-9]+$/i);
    const allowedExt = /\.(jpe?g|png|gif|webp|svg)$/i;
    if (!ext || !allowedExt.test(fileName)) {
      return NextResponse.json(
        {
          error:
            'סיומת קובץ לא נתמכת. השתמשו ב-.jpg, .png, .gif, .webp או .svg',
        },
        { status: 400 }
      );
    }

    const filePath = join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    // החזרת הנתיב היחסי לשימוש באתר
    const relativePath = type === 'logo' 
      ? `/images/logos/${fileName}`
      : `/images/bg/${fileName}`;

    return NextResponse.json({ 
      success: true, 
      path: relativePath,
      fileName: fileName
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}

