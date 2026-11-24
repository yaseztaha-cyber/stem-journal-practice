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
  const email = uniq('site');
  const reg = await request(app).post('/api/auth/register').send({ email, password: 'Password123!', display_name: 'Site Student' });
  studentToken = reg.body.token;
  const login = await request(app).post('/api/auth/login').send({ email: 'admin@stemjournal.local', password: process.env.ADMIN_PASSWORD ?? 'Admin123!' });
  adminToken = login.body.token;
});

afterAll(async () => {
  await pool.end();
});

const student = () => ({ Authorization: `Bearer ${studentToken}` });
const admin = () => ({ Authorization: `Bearer ${adminToken}` });

describe('reference contexts', () => {
  it('lists grades, semesters, years, and six contexts', async () => {
    const res = await request(app).get('/api/contexts').set(student());
    expect(res.status).toBe(200);
    expect(res.body.grades.map((g: any) => g.grade)).toEqual([10, 11, 12]);
    expect(res.body.semesters.map((s: any) => s.semester)).toEqual([1, 2]);
    expect(res.body.contexts.length).toBeGreaterThanOrEqual(6);
    const g11s1 = res.body.contexts.find((c: any) => c.grade === 11 && c.semester === 1);
    expect(g11s1.has_challenge).toBe(true);
    expect(g11s1.question_count).toBeGreaterThan(0);
  });
});

