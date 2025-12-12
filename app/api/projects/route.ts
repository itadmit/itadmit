import { NextResponse } from 'next/server';
import { getProjects, addProject, updateProject, deleteProject } from '@/lib/projects-db';
import { ProjectData } from '@/lib/projects';
import { verifySession } from '@/lib/auth';
import { cookies } from 'next/headers';

// GET - קבלת כל הפרויקטים
export async function GET() {
  try {
    const projects = getProjects();
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

// POST - יצירת פרויקט חדש
export async function POST(request: Request) {
  try {
    // בדיקת אימות
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin_session')?.value;
    if (!sessionToken || !verifySession(sessionToken)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const project: ProjectData = await request.json();
    
    // בדיקת תקינות
    if (!project.id || !project.title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    addProject(project);
    return NextResponse.json({ success: true, project });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}

// PUT - עדכון פרויקט
export async function PUT(request: Request) {
  try {
    // בדיקת אימות
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin_session')?.value;
    if (!sessionToken || !verifySession(sessionToken)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, ...updates } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }
    
    updateProject(id, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

// DELETE - מחיקת פרויקט
export async function DELETE(request: Request) {
  try {
    // בדיקת אימות
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin_session')?.value;
    if (!sessionToken || !verifySession(sessionToken)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }
    
    deleteProject(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}

