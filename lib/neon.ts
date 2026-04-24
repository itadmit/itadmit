import { neon } from '@neondatabase/serverless';

type SqlFn = ReturnType<typeof neon>;

let sqlInstance: SqlFn | null = null;

export function isNeonEnabled(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

/** לקוח SQL ל-Neon (Serverless). קורא רק כש־DATABASE_URL מוגדר. */
export function getNeon(): SqlFn {
  if (!isNeonEnabled()) {
    throw new Error('DATABASE_URL is not set');
  }
  if (!sqlInstance) {
    sqlInstance = neon(process.env.DATABASE_URL!);
  }
  return sqlInstance;
}
