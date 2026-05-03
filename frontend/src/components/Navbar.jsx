import { useState, useEffect, useCallback, useRef } from 'react';

function Navbar() {
  const [activeSection, setActiveSection] = useState('hero');
  const [menuOpen, setMenuOpen] = useState(false);
  const ticking = useRef(false);

  const sections = ['hero', 'skills', 'projects', 'about', 'contact'];

  const updateActive = useCallback(() => {
    const scrollY = window.scrollY + 120;
    for (let i = sections.length - 1; i >= 0; i--) {
      const el = document.getElementById(sections[i]);
      if (el && el.offsetTop <= scrollY) {
        setActiveSection(sections[i]);
        return;
      }
    }
    setActiveSection('hero');
  }, []);

  useEffect(() => {
    updateActive();
    const handleScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          updateActive();
          ticking.current = false;
        });
        ticking.current = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [updateActive]);

  // Close menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleClick = (id) => {
    setActiveSection(id);
    setMenuOpen(false);
  };

  const links = [
    { id: 'hero', label: 'Home' },
    { id: 'skills', label: 'Skills' },
    { id: 'projects', label: 'Projects' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <>
      <div className="nav-wrapper">
        <nav aria-label="Main navigation">
          {/* VD Logo — permanently inside the pill on the left */}
          <a href="#hero" className="nav-logo-img-wrap" aria-label="Go to home" onClick={() => handleClick('hero')}>
            <img src="/VD.png" alt="VD Logo" className="nav-logo-img" />
          </a>
          <div className="nav-divider" aria-hidden="true"></div>
          <ul className="nav-links" role="menubar">
            {links.map((link) => (
              <li key={link.id} role="none">
                <a
                  href={`#${link.id}`}
                  role="menuitem"
                  className={activeSection === link.id ? 'active' : ''}
                  aria-current={activeSection === link.id ? 'true' : undefined}
                  onClick={() => handleClick(link.id)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <a href="#contact" className="nav-cta" aria-label="Hire me" onClick={() => handleClick('contact')}>Hire Me</a>
          {/* Hamburger - only visible on mobile */}
          <button
            className={`nav-hamburger${menuOpen ? ' open' : ''}`}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </nav>
      </div>


      {/* Mobile dropdown menu */}
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`} aria-hidden={!menuOpen}>
        <ul>
          {links.map((link) => (
            <li key={link.id}>
              <a
                href={`#${link.id}`}
                className={activeSection === link.id ? 'active' : ''}
                onClick={() => handleClick(link.id)}
              >
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a href="#contact" className="mobile-cta" onClick={() => handleClick('contact')}>Hire Me</a>
          </li>
        </ul>
      </div>

      {/* Overlay to close menu */}
      {menuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}

export default Navbar;
