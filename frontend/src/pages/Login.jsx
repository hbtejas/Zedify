import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FeatureItem = ({ icon, title, desc }) => (
  <div className="flex items-start gap-3">
    <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-lg flex-shrink-0">
      {icon}
    </div>
    <div>
      <p className="font-semibold text-white text-sm">{title}</p>
      <p className="text-white/70 text-xs mt-0.5">{desc}</p>
    </div>
  </div>
);

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('Please enter your email and password');
      return;
    }
    setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);
    if (result.success) {
      navigate('/feed');
    } else {
      setError(result.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left branding panel ──────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 bg-auth-gradient flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-black/10 rounded-full blur-3xl" />

        {/* Logo */}
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-primary-600 font-black text-lg">S²</span>
            </div>
            <span className="text-white font-bold text-xl">SkillSwap Campus</span>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative space-y-8">
          <div>
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
              Learn from peers,<br />
              <span className="text-white/80">teach what you know.</span>
            </h1>
            <p className="text-white/70 mt-4 text-lg leading-relaxed">
              The student skill exchange platform that connects you with campus talent.
            </p>
          </div>

          <div className="space-y-4">
            <FeatureItem icon="🎓" title="Peer-to-Peer Learning" desc="Exchange skills directly with fellow students" />
            <FeatureItem icon="💬" title="Real-Time Chat" desc="Message and collaborate instantly" />
            <FeatureItem icon="📹" title="Video Sessions" desc="Host and join live skill workshops" />
            <FeatureItem icon="🔄" title="Skill Exchange" desc="Propose and accept skill-swap deals" />
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative">
          <p className="text-white/60 text-sm italic">
            "The best way to learn is to teach." — Frank Oppenheimer
          </p>
        </div>
      </div>

      {/* ── Right login form ─────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-surface-50">
        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow">
              <span className="text-white font-black text-sm">S²</span>
            </div>
            <span className="text-gray-900 font-bold text-lg">SkillSwap Campus</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Welcome back 👋</h2>
            <p className="text-gray-500 mt-1.5">Sign in to continue to your campus feed</p>
          </div>

          {/* Error alert */}
          {error && (
            <div className="alert-error mb-6">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="input-label" htmlFor="email">Email address</label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@university.edu"
                  className="input-field pl-11"
                  autoComplete="email"
                  required
                />
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base">✉️</span>
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="input-label mb-0" htmlFor="password">Password</label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input-field pl-11 pr-11"
                  autoComplete="current-password"
                  required
                />
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base">🔒</span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign In →'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              New to SkillSwap?{' '}
              <Link to="/register" className="text-primary-600 font-semibold hover:text-primary-700 transition-colors">
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
