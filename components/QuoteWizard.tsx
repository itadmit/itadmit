'use client';

import { useEffect, useRef, useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

interface QuoteWizardProps {
  onOpen?: () => void;
}

/**
 * כפתור צף בסגנון וואטסאפ עם בועית הזמנה ידידותית.
 * לחיצה פותחת את QuoteChatbotModal דרך onOpen.
 */
export default function QuoteWizard({ onOpen }: QuoteWizardProps) {
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleDismissed, setBubbleDismissed] = useState(false);
  const hideRef = useRef<number | null>(null);

  useEffect(() => {
    if (bubbleDismissed) return;
    const show = window.setTimeout(() => setShowBubble(true), 2500);
    const hide = window.setTimeout(() => setShowBubble(false), 15000);
    hideRef.current = hide;
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, [bubbleDismissed]);

  const handleClick = () => {
    setShowBubble(false);
    setBubbleDismissed(true);
    onOpen?.();
  };

  const dismissBubble = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowBubble(false);
    setBubbleDismissed(true);
  };

  return (
    <div className="fixed bottom-5 left-5 z-50 md:bottom-6 md:left-6" dir="rtl">
      {showBubble && (
        <button
          type="button"
          onClick={handleClick}
          className="quote-fab-bubble group absolute bottom-full left-0 mb-3 flex w-max max-w-[min(100vw-2.5rem,320px)] items-center gap-3 rounded-2xl rounded-bl-sm bg-white px-3.5 py-2.5 text-right shadow-[0_8px_28px_-10px_rgba(0,0,0,0.35)] ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-10px_rgba(0,0,0,0.4)]"
          aria-label="פתיחת צ׳אט להצעת מחיר"
        >
          <span className="flex min-w-0 flex-col items-end leading-tight">
            <span className="text-[13px] font-semibold text-[#111b21]">
              רוצים הצעת מחיר?
            </span>
            <span className="text-[12px] font-medium text-[#667781]">
              דברו איתנו בצ׳אט — 30 שניות
            </span>
          </span>
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#128C7E] text-white">
            <MessageCircle className="h-[18px] w-[18px]" aria-hidden />
          </span>
          <span
            onClick={dismissBubble}
            role="button"
            aria-label="סגור"
            tabIndex={0}
            className="absolute -top-2 -left-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#667781] shadow ring-1 ring-black/10 transition hover:text-[#111b21]"
          >
            <X className="h-3 w-3" aria-hidden />
          </span>
          <span className="absolute -bottom-1 left-5 h-3 w-3 rotate-45 bg-white ring-1 ring-black/5" />
        </button>
      )}

      <button
        type="button"
        onClick={handleClick}
        aria-label="פתיחת צ׳אט להצעת מחיר"
        className="quote-fab group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_24px_-6px_rgba(37,211,102,0.55)] transition hover:scale-105 hover:bg-[#20bd5a] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40 md:h-16 md:w-16"
      >
        <span className="pointer-events-none absolute inset-0 rounded-full bg-[#25D366] opacity-60 animate-[qs-ping_2.4s_cubic-bezier(0,0,0.2,1)_infinite]" />
        <MessageCircle className="relative h-7 w-7 transition group-hover:rotate-[-8deg] md:h-8 md:w-8" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff3b30] text-[10px] font-bold text-white ring-2 ring-white">
          1
        </span>
      </button>

      <style jsx>{`
        @keyframes qs-ping {
          0% { transform: scale(1); opacity: 0.55; }
          80%, 100% { transform: scale(1.9); opacity: 0; }
        }
        .quote-fab-bubble {
          animation: qs-slide-in 360ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes qs-slide-in {
          from { opacity: 0; transform: translateY(8px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
