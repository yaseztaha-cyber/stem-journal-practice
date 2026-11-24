import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/index';
import { pool } from '../src/db';

function uniq(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1e6)}@test.local`;
}

let studentToken = '';
let adminToken = '';

beforeAll(async () => {
  const email = uniq('sem');
  const reg = await request(app).post('/api/auth/register').send({ email, password: 'Password123!', display_name: 'Sem Student' });
  studentToken = reg.body.token;
  const login = await request(app).post('/api/auth/login').send({ email: 'admin@stemjournal.local', password: process.env.ADMIN_PASSWORD ?? 'Admin123!' });
  adminToken = login.body.token;
});

const createdQids: string[] = [];

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
  await pool.end();
});

const auth = (t: string) => ({ Authorization: `Bearer ${t}` });

describe('grade/semester scoping', () => {
  it('rejects grade without semester and out-of-range values', async () => {
    expect((await request(app).get('/api/questions?grade=11').set(auth(studentToken))).status).toBe(400);
    expect((await request(app).get('/api/questions?grade=9&semester=1').set(auth(studentToken))).status).toBe(400);
    expect((await request(app).get('/api/questions?grade=11&semester=3').set(auth(studentToken))).status).toBe(400);
  });

  it('G11 S1 returns scoped + shared-pool rows only (never G10/G12 official)', async () => {
    const res = await request(app).get('/api/questions?grade=11&semester=1').set(auth(studentToken));
    expect(res.status).toBe(200);
    expect(res.body.questions.length).toBeGreaterThan(0);
    for (const q of res.body.questions) {
      expect(q.grade === null || q.grade === 11).toBe(true);
      expect(q.semester === null || q.semester === 1).toBe(true);
      // scope metadata is exposed for honest labeling
      expect(q).toHaveProperty('question_slot');
      expect(q).toHaveProperty('question_type');
      expect(q).toHaveProperty('source');
    }
    const scoped = res.body.questions.filter((q: any) => q.grade === 11 && q.semester === 1);
    expect(scoped.length).toBeGreaterThan(0);
  });

  it('G10 S1 contains no G11-official questions', async () => {
    const res = await request(app).get('/api/questions?grade=10&semester=1').set(auth(studentToken));
    expect(res.status).toBe(200);
    expect(res.body.questions.some((q: any) => q.grade === 11)).toBe(false);
  });

  it('scoped /next stays in scope', async () => {
    const res = await request(app).get('/api/questions/next?category=learning_transfer&grade=11&semester=1').set(auth(studentToken));
    expect(res.status).toBe(200);
    expect(res.body.question.grade === null || res.body.question.grade === 11).toBe(true);
  });
});

describe('mock journal structure (Q1 slot / Q2 EDP / Q3+Q4 transfer)', () => {
  it('builds a spec-shaped G11 S1 mock', async () => {
    const res = await request(app).post('/api/sessions/start').set(auth(studentToken)).send({ grade: 11, semester: 1 });
    expect(res.status).toBe(201);
    expect(res.body.session.grade).toBe(11);
    expect(res.body.session.semester).toBe(1);
    const qs = res.body.questions;
    expect(qs).toHaveLength(4);
    const slots = qs.map((q: any) => q.question_slot).sort();
    expect(slots[0]).toBe(1);
    expect(slots[1]).toBe(2);
    expect(qs.filter((q: any) => q.category === 'learning_transfer')).toHaveLength(2);
    expect(qs[1].category === 'engineering_design_process' || qs.some((q: any) => q.category === 'engineering_design_process')).toBe(true);
    const ids = new Set(qs.map((q: any) => q.id));
    expect(ids.size).toBe(4);
  });

  it('rejects invalid scope on mock start', async () => {
    expect((await request(app).post('/api/sessions/start').set(auth(studentToken)).send({ grade: 11 })).status).toBe(400);
  });
});

describe('transfer LO filtering', () => {
  let loQid = '';
  it('admin can tag a transfer question with LOs', async () => {
    const created = await request(app).post('/api/admin/questions').set(auth(adminToken)).send({
      category: 'learning_transfer',
      question_text: 'LO filter mechanics probe question with sufficient length for validation.',
      what_testing: 'Whether the LO filter mechanics work end to end.',
      required_components: [
        { key: 'a', label: 'Part A', keywords: ['x'] },
        { key: 'b', label: 'Part B', keywords: ['y'] },
      ],
      source: 'admin_created',
      grade: 11,
      semester: 1,
      question_slot: 3,
      question_type: 'LEARNING_TRANSFER',
      learning_objectives: ['CH.2.01'],
    });
    expect(created.status).toBe(201);
    loQid = created.body.question.id;
    createdQids.push(loQid);
  });

  it('los filter keeps matching LOs and drops others', async () => {
    const keep = await request(app).get('/api/questions?category=learning_transfer&grade=11&semester=1&los=CH.2.01').set(auth(studentToken));
    expect(keep.status).toBe(200);
    expect(keep.body.questions.some((q: any) => q.id === loQid)).toBe(true);
    for (const q of keep.body.questions) {
      expect(q.learning_objectives).toContain('CH.2.01');
    }
    const drop = await request(app).get('/api/questions?category=learning_transfer&grade=11&semester=1&los=MA.9.99').set(auth(studentToken));
    expect(drop.status).toBe(200);
    expect(drop.body.questions.some((q: any) => q.id === loQid)).toBe(false);
  });

  it('rejects malformed LOs and LOs on non-transfer categories', async () => {
    expect((await request(app).get('/api/questions?category=learning_transfer&grade=11&semester=1&los=not-a-code!!').set(auth(studentToken))).status).toBe(400);
    expect((await request(app).get('/api/questions?category=personal_reflection&grade=11&semester=1&los=CH.2.01').set(auth(studentToken))).status).toBe(400);
  });

  it('mock start honors LOs and reports honestly when the pool is empty', async () => {
    const ok = await request(app).post('/api/sessions/start').set(auth(studentToken)).send({ grade: 11, semester: 1, los: ['CH.2.01'] });
    expect(ok.status).toBe(201);
    expect(ok.body.questions.filter((q: any) => q.category === 'learning_transfer').every((q: any) => (q.learning_objectives ?? []).includes('CH.2.01'))).toBe(true);
    const empty = await request(app).post('/api/sessions/start').set(auth(studentToken)).send({ grade: 11, semester: 1, los: ['MA.9.99'] });
    expect(empty.status).toBe(404);
    expect(empty.body.error).toMatch(/LOs/i);
  });
});

describe('official LO coverage', () => {
  it('tags verifiable official transfer questions (never invents others)', async () => {
    const elec = await pool.query(
      `SELECT learning_objectives FROM questions WHERE category='learning_transfer' AND question_text LIKE '%electrostatics principle in your project%' LIMIT 1`,
    );
    expect(elec.rows[0].learning_objectives).toContain('PH.2.02');
    const snell = await pool.query(
      `SELECT learning_objectives FROM questions WHERE category='learning_transfer' AND question_text LIKE '%Snell%' LIMIT 1`,
    );
    expect(snell.rows[0].learning_objectives).toContain('PH.3.01');
    const left = await pool.query(
      `SELECT COUNT(*)::int AS n FROM questions WHERE category='learning_transfer' AND (learning_objectives IS NULL OR learning_objectives='{}') AND source IN ('official','official_example','official_adapted')`,
    );
    // Generic/meta questions with no verifiable LO stay honestly untagged.
    expect(left.rows[0].n).toBeLessThanOrEqual(25);
  });
});

describe('EDP challenges', () => {
  it('lists the G11 S1 official challenge and nothing else', async () => {
    const res = await request(app).get('/api/challenges?grade=11&semester=1').set(auth(studentToken));
    expect(res.status).toBe(200);
    expect(res.body.challenges).toHaveLength(1);
    expect(res.body.challenges[0].title).toBe('Smart Sustainable Food Packaging');
    expect(res.body.challenges[0].theme).toMatch(/Change, Equilibrium, and Cycles/);
  });

  it('returns empty (not fabricated) for semesters without imports', async () => {
    const res = await request(app).get('/api/challenges?grade=10&semester=1').set(auth(studentToken));
    expect(res.status).toBe(200);
    expect(res.body.challenges).toHaveLength(0);
  });

  it('challenge detail carries requirements, measurements, safety, evaluation day', async () => {
    const list = await request(app).get('/api/challenges?grade=11&semester=1').set(auth(studentToken));
    const det = await request(app).get(`/api/challenges/${list.body.challenges[0].id}`).set(auth(studentToken));
    expect(det.status).toBe(200);
    const secs = Object.fromEntries(det.body.sections.map((s: any) => [s.section, s.body]));
    expect(secs.measurements).toMatch(/1\.0 L/);
    expect(secs.measurements).toMatch(/120 h/);
    expect(secs.constraints).toMatch(/must not be consumed/);
    expect(det.body.challenge.evaluation_day).toMatch(/reference scale/i);
  });

  it('unknown challenge id reports not-yet-imported', async () => {
    const res = await request(app).get('/api/challenges/00000000-0000-0000-0000-000000000000').set(auth(studentToken));
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not yet imported/i);
  });
});

describe('scoped progress + admin scope guardrails', () => {
  it('scoped progress separates semesters', async () => {
    const a = await request(app).get('/api/progress?grade=11&semester=1').set(auth(studentToken));
    const b = await request(app).get('/api/progress?grade=10&semester=1').set(auth(studentToken));
    expect(a.status).toBe(200);
    expect(b.status).toBe(200);
    expect(a.body).toHaveProperty('by_category');
    expect(a.body).toHaveProperty('totals');
  });

  it('admin cannot split grade/semester on a question', async () => {
    const created = await request(app).post('/api/admin/questions').set(auth(adminToken)).send({
      category: 'learning_transfer',
      question_text: 'Scoped admin test question with enough length to pass validation rules here.',
      what_testing: 'Whether split grade/semester is rejected.',
      required_components: [
        { key: 'a', label: 'Part A', keywords: ['x'] },
        { key: 'b', label: 'Part B', keywords: ['y'] },
      ],
      source: 'admin_created',
      grade: 11,
    });
    expect(created.status).toBe(400);
  });

  it('admin can create a scoped question and manage challenge sections', async () => {
    const created = await request(app).post('/api/admin/questions').set(auth(adminToken)).send({
      category: 'learning_transfer',
      question_text: 'Scoped admin test question with enough length to pass validation rules here.',
      what_testing: 'Whether scoped visibility isolates semesters.',
      required_components: [
        { key: 'a', label: 'Part A', keywords: ['x'] },
        { key: 'b', label: 'Part B', keywords: ['y'] },
      ],
      source: 'admin_created',
      grade: 11,
      semester: 1,
      question_slot: 3,
      question_type: 'LEARNING_TRANSFER',
    });
    expect(created.status).toBe(201);
    createdQids.push(created.body.question.id);
    expect(created.body.question.grade).toBe(11);
    const list = await request(app).get('/api/questions?grade=10&semester=1').set(auth(studentToken));
    expect(list.body.questions.some((q: any) => q.id === created.body.question.id)).toBe(false);
    const inScope = await request(app).get('/api/questions?grade=11&semester=1').set(auth(studentToken));
    expect(inScope.body.questions.some((q: any) => q.id === created.body.question.id)).toBe(true);

    const ch = await request(app).get('/api/admin/challenges').set(auth(adminToken));
    expect(ch.status).toBe(200);
    expect(ch.body.challenges.length).toBeGreaterThan(0);
  });
});
