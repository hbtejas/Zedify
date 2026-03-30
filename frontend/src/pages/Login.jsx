import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ZedifyLogo } from './LandingPage';

const EyeIcon = ({ open }) => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    {open
      ? <><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></>
      : <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
    }
  </svg>
);

const FEATURES = [
  { icon: '🎓', title: 'Peer-to-Peer Learning', desc: 'Exchange skills with fellow students on campus' },
  { icon: '💬', title: 'Real-Time Chat', desc: 'Message and collaborate instantly' },
  { icon: '📹', title: 'Live Video Sessions', desc: 'Host and join live skill workshops' },
  { icon: '🔄', title: 'Skill Swaps', desc: 'Propose and accept skill-swap deals' },
];

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);
    if (result.success) navigate('/feed');
    else setError(result.message || 'Login failed. Please try again.');
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: 12,
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    color: '#f1f5f9', fontSize: 14, outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
    fontFamily: 'inherit',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#050814', fontFamily: "'Inter','Space Grotesk',sans-serif" }}>
      
      {/* ── Left brand panel ── */}
      <div className="hidden lg:flex" style={{
        width: '45%', flexDirection: 'column', justifyContent: 'space-between',
        padding: '48px 56px', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(145deg,#0d1235 0%,#1a1060 50%,#0d0a2e 100%)',
        borderRight: '1px solid rgba(255,255,255,0.07)',
      }}>
        {/* Blobs */}
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(99,102,241,0.3) 0%,transparent 70%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '-15%', right: '-10%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle,rgba(168,85,247,0.2) 0%,transparent 70%)', filter: 'blur(50px)' }} />

        {/* Logo */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12 }}>
          <ZedifyLogo size={40} />
          <div>
            <div style={{ fontWeight: 900, fontSize: 22, color: '#fff', letterSpacing: '-0.5px' }}>Zedify</div>
            <div style={{ fontSize: 10, color: '#818cf8', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Skill Exchange</div>
          </div>
        </div>

        {/* Hero */}
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 999, padding: '5px 14px', marginBottom: 24, fontSize: 11, fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            🎓 Campus Skill Platform
          </div>
          <h1 style={{ fontSize: 40, fontWeight: 900, color: '#fff', lineHeight: 1.15, letterSpacing: '-1.5px', marginBottom: 16, fontFamily: "'Space Grotesk',sans-serif" }}>
            Learn from peers,<br />
            <span style={{ background: 'linear-gradient(135deg,#818cf8,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              teach what you know.
            </span>
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(148,163,184,0.8)', lineHeight: 1.7, marginBottom: 36 }}>
            The student skill exchange platform that connects you with campus talent — completely free.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {FEATURES.map((f) => (
              <div key={f.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{f.icon}</div>
                <div>
                  <p style={{ fontWeight: 700, color: '#fff', fontSize: 13, marginBottom: 2 }}>{f.title}</p>
                  <p style={{ fontSize: 12, color: 'rgba(148,163,184,0.65)', lineHeight: 1.5 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quote */}
        <div style={{ position: 'relative', borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 20 }}>
          <p style={{ fontSize: 13, color: 'rgba(148,163,184,0.5)', fontStyle: 'italic', lineHeight: 1.6 }}>
            "The best way to learn is to teach." — Frank Oppenheimer
          </p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 420, animation: 'pageEntry 0.5s cubic-bezier(0.16,1,0.3,1) both' }}>

          {/* Mobile logo */}
          <div className="lg:hidden" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <ZedifyLogo size={32} />
            <span style={{ fontWeight: 900, fontSize: 18, color: '#fff' }}>Zedify</span>
          </div>

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', marginBottom: 6, fontFamily: "'Space Grotesk',sans-serif" }}>Welcome back 👋</h2>
            <p style={{ fontSize: 14, color: 'rgba(148,163,184,0.65)' }}>Sign in to continue to your campus feed</p>
          </div>

          {/* Error */}
          {error && (
            <div className="alert-error" style={{ marginBottom: 20 }}>
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(148,163,184,0.7)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Email address</label>
              <input
                id="email" type="email" name="email"
                value={form.email} onChange={handleChange}
                placeholder="you@university.edu"
                style={inputStyle}
                autoComplete="email" required
                onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(148,163,184,0.7)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password" type={showPwd ? 'text' : 'password'} name="password"
                  value={form.password} onChange={handleChange}
                  placeholder="••••••••" style={{ ...inputStyle, paddingRight: 44 }}
                  autoComplete="current-password" required
                  onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} tabIndex={-1}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(148,163,184,0.5)', cursor: 'pointer', display: 'flex', padding: 0 }}
                  onMouseEnter={e => e.currentTarget.style.color = '#e2e8f0'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(148,163,184,0.5)'}>
                  <EyeIcon open={showPwd} />
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              style={{
                width: '100%', padding: '14px 24px', borderRadius: 14, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                background: loading ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg,#4f46e5,#6366f1,#a855f7)',
                color: '#fff', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: loading ? 'none' : '0 6px 24px rgba(99,102,241,0.4)',
                transition: 'all 0.2s', fontFamily: 'inherit', marginTop: 4,
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 10px 32px rgba(99,102,241,0.55)'; } }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = loading ? 'none' : '0 6px 24px rgba(99,102,241,0.4)'; }}>
              {loading ? (
                <><div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Signing in…</>
              ) : 'Sign In →'}
            </button>
          </form>

          {/* Footer link */}
          <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: 'rgba(148,163,184,0.55)' }}>
              New to Zedify?{' '}
              <Link to="/register" style={{ color: '#818cf8', fontWeight: 700, textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#a5b4fc'}
                onMouseLeave={e => e.currentTarget.style.color = '#818cf8'}>
                Create a free account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
