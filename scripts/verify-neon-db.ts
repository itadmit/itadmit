/**
 * בודק ש-Neon זמין: סכימה, טבלאות, וספירות שורות.
 * הרצה: npx tsx scripts/verify-neon-db.ts
 */
import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { ensureNeonSchema } from '../lib/ensure-neon-schema';
import { isNeonEnabled } from '../lib/neon';

async function main() {
  if (!isNeonEnabled()) {
    console.log('ℹ️  אין DATABASE_URL — מדלגים על בדיקת Neon.');
    process.exit(0);
  }

  console.log('🔄 יוצרים סכימה אם חסרה...');
  await ensureNeonSchema();

  const sql = neon(process.env.DATABASE_URL!);

  const tables = (await sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `) as { table_name: string }[];

  const names = new Set(tables.map((t) => t.table_name));
  const required = ['projects', 'site_settings', 'leads', 'wizard_questions'];
  const missing = required.filter((n) => !names.has(n));

  if (missing.length) {
    console.error('❌ טבלאות חסרות:', missing.join(', '));
    process.exit(1);
  }

  console.log('✅ טבלאות:', required.join(', '));

  const [pc] = (await sql`SELECT count(*)::int AS c FROM projects`) as { c: number }[];
  const [sc] = (await sql`SELECT count(*)::int AS c FROM site_settings`) as { c: number }[];
  const [lc] = (await sql`SELECT count(*)::int AS c FROM leads`) as { c: number }[];
  const [qc] = (await sql`SELECT count(*)::int AS c FROM wizard_questions`) as { c: number }[];

  console.log('📊 ספירות:');
  console.log(`   projects:          ${pc.c}`);
  console.log(`   site_settings:     ${sc.c}`);
  console.log(`   leads:             ${lc.c}`);
  console.log(`   wizard_questions:  ${qc.c}`);

  if (pc.c === 0) {
    console.log('');
    console.log(
      '⚠️  אין פרויקטים ב-Neon. להזרמה מהקבצים המקומיים: npm run db:init-neon'
    );
  }

  console.log('');
  console.log('🎉 מסד הנתונים ב-Neon תקין.');
}

main().catch((e) => {
  console.error('❌ שגיאה:', e);
  process.exit(1);
});
