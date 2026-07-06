require('dotenv').config();
const bcrypt = require('bcrypt');
const { pool, initDb } = require('./db');

const TEST_EMAIL = 'carer@test.com';
const TEST_PASSWORD = 'password123';

async function seed() {
  await initDb();

  const existing = await pool.query('SELECT id FROM carers WHERE email = $1', [TEST_EMAIL]);
  if (existing.rows[0]) {
    console.log(`Seed data already exists (carer id ${existing.rows[0].id}). Skipping.`);
    await pool.end();
    return;
  }

  const hash = await bcrypt.hash(TEST_PASSWORD, 10);

  const carerResult = await pool.query(
    'INSERT INTO carers (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
    ['Test Carer', TEST_EMAIL, hash]
  );
  const carerId = carerResult.rows[0].id;

  const clientResult = await pool.query(
    'INSERT INTO clients (name, address, phone) VALUES ($1, $2, $3) RETURNING id',
    ['Jane Doe', '123 Main St', '555-1234']
  );
  const clientId = clientResult.rows[0].id;

  const now = new Date();
  const scheduledStart = new Date(now.getTime() + 5 * 60000).toISOString();
  const scheduledEnd = new Date(now.getTime() + 65 * 60000).toISOString();

  const visitResult = await pool.query(
    'INSERT INTO visits (carer_id, client_id, scheduled_start, scheduled_end) VALUES ($1, $2, $3, $4) RETURNING id',
    [carerId, clientId, scheduledStart, scheduledEnd]
  );

  console.log('Seed complete.');
  console.log(`Login: ${TEST_EMAIL} / ${TEST_PASSWORD}`);
  console.log(`Visit id: ${visitResult.rows[0].id}`);
  await pool.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
