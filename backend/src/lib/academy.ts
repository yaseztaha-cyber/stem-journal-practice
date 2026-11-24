import { query } from '../db';

// Mastery threshold for unit quizzes (configurable in one place).
export const QUIZ_MASTERY_PCT = 80;

// weakness_code -> academy unit slug (personalized learning path).
export const WEAKNESS_UNIT_MAP: Record<string, string> = {
  needs_examples: 'evidence-examples',
  claims_without_evidence: 'evidence-examples',
  generic_reflection: 'reflection-depth',
  no_personal_growth: 'reflection-depth',
  partial_coverage: 'understanding-questions',
  off_topic: 'understanding-questions',
  no_project_link: 'synthesis-transfer',
  weak_synthesis: 'synthesis-transfer',
  weak_value_judgment: 'edp-writing',
  no_individual_role: 'teamwork-writing',
};

export const UNIT_TITLES_FALLBACK: Record<string, string> = {
  'strong-academic-answer': 'Unit 1 — What Is a Strong Academic Answer?',
  'understanding-questions': 'Unit 2 — Understanding the Question',
  'strong-paragraphs': 'Unit 3 — Building a Strong Paragraph',
  'evidence-examples': 'Unit 4 — Evidence & Specific Examples',
  'reflection-depth': 'Unit 5 — Reflection: Beyond Description',
  'blue-method': 'Unit 6 — The BLUE Method',
  'academic-language': 'Unit 7 — Academic Language Without Overcomplicating',
  'synthesis-transfer': 'Unit 8 — Synthesis & Learning Transfer',
  'teamwork-writing': 'Unit 9 — Team Collaboration Writing',
  'edp-writing': 'Unit 10 — Engineering Design Process Writing',
  'research-fundamentals': 'Unit 11 — Research Fundamentals',
  'research-paper': 'Unit 12 — How to Write a Research Paper',
  'sources-citations': 'Unit 13 — Sources, Citations & Integrity',
  'results-discussion': 'Unit 14 — Results, Discussion & Conclusion',
  'revision-editing': 'Unit 15 — Revision & Self-Editing',
};

export interface GradedItem {
  correct: boolean;
  score: number;
  maxScore: number;
}

function norm(s: unknown): string {
  return String(s ?? '').toLowerCase();
}

function setEq(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort((x, y) => x - y);
  const sb = [...b].sort((x, y) => x - y);
  return sa.every((v, i) => v === sb[i]);
}

function keywordRate(hay: string, keywords: string[]): number {
  const h = norm(hay);
  const ks = (keywords ?? []).map(norm).filter(Boolean);
  if (!ks.length) return 0;
  return ks.filter((k) => h.includes(k)).length / ks.length;
}

/** Step-by-step Answer Surgery grading. Returns per-step pass flags (for feedback). */
export function gradeSurgery(
  payload: any,
  answer: any,
  points: number,
): { steps: boolean[]; correct: boolean; score: number; maxScore: number } {
  const maxScore = Math.max(0, points || 0);
  const steps = payload?.steps ?? [];
  const answers: string[] = Array.isArray(answer) ? answer : [];
  const flags = steps.map((s: any, i: number) => {
    const text = typeof answers[i] === 'string' ? answers[i] : '';
    if (text.trim().length < 3) return false;
    const threshold = typeof s?.threshold === 'number' ? s.threshold : 0.5;
    return keywordRate(text, s?.keywords ?? []) >= threshold;
  });
  const passed = flags.filter(Boolean).length;
  const correct = steps.length > 0 && passed === steps.length;
  return { steps: flags, correct, score: steps.length ? Math.round((passed / steps.length) * maxScore) : 0, maxScore };
}

