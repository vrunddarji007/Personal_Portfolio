import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { IconMail, IconDatabase, IconRocket } from '../components/Icons';
import BackgroundCanvas from '../components/BackgroundCanvas';

function Admin({ showToast }) {
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('messages'); // 'messages' | 'projects'
  
  const [messages, setMessages] = useState([]);
  const [projects, setProjects] = useState([]);
  const [settings, setSettings] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [miniProjectFiles, setMiniProjectFiles] = useState({});

  // Add/Edit Project Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [newProject, setNewProject] = useState({
    title: '', description: '', gradient: '', stack: '', liveUrl: '', githubUrl: '', order: 0
  });

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token, activeTab]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { password });
      if (res.data.success && res.data.token) {
        setToken(res.data.token);
        localStorage.setItem('adminToken', res.data.token);
        showToast('Login successful!', 'success');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed';
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('adminToken');
    setMessages([]);
    setProjects([]);
    showToast('Logged out.', 'success');
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', newProject.title);
      formData.append('description', newProject.description);
      formData.append('gradient', newProject.gradient);
      formData.append('stack', newProject.stack);
      formData.append('order', newProject.order);
      if (newProject.liveUrl) formData.append('liveUrl', newProject.liveUrl);
      if (newProject.githubUrl) formData.append('githubUrl', newProject.githubUrl);
      if (imageFile) formData.append('image', imageFile);

      if (editingProjectId) {
        const res = await axios.put(`${API_URL}/projects/${editingProjectId}`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        if (res.data.success) {
          showToast('Project updated successfully!', 'success');
          setProjects(projects.map(p => p._id === editingProjectId ? res.data.data : p).sort((a,b) => a.order - b.order));
        }
      } else {
        const res = await axios.post(`${API_URL}/projects`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        if (res.data.success) {
          showToast('Project added successfully!', 'success');
          setProjects([...projects, res.data.data].sort((a,b) => a.order - b.order));
        }
      }

      setShowAddForm(false);
      setEditingProjectId(null);
      setImageFile(null);
      setNewProject({ title: '', description: '', gradient: '', stack: '', liveUrl: '', githubUrl: '', order: 0 });
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to save project';
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (project) => {
    setEditingProjectId(project._id);
    setImageFile(null);
    setNewProject({
      ...project,
      stack: project.stack.join(', '),
      liveUrl: project.liveUrl || '',
      githubUrl: project.githubUrl || '',
    });
    setShowAddForm(true);
  };
  
  const cancelForm = () => {
    setShowAddForm(false);
    setEditingProjectId(null);
    setImageFile(null);
    setNewProject({ title: '', description: '', gradient: '', stack: '', liveUrl: '', githubUrl: '', order: 0 });
  };

  const deleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      const res = await axios.delete(`${API_URL}/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setProjects(projects.filter(p => p._id !== id));
        showToast('Project deleted', 'success');
      }
    } catch (err) {
      showToast('Failed to delete project', 'error');
    }
  };

  const fetchData = async () => {
    try {
      if (activeTab === 'messages') {
        const res = await axios.get(`${API_URL}/contact`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(res.data.data || []);
      } else if (activeTab === 'projects') {
        const res = await axios.get(`${API_URL}/projects`);
        setProjects(res.data.data || []);
      } else if (activeTab === 'settings') {
        const res = await axios.get(`${API_URL}/settings`);
        const data = res.data.data || null;
        if (data) {
          // Migrate old heroStats object to new array format
          if (data.heroStats && !Array.isArray(data.heroStats)) {
            const old = data.heroStats;
            data.heroStats = [
              { label: 'Years Experience', value: old.experience || '' },
              { label: 'Projects Shipped', value: old.projects || '' },
              { label: 'Happy Clients', value: old.clients || '' },
              { label: 'Coffee Consumed', value: old.coffee || '' },
            ].filter(s => s.value);
          }
          if (!data.heroStats) data.heroStats = [];
        }
        setSettings(data);
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleLogout();
        showToast('Session expired. Please login again.', 'error');
      } else {
        showToast('Failed to fetch data.', 'error');
      }
    }
  };

  const saveSettings = async (e) => {
    if(e) e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('heroStats', JSON.stringify(settings.heroStats));
      formData.append('about', JSON.stringify(settings.about));
      formData.append('contact', JSON.stringify(settings.contact));
      formData.append('skills', JSON.stringify(settings.skills));
      formData.append('miniProjects', JSON.stringify(settings.miniProjects || []));
      if (avatarFile) formData.append('avatarImage', avatarFile);
      
      Object.keys(miniProjectFiles).forEach(index => {
        if (miniProjectFiles[index]) {
          formData.append(`miniProjectImage_${index}`, miniProjectFiles[index]);
        }
      });
      
      const res = await axios.put(`${API_URL}/settings`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      if (res.data.success) {
        setSettings(res.data.data);
        setAvatarFile(null); // Clear selected file after saving
        setMiniProjectFiles({});
        showToast('Settings saved successfully!', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to save settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleMaintenance = async () => {
    if (!settings) return;
    const newMode = !settings.maintenanceMode;
    setSettings({ ...settings, maintenanceMode: newMode });
    
    try {
      const formData = new FormData();
      formData.append('maintenanceMode', newMode);
      
      const res = await axios.put(`${API_URL}/settings`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        showToast(newMode ? 'Maintenance Mode ON' : 'Maintenance Mode OFF', 'success');
      }
    } catch (err) {
      setSettings({ ...settings, maintenanceMode: !newMode }); // revert
      showToast('Failed to toggle maintenance mode', 'error');
    }
  };

  if (!token) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <BackgroundCanvas />
        <div className="contact-inner" style={{ width: '100%', maxWidth: '400px', zIndex: 10 }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '24px', marginBottom: '24px', textAlign: 'center' }}>Admin Login</h2>
          <form className="contact-form" onSubmit={handleLogin} style={{ marginTop: '0' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="admin-password">Secure Password</label>
              <input
                type="password"
                id="admin-password"
                className="form-input"
                placeholder="Enter admin password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="btn-primary contact-submit"
              disabled={loading || !password}
            >
              {loading ? 'Authenticating...' : 'Secure Login →'}
            </button>
          </form>
          <a href="/" style={{ display: 'block', textAlign: 'center', marginTop: '24px', color: 'var(--text-muted)', fontSize: '13px', textDecoration: 'none' }}>
            ← Back to Portfolio
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', paddingTop: '80px', paddingBottom: '80px', position: 'relative' }}>
      <BackgroundCanvas />
      
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>
        
        {/* Admin Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <div className="section-tag" style={{ margin: '0 0 12px 0' }}>Dashboard</div>
            <h1 className="section-title" style={{ margin: '0', fontSize: '32px' }}>Admin <span className="hl">Panel</span></h1>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {settings && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '6px 12px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '13px', color: settings.maintenanceMode ? 'var(--accent)' : 'var(--text-muted)' }}>Maintenance</span>
                <div 
                  onClick={toggleMaintenance}
                  style={{ width: '40px', height: '22px', background: settings.maintenanceMode ? 'var(--accent)' : 'rgba(255,255,255,0.1)', borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: 'background 0.3s ease' }}
                >
                  <div style={{ width: '18px', height: '18px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: settings.maintenanceMode ? '20px' : '2px', transition: 'left 0.3s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                </div>
              </div>
            )}
            <a href="/" className="btn-sm outline" style={{ color: 'var(--text)' }}>View Site</a>
            <button onClick={handleLogout} className="btn-sm filled" style={{ background: 'rgba(255,255,255,0.1)' }}>Logout</button>
          </div>
        </div>

        {/* Admin Tabs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
          <button 
            onClick={() => setActiveTab('messages')}
            className={`btn-sm ${activeTab === 'messages' ? 'filled' : 'outline'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <IconMail /> {messages.length > 0 ? `Messages (${messages.length})` : 'Messages'}
          </button>
          <button 
            onClick={() => setActiveTab('projects')}
            className={`btn-sm ${activeTab === 'projects' ? 'filled' : 'outline'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <IconRocket /> {projects.length > 0 ? `Projects (${projects.length})` : 'Projects'}
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`btn-sm ${activeTab === 'settings' ? 'filled' : 'outline'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            ⚙️ Site Content
          </button>
        </div>

        {/* Main Content Area */}
        <div className="contact-inner" style={{ maxWidth: '100%', padding: '32px' }}>
          
          {activeTab === 'settings' && settings && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '20px', fontFamily: "'Syne', sans-serif" }}>Site Content Manager</h3>
                <button onClick={saveSettings} className="btn-primary contact-submit" style={{ margin: 0, padding: '8px 16px', fontSize: '13px' }} disabled={loading}>
                  {loading ? 'Saving...' : 'Save All Changes'}
                </button>
              </div>

              {/* Hero Stats */}
              <div style={{ marginBottom: '40px' }}>
                <h3 style={{ marginBottom: '16px', color: 'var(--accent)', fontSize: '24px', fontFamily: "'Syne', sans-serif" }}>Hero Section Stats</h3>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(108,99,255,0.3)' }}>
                <div className="contact-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {(settings.heroStats || []).map((stat, i) => (
                    <div key={i} className="form-group" style={{ position: 'relative' }}>
                      <input 
                        className="form-input" 
                        value={stat.label} 
                        onChange={e => {
                          const newStats = [...settings.heroStats];
                          newStats[i] = { ...newStats[i], label: e.target.value };
                          setSettings({...settings, heroStats: newStats});
                        }}
                        placeholder="Label"
                        style={{ marginBottom: '8px', fontSize: '12px', color: 'var(--accent)', background: 'transparent', border: '1px solid rgba(108,99,255,0.2)', padding: '4px 8px' }}
                      />
                      <input 
                        className="form-input" 
                        value={stat.value} 
                        onChange={e => {
                          const newStats = [...settings.heroStats];
                          newStats[i] = { ...newStats[i], value: e.target.value };
                          setSettings({...settings, heroStats: newStats});
                        }}
                        placeholder="Value"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newStats = settings.heroStats.filter((_, idx) => idx !== i);
                          setSettings({...settings, heroStats: newStats});
                        }}
                        style={{ position: 'absolute', top: '0', right: '0', background: 'transparent', border: 'none', color: '#ff5050', cursor: 'pointer', fontSize: '16px', padding: '2px 6px' }}
                      >✕</button>
                    </div>
                  ))}
                </div>
                <button 
                  type="button" 
                  onClick={() => {
                    const newStats = [...(settings.heroStats || []), { label: 'New Stat', value: '0' }];
                    setSettings({...settings, heroStats: newStats});
                  }} 
                  className="btn-sm outline" 
                  style={{ marginTop: '16px' }}
                >
                  + Add Stat Box
                </button>
              </div>
            </div>

              {/* Skills & Tech Pills Section */}
              <div style={{ marginBottom: '40px' }}>
                <h3 style={{ marginBottom: '16px', color: 'var(--accent)', fontSize: '24px', fontFamily: "'Syne', sans-serif" }}>Skills & Expertise (Cards)</h3>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(108,99,255,0.3)' }}>
                
                {(settings.skills?.cards || []).map((card, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label" style={{ fontSize: '12px' }}>Card Name / Title</label>
                        <input className="form-input" value={card.name} onChange={e => {
                          const newCards = [...settings.skills.cards];
                          newCards[i].name = e.target.value;
                          setSettings({...settings, skills: {...settings.skills, cards: newCards}});
                        }} />
                      </div>
                      <div className="form-group" style={{ width: '80px' }}>
                        <label className="form-label" style={{ fontSize: '12px' }}>Order</label>
                        <input className="form-input" type="number" value={card.order || 0} onChange={e => {
                          const newCards = [...settings.skills.cards];
                          newCards[i].order = Number(e.target.value);
                          setSettings({...settings, skills: {...settings.skills, cards: newCards}});
                        }} />
                      </div>
                      <div className="form-group" style={{ width: '130px' }}>
                        <label className="form-label" style={{ fontSize: '12px' }}>Background Color</label>
                        <input className="form-input" placeholder="rgba(...)" value={card.bg} onChange={e => {
                          const newCards = [...settings.skills.cards];
                          newCards[i].bg = e.target.value;
                          setSettings({...settings, skills: {...settings.skills, cards: newCards}});
                        }} />
                      </div>
                      <div className="form-group" style={{ width: '150px' }}>
                        <label className="form-label" style={{ fontSize: '12px' }}>Icon</label>
                        <select className="form-input" style={{ padding: '12px' }} value={card.iconName} onChange={e => {
                          const newCards = [...settings.skills.cards];
                          newCards[i].iconName = e.target.value;
                          setSettings({...settings, skills: {...settings.skills, cards: newCards}});
                        }}>
                          <option value="IconFrontend">Frontend</option>
                          <option value="IconBackend">Backend</option>
                          <option value="IconDatabase">Database</option>
                          <option value="IconCloud">Cloud</option>
                          <option value="IconAI">AI / ML</option>
                          <option value="IconDesign">Design</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="form-group" style={{ marginBottom: '12px' }}>
                      <label className="form-label" style={{ fontSize: '12px' }}>Description</label>
                      <textarea className="form-textarea" style={{ height: '60px' }} value={card.desc} onChange={e => {
                        const newCards = [...settings.skills.cards];
                        newCards[i].desc = e.target.value;
                        setSettings({...settings, skills: {...settings.skills, cards: newCards}});
                      }} />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div className="form-group" style={{ flex: 1, margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>Tags</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                          {(card.tags || []).map((tag, tIdx) => (
                             <span key={tIdx} style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                               {tag}
                               <button type="button" onClick={() => {
                                 const newCards = [...settings.skills.cards];
                                 newCards[i].tags = newCards[i].tags.filter((_, tagIndex) => tagIndex !== tIdx);
                                 setSettings({...settings, skills: {...settings.skills, cards: newCards}});
                               }} style={{ background: 'none', border: 'none', color: 'var(--accent3)', cursor: 'pointer', padding: 0 }}>✕</button>
                             </span>
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input className="form-input" style={{ flex: 1 }} placeholder="New tag (press Enter)" id={`tag-input-${i}`} onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const val = e.target.value.trim();
                              if (val && !card.tags.includes(val)) {
                                const newCards = [...settings.skills.cards];
                                newCards[i].tags = [...(newCards[i].tags || []), val];
                                setSettings({...settings, skills: {...settings.skills, cards: newCards}});
                                e.target.value = '';
                              }
                            }
                          }} />
                          <button type="button" onClick={() => {
                            const input = document.getElementById(`tag-input-${i}`);
                            const val = input.value.trim();
                            if (val && !card.tags.includes(val)) {
                              const newCards = [...settings.skills.cards];
                              newCards[i].tags = [...(newCards[i].tags || []), val];
                              setSettings({...settings, skills: {...settings.skills, cards: newCards}});
                              input.value = '';
                            }
                          }} className="btn-sm outline" style={{ minWidth: '42px', height: '42px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>+</button>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                      <button type="button" onClick={() => {
                        const newCards = settings.skills.cards.filter((_, idx) => idx !== i);
                        setSettings({...settings, skills: {...settings.skills, cards: newCards}});
                      }} className="btn-sm outline" style={{ color: 'var(--accent3)', borderColor: 'rgba(244, 66, 66, 0.2)' }}>✕ Remove Card</button>
                    </div>
                  </div>
                ))}
                
                <button type="button" onClick={() => {
                  const newCards = [...(settings.skills?.cards || []), { name: 'New Skill', desc: '', tags: [], iconName: 'IconFrontend', bg: 'rgba(108,99,255,0.12)' }];
                  setSettings({...settings, skills: {...settings.skills, cards: newCards}});
                }} className="btn-sm outline">
                  + Add Skill Card
                </button>
              </div>
            </div>

              {/* Tech Pills Section */}
              <div style={{ marginBottom: '40px' }}>
                <h3 style={{ marginBottom: '16px', color: 'var(--accent)', fontSize: '24px', fontFamily: "'Syne', sans-serif" }}>Tech Pills (Mini Icons)</h3>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(108,99,255,0.3)' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                  {(settings.skills?.techPills || []).map((pill, i) => (
                    <div key={i} style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px', alignItems: 'center' }}>
                      <input className="form-input" style={{ width: '100px', padding: '6px', fontSize: '12px' }} placeholder="Label" value={pill.label} onChange={e => {
                        const newPills = [...settings.skills.techPills];
                        newPills[i].label = e.target.value;
                        setSettings({...settings, skills: {...settings.skills, techPills: newPills}});
                      }} />
                      <select className="form-input" style={{ width: '100px', padding: '6px', fontSize: '12px' }} value={pill.iconName} onChange={e => {
                        const newPills = [...settings.skills.techPills];
                        newPills[i].iconName = e.target.value;
                        setSettings({...settings, skills: {...settings.skills, techPills: newPills}});
                      }}>
                        <option value="IconHTML">HTML5</option>
                        <option value="IconCSS">CSS3</option>
                        <option value="IconTailwind">Tailwind</option>
                        <option value="IconJS">JS</option>
                        <option value="IconTS">TS</option>
                        <option value="IconReact">React</option>
                        <option value="IconNextJS">Next.js</option>
                        <option value="IconVue">Vue</option>
                        <option value="IconAngular">Angular</option>
                        <option value="IconNode">Node.js</option>
                        <option value="IconPython">Python</option>
                        <option value="IconJava">Java</option>
                        <option value="IconGo">Go</option>
                        <option value="IconPostgres">Postgres</option>
                        <option value="IconMongo">MongoDB</option>
                        <option value="IconRedis">Redis</option>
                        <option value="IconFirebase">Firebase</option>
                        <option value="IconGraphQL">GraphQL</option>
                        <option value="IconDocker">Docker</option>
                        <option value="IconAWS">AWS</option>
                        <option value="IconFigma">Figma</option>
                        <option value="IconGitHub">GitHub</option>
                      </select>
                      <button type="button" onClick={() => {
                        const newPills = settings.skills.techPills.filter((_, idx) => idx !== i);
                        setSettings({...settings, skills: {...settings.skills, techPills: newPills}});
                      }} className="btn-sm outline" style={{ padding: '6px 10px', color: 'var(--accent3)' }}>✕</button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => {
                  const newPills = [...(settings.skills?.techPills || []), { label: 'Tool', iconName: 'IconJS' }];
                  setSettings({...settings, skills: {...settings.skills, techPills: newPills}});
                }} className="btn-sm outline">
                  + Add Tech Pill
                </button>
              </div>
            </div>

              {/* Mini Projects Section */}
              <div style={{ marginBottom: '40px' }}>
                <h3 style={{ marginBottom: '16px', color: 'var(--accent)', fontSize: '24px', fontFamily: "'Syne', sans-serif" }}>Mini Projects</h3>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(108,99,255,0.3)' }}>
                
                {(settings.miniProjects || []).map((mp, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label" style={{ fontSize: '12px' }}>Title</label>
                        <input className="form-input" value={mp.title} onChange={e => {
                          const newMp = [...(settings.miniProjects || [])];
                          newMp[i].title = e.target.value;
                          setSettings({...settings, miniProjects: newMp});
                        }} />
                      </div>
                      <div className="form-group" style={{ width: '80px' }}>
                        <label className="form-label" style={{ fontSize: '12px' }}>Order</label>
                        <input className="form-input" type="number" value={mp.order || 0} onChange={e => {
                          const newMp = [...(settings.miniProjects || [])];
                          newMp[i].order = Number(e.target.value);
                          setSettings({...settings, miniProjects: newMp});
                        }} />
                      </div>
                      <div className="form-group" style={{ width: '120px' }}>
                        <label className="form-label" style={{ fontSize: '12px' }}>Project Photo</label>
                        {(mp.imageUrl || miniProjectFiles[i]) && (
                           <img src={miniProjectFiles[i] ? URL.createObjectURL(miniProjectFiles[i]) : `${API_URL.replace('/api', '')}${mp.imageUrl}`} style={{ width: '100%', height: '40px', borderRadius: '4px', objectFit: 'cover', marginBottom: '8px', display: 'block', border: '1px solid rgba(108,99,255,0.4)' }} alt="Preview" />
                        )}
                        <input className="form-input" type="file" accept="image/*" onChange={e => {
                          setMiniProjectFiles(prev => ({ ...prev, [i]: e.target.files[0] }));
                        }} style={{ padding: '6px', fontSize: '10px' }} />
                      </div>
                    </div>
                    
                    <div className="form-group" style={{ marginBottom: '12px' }}>
                      <label className="form-label" style={{ fontSize: '12px' }}>Description</label>
                      <textarea className="form-textarea" style={{ height: '60px' }} value={mp.desc} onChange={e => {
                        const newMp = [...(settings.miniProjects || [])];
                        newMp[i].desc = e.target.value;
                        setSettings({...settings, miniProjects: newMp});
                      }} />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label" style={{ fontSize: '12px' }}>Background Gradient</label>
                        <input className="form-input" placeholder="linear-gradient(...)" value={mp.bgGradient} onChange={e => {
                          const newMp = [...(settings.miniProjects || [])];
                          newMp[i].bgGradient = e.target.value;
                          setSettings({...settings, miniProjects: newMp});
                        }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div className="form-group" style={{ flex: 1, margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>Tags</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                          {(mp.tags || []).map((tag, tIdx) => (
                             <span key={tIdx} style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                               {tag}
                               <button type="button" onClick={() => {
                                 const newMp = [...settings.miniProjects];
                                 newMp[i].tags = newMp[i].tags.filter((_, tagIndex) => tagIndex !== tIdx);
                                 setSettings({...settings, miniProjects: newMp});
                               }} style={{ background: 'none', border: 'none', color: 'var(--accent3)', cursor: 'pointer', padding: 0 }}>✕</button>
                             </span>
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input className="form-input" style={{ flex: 1 }} placeholder="New tag (press Enter)" id={`mp-tag-input-${i}`} onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const val = e.target.value.trim();
                              if (val && !(mp.tags || []).includes(val)) {
                                const newMp = [...settings.miniProjects];
                                newMp[i].tags = [...(newMp[i].tags || []), val];
                                setSettings({...settings, miniProjects: newMp});
                                e.target.value = '';
                              }
                            }
                          }} />
                          <button type="button" onClick={() => {
                            const input = document.getElementById(`mp-tag-input-${i}`);
                            const val = input.value.trim();
                            if (val && !(mp.tags || []).includes(val)) {
                              const newMp = [...settings.miniProjects];
                              newMp[i].tags = [...(newMp[i].tags || []), val];
                              setSettings({...settings, miniProjects: newMp});
                              input.value = '';
                            }
                          }} className="btn-sm outline" style={{ minWidth: '42px', height: '42px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>+</button>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                      <button type="button" onClick={() => {
                        const newMp = settings.miniProjects.filter((_, idx) => idx !== i);
                        setSettings({...settings, miniProjects: newMp});
                      }} className="btn-sm outline" style={{ color: 'var(--accent3)', borderColor: 'rgba(244, 66, 66, 0.2)' }}>✕ Remove Mini Project</button>
                    </div>
                  </div>
                ))}
                
                <button type="button" onClick={() => {
                  const newMp = [...(settings.miniProjects || []), { title: 'New Mini Project', desc: '', tags: [], imageUrl: '', bgGradient: 'linear-gradient(135deg, rgba(108,99,255,0.15) 0%, rgba(67,232,184,0.08) 100%)', order: 0 }];
                  setSettings({...settings, miniProjects: newMp});
                }} className="btn-sm outline">
                  + Add Mini Project
                </button>
              </div>
            </div>

              {/* About Section */}
              <div style={{ marginBottom: '40px' }}>
                <h3 style={{ marginBottom: '16px', color: 'var(--accent)', fontSize: '24px', fontFamily: "'Syne', sans-serif" }}>About Section</h3>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(108,99,255,0.3)' }}>
                
                <div className="form-group">
                  <label className="form-label">Profile Avatar Image</label>
                  {(avatarFile || settings.about.avatarUrl) && (
                    <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <img src={avatarFile ? URL.createObjectURL(avatarFile) : `${API_URL.replace('/api', '')}${settings.about.avatarUrl}`} alt="Avatar Preview" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(108,99,255,0.4)', background: '#000' }} />
                      <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{avatarFile ? 'New Avatar Preview (Unsaved)' : 'Current Avatar Active'}</div>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <input className="form-input" type="file" accept="image/*" onChange={e => setAvatarFile(e.target.files[0])} style={{ padding: '12px', flex: 1 }} />
                    <button type="button" onClick={() => {
                        setAvatarFile(null);
                        setSettings({...settings, about: {...settings.about, avatarUrl: ''}});
                    }} className="btn-sm outline">Clear</button>
                  </div>
                  {settings.about.avatarUrl && <small style={{ color: 'var(--text-muted)', marginTop: '8px', display: 'block' }}>Leave blank to keep current image</small>}
                </div>

                <div className="form-group">
                  <label className="form-label">Heading</label>
                  <input className="form-input" value={settings.about.heading} onChange={e => setSettings({...settings, about: {...settings.about, heading: e.target.value}})} />
                </div>
                <div className="form-group" style={{ marginTop: '16px' }}>
                  <label className="form-label">Paragraph 1</label>
                  <textarea className="form-textarea" style={{ height: '80px' }} value={settings.about.p1} onChange={e => setSettings({...settings, about: {...settings.about, p1: e.target.value}})} />
                </div>
                <div className="form-group" style={{ marginTop: '16px' }}>
                  <label className="form-label">Paragraph 2</label>
                  <textarea className="form-textarea" style={{ height: '80px' }} value={settings.about.p2} onChange={e => setSettings({...settings, about: {...settings.about, p2: e.target.value}})} />
                </div>
                
                <div style={{ marginTop: '24px' }}>
                  <h5 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--text)' }}>Quick Facts (Max 4)</h5>
                  {settings.about.facts.map((fact, i) => (
                    <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                      <input className="form-input" placeholder="Label (e.g. Location)" value={fact.label} onChange={e => {
                        const newFacts = [...settings.about.facts];
                        newFacts[i].label = e.target.value;
                        setSettings({...settings, about: {...settings.about, facts: newFacts}});
                      }} />
                      <input className="form-input" placeholder="Value (e.g. San Francisco)" value={fact.value} onChange={e => {
                        const newFacts = [...settings.about.facts];
                        newFacts[i].value = e.target.value;
                        setSettings({...settings, about: {...settings.about, facts: newFacts}});
                      }} />
                      <button type="button" onClick={() => {
                        const newFacts = settings.about.facts.filter((_, idx) => idx !== i);
                        setSettings({...settings, about: {...settings.about, facts: newFacts}});
                      }} className="btn-sm outline" style={{ color: 'var(--accent3)' }}>✕</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => setSettings({...settings, about: {...settings.about, facts: [...settings.about.facts, {label: '', value: ''}]}})} className="btn-sm outline">
                    + Add Fact
                  </button>
                </div>
              </div>
            </div>

              {/* Contact Section */}
              <div style={{ marginBottom: '40px' }}>
                <h3 style={{ marginBottom: '16px', color: 'var(--accent)', fontSize: '24px', fontFamily: "'Syne', sans-serif" }}>Social Links & Contact</h3>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(108,99,255,0.3)' }}>
                
                <div className="contact-row" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '24px' }}>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input className="form-input" value={settings.contact.email} onChange={e => setSettings({...settings, contact: {...settings.contact, email: e.target.value}})} type="email" />
                  </div>
                </div>

                <div style={{ marginTop: '24px' }}>
                  <h5 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--text)' }}>Social Media Links</h5>
                  {(settings.contact.socials || []).map((social, i) => {
                    const knownPlatforms = ['LinkedIn', 'GitHub', 'Twitter', 'Twitter / X', 'Instagram', 'Dribbble', 'YouTube'];
                    const isCustom = !knownPlatforms.includes(social.platform);
                    const selectValue = isCustom ? 'Custom' : social.platform;

                    return (
                    <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                      <select 
                        className="form-input" 
                        value={selectValue === 'Twitter / X' ? 'Twitter' : selectValue} 
                        onChange={e => {
                          const newSocials = [...settings.contact.socials];
                          newSocials[i].platform = e.target.value === 'Custom' ? 'Website' : e.target.value;
                          setSettings({...settings, contact: {...settings.contact, socials: newSocials}});
                        }}
                        style={{ maxWidth: '140px', padding: '12px' }}
                      >
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="GitHub">GitHub</option>
                        <option value="Twitter">Twitter / X</option>
                        <option value="Instagram">Instagram</option>
                        <option value="Dribbble">Dribbble</option>
                        <option value="YouTube">YouTube</option>
                        <option value="Custom">Other...</option>
                      </select>

                      {isCustom && (
                        <input className="form-input" style={{ maxWidth: '120px' }} placeholder="Label..." value={social.platform} onChange={e => {
                          const newSocials = [...settings.contact.socials];
                          newSocials[i].platform = e.target.value;
                          setSettings({...settings, contact: {...settings.contact, socials: newSocials}});
                        }} />
                      )}

                      <input className="form-input" placeholder="Profile URL (https://...)" value={social.url} onChange={e => {
                        const newSocials = [...settings.contact.socials];
                        newSocials[i].url = e.target.value;
                        setSettings({...settings, contact: {...settings.contact, socials: newSocials}});
                      }} />
                      <button type="button" onClick={() => {
                        const newSocials = settings.contact.socials.filter((_, idx) => idx !== i);
                        setSettings({...settings, contact: {...settings.contact, socials: newSocials}});
                      }} className="btn-sm outline" style={{ color: 'var(--accent3)' }}>✕</button>
                    </div>
                  )})}
                  <button type="button" onClick={() => {
                    const newSocials = [...(settings.contact.socials || []), {platform: 'LinkedIn', url: ''}];
                    setSettings({...settings, contact: {...settings.contact, socials: newSocials}});
                  }} className="btn-sm outline">
                    + Add Link
                  </button>
                </div>
              </div>
            </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '20px', fontFamily: "'Syne', sans-serif" }}>Incoming Messages</h3>
              {messages.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No messages yet.</p>
              ) : (
                messages.map(msg => (
                  <div key={msg._id} style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <strong style={{ fontSize: '16px', color: 'var(--accent3)' }}>{msg.name}</strong>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(msg.createdAt).toLocaleString()}</span>
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '12px' }}>{msg.email}</div>
                    <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Subject: {msg.subject}</div>
                    <p style={{ fontSize: '14px', lineHeight: '1.6', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px' }}>{msg.message}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'projects' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '20px', fontFamily: "'Syne', sans-serif" }}>Manage Projects</h3>
                <button 
                  onClick={() => showAddForm ? cancelForm() : setShowAddForm(true)}
                  className="btn-primary contact-submit" 
                  style={{ margin: 0, padding: '8px 16px', fontSize: '13px' }}
                >
                  {showAddForm ? 'Cancel' : '+ Add Project'}
                </button>
              </div>

              {showAddForm && (
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(108,99,255,0.3)', marginBottom: '16px' }}>
                  <h4 style={{ marginBottom: '16px', color: 'var(--accent)' }}>{editingProjectId ? 'Edit Project' : 'Create New Project'}</h4>
                  <form className="contact-form" style={{ marginTop: 0 }} onSubmit={handleAddProject}>
                    <div className="contact-row">
                      <div className="form-group">
                        <label className="form-label">Title</label>
                        <input className="form-input" required value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} placeholder="e.g. NextJS SaaS" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Order (0 = first)</label>
                        <input className="form-input" type="number" required value={newProject.order} onChange={e => setNewProject({...newProject, order: e.target.value})} />
                      </div>
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea className="form-textarea" style={{ height: '80px' }} required value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} placeholder="Describe the project..." />
                    </div>

                    <div className="contact-row">
                      <div className="form-group" style={{ flex: '1' }}>
                        <label className="form-label">Project Image</label>
                        {(imageFile || newProject.imageUrl) && (
                          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <img src={imageFile ? URL.createObjectURL(imageFile) : (newProject.imageUrl.startsWith('http') ? newProject.imageUrl : `${API_URL.replace('/api', '')}${newProject.imageUrl}`)} alt="Project preview" style={{ width: '120px', height: '80px', borderRadius: '8px', objectFit: 'cover', border: '1px solid rgba(108,99,255,0.4)' }} />
                            <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{imageFile ? 'New Image Preview (Unsaved)' : 'Current Project Image'}</div>
                          </div>
                        )}
                        <input className="form-input" type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} style={{ padding: '12px' }} />
                        {editingProjectId && <small style={{ color: 'var(--text-muted)', marginTop: '8px', display: 'block' }}>Leave blank to keep current image</small>}
                      </div>
                    </div>

                    <div className="contact-row">
                      <div className="form-group">
                        <label className="form-label">Gradient (CSS)</label>
                        <input className="form-input" required value={newProject.gradient} onChange={e => setNewProject({...newProject, gradient: e.target.value})} placeholder="e.g. linear-gradient(...)" />
                      </div>
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label className="form-label">Tech Stack (click to toggle)</label>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                          {['HTML5','CSS3','Tailwind','JavaScript','TypeScript','React','Next.js','Vue','Angular','Node.js','Python','Java','Go','PostgreSQL','MongoDB','Redis','Firebase','GraphQL','Docker','AWS','Stripe','FastAPI','LangChain','Pinecone','FHIR','Azure','K8s','Express'].map(tech => {
                            const selected = newProject.stack.split(',').map(s => s.trim()).filter(Boolean).includes(tech);
                            return (
                              <button
                                key={tech}
                                type="button"
                                onClick={() => {
                                  const currentStack = newProject.stack.split(',').map(s => s.trim()).filter(Boolean);
                                  const newStack = selected
                                    ? currentStack.filter(t => t !== tech)
                                    : [...currentStack, tech];
                                  setNewProject({...newProject, stack: newStack.join(', ')});
                                }}
                                style={{
                                  padding: '6px 12px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer',
                                  background: selected ? 'rgba(108,99,255,0.3)' : 'rgba(255,255,255,0.04)',
                                  border: selected ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.08)',
                                  color: selected ? '#fff' : 'var(--text-muted)',
                                  transition: 'all 0.2s ease', fontWeight: selected ? '600' : '400'
                                }}
                              >
                                {tech}
                              </button>
                            );
                          })}
                        </div>
                        <input 
                          className="form-input" 
                          value={newProject.stack} 
                          onChange={e => setNewProject({...newProject, stack: e.target.value})} 
                          placeholder="Or type custom: React, Node.js, MongoDB"
                          style={{ marginTop: '8px', fontSize: '12px' }}
                        />
                      </div>
                    </div>

                    <div className="contact-row">
                      <div className="form-group">
                        <label className="form-label">Live URL</label>
                        <input className="form-input" type="url" value={newProject.liveUrl} onChange={e => setNewProject({...newProject, liveUrl: e.target.value})} placeholder="https://..." />
                      </div>
                      <div className="form-group">
                        <label className="form-label">GitHub URL</label>
                        <input className="form-input" type="url" value={newProject.githubUrl} onChange={e => setNewProject({...newProject, githubUrl: e.target.value})} placeholder="https://github.com/..." />
                      </div>
                    </div>

                    <button type="submit" className="btn-primary contact-submit" disabled={loading}>
                      {loading ? 'Saving...' : 'Save Project'}
                    </button>
                  </form>
                </div>
              )}
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                  <thead style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <tr>
                      <th style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '13px' }}>Order</th>
                      <th style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '13px' }}>Title</th>
                      <th style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '13px' }}>Stack</th>
                      <th style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '13px' }}>Links</th>
                      <th style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '13px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map(p => (
                      <tr key={p._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '16px', fontSize: '14px' }}>{p.order}</td>
                        <td style={{ padding: '16px', fontSize: '14px', fontWeight: '500' }}>{p.title}</td>
                        <td style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                          {p.stack.slice(0, 3).join(', ')}{p.stack.length > 3 ? '...' : ''}
                        </td>
                        <td style={{ padding: '16px', fontSize: '13px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <a href={p.liveUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--accent3)', textDecoration: 'none' }}>Live</a>
                            <a href={p.githubUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--text)', textDecoration: 'none' }}>GitHub</a>
                          </div>
                        </td>
                        <td style={{ padding: '16px', fontSize: '13px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button 
                              onClick={() => startEditing(p)} 
                              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', padding: '4px 12px', color: 'var(--text)', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => deleteProject(p._id)} 
                              style={{ background: 'transparent', border: '1px solid rgba(255,80,80,0.4)', padding: '4px 12px', color: '#ff5050', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              ✕
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Admin;
