import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { IconMail, IconLinkedIn, IconGitHub, IconTwitter, IconGlobe, IconInstagram, IconDribbble, IconYoutube } from './Icons';

function Contact({ showToast }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [btnState, setBtnState] = useState('idle'); // idle | sending | sent
  const [contactData, setContactData] = useState({ 
    email: 'vrund@example.com', 
    socials: [
      { platform: 'LinkedIn', url: '#' },
      { platform: 'GitHub', url: '#' },
      { platform: 'Twitter', url: '#' }
    ]
  });

  useEffect(() => {
    axios.get(`${API_URL}/settings`)
      .then(res => {
        if (res.data.success && res.data.data.contact) {
          setContactData(res.data.data.contact);
        }
      })
      .catch(console.error);
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBtnState('sending');

    try {
      await axios.post(`${API_URL}/contact`, formData);
      setBtnState('sent');
      showToast('Message sent successfully! I\'ll get back to you soon.', 'success');
      setFormData({ name: '', email: '', subject: '', message: '' });

      setTimeout(() => setBtnState('idle'), 3000);
    } catch (error) {
      setBtnState('idle');
      const msg = error.response?.data?.message || 'Something went wrong. Please try again.';
      showToast(msg, 'error');
    }
  };

  const btnText = {
    idle: 'Send Message →',
    sending: 'Sending...',
    sent: '✓ Message Sent!',
  };

  const btnStyle = btnState === 'sent'
    ? { background: 'linear-gradient(135deg, #1d9e75, #43e8b8)', boxShadow: '0 8px 32px rgba(67,232,184,0.4)' }
    : {};

  return (
    <section id="contact" aria-labelledby="contact-title">
      <div className="section-header reveal">
        <div className="section-tag">Contact</div>
        <h2 className="section-title" id="contact-title">Let's <span className="hl">Connect</span></h2>
        <p className="section-sub">Have a project in mind? I'd love to hear about it.</p>
      </div>

      <div className="contact-inner reveal">
        <div className="contact-status">
          <div className="contact-status-dot"></div>
          <span className="contact-status-text">
            Available for freelance & full-time roles
          </span>
        </div>
        <h3 className="contact-heading">
          Send a Message
        </h3>

        <form className="contact-form" onSubmit={handleSubmit} noValidate>
          <div className="contact-row">
            <div className="form-group">
              <label className="form-label" htmlFor="contact-name">Name</label>
              <input
                type="text"
                id="contact-name"
                name="name"
                className="form-input"
                placeholder="Your name"
                value={formData.name}
                onChange={handleChange}
                required
                autoComplete="name"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="contact-email">Email</label>
              <input
                type="email"
                id="contact-email"
                name="email"
                className="form-input"
                placeholder="you@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="contact-subject">Subject</label>
            <input
              type="text"
              id="contact-subject"
              name="subject"
              className="form-input"
              placeholder="Project inquiry, collaboration..."
              value={formData.subject}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="contact-message">Message</label>
            <textarea
              id="contact-message"
              name="message"
              className="form-textarea"
              placeholder="Tell me about your project..."
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>
          </div>
          <button
            type="submit"
            className="btn-primary contact-submit"
            style={btnStyle}
            disabled={btnState === 'sending'}
            aria-disabled={btnState === 'sending'}
          >
            {btnText[btnState]}
          </button>
        </form>

        <div className="contact-socials">
          <a href={`mailto:${contactData.email}`} className="tech-pill" aria-label="Send email to vrund"><IconMail /> {contactData.email}</a>
          {(contactData.socials || []).map((social, idx) => {
            let Icon = IconGlobe;
            if (social.platform === 'LinkedIn') Icon = IconLinkedIn;
            if (social.platform === 'GitHub') Icon = IconGitHub;
            if (social.platform === 'Twitter' || social.platform === 'Twitter / X') Icon = IconTwitter;
            if (social.platform === 'Instagram') Icon = IconInstagram;
            if (social.platform === 'Dribbble') Icon = IconDribbble;
            if (social.platform === 'YouTube') Icon = IconYoutube;

            return (
              <a href={social.url} key={idx} className="tech-pill" target="_blank" rel="noopener noreferrer" aria-label={`${social.platform} profile`}>
                <Icon /> {social.platform}
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Contact;