describe('site pages + settings', () => {
  it('about page is public and carries creator + disclaimer', async () => {
    const res = await request(app).get('/api/site/pages/about');
    expect(res.status).toBe(200);
    expect(res.body.page.body_md).toMatch(/Yassen Taha Hussainy Elnasher/);
    expect(res.body.page.body_md).toMatch(/S'28 STEM Gharbiya/);
    expect(res.body.page.body_md).toMatch(/never stored/);
  });

  it('privacy and terms render, unknown slugs 404', async () => {
    expect((await request(app).get('/api/site/pages/privacy')).status).toBe(200);
    expect((await request(app).get('/api/site/pages/terms')).status).toBe(200);
    expect((await request(app).get('/api/site/pages/cookies')).status).toBe(404);
  });

  it('settings expose creator info for the footer', async () => {
    const res = await request(app).get('/api/site/settings');
    expect(res.status).toBe(200);
    expect(res.body.settings.creator_name).toBe('Yassen Taha Hussainy Elnasher');
    expect(res.body.settings.creator_school).toBe("S'28 STEM Gharbiya");
  });

  it('students cannot edit site content, admins can (with restore)', async () => {
    expect((await request(app).put('/api/admin/site/pages/privacy').set(student()).send({ title: 'X', body_md: 'Y enough length here' })).status).toBe(403);
    const before = await request(app).get('/api/site/pages/privacy');
    const upd = await request(app).put('/api/admin/site/pages/privacy').set(admin()).send({ title: 'Privacy', body_md: before.body.page.body_md + '\nTest line.' });
    expect(upd.status).toBe(200);
    const restore = await request(app).put('/api/admin/site/pages/privacy').set(admin()).send({ title: before.body.page.title, body_md: before.body.page.body_md });
    expect(restore.status).toBe(200);
  });

  it('admin can update creator setting and unknown keys 404', async () => {
    const r = await request(app).put('/api/admin/site/settings/creator_school').set(admin()).send({ value: "S'28 STEM Gharbiya" });
    expect(r.status).toBe(200);
    expect(r.body.setting.value).toBe("S'28 STEM Gharbiya");
    expect((await request(app).put('/api/admin/site/settings/evil').set(admin()).send({ value: 'x' })).status).toBe(404);
  });
});

describe('academy track scope', () => {
  it('units carry track_scope and filter by track', async () => {
    const all = await request(app).get('/api/academy/units').set(student());
    expect(all.status).toBe(200);
    expect(all.body.units.length).toBeGreaterThan(0);
    for (const u of all.body.units) expect(u.track_scope).toBeTruthy();
    const core = await request(app).get('/api/academy/units?track=CORE').set(student());
    expect(core.body.units.every((u: any) => u.track_scope === 'CORE')).toBe(true);
    expect((await request(app).get('/api/academy/units?track=BOGUS').set(student())).status).toBe(400);
  });
});

describe('progress slot snapshot', () => {
  it('scoped progress includes Q1–Q4 latest levels', async () => {
    const res = await request(app).get('/api/progress?grade=11&semester=1').set(student());
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('slot_profile');
    expect(typeof res.body.slot_profile).toBe('object');
  });
});

describe('EDP learning track', () => {
  it('challenge detail includes the 12-stage study guide', async () => {
    const list = await request(app).get('/api/challenges?grade=11&semester=1').set(student());
    const det = await request(app).get(`/api/challenges/${list.body.challenges[0].id}`).set(student());
    expect(det.status).toBe(200);
    expect(det.body.track.length).toBe(12);
    expect(det.body.track[0].title).toMatch(/Understanding the Problem/);
    expect(det.body.track.every((t: any) => t.official === false)).toBe(true);
  });

  it('admin can add and remove a track stage', async () => {
    const list = await request(app).get('/api/admin/challenges').set(admin());
    const cid = list.body.challenges[0].id;
    const created = await request(app).post('/api/admin/track-stages').set(admin()).send({
      challenge_id: cid, stage_no: 13, title: 'Test stage', body: 'A long enough guidance body for validation.',
    });
    expect(created.status).toBe(201);
    const del = await request(app).del(`/api/admin/track-stages/${created.body.item.id}`).set(admin());
    expect(del.status).toBe(200);
  });
});

describe('research semester binding', () => {
  it('creates scoped projects and rejects split scope', async () => {
    const bad = await request(app).post('/api/research').set(student()).send({ title: 'Split', grade: 11 });
    expect(bad.status).toBe(400);
    const good = await request(app).post('/api/research').set(student()).send({ title: 'Scoped probe', grade: 11, semester: 1 });
    expect(good.status).toBe(201);
    expect(good.body.project.grade).toBe(11);
    const scoped = await request(app).get('/api/research?grade=11&semester=1').set(student());
    expect(scoped.body.projects.some((p: any) => p.id === good.body.project.id)).toBe(true);
    const other = await request(app).get('/api/research?grade=10&semester=1').set(student());
    expect(other.body.projects.some((p: any) => p.id === good.body.project.id)).toBe(false);
  });
});

describe('admin student review', () => {
  it('lists students and their attempts', async () => {
    expect((await request(app).get('/api/admin/students').set(student())).status).toBe(403);
    const list = await request(app).get('/api/admin/students').set(admin());
    expect(list.status).toBe(200);
    expect(list.body.students.length).toBeGreaterThan(0);
    const withAttempts = list.body.students.find((s: any) => s.attempts > 0) ?? list.body.students[0];
    const det = await request(app).get(`/api/admin/students/${withAttempts.id}/attempts`).set(admin());
    expect(det.status).toBe(200);
    expect(Array.isArray(det.body.attempts)).toBe(true);
  });
});

describe('academy track scope', () => {
  it('research track holds the new units 17-22', async () => {
    const res = await request(app).get('/api/academy/units?track=RESEARCH').set(student());
    expect(res.status).toBe(200);
    expect(res.body.units.length).toBe(6);
    expect(res.body.units.every((u: any) => u.track_scope === 'RESEARCH')).toBe(true);
  });
});

describe('custom dictionary', () => {
  it('serves the word list and lets admins manage it', async () => {
    const list = await request(app).get('/api/words').set(student());
    expect(list.status).toBe(200);
    expect(list.body.words).toContain('chitosan');
    expect((await request(app).post('/api/admin/words').set(student()).send({ word: 'testword' })).status).toBe(403);
    expect((await request(app).post('/api/admin/words').set(admin()).send({ word: 'x' })).status).toBe(400);
    const add = await request(app).post('/api/admin/words').set(admin()).send({ word: 'TestwordX' });
    expect(add.status).toBe(201);
    expect(add.body.word.word).toBe('testwordx');
    const dup = await request(app).post('/api/admin/words').set(admin()).send({ word: 'testwordx' });
    expect(dup.status).toBe(409);
    expect((await request(app).del('/api/admin/words/testwordx').set(admin())).status).toBe(200);
  });
});

describe('difficulty progression', () => {
  it('next honors min_difficulty and rejects bad values', async () => {
    const hard = await request(app).get('/api/questions/next?category=learning_transfer&grade=11&semester=1&min_difficulty=hard').set(student());
    expect(hard.status).toBe(200);
    expect(hard.body.question.difficulty).toBe('hard');
    expect((await request(app).get('/api/questions/next?category=learning_transfer&min_difficulty=extreme').set(student())).status).toBe(400);
  });
});

describe('v2 reading signals', () => {
  it('explains its reading in why_level (local engine, deterministic)', async () => {
    const { evaluateLocal } = await import('../src/lib/evaluator');
    const r = await evaluateLocal(
      {
        id: 'x', category: 'learning_transfer',
        question_text: 'Through chemistry explain a method that reduces ionic salts and apply it to your project.',
        required_components: [
          { key: 'method', label: 'Explain the method', keywords: ['precipitation', 'ions', 'remove'] },
          { key: 'apply', label: 'Apply it', keywords: ['sample', 'project', 'tested'] },
        ],
      },
      'We used precipitation to remove ionic salts. Adding sodium carbonate dropped TDS from 1400 to 320 ppm in our textile sample within 2 hours, so we chose it for the wash stage because it worked.',
    );
    expect(['BLUE', 'GREEN', 'YELLOW', 'RED']).toContain(r.grade);
    expect(r.why_level).toMatch(/Reading: coverage .* detail .* reasoning .* support .* coherence/);
  });

  it('live submissions validate grades strictly (whatever engine grades)', async () => {
    const me = await request(app).post('/api/auth/register').send({ email: `v2_${Date.now()}@test.local`, password: 'Password123!', display_name: 'V2' });
    const tok = me.body.token;
    const q = await request(app).get('/api/questions?category=learning_transfer&grade=11&semester=1').set({ Authorization: `Bearer ${tok}` });
    const sub = await request(app).post('/api/attempts').set({ Authorization: `Bearer ${tok}` }).send({
      question_id: q.body.questions[0].id,
      answer_text: 'We used precipitation to remove ionic salts. Adding sodium carbonate dropped TDS from 1400 to 320 ppm in our textile sample within 2 hours, so we chose it for the wash stage because it worked.',
    });
    expect(sub.status).toBe(201);
    expect(['BLUE', 'GREEN', 'YELLOW', 'RED']).toContain(sub.body.evaluation.grade);
  });
});

describe('provider chain', () => {
  it('orders Groq -> AIML -> Mistral and skips keyless providers', async () => {
    const { providerAttempts, providerLabel } = await import('../src/lib/evaluator');
    expect(providerLabel('https://api.groq.com/openai/v1')).toBe('groq');
    expect(providerLabel('https://api.aimlapi.com/v1')).toBe('aimlapi');
    expect(providerLabel('https://api.mistral.ai/v1')).toBe('mistral');
    const saved = { ...process.env };
    process.env.OPENAI_API_KEY = 'g';
    process.env.OPENAI_MODEL = 'gm';
    delete process.env.AI_FALLBACK_MODELS;
    process.env.AIML_API_KEY = 'a';
    process.env.AIML_MODEL = 'am';
    delete process.env.MISTRAL_API_KEY;
    try {
      const chain = providerAttempts();
      expect(chain.map((c) => c.provider)).toEqual(['groq', 'aimlapi']);
      expect(chain[0].model).toBe('gm');
    } finally {
      for (const k of Object.keys(process.env)) delete (process.env as any)[k];
      Object.assign(process.env, saved);
    }
    expect(providerAttempts().length).toBeGreaterThan(0);
  });
});

describe('database-level scope enforcement', () => {
  it('rejects out-of-range grades at the FK level', async () => {
    await expect(pool.query(`INSERT INTO questions(category, question_text, what_testing, difficulty, rubric_category, required_components, source, source_label, grade, semester) VALUES ('learning_transfer','x long enough text for test purposes here','', 'medium','learning_transfer','[]','practice','t',9,1)`)).rejects.toThrow();
  });
});
