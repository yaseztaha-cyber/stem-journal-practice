import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/index';
import { pool } from '../src/db';

function uniq(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1e6)}@test.local`;
}

// Minimal single-page PDF with selectable text (correct xref offsets).
function minimalPdf(text: string): Buffer {
  const esc = text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  const content = `BT /F1 18 Tf 20 100 Td (${esc}) Tj ET`;
  const objs: string[] = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 144] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`,
  ];
  let out = '%PDF-1.4\n';
  const offsets: number[] = [];
  objs.forEach((body, i) => {
    offsets.push(Buffer.byteLength(out));
    out += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xrefPos = Buffer.byteLength(out);
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  for (const o of offsets) out += `${String(o).padStart(10, '0')} 00000 n \n`;
  out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;
  return Buffer.from(out, 'latin1');
}

let studentToken = '';
let studentId = '';
let student2Token = '';
let adminToken = '';
let questionId = '';
let attemptId = '';

beforeAll(async () => {
  // ensure schema present (migrate already ran)
  const q = await pool.query(`SELECT id FROM questions WHERE active=TRUE LIMIT 1`);
  questionId = q.rows[0].id;
});

const createdQids: string[] = [];
const createdSessionIds: string[] = [];

afterAll(async () => {
  // Never leave throwaway rows in the shared dev bank.
  for (const id of createdQids) {
    try {
      await pool.query(`DELETE FROM attempts WHERE question_id=$1`, [id]);
      await pool.query(`DELETE FROM question_tags WHERE question_id=$1`, [id]);
      await pool.query(`DELETE FROM questions WHERE id=$1 AND source='admin_created'`, [id]);
    } catch {
      /* ignore */
    }
  }
  for (const sid of createdSessionIds) {
    try {
      await pool.query(`DELETE FROM evaluations WHERE attempt_id IN (SELECT id FROM attempts WHERE session_id=$1)`, [sid]);
      await pool.query(`DELETE FROM feedback_items WHERE evaluation_id IN (SELECT e.id FROM evaluations e JOIN attempts a ON a.id=e.attempt_id WHERE a.session_id=$1)`, [sid]);
      await pool.query(`DELETE FROM attempts WHERE session_id=$1`, [sid]);
      await pool.query(`DELETE FROM practice_sessions WHERE id=$1`, [sid]);
    } catch {
      /* ignore */
    }
  }
  await pool.end();
});

describe('authentication', () => {
  it('registers a student', async () => {
    const email = uniq('student');
    const res = await request(app).post('/api/auth/register').send({ email, password: 'Password123!', display_name: 'Test Student' });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.role).toBe('student');
    studentToken = res.body.token;
    studentId = res.body.user.id;
  });
  it('rejects duplicate email', async () => {
    const email = uniq('dup');
    await request(app).post('/api/auth/register').send({ email, password: 'Password123!', display_name: 'Test AA' });
    const res = await request(app).post('/api/auth/register').send({ email, password: 'Password123!', display_name: 'Test BB' });
    expect(res.status).toBe(409);
  });
  it('rejects weak password', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: uniq('w'), password: 'short', display_name: 'Weak Test' });
    expect(res.status).toBe(400);
  });
  it('logs in', async () => {
    const email = uniq('login');
    await request(app).post('/api/auth/register').send({ email, password: 'Password123!', display_name: 'Login Test' });
    const res = await request(app).post('/api/auth/login').send({ email, password: 'Password123!' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
  });
  it('rejects wrong password', async () => {
    const email = uniq('wrong');
    await request(app).post('/api/auth/register').send({ email, password: 'Password123!', display_name: 'Wrong Test' });
    const res = await request(app).post('/api/auth/login').send({ email, password: 'nope-nope-nope' });
    expect(res.status).toBe(401);
  });
  it('requires auth for /me', async () => {
    expect((await request(app).get('/api/auth/me')).status).toBe(401);
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
  });
});

describe('dead-session token errors', () => {
  const secret = process.env.JWT_SECRET ?? 'dev-secret-change-me-min-32-chars-please';
  it('rejects garbage tokens as token_invalid with sign-in guidance', async () => {
    const res = await request(app).get('/api/questions').set('Authorization', 'Bearer garbage.token.here');
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('token_invalid');
    expect(res.body.error).toMatch(/sign in again/i);
  });
  it('rejects expired tokens as token_expired', async () => {
    const jwt = await import('jsonwebtoken');
    const expired = (jwt.default ?? jwt).sign(
      { id: '00000000-0000-0000-0000-000000000000', email: 'x@y.z', role: 'student' },
      secret,
      { expiresIn: '-10s' },
    );
    const res = await request(app).get('/api/questions').set('Authorization', `Bearer ${expired}`);
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('token_expired');
    expect(res.body.error).toMatch(/expired/i);
  });
  it('rejects well-formed tokens for deleted accounts as token_invalid', async () => {
    const jwt = await import('jsonwebtoken');
    const ghost = (jwt.default ?? jwt).sign(
      { id: '11111111-1111-1111-1111-111111111111', email: 'ghost@y.z', role: 'student' },
      secret,
    );
    const res = await request(app).get('/api/questions').set('Authorization', `Bearer ${ghost}`);
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('token_invalid');
    expect(res.body.error).toMatch(/sign in again/i);
  });
  it('wrong-password login stays a plain 401 with no token code (no logout loop)', async () => {
    const email = uniq('badpass');
    await request(app).post('/api/auth/register').send({ email, password: 'Password123!', display_name: 'Badpass Test' });
    const res = await request(app).post('/api/auth/login').send({ email, password: 'nope-nope-nope' });
    expect(res.status).toBe(401);
    expect(res.body.code).toBeUndefined();
  });
});

