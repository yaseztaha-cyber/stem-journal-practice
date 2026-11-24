import { pool } from './db';
import { ACADEMY_PART1 } from './data/academyContent1';
import { ACADEMY_PART2 } from './data/academyContent2';
import { ACADEMY_PART3 } from './data/academyContent3';
import { ACADEMY_PART4 } from './data/academyContent4';
import { ACADEMY_PART5 } from './data/academyContent5';
import { LESSON_TAKEAWAYS, EXTRA_EXAMPLES } from './data/academyDepth';
import type { AcademyUnitSeed } from './data/academyTypes';

const ALL_UNITS: (AcademyUnitSeed & { track_scope?: string })[] = [...ACADEMY_PART1, ...ACADEMY_PART2, ...ACADEMY_PART3, ...ACADEMY_PART4, ...ACADEMY_PART5];

export async function seedAcademy() {
  for (const u of ALL_UNITS) {
    const ur = await pool.query(
      `INSERT INTO academy_units(slug, unit_number, title, description, est_minutes, active, track_scope)
       VALUES ($1,$2,$3,$4,$5,TRUE,$6)
       ON CONFLICT (slug) DO UPDATE SET unit_number=EXCLUDED.unit_number, title=EXCLUDED.title,
         description=EXCLUDED.description, est_minutes=EXCLUDED.est_minutes, track_scope=EXCLUDED.track_scope, active=TRUE, updated_at=now()
       RETURNING id`,
      [u.slug, u.unit_number, u.title, u.description, u.est_minutes, (u as any).track_scope ?? 'CORE'],
    );
    const unitId: string = ur.rows[0].id;

    await pool.query(
      `INSERT INTO academy_videos(unit_id, title, description, video_url, thumbnail_url, duration_seconds, transcript, order_index, active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,0,TRUE)
       ON CONFLICT (unit_id, order_index) DO UPDATE SET title=EXCLUDED.title, description=EXCLUDED.description,
         video_url=EXCLUDED.video_url, thumbnail_url=EXCLUDED.thumbnail_url, duration_seconds=EXCLUDED.duration_seconds,
         transcript=EXCLUDED.transcript, active=TRUE`,
      [unitId, u.video.title, u.video.description, u.video.video_url, u.video.thumbnail_url, u.video.duration_seconds, u.video.transcript],
    );

    const lessonIds: string[] = [];
    for (let i = 0; i < u.lessons.length; i++) {
      const l = u.lessons[i];
      const takeaway = l.takeaway ?? LESSON_TAKEAWAYS[`${u.slug}#${i}`] ?? '';
      const examples = [...l.examples];
      const extra = EXTRA_EXAMPLES[`${u.slug}#${i}`];
      if (extra) examples.push(extra);
      const lr = await pool.query(
        `INSERT INTO academy_lessons(unit_id, title, objective, body_md, examples, widget, takeaway, order_index, active)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,TRUE)
         ON CONFLICT (unit_id, order_index) DO UPDATE SET title=EXCLUDED.title, objective=EXCLUDED.objective,
           body_md=EXCLUDED.body_md, examples=EXCLUDED.examples, widget=EXCLUDED.widget, takeaway=EXCLUDED.takeaway, active=TRUE
         RETURNING id`,
        [unitId, l.title, l.objective, l.body_md, JSON.stringify(examples), l.widget ?? '', takeaway, i],
      );
      lessonIds.push(lr.rows[0].id);
    }
    await pool.query(`DELETE FROM academy_lessons WHERE unit_id=$1 AND order_index >= $2`, [unitId, u.lessons.length]);

    for (let i = 0; i < u.items.length; i++) {
      const it = u.items[i];
      const lessonId = it.lesson == null ? null : lessonIds[it.lesson] ?? null;
      await pool.query(
        `INSERT INTO academy_items(unit_id, lesson_id, quiz, kind, prompt, payload, points, difficulty, order_index, active)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,TRUE)
         ON CONFLICT (unit_id, order_index) DO UPDATE SET lesson_id=EXCLUDED.lesson_id, quiz=EXCLUDED.quiz,
           kind=EXCLUDED.kind, prompt=EXCLUDED.prompt, payload=EXCLUDED.payload, points=EXCLUDED.points,
           difficulty=EXCLUDED.difficulty, active=TRUE`,
        [unitId, lessonId, it.quiz, it.kind, it.prompt, JSON.stringify(it.payload), it.points, it.difficulty, i],
      );
    }
    await pool.query(`DELETE FROM academy_items WHERE unit_id=$1 AND order_index >= $2`, [unitId, u.items.length]);

    for (let i = 0; i < u.tricks.length; i++) {
      const t = u.tricks[i];
      await pool.query(
        `INSERT INTO academy_tricks(unit_id, title, body, order_index, active)
         VALUES ($1,$2,$3,$4,TRUE)
         ON CONFLICT (unit_id, order_index) DO UPDATE SET title=EXCLUDED.title, body=EXCLUDED.body, active=TRUE`,
        [unitId, t.title, t.body, i],
      );
    }
    await pool.query(`DELETE FROM academy_tricks WHERE unit_id=$1 AND order_index >= $2`, [unitId, u.tricks.length]);

    for (let i = 0; i < u.mistakes.length; i++) {
      const m = u.mistakes[i];
      await pool.query(
        `INSERT INTO academy_mistakes(unit_id, title, body, order_index, active)
         VALUES ($1,$2,$3,$4,TRUE)
         ON CONFLICT (unit_id, order_index) DO UPDATE SET title=EXCLUDED.title, body=EXCLUDED.body, active=TRUE`,
        [unitId, m.title, m.body, i],
      );
    }
    await pool.query(`DELETE FROM academy_mistakes WHERE unit_id=$1 AND order_index >= $2`, [unitId, u.mistakes.length]);
  }
  console.log(`academy seeded (${ALL_UNITS.length} units)`);
}
