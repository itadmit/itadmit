import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// נתיב למסד הנתונים - רק לוקאלית
const dbPath = path.join(process.cwd(), 'data', 'projects.db');

// יצירת התיקייה אם לא קיימת
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let db: Database.Database | null = null;

// פונקציה לקבלת instance של DB (רק לוקאלית)
export function getDb(): Database.Database | null {
  // ב-Vercel (production) - נחזיר null כי SQLite לא עובד שם
  if (process.env.VERCEL) {
    return null;
  }

  if (!db) {
    db = new Database(dbPath);
    initDb(db);
  }

  return db;
}

// אתחול הטבלה
function initDb(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      logoSrc TEXT NOT NULL,
      logoWidth INTEGER,
      logoHeight INTEGER,
      siteUrl TEXT NOT NULL,
      whatsappText TEXT,
      backgroundImage TEXT,
      backgroundImageMobile TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

// סגירת החיבור
export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}