/** Grade one academy item. Never throws — unknown shapes score 0. */
export function gradeAcademyItem(kind: string, payload: any, answer: any, points: number): GradedItem {
  const maxScore = Math.max(0, points || 0);
  const miss: GradedItem = { correct: false, score: 0, maxScore };
  const hit: GradedItem = { correct: true, score: maxScore, maxScore };
  try {
    switch (kind) {
      case 'single_choice': {
        if (typeof answer !== 'number') return miss;
        return answer === payload?.correct ? hit : miss;
      }
      case 'multi_select':
      case 'compare_levels': {
        if (!Array.isArray(answer)) return miss;
        return setEq(answer.map(Number), (payload?.correct ?? []).map(Number)) ? hit : miss;
      }
      case 'true_false': {
        if (typeof answer !== 'boolean') return miss;
        return answer === !!payload?.correct ? hit : miss;
      }
      case 'match': {
        // answer: { [leftText]: rightText } — display order is irrelevant, mapping must equal payload pairs
        const pairs = payload?.pairs ?? [];
        if (!answer || typeof answer !== 'object' || Array.isArray(answer)) return miss;
        const keys = Object.keys(answer);
        if (keys.length !== pairs.length) return miss;
        for (const pr of pairs) {
          if ((answer as any)[pr.left] !== pr.right) return miss;
        }
        return hit;
      }
      case 'order_steps': {
        // answer: step strings in chosen order; payload.steps is the correct order
        const steps: string[] = payload?.steps ?? [];
        if (!Array.isArray(answer) || answer.length !== steps.length) return miss;
        return answer.every((s, i) => norm(s).trim() === norm(steps[i]).trim()) ? hit : miss;
      }
      case 'decoder': {
        // answer: option index per blank
        const blanks = payload?.blanks ?? [];
        if (!Array.isArray(answer) || answer.length !== blanks.length) return miss;
        return answer.every((a, i) => Number(a) === Number(blanks[i]?.correct)) ? hit : miss;
      }
      case 'surgery': {
        // Answer Surgery: guided multi-step repair; partial credit per repaired step
        const s = gradeSurgery(payload, answer, maxScore);
        return { correct: s.correct, score: s.score, maxScore: s.maxScore };
      }
      case 'short_answer': {
        // keyword-coverage self-check (honest partial assessment, never pretends to read minds)
        if (typeof answer !== 'string' || answer.trim().length < 3) return miss;
        const hay = norm(answer);
        const keywords: string[] = (payload?.keywords ?? []).map(norm);
        if (!keywords.length) return miss;
        const hits = keywords.filter((k) => k && hay.includes(k)).length;
        const rate = hits / keywords.length;
        const threshold = typeof payload?.threshold === 'number' ? payload.threshold : 0.6;
        if (rate >= threshold) return hit;
        return { correct: false, score: 0, maxScore };
      }
      default:
        return miss;
    }
  } catch {
    return miss;
  }
}

export interface UnitState {
  unit_id: string;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  lessons_total: number;
  lessons_done: number;
  quiz_total: number;
  quiz_best_pct: number;
  quiz_passed: boolean;
}

/** Compute per-unit states for a user (unlock chain: unit N needs N-1 completed). */
export async function unitStatesForUser(userId: string): Promise<UnitState[]> {
  const units = (
    await query(`SELECT id, unit_number FROM academy_units WHERE active=TRUE ORDER BY unit_number`)
  ).rows;
  const lessons = (
    await query(
      `SELECT l.unit_id, COUNT(*)::int AS total,
              COUNT(c.lesson_id)::int AS done
       FROM academy_lessons l LEFT JOIN academy_lesson_completions c
         ON c.lesson_id=l.id AND c.user_id=$1
       WHERE l.active=TRUE GROUP BY l.unit_id`,
      [userId],
    )
  ).rows;
  const lessonMap = new Map(lessons.map((r: any) => [r.unit_id, r]));
  const quizTotals = (
    await query(
      `SELECT unit_id, COUNT(*)::int AS total FROM academy_items
       WHERE quiz=TRUE AND active=TRUE GROUP BY unit_id`,
    )
  ).rows;
  const quizMap = new Map(quizTotals.map((r: any) => [r.unit_id, r.total]));
  const prog = (
    await query(`SELECT unit_id, status, quiz_attempts, quiz_best_pct, quiz_passed FROM academy_unit_progress WHERE user_id=$1`, [userId])
  ).rows;
  const progMap = new Map(prog.map((r: any) => [r.unit_id, r]));

  const states: UnitState[] = [];
  let prevCompleted = true; // unit 1 is always unlocked
  for (const u of units) {
    const lm = lessonMap.get(u.id) ?? { total: 0, done: 0 };
    const p = progMap.get(u.id);
    const completed =
      p?.status === 'completed' ||
      (lm.total > 0 && lm.done >= lm.total && (p?.quiz_passed || (quizMap.get(u.id) ?? 0) === 0));
    let status: UnitState['status'];
    if (completed) status = 'completed';
    else if (!prevCompleted) status = 'locked';
    else if ((p && p.status !== 'available') || lm.done > 0 || (p?.quiz_attempts ?? 0) > 0) status = 'in_progress';
    else status = 'available';
    // persist completed when derived (keeps the chain moving even if the quiz
    // endpoint marked it — belt and suspenders, idempotent)
    if (completed && p?.status !== 'completed') {
      await query(
        `INSERT INTO academy_unit_progress(user_id, unit_id, status, updated_at) VALUES ($1,$2,'completed',now())
         ON CONFLICT (user_id, unit_id) DO UPDATE SET status='completed', updated_at=now()`,
        [userId, u.id],
      );
    }
    states.push({
      unit_id: u.id,
      status,
      lessons_total: lm.total,
      lessons_done: Math.min(lm.done, lm.total),
      quiz_total: quizMap.get(u.id) ?? 0,
      quiz_best_pct: p?.quiz_best_pct ?? 0,
      quiz_passed: !!p?.quiz_passed,
    });
    prevCompleted = completed;
  }
  return states;
}

