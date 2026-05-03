import { ensureNeonSchema } from './ensure-neon-schema';
import { getNeon } from './neon';

export interface SiteSettings {
  moreProjectsBackground: string;
  moreProjectsBackgroundMobile: string;
  contactBackground: string;
  contactBackgroundMobile: string;
}

export const SITE_SETTINGS_DEFAULTS: SiteSettings = {
  moreProjectsBackground: '/images/bg/bg-contact.jpg',
  moreProjectsBackgroundMobile: '/images/bg/bg-contact.jpg',
  contactBackground: '/images/bg/bg-contact-2.jpg',
  contactBackgroundMobile: '/images/bg/bg-contact-2.jpg',
};

function rowsToSiteSettings(
  rows: { key: string; value: string }[]
): SiteSettings {
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const more =
    map.more_projects_background ?? SITE_SETTINGS_DEFAULTS.moreProjectsBackground;
  const contact =
    map.contact_background ?? SITE_SETTINGS_DEFAULTS.contactBackground;
  return {
    moreProjectsBackground: more,
    moreProjectsBackgroundMobile:
      map.more_projects_background_mobile || more,
    contactBackground: contact,
    contactBackgroundMobile: map.contact_background_mobile || contact,
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  await ensureNeonSchema();
  const sql = getNeon();
  const rows = (await sql`SELECT key, value FROM site_settings`) as {
    key: string;
    value: string;
  }[];
  if (rows.length === 0) return { ...SITE_SETTINGS_DEFAULTS };
  return rowsToSiteSettings(rows);
}

export async function updateSiteSettings(
  partial: Partial<SiteSettings>
): Promise<SiteSettings> {
  const current = await getSiteSettings();
  const next: SiteSettings = {
    moreProjectsBackground:
      typeof partial.moreProjectsBackground === 'string'
        ? partial.moreProjectsBackground
        : current.moreProjectsBackground,
    moreProjectsBackgroundMobile:
      typeof partial.moreProjectsBackgroundMobile === 'string'
        ? partial.moreProjectsBackgroundMobile
        : current.moreProjectsBackgroundMobile,
    contactBackground:
      typeof partial.contactBackground === 'string'
        ? partial.contactBackground
        : current.contactBackground,
    contactBackgroundMobile:
      typeof partial.contactBackgroundMobile === 'string'
        ? partial.contactBackgroundMobile
        : current.contactBackgroundMobile,
  };

  const sql = getNeon();
  const pairs: [string, string][] = [
    ['more_projects_background', next.moreProjectsBackground],
    ['more_projects_background_mobile', next.moreProjectsBackgroundMobile],
    ['contact_background', next.contactBackground],
    ['contact_background_mobile', next.contactBackgroundMobile],
  ];
  for (const [key, value] of pairs) {
    await sql`
      INSERT INTO site_settings (key, value) VALUES (${key}, ${value})
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `;
  }
  return next;
}
