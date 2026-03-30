import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { ZedifyLogo } from '../pages/LandingPage';

/* ── Icons ── */
const I = {
  home:     <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  network:  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="9" cy="7" r="4"/><path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/><path strokeLinecap="round" strokeLinejoin="round" d="M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.87"/></svg>,
  chat:     <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5-1-5z"/></svg>,
  swap:     <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>,
  bell:     <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>,
  profile:  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0"/></svg>,
  edit:     <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"/></svg>,
  dash:     <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  settings: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  logout:   <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"/></svg>,
  chevron:  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>,
};

const NAV_LINKS = [
  { path: '/feed',     label: 'Feed',    icon: I.home },
  { path: '/network',  label: 'Connect', icon: I.network },
  { path: '/chat',     label: 'Chat',    icon: I.chat },
  { path: '/exchange', label: 'Swap',    icon: I.swap },
];

const Avatar = ({ user, size = 32 }) => {
  const s = { width: size, height: size, minWidth: size, minHeight: size };
  return user?.profilePicture ? (
    <img src={user.profilePicture} alt={user.name} style={{ ...s, borderRadius: '50%', objectFit: 'cover' }} />
  ) : (
    <div style={{ ...s, borderRadius: '50%', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: size * 0.38 }}>
      {user?.name?.charAt(0).toUpperCase() || '?'}
    </div>
  );
};

const NavLink = ({ to, label, icon, active }) => (
  <Link
    to={to}
    style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '7px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600,
      textDecoration: 'none', transition: 'all 0.18s ease',
      color: active ? '#a5b4fc' : 'rgba(148,163,184,0.75)',
      background: active ? 'rgba(99,102,241,0.16)' : 'transparent',
      border: active ? '1px solid rgba(99,102,241,0.25)' : '1px solid transparent',
    }}
    onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#e2e8f0'; } }}
    onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(148,163,184,0.75)'; } }}
  >
    <span style={{ color: active ? '#818cf8' : 'inherit', display: 'flex' }}>{icon}</span>
    {label}
  </Link>
);

const Navbar = () => {
  const { user, logout } = useAuth();
  const { unreadCount, clearUnreadCount } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleLogout = () => { setMenuOpen(false); logout(); navigate('/login'); };
  const isActive = (p) => location.pathname === p || location.pathname.startsWith(p + '/');

  return (
    <>
      {/* ── Top Bar ── */}
      <nav className="glass-nav sticky top-0 z-50">
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px', height: 62, display: 'flex', alignItems: 'center', gap: 16 }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
            <ZedifyLogo size={30} />
            <div className="hidden sm:block">
              <div style={{ fontWeight: 900, fontSize: 16, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1.1 }}>Zedify</div>
              <div style={{ fontSize: 9, color: '#818cf8', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Skill Exchange</div>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex" style={{ flex: 1, justifyContent: 'center' }}>
            <div style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 4 }}>
              {NAV_LINKS.map(l => <NavLink key={l.path} {...l} active={isActive(l.path)} />)}
            </div>
          </div>

          {/* Right Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
            {/* Bell */}
            <Link
              to="/dashboard"
              onClick={clearUnreadCount}
              style={{ position: 'relative', padding: 8, borderRadius: 10, color: 'rgba(148,163,184,0.7)', textDecoration: 'none', display: 'flex', alignItems: 'center', transition: 'all 0.18s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#e2e8f0'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(148,163,184,0.7)'; }}
            >
              {I.bell}
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: 5, right: 5, width: 18, height: 18, borderRadius: '50%', background: 'linear-gradient(135deg,#dc2626,#ef4444)', color: '#fff', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 8px rgba(239,68,68,0.6)' }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* Profile Dropdown */}
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px 5px 5px',
                  borderRadius: 12, background: 'transparent', border: '1px solid rgba(255,255,255,0.08)',
                  cursor: 'pointer', transition: 'all 0.18s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'; }}
                onMouseLeave={e => { if (!menuOpen) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; } }}
              >
                <div style={{ position: 'relative' }}>
                  <Avatar user={user} size={32} />
                  <span className="status-online" style={{ position: 'absolute', bottom: 0, right: 0, border: '2px solid rgba(5,8,20,0.9)' }} />
                </div>
                <span className="hidden sm:block" style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.name?.split(' ')[0]}
                </span>
                <span style={{ color: 'rgba(148,163,184,0.45)', transition: 'transform 0.2s', transform: menuOpen ? 'rotate(180deg)' : '' }}>{I.chevron}</span>
              </button>

              {menuOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 220,
                  background: 'rgba(8,13,30,0.98)', border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 16, padding: '6px', zIndex: 100,
                  boxShadow: '0 20px 60px rgba(0,0,0,0.7)', animation: 'scaleIn 0.15s ease-out',
                }}>
                  {/* User Info */}
                  <div style={{ padding: '10px 12px 12px', marginBottom: 4, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar user={user} size={36} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
                        <div style={{ fontSize: 11, color: 'rgba(148,163,184,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
                      </div>
                    </div>
                    {user?.college && (
                      <div style={{ marginTop: 8 }}>
                        <span className="badge-brand" style={{ fontSize: 10 }}>{user.college}</span>
                      </div>
                    )}
                  </div>

                  {/* Menu items */}
                  {[
                    { to: `/profile/${user?._id}`, icon: I.profile, label: 'My Profile' },
                    { to: '/profile/edit',          icon: I.edit,    label: 'Edit Profile' },
                    { to: '/dashboard',             icon: I.dash,    label: 'Dashboard' },
                    { to: '/settings',              icon: I.settings,label: 'Settings' },
                  ].map(({ to, icon, label }) => (
                    <Link key={to} to={to} onClick={() => setMenuOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, fontSize: 13, color: 'rgba(226,232,240,0.8)', textDecoration: 'none', transition: 'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.12)'; e.currentTarget.style.color = '#a5b4fc'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(226,232,240,0.8)'; }}
                    >
                      <span style={{ opacity: 0.65, display: 'flex' }}>{icon}</span>
                      <span style={{ fontWeight: 500 }}>{label}</span>
                    </Link>
                  ))}

                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 4, paddingTop: 4 }}>
                    <button onClick={handleLogout}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, fontSize: 13, color: 'rgba(248,113,113,0.85)', width: '100%', background: 'none', border: 'none', cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.10)'; e.currentTarget.style.color = '#fca5a5'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(248,113,113,0.85)'; }}
                    >
                      <span style={{ display: 'flex' }}>{I.logout}</span>
                      <span style={{ fontWeight: 500 }}>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="md:hidden" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(5,8,20,0.97)', backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        display: 'flex',
      }}>
        {NAV_LINKS.map(l => {
          const active = isActive(l.path);
          return (
            <Link key={l.path} to={l.path} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0 12px',
              textDecoration: 'none', position: 'relative',
              color: active ? '#a5b4fc' : 'rgba(148,163,184,0.45)',
              fontSize: 10, fontWeight: 600, gap: 3, transition: 'color 0.15s',
            }}>
              {active && (
                <span style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 32, height: 2, borderRadius: 1, background: 'linear-gradient(90deg,transparent,#818cf8,transparent)' }} />
              )}
              <span style={{ display: 'flex', transform: active ? 'scale(1.12)' : 'scale(1)', transition: 'transform 0.15s', filter: active ? 'drop-shadow(0 0 6px rgba(129,140,248,0.8))' : 'none' }}>
                {l.icon}
              </span>
              <span>{l.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};

export default Navbar;
