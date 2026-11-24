import { z } from 'zod';

// Grade/semester scoping (§2, §50). NULL grade/semester on a row means the
// cross-semester pool (practice material or grade-wide official sets), which is
// always labeled by `source` and never presented as semester-official content.
export const GRADES = [10, 11, 12] as const;
export const SEMESTERS = [1, 2] as const;

export const scopeQuerySchema = z
  .object({
    grade: z.coerce.number().int().optional(),
    semester: z.coerce.number().int().optional(),
  })
  .refine(
    (v) =>
      (v.grade === undefined && v.semester === undefined) ||
      ((GRADES as readonly number[]).includes(v.grade!) && (SEMESTERS as readonly number[]).includes(v.semester!)),
    { message: 'Valid grade (10-12) and semester (1-2) are required together' },
  );

export interface Scope {
  grade: number;
  semester: number;
}

/** Parse ?grade=&semester=. Returns null when unscoped, or {error} on invalid input. */
export function parseScope(q: any): { scope: Scope | null; error?: string } {
  if (q.grade === undefined && q.semester === undefined) return { scope: null };
  const parsed = scopeQuerySchema.safeParse({ grade: q.grade, semester: q.semester });
  if (!parsed.success) return { scope: null, error: 'Valid grade (10-12) and semester (1-2) are required together' };
  return { scope: { grade: parsed.data.grade!, semester: parsed.data.semester! } };
}

/**
 * SQL fragment matching rows in scope: semester-official rows plus the
 * cross-semester pool (NULL rows). A G11 S1 official row can never match a
 * G10 S1 query; only unlabeled-scope practice rows are shared, by design.
 */
export function scopeWhere(alias: string, scope: Scope | null, startIdx: number): { clause: string; nextIdx: number } {
  if (!scope) return { clause: '', nextIdx: startIdx };
  return {
    clause: ` AND (${alias}.grade IS NULL OR ${alias}.grade=$${startIdx}) AND (${alias}.semester IS NULL OR ${alias}.semester=$${startIdx + 1})`,
    nextIdx: startIdx + 2,
  };
}

const LO_RE = /^([A-Z]{2,4})\.(\d{1,2})\.(\d{1,2})$/;

/**
 * Canonical LO form: subject + major (no padding: 2, never 02) + minor
 * (two digits: 01, never 1). So ES.2.1 and ES.02.01 both become ES.2.01.
 */
export function canonicalLO(code: string): string {
  const m = code.trim().toUpperCase().match(LO_RE);
  if (!m) return code.trim().toUpperCase();
  const major = m[2].replace(/^0+/, '') || '0';
  const minor = (m[3].replace(/^0+/, '') || '0').padStart(2, '0');
  return `${m[1]}.${major}.${minor}`;
}

/**
 * Parse an LO filter (comma string or string array, e.g. "CH.2.01,MA.2.01").
 * Returns null when absent, or {error} on malformed codes.
 */
export function parseLOs(input: unknown): { los: string[] | null; error?: string } {
  if (input === undefined || input === null || input === '') return { los: null };
  const raw = Array.isArray(input) ? input : String(input).split(',');
  const cleaned = [...new Set(raw.map((x) => String(x).trim().toUpperCase()).filter(Boolean))];
  if (cleaned.length === 0) return { los: null };
  if (!cleaned.every((c) => LO_RE.test(c))) {
    return { los: null, error: 'LO codes look like CH.2.01 — check the selected objectives' };
  }
  return { los: cleaned.map(canonicalLO) };
}

/** Human context label, e.g. "G11 • S1". */
export function contextLabel(grade?: number | null, semester?: number | null): string {
  if (grade == null || semester == null) return 'All semesters';
  return `G${grade} • S${semester}`;
}
