import { getNeon, isNeonEnabled } from './neon';
import fs from 'fs';
import path from 'path';
import type { Lead } from './quote-wizard';

const LEADS_FILE = path.join(process.cwd(), 'data', 'leads.json');

function ensureLeadsFile() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(LEADS_FILE)) fs.writeFileSync(LEADS_FILE, '[]', 'utf-8');
}

function readLeadsFromFile(): Lead[] {
  ensureLeadsFile();
  return JSON.parse(fs.readFileSync(LEADS_FILE, 'utf-8')) as Lead[];
}

function writeLeadsToFile(leads: Lead[]) {
  ensureLeadsFile();
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf-8');
}

type LeadRow = {
  id: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  answers: unknown;
  estimated_price: number | null;
  status: string;
  created_at: string;
  notes: string;
};

function rowToLead(r: LeadRow): Lead {
  const answers =
    typeof r.answers === 'string'
      ? (JSON.parse(r.answers) as Record<string, string | string[]>)
      : (r.answers as Record<string, string | string[]>);
  return {
    id: r.id,
    name: r.name,
    phone: r.phone,
    email: r.email,
    company: r.company || '',
    answers,
    estimatedPrice: r.estimated_price ?? undefined,
    status: r.status as Lead['status'],
    createdAt: r.created_at,
    notes: r.notes || '',
  };
}

export async function getAllLeads(): Promise<Lead[]> {
  if (isNeonEnabled()) {
    const sql = getNeon();
    const rows = (await sql`
      SELECT id, name, phone, email, company, answers, estimated_price, status, created_at, notes
      FROM leads ORDER BY created_at DESC
    `) as LeadRow[];
    return rows.map(rowToLead);
  }
  return readLeadsFromFile();
}

export async function insertLead(lead: Lead): Promise<void> {
  if (isNeonEnabled()) {
    const sql = getNeon();
    const answersJson = JSON.stringify(lead.answers);
    await sql`
      INSERT INTO leads (id, name, phone, email, company, answers, estimated_price, status, created_at, notes)
      VALUES (
        ${lead.id},
        ${lead.name},
        ${lead.phone},
        ${lead.email},
        ${lead.company ?? ''},
        ${answersJson},
        ${lead.estimatedPrice ?? null},
        ${lead.status},
        ${lead.createdAt},
        ${lead.notes ?? ''}
      )
    `;
    return;
  }
  const leads = readLeadsFromFile();
  leads.push(lead);
  writeLeadsToFile(leads);
}

export async function updateLeadById(id: string, patch: Partial<Lead>): Promise<void> {
  if (isNeonEnabled()) {
    const sql = getNeon();
    const rows = (await sql`
      SELECT id, name, phone, email, company, answers, estimated_price, status, created_at, notes
      FROM leads WHERE id = ${id} LIMIT 1
    `) as LeadRow[];
    const cur = rows[0];
    if (!cur) return;
    const next = { ...rowToLead(cur), ...patch };
    const answersJson = JSON.stringify(next.answers);
    await sql`
      UPDATE leads SET
        name = ${next.name},
        phone = ${next.phone},
        email = ${next.email},
        company = ${next.company ?? ''},
        answers = ${answersJson},
        estimated_price = ${next.estimatedPrice ?? null},
        status = ${next.status},
        notes = ${next.notes ?? ''}
      WHERE id = ${id}
    `;
    return;
  }
  const leads = readLeadsFromFile();
  const index = leads.findIndex((l) => l.id === id);
  if (index === -1) return;
  leads[index] = { ...leads[index], ...patch };
  writeLeadsToFile(leads);
}

export async function deleteLeadById(id: string): Promise<boolean> {
  if (isNeonEnabled()) {
    const sql = getNeon();
    await sql`DELETE FROM leads WHERE id = ${id}`;
    return true;
  }
  const leads = readLeadsFromFile();
  const filtered = leads.filter((l) => l.id !== id);
  if (filtered.length === leads.length) return false;
  writeLeadsToFile(filtered);
  return true;
}