/** Recompute and persist a single unit's completion. Returns the new status. */
export async function refreshUnitCompletion(userId: string, unitId: string): Promise<'completed' | 'not-yet'> {
  const l = await query(
    `SELECT COUNT(*) FILTER (WHERE l.active)::int AS total,
            COUNT(c.lesson_id)::int AS done
     FROM academy_lessons l LEFT JOIN academy_lesson_completions c
       ON c.lesson_id=l.id AND c.user_id=$2
     WHERE l.unit_id=$1`,
    [unitId, userId],
  );
  const q = await query(`SELECT COUNT(*)::int AS total FROM academy_items WHERE unit_id=$1 AND quiz=TRUE AND active=TRUE`, [unitId]);
  const p = await query(`SELECT quiz_passed FROM academy_unit_progress WHERE user_id=$1 AND unit_id=$2`, [userId, unitId]);
  const lessonsDone = (l.rows[0]?.total ?? 0) > 0 && l.rows[0].done >= l.rows[0].total;
  const quizDone = (q.rows[0]?.total ?? 0) === 0 || !!p.rows[0]?.quiz_passed;
  if (lessonsDone && quizDone) {
    await query(
      `INSERT INTO academy_unit_progress(user_id, unit_id, status, updated_at) VALUES ($1,$2,'completed',now())
       ON CONFLICT (user_id, unit_id) DO UPDATE SET status='completed', updated_at=now()`,
      [userId, unitId],
    );
    return 'completed';
  }
  return 'not-yet';
}

// ---------- Skill engine (real metrics from completed activities) ----------

export const SKILLS = ['structure', 'evidence', 'explanation', 'analysis', 'language', 'citation'] as const;
export type Skill = (typeof SKILLS)[number];

export const SKILL_LABELS: Record<Skill, string> = {
  structure: 'Structure',
  evidence: 'Evidence',
  explanation: 'Explanation',
  analysis: 'Analysis',
  language: 'Academic language',
  citation: 'Citation',
};

// Which units train each skill (a unit may feed two skills).
export const SKILL_UNITS: Record<Skill, string[]> = {
  structure: ['understanding-questions', 'strong-paragraphs', 'research-paper', 'blue-masterclass'],
  evidence: ['strong-academic-answer', 'evidence-examples', 'synthesis-transfer', 'sources-citations'],
  explanation: ['strong-paragraphs', 'blue-method', 'edp-writing'],
  analysis: ['reflection-depth', 'blue-method', 'synthesis-transfer', 'results-discussion', 'blue-masterclass'],
  language: ['academic-language', 'research-paper', 'revision-editing'],
  citation: ['research-fundamentals', 'research-paper', 'sources-citations'],
};

/** Skills trained by one unit (for tags, continue panels, search). */
export function skillsForUnitSlug(slug: string): Skill[] {
  return SKILLS.filter((s) => SKILL_UNITS[s].includes(slug));
}

export type SkillStatus = 'NOT_STARTED' | 'PRACTICING' | 'UNDERSTOOD' | 'MASTERED';

export interface SkillDatum {
  skill: Skill;
  label: string;
  attempts: number;
  pct: number | null;
  status: SkillStatus;
}

function statusFor(pct: number | null): SkillStatus {
  if (pct == null) return 'NOT_STARTED';
  if (pct >= 80) return 'MASTERED';
  if (pct >= 55) return 'UNDERSTOOD';
  return 'PRACTICING';
}

