import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { INITIAL_PROJECTS } from '../data/projects';
import { createRoom } from '../utils/api';
import '../styles/dashboard.css';

/* ── Toast ── */
function Toast({ msg, icon, show }) {
  return (
    <div className={`db-toast${show ? ' show' : ''}`}>
      <span>{icon}</span> {msg}
    </div>
  );
}

/* ── Confirm Modal ── */
function Modal({ show, onClose, onCreate }) {
  const [name, setName] = useState('');
  if (!show) return null;
  const handleCreate = () => { if (name.trim()) { onCreate(name.trim()); setName(''); } };
  return (
    <div className="db-modal-overlay" onClick={onClose}>
      <div className="db-modal-box" onClick={e => e.stopPropagation()}>
        <h3>New Project</h3>
        <p>Give your project a name to get started.</p>
        <input
          autoFocus value={name} onChange={e => setName(e.target.value)}
          placeholder="e.g. Mobile App Redesign" maxLength={40}
          onKeyDown={e => e.key === 'Enter' && handleCreate()}
        />
        <div className="modal-btns">
          <button className="db-btn-sm" onClick={onClose}>Cancel</button>
          <button className="db-btn-sm db-btn-primary" onClick={handleCreate}>Create Project</button>
        </div>
      </div>
    </div>
  );
}

