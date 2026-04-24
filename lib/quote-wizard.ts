// מבנה נתונים להצעת מחיר דיגיטלית

export interface QuestionOption {
  id: string;
  label: string;
  nextQuestion?: string; // ID השאלה הבאה (לוגיקה מותנית)
  priceModifier?: number; // לעתיד - השפעה על המחיר
}

export interface Question {
  id: string;
  question: string;
  type: 'single-choice' | 'multi-choice' | 'text';
  options?: QuestionOption[];
  nextQuestion?: string; // ברירת מחדל לשאלה הבאה
  isFirst?: boolean; // האם זו השאלה הראשונה
  order: number;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  company?: string;
  answers: Record<string, string | string[]>;
  estimatedPrice?: number;
  status: 'new' | 'contacted' | 'quoted' | 'closed';
  createdAt: string;
  notes?: string;
}

// שאלות ברירת מחדל
export const defaultQuestions: Question[] = [
  {
    id: 'site-type',
    question: 'במה אתם מעוניינים?',
    type: 'single-choice',
    isFirst: true,
    order: 1,
    options: [
      { id: 'ecommerce', label: '🛒 חנות אונליין', nextQuestion: 'ecommerce-type' },
      { id: 'corporate', label: '🏢 אתר תדמית', nextQuestion: 'pages-count' },
      { id: 'landing', label: '📄 דף נחיתה', nextQuestion: 'landing-purpose' },
      { id: 'other', label: '✨ משהו אחר', nextQuestion: 'describe-project' },
    ],
  },
  {
    id: 'ecommerce-type',
    question: 'באיזה סטייל?',
    type: 'single-choice',
    order: 2,
    options: [
      { 
        id: 'template', 
        label: '📦 תבנית מעוצבת - מהיר ויעיל', 
        nextQuestion: 'products-count' 
      },
      { 
        id: 'custom', 
        label: '🎨 עיצוב מאפס - יוניקי לגמרי', 
        nextQuestion: 'products-count' 
      },
    ],
  },
  {
    id: 'products-count',
    question: 'כמה מוצרים יש לכם?',
    type: 'single-choice',
    order: 3,
    options: [
      { id: 'small', label: '📦 עד 50', nextQuestion: 'features' },
      { id: 'medium', label: '📦📦 50-200', nextQuestion: 'features' },
      { id: 'large', label: '📦📦📦 200+', nextQuestion: 'features' },
    ],
  },
  {
    id: 'pages-count',
    question: 'כמה עמודים צריך?',
    type: 'single-choice',
    order: 2,
    options: [
      { id: 'small', label: '📄 עד 5', nextQuestion: 'features' },
      { id: 'medium', label: '📄📄 5-15', nextQuestion: 'features' },
      { id: 'large', label: '📄📄📄 15+', nextQuestion: 'features' },
    ],
  },
  {
    id: 'landing-purpose',
    question: 'מה המטרה?',
    type: 'single-choice',
    order: 2,
    options: [
      { id: 'leads', label: '📝 לאסוף פניות', nextQuestion: 'timeline' },
      { id: 'sales', label: '💰 למכור משהו', nextQuestion: 'timeline' },
      { id: 'event', label: '🎉 הרשמה לאירוע', nextQuestion: 'timeline' },
      { id: 'other', label: '🎯 משהו אחר', nextQuestion: 'timeline' },
    ],
  },
  {
    id: 'describe-project',
    question: 'ספרו לנו בקצרה על מה מדובר',
    type: 'text',
    order: 2,
    nextQuestion: 'timeline',
  },
  {
    id: 'features',
    question: 'צריכים עוד משהו?',
    type: 'multi-choice',
    order: 4,
    options: [
      { id: 'blog', label: '📝 בלוג' },
      { id: 'multilang', label: '🌍 כמה שפות' },
      { id: 'members', label: '👥 אזור לקוחות' },
      { id: 'booking', label: '📅 הזמנת תורים' },
      { id: 'chat', label: '💬 צ\'אט באתר' },
      { id: 'crm', label: '📊 חיבור למערכת CRM' },
      { id: 'none', label: '👍 הכל טוב, לא צריך' },
    ],
    nextQuestion: 'timeline',
  },
  {
    id: 'timeline',
    question: 'מתי צריך את זה?',
    type: 'single-choice',
    order: 5,
    options: [
      { id: 'urgent', label: '🚀 אתמול (תוך שבועיים)' },
      { id: 'month', label: '📅 יש לי חודש' },
      { id: 'flexible', label: '🕐 בלי לחץ, גמיש' },
    ],
    nextQuestion: 'END', // סיום - מעבר לטופס פרטים
  },
];

// פונקציה למציאת השאלה הבאה
export function getNextQuestion(
  questions: Question[],
  currentQuestionId: string,
  selectedOptionId?: string
): Question | null {
  const currentQuestion = questions.find(q => q.id === currentQuestionId);
  if (!currentQuestion) return null;

  let nextQuestionId: string | undefined;

  // אם יש אפשרות נבחרת עם שאלה הבאה ספציפית
  if (selectedOptionId && currentQuestion.options) {
    const selectedOption = currentQuestion.options.find(o => o.id === selectedOptionId);
    nextQuestionId = selectedOption?.nextQuestion;
  }

  // אם אין, נשתמש בברירת המחדל
  if (!nextQuestionId) {
    nextQuestionId = currentQuestion.nextQuestion;
  }

  // אם הגענו לסוף
  if (nextQuestionId === 'END') return null;

  return questions.find(q => q.id === nextQuestionId) || null;
}

// פונקציה למציאת השאלה הראשונה
export function getFirstQuestion(questions: Question[]): Question | null {
  return questions.find(q => q.isFirst) || questions[0] || null;
}

