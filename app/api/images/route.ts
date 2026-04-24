import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { list } from '@vercel/blob';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface ImageEntry {
  name: string;
  path: string;
}

async function listLocal(
  dir: string,
  prefix: string
): Promise<ImageEntry[]> {
  try {
    const files = await fs.readdir(dir);
    return files
      .filter((file) => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file))
      .map((file) => ({ name: file, path: `${prefix}/${file}` }));
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
      }));
  } catch (err) {
    console.error('Blob list failed:', err);
    return [];
  }
}

function dedupe(entries: ImageEntry[]): ImageEntry[] {
  const seen = new Map<string, ImageEntry>();
  for (const e of entries) {
    if (!seen.has(e.name)) seen.set(e.name, e);
  }
  return Array.from(seen.values());
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
      logos: dedupe([...logosLocal, ...logosBlob]),
      backgrounds: dedupe([...bgLocal, ...bgBlob]),
    });
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}
