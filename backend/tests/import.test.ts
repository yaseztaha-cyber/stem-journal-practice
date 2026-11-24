import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/index';
import { pool } from '../src/db';
import { segmentJournal } from '../src/lib/journalImport';

function uniq(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1e6)}@test.local`;
}

let adminToken = '';

beforeAll(async () => {
  const login = await request(app).post('/api/auth/login').send({ email: 'admin@stemjournal.local', password: process.env.ADMIN_PASSWORD ?? 'Admin123!' });
  adminToken = login.body.token;
});

afterAll(async () => {
  await pool.end();
});

const admin = () => ({ Authorization: `Bearer ${adminToken}` });

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

const SAMPLE_JOURNAL = [
  'Describe a challenge your team faced while building the prototype and explain how you solved it together with your teammates in detail.',
  'Our water filter cracked during the first test because the seal was too thin and pressure built up inside the container overnight which caused leaking.',
  'We redesigned the seal with double layers and tested again for three days until the leak stopped completely and the results were stable.',
  'Through chemistry explain how precipitation removes ionic salts from a sample and apply it to your water project with measured results.',
  'We added sodium carbonate which caused precipitation of calcium salts and the TDS dropped from 1400 to 320 parts per million within two hours of treatment.',
  'This proved the method works for our textile factory sample and we selected it for the washing stage of our prototype design process.',
].join('\n');

describe('segmentJournal', () => {
  it('splits questions and answers with category guesses', () => {
    const out = segmentJournal(SAMPLE_JOURNAL);
    expect(out.length).toBe(2);
    expect(out[0].categoryGuess).toBe('team_collaboration');
    expect(out[1].categoryGuess).toBe('learning_transfer');
    expect(out[0].answer.length).toBeGreaterThan(150);
  });

  it('rejects fragments and non-English noise', () => {
    expect(segmentJournal('short question here?')).toEqual([]);
    expect(segmentJournal('Is this long enough to be a real journal question for testing purposes here?')).toEqual([]);
    expect(segmentJournal('نص عربي طويل هنا لا يجب أن يستخرج كسؤال أبدا على الإطلاق')).toEqual([]);
  });
});

async function minimalDocx(paragraphs: string[]): Promise<Buffer> {
  const JSZip = (await import('jszip')).default ?? (await import('jszip'));
  const zip: any = new (JSZip as any)();
  zip.file(
    '[Content_Types].xml',
    '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
  );
  const paras = paragraphs.map((p) => `<w:p><w:r><w:t xml:space="preserve">${p}</w:t></w:r></w:p>`).join('');
  zip.file('word/document.xml', `<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${paras}</w:body></w:document>`);
  return zip.generateAsync({ type: 'nodebuffer' });
}

describe('journal import endpoints', () => {
  it('students cannot parse or commit', async () => {
    const email = uniq('imp');
    await request(app).post('/api/auth/register').send({ email, password: 'Password123!', display_name: 'Imp' });
    const login = await request(app).post('/api/auth/login').send({ email, password: 'Password123!' });
    const h = { Authorization: `Bearer ${login.body.token}` };
    expect((await request(app).post('/api/admin/journal-import/parse').set(h).attach('file', Buffer.from('x'), 'a.txt')).status).toBe(403);
    expect((await request(app).post('/api/admin/journal-import/commit').set(h).send({ items: [] })).status).toBe(403);
  });

  it('parses a TXT journal into candidates', async () => {
    const res = await request(app).post('/api/admin/journal-import/parse').set(admin()).attach('file', Buffer.from(SAMPLE_JOURNAL), 'journal.txt');
    expect(res.status).toBe(200);
    expect(res.body.candidates.length).toBe(2);
    expect(res.body.filename).toBe('journal.txt');
  });

  it('parses a PDF journal into candidates', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const pdfPath = path.join(__dirname, '..', '..', 'Journal_Guide.pdf');
    const pdf = fs.readFileSync(pdfPath);
    const res = await request(app).post('/api/admin/journal-import/parse').set(admin()).attach('file', pdf, 'Journal_Guide.pdf');
    expect(res.status).toBe(200);
    expect(res.body.chars).toBeGreaterThan(10000);
    expect(res.body.candidates.length).toBeGreaterThanOrEqual(1);
    for (const c of res.body.candidates) {
      expect(c.question.length).toBeGreaterThanOrEqual(40);
      expect(c.answer.length).toBeGreaterThanOrEqual(150);
    }
  });

  it('parses a DOCX journal into candidates', async () => {
    const docx = await minimalDocx([
      'Describe a challenge your team faced while building the prototype and explain in detail how you solved it together as a team with clear steps?',
      'Our water filter cracked during the first test because the seal was too thin and pressure built up inside the container overnight which caused serious leaking.',
      'We redesigned the seal with double layers and tested again for three days until the leak stopped completely and the results stayed stable.',
    ]);
    const res = await request(app).post('/api/admin/journal-import/parse').set(admin()).attach('file', docx, 'journal.docx');
    expect(res.status).toBe(200);
    expect(res.body.candidates.length).toBeGreaterThanOrEqual(1);
    expect(res.body.candidates[0].answer.length).toBeGreaterThanOrEqual(150);
  });

  it('student analyze accepts DOCX and returns extract for grading', async () => {
    const email = uniq('docx');
    await request(app).post('/api/auth/register').send({ email, password: 'Password123!', display_name: 'Docx' });
    const login = await request(app).post('/api/auth/login').send({ email, password: 'Password123!' });
    const h = { Authorization: `Bearer ${login.body.token}` };
    const docx = await minimalDocx([
      'Our team built a water filter prototype and tested it for five days with daily readings of clarity and flow rate in the school laboratory.',
      'The first seal leaked badly so we doubled the gasket thickness and repeated all measurements until results were stable and trustworthy.',
    ]);
    const res = await request(app).post('/api/analyze/pdf').set(h).attach('file', docx, 'journal.docx');
    expect(res.status).toBe(200);
    expect(res.body.document.word_count).toBeGreaterThan(10);
    expect(typeof res.body.extract).toBe('string');
    expect(res.body.extract.length).toBeGreaterThan(50);
  });

  it('rejects garbage files and bad commits', async () => {
    const bad = await request(app).post('/api/admin/journal-import/parse').set(admin()).attach('file', Buffer.from('not a pdf at all, just text here!!'), 'j.pdf');
    expect(bad.status).toBe(400);
    const empty = await request(app).post('/api/admin/journal-import/commit').set(admin()).send({ items: [] });
    expect(empty.status).toBe(400);
    const split = await request(app).post('/api/admin/journal-import/commit').set(admin()).send({
      items: [{ question_text: 'A long enough imported question text for validation purposes here?', category: 'learning_transfer', grade: 11 }],
    });
    expect(split.status).toBe(400);
  });

  it('commits reviewed items as honestly-labeled bank questions', async () => {
    const stamp = Date.now();
    const res = await request(app).post('/api/admin/journal-import/commit').set(admin()).send({
      filename: 'test-import.pdf',
      items: [
        {
          question_text: `Imported probe ${stamp}: describe a prototype failure and the redesign it caused, with measured evidence?`,
          category: 'engineering_design_process',
          reference_answer: 'Our seal leaked at 2 bar; doubling the gasket stopped it for 72 hours of testing.',
          grade: 11,
          semester: 1,
          learning_objectives: ['PH.2.01'],
        },
      ],
    });
    expect(res.status).toBe(201);
    expect(res.body.created).toBe(1);
    const q = await pool.query(`SELECT source, source_label, grade, semester, question_slot FROM questions WHERE id=$1`, [res.body.ids[0]]);
    expect(q.rows[0].source).toBe('admin_created');
    expect(q.rows[0].source_label).toMatch(/Imported journal/);
    expect(q.rows[0].grade).toBe(11);
    expect(q.rows[0].question_slot).toBe(2);
    await pool.query(`DELETE FROM questions WHERE id=$1`, [res.body.ids[0]]);
  });
});
