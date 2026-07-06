const express = require('express');
const { pool } = require('../db');

const router = express.Router();

// Public — no login. Lets the feedback page show which client/visit this is for.
router.get('/visit/:visitId', async (req, res) => {
  const { visitId } = req.params;

  try {
    const result = await pool.query(
      `SELECT visits.id, clients.name AS client_name, visits.scheduled_start
       FROM visits
       JOIN clients ON clients.id = visits.client_id
       WHERE visits.id = $1`,
      [visitId]
    );
    const row = result.rows[0];
    if (!row) return res.status(404).json({ error: 'Visit not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public — no login. Client/family submits a rating + comment after a visit.
router.post('/', async (req, res) => {
  const { visit_id, rating, comment } = req.body;

  if (!visit_id || !rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'visit_id and a rating between 1-5 are required' });
  }

  const submittedAt = new Date().toISOString();

  try {
    const result = await pool.query(
      `INSERT INTO feedback (visit_id, rating, comment, submitted_at) VALUES ($1, $2, $3, $4) RETURNING id`,
      [visit_id, rating, comment || null, submittedAt]
    );
    res.json({ success: true, id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
