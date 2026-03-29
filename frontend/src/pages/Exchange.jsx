import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { exchangeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   bg: 'rgba(245,158,11,0.15)',  color: '#fbbf24', border: 'rgba(245,158,11,0.30)',  dot: '#f59e0b' },
  accepted:  { label: 'Active',    bg: 'rgba(16,185,129,0.15)',  color: '#34d399', border: 'rgba(16,185,129,0.30)',  dot: '#10b981' },
  rejected:  { label: 'Declined',  bg: 'rgba(239,68,68,0.15)',   color: '#f87171', border: 'rgba(239,68,68,0.30)',   dot: '#ef4444' },
  completed: { label: 'Completed', bg: 'rgba(99,102,241,0.15)',  color: '#a5b4fc', border: 'rgba(99,102,241,0.30)', dot: '#818cf8' },
};

const PAGE_STYLE = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg,#060b18 0%,#0d1526 40%,#0f0c29 100%)',
  paddingBottom: '5rem',
};

const Exchange = () => {
  const { user } = useAuth();
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await exchangeAPI.getMyExchanges();
        setExchanges(data.data);
      } catch {}
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleRespond = async (exchangeId, action) => {
    try {
      const { data } = await exchangeAPI.respondExchange(exchangeId, action);
      setExchanges((prev) => prev.map((e) => (e._id === exchangeId ? data.data : e)));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const handleComplete = async (id) => {
    try {
      await exchangeAPI.completeExchange(id);
      setExchanges((prev) => prev.map((e) => (e._id === id ? { ...e, status: 'completed' } : e)));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const filtered = filter === 'all' ? exchanges : exchanges.filter((e) => e.status === filter);
  const counts = {
    all: exchanges.length,
    pending: exchanges.filter((e) => e.status === 'pending').length,
    accepted: exchanges.filter((e) => e.status === 'accepted').length,
    completed: exchanges.filter((e) => e.status === 'completed').length,
  };

  return (
    <div style={PAGE_STYLE}>
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-10" style={{ background: 'radial-gradient(circle,#4f46e5,transparent)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-40 right-10 w-80 h-80 rounded-full opacity-10" style={{ background: 'radial-gradient(circle,#7c3aed,transparent)', filter: 'blur(70px)' }} />
      </div>

      <Navbar />

      <div className="relative max-w-3xl mx-auto px-4 py-8" style={{ zIndex: 1 }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Skill Exchanges</h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(148,163,184,0.6)' }}>
              Manage your skill swap agreements
            </p>
          </div>
          <Link
            to="/feed"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
            style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.25)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.25)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.15)'; }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            Find Students
          </Link>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { key: 'all',      label: 'Total',     color: '#93c5fd' },
            { key: 'pending',  label: 'Pending',   color: '#fbbf24' },
            { key: 'accepted', label: 'Active',    color: '#34d399' },
            { key: 'completed',label: 'Done',      color: '#a5b4fc' },
          ].map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className="rounded-2xl p-3 text-center transition-all duration-200"
              style={{
                background: filter === key ? `rgba(${color === '#93c5fd' ? '59,130,246' : color === '#fbbf24' ? '245,158,11' : color === '#34d399' ? '16,185,129' : '99,102,241'},0.18)` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${filter === key ? color + '55' : 'rgba(255,255,255,0.08)'}`,
              }}
            >
              <p className="text-xl font-bold" style={{ color }}>{counts[key]}</p>
              <p className="text-xs font-medium mt-0.5" style={{ color: 'rgba(148,163,184,0.7)' }}>{label}</p>
            </button>
          ))}
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {[['all', 'All Exchanges'], ['pending', 'Pending'], ['accepted', 'Active'], ['completed', 'Completed']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
              style={filter === val
                ? { background: 'rgba(99,102,241,0.25)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.40)' }
                : { background: 'rgba(255,255,255,0.04)', color: 'rgba(148,163,184,0.7)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin mb-3" style={{ borderColor: 'rgba(99,102,241,0.4)', borderTopColor: '#818cf8' }} />
            <p className="text-sm" style={{ color: 'rgba(148,163,184,0.5)' }}>Loading exchanges…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl p-16 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="text-5xl mb-4">🔄</div>
            <p className="font-semibold text-white mb-1">No exchanges {filter !== 'all' ? `with status "${filter}"` : 'yet'}</p>
            <p className="text-sm" style={{ color: 'rgba(148,163,184,0.5)' }}>
              {filter === 'all' ? "Visit a student's profile to send your first exchange request!" : 'Try a different filter'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((ex) => {
              const isSender = ex.senderId?._id === user._id;
              const otherUser = isSender ? ex.receiverId : ex.senderId;
              const cfg = STATUS_CONFIG[ex.status] || STATUS_CONFIG.pending;

              return (
                <div
                  key={ex._id}
                  className="rounded-2xl p-5 transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.25)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Link to={`/profile/${otherUser?._id}`} className="relative flex-shrink-0">
                        {otherUser?.profilePicture ? (
                          <img src={otherUser.profilePicture} alt={otherUser.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
                            {otherUser?.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </Link>
                      <div>
                        <Link to={`/profile/${otherUser?._id}`} className="font-semibold text-white text-sm hover:text-indigo-300 transition-colors">
                          {otherUser?.name}
                        </Link>
                        <p className="text-xs mt-0.5" style={{ color: 'rgba(148,163,184,0.55)' }}>
                          {isSender ? 'You sent this' : 'Sent to you'} · {new Date(ex.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <span
                      className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot, boxShadow: `0 0 4px ${cfg.dot}` }} />
                      {cfg.label}
                    </span>
                  </div>

                  {/* Skills */}
                  <div className="flex items-center gap-2 mt-4">
                    <span className="skill-tag-blue text-sm px-3 py-1.5 rounded-full font-semibold">{ex.skillOffered}</span>
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" style={{ color: 'rgba(148,163,184,0.4)' }}><path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" /></svg>
                    <span className="skill-tag-purple text-sm px-3 py-1.5 rounded-full font-semibold">{ex.skillRequested}</span>
                  </div>

                  {ex.message && (
                    <div className="mt-3 px-4 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <p className="text-sm italic" style={{ color: 'rgba(148,163,184,0.7)' }}>"{ex.message}"</p>
                    </div>
                  )}

                  {/* Actions */}
                  {(!isSender && ex.status === 'pending') && (
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleRespond(ex._id, 'accepted')}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
                        style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.30)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(16,185,129,0.25)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(16,185,129,0.15)'; }}
                      >
                        ✓ Accept Exchange
                      </button>
                      <button
                        onClick={() => handleRespond(ex._id, 'rejected')}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
                        style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.22)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; }}
                      >
                        ✕ Decline
                      </button>
                    </div>
                  )}

                  {ex.status === 'accepted' && (
                    <div className="flex gap-2 mt-4">
                      <Link
                        to={`/chat/${otherUser?._id}`}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold text-center transition-all duration-200"
                        style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.25)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.25)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.15)'; }}
                      >
                        💬 Open Chat
                      </Link>
                      <button
                        onClick={() => handleComplete(ex._id)}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
                        style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.3),rgba(124,58,237,0.3))', color: '#c4b5fd', border: '1px solid rgba(124,58,237,0.35)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg,rgba(99,102,241,0.45),rgba(124,58,237,0.45))'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg,rgba(99,102,241,0.3),rgba(124,58,237,0.3))'; }}
                      >
                        🏆 Mark Complete
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Exchange;
