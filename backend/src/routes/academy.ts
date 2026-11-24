import { Router } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { query } from '../db';
import { requireAuth } from '../middleware/auth';
import {
  QUIZ_MASTERY_PCT,
  WEAKNESS_UNIT_MAP,
  UNIT_TITLES_FALLBACK,
  gradeAcademyItem,
  gradeSurgery,
  unitStatesForUser,
  refreshUnitCompletion,
  skillDataForUser,
  streakForUser,
  journalLevelForUser,
  continueForUser,
  estimateMinutes,
  skillsForUnitSlug,
} from '../lib/academy';

const router = Router();
router.use(requireAuth);

const quizLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false });

function hashRotate<T>(arr: T[], salt: string): T[] {
  // Deterministic display shuffle (stable per item, no RNG state to sync).
  if (arr.length < 2) return [...arr];
  let h = 0;
  for (const ch of salt) h = (h * 31 + ch.charCodeAt(0)) % 997;
  const k = h % arr.length;
  return [...arr.slice(k), ...arr.slice(0, k)];
}

function stripCorrect(payload: any, kind: string, reveal: boolean, salt: string): any {
  // Students always get explanations; exact answers only after passing or 2+ attempts.
  // Order/match/short-answer payloads are transformed so the shell never contains the answer.
  if (reveal) return payload;
  const p = { ...(payload ?? {}) };
  delete (p as any).correct;
  if (kind === 'decoder' && Array.isArray(p.blanks)) p.blanks = p.blanks.map((b: any) => ({ label: b.label, options: b.options }));
  if (kind === 'order_steps' && Array.isArray(p.steps)) p.steps = hashRotate(p.steps, salt);
  if (kind === 'match' && Array.isArray(p.pairs)) {
    p.lefts = p.pairs.map((x: any) => x.left);
    p.rights = hashRotate(p.pairs.map((x: any) => x.right), salt);
    delete (p as any).pairs;
  }
  if (kind === 'short_answer') {
    delete (p as any).keywords;
    delete (p as any).sample;
  }
  return p;
}

// GET /api/academy/units — catalog with per-user states + overall progress
// Optional ?track=CORE|G10|G11|G12|SEMESTER|JOURNAL|RESEARCH (default ALL);
// SEMESTER track narrows with ?grade=&semester= (§12).
router.get('/units', async (req, res) => {
  const userId = (req as any).user.id;
  const track = typeof req.query.track === 'string' ? req.query.track.toUpperCase() : 'ALL';
  const validTracks = ['CORE', 'G10', 'G11', 'G12', 'SEMESTER', 'JOURNAL', 'RESEARCH'];
  if (track !== 'ALL' && !validTracks.includes(track)) return res.status(400).json({ error: 'Valid track required' });
  let extra = '';
  const params: any[] = [];
  if (track !== 'ALL') {
    extra = ` AND u.track_scope=$1`;
    params.push(track);
    const { scope, error } = (await import('../lib/scope')).parseScope(req.query);
    if (error) return res.status(400).json({ error });
    if (scope && track === 'SEMESTER') {
      extra += ` AND (u.grade IS NULL OR u.grade=$2) AND (u.semester IS NULL OR u.semester=$3)`;
      params.push(scope.grade, scope.semester);
    }
  }
  const units = (
    await query(
      `SELECT u.*, COALESCE((SELECT json_agg(v ORDER BY v.order_index) FROM academy_videos v WHERE v.unit_id=u.id AND v.active=TRUE), '[]') AS videos,
              (SELECT COUNT(*)::int FROM academy_lessons l WHERE l.unit_id=u.id AND l.active=TRUE) AS lesson_count,
              (SELECT COUNT(*)::int FROM academy_items i WHERE i.unit_id=u.id AND i.quiz=TRUE AND i.active=TRUE) AS quiz_count
       FROM academy_units u WHERE u.active=TRUE${extra} ORDER BY u.unit_number`,
      params,
    )
  ).rows;
  const states = await unitStatesForUser(userId);
  const byId = new Map(states.map((s) => [s.unit_id, s]));
  const withState = units.map((u: any) => ({ ...u, state: byId.get(u.id) ?? null }));
  const done = withState.filter((u: any) => u.state?.status === 'completed').length;
  const current = withState.find((u: any) => u.state?.status === 'in_progress' || u.state?.status === 'available') ?? null;
  res.json({
    units: withState,
    progress: {
      pct: units.length ? Math.round((done / units.length) * 100) : 0,
      completed: done,
      total: units.length,
      current_unit: current ? { slug: current.slug, title: current.title } : null,
    },
  });
});

