// ממשק לפרויקט
export interface ProjectData {
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
  isLast?: boolean;
  created_at?: string;
  updated_at?: string;
}

// פונקציות אלו נועדו לשימוש בצד השרת בלבד (API routes ו-build scripts)
// הן מייבאות את fs רק כאשר הן נקראות, לא בזמן הייבוא של המודול

export function getProjects(): ProjectData[] {
  // ייבוא דינמי של fs רק בזמן ריצה
  const fs = require('fs');
  const path = require('path');
  
  try {
    const projectsFilePath = path.join(process.cwd(), 'data', 'projects.json');
    const fileContents = fs.readFileSync(projectsFilePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    // אם הקובץ לא קיים, נחזיר מערך ריק
    return [];
  }
}

export function saveProjects(projects: ProjectData[]): void {
  const fs = require('fs');
  const path = require('path');
  
  const projectsFilePath = path.join(process.cwd(), 'data', 'projects.json');
  
  // וודא שהתיקייה קיימת
  const dataDir = path.dirname(projectsFilePath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  fs.writeFileSync(projectsFilePath, JSON.stringify(projects, null, 2), 'utf8');
}

export function addProject(project: ProjectData): void {
  const projects = getProjects();
  projects.push(project);
  saveProjects(projects);
}

export function updateProject(id: string, updatedProject: Partial<ProjectData>): void {
  const projects = getProjects();
  const index = projects.findIndex(p => p.id === id);
  
  if (index !== -1) {
    projects[index] = { ...projects[index], ...updatedProject };
    saveProjects(projects);
  }
}

export function deleteProject(id: string): void {
  const projects = getProjects();
  const filtered = projects.filter(p => p.id !== id);
  saveProjects(filtered);
}

export function duplicateProject(id: string): ProjectData | null {
  const projects = getProjects();
  const project = projects.find(p => p.id === id);
  
  if (!project) return null;
  
  const duplicated: ProjectData = {
    ...project,
    id: `${project.id}-copy-${Date.now()}`,
    title: `${project.title} (עותק)`,
  };
  
  projects.push(duplicated);
  saveProjects(projects);
  
  return duplicated;
}

