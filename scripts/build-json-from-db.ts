import { saveProjects } from '../lib/projects';
import { getProjects } from '../lib/projects-db';

/**
 * לפני build: מייצא פרויקטים ל-data/projects.json
 * — מ-Neon אם מוגדר DATABASE_URL
 * — אחרת מ-SQLite / JSON לפי projects-db
 */
async function buildJsonFromDb() {
  console.log('🔄 Building projects.json...');

  try {
    const projects = await getProjects();

    if (projects.length === 0) {
      console.log('⚠️  No projects found. Using existing JSON file.');
      return;
    }

    saveProjects(projects);
    console.log(`✅ Successfully exported ${projects.length} projects to JSON`);
  } catch (error) {
    console.error('❌ Error building JSON:', error);
    process.exit(1);
  }
}

buildJsonFromDb();