// GET /api/academy/units/:slug — full unit player payload (videos, lessons+examples, practice, quiz shell, tricks, mistakes, state)
router.get('/units/:slug', async (req, res) => {
  const userId = (req as any).user.id;
  const u = await query(`SELECT * FROM academy_units WHERE slug=$1 AND active=TRUE`, [req.params.slug]);
  if (!u.rows.length) return res.status(404).json({ error: 'Unit not found' });
  const unit = u.rows[0];
  const gateStates = await unitStatesForUser(userId);
  const gate = gateStates.find((s) => s.unit_id === unit.id);
  if (!gate || gate.status === 'locked') {
    const me = await query(`SELECT role FROM users WHERE id=$1`, [userId]);
    if (me.rows[0]?.role !== 'admin') {
      const prev = await query(
        `SELECT unit_number, title FROM academy_units WHERE unit_number < $1 AND active=TRUE ORDER BY unit_number DESC LIMIT 1`,
        [unit.unit_number],
      );
      return res.status(403).json({
        error: 'Unit locked',
        prerequisite: prev.rows[0]
          ? `Complete Unit ${prev.rows[0].unit_number} — ${prev.rows[0].title} first, because this unit builds on those skills.`
          : 'Complete the previous unit first.',
      });
    }
  }
  const [videos, lessons, practice, quizQ, tricks, mistakes, completions, prog] = await Promise.all([
    query(`SELECT * FROM academy_videos WHERE unit_id=$1 AND active=TRUE ORDER BY order_index`, [unit.id]),
    query(`SELECT * FROM academy_lessons WHERE unit_id=$1 AND active=TRUE ORDER BY order_index`, [unit.id]),
    query(`SELECT id, lesson_id, kind, prompt, payload, points, difficulty, order_index FROM academy_items WHERE unit_id=$1 AND quiz=FALSE AND active=TRUE ORDER BY order_index`, [unit.id]),
    query(`SELECT id, lesson_id, kind, prompt, payload, points, difficulty, order_index FROM academy_items WHERE unit_id=$1 AND quiz=TRUE AND active=TRUE ORDER BY order_index`, [unit.id]),
    query(`SELECT * FROM academy_tricks WHERE unit_id=$1 AND active=TRUE ORDER BY order_index`, [unit.id]),
    query(`SELECT * FROM academy_mistakes WHERE unit_id=$1 AND active=TRUE ORDER BY order_index`, [unit.id]),
    query(`SELECT lesson_id FROM academy_lesson_completions WHERE user_id=$1`, [userId]),
    query(`SELECT * FROM academy_unit_progress WHERE user_id=$1 AND unit_id=$2`, [userId, unit.id]),
  ]);
  const itemIds = [...practice.rows, ...quizQ.rows].map((r: any) => r.id);
  const attempts = itemIds.length
    ? await query(`SELECT item_id, correct FROM academy_exercise_attempts WHERE user_id=$1 AND item_id = ANY($2::uuid[])`, [userId, itemIds])
    : { rows: [] as any[] };
  const doneLessons = new Set(completions.rows.map((r: any) => r.lesson_id));
  const attempted = new Map<string, boolean>();
  for (const a of attempts.rows as any[]) attempted.set(a.item_id, attempted.get(a.item_id) || a.correct);
  const states = await unitStatesForUser(userId);
  const state = states.find((s) => s.unit_id === unit.id) ?? null;
  const reveal = (prog.rows[0]?.quiz_passed ?? false) || (prog.rows[0]?.quiz_attempts ?? 0) >= 2;
  const practiceCountByLesson = new Map<string, number>();
  for (const r of practice.rows as any[]) {
    practiceCountByLesson.set(r.lesson_id, (practiceCountByLesson.get(r.lesson_id) ?? 0) + 1);
  }
  res.json({
    unit: { ...unit, skills: skillsForUnitSlug(unit.slug) },
    state,
    videos: videos.rows,
    lessons: lessons.rows.map((l: any) => ({
      ...l,
      completed: doneLessons.has(l.id),
      est_minutes: estimateMinutes(l.body_md, practiceCountByLesson.get(l.id) ?? 0),
    })),
    practice: practice.rows.map((r: any) => ({
      id: r.id,
      lesson_id: r.lesson_id,
      kind: r.kind,
      prompt: r.prompt,
      payload: stripCorrect(r.payload, r.kind, false, r.id),
      points: r.points,
      difficulty: r.difficulty,
      order_index: r.order_index,
      attempted: attempted.has(r.id),
      correct_before: attempted.get(r.id) ?? null,
    })),
    quiz: quizQ.rows.map((r: any) => ({ ...r, payload: stripCorrect(r.payload, r.kind, reveal, r.id) })),
    quiz_meta: {
      total_points: quizQ.rows.reduce((n: number, r: any) => n + (r.points ?? 0), 0),
      mastery_pct: QUIZ_MASTERY_PCT,
      attempts: prog.rows[0]?.quiz_attempts ?? 0,
      best_pct: prog.rows[0]?.quiz_best_pct ?? 0,
      passed: prog.rows[0]?.quiz_passed ?? false,
      answers_revealed: reveal,
    },
    tricks: tricks.rows,
    mistakes: mistakes.rows,
  });
});

