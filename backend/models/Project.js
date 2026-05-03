const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    default: '',
  },
  gradient: {
    type: String,
    required: true,
  },
  stack: [{
    type: String,
  }],
  liveUrl: {
    type: String,
    default: '#',
  },
  githubUrl: {
    type: String,
    default: '#',
  },
  ctaLabel: {
    type: String,
    default: 'Live Demo ↗',
  },
  order: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Index for efficient sorting by display order
projectSchema.index({ order: 1 });

module.exports = mongoose.model('Project', projectSchema);
