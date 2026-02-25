import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/*  SVG Icons  */
const PersonIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const EmailIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
const LockIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);
const EyeIcon = ({ crossed }) => crossed ? (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
) : (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);
const CollegeIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);
const BookIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);
const PencilIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);
const StarIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);
const SeedIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);
const CheckIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);
const CheckCircleIcon = () => (
  <svg className="w-4 h-4" style={{color:'#4ade80'}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const XCircleIcon = () => (
  <svg className="w-4 h-4" style={{color:'#f87171'}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const ArrowRightIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
);
const ArrowLeftIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
  </svg>
);
const RocketIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
  </svg>
);

/*  Zedify Logo  */
const ZedifyLogo = ({ size = 44 }) => (
  <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="44" height="44" rx="12" fill="url(#regZLogo)" />
    <path d="M13 14h18l-13 16h13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <defs>
      <linearGradient id="regZLogo" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
        <stop stopColor="#2563eb" /><stop offset="1" stopColor="#7c3aed" />
      </linearGradient>
    </defs>
  </svg>
);

/*  Floating orb background  */
const FloatingOrbs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
    <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-30 animate-float"
      style={{background:'radial-gradient(circle, #3b82f6 0%, transparent 70%)', animationDelay:'0s'}} />
    <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full opacity-20 animate-float-slow"
      style={{background:'radial-gradient(circle, #7c3aed 0%, transparent 70%)', animationDelay:'2s'}} />
    <div className="absolute -bottom-24 left-1/4 w-72 h-72 rounded-full opacity-25 animate-float-fast"
      style={{background:'radial-gradient(circle, #4f46e5 0%, transparent 70%)', animationDelay:'1s'}} />
    <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full opacity-15 animate-float"
      style={{background:'radial-gradient(circle, #c026d3 0%, transparent 70%)', animationDelay:'3s',transform:'translate(-50%,-50%)'}} />
  </div>
);

/*  Step indicator  */
const StepDot = ({ n, active, done, label }) => (
  <div className="flex flex-col items-center gap-1.5">
    <div
      className="relative flex items-center justify-center transition-all duration-500"
      style={{width:36,height:36}}
    >
      {active && (
        <span className="absolute inset-0 rounded-full animate-ping opacity-30"
          style={{background:'linear-gradient(135deg,#2563eb,#7c3aed)'}} />
      )}
      <div
        className="relative w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 shadow-lg"
        style={done
          ? {background:'linear-gradient(135deg,#2563eb,#7c3aed)', color:'#fff', boxShadow:'0 0 18px rgba(99,102,241,0.55)'}
          : active
          ? {background:'linear-gradient(135deg,#2563eb,#7c3aed)', color:'#fff', boxShadow:'0 0 24px rgba(37,99,235,0.7)'}
          : {background:'rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.35)', border:'1px solid rgba(255,255,255,0.12)'}
        }
      >
        {done ? <CheckIcon /> : n}
      </div>
    </div>
    <span className="text-xs font-medium hidden sm:block"
      style={{color: active ? '#93c5fd' : done ? '#818cf8' : 'rgba(255,255,255,0.3)'}}>
      {label}
    </span>
  </div>
);

/*  Skill Tag  */
const SkillTag = ({ label, variant, onRemove }) => (
  <span
    className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all duration-200 hover:scale-105"
    style={variant === 'blue'
      ? {background:'rgba(37,99,235,0.2)', color:'#93c5fd', border:'1px solid rgba(37,99,235,0.35)'}
      : {background:'rgba(124,58,237,0.2)', color:'#c4b5fd', border:'1px solid rgba(124,58,237,0.35)'}
    }
  >
    {label}
    <button type="button" onClick={onRemove}
      className="opacity-50 hover:opacity-100 transition-opacity leading-none font-bold ml-0.5">
      &times;
    </button>
  </span>
);

/*  Section header  */
const SectionHeader = ({ icon, title, subtitle }) => (
  <div className="flex items-center gap-3 mb-5">
    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{background:'linear-gradient(135deg,rgba(37,99,235,0.3),rgba(124,58,237,0.3))', border:'1px solid rgba(99,102,241,0.3)', color:'#93c5fd'}}>
      {icon}
    </div>
    <div>
      <h3 className="font-semibold text-white text-sm">{title}</h3>
      {subtitle && <p className="text-xs mt-0.5" style={{color:'rgba(255,255,255,0.45)'}}>{subtitle}</p>}
    </div>
  </div>
);

