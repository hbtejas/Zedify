import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { userAPI, exchangeAPI } from '../services/api';

// ─── SVG Icons ───────────────────────────────────────────────────────────────
const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const ExchangeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 16V4m0 0L3 8m4-4l4 4" /><path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
  </svg>
);
const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const ZapIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const UsersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const VideoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);
const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
const TrendingIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
  </svg>
);
const StarIcon = ({ filled }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? '#f59e0b' : 'none'} stroke="#f59e0b" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

// ─── Helpers ─────────────────────────────────────────────────────────────────
const timeAgo = (date) => {
  if (!date) return '';
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const notifCfg = {
  exchange_request:  { border: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  dot: '#3b82f6', label: 'Exchange' },
  exchange_accepted: { border: '#10b981', bg: 'rgba(16,185,129,0.12)', dot: '#10b981', label: 'Accepted' },
  exchange_rejected: { border: '#ef4444', bg: 'rgba(239,68,68,0.12)',   dot: '#ef4444', label: 'Declined' },
  exchange_declined: { border: '#ef4444', bg: 'rgba(239,68,68,0.12)',   dot: '#ef4444', label: 'Declined' },
  new_message:       { border: '#a855f7', bg: 'rgba(168,85,247,0.12)', dot: '#a855f7', label: 'Message' },
  new_follower:      { border: '#f59e0b', bg: 'rgba(245,158,11,0.12)', dot: '#f59e0b', label: 'Follower' },
  follow:            { border: '#f59e0b', bg: 'rgba(245,158,11,0.12)', dot: '#f59e0b', label: 'Follower' },
  like:              { border: '#ef4444', bg: 'rgba(239,68,68,0.12)',   dot: '#ef4444', label: 'Like' },
  comment:           { border: '#06b6d4', bg: 'rgba(6,182,212,0.12)',   dot: '#06b6d4', label: 'Comment' },
};

const statusCfg = {
  pending: { label: 'Pending', bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', Icon: ClockIcon },
  accepted: { label: 'Active', bg: 'rgba(16,185,129,0.15)', color: '#34d399', Icon: ZapIcon },
  completed: { label: 'Done', bg: 'rgba(99,102,241,0.15)', color: '#a78bfa', Icon: CheckIcon },
  declined: { label: 'Declined', bg: 'rgba(239,68,68,0.15)', color: '#f87171', Icon: CheckIcon },
};

const Skeleton = ({ w = '100%', h = 16, r = 8 }) => (
  <div style={{ width: w, height: h, borderRadius: r, background: 'rgba(255,255,255,0.06)', animation: 'skPulse 1.5s ease-in-out infinite' }} />
);

const glass = { background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 16 };
const glassDark = { background: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12 };

const Dashboard = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liveNotifs, setLiveNotifs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [notifRes, exchRes] = await Promise.all([
          userAPI.getNotifications(),
          exchangeAPI.getMyExchanges(),
        ]);
        setNotifications(notifRes.data.data || []);
        setExchanges(exchRes.data.data || []);
      } catch {}
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handler = (notif) => setLiveNotifs((prev) => [notif, ...prev]);
    socket.on('newNotification', handler);
    return () => socket.off('newNotification', handler);
  }, [socket]);

  const allNotifs = [...liveNotifs, ...notifications].slice(0, 10);
  const unreadCount = allNotifs.filter((n) => !n.read && !n.isRead).length;

  const exchangeStats = {
    total: exchanges.length,
    pending: exchanges.filter((e) => e.status === 'pending').length,
    active: exchanges.filter((e) => e.status === 'accepted').length,
    completed: exchanges.filter((e) => e.status === 'completed').length,
  };

  const handleMarkRead = async () => {
    try {
      await userAPI.markNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true, isRead: true })));
      setLiveNotifs((prev) => prev.map((n) => ({ ...n, read: true, isRead: true })));
    } catch {}
  };

  const avgRating = user?.avgRating || 0;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#060b18 0%,#0d1526 40%,#0f0c29 100%)', color: '#e2e8f0', fontFamily: 'Inter,system-ui,sans-serif', position: 'relative', overflow: 'hidden' }}>
      {/* Ambient orbs */}
      <div style={{ position: 'fixed', top: '-20%', left: '-15%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle,rgba(37,99,235,0.14) 0%,transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-20%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.12) 0%,transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <Navbar />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '24px 16px 48px' }}>

        {/* ── Welcome Banner ────────────────────────────────────────────── */}
        <div style={{ ...glass, padding: '22px 26px', marginBottom: 22, display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt={user.name} style={{ width: 54, height: 54, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(99,102,241,0.6)' }} />
            ) : (
              <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#fff', border: '2px solid rgba(99,102,241,0.5)' }}>
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
            <div>
              <p style={{ fontSize: 12, color: 'rgba(148,163,184,0.75)', margin: '0 0 2px' }}>Welcome back</p>
              <h1 style={{ fontSize: 22, fontWeight: 700, background: 'linear-gradient(90deg,#93c5fd,#c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0, lineHeight: 1.2 }}>
                {user?.name || 'User'}
              </h1>
              {user?.college && <p style={{ fontSize: 12, color: 'rgba(148,163,184,0.55)', marginTop: 2, marginBottom: 0 }}>{user.college}{user.branch ? ` · ${user.branch}` : ''}</p>}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <div style={{ display: 'flex', gap: 3 }}>{[1,2,3,4,5].map((i) => <StarIcon key={i} filled={i <= Math.round(avgRating)} />)}</div>
            <p style={{ fontSize: 12, color: 'rgba(148,163,184,0.6)', margin: 0 }}>{avgRating > 0 ? `${avgRating.toFixed(1)} avg rating` : 'No ratings yet'}</p>
          </div>
        </div>

        {/* ── Exchange Stats ───────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(175px,1fr))', gap: 14, marginBottom: 22 }}>
          {[
            { label: 'Total Exchanges', value: exchangeStats.total, color: '#93c5fd', bg: 'rgba(37,99,235,0.13)', Icon: ExchangeIcon, desc: 'all time' },
            { label: 'Pending', value: exchangeStats.pending, color: '#fbbf24', bg: 'rgba(245,158,11,0.13)', Icon: ClockIcon, desc: 'awaiting response' },
            { label: 'Active', value: exchangeStats.active, color: '#34d399', bg: 'rgba(16,185,129,0.13)', Icon: ZapIcon, desc: 'in progress' },
            { label: 'Completed', value: exchangeStats.completed, color: '#a78bfa', bg: 'rgba(124,58,237,0.13)', Icon: CheckIcon, desc: 'finished' },
          ].map(({ label, value, color, bg, Icon, desc }) => (
            <div key={label} style={{ ...glass, padding: '18px 20px', position: 'relative', overflow: 'hidden', transition: 'transform 0.2s,box-shadow 0.2s', cursor: 'default' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.4)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ position: 'absolute', top: 12, right: 14, width: 34, height: 34, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}><Icon /></div>
              {loading
                ? <div><Skeleton h={32} w="55%" /><div style={{ marginTop: 8 }} /><Skeleton h={11} w="80%" /></div>
                : <>
                    <p style={{ fontSize: 32, fontWeight: 800, color, margin: '0 0 2px', lineHeight: 1 }}>{value}</p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', margin: '4px 0 1px' }}>{label}</p>
                    <p style={{ fontSize: 11, color: 'rgba(148,163,184,0.55)', margin: 0 }}>{desc}</p>
                  </>
              }
            </div>
          ))}
        </div>

        {/* ── Quick Actions ────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 22, flexWrap: 'wrap' }}>
          {[
            { label: 'Find a Match', to: '/home', Icon: UsersIcon, gradient: 'linear-gradient(135deg,#2563eb,#4f46e5)' },
            { label: 'Live Sessions', to: '/video-sessions', Icon: VideoIcon, gradient: 'linear-gradient(135deg,#4f46e5,#7c3aed)' },
            { label: 'Settings', to: '/settings', Icon: SettingsIcon, gradient: 'linear-gradient(135deg,#7c3aed,#a21caf)' },
            { label: 'My Profile', to: user?._id ? `/profile/${user._id}` : '#', Icon: TrendingIcon, gradient: 'linear-gradient(135deg,#0891b2,#2563eb)' },
          ].map(({ label, to, Icon, gradient }) => (
            <Link key={label} to={to} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, background: gradient, color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 14px rgba(0,0,0,0.3)', transition: 'all 0.2s', border: '1px solid rgba(255,255,255,0.15)' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.45)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.3)'; }}
            ><Icon />{label}</Link>
          ))}
        </div>

        {/* ── Two-column layout ────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.35fr)', gap: 18 }}>

          {/* Notifications */}
          <div style={{ ...glass, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#93c5fd' }}><BellIcon /></span>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Notifications</h2>
                {unreadCount > 0 && <span style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99 }}>{unreadCount}</span>}
              </div>
              {unreadCount > 0 && <button onClick={handleMarkRead} style={{ fontSize: 11, color: '#818cf8', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Mark all read</button>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 390, overflowY: 'auto' }}>
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <div key={i} style={{ ...glassDark, padding: '12px 14px' }}><Skeleton h={13} w="70%" /><div style={{ marginTop: 6 }} /><Skeleton h={11} w="40%" /></div>)
                : allNotifs.length === 0
                  ? <div style={{ ...glassDark, padding: '28px 16px', textAlign: 'center', color: 'rgba(148,163,184,0.45)' }}><BellIcon /><p style={{ margin: '8px 0 0', fontSize: 13 }}>No notifications yet</p></div>
                  : allNotifs.map((n, i) => {
                      const cfg = notifCfg[n.type] || notifCfg.exchange_request;
                      const isRead = n.read || n.isRead;
                      return (
                        <div key={n._id || i} style={{ ...glassDark, padding: '11px 13px', borderLeft: `3px solid ${cfg.border}`, background: isRead ? 'rgba(0,0,0,0.2)' : cfg.bg }}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.dot, marginTop: 4, flexShrink: 0, opacity: isRead ? 0.35 : 1 }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 4, marginBottom: 2 }}>
                                <span style={{ fontSize: 10, fontWeight: 700, color: cfg.border, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{cfg.label}</span>
                                <span style={{ fontSize: 10, color: 'rgba(148,163,184,0.45)', flexShrink: 0 }}>{timeAgo(n.createdAt)}</span>
                              </div>
                              <p style={{ fontSize: 12, color: isRead ? 'rgba(148,163,184,0.6)' : '#e2e8f0', margin: 0, lineHeight: 1.4 }}>{n.message}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })
              }
            </div>
          </div>

          {/* Recent Exchanges */}
          <div style={{ ...glass, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#a78bfa' }}><ExchangeIcon /></span>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Recent Exchanges</h2>
              </div>
              <Link to="/exchanges" style={{ fontSize: 11, color: '#818cf8', textDecoration: 'none' }}>View all →</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 390, overflowY: 'auto' }}>
              {loading
                ? Array.from({ length: 3 }).map((_, i) => <div key={i} style={{ ...glassDark, padding: '14px 16px' }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><Skeleton h={13} w="50%" /><Skeleton h={13} w="18%" /></div><div style={{ display: 'flex', gap: 6 }}><Skeleton h={24} w={80} r={99} /><Skeleton h={24} w={80} r={99} /></div></div>)
                : exchanges.length === 0
                  ? <div style={{ ...glassDark, padding: '32px 16px', textAlign: 'center', color: 'rgba(148,163,184,0.45)' }}>
                      <ExchangeIcon />
                      <p style={{ margin: '8px 0 10px', fontSize: 13 }}>No exchanges yet</p>
                      <Link to="/home" style={{ display: 'inline-block', padding: '7px 16px', borderRadius: 8, background: 'linear-gradient(135deg,#2563eb,#4f46e5)', color: '#fff', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>Find a Match</Link>
                    </div>
                  : exchanges.slice(0, 6).map((ex) => {
                      const cfg = statusCfg[ex.status] || statusCfg.pending;
                      const SIcon = cfg.Icon;
                      const myId = user?._id?.toString?.() || user?._id;
                      const partner = ex.senderId?._id?.toString?.() === myId || ex.senderId === myId ? ex.receiverId : ex.senderId;
                      return (
                        <div key={ex._id} style={{ ...glassDark, padding: '13px 15px', transition: 'background 0.2s', cursor: 'default' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.28)'}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{partner?.name || 'User'}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 99, background: cfg.bg, color: cfg.color, fontSize: 11, fontWeight: 700 }}><SIcon />{cfg.label}</span>
                          </div>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {ex.skillOffered && <span style={{ padding: '3px 10px', borderRadius: 99, background: 'rgba(37,99,235,0.18)', color: '#93c5fd', fontSize: 11, fontWeight: 600, border: '1px solid rgba(37,99,235,0.28)' }}>Offers: {ex.skillOffered}</span>}
                            {ex.skillRequested && <span style={{ padding: '3px 10px', borderRadius: 99, background: 'rgba(124,58,237,0.18)', color: '#c4b5fd', fontSize: 11, fontWeight: 600, border: '1px solid rgba(124,58,237,0.28)' }}>Wants: {ex.skillRequested}</span>}
                          </div>
                          {ex.message && <p style={{ fontSize: 11, color: 'rgba(148,163,184,0.5)', margin: '6px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>"{ex.message}"</p>}
                        </div>
                      );
                    })
              }
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes skPulse { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(99,102,241,0.4);border-radius:99px}
      `}</style>
    </div>
  );
};

export default Dashboard;
