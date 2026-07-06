const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const authenticateAdmin = require('../middleware/adminAuth');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const result = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);
    const admin = result.rows[0];
    if (!admin) return res.status(401).json({ error: 'Invalid email or password' });

    const match = await bcrypt.compare(password, admin.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ adminId: admin.id }, process.env.JWT_SECRET, { expiresIn: '12h' });
    res.json({ token, admin: { id: admin.id, name: admin.name, email: admin.email } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/carers', authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email FROM carers ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/carers', authenticateAdmin, async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email, and password are required' });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO carers (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hash]
    );
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'A carer with that email already exists' });
    res.status(500).json({ error: err.message });
  }
});

router.get('/clients', authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, address, phone FROM clients ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/clients', authenticateAdmin, async (req, res) => {
  const { name, address, phone } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO clients (name, address, phone) VALUES ($1, $2, $3) RETURNING id, name, address, phone',
      [name, address || null, phone || null]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// The rota: every scheduled visit, across all carers and clients.
router.get('/visits', authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT visits.*, carers.name AS carer_name, clients.name AS client_name
       FROM visits
       JOIN carers ON carers.id = visits.carer_id
       JOIN clients ON clients.id = visits.client_id
       ORDER BY visits.scheduled_start ASC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/visits', authenticateAdmin, async (req, res) => {
  const { carer_id, client_id, scheduled_start, scheduled_end } = req.body;

  if (!carer_id || !client_id || !scheduled_start || !scheduled_end) {
    return res.status(400).json({ error: 'carer_id, client_id, scheduled_start, and scheduled_end are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO visits (carer_id, client_id, scheduled_start, scheduled_end)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [carer_id, client_id, scheduled_start, scheduled_end]
    );
    res.json({ success: true, id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
