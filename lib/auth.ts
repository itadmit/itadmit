// אימות פשוט עם session
const ADMIN_EMAIL = 'itadmit@gmail.com';
const ADMIN_PASSWORD = 'aA0542284283';

export function verifyCredentials(email: string, password: string): boolean {
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
}

export function createSession(): string {
  // יצירת session token פשוט
  return Buffer.from(`${ADMIN_EMAIL}:${Date.now()}`).toString('base64');
}

export function verifySession(sessionToken: string): boolean {
  try {
    const decoded = Buffer.from(sessionToken, 'base64').toString();
    return decoded.startsWith(ADMIN_EMAIL);
  } catch {
    return false;
  }
}

