'use client';

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useLayoutEffect,
  useMemo,
  type CSSProperties,
} from 'react';
import Image from 'next/image';
import {
  X,
  ArrowRight,
  Phone,
  Video,
  MoreVertical,
  Check,
  CheckCheck,
  Paperclip,
  Smile,
  Send,
  Mic,
} from 'lucide-react';
import type { Question, Lead } from '@/lib/quote-wizard';
import { defaultQuestions, getFirstQuestion, getNextQuestion } from '@/lib/quote-wizard';
import { gaEvent, GA_EVENTS } from '@/lib/gtag';

const WHATSAPP_PHONE = '972542284283';
const AGENT_NAME = 'תדמית אינטראקטיב';
const AGENT_SUB_ONLINE = 'מחובר/ת עכשיו';
const AGENT_SUB_TYPING = 'כותב/ת...';
const AGENT_AVATAR = '/images/tadmit-logo.png';

/** קצבי תגובה — כך שהשיחה תרגיש אנושית ולא רובוטית */
const TYPING_MS = {
  micro: 380,
  short: 560,
  medium: 820,
  long: 1100,
  openFirst: 650,
  openSecond: 950,
} as const;

type ChatRole = 'bot' | 'user';
type MsgStatus = 'sent' | 'delivered' | 'read';

