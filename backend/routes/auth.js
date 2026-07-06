const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const result = await pool.query('SELECT * FROM carers WHERE email = $1', [email]);
    const carer = result.rows[0];
    if (!carer) return res.status(401).json({ error: 'Invalid email or password' });

    const match = await bcrypt.compare(password, carer.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ carerId: carer.id }, process.env.JWT_SECRET, { expiresIn: '12h' });
    res.json({ token, carer: { id: carer.id, name: carer.name, email: carer.email } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
