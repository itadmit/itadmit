'use client';

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useLayoutEffect,
  type CSSProperties,
} from 'react';
import { X, MessageCircle, Bot, User, CircleDot } from 'lucide-react';
import type { Question, Lead } from '@/lib/quote-wizard';
import { defaultQuestions, getFirstQuestion, getNextQuestion } from '@/lib/quote-wizard';

const WHATSAPP_PHONE = '972542284283';

type ChatRole = 'bot' | 'user';

interface ChatLine {
  id: string;
  role: ChatRole;
  text: string;
}

type Phase = 'wizard' | 'contact' | 'success';

type ContactField = 'name' | 'phone' | 'email' | 'company';

function waUrl(text: string) {
  return `https://api.whatsapp.com/send/?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(text)}`;
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function optionLabel(q: Question, id: string): string {
  return q.options?.find((o) => o.id === id)?.label ?? id;
}

function formatMultiAnswer(q: Question, ids: string[]): string {
  return ids.map((id) => optionLabel(q, id)).join(', ');
}

/** השוואת טקסט חופשי לאפשרויות (בלי אימוג׳י) */
function stripForMatch(s: string): string {
  return s
    .replace(/[\u{1F300}-\u{1F9FF}\u2600-\u26FF\u2700-\u27BF]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function matchTypedSingleOption(q: Question, raw: string): string | null {
  if (q.type !== 'single-choice' || !q.options) return null;
  const t = stripForMatch(raw);
  if (!t) return null;
  for (const o of q.options) {
    const plain = stripForMatch(o.label);
    if (plain && (t.includes(plain) || plain.includes(t))) return o.id;
  }
  const rules: [RegExp, string][] = [
    [/חנות|איקומרס|שופיפי|מוצרים|שופ|woocommerce/i, 'ecommerce'],
    [/תדמית|אתר חברה|חברה|עסקים|קורפורט/i, 'corporate'],
    [/נחיתה|landing/i, 'landing'],
    [/אחר|מיוחד|משהו אחר|לא בדיוק/i, 'other'],
  ];
  for (const [re, id] of rules) {
    if (re.test(raw) && q.options.some((o) => o.id === id)) return id;
  }
  return null;
}

/** רקע צ'אט בסגנון וואטסאפ (בז׳ + טקסטורה עדינה) */
const WA_CHAT_BG: CSSProperties = {
  backgroundColor: '#ece5dd',
  backgroundImage: `
    repeating-linear-gradient(
      125deg,
      rgba(0, 0, 0, 0.018) 0px,
      rgba(0, 0, 0, 0.018) 1px,
      transparent 1px,
      transparent 16px
    ),
    repeating-linear-gradient(
      -125deg,
      rgba(0, 0, 0, 0.012) 0px,
      rgba(0, 0, 0, 0.012) 1px,
      transparent 1px,
      transparent 20px
    )
  `,
};

interface QuoteChatbotModalProps {
  open: boolean;
  onClose: () => void;
  /** אם לא מועבר — נטען מ־/api/questions או ברירת מחדל */
  questions?: Question[];
}

export default function QuoteChatbotModal({
  open,
  onClose,
  questions: questionsProp,
}: QuoteChatbotModalProps) {
  const [questions, setQuestions] = useState<Question[]>(
    questionsProp ?? defaultQuestions
  );
  const [lines, setLines] = useState<ChatLine[]>([]);
  const [phase, setPhase] = useState<Phase>('wizard');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionHistory, setQuestionHistory] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [textInput, setTextInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [contactField, setContactField] = useState<ContactField | null>(null);
  const [leadInfo, setLeadInfo] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<number[]>([]);
  /** מסלול השאלות האחרון — חייב להיות מסונכרן לפני getNextQuestion */
  const questionsRef = useRef<Question[]>(questionsProp ?? defaultQuestions);
  const answersRef = useRef(answers);
  useLayoutEffect(() => {
    questionsRef.current = questions;
  }, [questions]);
  useLayoutEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  const pushBot = useCallback((text: string) => {
    setLines((prev) => [...prev, { id: uid(), role: 'bot', text }]);
  }, []);

  const pushUser = useCallback((text: string) => {
    setLines((prev) => [...prev, { id: uid(), role: 'user', text }]);
  }, []);

  const withTyping = useCallback(
    (ms: number, fn: () => void) => {
      setIsTyping(true);
      const t = window.setTimeout(() => {
        setIsTyping(false);
        fn();
      }, ms);
      timersRef.current.push(t);
    },
    []
  );

  useEffect(() => {
    if (questionsProp?.length) {
      setQuestions(questionsProp);
    }
  }, [questionsProp]);

  useEffect(() => {
    if (!open) return;
    clearTimers();
    setAnswers({});
    setQuestionHistory([]);
    setSelectedOptions([]);
    setTextInput('');
    setPhase('wizard');
    setContactField(null);
    setLeadInfo({ name: '', phone: '', email: '', company: '' });
    setLines([]);
    setIsTyping(false);

    let cancelled = false;

    (async () => {
      let list = questionsProp ?? defaultQuestions;
      if (!questionsProp?.length) {
        try {
          const r = await fetch('/api/questions', { cache: 'no-store' });
          if (r.ok) {
            const data = await r.json();
            if (Array.isArray(data) && data.length && !cancelled) {
              list = data;
            }
          }
        } catch {
          /* ברירת מחדל */
        }
      }

      if (cancelled) return;

      questionsRef.current = list;
      setQuestions(list);

      const first = getFirstQuestion(list);
      if (!first) {
        pushBot('לא הוגדרו שאלות. צרו קשר ישירות.');
        return;
      }

      setCurrentQuestion(first);
      setQuestionHistory([first]);

      withTyping(450, () => {
        pushBot('היי! טוב לראות אתכם כאן 🙂 אני כאן לעזור עם הצעת מחיר — בלי לחץ ובלי התחייבות.');
        withTyping(650, () => {
          pushBot(first.question);
        });
      });
    })();

    return () => {
      cancelled = true;
      clearTimers();
    };
  }, [open, questionsProp, pushBot, withTyping]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines, isTyping, phase, currentQuestion, selectedOptions]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const startContact = useCallback(() => {
    setPhase('contact');
    setCurrentQuestion(null);
    setContactField('name');
    withTyping(450, () => {
      pushBot(
        'מעולה, כבר כמעט סיימנו. רק כדי לשלוח לכם הצעה מסודרת — איך קוראים לכם? (שם מלא)'
      );
    });
  }, [pushBot, withTyping]);

  const advanceQuestion = useCallback(
    (newAnswers: Record<string, string | string[]>, fromQ: Question, optionId?: string) => {
      const nextQ = getNextQuestion(
        questionsRef.current,
        fromQ.id,
        fromQ.type === 'single-choice' ? optionId : undefined
      );

      if (nextQ) {
        setAnswers(newAnswers);
        setCurrentQuestion(nextQ);
        setQuestionHistory((h) => [...h, nextQ]);
        setSelectedOptions([]);
        setTextInput('');
        withTyping(550, () => {
          pushBot(nextQ.question);
        });
      } else {
        setAnswers(newAnswers);
        startContact();
      }
    },
    [pushBot, withTyping, startContact]
  );

  const commitSingleChoice = (optionId: string, userDisplayLine?: string) => {
    if (!currentQuestion || currentQuestion.type !== 'single-choice') return;
    const line =
      userDisplayLine?.trim() || optionLabel(currentQuestion, optionId);
    pushUser(line);
    const newAnswers = { ...answers, [currentQuestion.id]: optionId };
    advanceQuestion(newAnswers, currentQuestion, optionId);
  };

  const confirmMulti = () => {
    if (!currentQuestion || currentQuestion.type !== 'multi-choice') return;
    if (selectedOptions.length === 0) return;
    const label = formatMultiAnswer(currentQuestion, selectedOptions);
    pushUser(label);
    const newAnswers = { ...answers, [currentQuestion.id]: [...selectedOptions] };
    advanceQuestion(newAnswers, currentQuestion);
  };

  const sendTextAnswer = () => {
    const t = textInput.trim();
    if (!t) return;

    if (phase === 'wizard' && currentQuestion?.type === 'single-choice') {
      const id = matchTypedSingleOption(currentQuestion, t);
      if (id) {
        setTextInput('');
        commitSingleChoice(id, t);
        return;
      }
      pushUser(t);
      pushBot(
        'לא הצלחתי לשייך את זה לאחת האפשרויות — אפשר לבחור כפתור למעלה או לנסח אחרת 🙂'
      );
      setTextInput('');
      return;
    }

    if (phase === 'wizard' && currentQuestion?.type === 'multi-choice') {
      pushBot(
        'כאן בוחרים כמה אפשרויות מהכפתורים למעלה, ואז לוחצים «המשך» 🙂'
      );
      setTextInput('');
      return;
    }

    if (phase === 'wizard' && currentQuestion?.type === 'text') {
      pushUser(t);
      const newAnswers = { ...answers, [currentQuestion.id]: t };
      setTextInput('');
      advanceQuestion(newAnswers, currentQuestion);
      return;
    }

    if (phase === 'contact' && contactField) {
      if (contactField === 'name') {
        pushUser(t);
        setLeadInfo((l) => ({ ...l, name: t }));
        setTextInput('');
        withTyping(400, () => {
          pushBot('תודה! מה מספר הטלפון שלכם?');
        });
        setContactField('phone');
        return;
      }
      if (contactField === 'phone') {
        const digits = t.replace(/\D/g, '');
        if (digits.length < 9) {
          pushUser(t);
          pushBot('נראה מספר קצר מדי — נסו שוב (לפחות 9 ספרות).');
          return;
        }
        pushUser(t);
        setLeadInfo((l) => ({ ...l, phone: t }));
        setTextInput('');
        withTyping(400, () => {
          pushBot('מצוין. מה כתובת האימייל?');
        });
        setContactField('email');
        return;
      }
      if (contactField === 'email') {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) {
          pushUser(t);
          pushBot('נראה שזה לא אימייל תקין — נסו שוב.');
          return;
        }
        pushUser(t);
        setLeadInfo((l) => ({ ...l, email: t }));
        setTextInput('');
        withTyping(400, () => {
          pushBot('אחרון: שם החברה (אופציונלי — אפשר לכתוב «אין»).');
        });
        setContactField('company');
        return;
      }
    }
  };

  const submitLeadFix = async (final: typeof leadInfo) => {
    setIsSubmitting(true);
    try {
      const lead: Omit<Lead, 'id' | 'createdAt'> = {
        ...final,
        answers: answersRef.current,
        status: 'new',
      };
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead),
      });
      if (!res.ok) throw new Error('fail');
      setPhase('success');
      setContactField(null);
      withTyping(400, () => {
        pushBot('הפרטים נשלחו בהצלחה! נחזור אליכם בהקדם עם הצעת מחיר.');
      });
    } catch {
      pushBot('משהו השתבש בשליחה. נסו שוב או כתבו לנו בוואטסאפ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompanySend = () => {
    const t = textInput.trim();
    const company = !t || t === 'אין' || t === 'ללא' ? '' : t;
    pushUser(t || 'אין');
    const final = { ...leadInfo, company };
    setLeadInfo(final);
    setTextInput('');
    void submitLeadFix(final);
  };

  const buildWhatsAppSummary = () => {
    const lines = [
      'שלום תדמית אינטראקטיב,',
      'פניתי מהבוט להצעת מחיר באתר.',
      '',
      `שם: ${leadInfo.name}`,
      `טלפון: ${leadInfo.phone}`,
      `אימייל: ${leadInfo.email}`,
    ];
    if (leadInfo.company) lines.push(`חברה: ${leadInfo.company}`);
    lines.push('', 'תשובות מהשאלון:');
    for (const [k, v] of Object.entries(answersRef.current)) {
      const q = questions.find((qq) => qq.id === k);
      const key = q?.question ?? k;
      const val = Array.isArray(v) ? v.join(', ') : String(v);
      lines.push(`• ${key}: ${val}`);
    }
    return lines.join('\n');
  };

  if (!open) return null;

  const showChoiceButtons =
    phase === 'wizard' &&
    currentQuestion?.type === 'single-choice' &&
    currentQuestion.options;

  const showMultiButtons =
    phase === 'wizard' &&
    currentQuestion?.type === 'multi-choice' &&
    currentQuestion.options;

  const showTextRow =
    (phase === 'wizard' &&
      (currentQuestion?.type === 'text' ||
        currentQuestion?.type === 'single-choice' ||
        currentQuestion?.type === 'multi-choice')) ||
    (phase === 'contact' && contactField !== null);

  const placeholder =
    phase === 'wizard' && currentQuestion?.type === 'text'
      ? 'כתבו כאן...'
      : phase === 'wizard' && currentQuestion?.type === 'single-choice'
        ? 'או הקלידו כאן...'
        : phase === 'wizard' && currentQuestion?.type === 'multi-choice'
          ? 'או תארו במילים (לבחירה מרובת יש את הכפתורים)'
          : contactField === 'name'
            ? 'שם מלא'
            : contactField === 'phone'
              ? 'מספר טלפון'
              : contactField === 'email'
                ? 'אימייל'
                : contactField === 'company'
                  ? 'שם חברה או «אין»'
                  : '';

  const toggleMulti = (id: string) => {
    setSelectedOptions((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

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
        className="relative flex h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-[#ece5dd] shadow-2xl ring-1 ring-black/10 sm:h-[min(640px,90vh)] sm:rounded-2xl"
        dir="rtl"
      >
        <div className="flex shrink-0 items-center gap-3 bg-[#128C7E] px-4 py-3 text-white shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <MessageCircle className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="quote-bot-title" className="truncate text-lg font-semibold">
              הצעת מחיר — תדמית אינטראקטיב
            </h2>
            <p className="text-xs text-white/90">מחוברים עכשיו</p>
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

        <div
          className="flex min-h-0 flex-1 flex-col"
        >
        <div
          className="flex-1 space-y-2 overflow-y-auto px-2.5 py-3 sm:px-3"
          style={WA_CHAT_BG}
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
                className={`max-w-[88%] whitespace-pre-wrap rounded-lg px-3 py-2 text-[15px] leading-relaxed shadow-sm ${
                  m.role === 'user'
                    ? 'rounded-br-none border border-[#b2e8bc] bg-[#d9fdd3] text-[#111b21]'
                    : 'rounded-bl-none border border-[#e9edef] bg-white text-[#111b21]'
                }`}
              >
                <span className="flex flex-col gap-1">
                  {m.text.split('\n').map((line, i) => (
                    <span key={i} className="block">
                      {line.startsWith('◇ ') ? (
                        <span className="inline-flex items-start gap-2">
                          <CircleDot
                            className="mt-1.5 h-3.5 w-3.5 shrink-0 text-[#128C7E]"
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

          {isTyping && (
            <div className="flex justify-end gap-2">
              <div className="max-w-[88%] rounded-lg rounded-bl-none border border-[#e9edef] bg-white px-4 py-3 shadow-sm">
                <span className="flex items-center gap-1.5" aria-hidden>
                  <span
                    className="inline-block h-2 w-2 animate-bounce rounded-full bg-[#8696a0]"
                    style={{ animationDelay: '0ms' }}
                  />
                  <span
                    className="inline-block h-2 w-2 animate-bounce rounded-full bg-[#8696a0]"
                    style={{ animationDelay: '120ms' }}
                  />
                  <span
                    className="inline-block h-2 w-2 animate-bounce rounded-full bg-[#8696a0]"
                    style={{ animationDelay: '240ms' }}
                  />
                </span>
              </div>
              <Bot className="mt-1 h-5 w-5 shrink-0 text-[#667781]" aria-hidden />
            </div>
          )}

          {showChoiceButtons && (
            <div className="flex flex-wrap justify-end gap-2 px-0.5 pb-1 pt-1">
              {currentQuestion.options?.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  disabled={isTyping || isSubmitting}
                  onClick={() => commitSingleChoice(opt.id)}
                  className="max-w-[100%] rounded-2xl border border-[#dadce0] bg-white px-4 py-2.5 text-right text-[13px] font-medium leading-snug text-[#111b21] shadow-sm transition hover:bg-[#f7f8fa] active:scale-[0.98] disabled:opacity-40 sm:text-sm"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {showMultiButtons && (
            <div className="space-y-2 px-0.5 pb-1 pt-1">
              <div className="flex flex-wrap justify-end gap-2">
                {currentQuestion.options?.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={isTyping || isSubmitting}
                    onClick={() => toggleMulti(opt.id)}
                    className={`max-w-[100%] rounded-2xl border px-4 py-2.5 text-right text-[13px] font-medium leading-snug shadow-sm transition disabled:opacity-40 sm:text-sm ${
                      selectedOptions.includes(opt.id)
                        ? 'border-[#128C7E] bg-[#d3eee9] text-[#111b21]'
                        : 'border-[#dadce0] bg-white text-[#111b21] hover:bg-[#f7f8fa]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                disabled={
                  isTyping || isSubmitting || selectedOptions.length === 0
                }
                onClick={confirmMulti}
                className="w-full rounded-2xl bg-[#128C7E] py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f7a6e] disabled:opacity-50"
              >
                המשך
              </button>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div className="shrink-0 border-t border-[#d1d7db] bg-[#f0f2f5] p-2 sm:p-2.5">

          {phase === 'success' && (
            <a
              href={waUrl(buildWhatsAppSummary())}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#25d366] py-3 text-center text-base font-semibold text-[#05422a] transition hover:bg-[#20bd5a]"
            >
              שליחה בוואטסאפ (עם כל הפרטים)
            </a>
          )}

          {showTextRow && (
              <div className="flex gap-2">
                <input
                  type={
                    contactField === 'email'
                      ? 'email'
                      : contactField === 'phone'
                        ? 'tel'
                        : 'text'
                  }
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter') return;
                    if (contactField === 'company') {
                      handleCompanySend();
                    } else {
                      sendTextAnswer();
                    }
                  }}
                  placeholder={placeholder}
                  disabled={isTyping || isSubmitting}
                  className="min-w-0 flex-1 rounded-full border border-[#d1d7db] bg-white px-4 py-2.5 text-right text-sm text-[#111b21] placeholder:text-[#8696a0] focus:border-[#128C7E] focus:outline-none focus:ring-2 focus:ring-[#128C7E]/20 disabled:opacity-50"
                />
                <button
                  type="button"
                  disabled={isTyping || isSubmitting}
                  onClick={() =>
                    contactField === 'company'
                      ? handleCompanySend()
                      : sendTextAnswer()
                  }
                  className="shrink-0 rounded-full bg-[#128C7E] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#0f7a6e] disabled:opacity-50"
                >
                  {isSubmitting ? '...' : 'שלח'}
                </button>
              </div>
            )}

          {phase === 'success' && (
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-2xl border border-[#dadce0] bg-white py-2.5 text-sm text-[#3b4a54] hover:bg-[#f7f8fa]"
            >
              סגירה
            </button>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
