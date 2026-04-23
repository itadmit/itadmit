'use client';

import { useState, useRef, useEffect } from 'react';
import { X, MessageCircle, Bot, User, CircleDot } from 'lucide-react';

const WHATSAPP_PHONE = '972542284283';

type ChatRole = 'bot' | 'user';

interface ChatLine {
  id: string;
  role: ChatRole;
  text: string;
}

type FlowStep = 'name' | 'phone' | 'siteType' | 'budgetOther' | 'budget' | 'done';

const SITE_OPTIONS = [
  { id: 'virtual-store', label: 'חנות וירטואלית' },
  { id: 'brochure', label: 'אתר תדמיתי' },
  { id: 'catalog', label: 'קטלוג ללא רכישה' },
  { id: 'custom-dev', label: 'פיתוח מותאם אישית' },
  { id: 'other', label: 'אחר' },
] as const;

const BUDGET_OPTIONS = [
  {
    id: '0-8500',
    label: 'עד 8,500 ₪',
    reply:
      'בטווח הזה לצערנו אין לנו חבילת אתר מוכנה — אבל אפשר לדבר על צעדים קטנים יותר או להבין מה חשוב לך, ונראה אם יש פתרון חכם.',
  },
  {
    id: '8500-12500',
    label: '8,500 – 12,500 ₪',
    reply:
      'מצוין! בטווח הזה אנחנו בונים אתרים מתבנית מקצועית — מהירים, נקיים ומתאימים להרבה עסקים שרוצים נוכחות דיגיטלית חזקה.',
  },
  {
    id: '15000-17000',
    label: '15,000 – 17,000 ₪',
    reply:
      'נהדר — כאן נכנסים כבר לאתרים פרימיום יותר: תבניות מיוחדות, התאמות אישיות וחוויית משתמש ברמה גבוהה.',
  },
  {
    id: '25000plus',
    label: '25,000 ₪ ומעלה',
    reply:
      'מעולה. בטווח הזה אפשר לפתח כמעט כל דבר — חנות מורכבת, אינטגרציות, עיצוב ייחודי וליווי צמוד. נשמח להמשיך בוואטסאפ.',
  },
] as const;

