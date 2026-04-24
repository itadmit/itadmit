type GtagArgs =
  | ['js', Date]
  | ['config', string, Record<string, unknown>?]
  | ['event', string, Record<string, unknown>?];

declare global {
  interface Window {
    gtag?: (...args: GtagArgs) => void;
    dataLayer?: unknown[];
  }
}

export function gaEvent(
  action: string,
  params: Record<string, unknown> = {}
): void {
  if (typeof window === 'undefined') return;
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', action, params);
}

export const GA_EVENTS = {
  chatOpen: 'quote_chat_open',
  chatStart: 'quote_chat_start',
  leadSubmit: 'generate_lead',
  whatsappClick: 'whatsapp_continue_click',
  callClick: 'call_click',
} as const;