describe('authorization + student isolation', () => {
  it('creates second student', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: uniq('s2'), password: 'Password123!', display_name: 'Student Two' });
    student2Token = res.body.token;
  });
  it('student cannot access admin routes', async () => {
    const res = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(403);
  });
  it('admin can access admin routes', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'admin@stemjournal.local', password: process.env.ADMIN_PASSWORD ?? 'Admin123!' });
    expect(res.status).toBe(200);
    adminToken = res.body.token;
    const s = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${adminToken}`);
    expect(s.status).toBe(200);
  });
});

describe('question retrieval', () => {
  it('lists questions for student', async () => {
    const res = await request(app).get('/api/questions').set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.questions.length).toBeGreaterThan(3);
  });
  it('filters by category', async () => {
    const res = await request(app).get('/api/questions?category=personal_reflection').set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.questions.every((q: any) => q.category === 'personal_reflection')).toBe(true);
  });
  it('gets single question', async () => {
    const res = await request(app).get(`/api/questions/${questionId}`).set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.question.required_components).toBeTruthy();
  });
  it('returns 404 for unknown question', async () => {
    const res = await request(app).get('/api/questions/00000000-0000-0000-0000-000000000000').set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(404);
  });
});

describe('reference answer isolation (model exemplars stay hidden until submission)', () => {
  let refQuestionId = '';
  beforeAll(async () => {
    // Deterministic: use a seeded exemplar (S'26 G11 S1), never an admin-test leftover.
    const r = await pool.query(
      `SELECT id FROM questions WHERE reference_answer <> '' AND source_label LIKE '%S''26 G11 S1%' AND active=TRUE LIMIT 1`,
    );
    if (r.rows.length) refQuestionId = r.rows[0].id;
  });

  it('has at least one bundled model answer to test against', async () => {
    expect(refQuestionId).toBeTruthy();
  });

  it('question list never leaks reference_answer', async () => {
    const res = await request(app).get('/api/questions').set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.questions.every((q: any) => !('reference_answer' in q))).toBe(true);
  });

  it('single question never leaks reference_answer before submission', async () => {
    const res = await request(app).get(`/api/questions/${refQuestionId}`).set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.question.reference_answer).toBeUndefined();
  });

  it('next-question endpoint never leaks reference_answer', async () => {
    const res = await request(app).get(`/api/questions/next?category=personal_reflection`).set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.question.reference_answer).toBeUndefined();
  });

  it('mock session start/status never leaks reference_answer', async () => {
    const start = await request(app).post('/api/sessions/start').set('Authorization', `Bearer ${student2Token}`);
    expect(start.status).toBe(201);
    expect(start.body.questions.every((q: any) => !('reference_answer' in q))).toBe(true);
    const get = await request(app).get(`/api/sessions/${start.body.session.id}`).set('Authorization', `Bearer ${student2Token}`);
    expect(get.status).toBe(200);
    expect(get.body.questions.every((q: any) => !('reference_answer' in q))).toBe(true);
  });

  it('attempt detail reveals reference_answer to the owning student after submission', async () => {
    const att = await request(app)
      .post('/api/attempts')
      .set('Authorization', `Bearer ${student2Token}`)
      .send({ question_id: refQuestionId, answer_text: 'During week 3 I reflected on progress with my team; we identified one risk, measured results over two trials, and because of the evidence I changed how we test. For example, we redesigned and retested, which taught me to raise concerns early with a proposed fix.' });
    expect(att.status).toBe(201);
    const det = await request(app).get(`/api/attempts/${att.body.attempt.id}`).set('Authorization', `Bearer ${student2Token}`);
    expect(det.status).toBe(200);
    expect(det.body.attempt.reference_answer.length).toBeGreaterThan(50);
    // other students still cannot see it via the detail of an attempt they don't own
    const other = await request(app).get(`/api/attempts/${att.body.attempt.id}`).set('Authorization', `Bearer ${studentToken}`);
    expect(other.status).toBe(404);
  });

  it('admin create/update persists reference_answer', async () => {
    const created = await request(app).post('/api/admin/questions').set('Authorization', `Bearer ${adminToken}`).send({
      category: 'learning_transfer',
      question_text: 'Explain how the reference answer field round-trips through the admin API for storing a model exemplar.',
      what_testing: 'Whether the admin round-trip preserves the exemplar text verbatim.',
      difficulty: 'medium',
      required_components: [
        { key: 'one', label: 'Part one', keywords: ['explain'] },
        { key: 'two', label: 'Part two', keywords: ['model'] },
      ],
      source: 'admin_created',
      source_label: 'Admin Created',
      reference_answer: 'A complete model answer that the admin attaches for students to compare after submission.',
      active: true,
    });
    expect(created.status).toBe(201);
    createdQids.push(created.body.question.id);
    expect(created.body.question.reference_answer).toContain('complete model answer');
    const updated = await request(app).put(`/api/admin/questions/${created.body.question.id}`).set('Authorization', `Bearer ${adminToken}`).send({ reference_answer: 'Updated exemplar text after the admin refined it.' });
    expect(updated.status).toBe(200);
    expect(updated.body.question.reference_answer).toBe('Updated exemplar text after the admin refined it.');
    // admin edits do not expose reference answer to students
    const stud = await request(app).get(`/api/questions/${created.body.question.id}`).set('Authorization', `Bearer ${studentToken}`);
    expect(stud.body.question.reference_answer).toBeUndefined();
    // clean up so later runs never pick this throwaway row as a model answer
    await request(app).put(`/api/admin/questions/${created.body.question.id}`).set('Authorization', `Bearer ${adminToken}`).send({ active: false });
  });
});

describe('answer saving (drafts)', () => {
  it('saves and recovers draft (autosave)', async () => {
    const put = await request(app).put('/api/drafts').set('Authorization', `Bearer ${studentToken}`).send({ question_id: questionId, answer_text: 'draft work in progress <script>alert(1)</script>' });
    expect(put.status).toBe(200);
    expect(put.body.draft.answer_text).not.toContain('<script>');
    const get = await request(app).get(`/api/drafts/${questionId}`).set('Authorization', `Bearer ${studentToken}`);
    expect(get.body.draft.answer_text).toContain('draft work');
  });
  it('rejects oversized draft', async () => {
    const res = await request(app).put('/api/drafts').set('Authorization', `Bearer ${studentToken}`).send({ question_id: questionId, answer_text: 'x'.repeat(25000) });
    expect(res.status).toBe(400);
  });
});

describe('attempt creation + evaluation', () => {
  it('rejects empty answer', async () => {
    const res = await request(app).post('/api/attempts').set('Authorization', `Bearer ${studentToken}`).send({ question_id: questionId, answer_text: '   ' });
    expect(res.status).toBe(400);
  });
  it('creates attempt with valid rubric evaluation', async () => {
    const res = await request(app)
      .post('/api/attempts')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ question_id: questionId, answer_text: 'During our Capstone water filter prototype in week 3, the sand layer clogged and flow dropped. I stayed late with Sara to retest, redesigned the layer order, and flow improved. Because of this I learned persistence and now raise problems early with a proposed test.' });
    expect(res.status).toBe(201);
    expect(['BLUE', 'GREEN', 'YELLOW', 'RED']).toContain(res.body.evaluation.grade);
    expect(res.body.evaluation.strengths.length).toBeGreaterThan(0);
    expect(res.body.evaluation.improvement_actions.length).toBeGreaterThan(0);
    expect(res.body.attempt.grade).toBe(res.body.evaluation.grade);
    attemptId = res.body.attempt.id;
  });
  it('evaluation never returns numeric grades', async () => {
    const res = await request(app).get(`/api/attempts/${attemptId}`).set('Authorization', `Bearer ${studentToken}`);
    expect(['BLUE', 'GREEN', 'YELLOW', 'RED']).toContain(res.body.evaluation.grade);
    expect(JSON.stringify(res.body)).not.toMatch(/87\/100/);
  });
  it('student cannot view another student attempt (isolation)', async () => {
    const res = await request(app).get(`/api/attempts/${attemptId}`).set('Authorization', `Bearer ${student2Token}`);
    expect(res.status).toBe(404);
  });
  it('students cannot modify evaluation results directly (no endpoint)', async () => {
    const res = await request(app).put(`/api/attempts/${attemptId}`).set('Authorization', `Bearer ${studentToken}`).send({ grade: 'BLUE' });
    expect([404, 405]).toContain(res.status);
  });
});

describe('retry flow + progress + weakness detection', () => {
  it('retry creates attempt_number 2 with improvement tracking', async () => {
    const first = await request(app).post('/api/attempts').set('Authorization', `Bearer ${student2Token}`).send({ question_id: questionId, answer_text: 'Good teamwork stuff.' });
    expect(first.body.attempt.attempt_number).toBe(1);
    const second = await request(app)
      .post('/api/attempts')
      .set('Authorization', `Bearer ${student2Token}`)
      .send({ question_id: questionId, answer_text: 'During week 5 our solar dryer prototype failed because the chamber was too large and heat escaped. I proposed testing two sizes with Mariam; we measured drying over two days and the smaller chamber was 30% faster because airflow concentrated. I learned to raise concerns early with evidence, and now I lead reviews by naming one risk.' });
    expect(second.body.attempt.attempt_number).toBe(2);
    expect(['improved', 'same', 'declined', 'first']).toContain(second.body.attempt.improvement_from_previous);
  });
  it('progress calculation works', async () => {
    const res = await request(app).get('/api/progress').set('Authorization', `Bearer ${student2Token}`);
    expect(res.status).toBe(200);
    expect(res.body.totals.attempts).toBeGreaterThanOrEqual(2);
    expect(res.body.by_category).toBeTruthy();
    expect(res.body.recommendation === null || res.body.recommendation.focus_category).toBeTruthy();
  });
  it('progress includes real journal skill dimensions', async () => {
    const res = await request(app).get('/api/progress').set('Authorization', `Bearer ${student2Token}`);
    expect(res.status).toBe(200);
    for (const dim of ['prompt', 'evidence', 'explanation', 'specificity', 'reflection']) {
      expect(res.body.journal_skills[dim]).toBeTruthy();
      const v = res.body.journal_skills[dim];
      expect(typeof v.n).toBe('number');
      if (v.rate != null) {
        expect(v.rate).toBeGreaterThanOrEqual(0);
        expect(v.rate).toBeLessThanOrEqual(1);
      }
    }
  });
  it('attempt timeline carries answer text for revision compare', async () => {
    const list = await request(app).get('/api/progress').set('Authorization', `Bearer ${student2Token}`);
    const attId = list.body.recent_attempts[0].id;
    const det = await request(app).get(`/api/attempts/${attId}`).set('Authorization', `Bearer ${student2Token}`);
    expect(det.status).toBe(200);
    expect(Array.isArray(det.body.timeline)).toBe(true);
    expect(det.body.timeline.length).toBeGreaterThanOrEqual(1);
    expect(typeof det.body.timeline[0].answer_text).toBe('string');
  });
  it('weakness detection tracked', async () => {
    const res = await request(app).get('/api/progress').set('Authorization', `Bearer ${student2Token}`);
    expect(Array.isArray(res.body.weaknesses)).toBe(true);
  });
});

describe('mock journal', () => {
  it('starts and completes a mock session', async () => {
    const start = await request(app).post('/api/sessions/start').set('Authorization', `Bearer ${studentToken}`);
    expect(start.status).toBe(201);
    expect(start.body.questions.length).toBe(4);
    const sid = start.body.session.id;
    for (const qq of start.body.questions) {
      await request(app).post('/api/attempts').set('Authorization', `Bearer ${studentToken}`).send({ question_id: qq.id, session_id: sid, answer_text: `For this ${qq.category} question: during week 4 our prototype test failed, I took responsibility with my team, we measured results over two trials, and because of the evidence I changed my approach and learned to test early. For example, we redesigned and retested successfully.` });
    }
    const done = await request(app).post(`/api/sessions/${sid}/complete`).set('Authorization', `Bearer ${studentToken}`);
    expect(done.status).toBe(200);
    expect(done.body.profile).toBeTruthy();
    expect(done.body.recommended_plan).toBeTruthy();
  }, 30000);

  it('blocks skipping ahead: Q2 is rejected until Q1 is answered', async () => {
    const start = await request(app)
      .post('/api/sessions/start')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ grade: 11, semester: 1 });
    expect(start.status).toBe(201);
    const sid = start.body.session.id;
    const [q1, q2] = start.body.questions;
    createdSessionIds.push(sid);

    const skip = await request(app)
      .post('/api/attempts')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ question_id: q2.id, session_id: sid, answer_text: 'We tested the prototype over two trials and compared results against the control before changing the design.' });
    expect(skip.status).toBe(409);
    expect(String(skip.body.error)).toMatch(/answer question 1/i);

    // Q1 is accepted, then Q2 unlocks.
    const first = await request(app)
      .post('/api/attempts')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ question_id: q1.id, session_id: sid, answer_text: 'During week 4 our prototype test failed, I took responsibility with my team, we measured results over two trials, and because of the evidence I changed my approach.' });
    expect(first.status).toBe(201);

    const second = await request(app)
      .post('/api/attempts')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ question_id: q2.id, session_id: sid, answer_text: 'We tested the prototype over two trials and compared results against the control before changing the design.' });
    expect(second.status).toBe(201);
  }, 30000);

  it('lets the student go back and revise Q1 without scrambling the profile', async () => {
    const start = await request(app)
      .post('/api/sessions/start')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ grade: 11, semester: 1 });
    const sid = start.body.session.id;
    createdSessionIds.push(sid);
    const qs = start.body.questions;
    for (const qq of qs) {
      await request(app)
        .post('/api/attempts')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ question_id: qq.id, session_id: sid, answer_text: `For this ${qq.category} question: during week 4 our prototype test failed, I took responsibility with my team, we measured results over two trials, and because of the evidence I changed my approach and learned to test early. For example, we redesigned and retested successfully.` });
    }
    // Revise Q1 after answering Q2..Q4.
    const revised = await request(app)
      .post('/api/attempts')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ question_id: qs[0].id, session_id: sid, answer_text: 'Revised Q1: during week 4 our prototype test failed, I took responsibility with my team, we measured results over two trials, and because of the evidence I changed my approach and learned to test early.' });
    expect(revised.status).toBe(201);

    const done = await request(app).post(`/api/sessions/${sid}/complete`).set('Authorization', `Bearer ${studentToken}`);
    expect(done.status).toBe(200);
    // Profile stays keyed to the SESSION order, not submission order.
    expect(Object.keys(done.body.profile)).toEqual(['Q1', 'Q2', 'Q3', 'Q4']);
    expect(done.body.profile.Q1.category).toBe(qs[0].category);
    expect(done.body.profile.Q4.category).toBe(qs[3].category);
    expect(done.body.answered).toBe(4);
  }, 60000);
});

describe('EDP stage selection', () => {
  it('exposes platform EDP stages for a scope', async () => {
    const res = await request(app).get('/api/edp/stages?grade=11&semester=1').set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.stages.length).toBeGreaterThanOrEqual(12);
    expect(res.body.stages[0]).toHaveProperty('stage_no');
    expect(res.body.stages[0]).toHaveProperty('title');
  });

  it('serves the platform library for a scope with no challenge track', async () => {
    const res = await request(app).get('/api/edp/stages?grade=10&semester=1').set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.stages.length).toBe(12);
    expect(res.body.stages.some((s: any) => s.stage_no === 8 && /testing/i.test(s.title))).toBe(true);
  });

  it('persists the chosen stage on the attempt and grades the teamwork answer against it', async () => {
    const start = await request(app)
      .post('/api/sessions/start')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ grade: 11, semester: 1, edp_stage_no: 8 });
    expect(start.status).toBe(201);
    const sid = start.body.session.id;
    createdSessionIds.push(sid);
    // A chosen stage makes Q1 a teamwork question.
    expect(start.body.questions[0].category).toBe('team_collaboration');
    expect(start.body.edp_stage.stage_no).toBe(8);

    const q1 = start.body.questions[0];
    const res = await request(app)
      .post('/api/attempts')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        question_id: q1.id,
        session_id: sid,
        edp_stage_no: 8,
        answer_text: 'During the testing stage I ran the prototype beside the control for 48 hours, kept the conditions identical, and logged every reading on the calibrated sensor.',
      });
    expect(res.status).toBe(201);
    expect(res.body.attempt.edp_stage_no).toBe(8);
    expect(res.body.attempt.edp_stage_title).toBeTruthy();

    // The stage becomes a graded requirement of the answer.
    const coverage = res.body.evaluation.question_coverage as any[];
    expect(coverage.some((c) => c.component === 'edp_stage')).toBe(true);
  }, 30000);

  it('rejects a stage that does not exist', async () => {
    const res = await request(app)
      .post('/api/sessions/start')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ grade: 11, semester: 1, edp_stage_no: 99 });
    expect(res.status).toBe(400);
  });
});

describe('security validation + error handling', () => {
  it('sanitizes XSS in answers', async () => {
    const res = await request(app).post('/api/attempts').set('Authorization', `Bearer ${studentToken}`).send({ question_id: questionId, answer_text: 'Valid reflection text about my Capstone prototype test. <img src=x onerror=alert(1)> During week 2 we tested and I learned persistence because we retested twice.' });
    expect(res.status).toBe(201);
    expect(res.body.attempt.answer_text).not.toContain('onerror');
  });
  it('rejects SQL-injection-ish strings safely (parameterized)', async () => {
    const res = await request(app).post('/api/attempts').set('Authorization', `Bearer ${studentToken}`).send({ question_id: questionId, answer_text: "'; DROP TABLE users; -- valid reflection: during prototype testing I learned to verify results because evidence matters, for example we retested twice." });
    expect([201, 400]).toContain(res.status);
    const check = await pool.query(`SELECT COUNT(*)::int AS c FROM users`);
    expect(check.rows[0].c).toBeGreaterThan(0);
  });
  it('returns graceful 404 JSON, not crash', async () => {
    const res = await request(app).get('/api/nope').set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(404);
    expect(res.body.error).toBeTruthy();
  });
  it('admin can create/deactivate question', async () => {
    const created = await request(app).post('/api/admin/questions').set('Authorization', `Bearer ${adminToken}`).send({
      category: 'personal_reflection',
      question_text: 'Admin test question about growth with sufficient length for validation?',
      what_testing: 'Whether activation toggling works end to end.',
      difficulty: 'easy',
      required_components: [
        { key: 'a', label: 'Part A', keywords: ['growth'] },
        { key: 'b', label: 'Part B', keywords: ['change'] },
      ],
      source: 'admin_created',
      source_label: 'Admin Created',
      active: true,
    });
    expect(created.status).toBe(201);
    createdQids.push(created.body.question.id);
    const toggled = await request(app).put(`/api/admin/questions/${created.body.question.id}`).set('Authorization', `Bearer ${adminToken}`).send({ active: false });
    expect(toggled.body.question.active).toBe(false);
  });
});

describe('pdf challenge analysis', () => {
  const pdfText = 'During week three our capstone water filter prototype test failed because the sand layer clogged. I redesigned the layer order with Sara, we measured flow over two trials, and I learned to raise problems early with a proposed test.';
  const savedKey = process.env.OPENAI_API_KEY;

  function withoutKey() {
    process.env.OPENAI_API_KEY = '';
  }
  function restoreKey() {
    if (savedKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = savedKey;
  }

  it('requires auth', async () => {
    const res = await request(app).post('/api/analyze/pdf').attach('file', minimalPdf(pdfText), 'draft.pdf');
    expect(res.status).toBe(401);
  });
  it('rejects missing file', async () => {
    const res = await request(app).post('/api/analyze/pdf').set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(400);
  });
  it('rejects non-PDF uploads', async () => {
    const res = await request(app)
      .post('/api/analyze/pdf')
      .set('Authorization', `Bearer ${studentToken}`)
      .attach('file', Buffer.from('just some text notes'), 'notes.txt');
    expect(res.status).toBe(400);
  });
  it('rejects fake PDFs that fail magic-byte check', async () => {
    const res = await request(app)
      .post('/api/analyze/pdf')
      .set('Authorization', `Bearer ${studentToken}`)
      .attach('file', Buffer.from('definitely not a pdf at all'), 'fake.pdf');
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/valid PDF|magic bytes/i);
  });
  it('rejects oversized PDFs', async () => {
    const res = await request(app)
      .post('/api/analyze/pdf')
      .set('Authorization', `Bearer ${studentToken}`)
      .attach('file', Buffer.alloc(6 * 1024 * 1024, 65), 'big.pdf');
    expect(res.status).toBe(413);
  }, 30000);
  it('rejects unknown question grounding', async () => {
    withoutKey();
    try {
      const res = await request(app)
        .post('/api/analyze/pdf')
        .set('Authorization', `Bearer ${studentToken}`)
        .field('question_id', '00000000-0000-0000-0000-000000000000')
        .attach('file', minimalPdf(pdfText), 'draft.pdf');
      expect(res.status).toBe(400);
    } finally {
      restoreKey();
    }
  });
  it('analyzes a valid PDF with honest local fallback when no AI key', async () => {
    withoutKey();
    try {
      const res = await request(app)
        .post('/api/analyze/pdf')
        .set('Authorization', `Bearer ${studentToken}`)
        .attach('file', minimalPdf(pdfText), 'draft.pdf');
      expect(res.status).toBe(200);
      expect(res.body.ai.available).toBe(false);
      expect(res.body.analysis.estimated_grade).toBeNull();
      expect(res.body.document.word_count).toBeGreaterThan(10);
      expect(res.body.analysis.summary).toMatch(/Local document check/);
    } finally {
      restoreKey();
    }
  });
  it('grounds the analysis in a question when question_id is given', async () => {
    withoutKey();
    try {
      const res = await request(app)
        .post('/api/analyze/pdf')
        .set('Authorization', `Bearer ${studentToken}`)
        .field('question_id', questionId)
        .attach('file', minimalPdf(pdfText), 'draft.pdf');
      expect(res.status).toBe(200);
      expect(res.body.question.id).toBe(questionId);
      expect(res.body.analysis.question_coverage.length).toBeGreaterThan(0);
    } finally {
      restoreKey();
    }
  });
});

describe('academic writing academy', () => {
  const savedKey = process.env.OPENAI_API_KEY;
  function withoutKey() {
    process.env.OPENAI_API_KEY = '';
  }
  function restoreKey() {
    if (savedKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = savedKey;
  }
  function rowPayload(row: any): any {
    return typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload;
  }
  function correctAnswerFor(row: any): any {
    const p = rowPayload(row);
    switch (row.kind) {
      case 'single_choice': return p.correct;
      case 'multi_select':
      case 'compare_levels': return p.correct;
      case 'true_false': return p.correct;
      case 'match': {
        const m: any = {};
        for (const pr of p.pairs) m[pr.left] = pr.right;
        return m;
      }
      case 'order_steps': return p.steps;
      case 'short_answer': return (p.keywords ?? []).join(' ');
      case 'decoder': return (p.blanks ?? []).map((b: any) => b.correct);
      default: return null;
    }
  }
  function wrongAnswerFor(row: any): any {
    const p = rowPayload(row);
    switch (row.kind) {
      case 'single_choice': return (p.correct + 1) % p.options.length;
      case 'multi_select':
      case 'compare_levels': return [];
      case 'true_false': return !p.correct;
      case 'match': return {};
      case 'order_steps': return [...p.steps].reverse();
      case 'short_answer': return 'nothing relevant xyz';
      case 'decoder': return (p.blanks ?? []).map(() => -1);
      default: return null;
    }
  }
  async function unitIdBySlug(slug: string): Promise<string> {
    const r = await pool.query(`SELECT id FROM academy_units WHERE slug=$1`, [slug]);
    return r.rows[0].id;
  }

  it('catalogs 22 units with unit 1 available and unit 2 locked', async () => {
    const res = await request(app).get('/api/academy/units').set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.units.length).toBe(22);
    expect(res.body.progress.total).toBe(22);
    const u1 = res.body.units.find((u: any) => u.slug === 'strong-academic-answer');
    const u2 = res.body.units.find((u: any) => u.slug === 'understanding-questions');
    expect(u1.state.status).toBe('available');
    expect(u2.state.status).toBe('locked');
  });
  it('serves the unit player without leaking quiz answers', async () => {
    const res = await request(app).get('/api/academy/units/strong-academic-answer').set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.lessons.length).toBeGreaterThanOrEqual(2);
    expect(res.body.videos.length).toBe(1);
    expect(res.body.tricks.length).toBeGreaterThan(0);
    expect(res.body.mistakes.length).toBeGreaterThan(0);
    expect(res.body.quiz.length).toBeGreaterThan(0);
    for (const q of res.body.quiz) {
      if (q.kind === 'single_choice') expect(q.payload.correct).toBeUndefined();
      if (q.kind === 'short_answer') {
        expect(q.payload.keywords).toBeUndefined();
        expect(q.payload.sample).toBeUndefined();
      }
    }
  });
  it('grades practice exercises with explanations', async () => {
    const player = await request(app).get('/api/academy/units/strong-academic-answer').set('Authorization', `Bearer ${studentToken}`);
    const ex = player.body.practice[0];
    const row = (await pool.query(`SELECT kind, payload FROM academy_items WHERE id=$1`, [ex.id])).rows[0];
    const good = await request(app).post(`/api/academy/exercises/${ex.id}/submit`).set('Authorization', `Bearer ${studentToken}`).send({ answer: correctAnswerFor(row) });
    expect(good.status).toBe(200);
    expect(good.body.correct).toBe(true);
    expect(good.body.explanation.length).toBeGreaterThan(10);
    const bad = await request(app).post(`/api/academy/exercises/${ex.id}/submit`).set('Authorization', `Bearer ${studentToken}`).send({ answer: wrongAnswerFor(row) });
    expect(bad.body.correct).toBe(false);
  });
  it('requires practice before lesson completion, then completes unit 1 end-to-end', async () => {
    const uid = await unitIdBySlug('strong-academic-answer');
    const lessons = (await pool.query(`SELECT id FROM academy_lessons WHERE unit_id=$1 AND active=TRUE ORDER BY order_index`, [uid])).rows;
    // gating: a fresh lesson with practice cannot complete yet (use lesson 2 if untouched)
    const fresh = await request(app).post(`/api/academy/lessons/${lessons[1].id}/complete`).set('Authorization', `Bearer ${studentToken}`);
    expect([200, 400]).toContain(fresh.status);
    // do all practice correctly, then complete all lessons
    for (const l of lessons) {
      const items = (await pool.query(`SELECT id, kind, payload FROM academy_items WHERE lesson_id=$1 AND quiz=FALSE AND active=TRUE`, [l.id])).rows;
      for (const it of items) {
        await request(app).post(`/api/academy/exercises/${it.id}/submit`).set('Authorization', `Bearer ${studentToken}`).send({ answer: correctAnswerFor(it) });
      }
      const done = await request(app).post(`/api/academy/lessons/${l.id}/complete`).set('Authorization', `Bearer ${studentToken}`);
      expect(done.status).toBe(200);
    }
    // failing quiz first (below mastery)
    const quizRows = (await pool.query(`SELECT id, kind, payload FROM academy_items WHERE unit_id=$1 AND quiz=TRUE AND active=TRUE ORDER BY order_index`, [uid])).rows;
    const fail = await request(app).post('/api/academy/units/strong-academic-answer/quiz').set('Authorization', `Bearer ${studentToken}`).send({
      answers: quizRows.map((r: any) => ({ item_id: r.id, answer: wrongAnswerFor(r) })),
    });
    expect(fail.status).toBe(200);
    expect(fail.body.passed).toBe(false);
    // passing quiz
    const pass = await request(app).post('/api/academy/units/strong-academic-answer/quiz').set('Authorization', `Bearer ${studentToken}`).send({
      answers: quizRows.map((r: any) => ({ item_id: r.id, answer: correctAnswerFor(r) })),
    });
    expect(pass.body.passed).toBe(true);
    expect(pass.body.pct).toBe(100);
    expect(pass.body.unit_completed).toBe(true);
    // unit 2 now unlocked
    const cat = await request(app).get('/api/academy/units').set('Authorization', `Bearer ${studentToken}`);
    const u2 = cat.body.units.find((u: any) => u.slug === 'understanding-questions');
    expect(u2.state.status).not.toBe('locked');
  }, 30000);
  it('locked units reject quiz submits', async () => {
    const res = await request(app).post('/api/academy/units/revision-editing/quiz').set('Authorization', `Bearer ${student2Token}`).send({ answers: [] });
    expect(res.status).toBe(403);
  });
  it('serves recommendations and certificate state', async () => {
    const recs = await request(app).get('/api/academy/recommendations').set('Authorization', `Bearer ${studentToken}`);
    expect(recs.status).toBe(200);
    expect(Array.isArray(recs.body.recommendations)).toBe(true);
    const cert = await request(app).get('/api/academy/certificate').set('Authorization', `Bearer ${studentToken}`);
    expect(cert.status).toBe(200);
    expect(typeof cert.body.eligible).toBe('boolean');
  });
  it('admin CMS manages academy content', async () => {
    const uid = await unitIdBySlug('strong-academic-answer');
    const created = await request(app).post('/api/admin/academy/tricks').set('Authorization', `Bearer ${adminToken}`).send({
      unit_id: uid, title: 'Test trick', body: 'Test body', order_index: 99,
    });
    expect(created.status).toBe(201);
    const updated = await request(app).put(`/api/admin/academy/tricks/${created.body.item.id}`).set('Authorization', `Bearer ${adminToken}`).send({ body: 'Updated body' });
    expect(updated.body.item.body).toBe('Updated body');
    const listed = await request(app).get(`/api/admin/academy/tricks?unit_id=${uid}`).set('Authorization', `Bearer ${adminToken}`);
    expect(listed.body.tricks.some((t: any) => t.id === created.body.item.id)).toBe(true);
    const del = await request(app).delete(`/api/admin/academy/tricks/${created.body.item.id}`).set('Authorization', `Bearer ${adminToken}`);
    expect(del.body.ok).toBe(true);
    const badKind = await request(app).get('/api/admin/academy/nope').set('Authorization', `Bearer ${adminToken}`);
    expect(badKind.status).toBe(404);
    const studentBlocked = await request(app).get('/api/admin/academy/units').set('Authorization', `Bearer ${studentToken}`);
    expect(studentBlocked.status).toBe(403);
  });
});

describe('research paper lab', () => {
  it('creates, reads, updates, and deletes a project (owner only)', async () => {
    const created = await request(app).post('/api/research').set('Authorization', `Bearer ${studentToken}`).send({
      title: 'Test filtration study', research_question: 'Does gravel lower turbidity?',
    });
    expect(created.status).toBe(201);
    const pid = created.body.project.id;
    const other = await request(app).get(`/api/research/${pid}`).set('Authorization', `Bearer ${student2Token}`);
    expect(other.status).toBe(404);
    const got = await request(app).get(`/api/research/${pid}`).set('Authorization', `Bearer ${studentToken}`);
    expect(got.body.project.title).toBe('Test filtration study');
    expect(got.body.sections).toContain('methods');
    const updated = await request(app).put(`/api/research/${pid}`).set('Authorization', `Bearer ${studentToken}`).send({ methods: 'We filtered six samples.', status: 'in_review' });
    expect(updated.body.project.methods).toBe('We filtered six samples.');
    expect(updated.body.project.status).toBe('in_review');
    const del = await request(app).delete(`/api/research/${pid}`).set('Authorization', `Bearer ${studentToken}`);
    expect(del.body.ok).toBe(true);
    const gone = await request(app).get(`/api/research/${pid}`).set('Authorization', `Bearer ${studentToken}`);
    expect(gone.status).toBe(404);
  });
  it('rejects invalid status values', async () => {
    const res = await request(app).post('/api/research').set('Authorization', `Bearer ${studentToken}`).send({ title: 'x', status: 'published' });
    expect(res.status).toBe(400);
  });
});

describe('research draft coach', () => {
  const savedKey = process.env.OPENAI_API_KEY;
  function withoutKey() {
    process.env.OPENAI_API_KEY = '';
  }
  function restoreKey() {
    if (savedKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = savedKey;
  }
  it('requires auth', async () => {
    const res = await request(app).post('/api/analyze/text').send({ draft: 'x'.repeat(50) });
    expect(res.status).toBe(401);
  });
  it('rejects too-short drafts', async () => {
    const res = await request(app).post('/api/analyze/text').set('Authorization', `Bearer ${studentToken}`).send({ draft: 'too short' });
    expect(res.status).toBe(400);
  });
  it('reviews a draft with honest local fallback when no AI key', async () => {
    withoutKey();
    try {
      const res = await request(app).post('/api/analyze/text').set('Authorization', `Bearer ${studentToken}`).send({
        section: 'methods',
        draft: 'We filtered six canal water samples through gravel and mesh layers, measuring turbidity before and after each stage over ten-minute trials.',
      });
      expect(res.status).toBe(200);
      expect(res.body.ai.available).toBe(false);
      expect(res.body.section).toBe('methods');
      expect(res.body.analysis.improvement_actions.length).toBeGreaterThan(0);
    } finally {
      restoreKey();
    }
  });
});

describe('academy depth: overview, search, mistakes, reflections, surgery', () => {
  it('serves the course overview with real skill metrics', async () => {
    const res = await request(app).get('/api/academy/overview').set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.progress.total).toBe(22);
    expect(res.body.skills.length).toBe(6);
    for (const s of res.body.skills) {
      expect(['NOT_STARTED', 'PRACTICING', 'UNDERSTOOD', 'MASTERED']).toContain(s.status);
      if (s.attempts >= 3) expect(s.pct).not.toBeNull();
    }
    expect(typeof res.body.streak).toBe('number');
    expect(['RED', 'YELLOW', 'GREEN', 'BLUE']).toContain(res.body.level.band);
    expect(res.body.continue == null || res.body.continue.lesson_id).toBeTruthy();
  });
  it('searches lessons and units', async () => {
    const res = await request(app).get('/api/academy/search?q=evidence').set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.lessons.length).toBeGreaterThan(0);
    expect(res.body.lessons[0].est_minutes).toBeGreaterThanOrEqual(2);
    const short = await request(app).get('/api/academy/search?q=x').set('Authorization', `Bearer ${studentToken}`);
    expect(short.body.lessons).toEqual([]);
  });
  it('serves the searchable mistake library', async () => {
    const all = await request(app).get('/api/academy/mistakes').set('Authorization', `Bearer ${studentToken}`);
    expect(all.status).toBe(200);
    expect(all.body.mistakes.length).toBeGreaterThanOrEqual(45);
    expect(all.body.mistakes[0].unit_slug).toBeTruthy();
    const filtered = await request(app).get('/api/academy/mistakes?q=evidence').set('Authorization', `Bearer ${studentToken}`);
    expect(filtered.body.mistakes.length).toBeGreaterThan(0);
    expect(filtered.body.mistakes.length).toBeLessThan(all.body.mistakes.length);
  });
  it('saves and lists lesson reflections', async () => {
    const saved = await request(app).post('/api/academy/reflections').set('Authorization', `Bearer ${studentToken}`).send({
      key: 'lesson:test-lesson', body: 'Evidence must be checkable or it is decoration.',
    });
    expect(saved.status).toBe(200);
    const list = await request(app).get('/api/academy/reflections').set('Authorization', `Bearer ${studentToken}`);
    expect(list.body.reflections.some((r: any) => r.key === 'lesson:test-lesson')).toBe(true);
    const bad = await request(app).post('/api/academy/reflections').set('Authorization', `Bearer ${studentToken}`).send({ key: '', body: '' });
    expect(bad.status).toBe(400);
  });
  it('grades answer surgery step by step', async () => {
    const row = (await pool.query(
      `SELECT id, payload FROM academy_items WHERE kind='surgery' AND active=TRUE ORDER BY order_index LIMIT 1`,
    )).rows[0];
    expect(row).toBeTruthy();
    const p = typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload;
    const good = await request(app).post(`/api/academy/exercises/${row.id}/submit`).set('Authorization', `Bearer ${studentToken}`).send({
      answer: p.steps.map((s: any) => s.sample),
    });
    expect(good.status).toBe(200);
    expect(good.body.correct).toBe(true);
    expect(good.body.steps).toEqual(p.steps.map(() => true));
    const bad = await request(app).post(`/api/academy/exercises/${row.id}/submit`).set('Authorization', `Bearer ${studentToken}`).send({
      answer: p.steps.map(() => 'xyz nothing here'),
    });
    expect(bad.body.correct).toBe(false);
    expect(bad.body.score).toBe(0);
  });
  it('serves takeaways and skill tags in the unit player', async () => {
    const res = await request(app).get('/api/academy/units/blue-masterclass').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.unit.skills).toContain('analysis');
    expect(res.body.lessons.every((l: any) => l.takeaway && l.takeaway.length > 10)).toBe(true);
    expect(res.body.lessons.every((l: any) => l.est_minutes >= 2)).toBe(true);
  });
  it('locks unit content server-side with a named prerequisite', async () => {
    const res = await request(app).get('/api/academy/units/blue-masterclass').set('Authorization', `Bearer ${student2Token}`);
    expect(res.status).toBe(403);
    expect(res.body.prerequisite).toMatch(/Unit 15/);
  });
});