/*  Glass input wrapper  */
const GlassInput = ({ children }) => (
  <div className="relative group">
    <div className="absolute inset-0 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"
      style={{boxShadow:'0 0 0 2px rgba(99,102,241,0.5), 0 0 20px rgba(99,102,241,0.15)'}} />
    {children}
  </div>
);

/*  Feature item  */
const FeatureItem = ({ icon, text }) => (
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
      style={{background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.15)', color:'#fff'}}>
      {icon}
    </div>
    <span className="text-sm" style={{color:'rgba(255,255,255,0.75)'}}>{text}</span>
  </div>
);

/*  Main component  */
const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [skillInput, setSkillInput] = useState({ offered: '', wanted: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    college: '', branch: '', year: '', skillsOffered: [], skillsWanted: [],
  });

  useEffect(() => { setMounted(true); }, []);

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
      if (!form.name.trim()) return setError('Full name is required');
      if (!form.email.trim()) return setError('Email is required');
      if (!/\S+@\S+\.\S+/.test(form.email)) return setError('Please enter a valid email address');
      if (!form.password) return setError('Password is required');
      if (form.password.length < 6) return setError('Password must be at least 6 characters');
      if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    }
    setStep((s) => s + 1);
  };

  const prevStep = () => { setError(''); setStep((s) => s - 1); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { confirmPassword, ...submitData } = form;
    const result = await register(submitData);
    setLoading(false);
    if (result.success) {
      navigate('/feed');
    } else {
      setError(result.message || 'Registration failed. Please try again.');
    }
  };

  const YEAR_OPTIONS = ['1st', '2nd', '3rd', '4th', 'Graduate'];
  const STEP_LABELS = ['Account', 'Profile', 'Skills'];
  const STEP_SUBTITLES = ['Account credentials', 'Academic profile', 'Your skills'];

  const passwordsMatch = form.password && form.confirmPassword
    ? form.password === form.confirmPassword : null;

  const inputStyle = {
    width:'100%',
    padding:'11px 16px 11px 44px',
    background:'rgba(255,255,255,0.06)',
    border:'1px solid rgba(255,255,255,0.12)',
    borderRadius:'12px',
    color:'#f1f5f9',
    fontSize:'14px',
    outline:'none',
    transition:'all 0.2s',
  };
  const inputStyleNoIcon = {
    ...inputStyle,
    padding:'11px 16px',
  };
  const selectStyle = {
    ...inputStyleNoIcon,
    cursor:'pointer',
    appearance:'none',
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden"
      style={{background:'linear-gradient(135deg, #060b18 0%, #0d1526 35%, #0f0c29 65%, #130a1a 100%)'}}>
      <FloatingOrbs />

      {/*  Left branding panel  */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-2/5 flex-col justify-between p-12 relative z-10 overflow-hidden"
        style={{borderRight:'1px solid rgba(255,255,255,0.07)'}}>

        {/* Extra orbs for left panel */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
          style={{background:'radial-gradient(circle, rgba(79,70,229,0.25) 0%, transparent 70%)', filter:'blur(32px)'}} />
        <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full pointer-events-none"
          style={{background:'radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%)', filter:'blur(32px)'}} />

        {/* Logo */}
        <div className="relative flex items-center gap-3 animate-fade-in">
          <ZedifyLogo size={46} />
          <div>
            <span className="text-white font-bold text-2xl tracking-tight">Zedify</span>
            <div className="text-xs font-medium mt-0.5" style={{color:'rgba(148,163,184,0.7)'}}>Skill Exchange Platform</div>
          </div>
        </div>

        {/* Hero copy */}
        <div className="relative space-y-8">
          <div className="animate-slide-up" style={{animationDelay:'0.1s'}}>
            <h1 className="text-4xl xl:text-5xl font-bold leading-tight text-white">
              Your campus.<br />
              <span style={{background:'linear-gradient(135deg,#93c5fd,#a78bfa,#f0abfc)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>
                Your skills.
              </span><br />
              Your future.
            </h1>
            <p className="mt-4 text-base leading-relaxed" style={{color:'rgba(255,255,255,0.55)'}}>
              Join thousands of students sharing knowledge and building connections that last beyond campus.
            </p>
          </div>

          <div className="space-y-3.5 animate-fade-in" style={{animationDelay:'0.25s'}}>
            <FeatureItem icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} text="Free forever — no hidden fees" />
            <FeatureItem icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>} text="Your data stays private and secure" />
            <FeatureItem icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" /></svg>} text="Connect with students across campus" />
            <FeatureItem icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} text="Real-time messaging and video calls" />
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 animate-fade-in" style={{animationDelay:'0.35s'}}>
            {[['10K+','Students'],['500+','Skills'],['98%','Satisfaction']].map(([n,l]) => (
              <div key={l} className="rounded-xl p-3 text-center"
                style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)'}}>
                <div className="font-bold text-lg" style={{background:'linear-gradient(135deg,#93c5fd,#a78bfa)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>{n}</div>
                <div className="text-xs mt-0.5" style={{color:'rgba(255,255,255,0.45)'}}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <p className="text-xs" style={{color:'rgba(255,255,255,0.35)'}}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold hover:text-white transition-colors underline" style={{color:'rgba(147,197,253,0.8)'}}>
              Sign in here
            </Link>
          </p>
        </div>
      </div>

      {/*  Right: form area  */}
      <div className="flex-1 flex flex-col overflow-auto relative z-10">
        <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-lg" style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.5s ease-out, transform 0.5s cubic-bezier(0.16,1,0.3,1)',
          }}>

            {/* Mobile logo */}
            <div className="flex items-center gap-3 mb-8 lg:hidden">
              <ZedifyLogo size={38} />
              <span className="text-white font-bold text-xl tracking-tight">Zedify</span>
            </div>

            {/* Heading */}
            <div className="mb-7">
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                Create your{' '}
                <span style={{background:'linear-gradient(135deg,#60a5fa,#818cf8,#a78bfa)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>
                  account
                </span>
              </h2>
              <p className="mt-2 text-sm" style={{color:'rgba(148,163,184,0.65)'}}>
                Step {step} of 3 &mdash; {STEP_SUBTITLES[step - 1]}
              </p>
            </div>

            {/* Step progress indicator */}
            <div className="flex items-center gap-0 mb-8">
              {[1, 2, 3].map((n, i) => (
                <React.Fragment key={n}>
                  <StepDot n={n} active={step === n} done={step > n} label={STEP_LABELS[i]} />
                  {i < 2 && (
                    <div className="flex-1 h-px mx-2 transition-all duration-700"
                      style={{
                        background: step > n
                          ? 'linear-gradient(90deg,#2563eb,#7c3aed)'
                          : 'rgba(255,255,255,0.1)',
                        boxShadow: step > n ? '0 0 8px rgba(99,102,241,0.5)' : 'none',
                      }} />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 animate-fade-in flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm"
                style={{background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.3)', color:'#fca5a5'}}>
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/*  Step 1  */}
              {step === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="rounded-2xl p-6"
                    style={{background:'rgba(255,255,255,0.04)',backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.1)',boxShadow:'0 8px 32px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.07)'}}>
                    <SectionHeader icon={<LockIcon />} title="Account Credentials" subtitle="You'll use these to sign in" />
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{color:'rgba(148,163,184,0.7)'}}>Full Name *</label>
                        <GlassInput>
                          <input id="name" type="text" name="name" value={form.name} onChange={handleChange}
                            placeholder="e.g. Arjun Sharma" autoComplete="name"
                            style={inputStyle}
                            onFocus={e => { e.target.style.borderColor='rgba(99,102,241,0.6)'; e.target.style.boxShadow='0 0 0 3px rgba(99,102,241,0.15)'; e.target.style.background='rgba(255,255,255,0.08)'; }}
                            onBlur={e => { e.target.style.borderColor='rgba(255,255,255,0.12)'; e.target.style.boxShadow='none'; e.target.style.background='rgba(255,255,255,0.06)'; }} />
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{color:'rgba(148,163,184,0.5)'}}><PersonIcon /></span>
                        </GlassInput>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{color:'rgba(148,163,184,0.7)'}}>Email Address *</label>
                        <GlassInput>
                          <input id="reg-email" type="email" name="email" value={form.email} onChange={handleChange}
                            placeholder="you@university.edu" autoComplete="email"
                            style={inputStyle}
                            onFocus={e => { e.target.style.borderColor='rgba(99,102,241,0.6)'; e.target.style.boxShadow='0 0 0 3px rgba(99,102,241,0.15)'; e.target.style.background='rgba(255,255,255,0.08)'; }}
                            onBlur={e => { e.target.style.borderColor='rgba(255,255,255,0.12)'; e.target.style.boxShadow='none'; e.target.style.background='rgba(255,255,255,0.06)'; }} />
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{color:'rgba(148,163,184,0.5)'}}><EmailIcon /></span>
                        </GlassInput>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{color:'rgba(148,163,184,0.7)'}}>Password *</label>
                          <GlassInput>
                            <input id="reg-password" type={showPassword ? 'text' : 'password'} name="password"
                              value={form.password} onChange={handleChange} placeholder="Min 6 chars"
                              autoComplete="new-password"
                              style={{...inputStyle, paddingRight:'44px'}}
                              onFocus={e => { e.target.style.borderColor='rgba(99,102,241,0.6)'; e.target.style.boxShadow='0 0 0 3px rgba(99,102,241,0.15)'; e.target.style.background='rgba(255,255,255,0.08)'; }}
                              onBlur={e => { e.target.style.borderColor='rgba(255,255,255,0.12)'; e.target.style.boxShadow='none'; e.target.style.background='rgba(255,255,255,0.06)'; }} />
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{color:'rgba(148,163,184,0.5)'}}><LockIcon /></span>
                            <button type="button" tabIndex={-1} onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                              style={{color:'rgba(148,163,184,0.5)'}}>
                              <EyeIcon crossed={showPassword} />
                            </button>
                          </GlassInput>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{color:'rgba(148,163,184,0.7)'}}>Confirm *</label>
                          <GlassInput>
                            <input id="confirm-password" type={showPassword ? 'text' : 'password'} name="confirmPassword"
                              value={form.confirmPassword} onChange={handleChange} placeholder="Repeat"
                              autoComplete="new-password"
                              style={inputStyle}
                              onFocus={e => { e.target.style.borderColor='rgba(99,102,241,0.6)'; e.target.style.boxShadow='0 0 0 3px rgba(99,102,241,0.15)'; e.target.style.background='rgba(255,255,255,0.08)'; }}
                              onBlur={e => { e.target.style.borderColor='rgba(255,255,255,0.12)'; e.target.style.boxShadow='none'; e.target.style.background='rgba(255,255,255,0.06)'; }} />
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2">
                              {passwordsMatch === true ? <CheckCircleIcon /> : passwordsMatch === false ? <XCircleIcon /> : <span style={{color:'rgba(148,163,184,0.5)'}}><LockIcon /></span>}
                            </span>
                          </GlassInput>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button type="button" onClick={nextStep}
                    className="w-full py-3.5 text-base font-semibold rounded-2xl flex items-center justify-center gap-2.5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                    style={{background:'linear-gradient(135deg,#2563eb,#4f46e5,#7c3aed)', color:'#fff', boxShadow:'0 8px 24px rgba(99,102,241,0.4), 0 0 0 1px rgba(255,255,255,0.08)'}}>
                    Continue to Profile <ArrowRightIcon />
                  </button>
                </div>
              )}

              {/*  Step 2  */}
              {step === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="rounded-2xl p-6"
                    style={{background:'rgba(255,255,255,0.04)',backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.1)',boxShadow:'0 8px 32px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.07)'}}>
                    <SectionHeader icon={<BookIcon />} title="Academic Profile" subtitle="Help others find you (all optional)" />
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{color:'rgba(148,163,184,0.7)'}}>College / University</label>
                        <GlassInput>
                          <input id="college" type="text" name="college" value={form.college} onChange={handleChange}
                            placeholder="e.g. IIT Delhi, NIT Trichy..."
                            style={inputStyle}
                            onFocus={e => { e.target.style.borderColor='rgba(99,102,241,0.6)'; e.target.style.boxShadow='0 0 0 3px rgba(99,102,241,0.15)'; e.target.style.background='rgba(255,255,255,0.08)'; }}
                            onBlur={e => { e.target.style.borderColor='rgba(255,255,255,0.12)'; e.target.style.boxShadow='none'; e.target.style.background='rgba(255,255,255,0.06)'; }} />
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{color:'rgba(148,163,184,0.5)'}}><CollegeIcon /></span>
                        </GlassInput>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{color:'rgba(148,163,184,0.7)'}}>Branch / Major</label>
                          <GlassInput>
                            <input id="branch" type="text" name="branch" value={form.branch} onChange={handleChange}
                              placeholder="e.g. CSE, ECE..."
                              style={inputStyle}
                              onFocus={e => { e.target.style.borderColor='rgba(99,102,241,0.6)'; e.target.style.boxShadow='0 0 0 3px rgba(99,102,241,0.15)'; e.target.style.background='rgba(255,255,255,0.08)'; }}
                              onBlur={e => { e.target.style.borderColor='rgba(255,255,255,0.12)'; e.target.style.boxShadow='none'; e.target.style.background='rgba(255,255,255,0.06)'; }} />
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{color:'rgba(148,163,184,0.5)'}}><BookIcon /></span>
                          </GlassInput>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{color:'rgba(148,163,184,0.7)'}}>Year</label>
                          <select id="year" name="year" value={form.year} onChange={handleChange}
                            style={selectStyle}
                            onFocus={e => { e.target.style.borderColor='rgba(99,102,241,0.6)'; e.target.style.boxShadow='0 0 0 3px rgba(99,102,241,0.15)'; e.target.style.background='rgba(255,255,255,0.08)'; }}
                            onBlur={e => { e.target.style.borderColor='rgba(255,255,255,0.12)'; e.target.style.boxShadow='none'; e.target.style.background='rgba(255,255,255,0.06)'; }}>
                            <option value="" style={{background:'#1e2a3a'}}>Select year</option>
                            {YEAR_OPTIONS.map((y) => <option key={y} value={y} style={{background:'#1e2a3a'}}>{y} Year</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button type="button" onClick={prevStep}
                      className="flex-1 py-3.5 font-semibold rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                      style={{background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.75)'}}>
                      <ArrowLeftIcon /> Back
                    </button>
                    <button type="button" onClick={nextStep}
                      className="flex-1 py-3.5 font-semibold rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                      style={{background:'linear-gradient(135deg,#2563eb,#4f46e5,#7c3aed)', color:'#fff', boxShadow:'0 8px 24px rgba(99,102,241,0.4)'}}>
                      Add Skills <ArrowRightIcon />
                    </button>
                  </div>
                </div>
              )}

              {/*  Step 3  */}
              {step === 3 && (
                <div className="space-y-4 animate-fade-in">
                  {/* Skills Offered */}
                  <div className="rounded-2xl p-6"
                    style={{background:'rgba(255,255,255,0.04)',backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.1)',boxShadow:'0 8px 32px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.07)'}}>
                    <SectionHeader icon={<StarIcon />} title="Skills I Can Teach" subtitle="What can you share with peers?" />
                    <div className="flex gap-2 mb-3">
                      <GlassInput>
                        <input type="text" value={skillInput.offered}
                          onChange={(e) => setSkillInput({ ...skillInput, offered: e.target.value })}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('offered'))}
                          placeholder="e.g. Python, Guitar, Figma..."
                          style={{...inputStyle, paddingRight:'16px'}}
                          onFocus={e => { e.target.style.borderColor='rgba(37,99,235,0.6)'; e.target.style.boxShadow='0 0 0 3px rgba(37,99,235,0.15)'; e.target.style.background='rgba(255,255,255,0.08)'; }}
                          onBlur={e => { e.target.style.borderColor='rgba(255,255,255,0.12)'; e.target.style.boxShadow='none'; e.target.style.background='rgba(255,255,255,0.06)'; }} />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{color:'rgba(148,163,184,0.5)'}}><PencilIcon /></span>
                      </GlassInput>
                      <button type="button" onClick={() => addSkill('offered')}
                        className="px-4 py-2.5 text-sm font-semibold rounded-xl flex-shrink-0 transition-all duration-200 hover:scale-105"
                        style={{background:'linear-gradient(135deg,#2563eb,#4f46e5)', color:'#fff', boxShadow:'0 4px 12px rgba(37,99,235,0.4)'}}>
                        + Add
                      </button>
                    </div>
                    {form.skillsOffered.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {form.skillsOffered.map((s) => <SkillTag key={s} label={s} variant="blue" onRemove={() => removeSkill('offered', s)} />)}
                      </div>
                    ) : (
                      <p className="text-xs italic" style={{color:'rgba(255,255,255,0.3)'}}>No skills added yet — type one above and hit Add or Enter</p>
                    )}
                  </div>

                  {/* Skills Wanted */}
                  <div className="rounded-2xl p-6"
                    style={{background:'rgba(255,255,255,0.04)',backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.1)',boxShadow:'0 8px 32px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.07)'}}>
                    <SectionHeader icon={<SeedIcon />} title="Skills I Want to Learn" subtitle="What are you hoping to pick up?" />
                    <div className="flex gap-2 mb-3">
                      <GlassInput>
                        <input type="text" value={skillInput.wanted}
                          onChange={(e) => setSkillInput({ ...skillInput, wanted: e.target.value })}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('wanted'))}
                          placeholder="e.g. Spanish, React, Drums..."
                          style={{...inputStyle, paddingRight:'16px'}}
                          onFocus={e => { e.target.style.borderColor='rgba(124,58,237,0.6)'; e.target.style.boxShadow='0 0 0 3px rgba(124,58,237,0.15)'; e.target.style.background='rgba(255,255,255,0.08)'; }}
                          onBlur={e => { e.target.style.borderColor='rgba(255,255,255,0.12)'; e.target.style.boxShadow='none'; e.target.style.background='rgba(255,255,255,0.06)'; }} />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{color:'rgba(148,163,184,0.5)'}}><PencilIcon /></span>
                      </GlassInput>
                      <button type="button" onClick={() => addSkill('wanted')}
                        className="px-4 py-2.5 text-sm font-semibold rounded-xl flex-shrink-0 transition-all duration-200 hover:scale-105"
                        style={{background:'linear-gradient(135deg,#7c3aed,#a21caf)', color:'#fff', boxShadow:'0 4px 12px rgba(124,58,237,0.4)'}}>
                        + Add
                      </button>
                    </div>
                    {form.skillsWanted.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {form.skillsWanted.map((s) => <SkillTag key={s} label={s} variant="purple" onRemove={() => removeSkill('wanted', s)} />)}
                      </div>
                    ) : (
                      <p className="text-xs italic" style={{color:'rgba(255,255,255,0.3)'}}>No skills added yet — type one above and hit Add or Enter</p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button type="button" onClick={prevStep}
                      className="flex-1 py-3.5 font-semibold rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                      style={{background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.75)'}}>
                      <ArrowLeftIcon /> Back
                    </button>
                    <button type="submit" disabled={loading}
                      className="flex-1 py-3.5 text-base font-semibold rounded-2xl flex items-center justify-center gap-2.5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
                      style={{background:'linear-gradient(135deg,#2563eb,#4f46e5,#7c3aed)', color:'#fff', boxShadow:'0 8px 28px rgba(99,102,241,0.5), 0 0 0 1px rgba(255,255,255,0.08)'}}>
                      {loading ? (
                        <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating account...</>
                      ) : (
                        <><RocketIcon /> Launch into Zedify</>
                      )}
                    </button>
                  </div>

                  <p className="text-center text-xs" style={{color:'rgba(255,255,255,0.3)'}}>
                    You can always add more skills later from your profile
                  </p>
                </div>
              )}
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm" style={{color:'rgba(148,163,184,0.6)'}}>
                Already have an account?{' '}
                <Link to="/login" className="font-semibold hover:text-white transition-colors"
                  style={{color:'#93c5fd'}}>
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;