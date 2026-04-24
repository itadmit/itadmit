import { getDb } from './db';
import { ensureNeonSchema } from './ensure-neon-schema';
import { getNeon, isNeonEnabled } from './neon';
import fs from 'fs';
import path from 'path';

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

const SETTINGS_PATH = path.join(process.cwd(), 'data', 'site-settings.json');

function readJsonSettings(): SiteSettings {
  try {
    if (!fs.existsSync(SETTINGS_PATH)) return { ...SITE_SETTINGS_DEFAULTS };
    const raw = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8')) as Partial<SiteSettings>;
    return mergeWithDefaults(raw);
  } catch {
    return { ...SITE_SETTINGS_DEFAULTS };
  }
}

function mergeWithDefaults(raw: Partial<SiteSettings>): SiteSettings {
  const base = { ...SITE_SETTINGS_DEFAULTS, ...raw };
  return {
    moreProjectsBackground: base.moreProjectsBackground,
    moreProjectsBackgroundMobile:
      base.moreProjectsBackgroundMobile || base.moreProjectsBackground,
    contactBackground: base.contactBackground,
    contactBackgroundMobile:
      base.contactBackgroundMobile || base.contactBackground,
  };
}

function writeJsonSettings(settings: SiteSettings): void {
  const dir = path.dirname(SETTINGS_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2), 'utf8');
}

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

/** קריאה מאוחדת: Neon → SQLite → JSON */
export async function getSiteSettings(): Promise<SiteSettings> {
  if (isNeonEnabled()) {
    await ensureNeonSchema();
    const sql = getNeon();
    const rows = (await sql`SELECT key, value FROM site_settings`) as {
      key: string;
      value: string;
    }[];
    if (rows.length === 0) return { ...SITE_SETTINGS_DEFAULTS };
    return rowsToSiteSettings(rows);
  }

  const db = getDb();
  if (db) {
    try {
      const rows = db
        .prepare(`SELECT key, value FROM site_settings`)
        .all() as { key: string; value: string }[];
      return rowsToSiteSettings(rows);
    } catch {
      return readJsonSettings();
    }
  }

  return readJsonSettings();
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

  if (isNeonEnabled()) {
    await ensureNeonSchema();
    const sql = getNeon();
    const pairs: [string, string][] = [
      ['more_projects_background', next.moreProjectsBackground],
      [
        'more_projects_background_mobile',
        next.moreProjectsBackgroundMobile,
      ],
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

  const db = getDb();
  if (db) {
    const upsert = db.prepare(
      `INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)`
    );
    upsert.run('more_projects_background', next.moreProjectsBackground);
    upsert.run(
      'more_projects_background_mobile',
      next.moreProjectsBackgroundMobile
    );
    upsert.run('contact_background', next.contactBackground);
    upsert.run('contact_background_mobile', next.contactBackgroundMobile);
  } else {
    writeJsonSettings(next);
  }

  return next;
}
