import React, { useEffect } from 'react';
import BackgroundCanvas from '../components/BackgroundCanvas';
import { IconRocket } from '../components/Icons'; // Reuse an icon or we can use emoji

function Maintenance() {
  useEffect(() => {
    // Add subtle glow effect
    const handleMouseMove = (e) => {
      const glow = document.getElementById('orb-follow');
      if (glow) {
        glow.style.left = (e.clientX - 125) + 'px';
        glow.style.top = (e.clientY - 125) + 'px';
      }
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <BackgroundCanvas />
      
      {/* Orb glow for background effect */}
      <div id="orb-follow" style={{ position: 'absolute', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(108,99,255,0.15) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0, transition: 'left 1.5s ease, top 1.5s ease' }}></div>

      <div className="contact-inner" style={{ width: '100%', maxWidth: '600px', zIndex: 10, textAlign: 'center', padding: '60px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
          <div style={{ background: 'rgba(108,99,255,0.1)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(108,99,255,0.3)', boxShadow: '0 0 30px rgba(108,99,255,0.2)' }}>
            <span style={{ fontSize: '36px' }}>⚙️</span>
          </div>
        </div>

        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '42px', marginBottom: '16px', color: '#fff', letterSpacing: '-1px' }}>
          Upgrading the <span className="hl">Experience</span>
        </h1>
        
        <p style={{ color: 'var(--text-muted)', fontSize: '18px', lineHeight: '1.6', marginBottom: '40px', maxWidth: '400px', margin: '0 auto 40px auto' }}>
          I'm currently performing some scheduled maintenance and pushing a few exciting updates. I'll be back online shortly.
        </p>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '12px 24px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent3)', boxShadow: '0 0 10px var(--accent3)' }}></div>
          <span style={{ color: 'var(--text-muted)', fontSize: '14px', letterSpacing: '1px', textTransform: 'uppercase' }}>Status: Maintenance</span>
        </div>
      </div>
    </div>
  );
}

export default Maintenance;