// POST /api/academy/exercises/:id/submit — formative practice (always reveals explanation)
router.post('/exercises/:id/submit', async (req, res) => {
  const userId = (req as any).user.id;
  const parsed = z.object({ answer: z.any() }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });
  const it = await query(`SELECT * FROM academy_items WHERE id=$1 AND quiz=FALSE AND active=TRUE`, [req.params.id]);
  if (!it.rows.length) return res.status(404).json({ error: 'Exercise not found' });
  const row = it.rows[0];
  const g = gradeAcademyItem(row.kind, row.payload, parsed.data.answer, row.points);
  await query(`INSERT INTO academy_exercise_attempts(user_id, item_id, correct, score, answer) VALUES ($1,$2,$3,$4,$5)`, [
    userId,
    row.id,
    g.correct,
    g.score,
    JSON.stringify(parsed.data.answer ?? null),
  ]);
  await query(
    `INSERT INTO academy_unit_progress(user_id, unit_id, status, updated_at) VALUES ($1,$2,'in_progress',now())
     ON CONFLICT (user_id, unit_id) DO UPDATE SET status=CASE WHEN academy_unit_progress.status='completed' THEN 'completed' ELSE 'in_progress' END, updated_at=now()`,
    [userId, row.unit_id],
  );
  const extra =
    row.kind === 'surgery'
      ? { steps: gradeSurgery(row.payload, parsed.data.answer, row.points).steps }
      : {};
  res.json({ correct: g.correct, score: g.score, max_score: g.maxScore, explanation: row.payload?.explanation ?? '', payload: row.payload, ...extra });
});

// POST /api/academy/lessons/:id/complete — requires all practice items of the lesson attempted
router.post('/lessons/:id/complete', async (req, res) => {
  const userId = (req as any).user.id;
  const l = await query(`SELECT * FROM academy_lessons WHERE id=$1 AND active=TRUE`, [req.params.id]);
  if (!l.rows.length) return res.status(404).json({ error: 'Lesson not found' });
  const items = await query(`SELECT id FROM academy_items WHERE lesson_id=$1 AND quiz=FALSE AND active=TRUE`, [l.rows[0].id]);
  if (items.rows.length) {
    const done = await query(
      `SELECT COUNT(DISTINCT item_id)::int AS n FROM academy_exercise_attempts WHERE user_id=$1 AND item_id = ANY($2::uuid[])`,
      [userId, items.rows.map((r: any) => r.id)],
    );
    if (done.rows[0].n < items.rows.length) {
      return res.status(400).json({ error: 'Finish the lesson practice first', remaining: items.rows.length - done.rows[0].n });
    }
  }
  await query(`INSERT INTO academy_lesson_completions(user_id, lesson_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`, [userId, l.rows[0].id]);
  await query(
    `INSERT INTO academy_unit_progress(user_id, unit_id, status, updated_at) VALUES ($1,$2,'in_progress',now())
     ON CONFLICT (user_id, unit_id) DO UPDATE SET status=CASE WHEN academy_unit_progress.status='completed' THEN 'completed' ELSE 'in_progress' END, updated_at=now()`,
    [userId, l.rows[0].unit_id],
  );
  const status = await refreshUnitCompletion(userId, l.rows[0].unit_id);
  res.json({ ok: true, unit_completed: status === 'completed' });
});

