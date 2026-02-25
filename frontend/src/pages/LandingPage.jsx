import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* 
   ZEDIFY LOGO SVG – Graduation cap + open book + network nodes
 */
export const ZedifyLogo = ({ size = 40, animated = false }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="40" r="36" stroke="url(#netRing)" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.7"
      style={animated ? { animation: 'spin 18s linear infinite', transformOrigin: '40px 40px' } : {}} />
    {[0,60,120,180,240,300].map((deg, i) => {
      const rad = (deg * Math.PI) / 180;
      const cx = 40 + 36 * Math.cos(rad);
      const cy = 40 + 36 * Math.sin(rad);
      const colors = ['#3b82f6','#10b981','#f59e0b','#6366f1','#ef4444','#06b6d4'];
      return <circle key={i} cx={cx} cy={cy} r="3.5" fill={colors[i]} opacity="0.9" />;
    })}
    {[[0,120],[60,180],[120,240],[180,300],[240,0],[300,60]].map(([a,b], i) => {
      const ra = (a * Math.PI) / 180, rb = (b * Math.PI) / 180;
      return (
        <line key={i}
          x1={40 + 36*Math.cos(ra)} y1={40 + 36*Math.sin(ra)}
          x2={40 + 36*Math.cos(rb)} y2={40 + 36*Math.sin(rb)}
          stroke="rgba(148,163,184,0.4)" strokeWidth="0.8" />
      );
    })}
    <path d="M18 54 Q40 48 40 48 Q40 48 62 54 L62 66 Q40 60 40 60 Q40 60 18 66 Z" fill="url(#bookGrad)" />
    <path d="M18 44 Q29 40 40 40 L40 60 Q29 58 18 62 Z" fill="url(#leftPage)" />
    <path d="M62 44 Q51 40 40 40 L40 60 Q51 58 62 62 Z" fill="url(#rightPage)" />
    <line x1="40" y1="40" x2="40" y2="60" stroke="#1e40af" strokeWidth="1.5" opacity="0.6" />
    <ellipse cx="40" cy="29" rx="16" ry="5" fill="url(#capTop)" />
    <path d="M40 29 L40 41" stroke="#1e40af" strokeWidth="2" />
    <path d="M24 28 L40 22 L56 28 L40 34 Z" fill="url(#capBoard)" />
    <circle cx="56" cy="28" r="2" fill="#f59e0b" />
    <line x1="56" y1="30" x2="56" y2="37" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="56" y1="37" x2="54" y2="41" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="56" y1="37" x2="58" y2="41" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
    <defs>
      <linearGradient id="netRing" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#3b82f6" /><stop offset="50%" stopColor="#6366f1" /><stop offset="100%" stopColor="#06b6d4" />
      </linearGradient>
      <linearGradient id="bookGrad" x1="18" y1="54" x2="62" y2="66" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#1d4ed8" /><stop offset="100%" stopColor="#1e40af" />
      </linearGradient>
      <linearGradient id="leftPage" x1="18" y1="40" x2="40" y2="62" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#059669" />
      </linearGradient>
      <linearGradient id="rightPage" x1="62" y1="40" x2="40" y2="62" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#f59e0b" /><stop offset="40%" stopColor="#ef4444" /><stop offset="100%" stopColor="#dc2626" />
      </linearGradient>
      <linearGradient id="capTop" x1="24" y1="29" x2="56" y2="29" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#1d4ed8" /><stop offset="100%" stopColor="#2563eb" />
      </linearGradient>
      <linearGradient id="capBoard" x1="24" y1="22" x2="56" y2="34" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#1e40af" /><stop offset="100%" stopColor="#1d4ed8" />
      </linearGradient>
    </defs>
  </svg>
);

const useTilt = (strength = 12) => {
  const ref = useRef(null);
  const handleMove = useCallback((e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    ref.current.style.transform = `perspective(900px) rotateY(${x * strength}deg) rotateX(${-y * strength}deg) scale3d(1.03,1.03,1.03)`;
    ref.current.style.transition = 'none';
  }, [strength]);
  const handleLeave = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg) scale3d(1,1,1)';
    ref.current.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)';
  }, []);
  return { ref, onMouseMove: handleMove, onMouseLeave: handleLeave };
};

const useScrollReveal = () => {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
};

