import { Resend } from 'resend';
import type { Lead, Question } from './quote-wizard';

let cached: Resend | null = null;
function client(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!cached) cached = new Resend(key);
  return cached;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function labelForAnswer(q: Question | undefined, value: string): string {
  if (!q?.options) return value;
  return q.options.find((o) => o.id === value)?.label ?? value;
}

function renderAnswersHtml(
  answers: Record<string, string | string[]>,
  questions: Question[]
): string {
  const rows: string[] = [];
  for (const [key, val] of Object.entries(answers)) {
    const q = questions.find((qq) => qq.id === key);
    const label = q?.question ?? key;
    const formatted = Array.isArray(val)
      ? val.map((v) => labelForAnswer(q, v)).join(', ')
      : labelForAnswer(q, String(val));
    rows.push(
      `<tr><td style="padding:8px 12px;border-bottom:1px solid #eef1f4;color:#54656f;vertical-align:top;white-space:nowrap">${escapeHtml(
        label
      )}</td><td style="padding:8px 12px;border-bottom:1px solid #eef1f4;color:#111b21;font-weight:600">${escapeHtml(
        formatted
      )}</td></tr>`
    );
  }
  if (!rows.length) {
    return '<p style="color:#667781;margin:0">ללא תשובות שאלון.</p>';
  }
  return `<table style="width:100%;border-collapse:collapse;font-family:inherit;font-size:14px;text-align:right" dir="rtl">${rows.join(
    ''
  )}</table>`;
}

function renderAnswersText(
  answers: Record<string, string | string[]>,
  questions: Question[]
): string {
  const out: string[] = [];
  for (const [key, val] of Object.entries(answers)) {
    const q = questions.find((qq) => qq.id === key);
    const label = q?.question ?? key;
    const formatted = Array.isArray(val)
      ? val.map((v) => labelForAnswer(q, v)).join(', ')
      : labelForAnswer(q, String(val));
    out.push(`• ${label}: ${formatted}`);
  }
  return out.join('\n');
}

interface SendNewLeadArgs {
  lead: Lead;
  questions: Question[];
}

export async function sendNewLeadEmail({
  lead,
  questions,
}: SendNewLeadArgs): Promise<void> {
  const resend = client();
  if (!resend) {
    console.warn('[mailer] RESEND_API_KEY missing — skipping email');
    return;
  }

  const to = process.env.LEAD_NOTIFY_EMAIL || 'itadmit@gmail.com';
  const from = process.env.EMAIL_FROM || 'HotelX <hello@hotelx.app>';

  const createdAt = new Date(lead.createdAt);
  const when = createdAt.toLocaleString('he-IL', {
    timeZone: 'Asia/Jerusalem',
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const subject = `🔔 ליד חדש מתדמית אינטראקטיב — ${lead.name}`;

  const phoneDigits = lead.phone.replace(/\D/g, '');
  const waPhone = phoneDigits.startsWith('0')
    ? `972${phoneDigits.slice(1)}`
    : phoneDigits;

  const html = `<!doctype html>
<html lang="he" dir="rtl">
<body style="margin:0;padding:24px 12px;background:#efeae2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#111b21">
  <table role="presentation" align="center" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px -8px rgba(0,0,0,0.15)">
    <tr>
      <td style="background:#008069;color:#ffffff;padding:18px 22px">
        <div style="font-size:13px;opacity:0.85;letter-spacing:0.02em">תדמית אינטראקטיב</div>
        <div style="font-size:20px;font-weight:700;margin-top:2px">🎉 ליד חדש מהצ׳אט</div>
        <div style="font-size:12px;opacity:0.85;margin-top:6px">${escapeHtml(when)}</div>
      </td>
    </tr>
    <tr>
      <td style="padding:20px 22px">
        <div style="font-size:18px;font-weight:700;margin:0 0 14px">${escapeHtml(lead.name)}</div>
        <table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px" dir="rtl">
          <tr>
            <td style="padding:6px 0;color:#54656f;width:90px">טלפון</td>
            <td style="padding:6px 0;font-weight:600"><a href="tel:${escapeHtml(lead.phone)}" style="color:#008069;text-decoration:none">${escapeHtml(lead.phone)}</a></td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#54656f">אימייל</td>
            <td style="padding:6px 0;font-weight:600"><a href="mailto:${escapeHtml(lead.email)}" style="color:#008069;text-decoration:none">${escapeHtml(lead.email)}</a></td>
          </tr>
          ${
            lead.company
              ? `<tr><td style="padding:6px 0;color:#54656f">חברה</td><td style="padding:6px 0;font-weight:600">${escapeHtml(lead.company)}</td></tr>`
              : ''
          }
        </table>

        <div style="margin:20px 0 10px;font-size:13px;font-weight:700;color:#54656f;letter-spacing:0.02em">תשובות מהשאלון</div>
        <div style="border:1px solid #eef1f4;border-radius:10px;overflow:hidden">
          ${renderAnswersHtml(lead.answers, questions)}
        </div>

        <div style="margin-top:22px;display:block">
          <a href="https://wa.me/${escapeHtml(waPhone)}" style="display:inline-block;background:#25d366;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:11px 18px;border-radius:999px;margin-left:8px">שליחת וואטסאפ</a>
          <a href="tel:${escapeHtml(lead.phone)}" style="display:inline-block;background:#008069;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:11px 18px;border-radius:999px;margin-left:8px">חיוג</a>
          <a href="mailto:${escapeHtml(lead.email)}" style="display:inline-block;background:#ffffff;color:#111b21;border:1px solid #dadce0;text-decoration:none;font-weight:600;font-size:14px;padding:10px 18px;border-radius:999px">השב במייל</a>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding:14px 22px;background:#f0f2f5;color:#667781;font-size:11px;text-align:center">
        נשלח אוטומטית מצ׳אט הצעת המחיר באתר itadmit.co.il
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    `ליד חדש מתדמית אינטראקטיב (${when})`,
    '',
    `שם: ${lead.name}`,
    `טלפון: ${lead.phone}`,
    `אימייל: ${lead.email}`,
    lead.company ? `חברה: ${lead.company}` : null,
    '',
    'תשובות מהשאלון:',
    renderAnswersText(lead.answers, questions),
  ]
    .filter(Boolean)
    .join('\n');

  try {
    await resend.emails.send({
      from,
      to: [to],
      subject,
      html,
      text,
      replyTo: lead.email || undefined,
    });
  } catch (err) {
    console.error('[mailer] failed to send lead email', err);
  }
}