/* ── Project Card ── */
function ProjectCard({ project, onOpen, onDelete, onDuplicate, onRename, listView }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    const handler = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleRename = e => {
    e.stopPropagation();
    setMenuOpen(false);
    const name = prompt('Enter new project name:');
    if (name?.trim()) onRename(project.id, name.trim());
  };

  return (
    <div 
      className={`proj-card${listView ? ' list-view' : ''}`} 
      onClick={() => onOpen(project.roomId)}
      style={{ zIndex: menuOpen ? 50 : 1, position: 'relative' }}
    >
      <div className="proj-thumb">
        <div className="proj-thumb-inner" style={{ background: project.gradient }}>
          <svg viewBox="0 0 200 130" style={{ position:'absolute',inset:0,width:'100%',height:'100%',opacity:.4 }}>
            <circle cx="40" cy="40" r="30" fill="rgba(255,255,255,.06)" />
            <circle cx="160" cy="90" r="45" fill="rgba(255,255,255,.04)" />
            <rect x="80" y="20" width="60" height="40" rx="6" fill="rgba(255,255,255,.05)" />
            <line x1="40" y1="40" x2="110" y2="40" stroke="rgba(255,255,255,.15)" strokeWidth="1" />
            <line x1="110" y1="40" x2="160" y2="90" stroke="rgba(255,255,255,.1)" strokeWidth="1" />
          </svg>
        </div>
      </div>
      <div className="proj-body">
        <span className="proj-tag" style={{ color: project.tagColor, background: project.tagBg }}>{project.tag}</span>
        <div className="proj-name">{project.name}</div>
        <div className="proj-meta">
          <span className="proj-date">✏️ {project.date}</span>
          <div className="proj-dots" ref={menuRef}>
            <button className="dots-btn" onClick={e => { e.stopPropagation(); setMenuOpen(v => !v); }}>···</button>
            {menuOpen && (
              <div className="dots-menu">
                <button onClick={handleRename}>✏️ Rename</button>
                <button onClick={e => { e.stopPropagation(); setMenuOpen(false); onDuplicate(project.id); }}>⊕ Duplicate</button>
                <button className="danger" onClick={e => { e.stopPropagation(); setMenuOpen(false); onDelete(project.id); }}>🗑️ Delete</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════
   MAIN DASHBOARD
══════════════════════════════ */
export default function Dashboard() {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('myProjects');
    if (saved) return JSON.parse(saved);
    return INITIAL_PROJECTS.map(p => ({ ...p, roomId: 'demo-room' }));
  });

  useEffect(() => {
    localStorage.setItem('myProjects', JSON.stringify(projects));
  }, [projects]);
  
  const [search, setSearch] = useState('');
  const [view, setView] = useState('grid');
  const [activeNav, setActiveNav] = useState('projects');
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState({ show:false, msg:'', icon:'✓' });

  const showToast = (icon, msg) => {
    setToast({ show:true, icon, msg });
    setTimeout(() => setToast(t => ({ ...t, show:false })), 2800);
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/auth');
  };

  const filtered = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = async name => {
    try {
      const room = await createRoom(userInfo?.token);
      const grads = ['linear-gradient(135deg,#1a1a3e,#2d1b69,#4c1d95)','linear-gradient(135deg,#0c2a3a,#0e4460,#155e75)','linear-gradient(135deg,#172554,#1e3a8a,#1d4ed8)'];
      const tags = [
        {tag:'Design',tagColor:'#6366f1',tagBg:'rgba(99,102,241,.12)'},
        {tag:'Wireframe',tagColor:'#22d3ee',tagBg:'rgba(34,211,238,.1)'},
        {tag:'Branding',tagColor:'#f472b6',tagBg:'rgba(244,114,182,.12)'},
      ];
      const t = tags[Math.floor(Math.random()*tags.length)];
      setProjects(p => [{id:Date.now(),roomId:room.roomId,name,gradient:grads[Math.floor(Math.random()*grads.length)],date:'just now',...t,description:'A new project.',version:'v1',files:0,collaborators:['DG'],collabColors:['#6366f1']},...p]);
      setShowModal(false);
      showToast('✓','Project created');
      navigate(`/room/${room.roomId}`);
    } catch(err) {
      showToast('x', 'Failed to create room');
    }
  };

  const handleDelete = id => { setProjects(p => p.filter(x => x.id !== id)); showToast('🗑️','Project deleted'); };
  const handleDuplicate = id => {
    const p = projects.find(x => x.id === id);
    if (p) { setProjects(prev => [{...p,id:Date.now(),name:p.name+' (Copy)',date:'just now'},...prev]); showToast('⊕','Duplicated'); }
  };
  const handleRename = (id, name) => { setProjects(p => p.map(x => x.id===id ? {...x,name} : x)); };

  const navItems = [
    { section:'Workspace', items:[
      {id:'projects',icon:'📁',label:'My Projects',badge:projects.length},
    ]},
    { section:'Account', items:[
      {id:'settings',icon:'⚙️',label:'Settings'},
    ]},
  ];

  const breadcrumb = { projects:'My Projects', settings:'Settings' };

  return (
    <div className="db-layout">
      {/* SIDEBAR */}
      <aside className="db-sidebar">
        <div className="sb-logo" onClick={() => navigate('/')} style={{cursor:'pointer'}}>
          <span className="logo-dot" /><span>EtherSketch</span>
        </div>
        <div className="sb-user">
          <div className="sb-avatar">{(userInfo?.name || 'DG').charAt(0).toUpperCase()}</div>
          <div className="sb-user-info">
            <div className="sb-user-name">{userInfo?.name || 'User'}</div>
            <div className="sb-user-role">Creator</div>
          </div>
        </div>
        {navItems.map(group => (
           <div key={group.section}>
             <div className="sb-section">{group.section}</div>
             {group.items.map(item => (
               <div key={item.id} className={`sb-item${activeNav===item.id?' active':''}`} onClick={() => setActiveNav(item.id)}>
                 <span className="sb-icon">{item.icon}</span> {item.label}
                 {item.badge != null && <span className="sb-badge">{item.badge}</span>}
               </div>
             ))}
           </div>
        ))}
      </aside>

      {/* MAIN */}
      <div className="db-main">
        {/* TOPBAR */}
        <div className="db-topbar">
          <div className="breadcrumb">Workspace › <span>{breadcrumb[activeNav] || 'Projects'}</span></div>
          {activeNav === 'projects' && (
            <div className="topbar-search">
              <input type="text" placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          )}
          <div className="topbar-actions">
            {activeNav === 'projects' && (
              <div className="view-toggle">
                <button className={`view-btn${view==='grid'?' active':''}`} onClick={() => setView('grid')}>⊞</button>
                <button className={`view-btn${view==='list'?' active':''}`} onClick={() => setView('list')}>☰</button>
              </div>
            )}
            <button className="btn-new" onClick={() => {
              const joinId = prompt("Enter Room ID to join directly (or cancel to create new):");
              if (joinId && joinId.trim()) {
                 navigate(`/room/${joinId.trim()}`);
              } else {
                 setShowModal(true);
              }
            }}>＋ New Project / Join</button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="db-content">
          {activeNav === 'settings' ? (
             <div className="max-w-2xl text-left bg-[#1a1a2e] p-8 rounded-2xl border border-white/10 m-8">
               <h2 className="text-2xl font-bold mb-6 text-white">Settings</h2>
               <div className="mb-8">
                 <p className="text-gray-400 mb-4">Manage your account and active session securely.</p>
                 <button className="px-6 py-2 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition font-medium" onClick={handleLogout}>Log Out</button>
               </div>
             </div>
          ) : (
            <>
              <div className="filter-bar">
                <div className="filter-tabs">
                  <button className="filter-tab active">All Projects</button>
                </div>
                <select className="sort-select" onChange={e => {
                  const v = e.target.value;
                  if (v==='Name A–Z') setProjects(p=>[...p].sort((a,b)=>a.name.localeCompare(b.name)));
                  else if (v==='Name Z–A') setProjects(p=>[...p].sort((a,b)=>b.name.localeCompare(a.name)));
                }}>
                  <option>Last Modified</option>
                  <option>Name A–Z</option>
                  <option>Name Z–A</option>
                </select>
                <span className="project-count">{filtered.length} project{filtered.length!==1?'s':''}</span>
              </div>

              {filtered.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-art">📭</div>
                  <p>No projects match your search.</p>
                </div>
              ) : (
                <div className={`projects-grid${view==='list'?' list-view':''}`}>
                  {filtered.map((p,i) => (
                    <div key={p.id} style={{animationDelay:`${i*0.05}s`}}>
                      <ProjectCard
                        project={p} listView={view==='list'}
                        onOpen={roomId => navigate(`/room/${roomId || 'demo-room'}`)}
                        onDelete={id => { handleDelete(id); showToast('🗑️','Deleted'); }}
                        onDuplicate={id => { handleDuplicate(id); }}
                        onRename={(id,name) => { handleRename(id,name); showToast('✓','Renamed'); }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Modal show={showModal} onClose={() => setShowModal(false)} onCreate={handleCreate} />
      <Toast show={toast.show} msg={toast.msg} icon={toast.icon} />
    </div>
  );
}
