'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Plus, Trash2, Save, GripVertical, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { Question, QuestionOption } from '@/lib/quote-wizard';

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
    return <div className="h-screen flex items-center justify-center text-white bg-gray-900">טוען...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        {/* כותרת */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin-dashboard')}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
            <h1 className="text-3xl font-bold">ניהול שאלות</h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded flex items-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              איפוס
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 px-4 py-2 rounded flex items-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? 'שומר...' : 'שמור שינויים'}
            </button>
          </div>
        </div>

        {/* רשימת שאלות */}
        <div className="space-y-4">
          {questions.map((question, index) => (
            <div
              key={question.id}
              className="bg-gray-800 rounded-xl overflow-hidden"
            >
              {/* כותרת השאלה */}
              <div
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-750"
                onClick={() => setExpandedQuestion(expandedQuestion === question.id ? null : question.id)}
              >
                <GripVertical className="w-5 h-5 text-gray-500" />
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="bg-gray-700 px-2 py-0.5 rounded text-sm">
                      {index + 1}
                    </span>
                    <span className="font-medium">{question.question}</span>
                    {question.isFirst && (
                      <span className="bg-blue-600 px-2 py-0.5 rounded text-xs">
                        ראשונה
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {getTypeLabel(question.type)} • {question.options?.length || 0} אפשרויות
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeQuestion(question.id);
                  }}
                  className="p-2 hover:bg-red-600 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                {expandedQuestion === question.id ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </div>

              {/* תוכן מורחב */}
              {expandedQuestion === question.id && (
                <div className="border-t border-gray-700 p-4 space-y-4">
                  {/* טקסט השאלה */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">טקסט השאלה</label>
                    <input
                      type="text"
                      value={question.question}
                      onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:border-blue-500 outline-none"
                    />
                  </div>

                  {/* סוג השאלה */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">סוג שאלה</label>
                      <select
                        value={question.type}
                        onChange={(e) => updateQuestion(question.id, { type: e.target.value as Question['type'] })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:border-blue-500 outline-none"
                      >
                        <option value="single-choice">בחירה יחידה</option>
                        <option value="multi-choice">בחירה מרובה</option>
                        <option value="text">טקסט חופשי</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">שאלה הבאה (ברירת מחדל)</label>
                      <select
                        value={question.nextQuestion || ''}
                        onChange={(e) => updateQuestion(question.id, { nextQuestion: e.target.value || undefined })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:border-blue-500 outline-none"
                      >
                        <option value="">בחר שאלה...</option>
                        <option value="END">סיום (טופס פרטים)</option>
                        {questions.filter(q => q.id !== question.id).map(q => (
                          <option key={q.id} value={q.id}>{q.question}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* שאלה ראשונה */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={question.isFirst || false}
                      onChange={(e) => {
                        // אם מסמנים כראשונה, בטל את הסימון מכל השאר
                        if (e.target.checked) {
                          setQuestions(questions.map(q => ({
                            ...q,
                            isFirst: q.id === question.id,
                          })));
                        } else {
                          updateQuestion(question.id, { isFirst: false });
                        }
                      }}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm">זו השאלה הראשונה</span>
                  </label>

                  {/* אפשרויות */}
                  {question.type !== 'text' && (
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">אפשרויות תשובה</label>
                      <div className="space-y-2">
                        {question.options?.map((option, optIndex) => (
                          <div key={option.id} className="flex gap-2">
                            <input
                              type="text"
                              value={option.label}
                              onChange={(e) => updateOption(question.id, optIndex, { label: e.target.value })}
                              placeholder="טקסט האפשרות"
                              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
                            />
                            <select
                              value={option.nextQuestion || ''}
                              onChange={(e) => updateOption(question.id, optIndex, { nextQuestion: e.target.value || undefined })}
                              className="w-40 bg-gray-700 border border-gray-600 rounded-lg px-2 py-2 text-sm focus:border-blue-500 outline-none"
                            >
                              <option value="">שאלה הבאה...</option>
                              <option value="END">סיום</option>
                              {questions.filter(q => q.id !== question.id).map(q => (
                                <option key={q.id} value={q.id}>{q.question.substring(0, 20)}...</option>
                              ))}
                            </select>
                            <button
                              onClick={() => removeOption(question.id, optIndex)}
                              className="p-2 hover:bg-red-600 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => addOption(question.id)}
                          className="w-full py-2 border border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors text-sm"
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

          {/* כפתור הוספת שאלה */}
          <button
            onClick={addQuestion}
            className="w-full py-4 border-2 border-dashed border-gray-600 rounded-xl text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            הוסף שאלה חדשה
          </button>
        </div>
      </div>
    </div>
  );
}

