import { Router } from 'express';
import { z } from 'zod';
import multer from 'multer';
import { query } from '../db';
import { requireAuth, requireAdmin } from '../middleware/auth';
import {
  questionCreateSchema,
  questionUpdateSchema,
  academyUnitSchema,
  academyUnitUpdateSchema,
  academyLessonSchema,
  academyLessonUpdateSchema,
  academyVideoSchema,
  academyVideoUpdateSchema,
  academyItemSchema,
  academyItemUpdateSchema,
  academyTrickSchema,
  academyTrickUpdateSchema,
  academyMistakeSchema,
  academyMistakeUpdateSchema,
  challengeSchema,
  challengeUpdateSchema,
  challengeSectionSchema,
  challengeSectionUpdateSchema,
  challengeResourceSchema,
  challengeResourceUpdateSchema,
  customWordSchema,
  trackStageSchema,
  trackStageUpdateSchema,
  sitePageUpdateSchema,
  siteSettingSchema,
  announcementCreateSchema,
  announcementUpdateSchema,
  feedbackCreateSchema,
  feedbackUpdateSchema,
} from '../lib/validation';

const router = Router();
router.use(requireAuth, requireAdmin);

// Admin: list all (including inactive) with stats
router.get('/questions', async (req, res) => {
  const r = await query(
    `SELECT q.*, COALESCE((SELECT json_agg(t.tag) FROM question_tags t WHERE t.question_id=q.id), '[]') AS tags,
            (SELECT COUNT(*)::int FROM attempts a WHERE a.question_id=q.id) AS attempt_count,
            (SELECT COUNT(DISTINCT student_id)::int FROM attempts a WHERE a.question_id=q.id) AS student_count
     FROM questions q ORDER BY q.category, q.created_at`,
  );
  res.json({ questions: r.rows });
});

router.post('/questions', async (req, res) => {
  const parsed = questionCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
  const d = parsed.data;
  if ((d.grade == null) !== (d.semester == null)) return res.status(400).json({ error: 'Grade and semester must be set together, or both left empty for the shared practice pool.' });
  const r = await query(
    `INSERT INTO questions(category, question_text, what_testing, difficulty, rubric_category, required_components, source, source_label, reference_answer, active,
      grade, semester, school_year, question_number, question_slot, question_type, instructions, learning_objectives)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18) RETURNING *`,
    [d.category, d.question_text.trim(), d.what_testing ?? '', d.difficulty, d.category, JSON.stringify(d.required_components), d.source, d.source_label, d.reference_answer ?? '', d.active,
     d.grade ?? null, d.semester ?? null, d.school_year ?? '', d.question_number ?? null, d.question_slot ?? null, d.question_type ?? '', d.instructions ?? '', d.learning_objectives ?? []],
  );
  const q = r.rows[0];
  for (const t of d.tags ?? []) {
    await query(`INSERT INTO question_tags(question_id, tag) VALUES ($1,$2) ON CONFLICT DO NOTHING`, [q.id, t]);
  }
  res.status(201).json({ question: q });
});

