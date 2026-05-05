const mongoose = require('mongoose');

const siteContentSchema = new mongoose.Schema({
  maintenanceMode: { type: Boolean, default: false },
  // Phase 1: Hero Stats (dynamic array)
  heroStats: [{
    label: String,
    value: String
  }],
  
  // Phase 2: Skills (placeholder schema structure)
  skills: {
    cards: [{
      name: String,
      desc: String,
      tags: [String],
      iconName: String, // fallback for predefined icons
      bg: String,
      order: { type: Number, default: 0 }
    }],
    techPills: [{
      label: String,
      iconName: String
    }]
  },

  // Phase 2.5: Mini Projects
  miniProjects: [{
    title: String,
    desc: String,
    tags: [String],
    icon: String, // Legacy, keeping for backwards compatibility
    imageUrl: String, // New field for photo
    bgGradient: String,
    order: { type: Number, default: 0 }
  }],

  // Phase 3: About
  about: {
    heading: { type: String, default: 'I build things that matter.' },
    p1: { type: String, default: "Based in San Francisco, I'm a fullstack developer with 6 years of experience turning complex problems into elegant, scalable software. I care deeply about code quality, user experience, and systems that hold up under real-world pressure." },
    p2: { type: String, default: "When I'm not pushing commits, I'm contributing to open-source, writing about distributed systems, or exploring the intersection of AI and product design." },
    avatarUrl: { type: String, default: '' },
    facts: [{
      label: String,
      value: String
    }]
  },

  // Phase 4: Contact
  contact: {
    email: { type: String, default: 'vrund@example.com' },
    socials: { 
      type: [{
        platform: String,
        url: String
      }], 
      default: [
        { platform: 'LinkedIn', url: '#' },
        { platform: 'GitHub', url: '#' },
        { platform: 'Twitter', url: '#' }
      ]
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('SiteContent', siteContentSchema);
