'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Save, GripVertical, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { Question, QuestionOption } from '@/lib/quote-wizard';
import AdminShell from '@/components/admin/AdminShell';

export default function QuestionsPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/auth/check')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setAuthenticated(true);
          loadQuestions();
        } else {
          router.push('/login');
        }
      })
      .catch(() => router.push('/login'));
  }, [router]);

  const loadQuestions = async () => {
    try {
      const res = await fetch('/api/questions');
      const data = await res.json();
      setQuestions(data);
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/questions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questions),
      });
      if (res.ok) {
        alert('השאלות נשמרו בהצלחה!');
      }
    } catch (error) {
      alert('שגיאה בשמירה');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('האם לאפס לשאלות ברירת המחדל? כל השינויים יימחקו.')) return;
    
    try {
      const res = await fetch('/api/questions', { method: 'PATCH' });
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions);
        alert('השאלות אופסו בהצלחה!');
      }
    } catch (error) {
      alert('שגיאה באיפוס');
    }
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const updateOption = (questionId: string, optionIndex: number, updates: Partial<QuestionOption>) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = { ...newOptions[optionIndex], ...updates };
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const addOption = (questionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOption: QuestionOption = {
          id: `opt-${Date.now()}`,
          label: 'אפשרות חדשה',
        };
        return { ...q, options: [...(q.options || []), newOption] };
      }
      return q;
    }));
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options) {
        const newOptions = q.options.filter((_, i) => i !== optionIndex);
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      question: 'שאלה חדשה',
      type: 'single-choice',
      options: [
        { id: 'opt-1', label: 'אפשרות 1' },
        { id: 'opt-2', label: 'אפשרות 2' },
      ],
      order: questions.length + 1,
    };
    setQuestions([...questions, newQuestion]);
    setExpandedQuestion(newQuestion.id);
  };

  const removeQuestion = (id: string) => {
    if (!confirm('האם למחוק את השאלה?')) return;
    setQuestions(questions.filter(q => q.id !== id));
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'single-choice': 'בחירה יחידה',
      'multi-choice': 'בחירה מרובה',
      'text': 'טקסט חופשי',
    };
    return labels[type] || type;
  };

  if (!authenticated || loading) {
    return (
      <AdminShell title="שאלות הצ׳אט">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-white/60">
          טוען...
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title="שאלות הצ׳אט"
      subtitle={`${questions.length} שאלות • נשמרות בבת אחת`}
      wide={false}
      actions={
        <>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-white/85 transition hover:border-white/20 hover:bg-white/10"
          >
            <RotateCcw className="h-4 w-4" />
            איפוס לברירת מחדל
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_18px_-4px_rgba(16,185,129,0.55)] transition hover:bg-emerald-400 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'שומר...' : 'שמור שינויים'}
          </button>
        </>
      }
    >
        <div className="space-y-4">
          {questions.map((question, index) => (
            <div
              key={question.id}
              className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035]"
            >
              <div
                className="flex cursor-pointer items-center gap-3 p-4 transition hover:bg-white/[0.05]"
                onClick={() => setExpandedQuestion(expandedQuestion === question.id ? null : question.id)}
              >
                <GripVertical className="h-5 w-5 text-white/25" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-full bg-white/10 px-2 text-[11.5px] font-semibold text-white/80">
                      {index + 1}
                    </span>
                    <span className="truncate font-medium text-white">{question.question}</span>
                    {question.isFirst && (
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-300 ring-1 ring-emerald-400/30">
                        ראשונה
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-[12px] text-white/50">
                    {getTypeLabel(question.type)} • {question.options?.length || 0} אפשרויות
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeQuestion(question.id);
                  }}
                  className="rounded-lg p-2 text-white/60 transition hover:bg-red-500/15 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                {expandedQuestion === question.id ? (
                  <ChevronUp className="h-5 w-5 text-white/50" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-white/50" />
                )}
              </div>

              {expandedQuestion === question.id && (
                <div className="space-y-4 border-t border-white/10 bg-black/20 p-4">
                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-white/45">
                      טקסט השאלה
                    </label>
                    <input
                      type="text"
                      value={question.question}
                      onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-[14px] text-white placeholder:text-white/40 focus:border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-white/45">
                        סוג שאלה
                      </label>
                      <select
                        value={question.type}
                        onChange={(e) => updateQuestion(question.id, { type: e.target.value as Question['type'] })}
                        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-[14px] text-white focus:border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
                      >
                        <option value="single-choice">בחירה יחידה</option>
                        <option value="multi-choice">בחירה מרובה</option>
                        <option value="text">טקסט חופשי</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-white/45">
                        שאלה הבאה (ברירת מחדל)
                      </label>
                      <select
                        value={question.nextQuestion || ''}
                        onChange={(e) => updateQuestion(question.id, { nextQuestion: e.target.value || undefined })}
                        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-[14px] text-white focus:border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
                      >
                        <option value="">בחר שאלה...</option>
                        <option value="END">סיום (טופס פרטים)</option>
                        {questions.filter(q => q.id !== question.id).map(q => (
                          <option key={q.id} value={q.id}>{q.question}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white/[0.04] px-3 py-2">
                    <input
                      type="checkbox"
                      checked={question.isFirst || false}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setQuestions(questions.map(q => ({
                            ...q,
                            isFirst: q.id === question.id,
                          })));
                        } else {
                          updateQuestion(question.id, { isFirst: false });
                        }
                      }}
                      className="h-4 w-4 rounded accent-emerald-500"
                    />
                    <span className="text-[13.5px] text-white/85">זו השאלה הראשונה של הצ׳אט</span>
                  </label>

                  {question.type !== 'text' && (
                    <div>
                      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-white/45">
                        אפשרויות תשובה
                      </label>
                      <div className="space-y-2">
                        {question.options?.map((option, optIndex) => (
                          <div key={option.id} className="flex flex-wrap gap-2 sm:flex-nowrap">
                            <input
                              type="text"
                              value={option.label}
                              onChange={(e) => updateOption(question.id, optIndex, { label: e.target.value })}
                              placeholder="טקסט האפשרות"
                              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[13.5px] text-white placeholder:text-white/40 focus:border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
                            />
                            <select
                              value={option.nextQuestion || ''}
                              onChange={(e) => updateOption(question.id, optIndex, { nextQuestion: e.target.value || undefined })}
                              className="w-full sm:w-44 rounded-xl border border-white/10 bg-white/[0.04] px-2.5 py-2 text-[13px] text-white focus:border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
                            >
                              <option value="">שאלה הבאה...</option>
                              <option value="END">סיום</option>
                              {questions.filter(q => q.id !== question.id).map(q => (
                                <option key={q.id} value={q.id}>{q.question.substring(0, 20)}...</option>
                              ))}
                            </select>
                            <button
                              onClick={() => removeOption(question.id, optIndex)}
                              className="rounded-xl p-2 text-white/60 transition hover:bg-red-500/15 hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => addOption(question.id)}
                          className="w-full rounded-xl border border-dashed border-white/15 py-2 text-[13px] text-white/55 transition hover:border-white/30 hover:bg-white/[0.04] hover:text-white/85"
                        >
                          + הוסף אפשרות
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          <button
            onClick={addQuestion}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/15 py-5 text-white/55 transition hover:border-emerald-400/40 hover:bg-emerald-500/5 hover:text-emerald-300"
          >
            <Plus className="h-5 w-5" />
            הוסף שאלה חדשה
          </button>
        </div>
    </AdminShell>
  );
}

