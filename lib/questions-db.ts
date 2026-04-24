import { getNeon, isNeonEnabled } from './neon';
import fs from 'fs';
import path from 'path';
import type { Question } from './quote-wizard';
import { defaultQuestions } from './quote-wizard';

const QUESTIONS_FILE = path.join(process.cwd(), 'data', 'questions.json');

function ensureQuestionsFile() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(QUESTIONS_FILE)) {
    fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(defaultQuestions, null, 2), 'utf-8');
  }
}

function readQuestionsFromFile(): Question[] {
  ensureQuestionsFile();
  return JSON.parse(fs.readFileSync(QUESTIONS_FILE, 'utf-8')) as Question[];
}

function writeQuestionsToFile(questions: Question[]) {
  ensureQuestionsFile();
  fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(questions, null, 2), 'utf-8');
}

export async function getAllQuestions(): Promise<Question[]> {
  if (isNeonEnabled()) {
    const sql = getNeon();
    const rows = (await sql`
      SELECT id, payload FROM wizard_questions
      ORDER BY COALESCE((payload->>'order')::int, 9999), id
    `) as { id: string; payload: Question }[];
    return rows.map((r) => r.payload);
  }
  return readQuestionsFromFile();
}

export async function replaceAllQuestions(questions: Question[]): Promise<void> {
  if (isNeonEnabled()) {
    const sql = getNeon();
    await sql`DELETE FROM wizard_questions`;
    for (const q of questions) {
      const payload = JSON.stringify(q);
      await sql`
        INSERT INTO wizard_questions (id, payload) VALUES (${q.id}, ${payload})
      `;
    }
    return;
  }
  writeQuestionsToFile(questions);
}

export async function insertQuestion(question: Question): Promise<void> {
  if (isNeonEnabled()) {
    const sql = getNeon();
    const payload = JSON.stringify(question);
    await sql`
      INSERT INTO wizard_questions (id, payload) VALUES (${question.id}, ${payload})
    `;
    return;
  }
  const questions = readQuestionsFromFile();
  questions.push(question);
  writeQuestionsToFile(questions);
}

export async function updateQuestionById(
  id: string,
  patch: Partial<Question>
): Promise<void> {
  if (isNeonEnabled()) {
    const sql = getNeon();
    const rows = (await sql`
      SELECT payload FROM wizard_questions WHERE id = ${id} LIMIT 1
    `) as { payload: Question }[];
    const cur = rows[0];
    if (!cur) return;
    const next = { ...cur.payload, ...patch } as Question;
    const payload = JSON.stringify(next);
    await sql`
      UPDATE wizard_questions SET payload = ${payload} WHERE id = ${id}
    `;
    return;
  }
  const questions = readQuestionsFromFile();
  const index = questions.findIndex((q) => q.id === id);
  if (index === -1) return;
  questions[index] = { ...questions[index], ...patch };
  writeQuestionsToFile(questions);
}

export async function deleteQuestionById(id: string): Promise<boolean> {
  if (isNeonEnabled()) {
    const sql = getNeon();
    await sql`DELETE FROM wizard_questions WHERE id = ${id}`;
    return true;
  }
  const questions = readQuestionsFromFile();
  const filtered = questions.filter((q) => q.id !== id);
  if (filtered.length === questions.length) return false;
  writeQuestionsToFile(filtered);
  return true;
}

export async function resetQuestionsToDefault(): Promise<Question[]> {
  await replaceAllQuestions(defaultQuestions);
  return defaultQuestions;
}
