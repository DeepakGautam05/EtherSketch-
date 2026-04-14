import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/landing.css';

/* ---------- tiny hook: fade-up on scroll ---------- */
function useFadeUp() {
  useEffect(() => {
    const els = document.querySelectorAll('.fade-up');
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.1 }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* ---------- stat counter ---------- */
function useStatCounter() {
  useEffect(() => {
    const band = document.querySelector('.stats-band');
    if (!band) return;
    const io = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      document.querySelectorAll('[data-target]').forEach(el => {
        const target = +el.dataset.target;
        let cur = 0;
        const step = Math.ceil(target / 80);
        const t = setInterval(() => {
          cur = Math.min(cur + step, target);
          if (target >= 1000000) el.textContent = (cur / 1000000).toFixed(1) + 'M+';
          else if (target >= 1000) el.textContent = (cur / 1000).toFixed(0) + 'K+';
          else if (target === 999) el.textContent = '99.9';
          else el.textContent = '<' + cur;
          if (cur >= target) clearInterval(t);
        }, 16);
        el.removeAttribute('data-target');
      });
      io.disconnect();
    }, { threshold: 0.5 });
    io.observe(band);
    return () => io.disconnect();
  }, []);
}

export default function LandingPage() {
  const navigate = useNavigate();
  useFadeUp();
  useStatCounter();

  return (
    <>
      {/* NAVBAR */}
      <nav className="lp-nav">
        <a href="/" className="lp-logo">
          <span className="logo-dot" />
          EtherSketch
        </a>
        <ul className="lp-nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#pricing">Pricing</a></li>
          <li><a href="#how">How It Works</a></li>
          <li><a href="#testimonials">Reviews</a></li>
        </ul>
        <div className="lp-nav-actions">
          <button className="btn-ghost" onClick={() => navigate('/auth')}>Login</button>
          <button className="btn-primary" onClick={() => navigate('/auth')}>Get Started Free</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="lp-hero">
        <div className="hero-mesh">
          <div className="mesh-orb orb1" /><div className="mesh-orb orb2" /><div className="mesh-orb orb3" />
        </div>
        <div className="hero-inner">
          <div className="hero-text fade-up">
            <div className="hero-badge"><span className="badge-dot" /> Now in Public Beta · v1.0</div>
            <h1>Sketch Together.<br /><span>Ship Faster.</span></h1>
            <p>EtherSketch is the real-time collaborative workspace built for modern teams. Design, ideate, and ship — all in one place, from anywhere.</p>
            <div className="hero-btns">
              <button className="btn-primary btn-large" onClick={() => navigate('/auth')}>Start for Free →</button>
              <button className="btn-outline btn-large">▶ Watch Demo</button>
            </div>
          </div>
          <div className="hero-visual fade-up delay-2">
            <div className="mockup">
              <div className="mockup-bar">
                <span className="dot dot-r" /><span className="dot dot-y" /><span className="dot dot-g" />
                <span className="mockup-url">ethersketch.app/workspace/brand-kit</span>
              </div>
              <div className="mockup-canvas">
                <div className="canvas-grid" />
                <div className="node node-1" /><div className="node node-2" /><div className="node node-3" />
                <div className="node node-4" /><div className="node node-5" />
                <div className="canvas-line l1" /><div className="canvas-line l2" /><div className="canvas-line l3" />
                <div className="cursor-demo"><span className="cursor-label">Deepak</span></div>
                <div className="toolbar">
                  {['✏️','⬡','T','⟲','🔗'].map((t,i) => (
                    <div key={i} className={`tool-btn${i===0?' active':''}`}>{t}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee-section">
        <p className="marquee-label">Trusted by teams at</p>
        <div className="marquee-track">
          {['Nexaflow','·','Orbitex','·','Luminary Labs','·','Stackr','·','DeepCore','·','Arcwave','·','Vextron','·','Solaris HQ','·',
            'Nexaflow','·','Orbitex','·','Luminary Labs','·','Stackr','·','DeepCore','·','Arcwave','·'].map((item, i) => (
            <span key={i} className="marquee-item">{item}</span>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section id="features" className="lp-section">
        <div className="section-head fade-up">
          <div className="section-label">Why EtherSketch</div>
          <h2 className="section-title">Everything your team needs</h2>
          <p className="section-sub">A complete toolkit designed for designers, developers, and product teams who refuse to slow down.</p>
        </div>
        <div className="features-grid">
          {[
            { icon:'⚡', title:'Real-Time Sync', desc:'Sub-50ms synchronization powered by CRDTs. Every change is reflected instantly — no conflicts, no chaos.' },
            { icon:'🔌', title:'Offline-First', desc:'Keep working without a connection. EtherSketch persists locally and syncs the moment you\'re back online.' },
            { icon:'🕰️', title:'Version History', desc:'Every state is saved. Branch, revert, or compare — your entire creative history is always at your fingertips.' },
            { icon:'🖱️', title:'Multiplayer Cursors', desc:'See your teammates in action in real-time. Named cursors and presence indicators make collaboration tangible.' },
            { icon:'🎨', title:'Smart Templates', desc:'Jump-start any project with professionally crafted templates for wireframes, flows, and design systems.' },
            { icon:'📦', title:'One-Click Export', desc:'Export to PNG, SVG, PDF, or JSON. Share anywhere. Deploy anytime. Your work, your format.' },
          ].map((f, i) => (
            <div key={i} className={`feat-card fade-up delay-${(i%3)+1}`}>
              <span className="feat-icon">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="lp-section lp-section-tinted">
        <div className="section-head fade-up">
          <div className="section-label">How It Works</div>
          <h2 className="section-title">Up and running in minutes</h2>
        </div>
        <div className="steps-grid">
          {[
            { n:'01', title:'Create Your Workspace', desc:'Sign up in seconds. Create a workspace, invite your team, and set up your first project board.' },
            { n:'02', title:'Design Together', desc:'Drop into the canvas. Draw, annotate, and iterate in real-time alongside your teammates — anywhere in the world.' },
            { n:'03', title:'Ship With Confidence', desc:'Export your work, share links, or connect to your dev pipeline. From idea to production — seamlessly.' },
          ].map((s,i) => (
            <div key={i} className={`step fade-up delay-${i+1}`}>
              <div className="step-num">{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <div className="stats-band fade-up">
        <div className="stats-grid">
          <div><div className="stat-num" data-target="50000">0</div><div className="stat-label">Active Users</div></div>
          <div><div className="stat-num" data-target="1000000">0</div><div className="stat-label">Projects Created</div></div>
          <div><div className="stat-num" data-target="999">0</div><div className="stat-label">% Uptime</div></div>
          <div><div className="stat-num" data-target="50">0</div><div className="stat-label">ms Avg Sync Latency</div></div>
        </div>
      </div>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="lp-section">
        <div className="section-head fade-up">
          <div className="section-label">Testimonials</div>
          <h2 className="section-title">Loved by creators worldwide</h2>
        </div>
        <div className="testi-track fade-up">
          {[
            { init:'AK', grad:'linear-gradient(135deg,#6366f1,#8b5cf6)', name:'Arjun Kapoor', role:'Lead Designer · Nexaflow', quote:'EtherSketch completely replaced our Figma + Miro combo. The real-time sync is insanely fast and the offline mode saved us during a client demo.' },
            { init:'SM', grad:'linear-gradient(135deg,#22d3ee,#0891b2)', name:'Sia Mehta', role:'Product Manager · Orbitex', quote:'Nothing comes close to the smoothness of EtherSketch. The CRDT sync is a game-changer for distributed teams.' },
            { init:'RV', grad:'linear-gradient(135deg,#f472b6,#ec4899)', name:'Riya Verma', role:'UX Engineer · Luminary Labs', quote:'The version history alone is worth it. We reverted a bad design decision from 3 weeks ago in two clicks. Absolutely brilliant engineering.' },
            { init:'NK', grad:'linear-gradient(135deg,#34d399,#059669)', name:'Neel Kumar', role:'Founder · Stackr', quote:'Our entire design system lives in EtherSketch now. Smart templates + one-click export made our handoff process 10x faster.' },
          ].map((t,i) => (
            <div key={i} className="testi-card">
              <div className="testi-avatar" style={{ background: t.grad }}>{t.init}</div>
              <div className="stars">★★★★★</div>
              <p className="testi-quote">"{t.quote}"</p>
              <div className="testi-name">{t.name}</div>
              <div className="testi-role">{t.role}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="lp-section">
        <div className="section-head fade-up">
          <div className="section-label">Pricing</div>
          <h2 className="section-title">Simple, honest pricing</h2>
          <p className="section-sub">Start free. Scale as you grow. No hidden fees, no surprises.</p>
        </div>
        <div className="pricing-grid fade-up">
          {[
            { tier:'Free', price:'$0', period:'forever', popular:false, features:['Up to 3 projects','2 collaborators','Basic templates','PNG export','7-day history'], cta:'Get Started', onClick: () => navigate('/auth') },
            { tier:'Pro', price:'$12', period:'per month', popular:true, features:['Unlimited projects','10 collaborators','All templates','All export formats','Unlimited history'], cta:'Start Pro Trial', onClick: () => navigate('/auth') },
            { tier:'Team', price:'$29', period:'per month', popular:false, features:['Everything in Pro','Unlimited members','Admin controls','SSO & audit logs','Priority support'], cta:'Contact Sales', onClick: () => {} },
          ].map((p,i) => (
            <div key={i} className={`price-card${p.popular?' popular':''}`}>
              {p.popular && <div className="popular-badge">Most Popular</div>}
              <div className="price-tier">{p.tier}</div>
              <div className="price-amount">{p.price}</div>
              <div className="price-period">{p.period}</div>
              <ul className="price-features">{p.features.map((f,j) => <li key={j}>{f}</li>)}</ul>
              <button className={`btn-price${p.popular?' btn-price-filled':' btn-price-outline'}`} onClick={p.onClick}>{p.cta}</button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <div className="cta-banner fade-up">
        <h2>Ready to Build Together?</h2>
        <p>Join 50,000+ designers and developers already using EtherSketch.</p>
        <button className="btn-primary btn-large" onClick={() => navigate('/auth')}>Get Started Free — It's Free Forever →</button>
      </div>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="lp-logo" style={{ display:'inline-flex', marginBottom:'0.75rem' }}>
              <span className="logo-dot" style={{ marginRight:'8px' }} />EtherSketch
            </div>
            <p>The real-time collaborative workspace for teams who move fast and build things that matter.</p>
          </div>
          {[
            { heading:'Product', links:['Features','Pricing','Templates','Changelog'] },
            { heading:'Company', links:['About','Blog','Careers','Press'] },
            { heading:'Resources', links:['Docs','API','Status','Community'] },
            { heading:'Legal', links:['Privacy','Terms','Cookies','Security'] },
          ].map((col,i) => (
            <div key={i} className="footer-col">
              <h4>{col.heading}</h4>
              {col.links.map((l,j) => <a key={j} href="#">{l}</a>)}
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <p>© 2025 EtherSketch. Built with ♥ by Deepak Gautam.</p>
          <div className="social-icons">
            <a href="#">𝕏</a><a href="#">⌥</a><a href="#">in</a>
          </div>
        </div>
      </footer>
    </>
  );
}
