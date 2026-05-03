import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

function Hero() {
  const [stats, setStats] = useState({
    experience: '6+',
    projects: '48',
    clients: '24',
    coffee: '∞'
  });

  useEffect(() => {
    axios.get(`${API_URL}/settings`)
      .then(res => {
        if (res.data.success && res.data.data.heroStats) {
          setStats(res.data.data.heroStats);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <section id="hero">
      <div className="hero-badge">
        <span className="badge-dot"></span>Open to new opportunities
      </div>

      <h1 className="hero-title">
        <span className="grad1">Fullstack</span><br />
        <span className="grad2">Developer.</span>
      </h1>

      <p className="hero-sub">
        I craft end-to-end digital experiences — from pixel-perfect interfaces
        to resilient, scalable backend systems. Code that ships, design that moves.
      </p>

      <div className="hero-btns">
        <a href="#projects" className="btn-primary">View Work</a>
        <a href="#contact" className="btn-secondary">Let's Talk →</a>
      </div>

      <div className="hero-stats">
        <div className="stat-card">
          <div className="stat-num">{stats.experience}</div>
          <div className="stat-label">Years Experience</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{stats.projects}</div>
          <div className="stat-label">Projects Shipped</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{stats.clients}</div>
          <div className="stat-label">Happy Clients</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{stats.coffee}</div>
          <div className="stat-label">Coffee Consumed</div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
