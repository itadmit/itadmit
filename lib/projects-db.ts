import { ensureNeonSchema } from './ensure-neon-schema';
import { getNeon } from './neon';
import { ProjectData } from './projects';

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

export async function getProjects(): Promise<ProjectData[]> {
  await ensureNeonSchema();
  const sql = getNeon();
  const rows = (await sql`
    SELECT * FROM projects
    ORDER BY COALESCE(display_order, 999999) ASC, id ASC
  `) as ProjectRow[];
  return rows.map(rowToProject);
}

export async function addProject(project: ProjectData): Promise<void> {
  await ensureNeonSchema();
  const sql = getNeon();

  const nextOrder = project.display_order ?? (await getNextDisplayOrder());

  await sql`
    INSERT INTO projects (
      id, title, description, logo_src, logo_width, logo_height,
      site_url, whatsapp_text, background_image, background_image_mobile, display_order
    ) VALUES (
      ${project.id}, ${project.title}, ${project.description}, ${project.logoSrc},
      ${project.logoWidth ?? null}, ${project.logoHeight ?? null},
      ${project.siteUrl}, ${project.whatsappText ?? null},
      ${project.backgroundImage ?? null}, ${project.backgroundImageMobile ?? null},
      ${nextOrder}
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

async function getNextDisplayOrder(): Promise<number> {
  const sql = getNeon();
  const rows = (await sql`
    SELECT COALESCE(MAX(display_order), -1) + 1 AS next FROM projects
  `) as { next: number }[];
  return rows[0]?.next ?? 0;
}

export async function updateProject(
  id: string,
  updatedProject: Partial<ProjectData>
): Promise<void> {
  await ensureNeonSchema();
  const sql = getNeon();
  const rows = (await sql`SELECT * FROM projects WHERE id = ${id} LIMIT 1`) as ProjectRow[];
  const existing = rows[0];
  if (!existing) return;
  const merged = { ...rowToProject(existing), ...updatedProject } as ProjectData;
  await sql`
    UPDATE projects SET
      title = ${merged.title},
      description = ${merged.description},
      logo_src = ${merged.logoSrc},
      logo_width = ${merged.logoWidth ?? null},
      logo_height = ${merged.logoHeight ?? null},
      site_url = ${merged.siteUrl},
      whatsapp_text = ${merged.whatsappText ?? null},
      background_image = ${merged.backgroundImage ?? null},
      background_image_mobile = ${merged.backgroundImageMobile ?? null},
      display_order = ${merged.display_order ?? null},
      updated_at = now()
    WHERE id = ${id}
  `;
}

export async function deleteProject(id: string): Promise<void> {
  await ensureNeonSchema();
  const sql = getNeon();
  await sql`DELETE FROM projects WHERE id = ${id}`;
}

export async function duplicateProject(id: string): Promise<ProjectData | null> {
  await ensureNeonSchema();
  const sql = getNeon();
  const rows = (await sql`SELECT * FROM projects WHERE id = ${id} LIMIT 1`) as ProjectRow[];
  const existing = rows[0];
  if (!existing) return null;

  const source = rowToProject(existing);
  const duplicated: ProjectData = {
    ...source,
    id: `${source.id}-copy-${Date.now()}`,
    title: `${source.title} (עותק)`,
    display_order: undefined,
  };

  await addProject(duplicated);
  return duplicated;
}

export async function updateProjectsOrder(projectIds: string[]): Promise<void> {
  await ensureNeonSchema();
  const sql = getNeon();
  let index = 0;
  for (const pid of projectIds) {
    await sql`
      UPDATE projects SET display_order = ${index}, updated_at = now() WHERE id = ${pid}
    `;
    index += 1;
  }
}
