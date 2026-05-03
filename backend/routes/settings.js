const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const SiteContent = require('../models/SiteContent');
const adminAuth = require('../middleware/adminAuth');

// Configure multer for potential avatar uploads (Phase 3)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Helper to get or create Singleton
async function getSettings() {
  let settings = await SiteContent.findOne();
  if (!settings) {
    // defaults are defined in the schema
    settings = await SiteContent.create({
      skills: {
        cards: [
          { name: 'Frontend', desc: 'Building reactive interfaces.', tags: ['React', 'Next.js'], iconName: 'frontend', bg: 'rgba(108,99,255,0.12)' }
        ],
        techPills: [
          { label: 'JavaScript', iconName: 'js' }
        ]
      },
      about: {
        heading: 'I build things that matter.',
        p1: 'Based in San Francisco...',
        p2: 'When I am not pushing commits...',
        avatarUrl: '',
        facts: [
          { label: 'Location', value: 'San Francisco, CA' },
          { label: 'Role', value: 'Fullstack Developer' },
          { label: 'Availability', value: 'Open to Work' }
        ]
      }
    });
  }
  return settings;
}

// GET /api/settings — get all settings (public)
router.get('/', async (req, res) => {
  try {
    const settings = await getSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('Fetch settings error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// PUT /api/settings — update settings (admin only)
router.put('/', adminAuth, upload.any(), async (req, res) => {
  try {
    const defaultSettings = await getSettings();
    
    // Parse JSON fields from the frontend FormData
    let updates = {};
    if (req.body.maintenanceMode !== undefined) updates.maintenanceMode = req.body.maintenanceMode === 'true';
    if (req.body.heroStats) updates.heroStats = JSON.parse(req.body.heroStats);
    if (req.body.contact) updates.contact = JSON.parse(req.body.contact);
    if (req.body.about) updates.about = JSON.parse(req.body.about);
    if (req.body.skills) updates.skills = JSON.parse(req.body.skills);
    if (req.body.miniProjects) updates.miniProjects = JSON.parse(req.body.miniProjects);
    
    // Handle image uploads if present
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        if (file.fieldname === 'avatarImage') {
          if (!updates.about) updates.about = defaultSettings.about;
          updates.about.avatarUrl = `/uploads/${file.filename}`;
        } else if (file.fieldname.startsWith('miniProjectImage_')) {
          const index = parseInt(file.fieldname.split('_')[1]);
          if (updates.miniProjects && updates.miniProjects[index]) {
            updates.miniProjects[index].imageUrl = `/uploads/${file.filename}`;
          }
        }
      });
    }

    if (req.body.clearAvatar === 'true') {
      if (!updates.about) updates.about = defaultSettings.about;
      updates.about.avatarUrl = '';
    }

    const updated = await SiteContent.findByIdAndUpdate(defaultSettings._id, { $set: updates }, { new: true });
    
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

module.exports = router;
