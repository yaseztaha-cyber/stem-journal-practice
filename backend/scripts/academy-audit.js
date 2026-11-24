// Academy content completeness audit (§59).
// Reports totals + every gap (missing examples/practice/objectives/takeaways/quizzes).
// Usage: node scripts/academy-audit.js [--strict]  (strict exits 1 on any critical gap)
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ??
    `postgres://${process.env.PGUSER ?? 'aicommerce'}:${process.env.PGPASSWORD ?? 'aicommerce_dev'}@${process.env.PGHOST ?? 'localhost'}:${process.env.PGPORT ?? '5432'}/${process.env.PGDATABASE ?? 'stem_journal'}`,
});

const KNOWN_KINDS = new Set(['single_choice', 'multi_select', 'true_false', 'match', 'order_steps', 'short_answer', 'compare_levels', 'decoder', 'surgery']);

async function main() {
  const strict = process.argv.includes('--strict');
  const critical = [];
  const warnings = [];
  const q = (t, p) => pool.query(t, p).then((r) => r.rows);

  const units = await q(`SELECT * FROM academy_units WHERE active=TRUE ORDER BY unit_number`);
  const lessons = await q(`SELECT l.*, u.slug, u.unit_number FROM academy_lessons l JOIN academy_units u ON u.id=l.unit_id WHERE l.active=TRUE AND u.active=TRUE ORDER BY u.unit_number, l.order_index`);
  const items = await q(`SELECT i.*, u.slug FROM academy_items i JOIN academy_units u ON u.id=i.unit_id WHERE i.active=TRUE AND u.active=TRUE`);
  const videos = await q(`SELECT v.*, u.slug, u.unit_number FROM academy_videos v JOIN academy_units u ON u.id=v.unit_id WHERE v.active=TRUE AND u.active=TRUE`);
  const tricks = await q(`SELECT COUNT(*)::int AS n FROM academy_tricks t JOIN academy_units u ON u.id=t.unit_id WHERE t.active=TRUE AND u.active=TRUE`);
  const mistakes = await q(`SELECT COUNT(*)::int AS n FROM academy_mistakes m JOIN academy_units u ON u.id=m.unit_id WHERE m.active=TRUE AND u.active=TRUE`);

  console.log(`Total units: ${units.length}`);
  console.log(`Total lessons: ${lessons.length}`);
  console.log(`Total items: ${items.length} (quiz: ${items.filter((i) => i.quiz).length}, practice: ${items.filter((i) => !i.quiz).length})`);
  console.log(`Total videos: ${videos.length} (with URL: ${videos.filter((v) => v.video_url).length}, slots: ${videos.filter((v) => !v.video_url).length})`);
  console.log(`Total tricks: ${tricks[0].n}, total mistakes: ${mistakes[0].n}`);

  for (const l of lessons) {
    const tag = `U${l.unit_number} lesson "${l.title}"`;
    if (!l.objective?.trim()) critical.push(`${tag}: missing objective`);
    if (!l.body_md?.trim()) critical.push(`${tag}: missing body`);
    const ex = Array.isArray(l.examples) ? l.examples : [];
    if (ex.length === 0) critical.push(`${tag}: no examples`);
    else if (ex.length < 2) warnings.push(`${tag}: only 1 example (want 2+)`);
    if (!l.takeaway?.trim()) warnings.push(`${tag}: missing takeaway`);
  }

  const practiceByLesson = new Map();
  for (const i of items.filter((x) => !x.quiz && x.lesson_id)) {
    practiceByLesson.set(i.lesson_id, (practiceByLesson.get(i.lesson_id) ?? 0) + 1);
  }
  for (const l of lessons) {
    // Widget lessons (builders, checklists, challenges) are interactive by design.
    if (!practiceByLesson.get(l.id) && !['rq_builder', 'master_challenge', 'blue_check'].includes(l.widget)) {
      warnings.push(`U${l.unit_number} lesson "${l.title}": no practice items`);
    }
  }

  for (const u of units) {
    const tag = `Unit ${u.unit_number} (${u.slug})`;
    const quiz = items.filter((i) => i.quiz && i.unit_id === u.id);
    if (!quiz.length) critical.push(`${tag}: no quiz questions`);
    if (!videos.some((v) => v.unit_id === u.id)) warnings.push(`${tag}: no intro video row`);
    if (!tricks[0] || true) { /* counted globally */ }
  }

  for (const i of items) {
    const tag = `Item ${i.id.slice(0, 8)} (${i.slug}/${i.kind}${i.quiz ? '/quiz' : ''})`;
    if (!KNOWN_KINDS.has(i.kind)) critical.push(`${tag}: unknown kind`);
    const p = i.payload ?? {};
    if (!p.explanation) warnings.push(`${tag}: missing explanation`);
    if (i.quiz) {
      if (['single_choice', 'multi_select', 'compare_levels', 'true_false'].includes(i.kind) && p.correct === undefined) {
        critical.push(`${tag}: quiz item has no correct answer`);
      }
      if (i.kind === 'order_steps' && (!Array.isArray(p.steps) || p.steps.length < 2)) critical.push(`${tag}: order_steps needs 2+ steps`);
      if (i.kind === 'match' && (!Array.isArray(p.pairs) || p.pairs.length < 2)) critical.push(`${tag}: match needs 2+ pairs`);
      if (i.kind === 'decoder' && (!Array.isArray(p.blanks) || !p.blanks.length)) critical.push(`${tag}: decoder needs blanks`);
      if (i.kind === 'short_answer' && (!Array.isArray(p.keywords) || !p.keywords.length || !p.sample)) {
        critical.push(`${tag}: short_answer needs keywords + sample`);
      }
      if (i.kind === 'surgery' && (!Array.isArray(p.steps) || !p.steps.length || !p.weak)) {
        critical.push(`${tag}: surgery needs weak + steps`);
      }
    }
  }

  console.log(`\nCritical issues: ${critical.length}`);
  for (const c of critical) console.log(`  CRIT  ${c}`);
  console.log(`Warnings: ${warnings.length}`);
  for (const w of warnings.slice(0, 40)) console.log(`  warn  ${w}`);
  if (warnings.length > 40) console.log(`  ... and ${warnings.length - 40} more warnings`);

  await pool.end();
  if (strict && critical.length) {
    console.error('AUDIT FAILED (strict)');
    process.exit(1);
  }
  console.log(critical.length ? 'Audit done: critical gaps remain.' : 'Audit done: no critical gaps.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
