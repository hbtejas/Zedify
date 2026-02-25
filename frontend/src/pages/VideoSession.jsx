import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VideoPlayer from '../components/VideoPlayer';
import { videoAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const BG = 'linear-gradient(135deg,#060b18 0%,#0d1526 40%,#0f0c29 100%)';
const GLASS = { background:'rgba(255,255,255,0.05)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.10)' };

const CameraIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);
const MicIcon2 = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);
const UsersIcon2 = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const ArrowLeftIcon2 = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const ZapIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const VideoSession = () => {
  const { sessionId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data } = await videoAPI.getSession(sessionId);
        setSession(data.data);
        if (data.data.hostId?._id === user._id) setJoined(true);
      } catch {
        setError('Session not found or has ended');
      }
      setLoading(false);
    };
    fetchSession();
  }, [sessionId, user._id]);

  const handleJoin = async () => {
    setJoining(true);
    try {
      await videoAPI.joinSession(sessionId);
      setJoined(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join session');
    }
    setJoining(false);
  };

  const handleEnd = async () => {
    if (window.confirm('End this session for all participants?')) {
      try {
        await videoAPI.endSession(sessionId);
        navigate('/video');
      } catch {}
    }
  };

  const isHost = session?.hostId?._id === user._id;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BG }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-white/50 text-sm">Loading session</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: BG }}>
        <div className="text-center max-w-sm w-full rounded-3xl p-8" style={GLASS}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)' }}>
            <span className="text-2xl text-red-400">!</span>
          </div>
          <h2 className="text-white font-bold text-xl mb-2">Session Unavailable</h2>
          <p className="text-sm mb-6" style={{ color:'rgba(148,163,184,0.7)' }}>{error}</p>
          <button onClick={() => navigate('/video')}
            className="w-full py-3 rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{ background:'rgba(99,102,241,0.7)', border:'1px solid rgba(99,102,241,0.4)' }}>
            <ArrowLeftIcon2 /> Back to Sessions
          </button>
        </div>
      </div>
    );
  }

  /*  Joined: full-screen video  */
  if (joined) {
    return (
      <div className="flex flex-col" style={{ height:'100vh', overflow:'hidden', background: BG }}>
        {/* Top bar */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 z-10"
          style={{ background:'rgba(0,0,0,0.5)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/video')}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors"
              style={{ background:'rgba(255,255,255,0.08)' }}>
              <ArrowLeftIcon2 />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-white font-semibold text-sm">{session?.skillName}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold text-red-300"
                  style={{ background:'rgba(220,38,38,0.2)', border:'1px solid rgba(220,38,38,0.3)' }}>LIVE</span>
              </div>
              <p className="text-white/40 text-xs">Hosted by {session?.hostId?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs text-white/50">
              <UsersIcon2 /> {session?.participants?.length || 0}
            </span>
            {isHost && (
              <button onClick={handleEnd}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ background:'rgba(220,38,38,0.8)', border:'1px solid rgba(239,68,68,0.4)' }}>
                End Session
              </button>
            )}
          </div>
        </div>

        {/* VideoPlayer fills remaining height exactly */}
        <div style={{ flex:1, minHeight:0, overflow:'hidden' }}>
          <VideoPlayer sessionId={sessionId} isHost={isHost} onEnd={handleEnd} />
        </div>
      </div>
    );
  }

  /*  Pre-join lobby  */
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: BG }}>
      {/* Ambient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background:'radial-gradient(circle,rgba(79,70,229,0.15) 0%,transparent 70%)', filter:'blur(60px)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none"
        style={{ background:'radial-gradient(circle,rgba(37,99,235,0.12) 0%,transparent 70%)', filter:'blur(50px)' }} />

      <div className="w-full max-w-md z-10">
        {/* Host avatar card */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white mb-3"
            style={{ background:'linear-gradient(135deg,#2563eb,#4f46e5,#7c3aed)', boxShadow:'0 8px 32px rgba(99,102,241,0.4)' }}>
            {session?.skillName?.charAt(0)?.toUpperCase() || 'Z'}
          </div>
          <h1 className="text-white text-2xl font-bold text-center">{session?.skillName}</h1>
          {session?.description && (
            <p className="text-center mt-1 text-sm" style={{ color:'rgba(148,163,184,0.7)' }}>{session.description}</p>
          )}
          <div className="mt-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-semibold text-red-300">LIVE</span>
          </div>
        </div>

        {/* Info card */}
        <div className="rounded-3xl p-6 mb-4" style={GLASS}>
          {/* Host */}
          <div className="flex items-center gap-3 pb-4" style={{ borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white"
              style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
              {session?.hostId?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{session?.hostId?.name}</p>
              <p className="text-xs" style={{ color:'rgba(148,163,184,0.6)' }}>Session Host</p>
            </div>
            <div className="ml-auto flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
              style={{ background:'rgba(99,102,241,0.15)', color:'#a5b4fc' }}>
              <UsersIcon2 /> {session?.participants?.length || 0} joined
            </div>
          </div>

          {/* Permissions notice */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              { icon: <CameraIcon />, label: 'Camera', desc: 'Will be requested' },
              { icon: <MicIcon2 />, label: 'Microphone', desc: 'Will be requested' },
              { icon: <ShieldIcon />, label: 'Encrypted', desc: 'End-to-end P2P' },
              { icon: <ZapIcon />, label: 'Low Latency', desc: 'WebRTC direct' },
            ].map(({ icon, label, desc }) => (
              <div key={label} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
                style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }}>
                <span style={{ color:'#818cf8' }}>{icon}</span>
                <div>
                  <p className="text-white text-xs font-semibold">{label}</p>
                  <p className="text-[10px]" style={{ color:'rgba(148,163,184,0.6)' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Join / error */}
        {error && (
          <div className="mb-3 px-4 py-3 rounded-2xl text-red-300 text-sm text-center"
            style={{ background:'rgba(220,38,38,0.15)', border:'1px solid rgba(220,38,38,0.3)' }}>
            {error}
          </div>
        )}

        <button
          onClick={handleJoin}
          disabled={joining}
          className="w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2.5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:scale-100"
          style={{ background:'linear-gradient(135deg,#2563eb,#4f46e5,#7c3aed)', boxShadow:'0 8px 24px rgba(99,102,241,0.45)' }}>
          {joining ? (
            <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Joining</>
          ) : (
            <><CameraIcon /> Join Session</>
          )}
        </button>

        <button onClick={() => navigate('/video')}
          className="w-full mt-3 py-3 rounded-2xl text-sm font-medium flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
          style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.10)', color:'rgba(255,255,255,0.6)' }}>
          <ArrowLeftIcon2 /> Back to Sessions
        </button>
      </div>
    </div>
  );
};

export default VideoSession;