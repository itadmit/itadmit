import { getProjects } from '@/lib/projects';
import { ProjectData } from '@/components/ProjectSection';

// קריאת פרויקטים - ב-production קורא מ-JSON, ב-development מ-SQLite
export function getProjectsData(): ProjectData[] {
  return getProjects();
}

