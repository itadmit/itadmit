import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { list } from '@vercel/blob';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface ImageEntry {
  name: string;
  path: string;
  uploadedAt: number;
}

async function listLocal(
  dir: string,
  prefix: string
): Promise<ImageEntry[]> {
  try {
    const files = await fs.readdir(dir);
    const stats = await Promise.all(
      files
        .filter((file) => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file))
        .map(async (file) => {
          try {
            const s = await fs.stat(path.join(dir, file));
            return {
              name: file,
              path: `${prefix}/${file}`,
              uploadedAt: s.mtimeMs,
            };
          } catch {
            return null;
          }
        })
    );
    return stats.filter((x): x is ImageEntry => x !== null);
  } catch {
    return [];
  }
}

async function listBlob(folder: string): Promise<ImageEntry[]> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return [];
  try {
    const { blobs } = await list({ prefix: `images/${folder}/` });
    return blobs
      .filter((b) => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(b.pathname))
      .map((b) => ({
        name: b.pathname.split('/').pop() || b.pathname,
        path: b.url,
        uploadedAt: b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0,
      }));
  } catch (err) {
    console.error('Blob list failed:', err);
    return [];
  }
}

function mergeAndSort(entries: ImageEntry[]): ImageEntry[] {
  const seen = new Map<string, ImageEntry>();
  for (const e of entries) {
    const prev = seen.get(e.name);
    if (!prev || e.uploadedAt > prev.uploadedAt) seen.set(e.name, e);
  }
  return Array.from(seen.values()).sort(
    (a, b) => b.uploadedAt - a.uploadedAt
  );
}

export async function GET() {
  const publicDir = path.join(process.cwd(), 'public');
  const logosDir = path.join(publicDir, 'images', 'logos');
  const bgDir = path.join(publicDir, 'images', 'bg');

  try {
    const [logosLocal, bgLocal, logosBlob, bgBlob] = await Promise.all([
      listLocal(logosDir, '/images/logos'),
      listLocal(bgDir, '/images/bg'),
      listBlob('logos'),
      listBlob('bg'),
    ]);

    return NextResponse.json({
      logos: mergeAndSort([...logosLocal, ...logosBlob]),
      backgrounds: mergeAndSort([...bgLocal, ...bgBlob]),
    });
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}