router.put('/questions/:id', async (req, res) => {
  const parsed = questionUpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
  const existing = await query(`SELECT * FROM questions WHERE id=$1`, [req.params.id]);
  if (existing.rows.length === 0) return res.status(404).json({ error: 'Question not found' });
  const cur = existing.rows[0];
  const d = parsed.data as any;
  const nextGrade = d.grade !== undefined ? d.grade : cur.grade;
  const nextSem = d.semester !== undefined ? d.semester : cur.semester;
  if ((nextGrade == null) !== (nextSem == null)) return res.status(400).json({ error: 'Grade and semester must be set together, or both left empty for the shared practice pool.' });
  const next = {
    category: d.category ?? cur.category,
    question_text: (d.question_text ?? cur.question_text).trim(),
    what_testing: d.what_testing ?? cur.what_testing,
    difficulty: d.difficulty ?? cur.difficulty,
    grade: nextGrade,
    semester: nextSem,
    school_year: d.school_year ?? cur.school_year ?? '',
    question_number: d.question_number !== undefined ? d.question_number : cur.question_number,
    question_slot: d.question_slot !== undefined ? d.question_slot : cur.question_slot,
    question_type: d.question_type ?? cur.question_type ?? '',
    instructions: d.instructions ?? cur.instructions ?? '',
    learning_objectives: d.learning_objectives != null ? d.learning_objectives : cur.learning_objectives ?? [],
    required_components:
      d.required_components != null
        ? JSON.stringify(d.required_components)
        : typeof cur.required_components === 'string'
          ? cur.required_components
          : JSON.stringify(cur.required_components),
    source: d.source ?? cur.source,
    source_label: d.source_label ?? cur.source_label,
    reference_answer: d.reference_answer ?? cur.reference_answer ?? '',
    active: d.active ?? cur.active,
  };
  const r = await query(
    `UPDATE questions SET category=$2, question_text=$3, what_testing=$4, difficulty=$5, rubric_category=$6, required_components=$7, source=$8, source_label=$9, reference_answer=$10, active=$11,
      grade=$12, semester=$13, school_year=$14, question_number=$15, question_slot=$16, question_type=$17, instructions=$18, learning_objectives=$19, updated_at=now() WHERE id=$1 RETURNING *`,
    [req.params.id, next.category, next.question_text, next.what_testing, next.difficulty, next.category, next.required_components, next.source, next.source_label, next.reference_answer, next.active,
     next.grade, next.semester, next.school_year, next.question_number, next.question_slot, next.question_type, next.instructions, next.learning_objectives],
  );
  if (d.tags) {
    await query(`DELETE FROM question_tags WHERE question_id=$1`, [req.params.id]);
    for (const t of d.tags) await query(`INSERT INTO question_tags(question_id, tag) VALUES ($1,$2) ON CONFLICT DO NOTHING`, [req.params.id, t]);
  }
  res.json({ question: r.rows[0] });
});

router.get('/stats', async (_req, res) => {
  try {
  const perQ = await query(
    `SELECT q.id, LEFT(q.question_text,80) AS preview, q.category,
            COUNT(a.id)::int AS attempt_count,
            COUNT(a.id) FILTER (WHERE a.grade='BLUE')::int AS blue,
            COUNT(a.id) FILTER (WHERE a.grade='GREEN')::int AS green,
            COUNT(a.id) FILTER (WHERE a.grade='YELLOW')::int AS yellow,
            COUNT(a.id) FILTER (WHERE a.grade='RED')::int AS red,
            COUNT(a.id) FILTER (WHERE a.attempt_number > 1)::int AS retries
     FROM questions q LEFT JOIN attempts a ON a.question_id=q.id
     GROUP BY q.id ORDER BY attempt_count DESC`,
  );
  const weak = await query(
    `SELECT code, COUNT(*)::int AS students, SUM(occurrences)::int AS total FROM weakness_patterns GROUP BY code ORDER BY total DESC`,
  );
  const totals = await query(`SELECT COUNT(*)::int AS users, (SELECT COUNT(*)::int FROM attempts) AS attempts FROM users`);
  // improvement rate: attempts with improved / retried
  const imp = await query(`SELECT COUNT(*) FILTER (WHERE improvement_from_previous='improved')::int AS improved, COUNT(*) FILTER (WHERE attempt_number>1)::int AS retries FROM attempts`);
  res.json({ per_question: perQ.rows, weaknesses: weak.rows, totals: totals.rows[0], improvement: imp.rows[0] });
  } catch (e) {
    console.error('admin stats failed', e);
    res.status(500).json({ error: 'Stats unavailable' });
  }
});

router.get('/rubrics', async (_req, res) => {
  const r = await query(`SELECT * FROM rubrics ORDER BY category, CASE level WHEN 'BLUE' THEN 1 WHEN 'GREEN' THEN 2 WHEN 'YELLOW' THEN 3 ELSE 4 END`);
  const v = await query(`SELECT * FROM rubric_versions ORDER BY id DESC`);
  res.json({ rubrics: r.rows, versions: v.rows });
});

// ---------- Academy CMS ----------
// ---------- Site CMS: pages + creator/platform settings (§50) ----------
const SITE_SLUGS = ['about', 'privacy', 'terms'];

router.get('/site/pages', async (_req, res) => {
  const r = await query(`SELECT slug, title, body_md, updated_at FROM site_pages ORDER BY slug`);
  res.json({ pages: r.rows });
});

