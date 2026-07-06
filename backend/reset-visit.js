require('dotenv').config();
const { pool } = require('./db');

const visitId = Number(process.argv[2]) || 1;

async function resetVisit() {
  const result = await pool.query(
    `UPDATE visits SET
       actual_start = NULL, actual_end = NULL,
       start_lat = NULL, start_lng = NULL,
       end_lat = NULL, end_lng = NULL,
       scheduled_start = NOW() + INTERVAL '2 minutes',
       scheduled_end = NOW() + INTERVAL '62 minutes'
     WHERE id = $1`,
    [visitId]
  );

  if (result.rowCount === 0) {
    console.log(`No visit with id ${visitId} found.`);
  } else {
    console.log(`Visit ${visitId} reset to not-started, rescheduled for right now.`);
  }

  await pool.end();
}

resetVisit().catch((err) => {
  console.error(err);
  process.exit(1);
});
