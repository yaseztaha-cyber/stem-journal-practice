import fs from 'fs';
import path from 'path';
import { pool } from './db';

async function migrate() {
  const dir = path.join(__dirname, '..', 'migrations');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  // migrations tracking table
  await pool.query(`CREATE TABLE IF NOT EXISTS schema_migrations (filename TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
  const applied = await pool.query(`SELECT filename FROM schema_migrations`);
  const appliedSet = new Set(applied.rows.map((r: any) => r.filename));
  for (const f of files) {
    if (appliedSet.has(f)) {
      console.log(`skip ${f} (already applied)`);
      continue;
    }
    console.log(`applying ${f}...`);
    const sql = fs.readFileSync(path.join(dir, f), 'utf8');
    try {
      await pool.query(sql);
    } catch (e: any) {
      // Fallback: CITEXT may be unavailable in some environments — retry with TEXT
      if (sql.includes('CITEXT')) {
        console.warn('CITEXT failed, retrying with TEXT fallback');
        const fallback = sql.replace(/CREATE EXTENSION IF NOT EXISTS "citext";/g, '').replace(/CITEXT/g, 'TEXT');
        await pool.query(fallback);
      } else {
        throw e;
      }
    }
    await pool.query(`INSERT INTO schema_migrations(filename) VALUES ($1)`, [f]);
    console.log(`applied ${f}`);
  }
  await pool.end();
}

migrate().catch((e) => {
  console.error(e);
  process.exit(1);
});
