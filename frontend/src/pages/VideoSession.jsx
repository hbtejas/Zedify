import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VideoPlayer from '../components/VideoPlayer';
import { videoAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const I = {
  camera: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  users:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  arrowL: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  shield: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
};

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
      
      if (sess.hostId?._id === user._id) setPendingParticipants(sess.waitingList || []);
      
      const isAllowed = sess.hostId?._id === user._id || (sess.allowedUsers || []).some(au => au._id === user._id || au === user._id);
      
      if (isAllowed && !joined) {
         if (rulesAgreed || sess.hostId?._id === user._id) handleJoin(true);
      }
    } catch (err) {
      setLoading(false);
      if (err.response?.status === 403) setError('PRIVATE_ACCESS');
      else setError(err.response?.data?.message || 'Session not found');
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

  const handleApprove = async (uId) => { try { await videoAPI.approveParticipant(sessionId, uId); fetchSession(); } catch {} };
  const handleApproveAll = async () => { try { await videoAPI.approveAll(sessionId); fetchSession(); } catch {} };
  const handleUpdateSettings = async (updates) => { try { await videoAPI.updateSettings(sessionId, updates); fetchSession(); } catch {} };
  const handleRemove = async (uId) => { if(window.confirm('Remove this participant?')) try { await videoAPI.removeParticipant(sessionId, uId); fetchSession(); } catch {} };
  const handleEnd = async () => { if (window.confirm('End this session?')) try { await videoAPI.endSession(sessionId); navigate('/video'); } catch {} };

  const isHost = session?.hostId?._id === user._id;

  if (loading && !session) return <div className="min-h-screen bg-app flex items-center justify-center"><div className="spinner-lg border-t-brand" /></div>;

  if (error === 'NOT_STARTED' || error === 'EXPIRED') {
    return (
       <div className="bg-app min-h-screen flex items-center justify-center p-6 text-center">
          <div className="card-glass max-w-sm w-full p-10">
             <div style={{ fontSize: 48, marginBottom: 24 }}>{error === 'NOT_STARTED' ? '⏳' : '⌛'}</div>
             <h2 className="text-white font-black text-2xl mb-4" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>{error === 'NOT_STARTED' ? 'Starting Soon' : 'Session Ended'}</h2>
             <p className="text-[var(--text-secondary)] text-sm mb-8">{error === 'NOT_STARTED' ? <>Scheduled to start on:<br/><span className="text-[var(--brand-light)] font-bold">{new Date(session?.startTime).toLocaleString()}</span></> : 'This live session has concluded.'}</p>
             <button onClick={() => navigate('/video')} className="btn-secondary w-full py-4 text-white font-bold">Return Home</button>
          </div>
       </div>
    );
  }

  if (session?.isLocked && !isHost && !session.allowedUsers.some(u => u._id === user._id || u === user._id)) {
    return (
       <div className="bg-app min-h-screen flex items-center justify-center p-6 text-center">
          <div className="card-glass max-w-sm w-full p-10">
             <div style={{ fontSize: 48, marginBottom: 24 }}>🔒</div>
             <h2 className="text-white font-black text-2xl mb-4" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>Meeting Locked</h2>
             <p className="text-[var(--text-secondary)] text-sm mb-8">The host has locked this session. No new participants can join.</p>
             <button onClick={() => navigate('/video')} className="btn-secondary w-full py-4 text-white font-bold">Return Home</button>
          </div>
       </div>
    );
  }

  if (error === 'PRIVATE_ACCESS') {
    return (
      <div className="bg-app min-h-screen flex items-center justify-center p-6 text-center relative">
         <div className="card-solid max-w-sm w-full p-10 pointer-events-auto" style={{ overflow: 'hidden' }}>
          <div className="absolute top-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(90deg,#f59e0b,#f97316)' }} />
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#f59e0b' }}>{I.shield}</div>
          <h2 className="text-white font-black text-3xl mb-4 tracking-tight" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>Private Room</h2>
          <p className="text-sm mb-10 text-[var(--text-secondary)]">This session is restricted. {requestSent ? 'Please wait for approval.' : 'Request access from the host.'}</p>
          
          {requestSent ? (
            <div className="card" style={{ padding: 20 }}>
               <div className="spinner-sm border-t-amber mb-3 mx-auto" style={{ borderColor: 'rgba(245,158,11,0.3)', borderTopColor: '#f59e0b' }} />
               <span style={{ fontSize: 11, fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Waiting for Approval...</span>
            </div>
          ) : (
            <button onClick={handleRequestAccess} disabled={joining} className="btn-primary w-full py-4">
              {joining ? 'Sending...' : 'Request Admittance'}
            </button>
          )}
          <button onClick={() => navigate('/video')} className="btn-ghost w-full py-3 mt-4 text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Back to Feed</button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-app min-h-screen flex items-center justify-center p-6 text-center">
        <div className="card-glass max-w-sm w-full p-10">
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#ef4444', fontSize: 32, fontWeight: 900 }}>!</div>
          <h2 className="text-white font-black text-2xl mb-3" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>Not Found</h2>
          <p className="text-[var(--text-secondary)] text-sm mb-8">{error}</p>
          <button onClick={() => navigate('/video')} className="btn-secondary w-full py-4 text-white font-bold">Return Home</button>
        </div>
      </div>
    );
  }

  // --- AR screen
  if (!joined) {
    return (
      <div className="bg-app min-h-screen flex items-center justify-center p-6 relative">
        <div className="w-full max-w-3xl page-fade-in relative z-10" style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(5, 1fr)' }}>
          
          <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card-glass" style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
               <div className="avatar-xl mb-4" style={{ background: 'linear-gradient(135deg,#6366f1,#a855f7)', color: '#fff', fontSize: 36, fontWeight: 900, borderRadius: 24 }}>{session?.skillName?.[0]?.toUpperCase()}</div>
               <h1 className="text-white text-xl font-black mb-2" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>{session?.skillName}</h1>
               <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Host: {session?.hostId?.name}</p>
            </div>
            <div className="card-solid" style={{ padding: 20 }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                 <span style={{ color: 'var(--brand-light)' }}>{I.users}</span>
                 <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}><strong style={{ color: '#fff' }}>{session?.participants?.length || 0}</strong> Peers in room</p>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                 <span style={{ color: 'var(--success)' }}>{I.shield}</span>
                 <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Privacy Enabled</p>
               </div>
            </div>
          </div>

          <div className="card-solid" style={{ gridColumn: 'span 3', padding: 32, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
             <div className="absolute top-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(90deg,#6366f1,#a855f7)' }} />
             <h2 className="text-white font-black text-xl mb-6 flex items-center gap-3" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>{I.shield} Safety Guidelines</h2>
             
             <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
                {[ { t:'Zero Tolerance', d:'Harassment leads to an immediate ban.' }, { t:'Privacy First', d:'No recording without consent.' } ].map((r, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12 }}>
                     <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: 'var(--brand-light)' }}>{i+1}</div>
                     <div>
                       <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{r.t}</p>
                       <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.d}</p>
                     </div>
                  </div>
                ))}
             </div>

             <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: 24 }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', marginBottom: 24 }}>
                   <input type="checkbox" style={{ display: 'none' }} checked={rulesAgreed} onChange={() => setRulesAgreed(!rulesAgreed)} />
                   <div style={{ width: 20, height: 20, borderRadius: 6, border: rulesAgreed ? 'none' : '2px solid var(--border-2)', background: rulesAgreed ? 'var(--brand)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', flexShrink: 0 }}>
                      {rulesAgreed && <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={4} className="w-3 h-3"><polyline points="20 6 9 17 4 12" /></svg>}
                   </div>
                   <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      I agree to the <strong style={{ color: '#fff' }}>Community Standards</strong> and acknowledge the <strong style={{ color: '#fff' }}>Privacy Policy</strong>.
                   </span>
                </label>

                <div className="card" style={{ padding: 12, marginBottom: 20, background: 'rgba(99,102,241,0.05)', borderColor: 'rgba(99,102,241,0.15)' }}>
                   <p style={{ fontSize: 10, fontWeight: 900, color: 'rgba(129,140,248,0.8)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>{I.shield} IT Rules 2021 & DPDP Information</p>
                   <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>This session is protected by encryption. You consent to data processing as per IT Rules. Trace ID: <span style={{ fontFamily: 'monospace' }}>{sessionId.slice(0,8)}</span></p>
                </div>

                <button onClick={() => handleJoin()} disabled={joining || !rulesAgreed} className="btn-primary w-full py-4 text-sm">
                  {joining ? 'Checking...' : 'Enter Live Room'}
                </button>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Session
  return (
    <div className="bg-app flex flex-col" style={{ height: '100vh', overflow: 'hidden' }}>
      <div style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyItems: 'space-between', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => navigate('/video')} className="btn-ghost" style={{ width: 40, height: 40, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{I.arrowL}</button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: session?.isLocked ? '#f59e0b' : '#ef4444', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: 15, fontWeight: 800, color: '#fff', fontFamily: "'Space Grotesk',sans-serif" }}>{session?.skillName}</span>
              {session?.isLocked && <span className="badge-amber" style={{ fontSize: 10, padding: '2px 8px' }}>LOCKED</span>}
            </div>
            <p style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>Host: {session?.hostId?.name}</p>
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16 }}>
          {isHost && pendingParticipants.length > 0 && (
            <div className="badge-amber" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'rgba(245,158,11,0.15)' }}>
              <span style={{ fontSize: 11, fontWeight: 800 }}>{pendingParticipants.length} Waiting</span>
              <button onClick={handleApproveAll} className="btn-ghost" style={{ padding: 0, fontSize: 11, color: '#34d399', fontWeight: 800 }}>Allow All</button>
            </div>
          )}
          {isHost && <button onClick={handleEnd} className="btn-primary" style={{ background: '#dc2626', borderColor: '#ef4444', boxShadow: '0 0 16px rgba(220,38,38,0.4)' }}>End Session</button>}
        </div>
      </div>
      
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <VideoPlayer sessionId={sessionId} isHost={isHost} onEnd={handleEnd} pendingApprovals={pendingParticipants} onApprove={handleApprove} onApproveAll={handleApproveAll} onRemove={handleRemove} settings={{ isLocked: session?.isLocked, isChatDisabled: session?.isChatDisabled }} updateSettings={handleUpdateSettings} />
      </div>
    </div>
  );
};

export default VideoSession;