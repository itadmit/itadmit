import { getDb } from './db';
import { getNeon, isNeonEnabled } from './neon';
import { ProjectData } from './projects';
import { getProjects as getProjectsJson, saveProjects } from './projects';

type ProjectRow = {
  id: string;
  title: string;
  description: string;
  logo_src: string;
  logo_width: number | null;
  logo_height: number | null;
  site_url: string;
  whatsapp_text: string | null;
  background_image: string | null;
  background_image_mobile: string | null;
  display_order: number | null;
  created_at: string | null;
  updated_at: string | null;
};

function rowToProject(r: ProjectRow): ProjectData {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    logoSrc: r.logo_src,
    logoWidth: r.logo_width ?? undefined,
    logoHeight: r.logo_height ?? undefined,
    siteUrl: r.site_url,
    whatsappText: r.whatsapp_text ?? undefined,
    backgroundImage: r.background_image ?? undefined,
    backgroundImageMobile: r.background_image_mobile ?? undefined,
    display_order: r.display_order ?? undefined,
    created_at: r.created_at ?? undefined,
    updated_at: r.updated_at ?? undefined,
  };
}

function projectToRow(p: ProjectData): ProjectRow {
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    logo_src: p.logoSrc,
    logo_width: p.logoWidth ?? null,
    logo_height: p.logoHeight ?? null,
    site_url: p.siteUrl,
    whatsapp_text: p.whatsappText ?? null,
    background_image: p.backgroundImage ?? null,
    background_image_mobile: p.backgroundImageMobile ?? null,
    display_order: p.display_order ?? null,
    created_at: null,
    updated_at: null,
  };
}

/** לאחר SQLite בלבד — לשמר projects.json */
function syncJsonAfterSqliteWrite(): void {
  const db = getDb();
  if (!db) return;
  const rows = db
    .prepare(
      `SELECT * FROM projects ORDER BY COALESCE(display_order, 999999) ASC, id ASC`
    )
    .all() as ProjectData[];
  saveProjects(rows);
}

export async function getProjects(): Promise<ProjectData[]> {
  if (isNeonEnabled()) {
    const sql = getNeon();
    const rows = (await sql`
      SELECT * FROM projects
      ORDER BY COALESCE(display_order, 999999) ASC, id ASC
    `) as ProjectRow[];
    return rows.map(rowToProject);
  }

  const db = getDb();
  if (db) {
    const projects = db
      .prepare(
        `SELECT * FROM projects ORDER BY COALESCE(display_order, 999999) ASC, id ASC`
      )
      .all() as ProjectData[];
    return projects;
  }

  const projects = getProjectsJson();
  return [...projects].sort((a, b) => {
    const oa = a.display_order ?? 999999;
    const ob = b.display_order ?? 999999;
    if (oa !== ob) return oa - ob;
    return String(a.id).localeCompare(String(b.id));
  });
}