router.put('/site/pages/:slug', async (req, res) => {
  if (!SITE_SLUGS.includes(req.params.slug)) return res.status(404).json({ error: 'Unknown page' });
  const parsed = sitePageUpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
  const r = await query(`UPDATE site_pages SET title=$2, body_md=$3, updated_at=now() WHERE slug=$1 RETURNING slug, title, body_md, updated_at`, [
    req.params.slug, parsed.data.title, parsed.data.body_md,
  ]);
  res.json({ page: r.rows[0] });
});

router.get('/site/settings', async (_req, res) => {
  const r = await query(`SELECT key, value FROM site_settings ORDER BY key`);
  res.json({ settings: r.rows });
});

router.put('/site/settings/:key', async (req, res) => {
  const allowed = ['platform_name', 'platform_tagline', 'creator_name', 'creator_school', 'contact_email', 'contact_whatsapp'];
  if (!allowed.includes(req.params.key)) return res.status(404).json({ error: 'Unknown setting' });
  const parsed = siteSettingSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
  const r = await query(`UPDATE site_settings SET value=$2 WHERE key=$1 RETURNING key, value`, [req.params.key, parsed.data.value]);
  res.json({ setting: r.rows[0] });
});

const ACADEMY_TABLES: Record<string, { table: string; create: any; update: any; cols: string[] }> = {
  units: { table: 'academy_units', create: academyUnitSchema, update: academyUnitUpdateSchema, cols: ['slug', 'unit_number', 'title', 'description', 'est_minutes', 'active', 'track_scope', 'grade', 'semester'] },
  lessons: { table: 'academy_lessons', create: academyLessonSchema, update: academyLessonUpdateSchema, cols: ['unit_id', 'title', 'objective', 'body_md', 'examples', 'widget', 'takeaway', 'order_index', 'active'] },
  videos: { table: 'academy_videos', create: academyVideoSchema, update: academyVideoUpdateSchema, cols: ['unit_id', 'title', 'description', 'video_url', 'thumbnail_url', 'duration_seconds', 'transcript', 'order_index', 'active'] },
  items: { table: 'academy_items', create: academyItemSchema, update: academyItemUpdateSchema, cols: ['unit_id', 'lesson_id', 'quiz', 'kind', 'prompt', 'payload', 'points', 'difficulty', 'order_index', 'active'] },
  tricks: { table: 'academy_tricks', create: academyTrickSchema, update: academyTrickUpdateSchema, cols: ['unit_id', 'title', 'body', 'order_index', 'active'] },
  mistakes: { table: 'academy_mistakes', create: academyMistakeSchema, update: academyMistakeUpdateSchema, cols: ['unit_id', 'title', 'body', 'order_index', 'active'] },
};

const JSON_COLS = new Set(['examples', 'payload']);

function academyVal(col: string, v: any): any {
  if (v === undefined || v === null) return null;
  if (JSON_COLS.has(col)) return JSON.stringify(v);
  return v;
}

router.get('/academy/:kind', async (req, res) => {
  const def = ACADEMY_TABLES[req.params.kind];
  if (!def) return res.status(404).json({ error: 'Unknown collection' });
  const unitId = req.query.unit_id as string | undefined;
  let sql = `SELECT * FROM ${def.table}`;
  const params: any[] = [];
  if (unitId && def.cols.includes('unit_id')) {
    sql += ` WHERE unit_id=$1`;
    params.push(unitId);
  }
  sql += def.table === 'academy_units' ? ` ORDER BY unit_number` : ` ORDER BY order_index`;
  const r = await query(sql, params);
  res.json({ [req.params.kind]: r.rows });
});

router.post('/academy/:kind', async (req, res) => {
  const def = ACADEMY_TABLES[req.params.kind];
  if (!def) return res.status(404).json({ error: 'Unknown collection' });
  const parsed = def.create.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
  const d = parsed.data as any;
  const cols = def.cols.filter((c) => d[c] !== undefined);
  const r = await query(
    `INSERT INTO ${def.table}(${cols.join(', ')}) VALUES (${cols.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING *`,
    cols.map((c) => academyVal(c, d[c])),
  );
  res.status(201).json({ item: r.rows[0] });
});

