import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ZedifyLogo } from './LandingPage';

/* ── Icons ── */
const I = {
  person:  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  email:   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  lock:    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
  college: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  book:    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  pencil:  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>,
  check:   <svg className="w-5 h-5" style={{color:'#4ade80'}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
  arrowR:  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>,
  arrowL:  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" /></svg>,
  close:   <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
};

const FEATURES = [
  { icon: '🎓', title: 'Learn together', desc: 'Find students on campus who can teach you the skills you need.' },
  { icon: '🚀', title: 'Teach and grow', desc: 'Share your expertise and build a reputation.' },
  { icon: '🔒', title: 'Verified network', desc: 'Connect exclusively with verified university students.' },
];

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [skillInput, setSkillInput] = useState({ offered: '', wanted: '' });
  const [showPwd, setShowPwd] = useState(false);

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    college: '', branch: '', year: '', skillsOffered: [], skillsWanted: [],
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const addSkill = (type) => {
    const val = skillInput[type].trim();
    if (!val) return;
    const key = type === 'offered' ? 'skillsOffered' : 'skillsWanted';
    if (form[key].includes(val)) return;
    setForm({ ...form, [key]: [...form[key], val] });
    setSkillInput({ ...skillInput, [type]: '' });
  };

  const removeSkill = (type, skill) => {
    const key = type === 'offered' ? 'skillsOffered' : 'skillsWanted';
    setForm({ ...form, [key]: form[key].filter((s) => s !== skill) });
  };

  const nextStep = () => {
    setError('');
    if (step === 1) {
      if (!form.name.trim() || !form.email.trim() || !form.password) return setError('All fields required');
      if (!/\S+@\S+\.\S+/.test(form.email)) return setError('Invalid email');
      if (form.password.length < 6) return setError('Password must be 6+ chars');
      if (form.password !== form.confirmPassword) return setError('Passwords mismatch');
    }
    setStep(s => s + 1);
  };

  const prevStep = () => { setError(''); setStep(s => s - 1); };

  const handleSubmit = async (e) => {
    if(e) e.preventDefault();
    setError(''); setLoading(true);
    const { confirmPassword, ...data } = form;
    const res = await register(data);
    setLoading(false);
    if (res.success) navigate('/feed');
    else setError(res.message || 'Registration failed');
  };

  const YEAR_OPTIONS = ['1st', '2nd', '3rd', '4th', 'Graduate'];
  const STEP_TITLES = ['Account Details', 'Your Profile', 'Your Skills'];
  const STEP_SUB = ['Create your login', 'Help peers find you', 'What can you offer/learn?'];
  
  const passwordsMatch = form.password && form.confirmPassword ? form.password === form.confirmPassword : null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#050814', fontFamily: "'Inter','Space Grotesk',sans-serif" }}>

      {/* ── Left form panel ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 440, animation: 'pageEntry 0.5s cubic-bezier(0.16,1,0.3,1) both' }}>
          
          <div className="lg:hidden" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <ZedifyLogo size={32} />
            <span style={{ fontWeight: 900, fontSize: 18, color: '#fff' }}>Zedify</span>
          </div>

          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', marginBottom: 6, fontFamily: "'Space Grotesk',sans-serif" }}>
              Join Zedify 🚀
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(148,163,184,0.65)' }}>Step {step} of 3: {STEP_SUB[step-1]}</p>
          </div>

          {/* Progress bar */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 32 }}>
            {[1,2,3].map(n => (
              <div key={n} style={{ flex: 1, height: 4, borderRadius: 2, background: step >= n ? '#6366f1' : 'rgba(255,255,255,0.1)', transition: 'background 0.3s' }} />
            ))}
          </div>

          {error && (
            <div className="alert-error" style={{ marginBottom: 20 }}>
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={e => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* STEP 1 */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeIn 0.3s' }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label className="input-label">Full Name</label>
                    <div style={{ position: 'relative' }}>
                      <input className="input" name="name" value={form.name} onChange={handleChange} placeholder="Arjun Sharma" required style={{ paddingLeft: 40 }} />
                      <span style={{ position: 'absolute', left: 14, top: 12, color: 'rgba(148,163,184,0.5)' }}>{I.person}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="input-label">Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <input className="input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@university.edu" required style={{ paddingLeft: 40 }} />
                    <span style={{ position: 'absolute', left: 14, top: 12, color: 'rgba(148,163,184,0.5)' }}>{I.email}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label className="input-label">Password</label>
                    <div style={{ position: 'relative' }}>
                      <input className="input" type={showPwd ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="Min 6 chars" required style={{ paddingLeft: 40, paddingRight: 40 }} />
                      <span style={{ position: 'absolute', left: 14, top: 12, color: 'rgba(148,163,184,0.5)' }}>{I.lock}</span>
                      <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 14, top: 10, background: 'none', border: 'none', color: 'rgba(148,163,184,0.5)' }}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          {showPwd ? (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                          )}
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="input-label">Confirm</label>
                    <div style={{ position: 'relative' }}>
                      <input className="input" type={showPwd ? 'text' : 'password'} name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Repeat" required style={{ paddingLeft: 40 }} />
                      <span style={{ position: 'absolute', left: 14, top: 10 }}>
                        {passwordsMatch === true ? I.check : passwordsMatch === false ? <svg className="w-5 h-5" style={{color:'#ef4444'}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg> : <span style={{color:'rgba(148,163,184,0.5)'}}>{I.lock}</span>}
                      </span>
                    </div>
                  </div>
                </div>
                <button type="button" onClick={nextStep} className="btn-primary w-full py-3 mt-4 text-base">Next Step {I.arrowR}</button>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeIn 0.3s' }}>
                <div>
                  <label className="input-label">College / University</label>
                  <div style={{ position: 'relative' }}>
                    <input className="input" name="college" value={form.college} onChange={handleChange} placeholder="e.g. IIT Bombay" style={{ paddingLeft: 40 }} />
                    <span style={{ position: 'absolute', left: 14, top: 12, color: 'rgba(148,163,184,0.5)' }}>{I.college}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 2 }}>
                    <label className="input-label">Branch / Major</label>
                    <div style={{ position: 'relative' }}>
                      <input className="input" name="branch" value={form.branch} onChange={handleChange} placeholder="e.g. CSE" style={{ paddingLeft: 40 }} />
                      <span style={{ position: 'absolute', left: 14, top: 12, color: 'rgba(148,163,184,0.5)' }}>{I.book}</span>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="input-label">Year</label>
                    <select className="input" name="year" value={form.year} onChange={handleChange} style={{ appearance: 'none' }}>
                      <option value="" style={{background:'#050814'}}>Year</option>
                      {YEAR_OPTIONS.map(y => <option key={y} value={y} style={{background:'#050814'}}>{y}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                  <button type="button" onClick={prevStep} className="btn-secondary flex-[1] py-3">{I.arrowL}</button>
                  <button type="button" onClick={nextStep} className="btn-primary flex-[3] py-3 text-base">Next Step {I.arrowR}</button>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.3s' }}>
                {/* Offered */}
                <div className="card" style={{ padding: 20 }}>
                  <label className="input-label" style={{ color: '#818cf8' }}>Skills I Can Teach</label>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <input className="input" value={skillInput.offered} onChange={e => setSkillInput({ ...skillInput, offered: e.target.value })} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill('offered'))} placeholder="e.g. Python, Figma..." />
                    <button type="button" onClick={() => addSkill('offered')} className="btn-secondary px-4 text-xs font-bold">+ Add</button>
                  </div>
                  {form.skillsOffered.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {form.skillsOffered.map(s => (
                        <span key={s} className="skill-tag" style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', borderColor: 'rgba(99,102,241,0.25)' }}>
                          {s} <button type="button" onClick={() => removeSkill('offered', s)} style={{ background: 'none', border: 'none', color: 'inherit', marginLeft: 6, fontWeight: 800 }}>&times;</button>
                        </span>
                      ))}
                    </div>
                  ) : <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>No skills added</span>}
                </div>

                {/* Wanted */}
                <div className="card" style={{ padding: 20 }}>
                  <label className="input-label" style={{ color: '#c084fc' }}>Skills I Want to Learn</label>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <input className="input" value={skillInput.wanted} onChange={e => setSkillInput({ ...skillInput, wanted: e.target.value })} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill('wanted'))} placeholder="e.g. Spanish, React..." />
                    <button type="button" onClick={() => addSkill('wanted')} className="btn-secondary px-4 text-xs font-bold">+ Add</button>
                  </div>
                  {form.skillsWanted.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {form.skillsWanted.map(s => (
                        <span key={s} className="skill-tag" style={{ background: 'rgba(168,85,247,0.15)', color: '#d8b4fe', borderColor: 'rgba(168,85,247,0.25)' }}>
                          {s} <button type="button" onClick={() => removeSkill('wanted', s)} style={{ background: 'none', border: 'none', color: 'inherit', marginLeft: 6, fontWeight: 800 }}>&times;</button>
                        </span>
                      ))}
                    </div>
                  ) : <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>No skills added</span>}
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                  <button type="button" onClick={prevStep} className="btn-secondary flex-[1] py-3">{I.arrowL}</button>
                  <button type="button" onClick={handleSubmit} disabled={loading} className="btn-primary flex-[3] py-3 text-base">
                    {loading ? <><span className="spinner-sm border-t-white" /> Creating...</> : 'Create Account'}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid var(--border)', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#818cf8', fontWeight: 700 }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>

      {/* ── Right brand panel ── */}
      <div className="hidden lg:flex" style={{
        width: '45%', flexDirection: 'column', justifyContent: 'center',
        padding: '48px 56px', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(145deg,#0d1235 0%,#1a1060 50%,#0d0a2e 100%)',
        borderLeft: '1px solid rgba(255,255,255,0.07)',
      }}>
        {/* Blobs */}
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(99,102,241,0.3) 0%,transparent 70%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '-15%', right: '-10%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle,rgba(168,85,247,0.2) 0%,transparent 70%)', filter: 'blur(50px)' }} />

        {/* Hero */}
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 999, padding: '5px 14px', marginBottom: 24, fontSize: 11, fontWeight: 700, color: '#d8b4fe', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            🚀 Join the community
          </div>
          <h1 style={{ fontSize: 40, fontWeight: 900, color: '#fff', lineHeight: 1.15, letterSpacing: '-1.5px', marginBottom: 16, fontFamily: "'Space Grotesk',sans-serif" }}>
            Create your account<br />
            <span style={{ background: 'linear-gradient(135deg,#c084fc,#f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              and start swapping.
            </span>
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(148,163,184,0.8)', lineHeight: 1.7, marginBottom: 36 }}>
            Join thousands of college students sharing their skills and learning for free.
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
      </div>

    </div>
  );
};

export default Register;