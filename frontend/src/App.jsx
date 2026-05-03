import { useEffect, useState, useCallback, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import MiniProjects from './pages/MiniProjects';
import Maintenance from './pages/Maintenance';
import axios from 'axios';
import { API_URL } from './config';

function App() {
  const [toast, setToast] = useState({ message: '', type: '', show: false });
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const toastTimer = useRef(null);

  const showToast = useCallback((message, type = 'success') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, type, show: true });
    toastTimer.current = setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  }, []);

  useEffect(() => {
    // Scroll reveal observer — single instance, handles dynamic content via MutationObserver
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.12 });

    const observeReveals = () => {
      document.querySelectorAll('.reveal:not(.visible)').forEach(r => revealObserver.observe(r));
    };
    observeReveals();

    const mutationObserver = new MutationObserver(() => {
      observeReveals();
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    // Cursor glow on mouse move (subtle)
    const handleMouseMove = (e) => {
      const glow = document.getElementById('orb-follow');
      if (glow) {
        glow.style.left = (e.clientX - 125) + 'px';
        glow.style.top = (e.clientY - 125) + 'px';
        glow.style.transition = 'left 1.5s ease, top 1.5s ease';
      }
    };
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      revealObserver.disconnect();
      mutationObserver.disconnect();
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    axios.get(`${API_URL}/settings`)
      .then(res => {
        if (res.data.success && res.data.data) {
          setMaintenanceMode(res.data.data.maintenanceMode === true);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingSettings(false));
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={loadingSettings ? <div style={{ height: '100vh', background: '#0a0a0a' }}></div> : (maintenanceMode ? <Maintenance /> : <Home showToast={showToast} />)} />
        <Route path="/admin" element={<Admin showToast={showToast} />} />
        <Route path="/mini-projects" element={loadingSettings ? <div style={{ height: '100vh', background: '#0a0a0a' }}></div> : (maintenanceMode ? <Maintenance /> : <MiniProjects />)} />
      </Routes>

      {/* Global Toast Notification */}
      <div
        className={`toast ${toast.type} ${toast.show ? 'show' : ''}`}
        role="alert"
        aria-live="polite"
      >
        {toast.message}
      </div>
    </Router>
  );
}

export default App;
