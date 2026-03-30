import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ── Scroll reveal hook ── */
const useScrollReveal = () => {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } }),
      { threshold: 0.1 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
};

/* ── Animated counter ── */
const Counter = ({ target, suffix = '', duration = 1800 }) => {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStarted(true); obs.disconnect(); } }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  useEffect(() => {
    if (!started) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.floor((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
};

/* ── Logo ── */
const Logo = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
    <circle cx="30" cy="30" r="28" fill="url(#lg1)" />
    <path d="M18 38h24M18 38l12-16 12 16" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="30" cy="18" r="4" fill="#fff" opacity="0.9" />
    <defs>
      <linearGradient id="lg1" x1="0" y1="0" x2="60" y2="60" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6366f1" /><stop offset="1" stopColor="#a855f7" />
      </linearGradient>
    </defs>
  </svg>
);

/* ══════════════════════════════════════
   NAV
══════════════════════════════════════ */
const Nav = ({ scrolled }) => {
  const [open, setOpen] = useState(false);
  const links = ['Features', 'How it Works', 'Skills', 'Testimonials'];
  return (
    <header style={{
      position: 'fixed', top: 0, insetInline: 0, zIndex: 50,
      background: scrolled ? 'rgba(5,8,20,0.92)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : 'none',
      transition: 'all 0.4s ease',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Logo size={36} />
          <div>
            <div style={{ fontWeight: 900, fontSize: 20, color: '#fff', letterSpacing: '-0.5px' }}>Zedify</div>
            <div style={{ fontSize: 9, color: '#818cf8', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Skill Exchange</div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 14, padding: '6px 8px' }} className="hidden-mobile">
          {links.map((l) => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g, '-')}`}
              style={{ padding: '7px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.55)', textDecoration: 'none', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.target.style.color = '#fff'; e.target.style.background = 'rgba(255,255,255,0.09)'; }}
              onMouseLeave={e => { e.target.style.color = 'rgba(255,255,255,0.55)'; e.target.style.background = 'transparent'; }}>{l}</a>
          ))}
        </nav>

        {/* Right CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }} className="hidden-mobile">
          <Link to="/login" style={{ padding: '8px 18px', borderRadius: 12, fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.7)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.7)'}>Sign In</Link>
          <Link to="/register" style={{ padding: '9px 22px', borderRadius: 12, fontSize: 13, fontWeight: 800, color: '#fff', textDecoration: 'none', background: 'linear-gradient(135deg,#6366f1,#a855f7)', boxShadow: '0 4px 20px rgba(99,102,241,0.4)', transition: 'transform 0.2s, box-shadow 0.2s' }}
            onMouseEnter={e => { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 8px 30px rgba(99,102,241,0.6)'; }}
            onMouseLeave={e => { e.target.style.transform = ''; e.target.style.boxShadow = '0 4px 20px rgba(99,102,241,0.4)'; }}>Get Started Free</Link>
        </div>

        {/* Mobile burger */}
        <button onClick={() => setOpen(!open)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 8 }} className="show-mobile">
          <svg width={22} height={22} fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
            {open ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                   : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>
      {open && (
        <div style={{ background: 'rgba(5,8,20,0.97)', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '16px 24px 20px' }}>
          {links.map((l) => <a key={l} href={`#${l.toLowerCase().replace(/ /g, '-')}`} onClick={() => setOpen(false)} style={{ display: 'block', padding: '12px 0', color: 'rgba(255,255,255,0.75)', fontSize: 15, fontWeight: 600, textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{l}</a>)}
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <Link to="/login" style={{ flex: 1, textAlign: 'center', padding: '11px 0', borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>Sign In</Link>
            <Link to="/register" style={{ flex: 1, textAlign: 'center', padding: '11px 0', borderRadius: 12, background: 'linear-gradient(135deg,#6366f1,#a855f7)', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>Get Started</Link>
          </div>
        </div>
      )}
    </header>
  );
};

/* ══════════════════════════════════════
   HERO
══════════════════════════════════════ */
const Hero = () => (
  <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: '#050814', paddingTop: 80 }}>
    {/* Mesh blobs */}
    <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
      <div style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle,rgba(99,102,241,0.25) 0%,transparent 70%)', top: '-15%', left: '-12%', filter: 'blur(60px)', animation: 'blobFloat 12s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle,rgba(168,85,247,0.2) 0%,transparent 70%)', top: '20%', right: '-10%', filter: 'blur(70px)', animation: 'blobFloat 10s ease-in-out infinite', animationDelay: '3s' }} />
      <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(6,182,212,0.15) 0%,transparent 70%)', bottom: '-10%', left: '30%', filter: 'blur(80px)', animation: 'blobFloat 14s ease-in-out infinite', animationDelay: '6s' }} />
    </div>

    {/* Grid overlay */}
    <div style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.04,
      backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)',
      backgroundSize: '50px 50px' }} />

    {/* Floating skill pills */}
    {[
      { label: '⚛️ React', color: '#61dafb', top: '18%', left: '5%', delay: '0s' },
      { label: '🎨 UI/UX', color: '#f472b6', top: '70%', left: '3%', delay: '1.8s' },
      { label: '🐍 Python', color: '#fbbf24', top: '22%', right: '5%', delay: '1s' },
      { label: '🧠 ML/AI', color: '#a78bfa', top: '65%', right: '3%', delay: '2.5s' },
    ].map((p, i) => (
      <div key={i} style={{
        position: 'absolute', top: p.top, left: p.left, right: p.right, zIndex: 2,
        background: 'rgba(255,255,255,0.05)', border: `1px solid ${p.color}40`,
        borderRadius: 14, padding: '10px 18px', fontSize: 13, fontWeight: 700, color: p.color,
        backdropFilter: 'blur(12px)', animation: `blobFloat 7s ease-in-out infinite`, animationDelay: p.delay,
        display: 'none', // hidden on small screens via class
        boxShadow: `0 0 20px ${p.color}20`,
      }} className="hero-pill">{p.label}</div>
    ))}

    {/* Hero content */}
    <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: 860, margin: '0 auto', padding: '0 24px' }}>
      {/* Badge */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 999, padding: '7px 18px', marginBottom: 36, fontSize: 13, fontWeight: 700, color: '#a5b4fc' }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', display: 'inline-block', boxShadow: '0 0 8px #4ade80', animation: 'pulse 2s infinite' }} />
        10,000+ students · 500+ colleges across India
      </div>

      {/* Headline */}
      <h1 style={{ fontSize: 'clamp(42px,8vw,96px)', fontWeight: 900, lineHeight: 1.0, letterSpacing: '-2px', marginBottom: 28, color: '#fff' }}>
        Learn More.<br />
        <span style={{ background: 'linear-gradient(135deg,#60a5fa,#818cf8,#c084fc,#f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Teach More.
        </span><br />
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>Pay Nothing.</span>
      </h1>

      {/* Subheadline */}
      <p style={{ fontSize: 'clamp(16px,2.5vw,22px)', color: 'rgba(255,255,255,0.65)', maxWidth: 600, margin: '0 auto 48px', lineHeight: 1.65, fontWeight: 500 }}>
        Zedify connects college students for peer-to-peer skill exchanges. Teach what you know, learn what you need — completely free.
      </p>

      {/* CTAs */}
      <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 56 }}>
        <Link to="/register" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '16px 40px', borderRadius: 16,
          background: 'linear-gradient(135deg,#4f46e5,#7c3aed,#a855f7)',
          boxShadow: '0 8px 40px rgba(99,102,241,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
          color: '#fff', fontWeight: 800, fontSize: 16, textDecoration: 'none', letterSpacing: '-0.2px',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 16px 50px rgba(99,102,241,0.65)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 8px 40px rgba(99,102,241,0.5), inset 0 1px 0 rgba(255,255,255,0.2)'; }}>
          Start for Free
          <svg width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
        </Link>
        <Link to="/login" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '16px 36px', borderRadius: 16,
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
          color: 'rgba(255,255,255,0.8)', fontWeight: 700, fontSize: 16, textDecoration: 'none',
          backdropFilter: 'blur(12px)', transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}>
          Sign In
        </Link>
      </div>

      {/* Social proof */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 500 }}>
        <div style={{ display: 'flex' }}>
          {[['A','#6366f1'],['P','#ec4899'],['R','#8b5cf6'],['K','#14b8a6'],['J','#10b981']].map(([l, c], i) => (
            <div key={i} style={{ width: 36, height: 36, borderRadius: '50%', background: c, border: '2px solid #050814', marginLeft: i === 0 ? 0 : -10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff' }}>{l}</div>
          ))}
        </div>
        <span>Join <strong style={{ color: '#fff' }}>10,000+</strong> students swapping skills</span>
      </div>
    </div>

    {/* Scroll indicator */}
    <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, animation: 'blobFloat 2.5s ease-in-out infinite' }}>
      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Scroll</span>
      <div style={{ width: 24, height: 40, border: '1.5px solid rgba(255,255,255,0.15)', borderRadius: 12, display: 'flex', justifyContent: 'center', paddingTop: 8 }}>
        <div style={{ width: 4, height: 8, background: 'rgba(255,255,255,0.4)', borderRadius: 2, animation: 'blobFloat 1.5s ease-in-out infinite' }} />
      </div>
    </div>
  </section>
);

