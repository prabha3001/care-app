const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.get('SELECT * FROM carers WHERE email = ?', [email], (err, carer) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    if (!carer) return res.status(401).json({ error: 'Invalid email or password' });

    bcrypt.compare(password, carer.password_hash, (err, match) => {
      if (err) return res.status(500).json({ error: 'Server error' });
      if (!match) return res.status(401).json({ error: 'Invalid email or password' });

      const token = jwt.sign({ carerId: carer.id }, process.env.JWT_SECRET, { expiresIn: '12h' });
      res.json({ token, carer: { id: carer.id, name: carer.name, email: carer.email } });
    });
  });
});

module.exports = router;
