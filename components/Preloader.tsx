'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    let animationFrame = 0;
    let cancelled = false;
    /** לא מאפסים כש־load מסתיים — כדי שלא יהיה קפיצה אחורה באחוזים */
    const startTime = Date.now();
    const minDuration = 2000;
    const rampTo100Ms = 500;

    const isLoadedRef = { current: document.readyState === 'complete' };
    const handleLoad = () => {
      isLoadedRef.current = true;
    };
    window.addEventListener('load', handleLoad);

    const animate = () => {
      if (cancelled) return;
      const elapsed = Date.now() - startTime;

      if (isLoadedRef.current && elapsed >= minDuration) {
        setProgress(100);
        window.setTimeout(() => {
          if (cancelled) return;
          onCompleteRef.current();
          window.setTimeout(() => {
            if (!cancelled) setIsComplete(true);
          }, 500);
        }, 300);
        return;
      }

      let calculatedProgress: number;
      if (!isLoadedRef.current) {
        calculatedProgress = Math.min(90, (elapsed / minDuration) * 90);
      } else if (elapsed < minDuration) {
        // הדף כבר נטען אבל עדיין לא עבר זמן מינימלי — ממשיכים את אותה עקומה 0→90 בלי קפיצה
        calculatedProgress = Math.min(90, (elapsed / minDuration) * 90);
      } else {
        calculatedProgress =
          90 + Math.min(10, ((elapsed - minDuration) / rampTo100Ms) * 10);
        calculatedProgress = Math.min(100, calculatedProgress);
      }

      setProgress(Math.floor(calculatedProgress));
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelled = true;
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  if (isComplete) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-all duration-700 ${
        progress >= 100 ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
      }}
    >
      <div className="mb-8 animate-pulse">
        <Image
          src="/images/tadmit-logo.png"
          alt="תדמית אינטראקטיב"
          width={120}
          height={120}
          priority
          className="drop-shadow-2xl"
        />
      </div>

      <div className="text-white text-2xl md:text-3xl font-bold mb-8 tracking-wider">
        תדמית אינטראקטיב
      </div>

      <div className="w-64 md:w-96 h-1 bg-white/10 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-white/60 to-white transition-all duration-150 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="text-white text-4xl md:text-5xl font-bold tabular-nums">
        {progress}%
      </div>

      <div className="text-white/60 text-sm md:text-base mt-4 tracking-wide">
        {progress < 30 && 'מכין את החוויה שלך...'}
        {progress >= 30 && progress < 60 && 'טוען תוכן...'}
        {progress >= 60 && progress < 90 && 'כמעט מוכן...'}
        {progress >= 90 && progress < 100 && 'סיימנו!'}
        {progress >= 100 && 'נכנסים...'}
      </div>
    </div>
  );
}