// POST /api/academy/units/:slug/quiz — graded quiz submit (80% mastery)
router.post('/units/:slug/quiz', quizLimiter, async (req, res) => {
  const userId = (req as any).user.id;
  const parsed = z.object({ answers: z.array(z.object({ item_id: z.string().uuid(), answer: z.any() })).max(50) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
  const u = await query(`SELECT * FROM academy_units WHERE slug=$1 AND active=TRUE`, [req.params.slug]);
  if (!u.rows.length) return res.status(404).json({ error: 'Unit not found' });
  const unit = u.rows[0];
  const states = await unitStatesForUser(userId);
  const st = states.find((s) => s.unit_id === unit.id);
  if (!st || st.status === 'locked') return res.status(403).json({ error: 'Complete the previous unit first' });

  const items = await query(`SELECT * FROM academy_items WHERE unit_id=$1 AND quiz=TRUE AND active=TRUE ORDER BY order_index`, [unit.id]);
  const byId = new Map(items.rows.map((r: any) => [r.id, r]));
  let score = 0;
  let total = 0;
  const feedback: any[] = [];
  const missed: string[] = [];
  for (const a of parsed.data.answers) {
    const row = byId.get(a.item_id);
    if (!row) continue;
    const g = gradeAcademyItem(row.kind, row.payload, a.answer, row.points);
    score += g.score;
    total += g.maxScore;
    feedback.push({
      item_id: row.id,
      correct: g.correct,
      score: g.score,
      max_score: g.maxScore,
      explanation: row.payload?.explanation ?? '',
      kind: row.kind,
      prompt: row.prompt,
    });
    if (!g.correct) missed.push(row.id);
    await query(`INSERT INTO academy_exercise_attempts(user_id, item_id, correct, score, answer) VALUES ($1,$2,$3,$4,$5)`, [
      userId,
      row.id,
      g.correct,
      g.score,
      JSON.stringify(a.answer ?? null),
    ]);
  }
  const pct = total ? Math.round((score / total) * 100) : 0;
  const passed = total > 0 && pct >= QUIZ_MASTERY_PCT;
  const prev = await query(`SELECT quiz_attempts, quiz_best_pct FROM academy_unit_progress WHERE user_id=$1 AND unit_id=$2`, [userId, unit.id]);
  const attemptNo = (prev.rows[0]?.quiz_attempts ?? 0) + 1;
  const best = Math.max(prev.rows[0]?.quiz_best_pct ?? 0, pct);
  await query(
    `INSERT INTO academy_unit_progress(user_id, unit_id, status, quiz_attempts, quiz_best_pct, quiz_passed, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,now())
     ON CONFLICT (user_id, unit_id) DO UPDATE SET quiz_attempts=EXCLUDED.quiz_attempts, quiz_best_pct=EXCLUDED.quiz_best_pct,
       quiz_passed=academy_unit_progress.quiz_passed OR EXCLUDED.quiz_passed,
       status=CASE WHEN academy_unit_progress.status='completed' THEN 'completed' ELSE EXCLUDED.status END, updated_at=now()`,
    [userId, unit.id, passed ? 'in_progress' : 'in_progress', attemptNo, best, passed],
  );
  await query(
    `INSERT INTO academy_quiz_attempts(user_id, unit_id, attempt_number, score, total, pct, passed, answers, missed_ids)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [userId, unit.id, attemptNo, score, total, pct, passed, JSON.stringify(parsed.data.answers), JSON.stringify(missed)],
  );
  const unitStatus = await refreshUnitCompletion(userId, unit.id);
  const reveal = passed || attemptNo >= 2;
  res.json({
    score,
    total,
    pct,
    passed,
    mastery_pct: QUIZ_MASTERY_PCT,
    attempt_number: attemptNo,
    best_pct: best,
    missed_ids: missed,
    unit_completed: unitStatus === 'completed',
    answers_revealed: reveal,
    feedback: feedback.map((f) =>
      reveal ? { ...f, payload: byId.get(f.item_id)?.payload } : f,
    ),
  });
});

// GET /api/academy/recommendations — weakness-driven lesson suggestions
router.get('/recommendations', async (req, res) => {
  const userId = (req as any).user.id;
  const weak = await query(
    `SELECT code, SUM(occurrences)::int AS total FROM weakness_patterns WHERE user_id=$1 GROUP BY code ORDER BY total DESC LIMIT 5`,
    [userId],
  );
  const grades = await query(
    `SELECT q.category, a.grade FROM attempts a JOIN questions q ON q.id=a.question_id
     WHERE a.student_id=$1 AND a.grade IN ('YELLOW','RED') ORDER BY a.submitted_at DESC LIMIT 10`,
    [userId],
  );
  const catUnit: Record<string, string> = {
    personal_reflection: 'reflection-depth',
    team_collaboration: 'teamwork-writing',
    learning_transfer: 'synthesis-transfer',
    engineering_design_process: 'edp-writing',
  };
  const seen = new Set<string>();
  const recs: { slug: string; reason: string }[] = [];
  for (const w of weak.rows) {
    const slug = WEAKNESS_UNIT_MAP[w.code];
    if (slug && !seen.has(slug)) {
      seen.add(slug);
      recs.push({ slug, reason: `Repeated feedback: ${w.code.replace(/_/g, ' ')} (${w.total}×)` });
    }
  }
  for (const g of grades.rows) {
    const slug = catUnit[g.category];
    if (slug && !seen.has(slug) && recs.length < 5) {
      seen.add(slug);
      recs.push({ slug, reason: `Recent ${g.grade} in ${g.category.replace(/_/g, ' ')}` });
    }
  }
  if (!recs.length) {
    const states = await unitStatesForUser(userId);
    const units = await query(`SELECT id, slug, title FROM academy_units WHERE active=TRUE ORDER BY unit_number`);
    const byId = new Map(units.rows.map((r: any) => [r.id, r]));
    const next = states.find((s) => s.status === 'in_progress' || s.status === 'available');
    if (next && byId.get(next.unit_id)) {
      const u = byId.get(next.unit_id);
      recs.push({ slug: u.slug, reason: 'Continue where you left off' });
    }
  }
  const meta = await query(`SELECT slug, unit_number, title FROM academy_units WHERE slug = ANY($1) AND active=TRUE`, [recs.map((r) => r.slug)]);
  const bySlug = new Map(meta.rows.map((r: any) => [r.slug, r]));
  res.json({
    recommendations: recs
      .filter((r) => bySlug.has(r.slug))
      .map((r) => ({ ...bySlug.get(r.slug), reason: r.reason })),
  });
});

// GET /api/academy/overview — course dashboard: progress, skills, streak, level, continue
router.get('/overview', async (req, res) => {
  const userId = (req as any).user.id;
  const units = await query(`SELECT id, slug, unit_number, title, track_scope, grade, semester FROM academy_units WHERE active=TRUE ORDER BY unit_number`);
  const states = await unitStatesForUser(userId);
  const byId = new Map(states.map((s) => [s.unit_id, s]));
  const done = states.filter((s) => s.status === 'completed').length;
  const skills = await skillDataForUser(userId);
  const [streak, level, cont] = await Promise.all([
    streakForUser(userId),
    journalLevelForUser(userId),
    continueForUser(userId),
  ]);
  const ranked = skills.filter((s) => s.pct != null);
  const strongest = ranked.length ? ranked.reduce((a, b) => (a.pct! >= b.pct! ? a : b)) : null;
  const weakest = ranked.length ? ranked.reduce((a, b) => (a.pct! <= b.pct! ? a : b)) : null;
  res.json({
    progress: {
      pct: units.rows.length ? Math.round((done / units.rows.length) * 100) : 0,
      completed: done,
      total: units.rows.length,
    },
    skills,
    strongest,
    weakest,
    streak,
    level,
    continue: cont,
    units: units.rows.map((u: any) => ({ ...u, state: byId.get(u.id)?.status ?? 'locked' })),
  });
});

// GET /api/academy/search?q= — lessons + units matching (with status + honest time)
router.get('/search', async (req, res) => {
  const userId = (req as any).user.id;
  const q = String(req.query.q ?? '').trim().slice(0, 80);
  if (q.length < 2) return res.json({ lessons: [], units: [] });
  const like = `%${q}%`;
  const lessons = await query(
    `SELECT l.id, l.title, l.objective, l.body_md, u.slug AS unit_slug, u.title AS unit_title, u.unit_number,
            (SELECT COUNT(*)::int FROM academy_items i WHERE i.lesson_id=l.id AND i.quiz=FALSE AND i.active=TRUE) AS practice_count,
            EXISTS(SELECT 1 FROM academy_lesson_completions c WHERE c.lesson_id=l.id AND c.user_id=$2) AS completed
     FROM academy_lessons l JOIN academy_units u ON u.id=l.unit_id
     WHERE l.active=TRUE AND u.active=TRUE
       AND (l.title ILIKE $1 OR l.objective ILIKE $1 OR l.body_md ILIKE $1 OR u.title ILIKE $1)
     ORDER BY u.unit_number, l.order_index LIMIT 20`,
    [like, userId],
  );
  const units = await query(
    `SELECT slug, unit_number, title, description FROM academy_units
     WHERE active=TRUE AND (title ILIKE $1 OR description ILIKE $1) ORDER BY unit_number LIMIT 10`,
    [like],
  );
  res.json({
    lessons: lessons.rows.map((l: any) => ({
      id: l.id,
      title: l.title,
      objective: l.objective,
      unit_slug: l.unit_slug,
      unit_title: l.unit_title,
      unit_number: l.unit_number,
      est_minutes: estimateMinutes(l.body_md, l.practice_count),
      completed: l.completed,
      skills: skillsForUnitSlug(l.unit_slug),
    })),
    units: units.rows,
  });
});

// GET /api/academy/mistakes?q=&unit= — searchable mistake library (from real unit content)
router.get('/mistakes', async (req, res) => {
  const q = String(req.query.q ?? '').trim().slice(0, 80);
  const unit = String(req.query.unit ?? '').trim().slice(0, 80);
  const conds = ['m.active=TRUE', 'u.active=TRUE'];
  const params: any[] = [];
  if (q.length >= 2) {
    params.push(`%${q}%`);
    conds.push(`(m.title ILIKE $${params.length} OR m.body ILIKE $${params.length})`);
  }
  if (unit) {
    params.push(unit);
    conds.push(`u.slug = $${params.length}`);
  }
  const r = await query(
    `SELECT m.title, m.body, u.slug AS unit_slug, u.title AS unit_title, u.unit_number
     FROM academy_mistakes m JOIN academy_units u ON u.id=m.unit_id
     WHERE ${conds.join(' AND ')} ORDER BY u.unit_number, m.order_index LIMIT 100`,
    params,
  );
  const units = await query(`SELECT slug, unit_number, title FROM academy_units WHERE active=TRUE ORDER BY unit_number`);
  res.json({ mistakes: r.rows, units: units.rows });
});

// GET /api/academy/reflections — my saved lesson reflections
router.get('/reflections', async (req, res) => {
  const r = await query(`SELECT key, body, updated_at FROM academy_reflections WHERE user_id=$1 ORDER BY updated_at DESC LIMIT 50`, [
    (req as any).user.id,
  ]);
  res.json({ reflections: r.rows });
});

// POST /api/academy/reflections — save a one-sentence lesson reflection
router.post('/reflections', async (req, res) => {
  const parsed = z.object({ key: z.string().min(1).max(120), body: z.string().min(1).max(1000) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });
  const r = await query(
    `INSERT INTO academy_reflections(user_id, key, body, updated_at) VALUES ($1,$2,$3,now())
     ON CONFLICT (user_id, key) DO UPDATE SET body=EXCLUDED.body, updated_at=now() RETURNING *`,
    [(req as any).user.id, parsed.data.key, parsed.data.body.trim()],
  );
  res.json({ reflection: r.rows[0] });
});
router.get('/certificate', async (req, res) => {
  const userId = (req as any).user.id;
  const states = await unitStatesForUser(userId);
  const total = states.length;
  const done = states.filter((s) => s.status === 'completed').length;
  if (total === 0 || done < total) {
    return res.json({ eligible: false, completed: done, total });
  }
  const me = await query(`SELECT display_name, email FROM users WHERE id=$1`, [userId]);
  res.json({
    eligible: true,
    completed: done,
    total,
    name: me.rows[0]?.display_name ?? me.rows[0]?.email ?? 'Student',
    title: 'Completed the Academic Writing Academy learning path',
    note: 'This records course completion only. It is not an accreditation and not an official STEM certification.',
    issued_at: new Date().toISOString(),
  });
});

export default router;
export { UNIT_TITLES_FALLBACK };
