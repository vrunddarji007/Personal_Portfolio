const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

router.post('/login', (req, res) => {
  try {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.warn('ADMIN_PASSWORD is not set in `.env`!');
      return res.status(500).json({ success: false, message: 'Server configuration error.' });
    }

    if (password !== adminPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { role: 'admin' },
      process.env.JWT_SECRET || 'fallback_secret_for_dev_only',
      { expiresIn: '2h' }
    );

    res.json({ success: true, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
