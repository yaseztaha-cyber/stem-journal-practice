import { Router } from 'express';
import { query } from '../db';
import { requireAuth } from '../middleware/auth';
import { parseScope } from '../lib/scope';

const router = Router();
router.use(requireAuth);

const CATS = ['personal_reflection', 'team_collaboration', 'learning_transfer', 'engineering_design_process'];

router.get('/', async (req, res) => {
  const userId = (req as any).user.id;
  const { scope, error } = parseScope(req.query);
  if (error) return res.status(400).json({ error });
  const byCat: Record<string, any> = {};
  for (const c of CATS) byCat[c] = { category: c, blue_count: 0, green_count: 0, yellow_count: 0, red_count: 0, total_attempts: 0, last_grade: null };
  if (scope) {
    // Per-semester progress (§35): aggregate this semester's attempts only.
    const scoped = await query(
      `SELECT q.category,
              COUNT(*) FILTER (WHERE a.grade='BLUE')::int AS blue_count,
              COUNT(*) FILTER (WHERE a.grade='GREEN')::int AS green_count,
              COUNT(*) FILTER (WHERE a.grade='YELLOW')::int AS yellow_count,
              COUNT(*) FILTER (WHERE a.grade='RED')::int AS red_count,
              COUNT(*)::int AS total_attempts,
              (SELECT a2.grade FROM attempts a2 JOIN questions q2 ON q2.id=a2.question_id
                WHERE a2.student_id=$1 AND q2.category=q.category
                  AND (q2.grade IS NULL OR q2.grade=$2) AND (q2.semester IS NULL OR q2.semester=$3)
                ORDER BY a2.submitted_at DESC LIMIT 1) AS last_grade
       FROM attempts a JOIN questions q ON q.id=a.question_id
       WHERE a.student_id=$1 AND (q.grade IS NULL OR q.grade=$2) AND (q.semester IS NULL OR q.semester=$3)
       GROUP BY q.category`,
      [userId, scope.grade, scope.semester],
    );
    for (const p of scoped.rows) byCat[p.category] = { ...byCat[p.category], ...p };
  } else {
    const prog = await query(`SELECT * FROM student_progress WHERE user_id=$1`, [userId]);
    for (const p of prog.rows) byCat[p.category] = p;
  }

  const totals = { BLUE: 0, GREEN: 0, YELLOW: 0, RED: 0, attempts: 0, questions_completed: 0 };
  for (const c of CATS) {
    totals.BLUE += byCat[c].blue_count;
    totals.GREEN += byCat[c].green_count;
    totals.YELLOW += byCat[c].yellow_count;
    totals.RED += byCat[c].red_count;
    totals.attempts += byCat[c].total_attempts;
  }
  const qc = await query(`SELECT COUNT(DISTINCT question_id)::int AS c FROM attempts a${scope ? ` JOIN questions q ON q.id=a.question_id WHERE a.student_id=$1 AND (q.grade IS NULL OR q.grade=$2) AND (q.semester IS NULL OR q.semester=$3)` : ` WHERE student_id=$1`}`, scope ? [userId, scope.grade, scope.semester] : [userId]);
  totals.questions_completed = qc.rows[0].c;

  const recent = await query(
    `SELECT a.id, a.grade, a.attempt_number, a.submitted_at, a.improvement_from_previous, q.category, q.grade AS q_grade, q.semester AS q_semester, LEFT(q.question_text,120) AS preview
     FROM attempts a JOIN questions q ON q.id=a.question_id WHERE a.student_id=$1${scope ? ` AND (q.grade IS NULL OR q.grade=$2) AND (q.semester IS NULL OR q.semester=$3)` : ``} ORDER BY a.submitted_at DESC LIMIT 10`,
    scope ? [userId, scope.grade, scope.semester] : [userId],
  );

  const weak = await query(`SELECT code, label, occurrences, last_seen FROM weakness_patterns WHERE user_id=$1 ORDER BY occurrences DESC LIMIT 10`, [userId]);

  // improvement: last 10 vs previous 10 (BLUE+GREEN share)
  const all = await query(`SELECT grade, submitted_at FROM attempts WHERE student_id=$1 ORDER BY submitted_at DESC LIMIT 20`, [userId]);
  const good = (g: string) => (g === 'BLUE' || g === 'GREEN' ? 1 : 0);
  const last10 = all.rows.slice(0, 10);
  const prev10 = all.rows.slice(10, 20);
  const rate = (arr: any[]) => (arr.length ? arr.reduce((s, r) => s + good(r.grade), 0) / arr.length : null);
  const trend = { recent_good_rate: rate(last10), previous_good_rate: rate(prev10) };

  // retry/improvement rate per question
  const retry = await query(
    `SELECT question_id, COUNT(*)::int AS n, COUNT(*) FILTER (WHERE improvement_from_previous='improved')::int AS improved
     FROM attempts WHERE student_id=$1 GROUP BY question_id HAVING COUNT(*) > 1`,
    [userId],
  );

  // recommendation engine: weakest category + top weakness codes
  let weakestCat: string | null = null;
  let worstScore = Infinity;
  for (const c of CATS) {
    const p = byCat[c];
    if (p.total_attempts === 0) continue;
    const score = (p.blue_count * 4 + p.green_count * 3 + p.yellow_count * 2 + p.red_count * 1) / p.total_attempts;
    if (score < worstScore) {
      worstScore = score;
      weakestCat = c;
    }
  }
  let recommended: any = null;
  if (weak.rows.length > 0 || weakestCat) {
    const topWeak = weak.rows[0];
    // suggest next question in weakest category (or least practiced)
    let targetCat = weakestCat;
    if (!targetCat) {
      targetCat = CATS.sort((a, b) => byCat[a].total_attempts - byCat[b].total_attempts)[0];
    }
    const nq = await query(
      `SELECT id, LEFT(question_text,120) AS preview FROM questions WHERE active=TRUE AND category=$1 AND id NOT IN (SELECT question_id FROM attempts WHERE student_id=$2) ORDER BY RANDOM() LIMIT 1`,
      [targetCat, userId],
    );
    recommended = {
      focus_category: targetCat,
      reason: topWeak ? `Recurring pattern: ${topWeak.label} (${topWeak.occurrences}×)` : `Least practiced category`,
      suggested_question: nq.rows[0] ?? null,
      practice_tip: topWeak
        ? topWeak.code === 'needs_examples' || topWeak.code === 'claims_without_evidence'
          ? 'For your next answer, include one concrete Capstone event (when, what you did, what resulted) before any general claim.'
          : topWeak.code === 'partial_coverage'
            ? 'Before writing, list each part of the question and give each part its own paragraph.'
            : 'Re-read your last feedback\u2019s "How to improve" steps and apply exactly one of them in your retry.'
        : 'Start with one question in the suggested category and aim to cover every required part.',
    };
  }

  // journal skills: aggregate real question_coverage + weakness codes into 5 dimensions
  const DIM_KEYS: Record<string, string[]> = {
    prompt: ['part', 'cover', 'question', 'address', 'includ', 'miss'],
    evidence: ['evidence', 'example', 'data', 'measur', 'fact', 'support'],
    explanation: ['expla', 'because', 'why', 'how', 'reason', 'mechanism', 'cause'],
    specificity: ['specific', 'concrete', 'precise', 'vague', 'detail', 'names', 'numbers'],
    reflection: ['reflect', 'learn', 'change', 'lesson', 'growth', 'insight', 'judg'],
  };
  const DIM_WEAK: Record<string, string[]> = {
    prompt: ['partial_coverage', 'off_topic'],
    evidence: ['needs_examples', 'claims_without_evidence', 'no_project_link'],
    explanation: ['weak_synthesis', 'weak_value_judgment'],
    specificity: ['needs_examples', 'claims_without_evidence', 'no_individual_role'],
    reflection: ['generic_reflection', 'no_personal_growth', 'weak_value_judgment'],
  };
  const covRows = await query(
    `SELECT e.question_coverage FROM evaluations e JOIN attempts a ON a.id=e.attempt_id
     WHERE a.student_id=$1 ORDER BY a.submitted_at DESC LIMIT 60`,
    [userId],
  );
  const dimHit: Record<string, number> = { prompt: 0, evidence: 0, explanation: 0, specificity: 0, reflection: 0 };
  const dimTot: Record<string, number> = { prompt: 0, evidence: 0, explanation: 0, specificity: 0, reflection: 0 };
  for (const row of covRows.rows) {
    const items = Array.isArray(row.question_coverage) ? row.question_coverage : [];
    for (const c of items) {
      const label = String(c?.label ?? '').toLowerCase();
      for (const dim of Object.keys(DIM_KEYS)) {
        if (DIM_KEYS[dim].some((k) => label.includes(k))) {
          dimTot[dim]++;
          if (c.covered) dimHit[dim]++;
        }
      }
    }
  }
  const weakList = weak.rows as any[];
  for (const dim of Object.keys(DIM_WEAK)) {
    const codes = weakList.filter((w) => DIM_WEAK[dim].includes(w.code));
    const occ = codes.reduce((n, w) => n + (w.occurrences ?? 0), 0);
    // weakness occurrences count as missed evidence against the dimension
    if (occ > 0) {
      dimTot[dim] += occ;
    }
  }
  const journal_skills: Record<string, { rate: number | null; n: number }> = {};
  for (const dim of Object.keys(DIM_KEYS)) {
    journal_skills[dim] = dimTot[dim] >= 3 ? { rate: dimHit[dim] / dimTot[dim], n: dimTot[dim] } : { rate: null, n: dimTot[dim] };
  }

  // Journal-slot snapshot (§36): latest level per Q1–Q4 slot for the scope.
  // Unanswered slots are absent (never fabricated).
  let slot_profile: Record<string, any> = {};
  {
    const params: any[] = [userId];
    let clause = '';
    if (scope) {
      clause = ` AND (q.grade IS NULL OR q.grade=$2) AND (q.semester IS NULL OR q.semester=$3)`;
      params.push(scope.grade, scope.semester);
    }
    const slots = await query(
      `SELECT DISTINCT ON (q.question_slot) q.question_slot AS slot, q.category, a.grade, a.submitted_at, a.question_id
       FROM attempts a JOIN questions q ON q.id=a.question_id
       WHERE a.student_id=$1 AND q.question_slot IS NOT NULL${clause}
       ORDER BY q.question_slot, a.submitted_at DESC`,
      params,
    );
    for (const s of slots.rows) slot_profile[`Q${s.slot}`] = s;
  }

  res.json({ by_category: byCat, totals, recent_attempts: recent.rows, weaknesses: weak.rows, trend, retry_stats: retry.rows, recommendation: recommended, journal_skills, slot_profile });
});

export default router;
