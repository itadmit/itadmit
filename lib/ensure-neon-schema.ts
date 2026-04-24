import { getNeon, isNeonEnabled } from './neon';

let schemaReady: Promise<void> | null = null;

/**
 * יוצר טבלאות ב-Neon אם חסרות (פעם אחת לכל תהליך Node).
 * פותר relation "site_settings" does not exist בלי להריץ ידנית db:init-neon.
 */
export async function ensureNeonSchema(): Promise<void> {
  if (!isNeonEnabled()) return;
  if (!schemaReady) {
    schemaReady = (async () => {
      const sql = getNeon();

      await sql`
        CREATE TABLE IF NOT EXISTS projects (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          logo_src TEXT NOT NULL,
          logo_width INTEGER,
          logo_height INTEGER,
          site_url TEXT NOT NULL,
          whatsapp_text TEXT,
          background_image TEXT,
          background_image_mobile TEXT,
          display_order INTEGER,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS site_settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS leads (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          phone TEXT NOT NULL,
          email TEXT NOT NULL,
          company TEXT NOT NULL DEFAULT '',
          answers JSONB NOT NULL DEFAULT '{}'::jsonb,
          estimated_price INTEGER,
          status TEXT NOT NULL DEFAULT 'new',
          created_at TIMESTAMPTZ NOT NULL,
          notes TEXT NOT NULL DEFAULT ''
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS wizard_questions (
          id TEXT PRIMARY KEY,
          payload JSONB NOT NULL
        )
      `;
    })();
  }
  return schemaReady;
}
