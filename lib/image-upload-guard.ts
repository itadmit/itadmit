import path from 'path';

/** מקסימום גודל להעלאה (בתים) */
export const MAX_IMAGE_UPLOAD_BYTES = 20 * 1024 * 1024;

/**
 * בודק ש-buffer הוא תמונה נתמכת (לפי חתימה), לא HTML/שגיאה.
 */
export function validateImageBuffer(buffer: Buffer):
  | { ok: true }
  | { ok: false; reason: string } {
  if (buffer.length < 12) {
    return { ok: false, reason: 'הקובץ קטן מדי או ריק.' };
  }
  if (buffer.length > MAX_IMAGE_UPLOAD_BYTES) {
    return { ok: false, reason: 'הקובץ גדול מדי (מקסימום כ־20MB).' };
  }

  const b0 = buffer[0];
  const b1 = buffer[1];
  const b2 = buffer[2];
  const b3 = buffer[3];

  if (b0 === 0xff && b1 === 0xd8 && b2 === 0xff) {
    return { ok: true };
  }
  if (b0 === 0x89 && b1 === 0x50 && b2 === 0x4e && b3 === 0x47) {
    return { ok: true };
  }
  if (b0 === 0x47 && b1 === 0x49 && b2 === 0x46) {
    return { ok: true };
  }
  const head4 = buffer.subarray(0, 4).toString('ascii');
  const webpTag = buffer.subarray(8, 12).toString('ascii');
  if (head4 === 'RIFF' && webpTag === 'WEBP') {
    return { ok: true };
  }

  const head = buffer
    .subarray(0, Math.min(512, buffer.length))
    .toString('utf8')
    .trimStart()
    .toLowerCase();

  if (head.startsWith('<svg') || head.startsWith('<?xml')) {
    return { ok: true };
  }
  if (
    head.startsWith('<html') ||
    head.startsWith('<!doctype html') ||
    head.startsWith('<head')
  ) {
    return {
      ok: false,
      reason:
        'הקובץ שנשלח אינו תמונה (זה HTML). בחרו קובץ JPEG/PNG/WebP/GIF או SVG.',
    };
  }

  return {
    ok: false,
    reason: 'פורמט לא נתמך. השתמשו ב-JPEG, PNG, GIF, WebP או SVG.',
  };
}

/** שם קובץ בטוח לשמירה ב-public (ללא path traversal) */
export function safeUploadBasename(originalName: string): string {
  const base = path.basename(originalName.split('\\').join('/'));
  if (!base || base === '.' || base === '..' || base.includes('\0')) {
    return `upload-${Date.now()}.jpg`;
  }
  if (base.includes('..')) {
    return `upload-${Date.now()}.jpg`;
  }
  return base;
}
