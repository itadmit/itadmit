import { getDb } from './db';
import { ProjectData } from './projects';
import { getProjects as getProjectsJson, saveProjects } from './projects';

// קריאת פרויקטים - מנסה SQLite, אם לא עובד חוזר ל-JSON
export function getProjects(): ProjectData[] {
  const db = getDb();
  
  if (db) {
    // SQLite זמין (לוקאלי)
    const projects = db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all() as ProjectData[];
    return projects;
  } else {
    // Vercel production - קורא מ-JSON
    return getProjectsJson();
  }
}

// שמירת פרויקטים
export function saveProjectsToDb(projects: ProjectData[]): void {
  const db = getDb();
  
  if (db) {
    // SQLite זמין (לוקאלי)
    const insert = db.prepare(`
      INSERT OR REPLACE INTO projects 
      (id, title, description, logoSrc, logoWidth, logoHeight, siteUrl, whatsappText, backgroundImage, backgroundImageMobile, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    
    const transaction = db.transaction((projects: ProjectData[]) => {
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
  } else {
    // Vercel production - שומר ל-JSON
    saveProjects(projects);
  }
}

// הוספת פרויקט
export function addProject(project: ProjectData): void {
  const projects = getProjects();
  projects.push(project);
  saveProjectsToDb(projects);
}

// עדכון פרויקט
export function updateProject(id: string, updatedProject: Partial<ProjectData>): void {
  const db = getDb();
  
  if (db) {
    // SQLite
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as ProjectData | undefined;
    if (project) {
      const merged = { ...project, ...updatedProject };
      db.prepare(`
        UPDATE projects SET
          title = ?, description = ?, logoSrc = ?, logoWidth = ?, logoHeight = ?,
          siteUrl = ?, whatsappText = ?, backgroundImage = ?, backgroundImageMobile = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        merged.title,
        merged.description,
        merged.logoSrc,
        merged.logoWidth || null,
        merged.logoHeight || null,
        merged.siteUrl,
        merged.whatsappText || null,
        merged.backgroundImage || null,
        merged.backgroundImageMobile || null,
        id
      );
    }
  } else {
    // JSON fallback
    const projects = getProjects();
    const index = projects.findIndex(p => p.id === id);
    if (index !== -1) {
      projects[index] = { ...projects[index], ...updatedProject };
      saveProjectsToDb(projects);
    }
  }
}

// מחיקת פרויקט
export function deleteProject(id: string): void {
  const db = getDb();
  
  if (db) {
    // SQLite
    db.prepare('DELETE FROM projects WHERE id = ?').run(id);
  } else {
    // JSON fallback
    const projects = getProjects();
    const filtered = projects.filter(p => p.id !== id);
    saveProjectsToDb(filtered);
  }
}

// שכפול פרויקט
export function duplicateProject(id: string): ProjectData | null {
  const projects = getProjects();
  const project = projects.find(p => p.id === id);
  
  if (!project) return null;
  
  const duplicated: ProjectData = {
    ...project,
    id: `${project.id}-copy-${Date.now()}`,
    title: `${project.title} (עותק)`,
  };
  
  addProject(duplicated);
  return duplicated;
}