router.put('/academy/:kind/:id', async (req, res) => {
  const def = ACADEMY_TABLES[req.params.kind];
  if (!def) return res.status(404).json({ error: 'Unknown collection' });
  const parsed = def.update.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
  const d = parsed.data as any;
  const cols = def.cols.filter((c) => d[c] !== undefined && c !== 'unit_id' && !(def.table === 'academy_units' && c === 'slug'));
  if (!cols.length) return res.status(400).json({ error: 'Nothing to update' });
  const sets = cols.map((c, i) => `${c}=$${i + 2}`);
  const extra = def.table === 'academy_units' ? `, updated_at=now()` : ``;
  const r = await query(`UPDATE ${def.table} SET ${sets.join(', ')}${extra} WHERE id=$1 RETURNING *`, [
    req.params.id,
    ...cols.map((c) => academyVal(c, d[c])),
  ]);
  if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
  res.json({ item: r.rows[0] });
});

router.delete('/academy/:kind/:id', async (req, res) => {
  const def = ACADEMY_TABLES[req.params.kind];
  if (!def || def.table === 'academy_units') return res.status(404).json({ error: 'Unknown collection' });
  const r = await query(`DELETE FROM ${def.table} WHERE id=$1 RETURNING id`, [req.params.id]);
  if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

// ---------- Custom dictionary (§: Word-style check) ----------
router.get('/words', async (_req, res) => {
  const r = await query(`SELECT word, source, created_at FROM custom_words ORDER BY word`);
  res.json({ words: r.rows });
});

router.post('/words', async (req, res) => {
  const parsed = customWordSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
  const word = parsed.data.word.toLowerCase();
  try {
    const r = await query(`INSERT INTO custom_words(word) VALUES ($1) RETURNING *`, [word]);
    res.status(201).json({ word: r.rows[0] });
  } catch (e: any) {
    if (e?.code === '23505') return res.status(409).json({ error: 'Word already in the dictionary.' });
    throw e;
  }
});

router.delete('/words/:word', async (req, res) => {
  const r = await query(`DELETE FROM custom_words WHERE word=$1 RETURNING word`, [String(req.params.word).toLowerCase()]);
  if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

// ---------- Journal import: PDF/DOCX/TXT -> reviewed Q&A -> question bank ----------
const importUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
});

router.post('/journal-import/parse', importUpload.single('file') as any, async (req, res) => {
  try {
    const file = (req as any).file as { buffer: Buffer; originalname: string } | undefined;
    if (!file) return res.status(400).json({ error: 'Attach a PDF, DOCX, or TXT file as "file".' });
    const { extractDocText, segmentJournal } = await import('../lib/journalImport');
    const { text, pages } = await extractDocText(file.buffer, file.originalname);
    if (!text || text.trim().length < 200) {
      return res.status(400).json({ error: 'No readable text found (scanned images or empty file).' });
    }
    const candidates = segmentJournal(text);
    res.json({ filename: file.originalname, chars: text.length, pages: pages ?? null, candidates });
  } catch (e: any) {
    res.status(400).json({ error: e?.message ?? 'Could not read this file.' });
  }
});

const importItemSchema = z.object({
  question_text: z.string().min(20).max(3000),
  category: z.enum(['personal_reflection', 'team_collaboration', 'learning_transfer', 'engineering_design_process']),
  reference_answer: z.string().max(12000).default(''),
  grade: z.number().int().min(10).max(12).nullable().optional(),
  semester: z.number().int().min(1).max(2).nullable().optional(),
  question_slot: z.number().int().min(1).max(4).nullable().optional(),
  learning_objectives: z.array(z.string().max(30)).max(10).default([]),
});

// Baseline rubric components for imported questions (reviewed text in, honest
// structure out). Imported items always carry at least two components.
const IMPORT_COMPS: Record<string, { key: string; label: string; keywords: string[] }[]> = {
  personal_reflection: [
    { key: 'specific_situation', label: 'Describe a specific situation from experience', keywords: ['when', 'during', 'example', 'semester', 'team', 'project'] },
    { key: 'personal_lesson', label: 'Explain what changed or was learned', keywords: ['learned', 'changed', 'realized', 'lesson', 'growth', 'because'] },
  ],
  team_collaboration: [
    { key: 'own_role', label: 'State your own role or actions', keywords: ['i did', 'my role', 'we', 'team', 'helped', 'together'] },
    { key: 'team_outcome', label: 'Connect actions to a team outcome', keywords: ['result', 'finished', 'therefore', 'because', 'outcome'] },
  ],
  engineering_design_process: [
    { key: 'step_action', label: 'Describe the design step, test, or decision', keywords: ['prototype', 'tested', 'measured', 'designed', 'built', 'compared'] },
    { key: 'reason_result', label: 'Explain the reason and what resulted', keywords: ['because', 'result', 'showed', 'therefore', 'data'] },
  ],
  learning_transfer: [
    { key: 'concept_named', label: 'Name the learning concept precisely', keywords: ['concept', 'principle', 'studied', 'law', 'theory', 'outcome'] },
    { key: 'project_application', label: 'Apply it to the project with specifics', keywords: ['project', 'prototype', 'applied', 'measured', 'because'] },
  ],
};
const IMPORT_TESTING: Record<string, string> = {
  personal_reflection: 'Whether the answer gives a specific lived situation plus an explained personal lesson.',
  team_collaboration: 'Whether the answer shows the student\u2019s own role tied to a team outcome.',
  engineering_design_process: 'Whether the answer describes a real design action and reasons from evidence.',
  learning_transfer: 'Whether the answer names the concept and applies it to the project with specifics.',
};

router.post('/journal-import/commit', async (req, res) => {
  const items = Array.isArray(req.body?.items) ? req.body.items : null;
  const filename = typeof req.body?.filename === 'string' ? req.body.filename.slice(0, 120) : 'uploaded journal';
  if (!items || items.length === 0 || items.length > 100) {
    return res.status(400).json({ error: 'Provide 1–100 reviewed items to import.' });
  }
  const created: string[] = [];
  for (const [i, raw] of items.entries()) {
    const parsed = importItemSchema.safeParse(raw);
    if (!parsed.success) return res.status(400).json({ error: `Item ${i + 1} invalid`, details: parsed.error.flatten() });
    const d = parsed.data as any;
    if ((d.grade == null) !== (d.semester == null)) {
      return res.status(400).json({ error: `Item ${i + 1}: grade and semester must be set together, or both empty.` });
    }
    const slot = d.question_slot ?? (d.category === 'personal_reflection' || d.category === 'team_collaboration' ? 1 : d.category === 'engineering_design_process' ? 2 : 3);
    const qtype =
      d.category === 'personal_reflection' ? 'PERSONAL_REFLECTION'
      : d.category === 'team_collaboration' ? 'TEAM_COLLABORATION'
      : d.category === 'engineering_design_process' ? 'ENGINEERING_DESIGN_PROCESS' : 'LEARNING_TRANSFER';
    const r = await query(
      `INSERT INTO questions(category, question_text, what_testing, difficulty, rubric_category, required_components, source, source_label, reference_answer, active,
        grade, semester, question_slot, question_type, learning_objectives)
       VALUES ($1,$2,$3,'medium',$4,$5,'admin_created',$6,$7,TRUE,$8,$9,$10,$11,$12) RETURNING id`,
      [d.category, d.question_text.trim(), IMPORT_TESTING[d.category], d.category, JSON.stringify(IMPORT_COMPS[d.category]), filename ? `Imported journal · ${filename}` : 'Imported journal', d.reference_answer ?? '', d.grade ?? null, d.semester ?? null, slot, qtype, d.learning_objectives ?? []],
    );
    created.push(r.rows[0].id);
  }
  res.status(201).json({ created: created.length, ids: created });
});

// ---------- Per-student answer review (§50) ----------
router.get('/students', async (req, res) => {
  const q = typeof req.query.q === 'string' && req.query.q.trim() ? `%${req.query.q.trim().toLowerCase()}%` : null;
  const r = await query(
    `SELECT u.id, u.email, u.display_name, u.role, u.created_at,
            COUNT(a.id)::int AS attempts,
            MAX(a.submitted_at) AS last_active,
            (SELECT a2.grade FROM attempts a2 WHERE a2.student_id=u.id ORDER BY a2.submitted_at DESC LIMIT 1) AS last_grade
     FROM users u LEFT JOIN attempts a ON a.student_id=u.id
     ${q ? `WHERE LOWER(u.email) LIKE $1 OR LOWER(u.display_name) LIKE $1` : ``}
     GROUP BY u.id ORDER BY last_active DESC NULLS LAST, u.created_at DESC LIMIT 50`,
    q ? [q] : [],
  );
  res.json({ students: r.rows });
});

router.get('/students/:id/attempts', async (req, res) => {
  const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit ?? '20'), 10) || 20));
  const r = await query(
    `SELECT a.id, a.attempt_number, a.grade, a.word_count, a.submitted_at, a.improvement_from_previous,
            q.category, q.grade AS q_grade, q.semester AS q_semester, q.question_slot, LEFT(q.question_text, 200) AS question_preview,
            e.summary, e.next_level
     FROM attempts a JOIN questions q ON q.id=a.question_id LEFT JOIN evaluations e ON e.attempt_id=a.id
     WHERE a.student_id=$1 ORDER BY a.submitted_at DESC LIMIT $2`,
    [req.params.id, limit],
  );
  res.json({ attempts: r.rows });
});

