const express = require('express');
const db = require('../db');
const authenticate = require('../middleware/auth');

const router = express.Router();

router.get('/today', authenticate, (req, res) => {
  const carerId = req.carerId;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  db.all(
    `SELECT visits.*, clients.name AS client_name, clients.address AS client_address
     FROM visits
     JOIN clients ON clients.id = visits.client_id
     WHERE visits.carer_id = ? AND visits.scheduled_start BETWEEN ? AND ?
     ORDER BY visits.scheduled_start ASC`,
    [carerId, todayStart.toISOString(), todayEnd.toISOString()],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

router.post('/:id/clock-in', authenticate, (req, res) => {
  const { id } = req.params;
  const { lat, lng } = req.body;
  const now = new Date().toISOString();

  db.run(
    `UPDATE visits SET actual_start = ?, start_lat = ?, start_lng = ?
     WHERE id = ? AND carer_id = ?`,
    [now, lat ?? null, lng ?? null, id, req.carerId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Visit not found' });
      res.json({ success: true, clockedInAt: now });
    }
  );
});

router.post('/:id/clock-out', authenticate, (req, res) => {
  const { id } = req.params;
  const { lat, lng } = req.body;
  const now = new Date().toISOString();

  db.run(
    `UPDATE visits SET actual_end = ?, end_lat = ?, end_lng = ?
     WHERE id = ? AND carer_id = ?`,
    [now, lat ?? null, lng ?? null, id, req.carerId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Visit not found' });
      res.json({ success: true, clockedOutAt: now });
    }
  );
});

module.exports = router;
