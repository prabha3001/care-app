const express = require('express');
const db = require('../db');

const router = express.Router();

// Public — no login. Lets the feedback page show which client/visit this is for.
router.get('/visit/:visitId', (req, res) => {
  const { visitId } = req.params;

  db.get(
    `SELECT visits.id, clients.name AS client_name, visits.scheduled_start
     FROM visits
     JOIN clients ON clients.id = visits.client_id
     WHERE visits.id = ?`,
    [visitId],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: 'Visit not found' });
      res.json(row);
    }
  );
});

// Public — no login. Client/family submits a rating + comment after a visit.
router.post('/', (req, res) => {
  const { visit_id, rating, comment } = req.body;

  if (!visit_id || !rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'visit_id and a rating between 1-5 are required' });
  }

  const submittedAt = new Date().toISOString();

  db.run(
    `INSERT INTO feedback (visit_id, rating, comment, submitted_at) VALUES (?, ?, ?, ?)`,
    [visit_id, rating, comment || null, submittedAt],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, id: this.lastID });
    }
  );
});

module.exports = router;
