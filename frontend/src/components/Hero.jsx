import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

function Hero() {
  const [stats, setStats] = useState([
    { label: 'Years Experience', value: '6+' },
    { label: 'Projects Shipped', value: '48' },
    { label: 'Happy Clients', value: '24' },
    { label: 'Coffee Consumed', value: '∞' }
  ]);

  useEffect(() => {
    axios.get(`${API_URL}/settings`)
      .then(res => {
        if (res.data.success && res.data.data.heroStats && res.data.data.heroStats.length > 0) {
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
        {stats.map((stat, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-num">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Hero;
