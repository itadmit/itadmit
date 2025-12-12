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
      display_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // הוספת עמודת display_order אם לא קיימת (migration)
  try {
    database.exec(`ALTER TABLE projects ADD COLUMN display_order INTEGER DEFAULT 0`);
  } catch (e) {
    // העמודה כבר קיימת, זה בסדר
  }

  // אם הטבלה ריקה, נטען את הנתונים מה-JSON
  const count = database.prepare('SELECT COUNT(*) as count FROM projects').get() as { count: number };
  if (count.count === 0) {
    try {
      const { getProjects: getProjectsJson } = require('./projects');
      const projects = getProjectsJson();
      
      if (projects.length > 0) {
        const insert = database.prepare(`
          INSERT INTO projects 
          (id, title, description, logoSrc, logoWidth, logoHeight, siteUrl, whatsappText, backgroundImage, backgroundImageMobile)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        const transaction = database.transaction((projects: any[]) => {
          for (const project of projects) {
            insert.run(
              project.id,
              project.title,
              project.description,
              project.logoSrc,
              project.logoWidth || null,
              project.logoHeight || null,
              project.siteUrl,
              project.whatsappText || null,
              project.backgroundImage || null,
              project.backgroundImageMobile || null
            );
          }
        });
        
        transaction(projects);
      }
    } catch (error) {
      console.error('Error loading initial data from JSON:', error);
    }
  }
}

// סגירת החיבור
export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}