/** Per-skill accuracy from real exercise + quiz attempts. Never invented. */
export async function skillDataForUser(userId: string): Promise<SkillDatum[]> {
  const rows = (
    await query(
      `SELECT u.slug, COUNT(a.id)::int AS n,
              COALESCE(SUM(a.score),0)::int AS got, COALESCE(SUM(i.points),0)::int AS max
       FROM academy_exercise_attempts a
       JOIN academy_items i ON i.id=a.item_id
       JOIN academy_units u ON u.id=i.unit_id
       WHERE a.user_id=$1 GROUP BY u.slug`,
      [userId],
    )
  ).rows;
  const bySlug = new Map(rows.map((r: any) => [r.slug, r]));
  return SKILLS.map((skill) => {
    let n = 0;
    let got = 0;
    let max = 0;
    for (const slug of SKILL_UNITS[skill]) {
      const r = bySlug.get(slug);
      if (!r) continue;
      n += r.n;
      got += r.got;
      max += r.max;
    }
    const pct = n >= 3 && max > 0 ? Math.round((got / max) * 100) : null;
    return { skill, label: SKILL_LABELS[skill], attempts: n, pct, status: statusFor(pct) };
  });
}

/** Consecutive-day activity streak from real timestamps (academy activity only). */
export async function streakForUser(userId: string): Promise<number> {
  const r = await query(
    `SELECT DISTINCT d::date AS day FROM (
       SELECT created_at AS d FROM academy_exercise_attempts WHERE user_id=$1
       UNION SELECT submitted_at FROM academy_quiz_attempts WHERE user_id=$1
       UNION SELECT completed_at FROM academy_lesson_completions WHERE user_id=$1
     ) s ORDER BY day DESC LIMIT 60`,
    [userId],
  );
  const days: string[] = r.rows.map((x: any) => String(x.day).slice(0, 10));
  if (!days.length) return 0;
  const today = new Date();
  const key = (d: Date) => d.toISOString().slice(0, 10);
  const set = new Set(days);
  let streak = 0;
  const cursor = new Date(today);
  // Allow starting from yesterday (streak alive if active today or yesterday).
  if (!set.has(key(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!set.has(key(cursor))) return 0;
  }
  while (set.has(key(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

const GRADE_RANK: Record<string, number> = { RED: 0, YELLOW: 1, GREEN: 2, BLUE: 3 };
const RANK_GRADE = ['RED', 'YELLOW', 'GREEN', 'BLUE'];

/** Journal level band from the student's recent real attempts. */
export async function journalLevelForUser(userId: string): Promise<{ band: string; next: string | null; recent: number }> {
  const r = await query(
    `SELECT grade FROM attempts WHERE student_id=$1 ORDER BY submitted_at DESC LIMIT 10`,
    [userId],
  );
  if (!r.rows.length) return { band: 'RED', next: 'YELLOW', recent: 0 };
  const avg = r.rows.reduce((n: number, x: any) => n + (GRADE_RANK[x.grade] ?? 0), 0) / r.rows.length;
  const idx = Math.max(0, Math.min(3, Math.round(avg)));
  return { band: RANK_GRADE[idx], next: idx < 3 ? RANK_GRADE[idx + 1] : null, recent: r.rows.length };
}

/** Next lesson to continue with (first incomplete lesson of the earliest open unit). */
export async function continueForUser(
  userId: string,
): Promise<{ unit_slug: string; unit_title: string; lesson_id: string; lesson_title: string } | null> {
  const states = await unitStatesForUser(userId);
  const open = states.find((s) => s.status === 'in_progress' || s.status === 'available');
  if (!open) return null;
  const u = await query(`SELECT slug, title FROM academy_units WHERE id=$1`, [open.unit_id]);
  if (!u.rows.length) return null;
  const l = await query(
    `SELECT l.id, l.title FROM academy_lessons l
     LEFT JOIN academy_lesson_completions c ON c.lesson_id=l.id AND c.user_id=$2
     WHERE l.unit_id=$1 AND l.active=TRUE AND c.lesson_id IS NULL
     ORDER BY l.order_index LIMIT 1`,
    [open.unit_id, userId],
  );
  if (!l.rows.length) return null;
  return { unit_slug: u.rows[0].slug, unit_title: u.rows[0].title, lesson_id: l.rows[0].id, lesson_title: l.rows[0].title };
}

/** Honest time estimate from real content size: ~150 wpm reading + 2 min per practice item. */
export function estimateMinutes(bodyMd: string, practiceCount: number): number {
  const words = (bodyMd ?? '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.round(words / 150 + practiceCount * 2));
}
