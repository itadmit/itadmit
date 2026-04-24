import { NextRequest, NextResponse } from 'next/server';
import {
  getAllLeads,
  insertLead,
  updateLeadById,
  deleteLeadById,
} from '@/lib/leads-db';
import { getAllQuestions } from '@/lib/questions-db';
import { sendNewLeadEmail } from '@/lib/mailer';
import type { Lead } from '@/lib/quote-wizard';

export async function GET() {
  try {
    const leads = await getAllLeads();
    leads.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return NextResponse.json(leads);
  } catch (error) {
    console.error('Error getting leads:', error);
    return NextResponse.json({ error: 'שגיאה בטעינת הלידים' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

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

    await insertLead(newLead);

    // התראת מייל — לא חוסמת את התגובה ללקוח
    void (async () => {
      try {
        const questions = await getAllQuestions();
        await sendNewLeadEmail({ lead: newLead, questions });
      } catch (err) {
        console.error('Lead email notification failed:', err);
      }
    })();

    return NextResponse.json({ success: true, lead: newLead });
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json({ error: 'שגיאה ביצירת הליד' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...patch } = body;
    if (!id) {
      return NextResponse.json({ error: 'נדרש ID' }, { status: 400 });
    }
    await updateLeadById(id, patch);
    const leads = await getAllLeads();
    const updated = leads.find((l) => l.id === id);
    if (!updated) {
      return NextResponse.json({ error: 'ליד לא נמצא' }, { status: 404 });
    }
    return NextResponse.json({ success: true, lead: updated });
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json({ error: 'שגיאה בעדכון הליד' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'נדרש ID' }, { status: 400 });
    }

    const ok = await deleteLeadById(id);
    if (!ok) {
      return NextResponse.json({ error: 'ליד לא נמצא' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json({ error: 'שגיאה במחיקת הליד' }, { status: 500 });
  }
}
