const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function initDb() {
  await pool.query(`CREATE TABLE IF NOT EXISTS carers (
    id SERIAL PRIMARY KEY,
    name TEXT, email TEXT UNIQUE, password_hash TEXT
  )`);

  await pool.query(`CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    name TEXT, address TEXT, phone TEXT
  )`);

  await pool.query(`CREATE TABLE IF NOT EXISTS visits (
    id SERIAL PRIMARY KEY,
    carer_id INTEGER REFERENCES carers(id),
    client_id INTEGER REFERENCES clients(id),
    scheduled_start TIMESTAMPTZ, scheduled_end TIMESTAMPTZ,
    actual_start TIMESTAMPTZ, actual_end TIMESTAMPTZ,
    start_lat DOUBLE PRECISION, start_lng DOUBLE PRECISION,
    end_lat DOUBLE PRECISION, end_lng DOUBLE PRECISION
  )`);

  await pool.query(`CREATE TABLE IF NOT EXISTS feedback (
    id SERIAL PRIMARY KEY,
    visit_id INTEGER REFERENCES visits(id),
    rating INTEGER, comment TEXT,
    submitted_at TIMESTAMPTZ
  )`);
}

module.exports = { pool, initDb };
