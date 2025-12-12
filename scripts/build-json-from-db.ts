import { getDb } from '../lib/db';
import { saveProjects } from '../lib/projects';
import { getProjects } from '../lib/projects-db';
import path from 'path';
import fs from 'fs';

// Script לבניית JSON מה-SQLite לפני build ב-Vercel
async function buildJsonFromDb() {
  console.log('🔄 Building JSON from SQLite database...');
  
  try {
    const projects = getProjects();
    
    if (projects.length === 0) {
      console.log('⚠️  No projects found. Using existing JSON file.');
      return;
    }
    
    // שמירה ל-JSON
    saveProjects(projects);
    
    console.log(`✅ Successfully exported ${projects.length} projects to JSON`);
  } catch (error) {
    console.error('❌ Error building JSON:', error);
    process.exit(1);
  }
}

buildJsonFromDb();

