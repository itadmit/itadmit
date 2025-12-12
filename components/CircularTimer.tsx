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
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const hasCalledComplete = useRef(false);

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

  const handleTogglePause = () => {
    setIsPaused(!isPaused);
  };

  const progress = (timeLeft / duration) * 100;
  const seconds = Math.ceil(timeLeft / 1000);
  
  // SVG circle parameters
  const size = 60;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <button
      onClick={handleTogglePause}
      className="fixed bottom-10 right-10 z-50 flex items-center justify-center transition-all hover:scale-110"
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
          <Play className="w-5 h-5 text-white" fill="white" />
        ) : (
          <span className="text-white font-bold text-lg">{seconds}</span>
        )}
      </div>
    </button>
  );
}

