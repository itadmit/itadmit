'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Phone, Mail, Building, Calendar, MessageSquare, Eye, X, CheckCircle, Clock, Send } from 'lucide-react';
import { Lead } from '@/lib/quote-wizard';
import AdminShell from '@/components/admin/AdminShell';
import { toast } from '@/components/admin/Toaster';

const statusLabels: Record<
  string,
  { label: string; color: string; bg: string; ring: string; icon: React.ReactNode }
> = {
  new: {
    label: 'חדש',
    color: 'text-sky-300',
    bg: 'bg-sky-500/15',
    ring: 'ring-sky-400/30',
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  contacted: {
    label: 'נוצר קשר',
    color: 'text-amber-300',
    bg: 'bg-amber-500/15',
    ring: 'ring-amber-400/30',
    icon: <Phone className="h-3.5 w-3.5" />,
  },
  quoted: {
    label: 'נשלחה הצעה',
    color: 'text-violet-300',
    bg: 'bg-violet-500/15',
    ring: 'ring-violet-400/30',
    icon: <Send className="h-3.5 w-3.5" />,
  },
  closed: {
    label: 'נסגר',
    color: 'text-emerald-300',
    bg: 'bg-emerald-500/15',
    ring: 'ring-emerald-400/30',
    icon: <CheckCircle className="h-3.5 w-3.5" />,
  },
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
        toast.success('הליד נמחק');
      } else {
        toast.error('שגיאה במחיקה');
      }
    } catch (error) {
      toast.error('שגיאה במחיקה');
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
      } else {
        toast.error('שגיאה בעדכון');
      }
    } catch (error) {
      toast.error('שגיאה בעדכון');
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
    return (
      <AdminShell title="לידים">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-white/60">
          טוען...
        </div>
      </AdminShell>
    );
  }

  const counters = {
    total: leads.length,
    new: leads.filter((l) => l.status === 'new').length,
    open: leads.filter((l) => l.status !== 'closed').length,
  };

  return (
    <AdminShell
      title="לידים"
      subtitle={`${counters.total} לידים • ${counters.new} חדשים • ${counters.open} פתוחים`}
    >
      {leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-16 text-center">
          <MessageSquare className="mb-4 h-12 w-12 text-white/20" />
          <p className="text-lg font-semibold text-white/85">אין לידים עדיין</p>
          <p className="mt-1 text-sm text-white/50">
            לידים חדשים יופיעו כאן ברגע שלקוחות ישלימו את שאלון הצ׳אט.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            {leads.map((lead) => {
              const statusInfo = statusLabels[lead.status];
              const active = selectedLead?.id === lead.id;
              return (
                <div
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className={`group cursor-pointer rounded-2xl border bg-white/[0.035] p-4 transition ${
                    active
                      ? 'border-emerald-400/50 bg-white/[0.06] shadow-[0_4px_24px_-8px_rgba(16,185,129,0.35)]'
                      : 'border-white/10 hover:border-white/20 hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h3 className="text-[15px] font-semibold text-white">
                          {lead.name}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${statusInfo.bg} ${statusInfo.color} ${statusInfo.ring}`}
                        >
                          {statusInfo.icon}
                          {statusInfo.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[12.5px] text-white/60">
                        <span className="inline-flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" />
                          {lead.phone}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5" />
                          {lead.email}
                        </span>
                        {lead.company && (
                          <span className="inline-flex items-center gap-1">
                            <Building className="h-3.5 w-3.5" />
                            {lead.company}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(lead.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLead(lead);
                        }}
                        className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                        title="צפה"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(lead.id);
                        }}
                        className="rounded-lg p-2 text-white/70 transition hover:bg-red-500/15 hover:text-red-300"
                        title="מחק"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="sticky top-24 h-fit rounded-2xl border border-white/10 bg-white/[0.035] p-6">
            {selectedLead ? (
              <>
                <div className="mb-5 flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-xl font-bold">{selectedLead.name}</h2>
                    <p className="mt-0.5 text-xs text-white/50">
                      נוצר {formatDate(selectedLead.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedLead(null)}
                    className="rounded-lg p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mb-5">
                  <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-white/45">
                    סטטוס
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(statusLabels).map(([key, info]) => {
                      const isActive = selectedLead.status === key;
                      return (
                        <button
                          key={key}
                          onClick={() => handleStatusChange(selectedLead.id, key)}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-medium ring-1 transition ${
                            isActive
                              ? `${info.bg} ${info.color} ${info.ring}`
                              : 'bg-white/[0.04] text-white/60 ring-white/10 hover:bg-white/10'
                          }`}
                        >
                          {info.icon}
                          {info.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mb-5 space-y-2">
                  <a
                    href={`tel:${selectedLead.phone}`}
                    className="flex items-center gap-2 rounded-lg bg-white/[0.04] px-3 py-2 text-[13.5px] text-emerald-300 hover:bg-white/[0.08]"
                  >
                    <Phone className="h-4 w-4" />
                    {selectedLead.phone}
                  </a>
                  <a
                    href={`mailto:${selectedLead.email}`}
                    className="flex items-center gap-2 rounded-lg bg-white/[0.04] px-3 py-2 text-[13.5px] text-sky-300 hover:bg-white/[0.08]"
                  >
                    <Mail className="h-4 w-4" />
                    {selectedLead.email}
                  </a>
                  {selectedLead.company && (
                    <div className="flex items-center gap-2 rounded-lg bg-white/[0.04] px-3 py-2 text-[13.5px] text-white/80">
                      <Building className="h-4 w-4" />
                      {selectedLead.company}
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-white/45">
                    תשובות לשאלון
                  </label>
                  <div className="space-y-1.5">
                    {Object.entries(selectedLead.answers).map(
                      ([questionId, answer]) => (
                        <div
                          key={questionId}
                          className="rounded-lg border border-white/5 bg-white/[0.04] p-2.5"
                        >
                          <div className="mb-0.5 text-[10.5px] uppercase tracking-wide text-white/40">
                            {questionId}
                          </div>
                          <div className="text-[13px] text-white/90">
                            {getAnswerLabel(questionId, answer)}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="py-10 text-center text-white/50">
                <Eye className="mx-auto mb-3 h-10 w-10 text-white/20" />
                <p>בחרו ליד לצפייה בפרטים</p>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminShell>
  );
}

