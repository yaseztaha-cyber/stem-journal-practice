import { query } from '../db';

export interface EdpStage {
  stage_no: number;
  title: string;
  body: string;
  prompt: string;
  source: 'challenge' | 'platform';
}

/**
 * EDP stages available for a scope. When the scope has a challenge with its own
 * learning track, that challenge-specific track wins (richer, project-bound
 * wording). Otherwise the platform-wide study guide is used, so every grade and
 * semester can offer the stage picker.
 *
 * These are platform study-guide stages — NOT official EDP stages. The same
 * labeling rule as `edp_track_stages` applies.
 */
export async function stagesForScope(grade?: number | null, semester?: number | null): Promise<EdpStage[]> {
  if (grade != null && semester != null) {
    const c = await query(
      `SELECT id FROM edp_challenges WHERE active=TRUE AND grade=$1 AND semester=$2 ORDER BY school_year DESC LIMIT 1`,
      [grade, semester],
    );
    if (c.rows.length > 0) {
      const t = await query(
        `SELECT stage_no, title, body, prompt FROM edp_track_stages WHERE challenge_id=$1 ORDER BY stage_no`,
        [c.rows[0].id],
      );
      if (t.rows.length > 0) {
        return t.rows.map((r: any) => ({ ...r, source: 'challenge' as const }));
      }
    }
  }
  const p = await query(`SELECT stage_no, title, body, prompt FROM platform_edp_stages ORDER BY stage_no`);
  return p.rows.map((r: any) => ({ ...r, source: 'platform' as const }));
}

/** Resolve one stage number within a scope, or null when it does not exist. */
export async function resolveStage(
  grade: number | null | undefined,
  semester: number | null | undefined,
  stageNo: number,
): Promise<EdpStage | null> {
  const stages = await stagesForScope(grade, semester);
  return stages.find((s) => s.stage_no === stageNo) ?? null;
}
