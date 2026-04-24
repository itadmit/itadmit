'use client';

import { useState, useEffect, useRef } from 'react';
import { Pause, Play } from 'lucide-react';

interface CircularTimerProps {
  duration?: number; // במילישניות
  onComplete?: () => void;
  resetKey?: number | string; // Key to reset timer
}

export default function CircularTimer({ duration = 4000, onComplete, resetKey }: CircularTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const hasCalledComplete = useRef(false);

  useEffect(() => {
    const check = () => setIsMobile(window.matchMedia('(max-width: 767px)').matches);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Reset timer when resetKey changes
  useEffect(() => {
    // Clean up any running interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Reset everything
    setTimeLeft(duration);
    setIsPaused(false);
    hasCalledComplete.current = false;
    startTimeRef.current = Date.now();
  }, [resetKey, duration]);

  useEffect(() => {
    // Clean up existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isPaused || timeLeft <= 0) {
      return;
    }

    // Start timer
    startTimeRef.current = Date.now();
    const startingTime = timeLeft;

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const newTimeLeft = Math.max(0, startingTime - elapsed);
      
      setTimeLeft(newTimeLeft);

      if (newTimeLeft <= 0) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        if (onComplete && !hasCalledComplete.current) {
          hasCalledComplete.current = true;
          onComplete();
        }
      }
    }, 16); // 60fps

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPaused, timeLeft, resetKey, onComplete]);

  // גלילה עם גלגלת העכבר — השהיית הטיימר עד לחיצה להמשך
  useEffect(() => {
    const onWheel = () => {
      setIsPaused(true);
    };
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => window.removeEventListener('wheel', onWheel);
  }, []);

  const handleTogglePause = () => {
    setIsPaused(!isPaused);
  };

  const progress = (timeLeft / duration) * 100;
  const seconds = Math.ceil(timeLeft / 1000);
  
  // SVG circle parameters
  const size = isMobile ? 40 : 60;
  const strokeWidth = isMobile ? 3 : 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <button
      onClick={handleTogglePause}
      className="fixed bottom-4 right-4 z-50 flex items-center justify-center transition-all hover:scale-110 md:bottom-10 md:right-10"
      aria-label={isPaused ? 'Play' : 'Pause'}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="white"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: isPaused ? 'none' : 'stroke-dashoffset 0.016s linear'
          }}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {isPaused ? (
          <Play className="h-3.5 w-3.5 text-white md:h-5 md:w-5" fill="white" />
        ) : (
          <span className="text-[12px] font-bold text-white md:text-lg">{seconds}</span>
        )}
      </div>
    </button>
  );
}