interface ChatLine {
  id: string;
  role: ChatRole;
  text: string;
  ts: number;
  status?: MsgStatus;
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

function formatTime(ts: number): string {
  const d = new Date(ts);
  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

function stripForMatch(s: string): string {
  return s
    .replace(/[\u{1F300}-\u{1F9FF}☀-⛿✀-➿]/gu, '')
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

/** הודעות אישור אנושיות אחרי בחירת המשתמש — משתנות לפי ההקשר */
function pickAcknowledgment(q: Question, answer: string | string[]): string | null {
  const pickFrom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  if (typeof answer === 'string') {
    if (q.id === 'site-type') {
      if (answer === 'ecommerce')
        return pickFrom([
          'איזה כיף, חנויות זה בדיוק התחום שלנו 🛍️',
          'נהדר! בנינו עשרות חנויות — יוצא בידיים טובות.',
        ]);
      if (answer === 'corporate')
        return pickFrom([
          'מעולה, אתר תדמית חזק זה כרטיס הביקור של העסק 🙌',
          'סבבה — זה משהו שאנחנו עושים המון.',
        ]);
      if (answer === 'landing')
        return pickFrom([
          'אחלה, דף נחיתה זה מהיר ויעיל ⚡',
          'כייף, דפי נחיתה ממירים זה הקטע שלנו.',
        ]);
      if (answer === 'other')
        return 'אין בעיה, ספרו בקצרה ונבין יחד איך עוזרים 🙏';
    }
    if (q.id === 'ecommerce-type') {
      if (answer === 'template')
        return 'בחירה חכמה — יוצאים לדרך מהר ובתקציב חכם.';
      if (answer === 'custom')
        return 'מהמם 🎨 מעצבים משהו שאין לאף אחד.';
    }
    if (q.id === 'products-count' || q.id === 'pages-count') {
      if (answer === 'large')
        return 'כבוד 👏 יש לנו ניסיון בפרויקטים בקנה מידה הזה.';
      if (answer === 'medium') return 'מצוין, גודל נוח לעבודה.';
      if (answer === 'small') return 'קומפקטי וממוקד — הכי יעיל 👌';
    }
    if (q.id === 'landing-purpose') {
      if (answer === 'leads')
        return 'יופי — נבנה משהו שממיר, לא רק יפה 📈';
      if (answer === 'sales') return 'אחלה, נבנה מסלול רכישה מהיר.';
      if (answer === 'event') return 'סבבה, נדאג שיהיה פשוט להירשם.';
    }
    if (q.id === 'timeline') {
      if (answer === 'urgent')
        return 'קיבלנו, נלחץ על הגז 🚀 — נחזור אליכם במהירות.';
      if (answer === 'month') return 'מעולה, זה לו״ז נוח.';
      if (answer === 'flexible')
        return 'אחלה 🙂 זה מאפשר לנו לעצב בלי פשרות.';
    }
  }

  if (Array.isArray(answer) && q.id === 'features') {
    if (answer.includes('none') && answer.length === 1)
      return 'בסדר גמור, נישאר על הבסיס — זה לרוב כל מה שצריך.';
    if (answer.length >= 3) return 'וואו, מגוון רחב 🤩 — נצטרך לתכנן היטב.';
    if (answer.length > 0) return 'רשמתי ✍️';
  }

  return null;
}

/** רקע צ'אט בסגנון וואטסאפ (בז׳ + טקסטורה עדינה) */
const WA_CHAT_BG: CSSProperties = {
  backgroundColor: '#efeae2',
  backgroundImage: `
    radial-gradient(circle at 15% 15%, rgba(0,0,0,0.028) 1px, transparent 1.5px),
    radial-gradient(circle at 85% 35%, rgba(0,0,0,0.022) 1px, transparent 1.5px),
    radial-gradient(circle at 45% 75%, rgba(0,0,0,0.024) 1px, transparent 1.5px),
    radial-gradient(circle at 75% 90%, rgba(0,0,0,0.02) 1px, transparent 1.5px)
  `,
  backgroundSize: '160px 160px, 220px 220px, 190px 190px, 240px 240px',
};

interface QuoteChatbotModalProps {
  open: boolean;
  onClose: () => void;
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<number[]>([]);
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
    setLines((prev) => [
      ...prev,
      { id: uid(), role: 'bot', text, ts: Date.now() },
    ]);
  }, []);

  const pushUser = useCallback((text: string) => {
    const id = uid();
    setLines((prev) => [
      ...prev,
      { id, role: 'user', text, ts: Date.now(), status: 'sent' },
    ]);
    // תהליך אנושי: נשלח → נמסר → נקרא
    const t1 = window.setTimeout(() => {
      setLines((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: 'delivered' } : l))
      );
    }, 350);
    const t2 = window.setTimeout(() => {
      setLines((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: 'read' } : l))
      );
    }, 900);
    timersRef.current.push(t1, t2);
  }, []);

  const withTyping = useCallback((ms: number, fn: () => void) => {
    setIsTyping(true);
    const t = window.setTimeout(() => {
      setIsTyping(false);
      fn();
    }, ms);
    timersRef.current.push(t);
  }, []);

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

    gaEvent(GA_EVENTS.chatOpen);

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

      withTyping(TYPING_MS.openFirst, () => {
        pushBot('היי 👋 ברוכים הבאים לתדמית אינטראקטיב!');
        withTyping(TYPING_MS.short, () => {
          pushBot(
            'אני כאן לעזור לכם לקבל הצעת מחיר — בלי לחץ ובלי התחייבות. ניקח דקה קטנה 🙂'
          );
          withTyping(TYPING_MS.openSecond, () => {
            pushBot(first.question);
          });
        });
      });
    })();

    return () => {
      cancelled = true;
      clearTimers();
    };
  }, [open, questionsProp, pushBot, withTyping]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
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
    withTyping(TYPING_MS.medium, () => {
      pushBot(
        'מעולה, אלו כל השאלות ששאלתי 😊 רק נשאר לקבל פרטים ואנחנו שולחים לכם הצעה.'
      );
      withTyping(TYPING_MS.short, () => {
        pushBot('איך קוראים לכם? (שם מלא)');
      });
    });
  }, [pushBot, withTyping]);

  const advanceQuestion = useCallback(
    (
      newAnswers: Record<string, string | string[]>,
      fromQ: Question,
      optionId?: string
    ) => {
      const nextQ = getNextQuestion(
        questionsRef.current,
        fromQ.id,
        fromQ.type === 'single-choice' ? optionId : undefined
      );

      const answerForAck =
        fromQ.type === 'multi-choice'
          ? (newAnswers[fromQ.id] as string[])
          : fromQ.type === 'single-choice'
            ? optionId ?? ''
            : (newAnswers[fromQ.id] as string);
      const ack = pickAcknowledgment(fromQ, answerForAck);

      if (nextQ) {
        setAnswers(newAnswers);
        setCurrentQuestion(nextQ);
        setQuestionHistory((h) => [...h, nextQ]);
        setSelectedOptions([]);
        setTextInput('');
        if (ack) {
          withTyping(TYPING_MS.short, () => {
            pushBot(ack);
            withTyping(TYPING_MS.long, () => {
              pushBot(nextQ.question);
            });
          });
        } else {
          withTyping(TYPING_MS.medium, () => {
            pushBot(nextQ.question);
          });
        }
      } else {
        setAnswers(newAnswers);
        if (ack) {
          withTyping(TYPING_MS.short, () => {
            pushBot(ack);
            startContact();
          });
        } else {
          startContact();
        }
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
      setTextInput('');
      withTyping(TYPING_MS.short, () => {
        pushBot(
          'לא הצלחתי לזהות את זה בין האפשרויות 🤔 אפשר ללחוץ על אחד הכפתורים למעלה?'
        );
      });
      return;
    }

    if (phase === 'wizard' && currentQuestion?.type === 'multi-choice') {
      pushUser(t);
      setTextInput('');
      withTyping(TYPING_MS.short, () => {
        pushBot('כאן עדיף לסמן כפתורים 🙂 אפשר לסמן כמה ואז ללחוץ «המשך».');
      });
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
        const first = t.split(' ')[0];
        withTyping(TYPING_MS.short, () => {
          pushBot(`נעים מאוד, ${first}! 🤝 מה מספר הטלפון שלך?`);
        });
        setContactField('phone');
        return;
      }
      if (contactField === 'phone') {
        const digits = t.replace(/\D/g, '');
        if (digits.length < 9) {
          pushUser(t);
          setTextInput('');
          withTyping(TYPING_MS.micro, () => {
            pushBot('נראה קצר מדי — אפשר לכתוב שוב? (לפחות 9 ספרות) 📱');
          });
          return;
        }
        pushUser(t);
        setLeadInfo((l) => ({ ...l, phone: t }));
        setTextInput('');
        withTyping(TYPING_MS.short, () => {
          pushBot('מעולה 👌 ומה כתובת האימייל?');
        });
        setContactField('email');
        return;
      }
      if (contactField === 'email') {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) {
          pushUser(t);
          setTextInput('');
          withTyping(TYPING_MS.micro, () => {
            pushBot('זה לא נראה כמו אימייל תקין — אפשר לנסות שוב? ✉️');
          });
          return;
        }
        pushUser(t);
        setLeadInfo((l) => ({ ...l, email: t }));
        setTextInput('');
        withTyping(TYPING_MS.short, () => {
          pushBot('אחרון אחרון 🙂 שם החברה? (אפשר לכתוב «אין»)');
        });
        setContactField('company');
        return;
      }
    }
  };

  const submitLead = async (final: typeof leadInfo) => {
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
      gaEvent(GA_EVENTS.leadSubmit, {
        currency: 'ILS',
        has_company: Boolean(final.company),
      });
      setPhase('success');
      setContactField(null);
      const firstName = (final.name || '').split(' ')[0];
      withTyping(TYPING_MS.short, () => {
        pushBot(
          `תודה רבה${firstName ? `, ${firstName}` : ''}! 🎉 הפרטים שלכם התקבלו אצלנו בהצלחה.`
        );
        withTyping(TYPING_MS.medium, () => {
          pushBot(
            'אנחנו כבר מתחילים להכין לכם הצעת מחיר ונחזור אליכם בהקדם האפשרי 🙌'
          );
        });
      });
    } catch {
      pushBot('אופס, משהו השתבש בשליחה 😕 נסו שוב או דברו איתנו בוואטסאפ.');
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
    void submitLead(final);
  };

  const buildWhatsAppSummary = () => {
    const parts = [
      'שלום תדמית אינטראקטיב,',
      'פניתי מהצ׳אט להצעת מחיר באתר.',
      '',
      `שם: ${leadInfo.name}`,
      `טלפון: ${leadInfo.phone}`,
      `אימייל: ${leadInfo.email}`,
    ];
    if (leadInfo.company) parts.push(`חברה: ${leadInfo.company}`);
    parts.push('', 'תשובות מהשאלון:');
    for (const [k, v] of Object.entries(answersRef.current)) {
      const q = questions.find((qq) => qq.id === k);
      const key = q?.question ?? k;
      const val = Array.isArray(v) ? v.join(', ') : String(v);
      parts.push(`• ${key}: ${val}`);
    }
    return parts.join('\n');
  };

  const showChoiceButtons =
    phase === 'wizard' &&
    currentQuestion?.type === 'single-choice' &&
    !!currentQuestion.options &&
    !isTyping;

  const showMultiButtons =
    phase === 'wizard' &&
    currentQuestion?.type === 'multi-choice' &&
    !!currentQuestion.options &&
    !isTyping;

  const showTextRow =
    (phase === 'wizard' &&
      (currentQuestion?.type === 'text' ||
        currentQuestion?.type === 'single-choice' ||
        currentQuestion?.type === 'multi-choice')) ||
    (phase === 'contact' && contactField !== null);

  const placeholder = useMemo(() => {
    if (phase === 'wizard' && currentQuestion?.type === 'text')
      return 'הקלידו הודעה';
    if (phase === 'wizard' && currentQuestion?.type === 'single-choice')
      return 'בחרו כפתור או כתבו תשובה';
    if (phase === 'wizard' && currentQuestion?.type === 'multi-choice')
      return 'סמנו אפשרויות למעלה';
    if (contactField === 'name') return 'שם מלא';
    if (contactField === 'phone') return 'מספר טלפון';
    if (contactField === 'email') return 'כתובת אימייל';
    if (contactField === 'company') return 'שם חברה או «אין»';
    return 'הקלידו הודעה';
  }, [phase, currentQuestion, contactField]);

  const toggleMulti = (id: string) => {
    setSelectedOptions((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  if (!open) return null;

  const headerSub = isTyping ? AGENT_SUB_TYPING : AGENT_SUB_ONLINE;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quote-bot-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        aria-label="סגור"
        onClick={onClose}
      />

      <div
        className="relative flex h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-[#efeae2] shadow-2xl ring-1 ring-black/10 sm:h-[min(680px,92vh)] sm:rounded-2xl"
        dir="rtl"
      >
        {/* Header — WhatsApp style */}
        <div className="flex shrink-0 items-center gap-2.5 bg-[#008069] px-3 py-2.5 text-white shadow-[0_1px_0_0_rgba(0,0,0,0.15)] sm:px-4 sm:py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-white/15"
            aria-label="חזרה"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white/15 ring-1 ring-white/30">
              <Image
                src={AGENT_AVATAR}
                alt={AGENT_NAME}
                width={40}
                height={40}
                className="h-10 w-10 object-cover"
                priority
              />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-[#25D366] ring-2 ring-[#008069]" />
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <h2 id="quote-bot-title" className="truncate text-[15px] font-semibold">
              {AGENT_NAME}
            </h2>
            <p className="truncate text-[12px] text-white/85">{headerSub}</p>
          </div>
          <div className="hidden items-center gap-1 sm:flex">
            <button
              type="button"
              className="rounded-full p-2 text-white/85 hover:bg-white/10"
              aria-label="שיחת וידאו"
              tabIndex={-1}
            >
              <Video className="h-5 w-5" />
            </button>
            <a
              href={`tel:0${WHATSAPP_PHONE.slice(3)}`}
              className="rounded-full p-2 text-white/85 hover:bg-white/10"
              aria-label="שיחת טלפון"
            >
              <Phone className="h-5 w-5" />
            </a>
            <button
              type="button"
              className="rounded-full p-2 text-white/85 hover:bg-white/10"
              aria-label="עוד"
              tabIndex={-1}
            >
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-white/15 sm:hidden"
            aria-label="סגור"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Chat area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-2.5 py-3 sm:px-3"
          style={WA_CHAT_BG}
        >
          {/* System pill */}
          <div className="mb-3 flex justify-center">
            <span className="rounded-md bg-[#fef6dc] px-3 py-1 text-[11px] font-medium text-[#54656f] shadow-[0_1px_0.5px_rgba(0,0,0,0.08)]">
              ההודעות מוצפנות מקצה לקצה 🔒
            </span>
          </div>

          <div className="space-y-1">
            {lines.map((m, i) => {
              const prev = lines[i - 1];
              const sameAsPrev = prev && prev.role === m.role;
              return (
                <MessageBubble
                  key={m.id}
                  role={m.role}
                  text={m.text}
                  ts={m.ts}
                  status={m.status}
                  grouped={!!sameAsPrev}
                />
              );
            })}

            {isTyping && <TypingBubble />}

            {phase === 'success' && (
              <div className="mt-4 flex justify-center">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#008069] px-4 py-2 text-[13px] font-semibold text-white shadow-[0_4px_14px_-4px_rgba(0,128,105,0.55)]">
                  <CheckCheck className="h-4 w-4" aria-hidden />
                  הפרטים שלכם נשלחו בהצלחה
                </span>
              </div>
            )}
          </div>

          {/* Choice buttons inside chat area (like WhatsApp interactive buttons) */}
          {showChoiceButtons && (
            <div className="mt-2 flex flex-wrap justify-end gap-2 pb-1">
              {currentQuestion!.options!.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => commitSingleChoice(opt.id)}
                  className="max-w-full rounded-2xl border border-[#dadce0] bg-white px-4 py-2.5 text-[13px] font-medium leading-snug text-[#008069] shadow-sm transition hover:bg-[#f0fdf7] active:scale-[0.98] disabled:opacity-40 sm:text-sm"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {showMultiButtons && (
            <div className="mt-2 space-y-2 pb-1">
              <div className="flex flex-wrap justify-end gap-2">
                {currentQuestion!.options!.map((opt) => {
                  const selected = selectedOptions.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => toggleMulti(opt.id)}
                      className={`max-w-full rounded-2xl border px-4 py-2.5 text-[13px] font-medium leading-snug shadow-sm transition disabled:opacity-40 sm:text-sm ${
                        selected
                          ? 'border-[#008069] bg-[#d1f2e4] text-[#054d3a]'
                          : 'border-[#dadce0] bg-white text-[#008069] hover:bg-[#f0fdf7]'
                      }`}
                    >
                      <span className="inline-flex items-center gap-2">
                        <span
                          className={`inline-flex h-4 w-4 items-center justify-center rounded-sm border ${
                            selected
                              ? 'border-[#008069] bg-[#008069] text-white'
                              : 'border-[#b6bfc4] bg-white'
                          }`}
                        >
                          {selected && <Check className="h-3 w-3" />}
                        </span>
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                disabled={isSubmitting || selectedOptions.length === 0}
                onClick={confirmMulti}
                className="w-full rounded-full bg-[#008069] py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#026a58] disabled:opacity-50"
              >
                שליחת הבחירה
              </button>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Footer input — WhatsApp input bar */}
        <div className="shrink-0 bg-[#f0f2f5] px-2 py-2 sm:px-3 sm:py-2.5">
          {phase === 'success' && (
            <div className="space-y-2.5 pt-0.5">
              <p className="text-center text-[13px] leading-snug text-[#54656f]">
                אם אתם עדיין מעוניינים לדבר בוואטסאפ ניתן ללחוץ על הכפתור מטה
              </p>
              <a
                href={waUrl(buildWhatsAppSummary())}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => gaEvent(GA_EVENTS.whatsappClick)}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3 text-[15px] font-semibold text-white shadow-sm transition hover:bg-[#1fbd58]"
              >
                <svg viewBox="0 0 32 32" className="h-4 w-4 fill-current" aria-hidden>
                  <path d="M16 3a13 13 0 0 0-11.15 19.7L3 29l6.46-1.78A13 13 0 1 0 16 3zm0 23.7a10.7 10.7 0 0 1-5.45-1.48l-.39-.23-3.84 1.06 1.03-3.74-.25-.4A10.68 10.68 0 1 1 16 26.7zm6.15-8a15 15 0 0 1-1.45-.54c-.19-.09-.33-.13-.47.13s-.54.68-.66.83-.25.17-.47.06a8.68 8.68 0 0 1-2.54-1.57 9.57 9.57 0 0 1-1.77-2.2c-.19-.33 0-.5.14-.66s.33-.36.5-.54a2.25 2.25 0 0 0 .33-.55.6.6 0 0 0 0-.58c-.09-.18-.47-1.14-.65-1.56s-.35-.36-.47-.37l-.4 0a.78.78 0 0 0-.56.26 2.35 2.35 0 0 0-.73 1.76 4.08 4.08 0 0 0 .85 2.16 9.37 9.37 0 0 0 3.58 3.58 4.52 4.52 0 0 0 2.38.87 2.2 2.2 0 0 0 1.45-.57 2 2 0 0 0 .46-1.24c.05-.23.05-.43 0-.48s-.17-.08-.35-.17z" />
                </svg>
                המשך שיחה בוואטסאפ
              </a>
              <div className="flex items-center gap-3 text-[12px] text-[#8696a0]">
                <span className="h-px flex-1 bg-[#dadce0]" />
                <span>או לחייג</span>
                <span className="h-px flex-1 bg-[#dadce0]" />
              </div>
              <a
                href="tel:0542284283"
                onClick={() => gaEvent(GA_EVENTS.callClick)}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#008069] py-3 text-[15px] font-semibold text-white shadow-sm transition hover:bg-[#026a58]"
              >
                <Phone className="h-4 w-4" aria-hidden />
                חייג עכשיו 054-228-4283
              </a>
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-full border border-[#dadce0] bg-white py-2.5 text-[13px] text-[#3b4a54] hover:bg-[#f7f8fa]"
              >
                סגירה
              </button>
            </div>
          )}

          {showTextRow && (
            <div className="flex items-end gap-1.5">
              <button
                type="button"
                className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#54656f] transition hover:bg-black/5 sm:flex"
                aria-label="אימוג׳י"
                tabIndex={-1}
              >
                <Smile className="h-6 w-6" />
              </button>
              <button
                type="button"
                className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#54656f] transition hover:bg-black/5 sm:flex"
                aria-label="צירוף"
                tabIndex={-1}
              >
                <Paperclip className="h-5 w-5" />
              </button>
              <div className="flex min-w-0 flex-1 items-center rounded-3xl bg-white px-3 py-1 shadow-sm">
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
                    e.preventDefault();
                    if (contactField === 'company') {
                      handleCompanySend();
                    } else {
                      sendTextAnswer();
                    }
                  }}
                  placeholder={placeholder}
                  disabled={isTyping || isSubmitting}
                  className="w-full min-w-0 bg-transparent py-2 text-[15px] leading-snug text-[#111b21] placeholder:text-[#8696a0] focus:outline-none disabled:opacity-60"
                />
              </div>
              <button
                type="button"
                disabled={isTyping || isSubmitting || !textInput.trim()}
                onClick={() =>
                  contactField === 'company'
                    ? handleCompanySend()
                    : sendTextAnswer()
                }
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#008069] text-white shadow-sm transition hover:bg-[#026a58] disabled:cursor-not-allowed disabled:bg-[#54656f]/60"
                aria-label={textInput.trim() ? 'שלח' : 'הקלטה'}
              >
                {isSubmitting ? (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : textInput.trim() ? (
                  <Send className="h-[18px] w-[18px]" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- תתי־רכיבים ---------- */

interface BubbleProps {
  role: ChatRole;
  text: string;
  ts: number;
  status?: MsgStatus;
  grouped: boolean;
}

function MessageBubble({ role, text, ts, status, grouped }: BubbleProps) {
  const isUser = role === 'user';
  return (
    <div
      className={`flex ${isUser ? 'justify-start' : 'justify-end'} ${grouped ? 'mt-1' : 'mt-2.5'}`}
    >
      <div
        className={`relative max-w-[82%] px-[9px] py-[6px] text-[14.5px] leading-[1.35] shadow-[0_1px_0.5px_rgba(0,0,0,0.13)] ${
          isUser
            ? `bg-[#d9fdd3] text-[#111b21] ${grouped ? 'rounded-2xl rounded-br-2xl' : 'rounded-2xl rounded-br-sm'}`
            : `bg-white text-[#111b21] ${grouped ? 'rounded-2xl rounded-bl-2xl' : 'rounded-2xl rounded-bl-sm'}`
        }`}
      >
        {!grouped && (
          <span
            className={`absolute bottom-0 h-3 w-3 ${
              isUser ? 'right-[-6px]' : 'left-[-6px]'
            }`}
            aria-hidden
          >
            <svg viewBox="0 0 12 12" className="h-3 w-3">
              {isUser ? (
                <path d="M0 0 L0 12 L12 12 Z" fill="#d9fdd3" />
              ) : (
                <path d="M12 0 L12 12 L0 12 Z" fill="#ffffff" />
              )}
            </svg>
          </span>
        )}
        <span
          className="block break-words text-right"
          style={{ whiteSpace: 'pre-wrap' }}
        >
          {text}
          <span
            className="inline-flex select-none items-center gap-1 whitespace-nowrap text-[10.5px] leading-none text-[#667781]"
            style={{
              float: 'left',
              marginInlineStart: 8,
              marginTop: 4,
              transform: 'translateY(4px)',
            }}
          >
            <span>{formatTime(ts)}</span>
            {isUser && <StatusTicks status={status} />}
          </span>
        </span>
      </div>
    </div>
  );
}

function StatusTicks({ status }: { status?: MsgStatus }) {
  if (!status) return null;
  if (status === 'sent') return <Check className="h-3 w-3 text-[#667781]" aria-hidden />;
  if (status === 'delivered')
    return <CheckCheck className="h-3.5 w-3.5 text-[#667781]" aria-hidden />;
  return <CheckCheck className="h-3.5 w-3.5 text-[#53bdeb]" aria-hidden />;
}

function TypingBubble() {
  return (
    <div className="mt-1.5 flex justify-end">
      <div className="relative rounded-2xl rounded-bl-sm bg-white px-3 py-2.5 shadow-[0_1px_0.5px_rgba(0,0,0,0.13)]">
        <span
          className="absolute bottom-0 left-[-6px] h-3 w-3"
          aria-hidden
        >
          <svg viewBox="0 0 12 12" className="h-3 w-3">
            <path d="M12 0 L12 12 L0 12 Z" fill="#ffffff" />
          </svg>
        </span>
        <span className="flex items-center gap-1" aria-hidden>
          <span
            className="inline-block h-1.5 w-1.5 rounded-full bg-[#8696a0] motion-safe:animate-[qs-bounce_1.2s_ease-in-out_infinite]"
            style={{ animationDelay: '0ms' }}
          />
          <span
            className="inline-block h-1.5 w-1.5 rounded-full bg-[#8696a0] motion-safe:animate-[qs-bounce_1.2s_ease-in-out_infinite]"
            style={{ animationDelay: '170ms' }}
          />
          <span
            className="inline-block h-1.5 w-1.5 rounded-full bg-[#8696a0] motion-safe:animate-[qs-bounce_1.2s_ease-in-out_infinite]"
            style={{ animationDelay: '340ms' }}
          />
        </span>
      </div>
      <style jsx>{`
        @keyframes qs-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.45; }
          40% { transform: translateY(-3px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