/* ══════════════════════════════════════
   STATS
══════════════════════════════════════ */
const Stats = () => {
  const items = [
    { n: 10000, s: '+', label: 'Students Registered', color: '#818cf8' },
    { n: 500, s: '+', label: 'Colleges Connected', color: '#c084fc' },
    { n: 25000, s: '+', label: 'Skills Exchanged', color: '#67e8f9' },
    { n: 4.9, s: '★', label: 'Average Rating', color: '#fbbf24', raw: true },
  ];
  return (
    <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.015)', padding: '64px 24px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 32 }}>
        {items.map((item, i) => (
          <div key={i} className="reveal" style={{ textAlign: 'center', transitionDelay: `${i * 80}ms` }}>
            <div style={{ fontSize: 'clamp(36px,5vw,52px)', fontWeight: 900, color: item.color, filter: `drop-shadow(0 0 16px ${item.color}60)`, marginBottom: 6 }}>
              {item.raw ? <>{item.n}{item.s}</> : <Counter target={item.n} suffix={item.s} />}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', fontWeight: 600, letterSpacing: '0.03em' }}>{item.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

/* ══════════════════════════════════════
   FEATURES
══════════════════════════════════════ */
const FEATURES = [
  { icon: '🎯', title: 'Smart Matching', desc: 'AI-powered algorithm pairs you with the perfect campus partner based on your skill offer and needs.', accent: '#6366f1' },
  { icon: '📹', title: 'Live Video Sessions', desc: 'Host and join real-time video learning sessions directly inside Zedify — no third-party apps.', accent: '#8b5cf6' },
  { icon: '💬', title: 'Real-Time Chat', desc: 'Instant messaging with your exchange partners. Share resources and coordinate sessions seamlessly.', accent: '#a855f7' },
  { icon: '⭐', title: 'Reputation System', desc: 'Build a verified skill portfolio through exchanges. Ratings your peers actually trust.', accent: '#f59e0b' },
  { icon: '🌐', title: 'Campus Social Feed', desc: 'Post updates, follow peers, like & comment — a social network built for student learners.', accent: '#10b981' },
  { icon: '🔒', title: 'Student-Only Space', desc: 'Every user is a verified student. A trusted, safe environment for real campus connections.', accent: '#06b6d4' },
];

const FCard = ({ icon, title, desc, accent }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? `rgba(${hexToRgb(accent)},0.1)` : 'rgba(255,255,255,0.03)',
        border: `1px solid ${hovered ? accent + '50' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 20, padding: '28px 24px', height: '100%',
        transition: 'all 0.3s ease', transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hovered ? `0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px ${accent}30` : '0 4px 20px rgba(0,0,0,0.2)',
        cursor: 'default',
      }}>
      <div style={{ fontSize: 38, marginBottom: 16, filter: `drop-shadow(0 0 12px ${accent}60)` }}>{icon}</div>
      <h3 style={{ fontSize: 17, fontWeight: 800, color: '#fff', marginBottom: 10, letterSpacing: '-0.3px' }}>{title}</h3>
      <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, margin: 0 }}>{desc}</p>
      <div style={{ marginTop: 20, width: 32, height: 3, borderRadius: 2, background: `linear-gradient(90deg,${accent},transparent)` }} />
    </div>
  );
};

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

const Features = () => (
  <section id="features" style={{ padding: '100px 24px', position: 'relative', overflow: 'hidden' }}>
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div className="reveal" style={{ textAlign: 'center', marginBottom: 64 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 999, padding: '6px 16px', marginBottom: 20, fontSize: 12, fontWeight: 700, color: '#818cf8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Everything You Need
        </div>
        <h2 style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 900, color: '#fff', letterSpacing: '-1.5px', marginBottom: 16, lineHeight: 1.1 }}>
          One platform. <span style={{ background: 'linear-gradient(135deg,#818cf8,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Every skill.</span>
        </h2>
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.45)', maxWidth: 520, margin: '0 auto' }}>Everything you need to learn, teach, connect, and grow — without paying a rupee.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 18 }}>
        {FEATURES.map((f, i) => (
          <div key={f.title} className="reveal" style={{ transitionDelay: `${i * 60}ms` }}>
            <FCard {...f} />
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ══════════════════════════════════════
   HOW IT WORKS
══════════════════════════════════════ */
const Steps = () => {
  const steps = [
    { n: '01', title: 'Create Your Profile', desc: 'Sign up, list what you can teach, and add skills you want to learn. Takes under 2 minutes.', color: '#6366f1' },
    { n: '02', title: 'Get Matched', desc: 'Our algorithm finds the best campus match — someone who needs what you offer and offers what you need.', color: '#a855f7' },
    { n: '03', title: 'Start Learning', desc: 'Chat, schedule a live session, and exchange skills. Build your reputation with every exchange.', color: '#10b981' },
  ];
  return (
    <section id="how-it-works" style={{ padding: '100px 24px', background: 'rgba(255,255,255,0.01)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 999, padding: '6px 16px', marginBottom: 20, fontSize: 12, fontWeight: 700, color: '#6ee7b7', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            How It Works
          </div>
          <h2 style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 900, color: '#fff', letterSpacing: '-1.5px', marginBottom: 16, lineHeight: 1.1 }}>
            Up and running in <span style={{ color: '#34d399' }}>3 steps</span>
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.45)' }}>No fees, no barriers — just pure peer learning.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20, marginBottom: 48 }}>
          {steps.map((s, i) => (
            <div key={s.n} className="reveal" style={{ transitionDelay: `${i * 100}ms`, background: 'rgba(255,255,255,0.03)', border: `1px solid ${s.color}25`, borderRadius: 22, padding: '36px 28px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,transparent,${s.color},transparent)` }} />
              <div style={{ width: 56, height: 56, borderRadius: 16, background: `${s.color}15`, border: `1px solid ${s.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 20, fontWeight: 900, color: s.color }}>{s.n}</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 12 }}>{s.title}</h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, margin: 0 }}>{s.desc}</p>
            </div>
          ))}
        </div>
        {/* Perks list */}
        <div className="reveal" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 22, padding: '36px 32px' }}>
          <h3 style={{ textAlign: 'center', fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 28 }}>Why students ❤️ Zedify</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16 }}>
            {['Completely free — no subscriptions ever', 'Only verified college students', 'Built-in live video sessions', 'Build a real portfolio of skills taught', 'Community feed for your learning journey', 'Rate & review every exchange'].map((b) => (
              <div key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 22, height: 22, borderRadius: 8, background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  <svg width={12} height={12} fill="none" stroke="#818cf8" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                </div>
                <span style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{b}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ══════════════════════════════════════
   SKILLS
══════════════════════════════════════ */
const SKILLS = [
  ['React', '#61dafb'], ['UI/UX Design', '#f472b6'], ['Machine Learning', '#a78bfa'],
  ['Python', '#fbbf24'], ['Data Science', '#34d399'], ['Photography', '#fb923c'],
  ['Java', '#f97316'], ['Video Editing', '#e879f9'], ['Guitar', '#60a5fa'],
  ['Public Speaking', '#4ade80'], ['SQL', '#38bdf8'], ['Sketch Art', '#f9a8d4'],
  ['Node.js', '#86efac'], ['Content Writing', '#fde68a'], ['Flutter', '#67e8f9'],
  ['Figma', '#c4b5fd'], ['Deep Learning', '#818cf8'], ['Digital Marketing', '#fb7185'],
  ['C++', '#93c5fd'], ['English Speaking', '#6ee7b7'], ['Ethical Hacking', '#fca5a5'], ['Notion', '#d1d5db'],
];

const SkillsSection = () => (
  <section id="skills" style={{ padding: '100px 24px', overflow: 'hidden' }}>
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div className="reveal" style={{ textAlign: 'center', marginBottom: 52 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: 999, padding: '6px 16px', marginBottom: 20, fontSize: 12, fontWeight: 700, color: '#fde68a', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Skill Exchange
        </div>
        <h2 style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 900, color: '#fff', letterSpacing: '-1.5px', marginBottom: 14, lineHeight: 1.1 }}>
          Every skill has a <span style={{ color: '#fbbf24' }}>home here</span>
        </h2>
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.45)' }}>From code to creativity — whatever you know, someone wants to learn.</p>
      </div>
      <div className="reveal" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
        {SKILLS.map(([skill, color]) => (
          <div key={skill} style={{
            padding: '9px 20px', borderRadius: 999, fontSize: 13, fontWeight: 700,
            color, background: `${color}14`, border: `1px solid ${color}35`,
            cursor: 'default', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = `0 0 20px ${color}30`; e.currentTarget.style.background = `${color}25`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.background = `${color}14`; }}>
            {skill}
          </div>
        ))}
      </div>
      <p className="reveal" style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 13, marginTop: 32, fontWeight: 500 }}>
        And hundreds more — if it can be learned, it can be exchanged on Zedify.
      </p>
    </div>
  </section>
);

/* ══════════════════════════════════════
   TESTIMONIALS
══════════════════════════════════════ */
const TESTIMONIALS = [
  { name: 'Aarav Sharma', college: 'IIT Bombay · CSE', init: 'AS', color: '#6366f1', quote: 'I taught Python to 3 students and learned UI/UX in return. My portfolio doubled in two months — without spending a rupee.' },
  { name: 'Priya Nair', college: 'NIT Trichy · ECE', init: 'PN', color: '#ec4899', quote: 'The video sessions feel just like being in the same room. I finally cracked DSA with a senior who wanted guitar lessons.' },
  { name: 'Rahul Gupta', college: 'DTU Delhi · IT', init: 'RG', color: '#a855f7', quote: 'Zedify helped me find a design partner for my startup. We exchanged skills and ended up co-founding the product together.' },
];

const Testimonials = () => (
  <section id="testimonials" style={{ padding: '100px 24px', background: 'rgba(255,255,255,0.01)' }}>
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div className="reveal" style={{ textAlign: 'center', marginBottom: 60 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)', borderRadius: 999, padding: '6px 16px', marginBottom: 20, fontSize: 12, fontWeight: 700, color: '#c4b5fd', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Student Stories
        </div>
        <h2 style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 900, color: '#fff', letterSpacing: '-1.5px', lineHeight: 1.1 }}>
          Real students. <span style={{ color: '#c084fc' }}>Real results.</span>
        </h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 18 }}>
        {TESTIMONIALS.map((t, i) => (
          <div key={i} className="reveal" style={{ transitionDelay: `${i * 100}ms`, background: 'rgba(255,255,255,0.03)', border: `1px solid ${t.color}25`, borderRadius: 22, padding: '28px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
              {[...Array(5)].map((_, j) => (<span key={j} style={{ color: '#fbbf24', fontSize: 16 }}>★</span>))}
            </div>
            <blockquote style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, flex: 1, margin: '0 0 24px', fontStyle: 'italic' }}>"{t.quote}"</blockquote>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#fff', boxShadow: `0 0 20px ${t.color}50`, flexShrink: 0 }}>{t.init}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{t.name}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{t.college}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ══════════════════════════════════════
   CTA
══════════════════════════════════════ */
const Cta = () => (
  <section style={{ padding: '100px 24px', position: 'relative', overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 50% 50%,rgba(99,102,241,0.12) 0%,transparent 70%)' }} />
    <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
      <div className="reveal" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 28, padding: '64px 40px', backdropFilter: 'blur(20px)' }}>
        <div style={{ width: 64, height: 64, borderRadius: 20, background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', boxShadow: '0 0 40px rgba(99,102,241,0.5)' }}>
          <Logo size={36} />
        </div>
        <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900, color: '#fff', letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 16 }}>
          Ready to swap your<br /><span style={{ color: '#818cf8' }}>first skill?</span>
        </h2>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', marginBottom: 36, lineHeight: 1.6 }}>
          Join 10,000+ college students learning without limits — or tuition fees.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '15px 36px', borderRadius: 14, background: 'linear-gradient(135deg,#4f46e5,#a855f7)', boxShadow: '0 8px 30px rgba(99,102,241,0.45)', color: '#fff', fontWeight: 800, fontSize: 15, textDecoration: 'none', transition: 'transform 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = ''}>
            Create Free Account
            <svg width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
          </Link>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', padding: '15px 32px', borderRadius: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)', fontWeight: 700, fontSize: 15, textDecoration: 'none', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}>
            Already have an account?
          </Link>
        </div>
      </div>
    </div>
  </section>
);

/* ══════════════════════════════════════
   FOOTER
══════════════════════════════════════ */
const Footer = () => (
  <footer style={{ background: '#030710', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '56px 24px 32px' }}>
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 36, marginBottom: 48 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <Logo size={32} />
            <div>
              <div style={{ fontWeight: 900, color: '#fff', fontSize: 17 }}>Zedify</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>SKILL EXCHANGE</div>
            </div>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', lineHeight: 1.65 }}>Peer-to-peer skill exchange platform built exclusively for college students across India.</p>
        </div>
        {[
          { h: 'Platform', items: ['Features', 'How it Works', 'Skills', 'Pricing'] },
          { h: 'Company', items: ['About Us', 'Blog', 'Careers', 'Press'] },
          { h: 'Legal', items: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Contact'] },
        ].map((col) => (
          <div key={col.h}>
            <h4 style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 18 }}>{col.h}</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {col.items.map((item) => (
                <li key={item}><span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', cursor: 'default', transition: 'color 0.2s' }}>{item}</span></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 24, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)', margin: 0 }}>© 2026 Zedify. All rights reserved.</p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)', margin: 0 }}>Made with ❤️ for Indian students — Zedify Beta</p>
      </div>
    </div>
  </footer>
);

/* ── Global styles injection ── */
const GlobalStyles = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes blobFloat {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        33% { transform: translateY(-20px) rotate(1deg); }
        66% { transform: translateY(-10px) rotate(-0.5deg); }
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.6; transform: scale(1.2); }
      }
      .reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1); }
      .reveal.visible { opacity: 1; transform: translateY(0); }
      .hero-pill { display: none !important; }
      @media (min-width: 1024px) { .hero-pill { display: block !important; } }
      .hidden-mobile { display: none; }
      .show-mobile { display: block; }
      @media (min-width: 768px) { .hidden-mobile { display: flex; } .show-mobile { display: none; } }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  return null;
};

/* ══════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════ */
const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  useScrollReveal();

  useEffect(() => { if (user) navigate('/feed', { replace: true }); }, [user, navigate]);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',sans-serif", background: '#050814', overflowX: 'hidden', WebkitFontSmoothing: 'antialiased' }}>
      <GlobalStyles />
      <Nav scrolled={scrolled} />
      <main>
        <Hero />
        <Stats />
        <Features />
        <Steps />
        <SkillsSection />
        <Testimonials />
        <Cta />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
export { Logo as ZedifyLogo };