'use client';

import { useState, useEffect } from 'react';
import { X, Send, ChevronRight, ChevronLeft, Sparkles, MessageCircle, Coins, PhoneOff, Timer, PartyPopper, Rocket } from 'lucide-react';
import { Question, Lead, defaultQuestions, getFirstQuestion, getNextQuestion } from '@/lib/quote-wizard';

interface QuoteWizardProps {
  questions?: Question[];
}

export default function QuoteWizard({ questions = defaultQuestions }: QuoteWizardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'welcome' | 'questions' | 'contact' | 'success'>('welcome');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [questionHistory, setQuestionHistory] = useState<Question[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [textAnswer, setTextAnswer] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  
  // פרטי הליד
  const [leadInfo, setLeadInfo] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // אנימציית פתיחה
  const [showBubble, setShowBubble] = useState(false);
  
  useEffect(() => {
    // הצגת הבועית אחרי 3 שניות
    const timer = setTimeout(() => {
      setShowBubble(true);
    }, 3000);
    
    // הסתרה אחרי 10 שניות
    const hideTimer = setTimeout(() => {
      setShowBubble(false);
    }, 13000);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    setShowBubble(false);
    setStep('welcome');
  };

  const handleClose = () => {
    setIsOpen(false);
    // איפוס אחרי סגירה
    setTimeout(() => {
      setStep('welcome');
      setAnswers({});
      setQuestionHistory([]);
      setCurrentQuestion(null);
      setSelectedOptions([]);
      setTextAnswer('');
      setLeadInfo({ name: '', phone: '', email: '', company: '' });
    }, 300);
  };

  const startQuestions = () => {
    const firstQ = getFirstQuestion(questions);
    if (firstQ) {
      setCurrentQuestion(firstQ);
      setQuestionHistory([firstQ]);
      setStep('questions');
    }
  };

  const handleAnswer = (optionId?: string) => {
    if (!currentQuestion) return;

    setIsAnimating(true);
    
    // שמירת התשובה
    let answerValue: string | string[];
    if (currentQuestion.type === 'multi-choice') {
      answerValue = selectedOptions;
    } else if (currentQuestion.type === 'text') {
      answerValue = textAnswer;
    } else {
      answerValue = optionId || '';
    }
    
    const newAnswers = { ...answers, [currentQuestion.id]: answerValue };
    setAnswers(newAnswers);

    // מציאת השאלה הבאה
    const nextQ = getNextQuestion(
      questions, 
      currentQuestion.id, 
      currentQuestion.type === 'single-choice' ? optionId : undefined
    );

    setTimeout(() => {
      if (nextQ) {
        setCurrentQuestion(nextQ);
        setQuestionHistory([...questionHistory, nextQ]);
        setSelectedOptions([]);
        setTextAnswer('');
      } else {
        // סיום השאלות - מעבר לטופס פרטים
        setStep('contact');
      }
      setIsAnimating(false);
    }, 300);
  };

  const handleBack = () => {
    if (questionHistory.length > 1) {
      const newHistory = [...questionHistory];
      newHistory.pop();
      const prevQuestion = newHistory[newHistory.length - 1];
      setCurrentQuestion(prevQuestion);
      setQuestionHistory(newHistory);
      
      // שחזור התשובה הקודמת
      const prevAnswer = answers[prevQuestion.id];
      if (Array.isArray(prevAnswer)) {
        setSelectedOptions(prevAnswer);
      } else if (typeof prevAnswer === 'string' && prevQuestion.type === 'text') {
        setTextAnswer(prevAnswer);
      }
    } else {
      setStep('welcome');
    }
  };

  const toggleOption = (optionId: string) => {
    setSelectedOptions(prev => 
      prev.includes(optionId) 
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  const handleSubmit = async () => {
    if (!leadInfo.name || !leadInfo.phone || !leadInfo.email) {
      alert('נא למלא את כל השדות');
      return;
    }

    setIsSubmitting(true);

    try {
      const lead: Omit<Lead, 'id' | 'createdAt'> = {
        ...leadInfo,
        answers,
        status: 'new',
      };

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead),
      });

      if (res.ok) {
        setStep('success');
      } else {
        throw new Error('Failed to submit');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('אירעה שגיאה, נסו שוב');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercentage = questionHistory.length > 0 
    ? Math.min((questionHistory.length / 5) * 100, 90) // מקסימום 90% עד לטופס
    : 0;

  return (
    <>
      {/* אייקון צף */}
      <div className="fixed bottom-6 left-6 z-50" dir="rtl">
        {/* בועית הודעה */}
        {showBubble && !isOpen && (
          <div 
            className="absolute bottom-full left-0 mb-3 bg-white text-gray-800 px-4 py-3 rounded-2xl shadow-xl animate-bounce-in max-w-[280px]"
            style={{
              animation: 'slideIn 0.5s ease-out',
            }}
          >
            <div className="flex items-start gap-2 text-sm font-medium">
              <Coins className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
              <span>רוצים לדעת כמה עולה? בלי טלפונים!</span>
            </div>
            <div className="absolute bottom-0 left-6 transform translate-y-1/2 rotate-45 w-3 h-3 bg-white"></div>
          </div>
        )}

        {/* כפתור */}
        <button
          onClick={handleOpen}
          className="group relative w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full animate-ping opacity-20"></div>
          <Sparkles className="w-7 h-7 text-white group-hover:rotate-12 transition-transform" />
        </button>
      </div>

      {/* מודל */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          {/* רקע כהה */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"></div>

          {/* תוכן המודל */}
          <div 
            className="relative w-full max-w-lg bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl shadow-2xl overflow-hidden animate-scale-in"
            onClick={e => e.stopPropagation()}
            dir="rtl"
          >
            {/* כפתור סגירה */}
            <button
              onClick={handleClose}
              className="absolute top-4 left-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* פס התקדמות */}
            {step === 'questions' && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-gray-700">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            )}

            {/* תוכן */}
            <div className="p-8">
              {/* מסך פתיחה */}
              {step === 'welcome' && (
                <div className="text-center py-8 animate-fade-in">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="flex items-center justify-center gap-2 text-2xl font-bold text-white mb-3">
                    <PhoneOff className="h-7 w-7 shrink-0 text-emerald-400" aria-hidden />
                    <span>2026, כבר לא מדברים בטלפון</span>
                  </h2>
                  <p className="text-gray-400 mb-2 max-w-sm mx-auto">
                    רוצים לדעת כמה עולה? כמה שאלות קצרות ויש לכם הצעת מחיר.
                  </p>
                  <p className="flex items-center justify-center gap-2 text-emerald-400 text-sm mb-8">
                    <Timer className="h-4 w-4 shrink-0" aria-hidden />
                    <span>זמן ממוצע: 30 שניות</span>
                  </p>
                  <button
                    onClick={startQuestions}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-4 px-8 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center gap-2 mx-auto"
                  >
                    יאללה, בואו נתחיל
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* שאלות */}
              {step === 'questions' && currentQuestion && (
                <div className={`py-4 ${isAnimating ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'} transition-all duration-300`}>
                  <h2 className="text-xl font-bold text-white mb-6 text-center">
                    {currentQuestion.question}
                  </h2>

                  {/* אפשרויות בחירה יחידה */}
                  {currentQuestion.type === 'single-choice' && currentQuestion.options && (
                    <div className="space-y-3">
                      {currentQuestion.options.map(option => (
                        <button
                          key={option.id}
                          onClick={() => handleAnswer(option.id)}
                          className="w-full text-right p-4 bg-gray-800/50 hover:bg-emerald-600/20 border border-gray-700 hover:border-emerald-500 rounded-xl transition-all duration-200 text-white group"
                        >
                          <span className="group-hover:translate-x-1 inline-block transition-transform">
                            {option.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* אפשרויות בחירה מרובה */}
                  {currentQuestion.type === 'multi-choice' && currentQuestion.options && (
                    <div className="space-y-3">
                      {currentQuestion.options.map(option => (
                        <button
                          key={option.id}
                          onClick={() => toggleOption(option.id)}
                          className={`w-full text-right p-4 border rounded-xl transition-all duration-200 text-white ${
                            selectedOptions.includes(option.id)
                              ? 'bg-emerald-600/30 border-emerald-500'
                              : 'bg-gray-800/50 border-gray-700 hover:border-emerald-500'
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <span className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              selectedOptions.includes(option.id) 
                                ? 'bg-emerald-500 border-emerald-500' 
                                : 'border-gray-500'
                            }`}>
                              {selectedOptions.includes(option.id) && (
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                                </svg>
                              )}
                            </span>
                            {option.label}
                          </span>
                        </button>
                      ))}
                      
                      {selectedOptions.length > 0 && (
                        <button
                          onClick={() => handleAnswer()}
                          className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3 px-6 rounded-full transition-all duration-300"
                        >
                          המשך
                        </button>
                      )}
                    </div>
                  )}

                  {/* שדה טקסט */}
                  {currentQuestion.type === 'text' && (
                    <div>
                      <textarea
                        value={textAnswer}
                        onChange={(e) => setTextAnswer(e.target.value)}
                        placeholder="ספרו לנו..."
                        className="w-full h-32 bg-gray-800/50 border border-gray-700 focus:border-emerald-500 rounded-xl p-4 text-white placeholder-gray-500 resize-none outline-none transition-colors"
                      />
                      {textAnswer.trim() && (
                        <button
                          onClick={() => handleAnswer()}
                          className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3 px-6 rounded-full transition-all duration-300"
                        >
                          המשך
                        </button>
                      )}
                    </div>
                  )}

                  {/* כפתור חזרה */}
                  <button
                    onClick={handleBack}
                    className="mt-6 text-gray-400 hover:text-white flex items-center gap-1 mx-auto transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                    חזרה
                  </button>
                </div>
              )}

              {/* טופס פרטים */}
              {step === 'contact' && (
                <div className="py-4 animate-fade-in">
                  <h2 className="flex items-center justify-center gap-2 text-xl font-bold text-white mb-2">
                    <PartyPopper className="h-6 w-6 shrink-0 text-emerald-400" aria-hidden />
                    <span>יופי! עוד שנייה וסיימנו</span>
                  </h2>
                  <p className="text-gray-400 text-center mb-6">
                    לאן לשלוח את הצעת המחיר?
                  </p>

                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="שם מלא *"
                      value={leadInfo.name}
                      onChange={(e) => setLeadInfo({ ...leadInfo, name: e.target.value })}
                      className="w-full bg-gray-800/50 border border-gray-700 focus:border-emerald-500 rounded-xl p-4 text-white placeholder-gray-500 outline-none transition-colors"
                    />
                    <input
                      type="tel"
                      placeholder="טלפון *"
                      value={leadInfo.phone}
                      onChange={(e) => setLeadInfo({ ...leadInfo, phone: e.target.value })}
                      className="w-full bg-gray-800/50 border border-gray-700 focus:border-emerald-500 rounded-xl p-4 text-white placeholder-gray-500 outline-none transition-colors"
                    />
                    <input
                      type="email"
                      placeholder="אימייל *"
                      value={leadInfo.email}
                      onChange={(e) => setLeadInfo({ ...leadInfo, email: e.target.value })}
                      className="w-full bg-gray-800/50 border border-gray-700 focus:border-emerald-500 rounded-xl p-4 text-white placeholder-gray-500 outline-none transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="שם החברה (אופציונלי)"
                      value={leadInfo.company}
                      onChange={(e) => setLeadInfo({ ...leadInfo, company: e.target.value })}
                      className="w-full bg-gray-800/50 border border-gray-700 focus:border-emerald-500 rounded-xl p-4 text-white placeholder-gray-500 outline-none transition-colors"
                    />
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-full transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        שלחו לי הצעת מחיר
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleBack}
                    className="mt-4 text-gray-400 hover:text-white flex items-center gap-1 mx-auto transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                    חזרה
                  </button>
                </div>
              )}

              {/* מסך הצלחה */}
              {step === 'success' && (
                <div className="text-center py-8 animate-fade-in">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="flex items-center justify-center gap-2 text-2xl font-bold text-white mb-3">
                    <Rocket className="h-7 w-7 shrink-0 text-emerald-400" aria-hidden />
                    <span>זהו, סיימנו!</span>
                  </h2>
                  <p className="text-gray-400 mb-8 max-w-sm mx-auto">
                    הצעת מחיר בדרך אליכם. נחזור אליכם ממש בקרוב!
                  </p>
                  <button
                    onClick={handleClose}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-full transition-all duration-300"
                  >
                    מעולה, תודה!
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* סגנונות אנימציה */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-scale-in {
          animation: scaleIn 0.3s ease-out;
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
}

