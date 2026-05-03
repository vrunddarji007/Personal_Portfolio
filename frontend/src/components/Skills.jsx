import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import * as AllIcons from './Icons';

const defaultCards = [
  {
    iconName: 'IconFrontend',
    bg: 'rgba(108,99,255,0.12)',
    name: 'Frontend',
    desc: 'Building reactive, accessible interfaces with modern frameworks and meticulous attention to performance.',
    tags: ['React', 'Next.js', 'Vue', 'TypeScript', 'Tailwind'],
  },
  {
    iconName: 'IconBackend',
    bg: 'rgba(67,232,184,0.1)',
    name: 'Backend',
    desc: 'Designing robust REST & GraphQL APIs, microservices, and real-time systems that scale under pressure.',
    tags: ['Node.js', 'Python', 'Go', 'GraphQL', 'FastAPI'],
  },
  {
    iconName: 'IconDatabase',
    bg: 'rgba(255,101,132,0.1)',
    name: 'Databases',
    desc: 'Modeling complex data with both relational and document-based systems, optimizing for query performance.',
    tags: ['PostgreSQL', 'MongoDB', 'Redis', 'Supabase'],
  },
  {
    iconName: 'IconCloud',
    bg: 'rgba(247,201,72,0.1)',
    name: 'Cloud & DevOps',
    desc: 'Continuous delivery pipelines, container orchestration, and infrastructure-as-code for zero-downtime deployments.',
    tags: ['AWS', 'Docker', 'K8s', 'Terraform', 'CI/CD'],
  },
];

const defaultPills = [
  { iconName: 'IconJS', label: 'JavaScript' },
  { iconName: 'IconTS', label: 'TypeScript' },
  { iconName: 'IconReact', label: 'React' },
  { iconName: 'IconNode', label: 'Node.js' },
  { iconName: 'IconDocker', label: 'Docker' },
];

function Skills() {
  const [skills, setSkills] = useState({ cards: defaultCards, techPills: defaultPills });

  useEffect(() => {
    axios.get(`${API_URL}/settings`)
      .then(res => {
        if (res.data.success && res.data.data.skills?.cards?.length) {
          setSkills(res.data.data.skills);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <section id="skills" aria-labelledby="skills-title">
      <div className="section-header reveal">
        <div className="section-tag">Expertise</div>
        <h2 className="section-title" id="skills-title">Skills & <span className="hl">Technology</span></h2>
        <p className="section-sub">Full spectrum development from cloud infrastructure to delightful UIs.</p>
      </div>

      <div className="skills-grid">
        {[...skills.cards].sort((a, b) => (a.order || 0) - (b.order || 0)).map((skill, i) => {
          const Icon = AllIcons[skill.iconName] || AllIcons.IconFrontend;
          return (
            <div className="skill-card reveal" key={i} style={i > 0 ? { transitionDelay: `${Math.min(i, 4) * 0.1}s` } : undefined}>
              <div className="skill-icon" style={{ background: skill.bg }}><Icon /></div>
              <div className="skill-name">{skill.name}</div>
              <div className="skill-desc">{skill.desc}</div>
              <div className="skill-tags">
                {(skill.tags || []).map((tag, tIdx) => <span className="tag" key={tIdx}>{tag}</span>)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="tech-row reveal" style={{ marginTop: '48px' }}>
        {skills.techPills.map((pill, i) => {
          const Icon = AllIcons[pill.iconName] || AllIcons.IconJS;
          return (
            <div className="tech-pill" key={i}><Icon /> {pill.label}</div>
          );
        })}
      </div>
    </section>
  );
}

export default Skills;
