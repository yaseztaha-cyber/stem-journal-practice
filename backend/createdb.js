const { Pool } = require('pg');
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  database: 'postgres',
});
(async () => {
  try {
    await pool.query('CREATE DATABASE stem_journal');
    console.log('Database created');
  } catch(e) {
    if (e.message.includes('already exists')) console.log('Database already exists');
    else console.error(e.message);
  }
  await pool.end();
})();
