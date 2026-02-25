import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { videoAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const BG = 'linear-gradient(135deg,#060b18 0%,#0d1526 40%,#0f0c29 100%)';
const GLASS = { background:'rgba(255,255,255,0.05)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.10)' };

/*  Icons  */
const VideoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
  </svg>
);
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" className="w-4 h-4">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" className="w-4 h-4">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const CrownIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const ArrowRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const BookOpenIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);

/*  Relative time helper  */
const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const VideoSessions = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ skillName: '', description: '' });
  const [showCreate, setShowCreate] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const { data } = await videoAPI.getActiveSessions();
        setSessions(data.data);
      } catch {}
      setLoading(false);
    };
    fetchSessions();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.skillName.trim()) { setFormError('Session topic is required'); return; }
    setFormError('');
    setCreating(true);
    try {
      const { data } = await videoAPI.createSession(form.skillName, form.description);
      setSessions((prev) => [data.data, ...prev]);
      setShowCreate(false);
      setForm({ skillName: '', description: '' });
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create session');
    }
    setCreating(false);
  };

  const liveSessions = sessions.filter((s) => s.status === 'live');
  const waitingSessions = sessions.filter((s) => s.status !== 'live');

  return (
    <div className="min-h-screen relative" style={{ background: BG }}>
      {/* Ambient orbs */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background:'radial-gradient(circle,rgba(79,70,229,0.10) 0%,transparent 70%)', filter:'blur(80px)' }} />
      <div className="fixed bottom-0 left-0 w-96 h-96 rounded-full pointer-events-none"
        style={{ background:'radial-gradient(circle,rgba(37,99,235,0.08) 0%,transparent 70%)', filter:'blur(60px)' }} />

      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-8 relative z-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Live Sessions</h1>
            <p className="mt-1 text-sm" style={{ color:'rgba(148,163,184,0.65)' }}>
              Join real-time skill sessions or host your own
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl text-white font-semibold text-sm transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] flex-shrink-0"
            style={{ background:'linear-gradient(135deg,#2563eb,#4f46e5,#7c3aed)', boxShadow:'0 6px 20px rgba(99,102,241,0.40)' }}>
            <PlusIcon /> Host a Session
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label:'Live Now', value: liveSessions.length, color:'#f87171', glow:'rgba(239,68,68,0.3)' },
            { label:'Waiting', value: waitingSessions.length, color:'#fbbf24', glow:'rgba(251,191,36,0.2)' },
            { label:'Total Sessions', value: sessions.length, color:'#818cf8', glow:'rgba(99,102,241,0.2)' },
          ].map(({ label, value, color, glow }) => (
            <div key={label} className="rounded-2xl p-4 text-center" style={GLASS}>
              <p className="text-2xl font-bold" style={{ color, textShadow:`0 0 16px ${glow}` }}>{value}</p>
              <p className="text-xs mt-0.5" style={{ color:'rgba(148,163,184,0.6)' }}>{label}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            <p className="text-sm" style={{ color:'rgba(148,163,184,0.5)' }}>Loading sessions</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 rounded-3xl" style={GLASS}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.2)' }}>
              <span style={{ color:'#818cf8' }}><BookOpenIcon /></span>
            </div>
            <div className="text-center">
              <p className="text-white font-semibold text-lg">No active sessions</p>
              <p className="text-sm mt-1" style={{ color:'rgba(148,163,184,0.55)' }}>Be the first to host a skill session!</p>
            </div>
            <button onClick={() => setShowCreate(true)}
              className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background:'rgba(99,102,241,0.5)', border:'1px solid rgba(99,102,241,0.3)' }}>
              <PlusIcon /> Start First Session
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Live sessions */}
            {liveSessions.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <h2 className="text-white font-semibold text-sm uppercase tracking-wider">Live Now</h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-red-300"
                    style={{ background:'rgba(220,38,38,0.2)', border:'1px solid rgba(220,38,38,0.3)' }}>
                    {liveSessions.length}
                  </span>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {liveSessions.map((s) => <SessionCard key={s._id} session={s} user={user} />)}
                </div>
              </section>
            )}

            {/* Waiting sessions */}
            {waitingSessions.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <ClockIcon />
                  <h2 className="text-white font-semibold text-sm uppercase tracking-wider" style={{ color:'rgba(255,255,255,0.7)' }}>Starting Soon</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {waitingSessions.map((s) => <SessionCard key={s._id} session={s} user={user} />)}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {/* Create session modal */}
      {showCreate && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background:'rgba(0,0,0,0.7)', backdropFilter:'blur(8px)' }}>
          <div className="w-full max-w-md rounded-3xl p-6 shadow-2xl" style={{ background:'rgba(13,21,38,0.95)', border:'1px solid rgba(255,255,255,0.12)', backdropFilter:'blur(24px)' }}>
            {/* Modal header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-white font-bold text-xl">Host a Live Session</h3>
                <p className="text-xs mt-0.5" style={{ color:'rgba(148,163,184,0.6)' }}>Share your skills in real time</p>
              </div>
              <button onClick={() => { setShowCreate(false); setFormError(''); }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-colors"
                style={{ background:'rgba(255,255,255,0.08)' }}>
                <XIcon />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color:'rgba(148,163,184,0.8)' }}>
                  Skill / Topic <span className="text-red-400">*</span>
                </label>
                <input
                  value={form.skillName}
                  onChange={(e) => { setForm({ ...form, skillName: e.target.value }); setFormError(''); }}
                  placeholder="e.g. Python Basics, Guitar Chords, React Hooks"
                  required
                  style={{
                    width:'100%', padding:'11px 16px',
                    background:'rgba(255,255,255,0.06)',
                    border: formError ? '1px solid rgba(220,38,38,0.6)' : '1px solid rgba(255,255,255,0.12)',
                    borderRadius:'12px', color:'#f1f5f9', fontSize:'14px', outline:'none',
                  }}
                  onFocus={(e) => { e.target.style.borderColor='rgba(99,102,241,0.6)'; e.target.style.boxShadow='0 0 0 3px rgba(99,102,241,0.15)'; }}
                  onBlur={(e) => { e.target.style.borderColor='rgba(255,255,255,0.12)'; e.target.style.boxShadow='none'; }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color:'rgba(148,163,184,0.8)' }}>
                  Description <span style={{ color:'rgba(148,163,184,0.4)' }}>(optional)</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="What will you cover in this session?"
                  rows={3}
                  style={{
                    width:'100%', padding:'11px 16px',
                    background:'rgba(255,255,255,0.06)',
                    border:'1px solid rgba(255,255,255,0.12)',
                    borderRadius:'12px', color:'#f1f5f9', fontSize:'14px', outline:'none', resize:'none',
                  }}
                  onFocus={(e) => { e.target.style.borderColor='rgba(99,102,241,0.6)'; e.target.style.boxShadow='0 0 0 3px rgba(99,102,241,0.15)'; }}
                  onBlur={(e) => { e.target.style.borderColor='rgba(255,255,255,0.12)'; e.target.style.boxShadow='none'; }}
                />
              </div>

              {formError && (
                <p className="text-red-400 text-xs px-1">{formError}</p>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setShowCreate(false); setFormError(''); }}
                  className="flex-1 py-3 rounded-2xl text-sm font-semibold transition-all hover:scale-[1.01] active:scale-[0.99]"
                  style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.7)' }}>
                  Cancel
                </button>
                <button type="submit" disabled={creating}
                  className="flex-1 py-3 rounded-2xl text-white text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:scale-100"
                  style={{ background:'linear-gradient(135deg,#2563eb,#4f46e5,#7c3aed)', boxShadow:'0 6px 18px rgba(99,102,241,0.40)' }}>
                  {creating ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating</>
                  ) : (
                    <><VideoIcon /> Go Live</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/*  Session Card  */
const SessionCard = ({ session, user }) => {
  const isHost = session.hostId?._id === user?._id;
  const isLive = session.status === 'live';

  return (
    <div className="rounded-2xl p-5 flex flex-col gap-3 transition-all duration-300 hover:scale-[1.01]"
      style={{ ...({background:'rgba(255,255,255,0.04)', backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)', border: isLive ? '1px solid rgba(220,38,38,0.25)' : '1px solid rgba(255,255,255,0.09)'}), boxShadow: isLive ? '0 0 0 1px rgba(220,38,38,0.10) inset' : 'none' }}>

      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        {/* Host info */}
        <div className="flex items-center gap-2.5">
          {session.hostId?.profilePicture ? (
            <img src={session.hostId.profilePicture} alt={session.hostId.name}
              className="w-9 h-9 rounded-xl object-cover flex-shrink-0" style={{ border:'1px solid rgba(255,255,255,0.15)' }} />
          ) : (
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
              style={{ background:'linear-gradient(135deg,#2563eb,#4f46e5)' }}>
              {session.hostId?.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="flex items-center gap-1">
              <p className="text-sm font-semibold text-white">{session.hostId?.name}</p>
              {isHost && <span style={{ color:'#fbbf24' }}><CrownIcon /></span>}
            </div>
            <p className="text-[11px]" style={{ color:'rgba(148,163,184,0.6)' }}>Host</p>
          </div>
        </div>

        {/* Status badge */}
        {isLive ? (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold text-red-300 flex-shrink-0"
            style={{ background:'rgba(220,38,38,0.20)', border:'1px solid rgba(220,38,38,0.35)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" /> LIVE
          </span>
        ) : (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold text-amber-300 flex-shrink-0"
            style={{ background:'rgba(251,191,36,0.12)', border:'1px solid rgba(251,191,36,0.25)' }}>
            <ClockIcon /> Waiting
          </span>
        )}
      </div>

      {/* Title & description */}
      <div>
        <h3 className="font-bold text-white text-base">{session.skillName}</h3>
        {session.description && (
          <p className="text-xs mt-1 line-clamp-2" style={{ color:'rgba(148,163,184,0.65)' }}>{session.description}</p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-1" style={{ borderTop:'1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs" style={{ color:'rgba(148,163,184,0.6)' }}>
            <UsersIcon /> {session.participants?.length || 0}
          </span>
          {session.createdAt && (
            <span className="flex items-center gap-1 text-xs" style={{ color:'rgba(148,163,184,0.5)' }}>
              <ClockIcon /> {timeAgo(session.createdAt)}
            </span>
          )}
        </div>
        <Link
          to={`/video/session/${session.sessionId}`}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-white text-xs font-semibold transition-all duration-200 hover:scale-[1.05] active:scale-[0.96]"
          style={isLive
            ? { background:'rgba(220,38,38,0.75)', border:'1px solid rgba(220,38,38,0.4)', boxShadow:'0 4px 12px rgba(220,38,38,0.3)' }
            : { background:'rgba(99,102,241,0.60)', border:'1px solid rgba(99,102,241,0.35)' }
          }
        >
          {isHost ? 'Manage' : 'Join'} <ArrowRightIcon />
        </Link>
      </div>
    </div>
  );
};

export default VideoSessions;