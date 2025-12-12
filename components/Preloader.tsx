'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let animationFrame: number;
    let startTime = Date.now();
    const minDuration = 2000; // מינימום 2 שניות
    
    // מעקב אחרי טעינת הדף
    const handleLoad = () => {
      setIsLoaded(true);
    };

    // בדיקה אם הדף כבר נטען
    if (document.readyState === 'complete') {
      setIsLoaded(true);
    } else {
      window.addEventListener('load', handleLoad);
    }

    // אנימציה חלקה של האחוזים
    const animate = () => {
      const elapsed = Date.now() - startTime;
      
      if (isLoaded && elapsed >= minDuration) {
        // הדף נטען והזמן המינימלי עבר - סיימנו
        setProgress(100);
        setTimeout(() => {
          onComplete();
          setTimeout(() => {
            setIsComplete(true);
          }, 500);
        }, 300);
      } else {
        // מחשבים את האחוז בהתאם לזמן שעבר
        let calculatedProgress;
        
        if (!isLoaded) {
          // אם הדף עדיין לא נטען, נעצור ב-90%
          calculatedProgress = Math.min(90, (elapsed / minDuration) * 90);
        } else {
          // אם הדף נטען, נמשיך עד 100%
          calculatedProgress = 90 + ((elapsed - minDuration) / 500) * 10;
          calculatedProgress = Math.min(100, calculatedProgress);
        }
        
        setProgress(Math.floor(calculatedProgress));
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('load', handleLoad);
    };
  }, [isLoaded, onComplete]);

  if (isComplete) {
    return null;
  }

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-all duration-700 ${
        progress >= 100 ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ 
        background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)'
      }}
    >
      {/* לוגו */}
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
      
      {/* טקסט */}
      <div className="text-white text-2xl md:text-3xl font-bold mb-8 tracking-wider">
        תדמית אינטראקטיב
      </div>

      {/* Progress Bar */}
      <div className="w-64 md:w-96 h-1 bg-white/10 rounded-full overflow-hidden mb-4">
        <div 
          className="h-full bg-gradient-to-r from-white/60 to-white transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* אחוזים */}
      <div className="text-white text-4xl md:text-5xl font-bold tabular-nums">
        {progress}%
      </div>

      {/* טקסט טעינה */}
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
