import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { IconDeveloper } from './Icons';

function About() {
  const [aboutData, setAboutData] = useState({
    heading: 'I build things that matter.',
    p1: "Based in San Francisco, I'm a fullstack developer with 6 years of experience...",
    p2: "When I'm not pushing commits...",
    avatarUrl: '',
    facts: [
      { label: 'Location', value: 'San Francisco, CA' },
      { label: 'Role', value: 'Fullstack Developer' },
      { label: 'Availability', value: 'Open to Work' },
      { label: 'Preferred Stack', value: 'Next.js + Go' }
    ]
  });

  useEffect(() => {
    axios.get(`${API_URL}/settings`)
      .then(res => {
        if (res.data.success && res.data.data.about) {
          setAboutData(res.data.data.about);
        }
      })
      .catch(console.error);
  }, []);

  const BASE_URL = API_URL.replace('/api', '');

  return (
    <section id="about" aria-labelledby="about-title">
      <div className="section-header reveal">
        <div className="section-tag">Me</div>
        <h2 className="section-title" id="about-title">About <span className="hl">Vrund</span></h2>
      </div>

      <div className="about-inner">
        <div className="about-avatar-wrap reveal">
          <div className="about-avatar-ring" aria-hidden="true"></div>
          <div className="about-avatar" aria-hidden="true" style={{ overflow: 'hidden' }}>
            {aboutData.avatarUrl ? (
              <img src={`${BASE_URL}${aboutData.avatarUrl}`} alt="Vrund" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <IconDeveloper />
            )}
          </div>
        </div>

        <div className="about-text reveal">
          <h2>{aboutData.heading}</h2>
          <p>{aboutData.p1}</p>
          {aboutData.p2 && <p>{aboutData.p2}</p>}

          <div className="about-facts">
            {aboutData.facts.map((fact, index) => (
              <div className="fact-item" key={index}>
                <div className="fact-label">{fact.label}</div>
                <div className="fact-value" style={fact.label.toLowerCase() === 'availability' ? { color: 'var(--accent3)' } : {}}>{fact.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
