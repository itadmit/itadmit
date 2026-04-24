import { NextRequest, NextResponse } from 'next/server';
import {
  getAllQuestions,
  insertQuestion,
  updateQuestionById,
  deleteQuestionById,
  replaceAllQuestions,
  resetQuestionsToDefault,
} from '@/lib/questions-db';
import type { Question } from '@/lib/quote-wizard';

export async function GET() {
  try {
    const questions = await getAllQuestions();
    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error getting questions:', error);
    return NextResponse.json({ error: 'שגיאה בטעינת השאלות' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const questions = await getAllQuestions();

    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      question: body.question,
      type: body.type || 'single-choice',
      options: body.options || [],
      nextQuestion: body.nextQuestion,
      isFirst: body.isFirst || false,
      order: body.order || questions.length + 1,
    };

    await insertQuestion(newQuestion);

    return NextResponse.json({ success: true, question: newQuestion });
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json({ error: 'שגיאה ביצירת השאלה' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (Array.isArray(body)) {
      await replaceAllQuestions(body);
      return NextResponse.json({ success: true, questions: body });
    }

    const { id, ...patch } = body;
    if (!id) {
      return NextResponse.json({ error: 'נדרש ID' }, { status: 400 });
    }
    await updateQuestionById(id, patch);
    const questions = await getAllQuestions();
    const updated = questions.find((q) => q.id === id);
    if (!updated) {
      return NextResponse.json({ error: 'שאלה לא נמצאה' }, { status: 404 });
    }
    return NextResponse.json({ success: true, question: updated });
  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json({ error: 'שגיאה בעדכון השאלה' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'נדרש ID' }, { status: 400 });
    }

    const ok = await deleteQuestionById(id);
    if (!ok) {
      return NextResponse.json({ error: 'שאלה לא נמצאה' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json({ error: 'שגיאה במחיקת השאלה' }, { status: 500 });
  }
}

export async function PATCH() {
  try {
    const questions = await resetQuestionsToDefault();
    return NextResponse.json({ success: true, questions });
  } catch (error) {
    console.error('Error resetting questions:', error);
    return NextResponse.json({ error: 'שגיאה באיפוס השאלות' }, { status: 500 });
  }
}