export async function saveProjectsToDb(projects: ProjectData[]): Promise<void> {
  if (isNeonEnabled()) {
    const sql = getNeon();
    for (const p of projects) {
      const r = projectToRow(p);
      await sql`
        INSERT INTO projects (
          id, title, description, logo_src, logo_width, logo_height,
          site_url, whatsapp_text, background_image, background_image_mobile, display_order
        ) VALUES (
          ${r.id}, ${r.title}, ${r.description}, ${r.logo_src}, ${r.logo_width}, ${r.logo_height},
          ${r.site_url}, ${r.whatsapp_text}, ${r.background_image}, ${r.background_image_mobile}, ${r.display_order}
        )
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          logo_src = EXCLUDED.logo_src,
          logo_width = EXCLUDED.logo_width,
          logo_height = EXCLUDED.logo_height,
          site_url = EXCLUDED.site_url,
          whatsapp_text = EXCLUDED.whatsapp_text,
          background_image = EXCLUDED.background_image,
          background_image_mobile = EXCLUDED.background_image_mobile,
          display_order = EXCLUDED.display_order,
          updated_at = now()
      `;
    }
    return;
  }

  const db = getDb();
  if (db) {
    const insert = db.prepare(`
      INSERT OR REPLACE INTO projects 
      (id, title, description, logoSrc, logoWidth, logoHeight, siteUrl, whatsappText, backgroundImage, backgroundImageMobile, display_order, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const transaction = db.transaction((list: ProjectData[]) => {
      for (const project of list) {
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
          project.backgroundImageMobile || null,
          project.display_order ?? null
        );
      }
    });

    transaction(projects);
    syncJsonAfterSqliteWrite();
    return;
  }

  saveProjects(projects);
}

export async function addProject(project: ProjectData): Promise<void> {
  const projects = await getProjects();
  projects.push(project);
  await saveProjectsToDb(projects);
}

export async function updateProject(
  id: string,
  updatedProject: Partial<ProjectData>
): Promise<void> {
  if (isNeonEnabled()) {
    const sql = getNeon();
    const rows = (await sql`SELECT * FROM projects WHERE id = ${id} LIMIT 1`) as ProjectRow[];
    const existing = rows[0];
    if (!existing) return;
    const merged = { ...rowToProject(existing), ...updatedProject } as ProjectData;
    const r = projectToRow(merged);
    await sql`
      UPDATE projects SET
        title = ${r.title},
        description = ${r.description},
        logo_src = ${r.logo_src},
        logo_width = ${r.logo_width},
        logo_height = ${r.logo_height},
        site_url = ${r.site_url},
        whatsapp_text = ${r.whatsapp_text},
        background_image = ${r.background_image},
        background_image_mobile = ${r.background_image_mobile},
        display_order = ${r.display_order},
        updated_at = now()
      WHERE id = ${id}
    `;
    return;
  }

  const db = getDb();
  if (db) {
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as
      | ProjectData
      | undefined;
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
      syncJsonAfterSqliteWrite();
    }
    return;
  }

  const projects = await getProjects();
  const index = projects.findIndex((p) => p.id === id);
  if (index !== -1) {
    projects[index] = { ...projects[index], ...updatedProject };
    await saveProjectsToDb(projects);
  }
}

export async function deleteProject(id: string): Promise<void> {
  if (isNeonEnabled()) {
    const sql = getNeon();
    await sql`DELETE FROM projects WHERE id = ${id}`;
    return;
  }

  const db = getDb();
  if (db) {
    db.prepare('DELETE FROM projects WHERE id = ?').run(id);
    syncJsonAfterSqliteWrite();
    return;
  }

  const projects = await getProjects();
  const filtered = projects.filter((p) => p.id !== id);
  await saveProjectsToDb(filtered);
}

export async function duplicateProject(id: string): Promise<ProjectData | null> {
  const projects = await getProjects();
  const project = projects.find((p) => p.id === id);
  if (!project) return null;

  const duplicated: ProjectData = {
    ...project,
    id: `${project.id}-copy-${Date.now()}`,
    title: `${project.title} (עותק)`,
  };

  await addProject(duplicated);
  return duplicated;
}

export async function updateProjectsOrder(projectIds: string[]): Promise<void> {
  if (isNeonEnabled()) {
    const sql = getNeon();
    let index = 0;
    for (const pid of projectIds) {
      await sql`
        UPDATE projects SET display_order = ${index}, updated_at = now() WHERE id = ${pid}
      `;
      index += 1;
    }
    return;
  }

  const db = getDb();
  if (db) {
    const update = db.prepare(
      'UPDATE projects SET display_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    );

    const transaction = db.transaction((ids: string[]) => {
      ids.forEach((pid, i) => {
        update.run(i, pid);
      });
    });

    transaction(projectIds);
    syncJsonAfterSqliteWrite();
    return;
  }

  const projects = await getProjects();
  const reorderedProjects = projectIds
    .map((pid) => projects.find((p) => p.id === pid))
    .filter(Boolean) as ProjectData[];
  const remainingProjects = projects.filter((p) => !projectIds.includes(p.id));
  const allProjects = [...reorderedProjects, ...remainingProjects];

  allProjects.forEach((project, i) => {
    (project as ProjectData & { display_order?: number }).display_order = i;
  });

  saveProjects(allProjects);
}
