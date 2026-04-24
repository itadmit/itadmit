import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';
import { sendTestEmail } from '@/lib/mailer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;
  if (!sessionToken || !verifySession(sessionToken)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const env = {
    hasApiKey: Boolean(process.env.RESEND_API_KEY),
    emailFrom: process.env.EMAIL_FROM || '(default) HotelX <hello@hotelx.app>',
    leadNotifyEmail: process.env.LEAD_NOTIFY_EMAIL || '(default) itadmit@gmail.com',
  };

  const result = await sendTestEmail();

  return NextResponse.json({ env, result });
}
