import { Pool } from 'pg';
import { config } from './config';

export const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 10,
});

// All non-secret question columns. `reference_answer` (model exemplar) is deliberately
// excluded: it is only ever revealed to the owning student via the attempt detail after
// submission. Student-facing question/session endpoints must use this column list.
export const PUBLIC_QUESTION_COLUMNS =
  'q.id, q.category, q.question_text, q.what_testing, q.difficulty, q.rubric_category, ' +
  'q.required_components, q.source, q.source_label, q.active, q.created_at, q.updated_at, ' +
  'q.grade, q.semester, q.school_year, q.question_number, q.question_slot, q.question_type, ' +
  'q.instructions, q.learning_objectives, q.rubric_version';

pool.on('error', (err) => {
  // eslint-disable-next-line no-console
  console.error('pg pool error', err);
});

export async function query<T = any>(text: string, params?: any[]): Promise<{ rows: T[]; rowCount: number }> {
  const res = await pool.query(text, params);
  return { rows: res.rows as T[], rowCount: res.rowCount ?? 0 };
}

export function wordCount(text: string): number {
  const t = (text ?? '').trim();
  if (!t) return 0;
  return t.split(/\s+/).filter(Boolean).length;
}
