import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { userAPI } from '../services/api';

const NAV = [
  { to: '/feed',      label: 'Feed',      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
  { to: '/network',   label: 'Connect',   icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="9" cy="7" r="4"/><path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.87"/></svg> },
  { to: '/exchange',  label: 'Exchanges', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" /></svg> },
  { to: '/video',     label: 'Sessions',  icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M4 8h8a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4a2 2 0 012-2z" /></svg> },
  { to: '/chat',      label: 'Messages',  icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg> },
  { to: '/dashboard', label: 'Dashboard', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
];

const Avatar = ({ user, size = 52 }) => {
  const s = { width: size, height: size, borderRadius: 14, flexShrink: 0 };
  return user?.profilePicture
    ? <img src={user.profilePicture} alt={user.name} style={{ ...s, objectFit: 'cover', border: '2px solid rgba(99,102,241,0.35)' }} />
    : <div style={{ ...s, background: 'linear-gradient(135deg,#4f46e5,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: size * 0.38, border: '2px solid rgba(99,102,241,0.35)' }}>{user?.name?.charAt(0).toUpperCase()}</div>;
};

const SuggestionAvatar = ({ user, size = 36 }) => {
  const colors = ['linear-gradient(135deg,#6366f1,#a855f7)', 'linear-gradient(135deg,#0ea5e9,#6366f1)', 'linear-gradient(135deg,#10b981,#06b6d4)', 'linear-gradient(135deg,#f59e0b,#ec4899)'];
  const bg = colors[user?.name?.charCodeAt(0) % colors.length];
  const s = { width: size, height: size, borderRadius: 10, flexShrink: 0 };
  return user?.profilePicture
    ? <img src={user.profilePicture} alt={user.name} style={{ ...s, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} />
    : <div style={{ ...s, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: size * 0.38 }}>{user?.name?.charAt(0).toUpperCase()}</div>;
};

const card = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 18,
  overflow: 'hidden',
};

const Sidebar = () => {
  const { user } = useAuth();
  const { isUserOnline } = useSocket();
  const { pathname } = useLocation();
  const [suggestions, setSuggestions] = useState([]);
  const [followed, setFollowed] = useState({});

  useEffect(() => {
    userAPI.getSuggestions()
      .then(({ data }) => setSuggestions(data.data.slice(0, 5)))
      .catch(() => {});
  }, []);

  const handleFollow = async (userId) => {
    setFollowed(prev => ({ ...prev, [userId]: true }));
    try { await userAPI.followUser(userId); } catch {}
    setTimeout(() => setSuggestions(prev => prev.filter(u => u._id !== userId)), 600);
  };

  return (
    <aside style={{ width: 256, flexShrink: 0, display: 'none', flexDirection: 'column', gap: 12 }} className="lg:flex">

      {/* ── Profile Card ── */}
      <div style={card}>
        {/* Banner */}
        <div style={{ height: 60, background: 'linear-gradient(135deg,#312e81,#4f46e5,#7c3aed)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-30%', right: '-10%', width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(20px)' }} />
        </div>

        <div style={{ padding: '0 16px 16px' }}>
          {/* Avatar overlapping the banner */}
          <div style={{ marginTop: -28, marginBottom: 10 }}>
            <Link to={`/profile/${user?._id}`}>
              <Avatar user={user} size={52} />
            </Link>
          </div>

          {/* Name / college */}
          <Link to={`/profile/${user?._id}`} style={{ display: 'block', textDecoration: 'none', marginBottom: 12 }}>
            <p style={{ fontWeight: 700, color: '#fff', fontSize: 14, lineHeight: 1.3 }}>{user?.name}</p>
            <p style={{ fontSize: 12, color: 'rgba(148,163,184,0.55)', marginTop: 2 }}>{user?.college || 'Student'}</p>
            {user?.branch && <p style={{ fontSize: 11, color: 'rgba(148,163,184,0.4)', marginTop: 1 }}>{user.branch}{user?.year ? ` · Year ${user.year}` : ''}</p>}
          </Link>

          {/* Stats */}
          <div style={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 12, marginBottom: 12 }}>
            {[
              { label: 'Followers', value: user?.followers?.length || 0 },
              { label: 'Following', value: user?.following?.length || 0 },
              { label: 'Skills',    value: (user?.skillsOffered?.length || 0) + (user?.skillsWanted?.length || 0) },
            ].map((s, i) => (
              <div key={s.label} style={{ flex: 1, textAlign: 'center', borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
                <p style={{ fontWeight: 700, color: '#fff', fontSize: 15, lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: 10, color: 'rgba(148,163,184,0.45)', marginTop: 3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Skills offered */}
          {user?.skillsOffered?.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(147,197,253,0.65)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>I Offer</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {user.skillsOffered.slice(0, 4).map(skill => (
                  <span key={skill} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 999, background: 'rgba(37,99,235,0.18)', border: '1px solid rgba(37,99,235,0.3)', color: '#93c5fd', fontWeight: 600 }}>{skill}</span>
                ))}
              </div>
            </div>
          )}

          {/* Skills wanted */}
          {user?.skillsWanted?.length > 0 && (
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(196,181,253,0.65)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>I Want</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {user.skillsWanted.slice(0, 4).map(skill => (
                  <span key={skill} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 999, background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(124,58,237,0.3)', color: '#c4b5fd', fontWeight: 600 }}>{skill}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Navigation ── */}
      <div style={{ ...card, padding: 8 }}>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(({ to, label, icon }) => {
            const active = pathname === to || pathname.startsWith(to + '/');
            return (
              <Link key={to} to={to}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 12,
                  textDecoration: 'none', fontSize: 13, fontWeight: 600, transition: 'all 0.15s',
                  color: active ? '#a5b4fc' : 'rgba(148,163,184,0.7)',
                  background: active ? 'rgba(99,102,241,0.16)' : 'transparent',
                  border: active ? '1px solid rgba(99,102,241,0.25)' : '1px solid transparent',
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#e2e8f0'; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(148,163,184,0.7)'; } }}>
                <span style={{ display: 'flex', color: active ? '#818cf8' : 'rgba(148,163,184,0.45)' }}>{icon}</span>
                <span>{label}</span>
                {active && <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#818cf8', boxShadow: '0 0 6px rgba(129,140,248,0.8)' }} />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ── People to Follow ── */}
      {suggestions.length > 0 && (
        <div style={{ ...card, padding: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(148,163,184,0.45)', letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 14 }}>People to Follow</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {suggestions.map(s => (
              <div key={s._id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <SuggestionAvatar user={s} size={36} />
                  {isUserOnline(s._id) && (
                    <span style={{ position: 'absolute', bottom: -1, right: -1, width: 10, height: 10, borderRadius: '50%', background: '#4ade80', border: '2px solid #050814', boxShadow: '0 0 6px rgba(74,222,128,0.7)' }} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link to={`/profile/${s._id}`} style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#fff', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#a5b4fc'}
                    onMouseLeave={e => e.currentTarget.style.color = '#fff'}>
                    {s.name}
                  </Link>
                  <p style={{ fontSize: 11, color: 'rgba(148,163,184,0.45)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }}>
                    {s.skillsOffered?.[0] || s.college || 'Student'}
                  </p>
                </div>
                <button onClick={() => handleFollow(s._id)} disabled={followed[s._id]}
                  style={{
                    flexShrink: 0, fontSize: 11, fontWeight: 700, padding: '5px 10px', borderRadius: 8, cursor: 'pointer',
                    background: followed[s._id] ? 'rgba(34,197,94,0.15)' : 'rgba(99,102,241,0.16)',
                    border: followed[s._id] ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(99,102,241,0.3)',
                    color: followed[s._id] ? '#86efac' : '#a5b4fc',
                    transition: 'all 0.2s', fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => { if (!followed[s._id]) e.currentTarget.style.background = 'rgba(99,102,241,0.3)'; }}
                  onMouseLeave={e => { if (!followed[s._id]) e.currentTarget.style.background = 'rgba(99,102,241,0.16)'; }}>
                  {followed[s._id] ? '✓' : 'Follow'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(148,163,184,0.2)', paddingBottom: 8 }}>
        Zedify · <span style={{ color: 'rgba(129,140,248,0.5)' }}>Beta</span>
      </p>
    </aside>
  );
};

export default Sidebar;
