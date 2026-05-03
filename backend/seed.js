require('dotenv').config();
const mongoose = require('mongoose');
const Project = require('./models/Project');

const projects = [
  {
    title: 'Orion SaaS Platform',
    description: 'Multi-tenant analytics dashboard with real-time data pipelines serving 50K+ users. Sub-100ms query responses via intelligent caching layers.',
    iconKey: 'rocket',
    emoji: '🚀',
    gradient: 'linear-gradient(135deg,#1a0533,#2d1b69,#0f3a6e)',
    stack: ['Next.js', 'Go', 'PostgreSQL', 'Redis', 'AWS'],
    liveUrl: '#',
    githubUrl: '#',
    ctaLabel: 'Live Demo ↗',
    order: 0,
  },
  {
    title: 'NeuralChat AI',
    description: 'Conversational AI platform with RAG architecture and custom fine-tuned models. Integrated with Slack, Notion & Jira for enterprise workflows.',
    iconKey: 'bot',
    emoji: '🤖',
    gradient: 'linear-gradient(135deg,#0a2a1a,#0f5c3a,#1a3a0a)',
    stack: ['Python', 'LangChain', 'FastAPI', 'Pinecone', 'React'],
    liveUrl: '#',
    githubUrl: '#',
    ctaLabel: 'Live Demo ↗',
    order: 1,
  },
  {
    title: 'Velox FinTech API',
    description: 'PCI-compliant payment processing microservice handling $2M+ daily volume. 99.99% uptime with automated failover and fraud detection.',
    iconKey: 'creditcard',
    emoji: '💳',
    gradient: 'linear-gradient(135deg,#2a0a1a,#6e1b3a,#3a0a2a)',
    stack: ['Node.js', 'TypeScript', 'Stripe', 'Docker', 'K8s'],
    liveUrl: '#',
    githubUrl: '#',
    ctaLabel: 'Case Study ↗',
    order: 2,
  },
  {
    title: 'MedFlow EHR System',
    description: 'HIPAA-compliant electronic health records platform with FHIR APIs, ML-powered diagnostics assistant, and telehealth integration.',
    iconKey: 'hospital',
    emoji: '🏥',
    gradient: 'linear-gradient(135deg,#0a1a2a,#1b3a6e,#0a2a3a)',
    stack: ['React', 'Python', 'FHIR', 'PostgreSQL', 'Azure'],
    liveUrl: '#',
    githubUrl: '#',
    ctaLabel: 'Case Study ↗',
    order: 3,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    await Project.deleteMany({});
    console.log('Cleared existing projects');

    await Project.insertMany(projects);
    console.log('Seeded', projects.length, 'projects');

    await mongoose.disconnect();
    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
