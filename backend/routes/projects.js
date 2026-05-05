const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const Project = require('../models/Project');
const adminAuth = require('../middleware/adminAuth');

// Configure multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'project-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// GET /api/projects — get all projects (public)
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().sort({ order: 1 });
    res.json({ success: true, data: projects });
  } catch (error) {
    console.error('Fetch projects error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Since we use FormData, fields arrive as strings.
const projectValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 2000 }),
  body('gradient').trim().notEmpty().withMessage('Gradient is required'),
  body('stack').trim().notEmpty().withMessage('Stack is required'),
  body('liveUrl').optional({ checkFalsy: true }).trim().isURL().withMessage('Invalid live URL'),
  body('githubUrl').optional({ checkFalsy: true }).trim().isURL().withMessage('Invalid GitHub URL'),
  body('ctaLabel').optional({ checkFalsy: true }).trim().isLength({ max: 50 }),
  body('order').optional().isInt({ min: 0 }),
];

// POST /api/projects — create a project
router.post('/',
  adminAuth,
  upload.single('image'),
  projectValidation,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { title, description, gradient, stack, liveUrl, githubUrl, ctaLabel, order } = req.body;
      
      const stackArray = stack.split(',').map(s => s.trim()).filter(Boolean);
      
      let imageUrl = '';
      if (req.file) {
        imageUrl = `/uploads/${req.file.filename}`;
      }

      const project = await Project.create({
        title, description, gradient, stack: stackArray, liveUrl, githubUrl, ctaLabel, order, imageUrl
      });

      res.status(201).json({ success: true, data: project });
    } catch (error) {
      console.error('Create project error:', error);
      res.status(500).json({ success: false, message: 'Server error.' });
    }
  }
);

// PUT /api/projects/:id — update a project
router.put('/:id',
  adminAuth,
  upload.single('image'),
  projectValidation,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { title, description, gradient, stack, liveUrl, githubUrl, ctaLabel, order } = req.body;
      const stackArray = stack.split(',').map(s => s.trim()).filter(Boolean);

      const updateData = { title, description, gradient, stack: stackArray, liveUrl, githubUrl, ctaLabel, order };
      if (req.file) {
        updateData.imageUrl = `/uploads/${req.file.filename}`;
      }

      const project = await Project.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
      if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

      res.json({ success: true, data: project });
    } catch (error) {
      console.error('Update project error:', error);
      res.status(500).json({ success: false, message: 'Server error.' });
    }
  }
);

// DELETE /api/projects/:id — delete a project
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
