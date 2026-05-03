import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';

const BASE_URL = API_URL.replace('/api', '');
const fallbackProjects = [
  {
    _id: '1',
    title: 'Orion SaaS Platform',
    description: 'Multi-tenant analytics dashboard with real-time data pipelines serving 50K+ users. Sub-100ms query responses via intelligent caching layers.',
    iconKey: 'rocket',
    gradient: 'linear-gradient(135deg,#1a0533,#2d1b69,#0f3a6e)',
    stack: ['Next.js', 'Go', 'PostgreSQL', 'Redis', 'AWS'],
    liveUrl: '#',
    githubUrl: '#',
    ctaLabel: 'Live Demo ↗',
  },
  {
    _id: '2',
    title: 'NeuralChat AI',
    description: 'Conversational AI platform with RAG architecture and custom fine-tuned models. Integrated with Slack, Notion & Jira for enterprise workflows.',
    iconKey: 'bot',
    gradient: 'linear-gradient(135deg,#0a2a1a,#0f5c3a,#1a3a0a)',
    stack: ['Python', 'LangChain', 'FastAPI', 'Pinecone', 'React'],
    liveUrl: '#',
    githubUrl: '#',
    ctaLabel: 'Live Demo ↗',
  },
  {
    _id: '3',
    title: 'Velox FinTech API',
    description: 'PCI-compliant payment processing microservice handling $2M+ daily volume. 99.99% uptime with automated failover and fraud detection.',
    iconKey: 'creditcard',
    gradient: 'linear-gradient(135deg,#2a0a1a,#6e1b3a,#3a0a2a)',
    stack: ['Node.js', 'TypeScript', 'Stripe', 'Docker', 'K8s'],
    liveUrl: '#',
    githubUrl: '#',
    ctaLabel: 'Case Study ↗',
  },
  {
    _id: '4',
    title: 'MedFlow EHR System',
    description: 'HIPAA-compliant electronic health records platform with FHIR APIs, ML-powered diagnostics assistant, and telehealth integration.',
    iconKey: 'hospital',
    gradient: 'linear-gradient(135deg,#0a1a2a,#1b3a6e,#0a2a3a)',
    stack: ['React', 'Python', 'FHIR', 'PostgreSQL', 'Azure'],
    liveUrl: '#',
    githubUrl: '#',
    ctaLabel: 'Case Study ↗',
  },
];

function Projects() {
  const [projects, setProjects] = useState(fallbackProjects);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    axios.get(`${API_URL}/projects`)
      .then(res => {
        if (res.data.success && res.data.data.length > 0) {
          setProjects(res.data.data);
        }
      })
      .catch(() => {
        // Use fallback data if backend is unavailable
      });
  }, []);

  const initialProjects = projects.slice(0, 6);
  const extraProjects = projects.slice(6);

  return (
    <section id="projects" aria-labelledby="projects-title">
      <div className="section-header reveal">
        <div className="section-tag">Work</div>
        <h2 className="section-title" id="projects-title">My <span className="hl">Projects</span></h2>
        <p className="section-sub">A selection of things I've built — from startups to enterprise scale.</p>
      </div>

      <div className="projects-grid">
        {initialProjects.map((project, index) => (
          <article
            className="project-card reveal"
            key={project._id}
            style={{ transitionDelay: `${index * 0.1}s` }}
          >
            <div className="project-img">
              <div className="project-img-bg" style={{ background: project.gradient }}></div>
              {project.imageUrl && (
                <div className="project-img-icon" aria-hidden="true" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img 
                    src={project.imageUrl.startsWith('http') ? project.imageUrl : `${BASE_URL}${project.imageUrl}`} 
                    alt={project.title} 
                    className="uploaded-project-img" 
                  />
                </div>
              )}
            </div>
            <div className="project-body">
              <h3 className="project-title">{project.title}</h3>
              <p className="project-desc">{project.description}</p>
              <div className="project-stack">
                {project.stack.map((tech, i) => (
                  <span className="tag" key={i}>{tech}</span>
                ))}
              </div>
              <div className="project-footer">
                <a href={project.liveUrl} className="btn-sm filled" target="_blank" rel="noopener noreferrer">{project.ctaLabel}</a>
                <a href={project.githubUrl} className="btn-sm outline" target="_blank" rel="noopener noreferrer" aria-label={`${project.title} GitHub repository`}>GitHub</a>
              </div>
            </div>
          </article>
        ))}
      </div>

      {extraProjects.length > 0 && (
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateRows: showAll ? '1fr' : '0fr', 
            transition: 'grid-template-rows 0.6s cubic-bezier(0.16, 1, 0.3, 1)' 
          }}
        >
          <div style={{ overflow: 'hidden' }}>
            <div className="projects-grid" style={{ paddingTop: '24px' }}>
              {extraProjects.map((project, index) => (
                <article
                  className="project-card"
                  key={project._id}
                  style={{ 
                    opacity: showAll ? 1 : 0, 
                    transform: showAll ? 'translateY(0)' : 'translateY(20px)',
                    transition: `all 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${showAll ? index * 0.1 : 0}s` 
                  }}
                >
                  <div className="project-img">
                    <div className="project-img-bg" style={{ background: project.gradient }}></div>
                    {project.imageUrl && (
                      <div className="project-img-icon" aria-hidden="true" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img 
                          src={project.imageUrl.startsWith('http') ? project.imageUrl : `${BASE_URL}${project.imageUrl}`} 
                          alt={project.title} 
                          className="uploaded-project-img" 
                        />
                      </div>
                    )}
                  </div>
                  <div className="project-body">
                    <h3 className="project-title">{project.title}</h3>
                    <p className="project-desc">{project.description}</p>
                    <div className="project-stack">
                      {project.stack.map((tech, i) => (
                        <span className="tag" key={i}>{tech}</span>
                      ))}
                    </div>
                    <div className="project-footer">
                      <a href={project.liveUrl} className="btn-sm filled" target="_blank" rel="noopener noreferrer">{project.ctaLabel}</a>
                      <a href={project.githubUrl} className="btn-sm outline" target="_blank" rel="noopener noreferrer" aria-label={`${project.title} GitHub repository`}>GitHub</a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}

      {projects.length > 6 && (
        <div style={{ textAlign: 'center', marginTop: '48px' }}>
          <button 
            className="btn-glass-3d" 
            onClick={() => setShowAll(!showAll)}
            style={{ padding: '16px', borderRadius: '50%' }}
            aria-label={showAll ? "Show fewer projects" : "Show more projects"}
          >
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              style={{ 
                transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                transform: showAll ? 'rotate(-180deg)' : 'rotate(0deg)'
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '64px' }} className="reveal">
        <Link to="/mini-projects" style={{ textDecoration: 'none', width: '100%', maxWidth: '400px' }}>
          <article className="project-card" style={{ textAlign: 'center', padding: '32px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧪</div>
            <h3 className="project-title" style={{ fontSize: '20px' }}>Explore Mini Projects →</h3>
            <p className="project-desc" style={{ marginBottom: 0 }}>Smaller experiments, micro-tools, and weekend hacks.</p>
          </article>
        </Link>
      </div>
    </section>
  );
}

export default Projects;
