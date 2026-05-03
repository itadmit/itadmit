'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

type ToastVariant = 'success' | 'error';
type ToastItem = { id: number; message: string; variant: ToastVariant };

let counter = 0;
let items: ToastItem[] = [];
const subscribers = new Set<(next: ToastItem[]) => void>();

function emit(): void {
  for (const sub of subscribers) sub(items);
}

function dismiss(id: number): void {
  items = items.filter((t) => t.id !== id);
  emit();
}

function show(message: string, variant: ToastVariant): void {
  const id = ++counter;
  items = [...items, { id, message, variant }];
  emit();
  window.setTimeout(() => dismiss(id), 3500);
}

export const toast = {
  success: (message: string) => show(message, 'success'),
  error: (message: string) => show(message, 'error'),
};

export default function Toaster() {
  const [list, setList] = useState<ToastItem[]>([]);

  useEffect(() => {
    const sub = (next: ToastItem[]) => setList(next);
    subscribers.add(sub);
    sub(items);
    return () => {
      subscribers.delete(sub);
    };
  }, []);

  if (list.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed top-6 left-1/2 z-[9999] flex w-full max-w-md -translate-x-1/2 flex-col gap-2 px-4"
      dir="rtl"
    >
      {list.map((t) => (
        <div
          key={t.id}
          role={t.variant === 'error' ? 'alert' : 'status'}
          className={`toast-enter pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.55)] backdrop-blur-md ${
            t.variant === 'success'
              ? 'border-emerald-400/25 bg-emerald-950/85 text-emerald-50'
              : 'border-rose-400/25 bg-rose-950/85 text-rose-50'
          }`}
        >
          {t.variant === 'success' ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
          )}
          <div className="min-w-0 flex-1 text-sm leading-relaxed">{t.message}</div>
          <button
            onClick={() => dismiss(t.id)}
            className="shrink-0 rounded-md p-1 text-white/60 transition hover:bg-white/10 hover:text-white"
            aria-label="סגור"
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
