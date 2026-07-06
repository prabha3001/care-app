const express = require('express');
const { pool } = require('../db');
const authenticate = require('../middleware/auth');

const router = express.Router();

router.get('/today', authenticate, async (req, res) => {
  const carerId = req.carerId;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  try {
    const result = await pool.query(
      `SELECT visits.*, clients.name AS client_name, clients.address AS client_address
       FROM visits
       JOIN clients ON clients.id = visits.client_id
       WHERE visits.carer_id = $1 AND visits.scheduled_start BETWEEN $2 AND $3
       ORDER BY visits.scheduled_start ASC`,
      [carerId, todayStart.toISOString(), todayEnd.toISOString()]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/clock-in', authenticate, async (req, res) => {
  const { id } = req.params;
  const { lat, lng } = req.body;
  const now = new Date().toISOString();

  try {
    const result = await pool.query(
      `UPDATE visits SET actual_start = $1, start_lat = $2, start_lng = $3
       WHERE id = $4 AND carer_id = $5`,
      [now, lat ?? null, lng ?? null, id, req.carerId]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Visit not found' });
    res.json({ success: true, clockedInAt: now });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/clock-out', authenticate, async (req, res) => {
  const { id } = req.params;
  const { lat, lng } = req.body;
  const now = new Date().toISOString();

  try {
    const result = await pool.query(
      `UPDATE visits SET actual_end = $1, end_lat = $2, end_lng = $3
       WHERE id = $4 AND carer_id = $5`,
      [now, lat ?? null, lng ?? null, id, req.carerId]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Visit not found' });
    res.json({ success: true, clockedOutAt: now });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
