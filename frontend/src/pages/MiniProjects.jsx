import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import BackgroundCanvas from '../components/BackgroundCanvas';
import { API_URL } from '../config';

function MiniProjects() {
  const [miniProjects, setMiniProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_URL}/settings`)
      .then(res => {
        if (res.data.success && res.data.data.miniProjects) {
          setMiniProjects(res.data.data.miniProjects.sort((a, b) => (a.order || 0) - (b.order || 0)));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '80px', position: 'relative' }}>
      <BackgroundCanvas />
      
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '60px' }}>
          <div>
            <Link to="/" className="section-tag" style={{ margin: '0 0 16px 0', display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
              ← Back to Home
            </Link>
            <h1 className="section-title" style={{ margin: '0' }}>Mini <span className="hl">Projects</span></h1>
            <p className="section-sub" style={{ margin: '12px 0 0 0', textAlign: 'left' }}>
              Smaller experiments, micro-tools, and weekend hacks.
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading mini projects...</div>
        ) : miniProjects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No mini projects found.</div>
        ) : (
          <div className="projects-grid">
            {miniProjects.map((mp, index) => (
              <article key={mp._id || index} className="project-card reveal visible" style={{ transitionDelay: `${index * 0.1}s` }}>
                <div className="project-img" style={{ height: '140px' }}>
                  <div className="project-img-bg" style={{ background: mp.bgGradient || 'linear-gradient(135deg, rgba(108,99,255,0.15) 0%, rgba(67,232,184,0.08) 100%)' }}></div>
                  <div className="project-img-icon" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {mp.imageUrl ? (
                      <img src={mp.imageUrl.startsWith('http') ? mp.imageUrl : `${API_URL.replace('/api', '')}${mp.imageUrl}`} alt={mp.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '48px' }}>{mp.icon || '⚡'}</span>
                    )}
                  </div>
                </div>
                <div className="project-body" style={{ padding: '24px' }}>
                  <h3 className="project-title" style={{ fontSize: '18px' }}>{mp.title}</h3>
                  <p className="project-desc" style={{ fontSize: '13px' }}>{mp.desc}</p>
                  <div className="project-stack" style={{ marginBottom: '0' }}>
                    {(mp.tags || []).map((tag, tIdx) => (
                      <span className="tag" key={tIdx}>{tag}</span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default MiniProjects;
