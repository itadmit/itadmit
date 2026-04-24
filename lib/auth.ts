// אימות פשוט עם session — ניתן לעקוף דרך משתני סביבה
const DEFAULT_ADMIN_EMAIL = 'itadmit@gmail.com';
const DEFAULT_ADMIN_PASSWORD = 'aA0542284283';

function getAdminEmail(): string {
  return (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).trim().toLowerCase();
}

function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
}

export function verifyCredentials(email: string, password: string): boolean {
  const e = (email || '').trim().toLowerCase();
  const p = password || '';
  return e === getAdminEmail() && p === getAdminPassword();
}

export function createSession(): string {
  return Buffer.from(`${getAdminEmail()}:${Date.now()}`).toString('base64');
}

export function verifySession(sessionToken: string): boolean {
  try {
    const decoded = Buffer.from(sessionToken, 'base64').toString();
    return decoded.startsWith(getAdminEmail());
  } catch {
    return false;
  }
}
