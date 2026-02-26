import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { userAPI } from '../services/api';

const GLASS = { background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 16 };

const NAV = [
  { to: '/feed',      label: 'Feed',      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
  { to: '/exchange',  label: 'Exchanges', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" /></svg> },
  { to: '/video',     label: 'Sessions',  icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M4 8h8a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4a2 2 0 012-2z" /></svg> },
  { to: '/chat',      label: 'Messages',  icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg> },
  { to: '/dashboard', label: 'Dashboard', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></svg> },
];

const Sidebar = () => {
  const { user } = useAuth();
  const { isUserOnline } = useSocket();
  const { pathname } = useLocation();
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    userAPI.getSuggestions().then(({ data }) => setSuggestions(data.data.slice(0, 5))).catch(() => {});
  }, []);

  const handleFollow = async (userId) => {
    try {
      await userAPI.followUser(userId);
      setSuggestions((prev) => prev.filter((u) => u._id !== userId));
    } catch {}
  };

  return (
    <aside className="w-64 flex-shrink-0 hidden lg:flex flex-col gap-4">

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Profile card Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <div style={{ ...GLASS, overflow: 'hidden' }}>
        {/* Gradient banner */}
        <div className="h-16 relative" style={{ background: 'linear-gradient(135deg,#2563eb,#4f46e5,#7c3aed)' }}>
          <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 70% 50%,rgba(255,255,255,0.15) 0%,transparent 60%)' }} />
        </div>
        <div className="px-4 pb-4">
          <div className="-mt-6 mb-3">
            <Link to={`/profile/${user?._id}`} className="inline-block relative">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt={user.name}
                  className="w-14 h-14 rounded-xl object-cover"
                  style={{ border: '2.5px solid rgba(13,21,38,0.9)', boxShadow: '0 0 0 2px rgba(99,102,241,0.4)' }} />
              ) : (
                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl font-bold"
                  style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', border: '2.5px solid rgba(13,21,38,0.9)', boxShadow: '0 0 0 2px rgba(99,102,241,0.4)' }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </Link>
          </div>
          <Link to={`/profile/${user?._id}`} className="block hover:opacity-80 transition-opacity">
            <p className="font-bold text-white text-sm leading-tight">{user?.name}</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(148,163,184,0.6)' }}>{user?.college || 'Student'}</p>
            {user?.branch && <p className="text-xs" style={{ color: 'rgba(148,163,184,0.45)' }}>{user.branch}{user?.year ? ` · Year ${user.year}` : ''}</p>}
          </Link>

          {/* Stats */}
          <div className="flex gap-0 mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            {[
              { label: 'Followers', value: user?.followers?.length || 0 },
              { label: 'Following', value: user?.following?.length || 0 },
              { label: 'Skills',    value: (user?.skillsOffered?.length || 0) + (user?.skillsWanted?.length || 0) },
            ].map((s, i) => (
              <div key={s.label} className="flex-1 text-center" style={{ borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
                <p className="font-bold text-white text-sm">{s.value}</p>
                <p className="text-xs" style={{ color: 'rgba(148,163,184,0.5)' }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Skills */}
          {user?.skillsOffered?.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'rgba(147,197,253,0.7)', letterSpacing: '0.06em' }}>I Offer</p>
              <div className="flex flex-wrap gap-1">
                {user.skillsOffered.slice(0, 4).map((skill) => (
                  <span key={skill} className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: 'rgba(37,99,235,0.2)', border: '1px solid rgba(37,99,235,0.3)', color: '#93c5fd' }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          {user?.skillsWanted?.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'rgba(196,181,253,0.7)', letterSpacing: '0.06em' }}>I Want</p>
              <div className="flex flex-wrap gap-1">
                {user.skillsWanted.slice(0, 4).map((skill) => (
                  <span key={skill} className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)', color: '#c4b5fd' }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Navigation Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <div style={{ ...GLASS, padding: 8 }}>
        <nav className="space-y-0.5">
          {NAV.map(({ to, label, icon }) => {
            const active = pathname === to || pathname.startsWith(to + '/');
            return (
              <Link key={to} to={to}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
                style={active
                  ? { background: 'rgba(99,102,241,0.18)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.25)' }
                  : { color: 'rgba(148,163,184,0.7)', border: '1px solid transparent' }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
                <span style={{ color: active ? '#818cf8' : 'rgba(148,163,184,0.5)' }}>{icon}</span>
                {label}
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#818cf8' }} />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Suggestions Ã¢â€â‚¬Ã¢â€â‚¬ */}
      {suggestions.length > 0 && (
        <div style={{ ...GLASS, padding: 16 }}>
          <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'rgba(148,163,184,0.55)', letterSpacing: '0.07em' }}>People to Follow</h3>
          <div className="space-y-3">
            {suggestions.map((s) => (
              <div key={s._id} className="flex items-center gap-2.5">
                <div className="relative flex-shrink-0">
                  {s.profilePicture ? (
                    <img src={s.profilePicture} alt={s.name} className="w-9 h-9 rounded-xl object-cover"
                      style={{ border: '1px solid rgba(255,255,255,0.12)' }} />
                  ) : (
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-semibold text-sm"
                      style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}>
                      {s.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {isUserOnline(s._id) && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400"
                      style={{ border: '2px solid rgba(6,11,24,0.9)' }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/profile/${s._id}`}
                    className="text-sm font-semibold text-white truncate block hover:text-indigo-300 transition-colors">
                    {s.name}
                  </Link>
                  <p className="text-xs truncate" style={{ color: 'rgba(148,163,184,0.5)' }}>
                    {s.skillsOffered?.[0] || s.college || 'Student'}
                  </p>
                </div>
                <button onClick={() => handleFollow(s._id)}
                  className="flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-lg transition-all duration-150 hover:scale-105 active:scale-95"
                  style={{ background: 'rgba(99,102,241,0.18)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.35)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.18)'; }}>
                  Follow
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-center text-xs pb-2" style={{ color: 'rgba(148,163,184,0.3)' }}>
        Zedify · <span style={{ color: 'rgba(129,140,248,0.6)' }}>Beta</span>
      </p>
    </aside>
  );
};

export default Sidebar;