// ---------- EDP challenge CMS (§48) ----------
const CHALLENGE_COLS = ['grade', 'semester', 'school_year', 'title', 'subtitle', 'theme', 'grand_challenge_link', 'big_idea', 'essential_question', 'design_challenge', 'timeline', 'evaluation_day', 'active'];

router.get('/challenges', async (_req, res) => {
  const r = await query(`SELECT * FROM edp_challenges ORDER BY grade, semester, school_year DESC`);
  res.json({ challenges: r.rows });
});

router.post('/challenges', async (req, res) => {
  const parsed = challengeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
  const d = parsed.data as any;
  try {
    const r = await query(
      `INSERT INTO edp_challenges(${CHALLENGE_COLS.join(', ')}) VALUES (${CHALLENGE_COLS.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING *`,
      CHALLENGE_COLS.map((c) => d[c]),
    );
    res.status(201).json({ challenge: r.rows[0] });
  } catch (e: any) {
    if (e?.code === '23505') return res.status(409).json({ error: 'A challenge already exists for this grade/semester/year.' });
    throw e;
  }
});

router.put('/challenges/:id', async (req, res) => {
  const parsed = challengeUpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
  const d = parsed.data as any;
  const cols = CHALLENGE_COLS.filter((c) => d[c] !== undefined);
  if (!cols.length) return res.status(400).json({ error: 'Nothing to update' });
  const r = await query(`UPDATE edp_challenges SET ${cols.map((c, i) => `${c}=$${i + 2}`).join(', ')}, updated_at=now() WHERE id=$1 RETURNING *`, [req.params.id, ...cols.map((c) => d[c])]);
  if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
  res.json({ challenge: r.rows[0] });
});

