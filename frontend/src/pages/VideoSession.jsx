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

const VideoSession = () => {
  const { sessionId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);
  const [rulesAgreed, setRulesAgreed] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [pendingParticipants, setPendingParticipants] = useState([]);

  const fetchSession = async () => {
    try {
      const { data } = await videoAPI.getSession(sessionId);
      const sess = data.data;
      setSession(sess);
      setLoading(false);
      
      if (sess.hostId?._id === user._id) {
        setPendingParticipants(sess.waitingList || []);
      }
      
      const isAllowed = sess.hostId?._id === user._id || 
                        (sess.allowedUsers || []).some(au => au._id === user._id || au === user._id);
      
      if (isAllowed && !joined) {
         if (rulesAgreed || sess.hostId?._id === user._id) handleJoin(true);
      }
    } catch (err) {
      setLoading(false);
      if (err.response?.status === 403) {
        setError('PRIVATE_ACCESS');
      } else {
        setError(err.response?.data?.message || 'Session not found');
      }
    }
  };

  useEffect(() => {
    fetchSession();
    const timer = setInterval(fetchSession, 8000);
    return () => clearInterval(timer);
  }, [sessionId, user._id, joined]);

  const handleJoin = async (force = false) => {
    if (!rulesAgreed && !force) return;
    setJoining(true);
    try {
      await videoAPI.joinSession(sessionId);
      setJoined(true);
      setError('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to join';
      const code = err.response?.data?.code;
      if (code === 'NOT_STARTED') setError('NOT_STARTED');
      else if (code === 'EXPIRED') setError('EXPIRED');
      else if (err.response?.status === 403) setError('PRIVATE_ACCESS');
      else setError(msg);
    }
    setJoining(false);
  };

  const handleRequestAccess = async () => {
    setJoining(true);
    try {
      await videoAPI.requestToJoin(sessionId);
      setRequestSent(true);
    } catch (err) {
      if (err.response?.data?.code === 'EXPIRED') setError('EXPIRED');
      else alert(err.response?.data?.message || 'Failed to send request');
    }
    setJoining(false);
  };

  const handleApprove = async (uId) => {
     try {
       await videoAPI.approveParticipant(sessionId, uId);
       fetchSession();
     } catch (err) { alert('Approval failed'); }
  };

  const handleApproveAll = async () => {
     try {
       await videoAPI.approveAll(sessionId);
       fetchSession();
     } catch (err) { alert('Failed to approve all'); }
  };

  const handleUpdateSettings = async (updates) => {
     try {
        await videoAPI.updateSettings(sessionId, updates);
        fetchSession();
     } catch (err) { alert('Failed to update settings'); }
  };

  const handleRemove = async (uId) => {
     if(window.confirm('Remove this participant?')) {
        try {
           await videoAPI.removeParticipant(sessionId, uId);
           fetchSession();
        } catch {}
     }
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

  if (loading && !session) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BG }}>
        <div className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error === 'NOT_STARTED') {
     return (
        <div className="min-h-screen flex items-center justify-center p-6 text-center" style={{ background: BG }}>
           <div className="max-w-sm w-full p-10 rounded-3xl" style={GLASS}>
              <div className="text-5xl mb-6">⏳</div>
              <h2 className="text-white font-black text-2xl mb-4">Starting Soon</h2>
              <p className="text-slate-400 text-sm mb-8">This session is scheduled to start on:<br/><span className="text-indigo-400 font-bold">{new Date(session?.startTime).toLocaleString()}</span></p>
              <button onClick={() => navigate('/video')} className="w-full py-4 rounded-xl glass-dark text-white font-bold">Return Home</button>
           </div>
        </div>
     );
  }

  if (error === 'EXPIRED') {
     return (
        <div className="min-h-screen flex items-center justify-center p-6 text-center" style={{ background: BG }}>
           <div className="max-w-sm w-full p-10 rounded-3xl" style={GLASS}>
              <div className="text-5xl mb-6">⌛</div>
              <h2 className="text-white font-black text-2xl mb-4">Session Ended</h2>
              <p className="text-slate-400 text-sm mb-8">This live session has already concluded. Please check back for future sessions.</p>
              <button onClick={() => navigate('/video')} className="w-full py-4 rounded-xl glass-dark text-white font-bold">Return Home</button>
           </div>
        </div>
     );
  }

  if (session?.isLocked && !isHost && !session.allowedUsers.some(u => u._id === user._id || u === user._id)) {
    return (
       <div className="min-h-screen flex items-center justify-center p-6 text-center" style={{ background: BG }}>
          <div className="max-w-sm w-full p-10 rounded-3xl" style={GLASS}>
             <div className="text-5xl mb-6">🔒</div>
             <h2 className="text-white font-black text-2xl mb-4">Meeting Locked</h2>
             <p className="text-slate-400 text-sm mb-8">The host has locked this session. No new participants can join at this time.</p>
             <button onClick={() => navigate('/video')} className="w-full py-4 rounded-xl glass-dark text-white font-bold">Return Home</button>
          </div>
       </div>
    );
  }

  if (error === 'PRIVATE_ACCESS') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 relative" style={{ background: BG }}>
         <div className="text-center max-w-sm w-full rounded-[2.5rem] p-10 page-fade-in relative overflow-hidden" style={GLASS}>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8" style={{ background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.2)' }}><ShieldIcon /></div>
          <h2 className="text-white font-black text-3xl mb-4 tracking-tight">Private Room</h2>
          <p className="text-sm mb-10 leading-relaxed text-slate-400">
            This session is restricted. {requestSent ? 'Please wait for the host to review your request.' : 'You must request access from the host to join this session.'}
          </p>
          {requestSent ? (
            <div className="w-full py-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center gap-3">
               <div className="w-5 h-5 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
               <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Waiting for Approval...</span>
            </div>
          ) : (
            <button onClick={handleRequestAccess} disabled={joining} className="w-full py-4 rounded-2xl text-white font-bold text-base bg-indigo-600 shadow-[0_10px_30px_rgba(79,70,229,0.4)]">
              {joining ? 'Sending...' : 'Request Admittance'}
            </button>
          )}
          <button onClick={() => navigate('/video')} className="mt-6 text-slate-500 text-xs font-bold uppercase tracking-widest hover:text-white">Back to Feed</button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: BG }}>
        <div className="text-center max-w-sm w-full rounded-3xl p-10 page-fade-in" style={GLASS}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)' }}><span className="text-4xl text-red-500 font-bold">!</span></div>
          <h2 className="text-white font-black text-2xl mb-3">Not Found</h2>
          <p className="text-sm mb-8 leading-relaxed text-slate-400">{error}</p>
          <button onClick={() => navigate('/video')} className="w-full py-4 rounded-2xl glass-dark text-white font-bold text-sm">Return Home</button>
        </div>
      </div>
    );
  }

  if (joined) {
    return (
      <div className="flex flex-col" style={{ height:'100vh', overflow:'hidden', background: BG }}>
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 z-10" style={{ background:'rgba(0,0,0,0.6)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/video')} className="w-9 h-9 rounded-xl flex items-center justify-center text-white/60 hover:text-white transition-all hover:bg-white/10" style={{ border:'1px solid rgba(255,255,255,0.08)' }}><ArrowLeftIcon2 /></button>
            <div className="relative">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${session?.isLocked ? 'bg-amber-500' : 'bg-red-500'} animate-pulse`} />
                <span className="text-white font-bold text-sm tracking-tight">{session?.skillName}</span>
                {session?.isLocked && <span className="text-[9px] px-2 py-0.5 rounded-full font-black text-amber-400 border border-amber-500/30 ml-1">LOCKED</span>}
              </div>
              <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mt-0.5">Host: {session?.hostId?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isHost && pendingParticipants.length > 0 && (
               <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <span className="text-[10px] font-black text-amber-500">{pendingParticipants.length} Waiting</span>
                  <button onClick={handleApproveAll} className="text-[10px] font-bold text-emerald-400 hover:text-white transition-colors">Allow All</button>
               </div>
            )}
            {isHost && <button onClick={handleEnd} className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.2)]">End Session</button>}
          </div>
        </div>
        <div style={{ flex:1, minHeight:0, overflow:'hidden' }}>
          <VideoPlayer sessionId={sessionId} isHost={isHost} onEnd={handleEnd} pendingApprovals={pendingParticipants} onApprove={handleApprove} onApproveAll={handleApproveAll} onRemove={handleRemove} settings={{ isLocked: session?.isLocked, isChatDisabled: session?.isChatDisabled }} updateSettings={handleUpdateSettings} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: BG }}>
      <div className="w-full max-w-xl z-10 page-fade-in">
        <div className="grid md:grid-cols-5 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="rounded-3xl p-6 flex flex-col items-center text-center" style={GLASS}>
               <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-3xl font-black text-white mb-4" style={{ background:'linear-gradient(135deg,#6366f1,#a855f7)' }}>{session?.skillName?.charAt(0)?.toUpperCase()}</div>
               <h1 className="text-white text-xl font-black leading-tight mb-2 tracking-tight">{session?.skillName}</h1>
               <p className="text-white font-bold text-sm tracking-tight text-zinc-500 uppercase text-[10px]">Host: {session?.hostId?.name}</p>
            </div>
            <div className="rounded-3xl p-5 space-y-4 bg-white/5 border border-white/5">
               <div className="flex items-center gap-3"><span className="text-indigo-400"><UsersIcon2 /></span><p className="text-xs text-zinc-400 font-semibold"><span className="text-white font-bold">{session?.participants?.length || 0}</span> Peers in room</p></div>
               <div className="flex items-center gap-3"><span className="text-emerald-400"><ShieldIcon /></span><p className="text-xs text-zinc-400 font-semibold">Privacy Enabled</p></div>
            </div>
          </div>
          <div className="md:col-span-3">
            <div className="rounded-[2.5rem] p-8 flex flex-col h-full overflow-hidden relative" style={GLASS}>
               <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500" />
               <h2 className="text-white font-black text-xl mb-4 flex items-center gap-3"><ShieldIcon /> Safety Guidelines</h2>
               <div className="space-y-4 mb-8">
                  {[ { t:'Zero Tolerance', d:'Any form of harassment leads to immediate ban.' }, { t:'Privacy First', d:'No recording without explicit consent.' } ].map((r, i) => (
                    <div key={i} className="flex gap-3">
                       <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 text-[10px] font-black">{i+1}</div>
                       <div><p className="text-xs font-bold text-white mb-0.5">{r.t}</p><p className="text-[10px] text-slate-400 font-medium">{r.d}</p></div>
                    </div>
                  ))}
               </div>
               <div className="mt-auto pt-6 space-y-4 border-t border-white/5">
                  <label className="flex items-start gap-4 cursor-pointer group">
                     <input type="checkbox" className="sr-only" checked={rulesAgreed} onChange={() => setRulesAgreed(!rulesAgreed)} />
                     <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${rulesAgreed ? 'bg-indigo-500 border-indigo-500' : 'border-white/20'}`}>
                        {rulesAgreed && <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={4} className="w-3 h-3"><polyline points="20 6 9 17 4 12" /></svg>}
                     </div>
                     <span className="text-[11px] text-slate-400">I agree to the Community Standards.</span>
                  </label>
                  <button onClick={() => handleJoin()} disabled={joining || !rulesAgreed} className="w-full py-4 rounded-2xl text-white font-black text-sm bg-indigo-600 disabled:opacity-30">
                    {joining ? 'Checking...' : 'Enter Live Room'}
                  </button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoSession;