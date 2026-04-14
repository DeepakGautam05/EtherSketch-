import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { INITIAL_PROJECTS } from '../data/projects';
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
    <div className={`proj-card${listView ? ' list-view' : ''}`} onClick={() => onOpen(project.id)}>
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
                <button onClick={e => e.stopPropagation()}>🔗 Share</button>
                <button onClick={e => e.stopPropagation()}>📦 Archive</button>
                <button className="danger" onClick={e => { e.stopPropagation(); setMenuOpen(false); onDelete(project.id); }}>🗑️ Delete</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Detail View ── */
function DetailView({ project, onBack, onDelete, onRename, showToast }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [titleEditing, setTitleEditing] = useState(false);
  const [title, setTitle] = useState(project.name);
  const [desc, setDesc] = useState(project.description);
  const [descEditing, setDescEditing] = useState(false);
  const [renameVal, setRenameVal] = useState(project.name);

  const handleTitleBlur = () => {
    setTitleEditing(false);
    if (title.trim() && title !== project.name) { onRename(project.id, title.trim()); showToast('✓','Title saved'); }
  };

  const tabs = ['overview','files','activity','settings'];

  return (
    <div className="detail-view">
      <div className="detail-header">
        <div>
          <button className="detail-back" onClick={onBack}>← My Projects</button>
          <div className="detail-title-row">
            {titleEditing
              ? <input className="detail-name-input" autoFocus value={title} onChange={e => setTitle(e.target.value)} onBlur={handleTitleBlur} onKeyDown={e => e.key==='Enter' && handleTitleBlur()} />
              : <div className="detail-name" onClick={() => setTitleEditing(true)}>{title}</div>
            }
          </div>
          <div className="detail-autosave">✓ Auto-saved 2 mins ago</div>
        </div>
        <div className="detail-actions">
          <button className="db-btn-sm">🔗 Share</button>
          <button className="db-btn-sm">📤 Export</button>
          <button className="db-btn-sm">⊕ Duplicate</button>
          <button className="db-btn-sm db-btn-primary">✏️ Open Editor</button>
        </div>
      </div>

      <div className="detail-banner" style={{ background: project.gradient }}>
        <svg viewBox="0 0 500 160" style={{ width:'100%',height:'100%',opacity:.3 }}>
          <circle cx="100" cy="80" r="60" fill="rgba(255,255,255,.08)" />
          <circle cx="400" cy="80" r="80" fill="rgba(255,255,255,.05)" />
          <rect x="200" y="30" width="120" height="80" rx="10" fill="rgba(255,255,255,.06)" />
        </svg>
      </div>

      <div className="detail-tabs">
        {tabs.map(t => (
          <div key={t} className={`dtab${activeTab===t?' active':''}`} onClick={() => setActiveTab(t)}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
          </div>
        ))}
      </div>

      {/* OVERVIEW */}
      {activeTab==='overview' && (
        <div className="tab-content">
          <div className="meta-grid">
            <div className="meta-item"><div className="meta-label">Created</div><div className="meta-val">Jan 15, 2025</div></div>
            <div className="meta-item"><div className="meta-label">Owner</div><div className="meta-val">Deepak Gautam</div></div>
            <div className="meta-item">
              <div className="meta-label">Collaborators</div>
              <div className="meta-val">
                <div className="collab-avatars">
                  {project.collaborators.map((c,i) => (
                    <div key={i} className="collab-av" style={{ background: project.collabColors[i] }}>{c}</div>
                  ))}
                </div>
              </div>
            </div>
            <div className="meta-item"><div className="meta-label">Files</div><div className="meta-val">{project.files} files</div></div>
            <div className="meta-item"><div className="meta-label">Version</div><div className="meta-val">{project.version}</div></div>
            <div className="meta-item"><div className="meta-label">Status</div><div className="meta-val" style={{color:'var(--success)'}}>● Active</div></div>
          </div>
          <div className="desc-area">
            {descEditing
              ? <textarea autoFocus value={desc} onChange={e => setDesc(e.target.value)} onBlur={() => { setDescEditing(false); showToast('✓','Description saved'); }} />
              : <p>{desc}</p>
            }
            <span className="edit-pencil" onClick={() => setDescEditing(v => !v)}>✏️</span>
          </div>
        </div>
      )}

      {/* FILES */}
      {activeTab==='files' && (
        <div className="tab-content">
          {[
            {icon:'🎨',name:'main-artboard.es',size:'1.2 MB · 2h ago'},
            {icon:'🖼️',name:'logo-variants.png',size:'840 KB · 1d ago'},
            {icon:'📄',name:'brand-guidelines.pdf',size:'2.1 MB · 3d ago'},
            {icon:'📊',name:'color-tokens.json',size:'12 KB · 1w ago'},
          ].map((f,i) => (
            <div key={i} className="file-row">
              <div className="file-icon">{f.icon}</div>
              <div className="file-info"><div className="file-name">{f.name}</div><div className="file-size">{f.size}</div></div>
              <span style={{cursor:'pointer',color:'var(--muted)'}}>⬇</span>
            </div>
          ))}
          <button className="db-btn-sm" style={{marginTop:'1rem'}}>📎 Upload File</button>
        </div>
      )}

      {/* ACTIVITY */}
      {activeTab==='activity' && (
        <div className="tab-content">
          {[
            {av:'DG',color:'#6366f1',text:<><strong>Deepak</strong> edited the main artboard</>,time:'2 hours ago'},
            {av:'AK',color:'#22d3ee',text:<><strong>Arjun</strong> added a comment on logo-variants</>,time:'5 hours ago'},
            {av:'SM',color:'#f472b6',text:<><strong>Sia</strong> exported brand-guidelines.pdf</>,time:'1 day ago'},
            {av:'DG',color:'#6366f1',text:<><strong>Deepak</strong> created version {project.version}</>,time:'2 days ago'},
            {av:'NK',color:'#34d399',text:<><strong>Neel</strong> joined the project</>,time:'1 week ago'},
          ].map((a,i) => (
            <div key={i} className="activity-item">
              <div className="act-av" style={{background:a.color}}>{a.av}</div>
              <div><div className="act-text">{a.text}</div><div className="act-time">{a.time}</div></div>
            </div>
          ))}
        </div>
      )}

      {/* SETTINGS */}
      {activeTab==='settings' && (
        <div className="tab-content">
          <div className="settings-group">
            <h4>Rename Project</h4>
            <input value={renameVal} onChange={e => setRenameVal(e.target.value)} placeholder="Project name..." />
            <button className="db-btn-sm db-btn-primary" onClick={() => { onRename(project.id, renameVal); setTitle(renameVal); showToast('✓','Project renamed'); }}>Save Name</button>
          </div>
          <div className="settings-group danger-zone">
            <h4>Danger Zone</h4>
            <button className="btn-danger">📦 Archive Project</button>
            <button className="btn-danger" onClick={() => { onDelete(project.id); onBack(); }}>🗑️ Delete Project</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════
   MAIN DASHBOARD
══════════════════════════════ */
export default function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [search, setSearch] = useState('');
  const [view, setView] = useState('grid');
  const [activeNav, setActiveNav] = useState('projects');
  const [showModal, setShowModal] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [detailId, setDetailId] = useState(null);
  const [toast, setToast] = useState({ show:false, msg:'', icon:'✓' });

  const showToast = (icon, msg) => {
    setToast({ show:true, icon, msg });
    setTimeout(() => setToast(t => ({ ...t, show:false })), 2800);
  };

  const filtered = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const detailProject = projects.find(p => p.id === detailId);

  const handleCreate = name => {
    const grads = ['linear-gradient(135deg,#1a1a3e,#2d1b69,#4c1d95)','linear-gradient(135deg,#0c2a3a,#0e4460,#155e75)','linear-gradient(135deg,#172554,#1e3a8a,#1d4ed8)'];
    const tags = [
      {tag:'Design',tagColor:'#6366f1',tagBg:'rgba(99,102,241,.12)'},
      {tag:'Wireframe',tagColor:'#22d3ee',tagBg:'rgba(34,211,238,.1)'},
      {tag:'Branding',tagColor:'#f472b6',tagBg:'rgba(244,114,182,.12)'},
    ];
    const t = tags[Math.floor(Math.random()*tags.length)];
    setProjects(p => [{id:Date.now(),name,gradient:grads[Math.floor(Math.random()*grads.length)],date:'just now',...t,description:'A new project.',version:'v1',files:0,collaborators:['DG'],collabColors:['#6366f1']},...p]);
    setShowModal(false);
    showToast('✓','Project created');
  };

  const handleDelete = id => { setProjects(p => p.filter(x => x.id !== id)); showToast('🗑️','Project deleted'); };
  const handleDuplicate = id => {
    const p = projects.find(x => x.id === id);
    if (p) { setProjects(prev => [{...p,id:Date.now(),name:p.name+' (Copy)',date:'just now'},...prev]); showToast('⊕','Duplicated'); }
  };
  const handleRename = (id, name) => { setProjects(p => p.map(x => x.id===id ? {...x,name} : x)); };

  const navItems = [
    { section:'Workspace', items:[
      {id:'dashboard',icon:'⊞',label:'Dashboard'},
      {id:'projects',icon:'📁',label:'My Projects',badge:projects.length},
      {id:'shared',icon:'👥',label:'Shared with Me'},
      {id:'recent',icon:'🕐',label:'Recent'},
    ]},
    { section:'Tools', items:[
      {id:'templates',icon:'🎨',label:'Templates'},
      {id:'assets',icon:'🗂️',label:'Assets'},
      {id:'trash',icon:'🗑️',label:'Trash'},
    ]},
    { section:'Account', items:[
      {id:'settings',icon:'⚙️',label:'Settings'},
      {id:'help',icon:'💬',label:'Help'},
    ]},
  ];

  const breadcrumb = { dashboard:'Dashboard', projects:'My Projects', shared:'Shared with Me', recent:'Recent', templates:'Templates', assets:'Assets', trash:'Trash', settings:'Settings', help:'Help' };

  return (
    <div className="db-layout">
      {/* SIDEBAR */}
      <aside className="db-sidebar">
        <div className="sb-logo" onClick={() => navigate('/')} style={{cursor:'pointer'}}>
          <span className="logo-dot" /><span>EtherSketch</span>
        </div>
        <div className="sb-user">
          <div className="sb-avatar">DG</div>
          <div className="sb-user-info">
            <div className="sb-user-name">Deepak Gautam</div>
            <div className="sb-user-role">Student Developer</div>
          </div>
        </div>
        {navItems.map(group => (
          <div key={group.section}>
            <div className="sb-section">{group.section}</div>
            {group.items.map(item => (
              <div key={item.id} className={`sb-item${activeNav===item.id?' active':''}`} onClick={() => { setActiveNav(item.id); setDetailId(null); }}>
                <span className="sb-icon">{item.icon}</span> {item.label}
                {item.badge != null && <span className="sb-badge">{item.badge}</span>}
              </div>
            ))}
          </div>
        ))}
        <div className="sb-storage">
          <div className="storage-label"><span>Storage</span><span>2.4 GB / 5 GB</span></div>
          <div className="storage-bar"><div className="storage-fill" /></div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="db-main">
        {/* TOPBAR */}
        <div className="db-topbar">
          <div className="breadcrumb">Workspace › <span>{breadcrumb[activeNav] || 'Projects'}</span></div>
          <div className="topbar-search">
            <input type="text" placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="topbar-actions">
            <div className="icon-btn" onClick={() => setNotifOpen(v => !v)}>
              🔔<span className="notif-badge">3</span>
            </div>
            <div className="view-toggle">
              <button className={`view-btn${view==='grid'?' active':''}`} onClick={() => setView('grid')}>⊞</button>
              <button className={`view-btn${view==='list'?' active':''}`} onClick={() => setView('list')}>☰</button>
            </div>
            <button className="btn-new" onClick={() => setShowModal(true)}>＋ New Project</button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="db-content">
          {detailProject ? (
            <DetailView
              project={detailProject}
              onBack={() => setDetailId(null)}
              onDelete={id => { handleDelete(id); setDetailId(null); }}
              onRename={handleRename}
              showToast={showToast}
            />
          ) : (
            <>
              <div className="filter-bar">
                <div className="filter-tabs">
                  {['All','Recent','Shared','Archived'].map(tab => (
                    <button key={tab} className={`filter-tab${tab==='All'?' active':''}`}
                      onClick={e => { document.querySelectorAll('.filter-tab').forEach(t=>t.classList.remove('active')); e.target.classList.add('active'); }}>
                      {tab}
                    </button>
                  ))}
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
                        onOpen={id => setDetailId(id)}
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

      {/* NOTIF PANEL */}
      {notifOpen && (
        <div className="notif-panel">
          <div className="notif-header"><span>Notifications</span><span style={{cursor:'pointer',color:'var(--muted)'}} onClick={() => setNotifOpen(false)}>✕</span></div>
          <div className="notif-item"><div className="notif-dot" /><div className="notif-text"><strong>Arjun</strong> commented on Brand Identity Kit · 2h ago</div></div>
          <div className="notif-item"><div className="notif-dot" /><div className="notif-text"><strong>Sia</strong> shared "UX Flow Diagram" with you · 5h ago</div></div>
          <div className="notif-item"><div className="notif-dot" style={{background:'var(--accent)'}} /><div className="notif-text">Your export is ready to download · 1d ago</div></div>
        </div>
      )}

      <Modal show={showModal} onClose={() => setShowModal(false)} onCreate={handleCreate} />
      <Toast show={toast.show} msg={toast.msg} icon={toast.icon} />
    </div>
  );
}
