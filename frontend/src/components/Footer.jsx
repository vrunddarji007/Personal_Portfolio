function Footer() {
  return (
    <footer>
      <div className="footer-links">
        <a href="#skills">Skills</a>
        <a href="#projects">Projects</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
      </div>
      <div>
        Designed & built by <strong>Vrund Darji</strong> —{' '}
        <span style={{
          background: 'linear-gradient(90deg, var(--accent), var(--accent3))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Made with love & caffeine
        </span>
      </div>
    </footer>
  );
}

export default Footer;
