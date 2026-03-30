import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { exchangeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

/* ── Icons ── */
const I = {
  find:  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>,
  swap:  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>,
  check: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>,
  x:     <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>,
  chat:  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>,
  done:  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>,
};

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   c: 'badge-amber' },
  accepted:  { label: 'Active',    c: 'badge-green' },
  rejected:  { label: 'Declined',  c: 'badge-red' },
  completed: { label: 'Completed', c: 'badge-purple' },
};

const Exchange = () => {
  const { user } = useAuth();
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetch = async () => {
      try { const { data } = await exchangeAPI.getMyExchanges(); setExchanges(data.data); } catch {}
      setLoading(false);
    };
    fetch();
  }, []);

  const handleRespond = async (id, action) => {
    try {
      const { data } = await exchangeAPI.respondExchange(id, action);
      setExchanges(p => p.map(e => e._id === id ? data.data : e));
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  const handleComplete = async (id) => {
    try {
      await exchangeAPI.completeExchange(id);
      setExchanges(p => p.map(e => e._id === id ? { ...e, status: 'completed' } : e));
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  const filtered = filter === 'all' ? exchanges : exchanges.filter(e => e.status === filter);
  const counts = {
    all: exchanges.length,
    pending: exchanges.filter(e => e.status === 'pending').length,
    accepted: exchanges.filter(e => e.status === 'accepted').length,
    completed: exchanges.filter(e => e.status === 'completed').length,
  };

  return (
    <div className="bg-app min-h-screen">
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute top-20 left-10 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle,rgba(99,102,241,0.1) 0%,transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-40 right-10 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle,rgba(168,85,247,0.1) 0%,transparent 70%)', filter: 'blur(70px)' }} />
      </div>

      <Navbar />

      <div className="page-wrapper relative z-10" style={{ maxWidth: 800 }}>
        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', marginBottom: 4, fontFamily: "'Space Grotesk',sans-serif" }}>Skill Exchanges</h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Manage your skill swap agreements</p>
          </div>
          <Link to="/network" className="btn-secondary">
            <span className="flex">{I.find}</span> Find Students
          </Link>
        </div>

        {/* ── Summary Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { key: 'all',       label: 'Total',    color: '#93c5fd', bg: 'rgba(59,130,246,0.15)' },
            { key: 'pending',   label: 'Pending',  color: '#fbbf24', bg: 'rgba(245,158,11,0.15)' },
            { key: 'accepted',  label: 'Active',   color: '#34d399', bg: 'rgba(16,185,129,0.15)' },
            { key: 'completed', label: 'Done',     color: '#a5b4fc', bg: 'rgba(99,102,241,0.15)' },
          ].map(({ key, label, color, bg }) => (
            <button key={key} onClick={() => setFilter(key)} className="card card-hover" style={{
              padding: '16px 12px', textAlign: 'center', transition: 'all 0.2s',
              background: filter === key ? bg : 'var(--surface)', border: filter === key ? `1px solid ${color}55` : '1px solid var(--border)',
            }}>
              <p style={{ fontSize: 24, fontWeight: 900, color, lineHeight: 1 }}>{counts[key]}</p>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 8 }}>{label}</p>
            </button>
          ))}
        </div>

        {/* ── Filter Pills ── */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 16, marginBottom: 8 }}>
          {[['all', 'All Exchanges'], ['pending', 'Pending'], ['accepted', 'Active'], ['completed', 'Completed']].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)} className={`skill-tag flex-shrink-0 ${filter === val ? 'badge-brand' : ''}`} style={{
              fontSize: 13, padding: '8px 16px', background: filter === val ? '' : 'var(--surface)', color: filter === val ? '' : 'var(--text-secondary)', border: filter === val ? '' : '1px solid var(--border)'
            }}>
              {label}
            </button>
          ))}
        </div>

        {/* ── List ── */}
        {loading ? (
          <div style={{ padding: '80px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div className="spinner-md border-t-brand" />
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading exchanges...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ padding: '80px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔄</div>
            <p style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 8 }}>No exchanges {filter !== 'all' ? `in ${filter}` : 'yet'}</p>
            <p style={{ color: 'var(--text-secondary)' }}>{filter === 'all' ? "Visit a student's profile to send your first exchange request!" : 'Try a different filter'}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filtered.map(ex => {
              const isSender = ex.senderId?._id === user._id;
              const other = isSender ? ex.receiverId : ex.senderId;
              const cfg = STATUS_CONFIG[ex.status] || STATUS_CONFIG.pending;

              return (
                <div key={ex._id} className="card card-hover" style={{ padding: 20 }}>
                  
                  {/* Top */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Link to={`/profile/${other?._id}`} style={{ textDecoration: 'none' }}>
                        {other?.profilePicture ? (
                          <img src={other.profilePicture} className="avatar-md" style={{ border: '2px solid rgba(255,255,255,0.08)' }} />
                        ) : (
                          <div className="avatar-md" style={{ background: 'linear-gradient(135deg,#6366f1,#a855f7)', color: '#fff', fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{other?.name?.[0]?.toUpperCase()}</div>
                        )}
                      </Link>
                      <div>
                        <Link to={`/profile/${other?._id}`} style={{ fontWeight: 800, color: '#fff', fontSize: 15, textDecoration: 'none' }}>{other?.name}</Link>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                          {isSender ? 'You sent this' : 'Sent to you'} · {new Date(ex.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <span className={cfg.c} style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: 11, padding: '4px 10px' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} /> {cfg.label}
                    </span>
                  </div>

                  {/* Skills Swapped */}
                  <div className="card-solid" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 10, fontWeight: 800, color: 'rgba(148,163,184,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>You Offer</p>
                      <span className="skill-tag badge-cyan">{ex.skillOffered}</span>
                    </div>
                    <div style={{ color: 'var(--text-muted)', padding: '0 8px' }}>{I.swap}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 10, fontWeight: 800, color: 'rgba(148,163,184,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>They Offer</p>
                      <span className="skill-tag badge-purple">{ex.skillRequested}</span>
                    </div>
                  </div>

                  {/* Message */}
                  {ex.message && (
                    <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 12, marginBottom: 16 }}>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0 }}>"{ex.message}"</p>
                    </div>
                  )}

                  {/* Bottom Actions */}
                  {(!isSender && ex.status === 'pending') && (
                    <div style={{ display: 'flex', gap: 12, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                      <button onClick={() => handleRespond(ex._id, 'accepted')} className="btn-primary" style={{ flex: 1, background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }} onMouseEnter={e => e.currentTarget.style.background='rgba(16,185,129,0.25)'} onMouseLeave={e => e.currentTarget.style.background='rgba(16,185,129,0.15)'}>
                        <span className="flex">{I.check}</span> Accept Request
                      </button>
                      <button onClick={() => handleRespond(ex._id, 'rejected')} className="btn-secondary" style={{ flex: 1, background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }} onMouseEnter={e => e.currentTarget.style.background='rgba(239,68,68,0.2)'} onMouseLeave={e => e.currentTarget.style.background='rgba(239,68,68,0.1)'}>
                        <span className="flex">{I.x}</span> Decline
                      </button>
                    </div>
                  )}

                  {ex.status === 'accepted' && (
                    <div style={{ display: 'flex', gap: 12, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                      <Link to={`/chat/${other?._id}`} className="btn-secondary" style={{ flex: 1, textDecoration: 'none', background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)' }} onMouseEnter={e => e.currentTarget.style.background='rgba(99,102,241,0.2)'} onMouseLeave={e => e.currentTarget.style.background='rgba(99,102,241,0.1)'}>
                        <span className="flex">{I.chat}</span> Message {other?.name?.split(' ')[0]}
                      </Link>
                      <button onClick={() => handleComplete(ex._id)} className="btn-primary" style={{ flex: 1, background: 'linear-gradient(135deg,rgba(168,85,247,0.2),rgba(236,72,153,0.2))', color: '#f472b6', border: '1px solid rgba(236,72,153,0.3)', boxShadow: 'none' }} onMouseEnter={e => e.currentTarget.style.background='linear-gradient(135deg,rgba(168,85,247,0.3),rgba(236,72,153,0.3))'} onMouseLeave={e => e.currentTarget.style.background='linear-gradient(135deg,rgba(168,85,247,0.2),rgba(236,72,153,0.2))'}>
                        <span className="flex">{I.done}</span> Mark Complete
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
