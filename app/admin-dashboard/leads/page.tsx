'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Trash2, Phone, Mail, Building, Calendar, MessageSquare, Eye, X, CheckCircle, Clock, Send, XCircle } from 'lucide-react';
import { Lead } from '@/lib/quote-wizard';

const statusLabels: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  new: { label: 'חדש', color: 'bg-blue-500', icon: <Clock className="w-4 h-4" /> },
  contacted: { label: 'נוצר קשר', color: 'bg-yellow-500', icon: <Phone className="w-4 h-4" /> },
  quoted: { label: 'נשלחה הצעה', color: 'bg-purple-500', icon: <Send className="w-4 h-4" /> },
  closed: { label: 'נסגר', color: 'bg-green-500', icon: <CheckCircle className="w-4 h-4" /> },
};

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    fetch('/api/auth/check')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setAuthenticated(true);
          loadLeads();
        } else {
          router.push('/login');
        }
      })
      .catch(() => router.push('/login'));
  }, [router]);

  const loadLeads = async () => {
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      setLeads(data);
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('האם למחוק את הליד?')) return;

    try {
      const res = await fetch(`/api/leads?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setLeads(leads.filter(l => l.id !== id));
        if (selectedLead?.id === id) setSelectedLead(null);
      }
    } catch (error) {
      alert('שגיאה במחיקה');
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setLeads(leads.map(l => l.id === id ? { ...l, status: status as Lead['status'] } : l));
        if (selectedLead?.id === id) {
          setSelectedLead({ ...selectedLead, status: status as Lead['status'] });
        }
      }
    } catch (error) {
      alert('שגיאה בעדכון');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAnswerLabel = (questionId: string, answer: string | string[]) => {
    // מילון תרגום לתשובות
    const labels: Record<string, string> = {
      'ecommerce': '🛒 חנות וירטואלית',
      'corporate': '🏢 אתר תדמית',
      'landing': '📄 דף נחיתה',
      'other': '✨ אחר',
      'template': '📦 מבוסס תבנית',
      'custom': '🎨 עיצוב מאפס',
      'small': 'קטן',
      'medium': 'בינוני',
      'large': 'גדול',
      'urgent': '🚀 דחוף',
      'month': '📅 תוך חודש',
      'flexible': '🕐 גמיש',
    };

    if (Array.isArray(answer)) {
      return answer.map(a => labels[a] || a).join(', ');
    }
    return labels[answer] || answer;
  };

  if (!authenticated || loading) {
    return <div className="h-screen flex items-center justify-center text-white bg-gray-900">טוען...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* כותרת */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/admin-dashboard')}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold">ניהול לידים</h1>
          <span className="bg-blue-600 px-3 py-1 rounded-full text-sm">
            {leads.length} לידים
          </span>
        </div>

        {leads.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-xl">אין לידים עדיין</p>
            <p className="text-sm">לידים חדשים יופיעו כאן כשלקוחות ישלימו את השאלון</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* רשימת לידים */}
            <div className="lg:col-span-2 space-y-4">
              {leads.map(lead => {
                const statusInfo = statusLabels[lead.status];
                return (
                  <div
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className={`bg-gray-800 rounded-xl p-5 cursor-pointer transition-all hover:bg-gray-750 border-2 ${
                      selectedLead?.id === lead.id ? 'border-blue-500' : 'border-transparent'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold">{lead.name}</h3>
                          <span className={`${statusInfo.color} px-2 py-0.5 rounded-full text-xs flex items-center gap-1`}>
                            {statusInfo.icon}
                            {statusInfo.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {lead.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {lead.email}
                          </span>
                          {lead.company && (
                            <span className="flex items-center gap-1">
                              <Building className="w-4 h-4" />
                              {lead.company}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(lead.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLead(lead);
                          }}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                          title="צפה"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(lead.id);
                          }}
                          className="p-2 hover:bg-red-600 rounded-lg transition-colors"
                          title="מחק"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* פרטי ליד נבחר */}
            <div className="bg-gray-800 rounded-xl p-6 h-fit sticky top-8">
              {selectedLead ? (
                <>
                  <div className="flex justify-between items-start mb-6">
                    <h2 className="text-xl font-bold">{selectedLead.name}</h2>
                    <button
                      onClick={() => setSelectedLead(null)}
                      className="p-1 hover:bg-gray-700 rounded"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* סטטוס */}
                  <div className="mb-6">
                    <label className="block text-sm text-gray-400 mb-2">סטטוס</label>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(statusLabels).map(([key, info]) => (
                        <button
                          key={key}
                          onClick={() => handleStatusChange(selectedLead.id, key)}
                          className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 transition-colors ${
                            selectedLead.status === key
                              ? info.color
                              : 'bg-gray-700 hover:bg-gray-600'
                          }`}
                        >
                          {info.icon}
                          {info.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* פרטי קשר */}
                  <div className="space-y-3 mb-6">
                    <a
                      href={`tel:${selectedLead.phone}`}
                      className="flex items-center gap-2 text-blue-400 hover:underline"
                    >
                      <Phone className="w-4 h-4" />
                      {selectedLead.phone}
                    </a>
                    <a
                      href={`mailto:${selectedLead.email}`}
                      className="flex items-center gap-2 text-blue-400 hover:underline"
                    >
                      <Mail className="w-4 h-4" />
                      {selectedLead.email}
                    </a>
                    {selectedLead.company && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <Building className="w-4 h-4" />
                        {selectedLead.company}
                      </div>
                    )}
                  </div>

                  {/* תשובות */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-3">תשובות לשאלון</label>
                    <div className="space-y-2">
                      {Object.entries(selectedLead.answers).map(([questionId, answer]) => (
                        <div key={questionId} className="bg-gray-700/50 rounded-lg p-3">
                          <div className="text-xs text-gray-400 mb-1">{questionId}</div>
                          <div className="text-sm">{getAnswerLabel(questionId, answer)}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* תאריך */}
                  <div className="mt-6 pt-4 border-t border-gray-700 text-sm text-gray-400">
                    נוצר: {formatDate(selectedLead.createdAt)}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>בחר ליד לצפייה בפרטים</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