const SECTION_COLS = ['challenge_id', 'section', 'heading', 'body', 'sort'];
const RESOURCE_COLS = ['challenge_id', 'kind', 'title', 'url', 'official', 'notes'];

async function cmsCreate(table: string, cols: string[], schema: any, body: any, res: any) {
  const parsed = schema.safeParse(body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
  const d = parsed.data as any;
  const use = cols.filter((c) => d[c] !== undefined);
  const r = await query(`INSERT INTO ${table}(${use.join(', ')}) VALUES (${use.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING *`, use.map((c) => d[c]));
  res.status(201).json({ item: r.rows[0] });
}

router.get('/challenges/:id/sections', async (req, res) => {
  const r = await query(`SELECT * FROM challenge_sections WHERE challenge_id=$1 ORDER BY sort`, [req.params.id]);
  res.json({ sections: r.rows });
});
router.post('/challenge-sections', async (req, res) => cmsCreate('challenge_sections', SECTION_COLS, challengeSectionSchema, req.body, res));
router.put('/challenge-sections/:id', async (req, res) => {
  const parsed = challengeSectionUpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
  const d = parsed.data as any;
  const cols = ['section', 'heading', 'body', 'sort'].filter((c) => d[c] !== undefined);
  if (!cols.length) return res.status(400).json({ error: 'Nothing to update' });
  const r = await query(`UPDATE challenge_sections SET ${cols.map((c, i) => `${c}=$${i + 2}`).join(', ')} WHERE id=$1 RETURNING *`, [req.params.id, ...cols.map((c) => d[c])]);
  if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
  res.json({ item: r.rows[0] });
});
router.delete('/challenge-sections/:id', async (req, res) => {
  const r = await query(`DELETE FROM challenge_sections WHERE id=$1 RETURNING id`, [req.params.id]);
  if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

const TRACK_COLS = ['challenge_id', 'stage_no', 'title', 'body', 'prompt', 'official', 'official_note', 'sort'];

router.get('/challenges/:id/track', async (req, res) => {
  const r = await query(`SELECT * FROM edp_track_stages WHERE challenge_id=$1 ORDER BY sort, stage_no`, [req.params.id]);
  res.json({ track: r.rows });
});
router.post('/track-stages', async (req, res) => {
  const parsed = trackStageSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
  const d = parsed.data as any;
  try {
    const r = await query(
      `INSERT INTO edp_track_stages(${TRACK_COLS.join(', ')}) VALUES (${TRACK_COLS.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING *`,
      TRACK_COLS.map((c) => d[c] ?? (c === 'sort' ? 0 : c === 'prompt' || c === 'official_note' ? '' : c === 'official' ? false : null)),
    );
    res.status(201).json({ item: r.rows[0] });
  } catch (e: any) {
    if (e?.code === '23505') return res.status(409).json({ error: 'That stage number already exists for this challenge.' });
    throw e;
  }
});
router.put('/track-stages/:id', async (req, res) => {
  const parsed = trackStageUpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
  const d = parsed.data as any;
  const cols = ['stage_no', 'title', 'body', 'prompt', 'official', 'official_note', 'sort'].filter((c) => d[c] !== undefined);
  if (!cols.length) return res.status(400).json({ error: 'Nothing to update' });
  const r = await query(`UPDATE edp_track_stages SET ${cols.map((c, i) => `${c}=$${i + 2}`).join(', ')} WHERE id=$1 RETURNING *`, [req.params.id, ...cols.map((c) => d[c])]);
  if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
  res.json({ item: r.rows[0] });
});
router.delete('/track-stages/:id', async (req, res) => {
  const r = await query(`DELETE FROM edp_track_stages WHERE id=$1 RETURNING id`, [req.params.id]);
  if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

router.get('/challenges/:id/resources', async (req, res) => {
  const r = await query(`SELECT * FROM challenge_resources WHERE challenge_id=$1 ORDER BY official DESC, title`, [req.params.id]);
  res.json({ resources: r.rows });
});
router.post('/challenge-resources', async (req, res) => cmsCreate('challenge_resources', RESOURCE_COLS, challengeResourceSchema, req.body, res));
router.put('/challenge-resources/:id', async (req, res) => {
  const parsed = challengeResourceUpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
  const d = parsed.data as any;
  const cols = ['kind', 'title', 'url', 'official', 'notes'].filter((c) => d[c] !== undefined);
  if (!cols.length) return res.status(400).json({ error: 'Nothing to update' });
  const r = await query(`UPDATE challenge_resources SET ${cols.map((c, i) => `${c}=$${i + 2}`).join(', ')} WHERE id=$1 RETURNING *`, [req.params.id, ...cols.map((c) => d[c])]);
  if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
  res.json({ item: r.rows[0] });
});
router.delete('/challenge-resources/:id', async (req, res) => {
  const r = await query(`DELETE FROM challenge_resources WHERE id=$1 RETURNING id`, [req.params.id]);
  if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

// ---------- Admin communication (§7): announcements ----------
router.get('/announcements', async (req, res) => {
  const r = await query(
    `SELECT a.*,
            (SELECT COUNT(*)::int FROM announcement_recipients ar WHERE ar.announcement_id=a.id) AS recipient_count,
            (SELECT COUNT(*)::int FROM announcement_recipients ar WHERE ar.announcement_id=a.id AND ar.read_at IS NOT NULL) AS read_count
     FROM announcements a
     ORDER BY a.scheduled_at DESC, a.created_at DESC`,
  );
  res.json({ announcements: r.rows });
});

router.post('/announcements', async (req, res) => {
  const parsed = announcementCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
  const d = parsed.data as any;
  const user = (req as any).user;
  const r = await query(
    `INSERT INTO announcements(title, body, type, target_roles, target_grades, target_semesters, scheduled_at, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [
      d.title.trim(), d.body.trim(), d.type,
      d.target_roles, d.target_grades, d.target_semesters,
      d.scheduled_at ?? new Date().toISOString(),
      user.id,
    ],
  );
  res.status(201).json({ announcement: r.rows[0] });
});

router.put('/announcements/:id', async (req, res) => {
  const parsed = announcementUpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
  const d = parsed.data as any;
  const cols = ['title', 'body', 'type', 'target_roles', 'target_grades', 'target_semesters', 'scheduled_at'].filter((c) => d[c] !== undefined);
  if (!cols.length) return res.status(400).json({ error: 'Nothing to update' });
  const r = await query(`UPDATE announcements SET ${cols.map((c, i) => `${c}=$${i + 2}`).join(', ')}, updated_at=now() WHERE id=$1 RETURNING *`, [
    req.params.id, ...cols.map((c) => d[c]),
  ]);
  if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
  res.json({ announcement: r.rows[0] });
});

router.delete('/announcements/:id', async (req, res) => {
  const r = await query(`DELETE FROM announcements WHERE id=$1 RETURNING id`, [req.params.id]);
  if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

router.post('/announcements/:id/send', async (req, res) => {
  const r = await query(`SELECT * FROM announcements WHERE id=$1`, [req.params.id]);
  if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
  const ann = r.rows[0];
  if (ann.sent_at) return res.status(409).json({ error: 'Announcement already sent' });

  // Resolve recipients by role/grade/semester targeting
  let roleCond = `u.role = ANY($1)`;
  let gradeCond = `TRUE`;
  let semCond = `TRUE`;
  const params: any[] = [ann.target_roles];
  let pidx = 2;
  if (ann.target_grades && ann.target_grades.length > 0) {
    gradeCond = `u.grade = ANY($${pidx})`;
    params.push(ann.target_grades);
    pidx++;
  }
  if (ann.target_semesters && ann.target_semesters.length > 0) {
    semCond = `u.semester = ANY($${pidx})`;
    params.push(ann.target_semesters);
    pidx++;
  }
  const students = await query(
    `SELECT id FROM users u WHERE u.role = 'student' AND ${roleCond} AND ${gradeCond} AND ${semCond}`,
    params,
  );

  for (const s of students.rows) {
    await query(
      `INSERT INTO announcement_recipients(announcement_id, student_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
      [ann.id, s.id],
    );
  }

  await query(`UPDATE announcements SET sent_at=now() WHERE id=$1`, [ann.id]);

  // TODO: email dispatch via nodemailer/SMTP when SMTP env is configured;
  // for now recipients are recorded in announcement_recipients and shown in-app.
  res.json({ sent: true, recipients: students.rows.length });
});

// ---------- Admin communication (§7): feedback (admin side) ----------
router.get('/feedback', async (req, res) => {
  const status = req.query.status as string | undefined;
  let sql = `SELECT f.*, u.display_name AS student_name, u.email AS student_email
             FROM feedback_messages f JOIN users u ON u.id=f.student_id`;
  const params: any[] = [];
  if (status) {
    sql += ` WHERE f.status=$1`;
    params.push(status);
  }
  sql += ` ORDER BY f.created_at DESC`;
  const r = await query(sql, params);
  res.json({ feedback: r.rows });
});

router.get('/feedback/stats', async (_req, res) => {
  const r = await query(
    `SELECT status, COUNT(*)::int AS count FROM feedback_messages GROUP BY status`,
  );
  const total = await query(`SELECT COUNT(*)::int AS total FROM feedback_messages`);
  res.json({ by_status: r.rows, total: total.rows[0].total });
});

router.put('/feedback/:id', async (req, res) => {
  const parsed = feedbackUpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
  const d = parsed.data as any;
  const user = (req as any).user;
  const cols: string[] = [];
  const vals: any[] = [];
  let pidx = 2;
  if (d.status !== undefined) { cols.push(`status=$${pidx}`); vals.push(d.status); pidx++; }
  if (d.admin_response !== undefined) { cols.push(`admin_response=$${pidx}`); vals.push(d.admin_response); pidx++; }
  if (d.admin_response && d.admin_response.trim().length > 0) {
    cols.push(`responded_by=$${pidx}`); vals.push(user.id); pidx++;
    cols.push(`responded_at=now()`);
  }
  if (!cols.length) return res.status(400).json({ error: 'Nothing to update' });
  const r = await query(`UPDATE feedback_messages SET ${cols.join(', ')}, updated_at=now() WHERE id=$1 RETURNING *`, [req.params.id, ...vals]);
  if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
  res.json({ feedback: r.rows[0] });
});

export default router;
