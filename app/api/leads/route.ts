import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Lead } from '@/lib/quote-wizard';

const LEADS_FILE = path.join(process.cwd(), 'data', 'leads.json');

// וידוא שקובץ הלידים קיים
function ensureLeadsFile() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(LEADS_FILE)) {
    fs.writeFileSync(LEADS_FILE, '[]', 'utf-8');
  }
}

// קריאת לידים
function getLeads(): Lead[] {
  ensureLeadsFile();
  const data = fs.readFileSync(LEADS_FILE, 'utf-8');
  return JSON.parse(data);
}

// שמירת לידים
function saveLeads(leads: Lead[]) {
  ensureLeadsFile();
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf-8');
}

// GET - קבלת כל הלידים
export async function GET() {
  try {
    const leads = getLeads();
    // מיון לפי תאריך יצירה (החדשים קודם)
    leads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return NextResponse.json(leads);
  } catch (error) {
    console.error('Error getting leads:', error);
    return NextResponse.json({ error: 'שגיאה בטעינת הלידים' }, { status: 500 });
  }
}

// POST - יצירת ליד חדש
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const leads = getLeads();

    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      name: body.name,
      phone: body.phone,
      email: body.email,
      company: body.company || '',
      answers: body.answers || {},
      status: 'new',
      createdAt: new Date().toISOString(),
      notes: '',
    };

    leads.push(newLead);
    saveLeads(leads);

    return NextResponse.json({ success: true, lead: newLead });
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json({ error: 'שגיאה ביצירת הליד' }, { status: 500 });
  }
}

// PUT - עדכון ליד
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const leads = getLeads();
    
    const index = leads.findIndex(l => l.id === body.id);
    if (index === -1) {
      return NextResponse.json({ error: 'ליד לא נמצא' }, { status: 404 });
    }

    leads[index] = { ...leads[index], ...body };
    saveLeads(leads);

    return NextResponse.json({ success: true, lead: leads[index] });
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json({ error: 'שגיאה בעדכון הליד' }, { status: 500 });
  }
}

// DELETE - מחיקת ליד
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'נדרש ID' }, { status: 400 });
    }

    const leads = getLeads();
    const filtered = leads.filter(l => l.id !== id);
    
    if (filtered.length === leads.length) {
      return NextResponse.json({ error: 'ליד לא נמצא' }, { status: 404 });
    }

    saveLeads(filtered);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json({ error: 'שגיאה במחיקת הליד' }, { status: 500 });
  }
}