const AnimatedCounter = ({ target, suffix = '', duration = 1600 }) => {
  const [count, setCount] = useState(0);
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
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.floor(eased * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

const Orb = ({ size, color, top, left, delay, duration = '7s', blur = '80px', opacity = '0.35' }) => (
  <div className="absolute rounded-full pointer-events-none"
    style={{ width: size, height: size, top, left, opacity, background: color, filter: `blur(${blur})`,
      animation: `float ${duration} ease-in-out infinite`, animationDelay: delay }} />
);

const ParticleField = () => {
  const nodes = [
    { x: '8%', y: '15%', c: '#3b82f6', s: 6 }, { x: '25%', y: '8%',  c: '#10b981', s: 5 },
    { x: '45%', y: '20%', c: '#f59e0b', s: 4 }, { x: '70%', y: '10%', c: '#6366f1', s: 6 },
    { x: '88%', y: '25%', c: '#06b6d4', s: 5 }, { x: '95%', y: '55%', c: '#ef4444', s: 4 },
    { x: '80%', y: '80%', c: '#10b981', s: 5 }, { x: '55%', y: '90%', c: '#3b82f6', s: 6 },
    { x: '20%', y: '75%', c: '#a855f7', s: 4 }, { x: '5%',  y: '60%', c: '#f59e0b', s: 5 },
  ];
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" xmlns="http://www.w3.org/2000/svg">
      {nodes.flatMap((a, i) => nodes.slice(i + 1).slice(0, 3).map((b, j) => (
        <line key={`${i}-${j}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="rgba(148,163,184,0.4)" strokeWidth="0.8" />
      )))}
      {nodes.map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r={n.s} fill={n.c} opacity="0.8"
          style={{ animation: `float ${4 + i * 0.7}s ease-in-out infinite`, animationDelay: `${i * 0.3}s` }} />
      ))}
    </svg>
  );
};

const LandingNav = ({ scrolled }) => {
  const [open, setOpen] = useState(false);
  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
      scrolled ? 'bg-gray-950/90 backdrop-blur-xl border-b border-white/10 shadow-card' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <ZedifyLogo size={38} animated />
          <div className="flex flex-col leading-none">
            <span className="font-black text-xl text-white tracking-tight">Zedify</span>
            <span className="text-[10px] text-blue-300/70 font-medium tracking-wider uppercase">Skill Exchange</span>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-1 glass rounded-2xl px-2 py-1.5">
          {['Features','How it works','Skills','Testimonials'].map((l) => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g,'-')}`}
              className="text-sm font-medium text-white/70 hover:text-white px-4 py-2 rounded-xl hover:bg-white/10 transition-all duration-200">
              {l}
            </a>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <Link to="/login" className="text-sm font-semibold text-white/80 hover:text-white px-4 py-2 rounded-xl hover:bg-white/10 transition-all">Sign In</Link>
          <Link to="/register" className="relative text-sm font-bold px-5 py-2.5 rounded-xl overflow-hidden group text-white"
            style={{ background: 'linear-gradient(135deg,#2563eb,#6366f1,#a855f7)' }}>
            Get Started Free
          </Link>
        </div>
        <button onClick={() => setOpen(!open)} className="md:hidden text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-all">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            {open ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />}
          </svg>
        </button>
      </div>
      {open && (
        <div className="md:hidden glass-dark border-t border-white/10 px-4 py-4 space-y-1">
          {['Features','How it works','Skills','Testimonials'].map((l) => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g,'-')}`} onClick={() => setOpen(false)}
              className="block text-sm font-medium text-white/80 hover:text-white px-3 py-2.5 rounded-xl hover:bg-white/10 transition-all">
              {l}
            </a>
          ))}
          <div className="flex gap-2 pt-3 border-t border-white/10">
            <Link to="/login" className="flex-1 text-sm font-semibold text-center py-2.5 rounded-xl glass text-white">Sign In</Link>
            <Link to="/register" className="flex-1 text-sm font-semibold text-center py-2.5 rounded-xl text-white"
              style={{ background: 'linear-gradient(135deg,#2563eb,#6366f1)' }}>Get Started</Link>
          </div>
        </div>
      )}
    </header>
  );
};

const HERO_CARDS = [
  { skill: 'React',  level: 'Advanced', user: 'Aarav S.', color: '#3b82f6', top: '12%', left: '2%',  delay: '0s'   },
  { skill: 'UI/UX',  level: 'Expert',   user: 'Priya N.', color: '#10b981', top: '60%', left: '1%',  delay: '1.5s' },
  { skill: 'Python', level: 'Beginner', user: 'Rahul G.', color: '#f59e0b', top: '20%', right:'2%',  delay: '0.8s' },
  { skill: 'ML',     level: 'Moderate', user: 'Sneha K.', color: '#a855f7', top: '65%', right:'1%',  delay: '2.2s' },
];

const HeroSection = () => (
  <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16" style={{ background: '#060b1a' }}>
    <div className="absolute inset-0" style={{
      background: 'radial-gradient(ellipse 80% 60% at 20% 40%,rgba(37,99,235,0.35) 0%,transparent 60%),radial-gradient(ellipse 60% 50% at 80% 20%,rgba(99,102,241,0.30) 0%,transparent 55%),radial-gradient(ellipse 50% 60% at 60% 80%,rgba(168,85,247,0.20) 0%,transparent 55%)'
    }} />
    <div className="absolute inset-0 opacity-[0.04]"
      style={{ backgroundImage:'linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)', backgroundSize:'60px 60px' }} />
    <Orb size="500px" color="radial-gradient(circle,#2563eb,#4f46e5)" top="-10%" left="-5%"  delay="0s"   duration="10s" blur="120px" opacity="0.25" />
    <Orb size="400px" color="radial-gradient(circle,#7c3aed,#a855f7)" top="40%"  left="60%"  delay="3s"   duration="12s" blur="100px" opacity="0.20" />
    <Orb size="300px" color="radial-gradient(circle,#0e7490,#06b6d4)" top="70%"  left="-5%"  delay="1.5s" duration="9s"  blur="90px"  opacity="0.20" />
    <ParticleField />
    {HERO_CARDS.map((c, i) => (
      <div key={i} className="absolute glass-card rounded-2xl px-4 py-3 hidden lg:block"
        style={{ top:c.top, left:c.left, right:c.right, minWidth:'140px', animation:'float 7s ease-in-out infinite', animationDelay:c.delay }}>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background:c.color }} />
          <span className="text-white font-bold text-sm">{c.skill}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-white/50 text-xs">{c.level}</span>
          <span className="text-white/70 text-xs font-medium">{c.user}</span>
        </div>
      </div>
    ))}
    <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
      <div className="flex justify-center mb-8">
        <div className="relative" style={{ animation:'float 6s ease-in-out infinite' }}>
          <div className="absolute inset-0 rounded-3xl blur-2xl opacity-60"
            style={{ background:'radial-gradient(circle,#2563eb,#6366f1)', transform:'scale(1.4)' }} />
          <div className="relative glass-card rounded-3xl p-4"><ZedifyLogo size={72} animated /></div>
        </div>
      </div>
      <div className="inline-flex items-center gap-2.5 glass rounded-full px-5 py-2 mb-7 border border-blue-400/20">
        <span className="w-2 h-2 bg-emerald-400 rounded-full" style={{ animation:'pulse 2s ease-in-out infinite' }} />
        <span className="text-white/80 text-sm font-semibold tracking-wide">10,000+ students &mdash; 500+ colleges</span>
      </div>
      <h1 className="font-black text-5xl sm:text-6xl lg:text-8xl leading-[1.0] tracking-tight mb-6">
        <span className="text-white">Learn More.</span><br />
        <span style={{ backgroundImage:'linear-gradient(135deg,#60a5fa 0%,#818cf8 35%,#c084fc 70%,#e879f9 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
          Teach More.
        </span><br />
        <span className="text-white/50">Pay Nothing.</span>
      </h1>
      <p className="text-white/60 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
        Zedify connects college students for peer-to-peer skill exchanges. Teach what you know, learn what you need — all in one beautiful platform.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
        <Link to="/register" className="group relative flex items-center gap-2.5 font-black text-white px-10 py-4 rounded-2xl overflow-hidden text-base active:scale-95 transition-transform duration-150"
          style={{ background:'linear-gradient(135deg,#1d4ed8,#4f46e5,#7c3aed)', boxShadow:'0 0 30px rgba(37,99,235,0.5)' }}>
          <span className="relative z-10 flex items-center gap-2">
            Start for Free
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </span>
        </Link>
        <Link to="/login" className="flex items-center gap-2 glass border border-white/20 text-white font-bold px-10 py-4 rounded-2xl hover:bg-white/15 transition-all duration-200 text-base">
          Sign In
        </Link>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3 text-white/50 text-sm">
        <div className="flex -space-x-2.5">
          {[['AS','#2563eb'],['PN','#d946ef'],['RG','#7c3aed'],['KM','#0e7490'],['JS','#10b981']].map(([init,bg], i) => (
            <div key={i} style={{ background:bg }} className="w-9 h-9 rounded-full border-2 border-gray-900 flex items-center justify-center text-white text-xs font-bold">{init}</div>
          ))}
        </div>
        <span className="font-medium">Join <strong className="text-white">10,000+</strong> students already swapping skills</span>
      </div>
    </div>
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2" style={{ animation:'float 2.5s ease-in-out infinite' }}>
      <span className="text-white/30 text-[10px] font-bold tracking-[0.2em] uppercase">Scroll</span>
      <div className="w-6 h-10 border border-white/20 rounded-full flex items-start justify-center pt-2">
        <div className="w-1 h-2 bg-white/50 rounded-full" style={{ animation:'float 1.5s ease-in-out infinite' }} />
      </div>
    </div>
  </section>
);

const StatsSection = () => {
  const stats = [
    { n:10000, s:'+', label:'Students Registered', color:'#3b82f6' },
    { n:500,   s:'+', label:'Colleges Connected',  color:'#10b981' },
    { n:25000, s:'+', label:'Skills Exchanged',    color:'#a855f7' },
    { n:'4.9', s:'', label:'Average Rating',      color:'#f59e0b', raw:true },
  ];
  return (
    <section className="relative py-20 overflow-hidden" style={{ background:'#0a0f1e' }}>
      <div className="absolute inset-0" style={{ background:'radial-gradient(ellipse 80% 100% at 50% 0%,rgba(37,99,235,0.10),transparent)' }} />
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div key={i} className="reveal text-center" style={{ transitionDelay:`${i*80}ms` }}>
              <div className="text-4xl sm:text-5xl font-black mb-2 tabular-nums"
                style={{ color:s.color, filter:`drop-shadow(0 0 20px ${s.color}60)` }}>
                {s.raw ? <>{s.n}{s.s}</> : <AnimatedCounter target={s.n} suffix={s.s} />}
              </div>
              <div className="text-white/50 text-sm font-semibold tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FEATURES = [
  { icon:'', title:'Smart Skill Matching',  desc:'Our algorithm finds the perfect match from your campus — based on what you teach and what you need.',    glow:'rgba(37,99,235,0.4)',  border:'#2563eb40', bg:'rgba(37,99,235,0.08)' },
  { icon:'', title:'Live Video Sessions',    desc:'Host real-time learning sessions directly inside Zedify — no third-party apps needed.',                    glow:'rgba(99,102,241,0.4)', border:'#6366f140', bg:'rgba(99,102,241,0.08)' },
  { icon:'', title:'Real-Time Messaging',    desc:'Chat with exchange partners instantly. Coordinate sessions, share resources, stay in sync.',                glow:'rgba(168,85,247,0.4)', border:'#a855f740', bg:'rgba(168,85,247,0.08)' },
  { icon:'', title:'Reputation System',      desc:'Build your academic profile through verified skill exchanges. Ratings that students actually trust.',        glow:'rgba(245,158,11,0.4)', border:'#f59e0b40', bg:'rgba(245,158,11,0.08)' },
  { icon:'', title:'Campus Community',       desc:'Follow peers, post updates, like and comment — a social feed built for student learners.',                  glow:'rgba(16,185,129,0.4)', border:'#10b98140', bg:'rgba(16,185,129,0.08)' },
  { icon:'', title:'Verified Campus IDs',  desc:'Every account is tied to a real student. A trusted, scam-free campus-only environment.',                   glow:'rgba(6,182,212,0.4)',  border:'#06b6d440', bg:'rgba(6,182,212,0.08)'  },
];

const Feature3DCard = ({ icon, title, desc, glow, border, bg }) => {
  const tilt = useTilt(10);
  return (
    <div {...tilt} className="card-3d rounded-2xl p-6 cursor-default h-full relative overflow-hidden"
      style={{ background:bg, border:`1px solid ${border}`, boxShadow:'0 4px 24px rgba(0,0,0,0.3)' }}>
      <div className="text-4xl mb-4" style={{ filter:`drop-shadow(0 0 12px ${glow})`, animation:'float 5s ease-in-out infinite' }}>{icon}</div>
      <h3 className="font-black text-white text-lg mb-2 leading-tight">{title}</h3>
      <p className="text-white/55 text-sm leading-relaxed">{desc}</p>
      <div className="absolute bottom-5 right-5 w-2 h-2 rounded-full opacity-60"
        style={{ background:glow.replace('0.4','1'), boxShadow:`0 0 10px ${glow}` }} />
    </div>
  );
};

const FeaturesSection = () => (
  <section id="features" className="py-28 relative overflow-hidden" style={{ background:'#080d1a' }}>
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
      <div className="text-center max-w-2xl mx-auto mb-20 reveal">
        <div className="inline-flex items-center gap-2 glass rounded-full px-5 py-2 mb-5 border border-blue-400/20">
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
          <span className="text-blue-300 text-xs font-bold uppercase tracking-widest">Everything You Need</span>
        </div>
        <h2 className="font-black text-4xl sm:text-5xl text-white tracking-tight leading-tight mb-4">
          One platform. <span style={{ color:'#818cf8' }}>Every skill.</span>
        </h2>
        <p className="text-white/50 text-lg leading-relaxed">Everything a student needs to teach, learn, connect, and grow — without paying for courses.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURES.map((f, i) => (
          <div key={f.title} className="reveal relative" style={{ transitionDelay:`${i*70}ms` }}>
            <Feature3DCard {...f} />
          </div>
        ))}
      </div>
    </div>
  </section>
);

const StepCard = ({ n, title, desc, color, glow, delay }) => {
  const tilt = useTilt(8);
  return (
    <div className="reveal flex flex-col items-center text-center" style={{ transitionDelay: delay }}>
      <div {...tilt} className="card-3d glass-card rounded-2xl p-7 w-full cursor-default" style={{ border: `1px solid ${color}30` }}>
        <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-5 font-black text-2xl"
          style={{ background: `${color}20`, color, boxShadow: `0 0 25px ${glow}`, border: `1px solid ${color}40` }}>{n}</div>
        <h3 className="font-black text-white text-lg mb-2">{title}</h3>
        <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
};

const STEPS = [
  { n:'01', title:'Create your profile',   color:'#3b82f6', glow:'rgba(59,130,246,0.4)',  delay:'0ms',
    desc:'Sign up with your college email, list what you can teach, and add the skills you want to learn.' },
  { n:'02', title:'Get matched instantly',  color:'#a855f7', glow:'rgba(168,85,247,0.4)',  delay:'100ms',
    desc:'Our algorithm surfaces the best matches — students who need what you offer and offer what you need.' },
  { n:'03', title:'Start learning together',color:'#10b981', glow:'rgba(16,185,129,0.4)', delay:'200ms',
    desc:'Chat, schedule a live video session, exchange skills. Track your progress and build your reputation.' },
];

const HowItWorks = () => (
  <section id="how-it-works" className="py-28 relative overflow-hidden" style={{ background:'#060b18' }}>
    <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
      <div className="text-center max-w-2xl mx-auto mb-20 reveal">
        <div className="inline-flex items-center gap-2 glass rounded-full px-5 py-2 mb-5 border border-emerald-400/20">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
          <span className="text-emerald-300 text-xs font-bold uppercase tracking-widest">How It Works</span>
        </div>
        <h2 className="font-black text-4xl sm:text-5xl text-white tracking-tight mb-4">
          Up and running in <span style={{ color:'#34d399' }}>3 steps</span>
        </h2>
        <p className="text-white/50 text-lg">No fees, no barriers — just pure peer learning.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {STEPS.map((s) => <StepCard key={s.n} {...s} />)}
      </div>
      <div className="reveal glass-card rounded-2xl p-8 md:p-10">
        <h3 className="font-black text-white text-xl mb-8 text-center">Why students love Zedify</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {['Completely free — no subscriptions, ever','Only verified college students','Live video sessions built right in',
            'Build a real portfolio of skills taught','Community feed for your learning journey','Rate and review every exchange',
          ].map((b) => (
            <div key={b} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mt-0.5">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <span className="text-white/65 text-sm font-medium leading-snug">{b}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const SKILL_COLORS = [
  ['#3b82f6','#1e3a8a'], ['#10b981','#064e3b'], ['#a855f7','#3b0764'],
  ['#f59e0b','#78350f'], ['#06b6d4','#0c4a6e'], ['#ef4444','#7f1d1d'],
];
const SKILLS = [
  'React','UI/UX Design','Machine Learning','Python','Data Science','Photography',
  'Java','Video Editing','Guitar','Public Speaking','SQL','Sketch Art',
  'Node.js','Content Writing','Digital Marketing','Flutter','Chess','Figma',
  'Deep Learning','Canva','C++','English Speaking','Ethical Hacking','Notion',
];

const SkillsSection = () => (
  <section id="skills" className="py-28 overflow-hidden" style={{ background:'#08101a' }}>
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <div className="text-center max-w-2xl mx-auto mb-16 reveal">
        <div className="inline-flex items-center gap-2 glass rounded-full px-5 py-2 mb-5 border border-amber-400/20">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
          <span className="text-amber-300 text-xs font-bold uppercase tracking-widest">Skill Exchange</span>
        </div>
        <h2 className="font-black text-4xl sm:text-5xl text-white tracking-tight mb-4">
          Every skill has a <span style={{ color:'#fbbf24' }}>home here</span>
        </h2>
        <p className="text-white/50 text-lg leading-relaxed">From code to creativity — whatever you know, someone wants to learn.</p>
      </div>
      <div className="reveal flex flex-wrap justify-center gap-3">
        {SKILLS.map((skill, i) => {
          const [color, bg] = SKILL_COLORS[i % SKILL_COLORS.length];
          return (
            <div key={skill} className="card-3d cursor-default rounded-xl px-5 py-2.5 font-bold text-sm transition-all duration-200"
              style={{ background:`${bg}80`, border:`1px solid ${color}40`, color }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 0 20px ${color}40`; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}>
              {skill}
            </div>
          );
        })}
      </div>
      <p className="text-center text-white/30 text-sm mt-10 font-medium reveal">
        And hundreds more — if it can be learned, it can be exchanged on Zedify.
      </p>
    </div>
  </section>
);

const TESTIMONIALS = [
  { name:'Aarav Sharma', college:'IIT Bombay  CSE', avatar:'AS', color:'#2563eb', glow:'rgba(37,99,235,0.4)',
    quote:'I taught Python to 3 students and learned UI/UX in return. My portfolio doubled in two months — without spending a rupee.' },
  { name:'Priya Nair',   college:'NIT Trichy  ECE', avatar:'PN', color:'#d946ef', glow:'rgba(217,70,239,0.4)',
    quote:'The video sessions feel just like being in the same room. I finally cracked DSA with a senior who wanted guitar lessons.' },
  { name:'Rahul Gupta',  college:'DTU Delhi  IT',   avatar:'RG', color:'#7c3aed', glow:'rgba(124,58,237,0.4)',
    quote:'Zedify helped me find a design partner for my startup. We exchanged skills and ended up co-founding the product together.' },
];

const TestimonialCard = ({ t, delay }) => {
  const tilt = useTilt(7);
  return (
    <div className="reveal" style={{ transitionDelay: delay }}>
      <div {...tilt} className="card-3d glass-card rounded-2xl p-6 h-full flex flex-col cursor-default" style={{ border: `1px solid ${t.color}30` }}>
        <div className="flex gap-0.5 mb-4">
          {[...Array(5)].map((_, j) => (
            <svg key={j} className="w-4 h-4" viewBox="0 0 20 20" style={{ fill:'#fbbf24' }}>
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <blockquote className="text-white/70 text-sm leading-relaxed flex-1 mb-5">"{t.quote}"</blockquote>
        <div className="flex items-center gap-3 pt-4 border-t border-white/10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
            style={{ background: t.color, boxShadow: `0 0 20px ${t.glow}` }}>{t.avatar}</div>
          <div>
            <p className="font-bold text-white text-sm">{t.name}</p>
            <p className="text-white/40 text-xs">{t.college}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const TestimonialsSection = () => (
  <section id="testimonials" className="py-28 relative overflow-hidden" style={{ background:'#060b18' }}>
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
      <div className="text-center max-w-2xl mx-auto mb-20 reveal">
        <div className="inline-flex items-center gap-2 glass rounded-full px-5 py-2 mb-5 border border-violet-400/20">
          <span className="w-1.5 h-1.5 bg-violet-400 rounded-full" />
          <span className="text-violet-300 text-xs font-bold uppercase tracking-widest">Testimonials</span>
        </div>
        <h2 className="font-black text-4xl sm:text-5xl text-white tracking-tight mb-4">
          Real students. <span style={{ color:'#a78bfa' }}>Real results.</span>
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TESTIMONIALS.map((t, i) => <TestimonialCard key={i} t={t} delay={`${i * 100}ms`} />)}
      </div>
    </div>
  </section>
);

const CtaSection = () => {
  const tilt = useTilt(5);
  return (
    <section className="py-28 relative overflow-hidden" style={{ background:'#080d1a' }}>
      <Orb size="600px" color="radial-gradient(circle,#2563eb,#7c3aed)" top="-20%" left="10%" delay="0s" duration="15s" blur="130px" opacity="0.15" />
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <div {...tilt} className="card-3d reveal glass-card rounded-3xl px-8 py-16 overflow-hidden"
          style={{ background:'linear-gradient(135deg,rgba(37,99,235,0.15),rgba(124,58,237,0.15))', border:'1px solid rgba(99,102,241,0.3)' }}>
          <div className="flex justify-center mb-6"><ZedifyLogo size={60} animated /></div>
          <h2 className="font-black text-4xl sm:text-5xl text-white tracking-tight mb-4">
            Ready to swap your <br /><span style={{ color:'#818cf8' }}>first skill?</span>
          </h2>
          <p className="text-white/60 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
            Join 10,000+ college students who are learning without limits — or tuition fees.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="group relative flex items-center gap-2 font-black text-white px-10 py-4 rounded-2xl overflow-hidden text-base active:scale-95 transition-transform"
              style={{ background:'linear-gradient(135deg,#1d4ed8,#6366f1,#a855f7)', boxShadow:'0 0 30px rgba(99,102,241,0.4)' }}>
              <span className="relative z-10 flex items-center gap-2">
                Create Free Account
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </span>
            </Link>
            <Link to="/login" className="glass border border-white/20 text-white/80 hover:text-white font-bold px-10 py-4 rounded-2xl hover:bg-white/10 transition-all text-base">
              Already have an account?
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer style={{ background:'#040810', borderTop:'1px solid rgba(255,255,255,0.06)' }} className="pt-14 pb-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-12">
        <div className="col-span-1 sm:col-span-2 md:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <ZedifyLogo size={36} />
            <div>
              <div className="font-black text-white text-base leading-tight">Zedify</div>
              <div className="text-white/30 text-xs">Skill Exchange</div>
            </div>
          </div>
          <p className="text-white/40 text-sm leading-relaxed">The animated peer-to-peer skill exchange platform built exclusively for college students.</p>
        </div>
        {[
          { h:'Product', items:['Features','How it works','Skills','Pricing'] },
          { h:'Company', items:['About Us','Blog','Careers','Press'] },
          { h:'Legal',   items:['Privacy Policy','Terms of Service','Cookie Policy','Contact'] },
        ].map((col) => (
          <div key={col.h}>
            <h4 className="font-black text-white/70 text-xs uppercase tracking-widest mb-5">{col.h}</h4>
            <ul className="space-y-3">
              {col.items.map((item) => (
                <li key={item}><span className="text-white/35 hover:text-white/70 text-sm transition-colors font-medium cursor-default">{item}</span></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-white/25 text-sm"> 2026 Zedify. All rights reserved.</p>
        <div className="flex items-center gap-1 text-white/25 text-sm">
          Made with
          <svg className="w-4 h-4 mx-1" viewBox="0 0 20 20" fill="#ef4444"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" /></svg>
          for Indian students — Zedify  Beta
        </div>
      </div>
    </div>
  </footer>
);

const LandingPage = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  useScrollReveal();
  useEffect(() => { if (user) navigate('/feed', { replace: true }); }, [user, navigate]);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return (
    <div className="font-sans antialiased" style={{ background:'#060b18' }}>
      <LandingNav scrolled={scrolled} />
      <main>
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <HowItWorks />
        <SkillsSection />
        <TestimonialsSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;