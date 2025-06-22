import pool from './db.js';

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS parsed_files (
      id SERIAL PRIMARY KEY,
      filename TEXT NOT NULL,
      language TEXT,
      function_name TEXT,
      code TEXT,
      docstring TEXT,
      lines INT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('✅ Database initialized');
  process.exit();
}

initDb().catch(console.error);
