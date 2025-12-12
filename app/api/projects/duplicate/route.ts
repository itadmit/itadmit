import { NextResponse } from 'next/server';
import { duplicateProject } from '@/lib/projects';
import { verifySession } from '@/lib/auth';
import { cookies } from 'next/headers';

// POST - שכפול פרויקט
export async function POST(request: Request) {
  try {
    // בדיקת אימות
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin_session')?.value;
    if (!sessionToken || !verifySession(sessionToken)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }
    
    const duplicated = duplicateProject(id);
    
    if (!duplicated) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, project: duplicated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to duplicate project' }, { status: 500 });
  }
}

