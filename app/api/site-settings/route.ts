import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';
import { getSiteSettings, updateSiteSettings, type SiteSettings } from '@/lib/site-settings';

export async function GET() {
  try {
    const settings = getSiteSettings();
    return NextResponse.json(settings, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('site-settings GET:', error);
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin_session')?.value;
    if (!sessionToken || !verifySession(sessionToken)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as Partial<SiteSettings>;
    const updated = updateSiteSettings({
      moreProjectsBackground: body.moreProjectsBackground,
      moreProjectsBackgroundMobile: body.moreProjectsBackgroundMobile,
      contactBackground: body.contactBackground,
      contactBackgroundMobile: body.contactBackgroundMobile,
    });

    return NextResponse.json({ success: true, ...updated });
  } catch (error) {
    console.error('site-settings PUT:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
