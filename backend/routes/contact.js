const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const Message = require('../models/Message');
const adminAuth = require('../middleware/adminAuth');

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

// POST /api/contact — submit a message (public)
router.post('/',
  contactLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('subject').trim().notEmpty().withMessage('Subject is required').isLength({ max: 200 }),
    body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 5000 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { name, email, subject, message } = req.body;
      const newMessage = await Message.create({ name, email, subject, message });

      res.status(201).json({
        success: true,
        message: 'Message sent successfully!',
        data: { id: newMessage._id },
      });
    } catch (error) {
      console.error('Contact form error:', error);
      res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
    }
  }
);

// GET /api/contact — get all messages (admin only)
router.get('/', adminAuth, async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('Fetch messages error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
