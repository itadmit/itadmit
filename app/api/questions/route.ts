import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Question, defaultQuestions } from '@/lib/quote-wizard';

const QUESTIONS_FILE = path.join(process.cwd(), 'data', 'questions.json');

// וידוא שקובץ השאלות קיים
function ensureQuestionsFile() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(QUESTIONS_FILE)) {
    // יצירת קובץ עם שאלות ברירת מחדל
    fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(defaultQuestions, null, 2), 'utf-8');
  }
}

// קריאת שאלות
function getQuestions(): Question[] {
  ensureQuestionsFile();
  const data = fs.readFileSync(QUESTIONS_FILE, 'utf-8');
  return JSON.parse(data);
}

// שמירת שאלות
function saveQuestions(questions: Question[]) {
  ensureQuestionsFile();
  fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(questions, null, 2), 'utf-8');
}

// GET - קבלת כל השאלות
export async function GET() {
  try {
    const questions = getQuestions();
    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error getting questions:', error);
    return NextResponse.json({ error: 'שגיאה בטעינת השאלות' }, { status: 500 });
  }
}

// POST - יצירת שאלה חדשה
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const questions = getQuestions();

    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      question: body.question,
      type: body.type || 'single-choice',
      options: body.options || [],
      nextQuestion: body.nextQuestion,
      isFirst: body.isFirst || false,
      order: body.order || questions.length + 1,
    };

    questions.push(newQuestion);
    saveQuestions(questions);

    return NextResponse.json({ success: true, question: newQuestion });
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json({ error: 'שגיאה ביצירת השאלה' }, { status: 500 });
  }
}

// PUT - עדכון שאלה או כל השאלות
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // אם זה מערך - עדכון כל השאלות
    if (Array.isArray(body)) {
      saveQuestions(body);
      return NextResponse.json({ success: true, questions: body });
    }
    
    // אחרת - עדכון שאלה בודדת
    const questions = getQuestions();
    const index = questions.findIndex(q => q.id === body.id);
    
    if (index === -1) {
      return NextResponse.json({ error: 'שאלה לא נמצאה' }, { status: 404 });
    }

    questions[index] = { ...questions[index], ...body };
    saveQuestions(questions);

    return NextResponse.json({ success: true, question: questions[index] });
  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json({ error: 'שגיאה בעדכון השאלה' }, { status: 500 });
  }
}

// DELETE - מחיקת שאלה
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'נדרש ID' }, { status: 400 });
    }

    const questions = getQuestions();
    const filtered = questions.filter(q => q.id !== id);
    
    if (filtered.length === questions.length) {
      return NextResponse.json({ error: 'שאלה לא נמצאה' }, { status: 404 });
    }

    saveQuestions(filtered);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json({ error: 'שגיאה במחיקת השאלה' }, { status: 500 });
  }
}

// PATCH - איפוס לברירת מחדל
export async function PATCH() {
  try {
    saveQuestions(defaultQuestions);
    return NextResponse.json({ success: true, questions: defaultQuestions });
  } catch (error) {
    console.error('Error resetting questions:', error);
    return NextResponse.json({ error: 'שגיאה באיפוס השאלות' }, { status: 500 });
  }
}

