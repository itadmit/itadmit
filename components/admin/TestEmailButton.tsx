'use client';

import { useState } from 'react';
import { Send, Loader2, Check, AlertTriangle } from 'lucide-react';

interface TestResult {
  env: {
    hasApiKey: boolean;
    emailFrom: string;
    leadNotifyEmail: string;
  };
  result: {
    ok: boolean;
    skipped?: string;
    messageId?: string;
    errorName?: string;
    errorMessage?: string;
    to?: string;
    from?: string;
  };
}

export default function TestEmailButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  const runTest = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/admin/test-email', { method: 'POST' });
      const data = (await res.json()) as TestResult;
      setResult(data);
    } catch (err) {
      setResult({
        env: { hasApiKey: false, emailFrom: '—', leadNotifyEmail: '—' },
        result: {
          ok: false,
          errorName: 'NetworkError',
          errorMessage: err instanceof Error ? err.message : String(err),
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex max-w-full flex-col items-end gap-2">
      <button
        type="button"
        onClick={runTest}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_18px_-4px_rgba(16,185,129,0.55)] transition hover:bg-emerald-400 disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        {loading ? 'שולח...' : 'שלח מייל בדיקה'}
      </button>

      {result && (
        <div
          className={`w-full max-w-xl rounded-xl border p-3 text-[12.5px] ${
            result.result.ok
              ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200'
              : 'border-red-400/30 bg-red-500/10 text-red-200'
          }`}
        >
          <div className="flex items-start gap-2">
            {result.result.ok ? (
              <Check className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <div className="min-w-0 flex-1 space-y-1.5">
              {result.result.ok && (
                <>
                  <div className="font-semibold">המייל נשלח בהצלחה 🎉</div>
                  <div className="text-[11.5px] text-white/70">
                    מזהה: {result.result.messageId}
                  </div>
                </>
              )}
              {!result.result.ok && (
                <>
                  <div className="font-semibold">
                    {result.result.skipped
                      ? 'המייל לא נשלח'
                      : `שגיאה: ${result.result.errorName || 'Unknown'}`}
                  </div>
                  <div className="break-words text-[11.5px] text-white/80">
                    {result.result.skipped || result.result.errorMessage}
                  </div>
                </>
              )}
              <div className="mt-1 border-t border-white/10 pt-1.5 text-[11px] text-white/60">
                <div>
                  API Key: {result.env.hasApiKey ? 'מוגדר ✓' : 'לא מוגדר ✗'}
                </div>
                <div>EMAIL_FROM: {result.env.emailFrom}</div>
                <div>LEAD_NOTIFY_EMAIL: {result.env.leadNotifyEmail}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
