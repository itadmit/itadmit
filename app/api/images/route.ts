import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  const publicDir = path.join(process.cwd(), 'public');
  const logosDir = path.join(publicDir, 'images', 'logos');
  const bgDir = path.join(publicDir, 'images', 'bg');

  try {
    const getFiles = async (dir: string, prefix: string) => {
      const files = await fs.readdir(dir);
      return files
        .filter(file => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file))
        .map(file => ({
          name: file,
          path: `${prefix}/${file}`
        }));
    };

    const logoFiles = await getFiles(logosDir, '/images/logos');
    const bgFiles = await getFiles(bgDir, '/images/bg');

    return NextResponse.json({ logos: logoFiles, backgrounds: bgFiles });
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
  }
}

