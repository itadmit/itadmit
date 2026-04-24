import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { put } from '@vercel/blob';
import { verifySession } from '@/lib/auth';
import { cookies } from 'next/headers';
import {
  safeUploadBasename,
  validateImageBuffer,
} from '@/lib/image-upload-guard';

export async function POST(request: Request) {
  try {
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
      return NextResponse.json(
        { error: 'Invalid type. Must be "logo" or "background"' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const validated = validateImageBuffer(buffer);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.reason }, { status: 400 });
    }

    const fileName = safeUploadBasename(file.name);
    const allowedExt = /\.(jpe?g|png|gif|webp|svg)$/i;
    if (!allowedExt.test(fileName)) {
      return NextResponse.json(
        {
          error:
            'סיומת קובץ לא נתמכת. השתמשו ב-.jpg, .png, .gif, .webp או .svg',
        },
        { status: 400 }
      );
    }

    const folder = type === 'logo' ? 'logos' : 'bg';
    const subPath = `images/${folder}/${fileName}`;

    // Vercel Blob — אם מוגדר טוקן משתמשים בו (בפרודקשן)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(subPath, buffer, {
        access: 'public',
        contentType: file.type || undefined,
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      return NextResponse.json({
        success: true,
        path: blob.url,
        fileName,
      });
    }

    // Fallback: פיתוח מקומי — כתיבה ל-public/
    const uploadDir = join(process.cwd(), 'public', 'images', folder);
    await mkdir(uploadDir, { recursive: true });
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    const relativePath = `/images/${folder}/${fileName}`;
    return NextResponse.json({
      success: true,
      path: relativePath,
      fileName,
    });
  } catch (error) {
    console.error('Upload error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to upload file';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
