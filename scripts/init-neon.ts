/**
 * יוצר טבלאות ב-Neon ומזרים מ-data/*.json (אם קיימים).
 *
 * הרצה מהשורש:
 *   DATABASE_URL="postgresql://..." npx tsx scripts/init-neon.ts
 *
 * אפשר גם להריץ ידנית את scripts/neon-schema.sql ב-SQL Editor של Neon.
 */
import fs from 'fs';
import path from 'path';
import { neon } from '@neondatabase/serverless';

async function main() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    console.error('❌ הגדר משתנה סביבה DATABASE_URL');
    process.exit(1);
  }

  const sql = neon(url);

  console.log('🔄 יוצר טבלאות (אם עדיין לא קיימות)...');

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

  const dataDir = path.join(process.cwd(), 'data');

  const projectsPath = path.join(dataDir, 'projects.json');
  if (fs.existsSync(projectsPath)) {
    const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf8')) as Array<{
      id: string;
      title: string;
      description: string;
      logoSrc: string;
      logoWidth?: number;
      logoHeight?: number;
      siteUrl: string;
      whatsappText?: string;
      backgroundImage?: string;
      backgroundImageMobile?: string;
      display_order?: number;
    }>;
    console.log(`🔄 מזרים ${projects.length} פרויקטים...`);
    for (const p of projects) {
      await sql`
        INSERT INTO projects (
          id, title, description, logo_src, logo_width, logo_height,
          site_url, whatsapp_text, background_image, background_image_mobile, display_order
        ) VALUES (
          ${p.id}, ${p.title}, ${p.description}, ${p.logoSrc},
          ${p.logoWidth ?? null}, ${p.logoHeight ?? null},
          ${p.siteUrl}, ${p.whatsappText ?? null},
          ${p.backgroundImage ?? null}, ${p.backgroundImageMobile ?? null},
          ${p.display_order ?? null}
        )
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          logo_src = EXCLUDED.logo_src,
          logo_width = EXCLUDED.logo_width,
          logo_height = EXCLUDED.logo_height,
          site_url = EXCLUDED.site_url,
          whatsapp_text = EXCLUDED.whatsapp_text,
          background_image = EXCLUDED.background_image,
          background_image_mobile = EXCLUDED.background_image_mobile,
          display_order = EXCLUDED.display_order,
          updated_at = now()
      `;
    }
    console.log('✅ פרויקטים');
  }

  const sitePath = path.join(dataDir, 'site-settings.json');
  if (fs.existsSync(sitePath)) {
    const s = JSON.parse(fs.readFileSync(sitePath, 'utf8')) as Record<string, string>;
    const pairs: [string, string][] = [
      ['more_projects_background', s.moreProjectsBackground || '/images/bg/bg-contact.jpg'],
      [
        'more_projects_background_mobile',
        s.moreProjectsBackgroundMobile ||
          s.moreProjectsBackground ||
          '/images/bg/bg-contact.jpg',
      ],
      ['contact_background', s.contactBackground || '/images/bg/bg-contact-2.jpg'],
      [
        'contact_background_mobile',
        s.contactBackgroundMobile ||
          s.contactBackground ||
          '/images/bg/bg-contact-2.jpg',
      ],
    ];
    for (const [key, value] of pairs) {
      await sql`
        INSERT INTO site_settings (key, value) VALUES (${key}, ${value})
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
      `;
    }
    console.log('✅ הגדרות אתר');
  }

  const leadsPath = path.join(dataDir, 'leads.json');
  if (fs.existsSync(leadsPath)) {
    const leads = JSON.parse(fs.readFileSync(leadsPath, 'utf8')) as Array<{
      id: string;
      name: string;
      phone: string;
      email: string;
      company?: string;
      answers: Record<string, string | string[]>;
      estimatedPrice?: number;
      status: string;
      createdAt: string;
      notes?: string;
    }>;
    for (const l of leads) {
      const aj = JSON.stringify(l.answers);
      await sql`
        INSERT INTO leads (id, name, phone, email, company, answers, estimated_price, status, created_at, notes)
        VALUES (
          ${l.id}, ${l.name}, ${l.phone}, ${l.email}, ${l.company ?? ''},
          ${aj}, ${l.estimatedPrice ?? null}, ${l.status}, ${l.createdAt}, ${l.notes ?? ''}
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          phone = EXCLUDED.phone,
          email = EXCLUDED.email,
          company = EXCLUDED.company,
          answers = EXCLUDED.answers,
          estimated_price = EXCLUDED.estimated_price,
          status = EXCLUDED.status,
          notes = EXCLUDED.notes
      `;
    }
    console.log(`✅ ${leads.length} לידים`);
  }

  const qPath = path.join(dataDir, 'questions.json');
  if (fs.existsSync(qPath)) {
    const questions = JSON.parse(fs.readFileSync(qPath, 'utf8')) as Array<
      Record<string, unknown> & { id: string }
    >;
    await sql`DELETE FROM wizard_questions`;
    for (const q of questions) {
      const id = String(q.id);
      const payload = JSON.stringify(q);
      await sql`
        INSERT INTO wizard_questions (id, payload) VALUES (${id}, ${payload})
      `;
    }
    console.log(`✅ ${questions.length} שאלות`);
  }

  console.log('🎉 סיימנו.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