function waUrl(text: string) {
  return `https://api.whatsapp.com/send/?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(text)}`;
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function QuoteChatbotModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [lines, setLines] = useState<ChatLine[]>([]);
  const [step, setStep] = useState<FlowStep>('name');
  const [input, setInput] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [siteTypeId, setSiteTypeId] = useState<string | null>(null);
  const [siteTypeOther, setSiteTypeOther] = useState('');
  const [budgetId, setBudgetId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const pushBot = (text: string) => {
    setLines((prev) => [...prev, { id: uid(), role: 'bot', text }]);
  };

  const pushUser = (text: string) => {
    setLines((prev) => [...prev, { id: uid(), role: 'user', text }]);
  };

  useEffect(() => {
    if (!open) return;
    setName('');
    setPhone('');
    setSiteTypeId(null);
    setSiteTypeOther('');
    setBudgetId(null);
    setInput('');
    setStep('name');
    setLines([
      {
        id: uid(),
        role: 'bot',
        text:
          'היי, אני הבוט של תדמית אינטראקטיב להצעת מחיר מהירה.\n\nקודם כל — איך קוראים לך?',
      },
    ]);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines, step]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const handleSendText = () => {
    const t = input.trim();
    if (!t) return;

    if (step === 'name') {
      pushUser(t);
      setName(t);
      setInput('');
      pushBot(
        `נעים להכיר, ${t}. מה מספר הטלפון שלך? (כדי שנוכל לחזור אליך)`
      );
      setStep('phone');
      return;
    }

    if (step === 'phone') {
      const digits = t.replace(/\D/g, '');
      if (digits.length < 9) {
        pushUser(t);
        pushBot('נראה לי מספר קצר מדי — נסה שוב עם טלפון ישראלי תקין (לפחות 9 ספרות).');
        return;
      }
      pushUser(t);
      setPhone(t);
      setInput('');
      pushBot(
        'מעולה. באיזה סוג אתר אתה מעוניין? בחר מהאפשרויות למטה.'
      );
      setStep('siteType');
      return;
    }

    if (step === 'budgetOther') {
      pushUser(t);
      setSiteTypeOther(t);
      setInput('');
      pushBot('תודה! ועכשיו — מה התקציב המשוער לפרויקט? בחר טווח:');
      setStep('budget');
    }
  };

  const pickSite = (id: string, label: string) => {
    pushUser(label);
    setSiteTypeId(id);
    if (id === 'other') {
      pushBot('ספר בקצרה — מה סוג האתר שדמיינת?');
      setStep('budgetOther');
      return;
    }
    pushBot('מעולה. מה התקציב המשוער לפרויקט? בחר טווח:');
    setStep('budget');
  };

  const pickBudget = (id: (typeof BUDGET_OPTIONS)[number]['id'], label: string, reply: string) => {
    pushUser(label);
    setBudgetId(id);
    pushBot(reply);
    const siteLabel =
      siteTypeId === 'other'
        ? `אחר${siteTypeOther ? `: ${siteTypeOther}` : ''}`
        : SITE_OPTIONS.find((s) => s.id === siteTypeId)?.label ?? '—';
    pushBot(
      `סיכום קצר:\n◇ שם: ${name}\n◇ טלפון: ${phone}\n◇ סוג אתר: ${siteLabel}\n◇ תקציב: ${label}\n\nלחיצה על הכפתור תפתח וואטסאפ עם כל הפרטים — ונמשיך משם כמו בשיחה רגילה.`
    );
    setStep('done');
  };

  const buildWhatsAppBody = () => {
    const siteLabel =
      siteTypeId === 'other'
        ? `אחר${siteTypeOther ? ` (${siteTypeOther})` : ''}`
        : SITE_OPTIONS.find((s) => s.id === siteTypeId)?.label ?? '—';
    const budgetLabel =
      BUDGET_OPTIONS.find((b) => b.id === budgetId)?.label ?? '—';
    return [
      'שלום תדמית אינטראקטיב,',
      'פניתי מהבוט להצעת מחיר באתר.',
      '',
      `שם: ${name}`,
      `טלפון: ${phone}`,
      `סוג אתר: ${siteLabel}`,
      `תקציב משוער: ${budgetLabel}`,
    ].join('\n');
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quote-bot-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[#3d3429]/45 backdrop-blur-[2px]"
        aria-label="סגור"
        onClick={onClose}
      />

      <div
        className="relative flex h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-[#ebe4dc] shadow-2xl ring-1 ring-[#d8cfc4] sm:h-[min(640px,90vh)] sm:rounded-2xl"
        dir="rtl"
      >
        {/* כותרת בסגנון WA — ירוק רך על טון חם */}
        <div className="flex shrink-0 items-center gap-3 bg-[#5c8f7a] px-4 py-3 text-white shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/25">
            <MessageCircle className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="quote-bot-title" className="truncate text-lg font-semibold">
              הצעת מחיר — תדמית אינטראקטיב
            </h2>
            <p className="text-xs text-white/90">בוט • מענה מהיר</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-white/15"
            aria-label="סגור"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* אזור הודעות — רקע ניוד/בז׳ עם דוגמת משבצות כמו וואטסאפ */}
        <div
          className="flex-1 space-y-3 overflow-y-auto px-3 py-4"
          style={{
            backgroundColor: '#e8ded4',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cpath fill='%23d4c9bc' fill-opacity='0.55' d='M0 0h80v80H0zm80 80h80v80H80z'/%3E%3C/svg%3E")`,
          }}
        >
          {lines.map((m) => (
            <div
              key={m.id}
              className={`flex gap-2 ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}
            >
              {m.role === 'user' && (
                <User
                  className="mt-1 h-5 w-5 shrink-0 text-[#667781]"
                  aria-hidden
                />
              )}
              <div
                className={`max-w-[88%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm leading-relaxed shadow-sm ${
                  m.role === 'user'
                    ? 'rounded-br-none border border-[#b8dba8]/80 bg-[#dcf8c6] text-[#111b21]'
                    : 'rounded-bl-none border border-[#e8e0d8] bg-white text-[#111b21]'
                }`}
              >
                <span className="flex flex-col gap-1">
                  {m.text.split('\n').map((line, i) => (
                    <span key={i} className="block">
                      {line.startsWith('◇ ') ? (
                        <span className="inline-flex items-start gap-2">
                          <CircleDot
                            className="mt-1.5 h-3.5 w-3.5 shrink-0 text-[#5c8f7a]"
                            aria-hidden
                          />
                          <span>{line.slice(2)}</span>
                        </span>
                      ) : (
                        line
                      )}
                    </span>
                  ))}
                </span>
              </div>
              {m.role === 'bot' && (
                <Bot
                  className="mt-1 h-5 w-5 shrink-0 text-[#667781]"
                  aria-hidden
                />
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* פעולות — רצועה בהירה */}
        <div className="shrink-0 border-t border-[#d8cfc4] bg-[#f2ebe3] p-3">
          {step === 'siteType' && (
            <div className="mb-3 flex flex-col gap-2">
              {SITE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => pickSite(opt.id, opt.label)}
                  className="rounded-lg border border-[#c5b8aa] bg-white px-4 py-3 text-right text-sm font-medium text-[#111b21] shadow-sm transition hover:bg-[#faf7f3] hover:border-[#5c8f7a]/50"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {step === 'budget' && (
            <div className="mb-3 flex flex-col gap-2">
              {BUDGET_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => pickBudget(opt.id, opt.label, opt.reply)}
                  className="rounded-lg border border-[#c5b8aa] bg-white px-4 py-3 text-right text-sm font-medium leading-snug text-[#111b21] shadow-sm transition hover:bg-[#faf7f3] hover:border-[#5c8f7a]/50"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {step === 'done' && budgetId && (
            <a
              href={waUrl(buildWhatsAppBody())}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#25d366] py-3 text-center text-base font-semibold text-[#05422a] transition hover:bg-[#20bd5a]"
            >
              המשך בוואטסאפ עם כל הפרטים
            </a>
          )}

          {(step === 'name' ||
            step === 'phone' ||
            step === 'budgetOther') && (
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendText();
                }}
                placeholder={
                  step === 'name'
                    ? 'הקלד את השם שלך'
                    : step === 'phone'
                      ? 'מספר טלפון'
                      : 'תאר בקצרה את סוג האתר'
                }
                className="min-w-0 flex-1 rounded-full border border-[#c5b8aa] bg-white px-4 py-3 text-right text-sm text-[#111b21] placeholder:text-[#8696a0] focus:border-[#5c8f7a] focus:outline-none focus:ring-2 focus:ring-[#5c8f7a]/25"
              />
              <button
                type="button"
                onClick={handleSendText}
                className="shrink-0 rounded-full bg-[#5c8f7a] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#4a7a66]"
              >
                שלח
              </button>
            </div>
          )}

          {step === 'done' && (
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-lg border border-[#c5b8aa] bg-white py-2.5 text-sm text-[#3b4a54] hover:bg-[#faf7f3]"
            >
              סגירה
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
