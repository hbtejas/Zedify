import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

/* --- SVG Icons ------------------------------------------------------------ */
const MicIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);
const MicOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <line x1="1" y1="1" x2="23" y2="23"/>
    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);
const VideoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <polygon points="23 7 16 12 23 17 23 7"/>
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
  </svg>
);
const VideoOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const ScreenShareIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M13 3H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3"/>
    <polyline points="8 21 12 17 16 21"/>
    <polyline points="17 8 21 4 17 0"/>
    <line x1="21" y1="4" x2="9" y2="4"/>
  </svg>
);
const PhoneOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.42 19.42 0 0 1 3.07 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 2 2.18 12.72 12.72 0 0 0 2.7.93a2 2 0 0 1 .45-2.11L4.42 0"/>
    <line x1="23" y1="1" x2="1" y2="23"/>
  </svg>
);
const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const ChatIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" className="w-4 h-4">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const CrownIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);
const RecordIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <circle cx="12" cy="12" r="8"/>
  </svg>
);
const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

/* --- Constants ------------------------------------------------------------ */
const BG = 'linear-gradient(135deg,#060b18 0%,#0d1526 40%,#0f0c29 100%)';
const GLASS = {
  background: 'rgba(255,255,255,0.05)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.10)',
};
const GLASS_DARK = {
  background: 'rgba(0,0,0,0.35)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.08)',
};

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '👏', '🎉'];

/* --- CSS keyframes injected once ----------------------------------------- */
const STYLE_TAG_ID = 'vp-keyframes';
if (typeof document !== 'undefined' && !document.getElementById(STYLE_TAG_ID)) {
  const s = document.createElement('style');
  s.id = STYLE_TAG_ID;
  s.textContent = `
    @keyframes floatUp {
      0%   { transform: translateY(0) scale(1); opacity: 1; }
      100% { transform: translateY(-120px) scale(1.6); opacity: 0; }
    }
    @keyframes handPulse {
      0%,100% { transform: scale(1); }
      50%      { transform: scale(1.25); }
    }
    .vp-reaction-float { animation: floatUp 2s ease-out forwards; }
    .vp-hand-pulse     { animation: handPulse 0.8s ease-in-out infinite; }
  `;
  document.head.appendChild(s);
}

/* --- VideoTile (defined OUTSIDE VideoPlayer so React never unmounts the <video>) ---- */
const VideoTile = ({ stream, label, isLocal, socketId, vidOff, audOff, handUp, speaking,
                     screenSharing: localSS, isSpot, isHost, onSpotlight }) => {
  const videoRef = useRef(null);

  // Set srcObject whenever the stream prop changes (safe & stable - no re-mount issue)
  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream ?? null;
  }, [stream]);

  return (
    <div
      className="relative rounded-2xl overflow-hidden cursor-pointer select-none"
      style={{
        ...GLASS_DARK,
        ...(speaking ? { boxShadow: '0 0 0 3px rgba(99,210,60,0.7)' } : {}),
      }}
      onClick={() => { if (!isLocal && socketId) onSpotlight(socketId); }}
    >
      <video
        ref={videoRef}
        autoPlay
        muted={isLocal}
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ display: 'block', transform: isLocal && !localSS ? 'scaleX(-1)' : 'none' }}
      />
      {vidOff && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(10,10,30,0.92)' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white"
            style={{ background: isLocal ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : 'linear-gradient(135deg,#2563eb,#4f46e5)' }}>
            {label.charAt(0).toUpperCase()}
          </div>
        </div>
      )}
      {!isLocal && !stream && !vidOff && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2" style={{ background: 'rgba(10,10,30,0.88)' }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white" style={{ background: 'linear-gradient(135deg,#2563eb,#4f46e5)' }}>
            {label.charAt(0).toUpperCase()}
          </div>
          <div className="flex gap-1">
            {[0,1,2].map((i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
          </div>
        </div>
      )}
      {handUp && <div className="vp-hand-pulse absolute top-2 right-2 text-2xl z-20">✋</div>}
      <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs text-white font-medium z-10"
        style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}>
        {isLocal && isHost && <CrownIcon />}
        {label}
        {isLocal && localSS && <span className="ml-1 text-blue-300">● Screen</span>}
      </div>
      {audOff && (
        <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-red-500/80 flex items-center justify-center z-10">
          <MicOffIcon />
        </div>
      )}
      {!isLocal && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-10"
          style={{ background: 'rgba(0,0,0,0.3)' }}>
          <span className="text-white text-xs bg-black/60 px-3 py-1 rounded-full">
            {isSpot ? 'Click to unpin' : 'Click to spotlight'}
          </span>
        </div>
      )}
    </div>
  );
};

/* --- FloatingReaction ---------------------------------------------------- */
const FloatingReaction = ({ emoji, x, id, onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 2100);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="vp-reaction-float pointer-events-none select-none absolute z-50 text-3xl" style={{ left: x, bottom: 80 }}>
      {emoji}
    </div>
  );
};

/* ========================================================================= */
/*  Main Component                                                           */
/* ========================================================================= */
const VideoPlayer = ({ sessionId, isHost, onEnd, pendingApprovals = [], onApprove }) => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const localVideoRef  = useRef(null);
  const peersRef       = useRef({});
  const localStreamRef = useRef(null);
  const chatBottomRef  = useRef(null);
  const animFrameRef   = useRef(null);

  const [remoteStreams,    setRemoteStreams]    = useState({});
  const [videoEnabled,     setVideoEnabled]     = useState(true);
  const [audioEnabled,     setAudioEnabled]     = useState(true);
  const [screenSharing,    setScreenSharing]    = useState(false);
  const [error,            setError]            = useState('');
  const [duration,         setDuration]         = useState(0);
  const [panel,            setPanel]            = useState(null);
  const [layout,           setLayout]           = useState('grid');
  const [spotlightId,      setSpotlightId]      = useState(null);
  const [handRaised,       setHandRaised]       = useState(false);
  const [raisedHands,      setRaisedHands]      = useState({});
  const [peerMediaState,   setPeerMediaState]   = useState({});
  const [floatingReactions,setFloatingReactions]= useState([]);
  const [chatMessages,     setChatMessages]     = useState([]);
  const [chatInput,        setChatInput]        = useState('');
  const [unreadCount,      setUnreadCount]      = useState(0);
  const [isRecording,      setIsRecording]      = useState(false);
  const [isSpeaking,       setIsSpeaking]       = useState(false);
  const [localStream,      setLocalStream]      = useState(null);

  const togglePanel = (name) => setPanel((p) => (p === name ? null : name));

  /* --- Timer --------------------------------------------------------------- */
  useEffect(() => {
    const t = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const formatDuration = (s) => {
    const h   = Math.floor(s / 3600);
    const m   = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return h > 0 ? `${h}:${m}:${sec}` : `${m}:${sec}`;
  };

  /* --- Local media --------------------------------------------------------- */
  useEffect(() => {
    const peers = peersRef.current;
    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        startAudioDetection(stream);
      } catch (e) {
        setError('Camera/mic unavailable: ' + e.message);
      }
    };
    start();
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      Object.values(peers).forEach((pc) => pc.close());
    };
  }, []); // eslint-disable-line

  const startAudioDetection = (stream) => {
    try {
      const ctx     = new (window.AudioContext || window.webkitAudioContext)();
      const src     = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      src.connect(analyser);
      const data = new Uint8Array(analyser.fftSize);
      const tick = () => {
        analyser.getByteTimeDomainData(data);
        const rms = Math.sqrt(data.reduce((a, v) => a + (v - 128) ** 2, 0) / data.length);
        setIsSpeaking(rms > 8);
        animFrameRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {}
  };

  /* --- Join room ----------------------------------------------------------- */
  useEffect(() => {
    if (!socket || !sessionId) return;
    socket.emit('joinVideoRoom', { roomId: sessionId, userId: user._id, userName: user.name });
  }, [socket, sessionId, user]); // eslint-disable-line

  /* --- Peer connection factory --------------------------------------------- */
  const createPeerConnection = useCallback((targetSocketId) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    localStreamRef.current?.getTracks().forEach((t) => pc.addTrack(t, localStreamRef.current));
    pc.onicecandidate = (e) => {
      if (e.candidate && socket)
        socket.emit('iceCandidate', { candidate: e.candidate, targetSocketId, fromSocketId: socket.id });
    };
    pc.ontrack = (e) => {
      const [s] = e.streams;
      setRemoteStreams((p) => ({ ...p, [targetSocketId]: { ...p[targetSocketId], stream: s } }));
    };
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setRemoteStreams((p) => { const n = { ...p }; delete n[targetSocketId]; return n; });
        delete peersRef.current[targetSocketId];
      }
    };
    peersRef.current[targetSocketId] = pc;
    return pc;
  }, [socket]);

  /* --- Chat scroll --------------------------------------------------------- */
  const panelRef = useRef(panel);
  useEffect(() => { panelRef.current = panel; }, [panel]);
  useEffect(() => {
    if (chatMessages.length === 0) return;
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (panelRef.current !== 'chat') setUnreadCount((c) => c + 1);
  }, [chatMessages]);

  /* --- Socket handlers ----------------------------------------------------- */
  useEffect(() => {
    if (!socket) return;

    const handleUserJoined = async ({ userId, userName, socketId }) => {
      setRemoteStreams((p) => ({ ...p, [socketId]: { stream: null, userId, userName } }));
      const pc = createPeerConnection(socketId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('videoOffer', { offer, roomId: sessionId, targetSocketId: socketId, fromSocketId: socket.id, fromUserId: user._id, fromUserName: user.name });
    };
    const handleVideoOffer = async ({ offer, fromSocketId, fromUserId, fromUserName }) => {
      setRemoteStreams((p) => ({ ...p, [fromSocketId]: { stream: null, userId: fromUserId, userName: fromUserName || '' } }));
      const pc = createPeerConnection(fromSocketId);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('videoAnswer', { answer, targetSocketId: fromSocketId, fromSocketId: socket.id });
    };
    const handleVideoAnswer = async ({ answer, fromSocketId }) => {
      const pc = peersRef.current[fromSocketId];
      if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
    };
    const handleIce = async ({ candidate, fromSocketId }) => {
      const pc = peersRef.current[fromSocketId];
      if (pc && candidate) { try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch {} }
    };
    const handleUserLeft = ({ socketId }) => {
      peersRef.current[socketId]?.close();
      delete peersRef.current[socketId];
      setRemoteStreams((p) => { const n = { ...p }; delete n[socketId]; return n; });
      setRaisedHands((p) => { const n = { ...p }; delete n[socketId]; return n; });
      setPeerMediaState((p) => { const n = { ...p }; delete n[socketId]; return n; });
    };
    const handleRaisedHand   = ({ userId, userName, socketId }) => setRaisedHands((p) => ({ ...p, [socketId]: { userId, userName } }));
    const handleLoweredHand  = ({ socketId }) => setRaisedHands((p) => { const n = { ...p }; delete n[socketId]; return n; });
    const handleChatMsg      = (msg) => setChatMessages((p) => [...p, msg]);
    const handleReaction     = ({ emoji, id }) => {
      const x = Math.floor(Math.random() * 70) + 10 + '%';
      setFloatingReactions((p) => [...p, { emoji, id, x }]);
    };
    const handleMediaState   = ({ socketId, videoEnabled: v, audioEnabled: a }) =>
      setPeerMediaState((p) => ({ ...p, [socketId]: { videoEnabled: v, audioEnabled: a } }));
    const handleMuteAll      = () => {
      const t = localStreamRef.current?.getAudioTracks()[0];
      if (t) { t.enabled = false; setAudioEnabled(false); }
    };

    socket.on('userJoinedRoom',       handleUserJoined);
    socket.on('videoOffer',           handleVideoOffer);
    socket.on('videoAnswer',          handleVideoAnswer);
    socket.on('iceCandidate',         handleIce);
    socket.on('userLeftRoom',         handleUserLeft);
    socket.on('userRaisedHand',       handleRaisedHand);
    socket.on('userLoweredHand',      handleLoweredHand);
    socket.on('roomChatMessage',      handleChatMsg);
    socket.on('reactionReceived',     handleReaction);
    socket.on('peerMediaStateChanged',handleMediaState);
    socket.on('muteAllRequest',       handleMuteAll);

    return () => {
      socket.off('userJoinedRoom',       handleUserJoined);
      socket.off('videoOffer',           handleVideoOffer);
      socket.off('videoAnswer',          handleVideoAnswer);
      socket.off('iceCandidate',         handleIce);
      socket.off('userLeftRoom',         handleUserLeft);
      socket.off('userRaisedHand',       handleRaisedHand);
      socket.off('userLoweredHand',      handleLoweredHand);
      socket.off('roomChatMessage',      handleChatMsg);
      socket.off('reactionReceived',     handleReaction);
      socket.off('peerMediaStateChanged',handleMediaState);
      socket.off('muteAllRequest',       handleMuteAll);
    };
  }, [socket, createPeerConnection, sessionId, user._id]); // eslint-disable-line

  /* --- Media helpers ------------------------------------------------------- */
  const emitMedia = (v, a) =>
    socket?.emit('mediaStateChanged', { roomId: sessionId, userId: user._id, videoEnabled: v, audioEnabled: a });

  const toggleVideo = () => {
    const t = localStreamRef.current?.getVideoTracks()[0];
    if (t) { t.enabled = !t.enabled; setVideoEnabled(t.enabled); emitMedia(t.enabled, audioEnabled); }
  };
  const toggleAudio = () => {
    const t = localStreamRef.current?.getAudioTracks()[0];
    if (t) { t.enabled = !t.enabled; setAudioEnabled(t.enabled); emitMedia(videoEnabled, t.enabled); }
  };
  const toggleScreenShare = async () => {
    if (screenSharing) return;
    try {
      const ss     = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const track  = ss.getVideoTracks()[0];
      Object.values(peersRef.current).forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
        if (sender) sender.replaceTrack(track);
      });
      if (localVideoRef.current) localVideoRef.current.srcObject = ss;
      setLocalStream(ss);
      setScreenSharing(true);
      socket?.emit('screenShareStarted', { roomId: sessionId, userId: user._id });
      track.onended = () => {
        const cam = localStreamRef.current?.getVideoTracks()[0];
        Object.values(peersRef.current).forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
          if (sender && cam) sender.replaceTrack(cam);
        });
        if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
        setLocalStream(localStreamRef.current);
        setScreenSharing(false);
        socket?.emit('screenShareStopped', { roomId: sessionId, userId: user._id });
      };
    } catch {}
  };

  const toggleHand = () => {
    if (!handRaised) {
      socket?.emit('raiseHand', { roomId: sessionId, userId: user._id, userName: user.name });
    } else {
      socket?.emit('lowerHand', { roomId: sessionId, userId: user._id });
    }
    setHandRaised((v) => !v);
  };

  const sendReaction = (emoji) => {
    socket?.emit('sendReaction', { roomId: sessionId, userId: user._id, userName: user.name, emoji });
    const x = Math.floor(Math.random() * 70) + 10 + '%';
    setFloatingReactions((p) => [...p, { emoji, id: Date.now() + Math.random(), x }]);
  };
  const removeReaction = useCallback((id) => setFloatingReactions((p) => p.filter((r) => r.id !== id)), []);

  const sendChatMessage = (e) => {
    e.preventDefault();
    const text = chatInput.trim();
    if (!text) return;
    const payload = { roomId: sessionId, userId: user._id, userName: user.name, message: text };
    socket?.emit('roomChatMessage', payload);
    setChatMessages((p) => [...p, { ...payload, id: Date.now() + Math.random(), isSelf: true, createdAt: new Date() }]);
    setChatInput('');
  };

  const muteAll = () => socket?.emit('muteAllRequest', { roomId: sessionId });

  const leaveSession = () => {
    socket?.emit('leaveVideoRoom', { roomId: sessionId, userId: user._id, userName: user.name });
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    Object.values(peersRef.current).forEach((pc) => pc.close());
    cancelAnimationFrame(animFrameRef.current);
    // Only the host triggers onEnd (which shows confirm + calls API to end session).
    // Non-hosts just navigate away without ending the session for everyone.
    if (isHost && onEnd) onEnd();
    else window.location.href = '/video';
  };

  /* --- Layout --------------------------------------------------------------- */
  const remoteEntries = Object.entries(remoteStreams);
  const totalPeers    = remoteEntries.length;
  const gridClass     =
    totalPeers === 0 ? 'grid-cols-1'
    : totalPeers === 1 ? 'grid-cols-2'
    : totalPeers <= 3  ? 'grid-cols-2'
    : 'grid-cols-2 md:grid-cols-3';

  /* ========================================================================= */
  return (
    <div className="flex h-full relative overflow-hidden" style={{ background: BG, height: '100%' }}>

      {/* Ambient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle,rgba(79,70,229,0.12) 0%,transparent 70%)', filter: 'blur(60px)' }}/>
      <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle,rgba(37,99,235,0.10) 0%,transparent 70%)', filter: 'blur(50px)' }}/>

      {/* Floating reactions */}
      {floatingReactions.map((r) => (
        <FloatingReaction key={r.id} emoji={r.emoji} x={r.x} id={r.id} onDone={() => removeReaction(r.id)} />
      ))}

      {/* Main column */}
      <div className="flex flex-col flex-1 min-w-0 relative">

        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-2.5 flex-shrink-0"
          style={{ ...GLASS_DARK, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"/>
              <span className="text-white/50 text-xs font-mono">{formatDuration(duration)}</span>
            </div>
            <div className="w-px h-4" style={{ background: 'rgba(255,255,255,0.15)' }}/>
            <span className="text-white/40 text-xs">{1 + totalPeers} participant{(1 + totalPeers) !== 1 ? 's' : ''}</span>
          </div>
          <p className="text-white/70 text-sm font-semibold hidden md:block">{isHost ? '🎓 ' : ''}Zedify Session</p>
          <div className="flex items-center gap-2">
            {isRecording && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs text-red-300 font-semibold animate-pulse"
                style={{ background: 'rgba(220,38,38,0.2)', border: '1px solid rgba(220,38,38,0.35)' }}>
                <RecordIcon /> REC
              </div>
            )}
            <button onClick={() => { setLayout((l) => (l === 'grid' ? 'spotlight' : 'grid')); setSpotlightId(null); }}
              className="text-white/40 hover:text-white/70 transition-colors text-xs px-2 py-1 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {layout === 'grid' ? 'Spotlight' : 'Grid'}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-300 flex-shrink-0"
            style={{ background: 'rgba(220,38,38,0.2)', borderBottom: '1px solid rgba(220,38,38,0.3)' }}>
            <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0"/>{error}
          </div>
        )}

        {/* Video grid */}
        <div className={`flex-1 p-3 overflow-hidden ${layout === 'spotlight' && spotlightId ? '' : `grid gap-3 ${gridClass}`}`}
          style={{ minHeight: 0, gridAutoRows: '1fr' }}>

          {layout === 'spotlight' && spotlightId ? (
            <div className="flex flex-col gap-2 h-full">
              <div className="flex-1 min-h-0">
                {remoteStreams[spotlightId] && (() => {
                  const ms = peerMediaState[spotlightId] || {};
                  return (
                    <VideoTile
                      stream={remoteStreams[spotlightId].stream}
                      label={remoteStreams[spotlightId].userName || 'Participant'}
                      isLocal={false}
                      socketId={spotlightId}
                      vidOff={ms.videoEnabled === false}
                      audOff={ms.audioEnabled === false}
                      handUp={!!raisedHands[spotlightId]}
                      speaking={false}
                      screenSharing={false}
                      isSpot={true}
                      isHost={false}
                      onSpotlight={(sid) => { setSpotlightId((p) => p === sid ? null : sid); setLayout('spotlight'); }}
                    />
                  );
                })()}
              </div>
              <div className="flex gap-2 h-28 flex-shrink-0 overflow-x-auto">
                <div className="w-44 flex-shrink-0 h-full">
                  <VideoTile
                    stream={localStream}
                    label={`${user.name} (You)`}
                    isLocal
                    socketId={null}
                    vidOff={!videoEnabled}
                    audOff={!audioEnabled}
                    handUp={handRaised}
                    speaking={isSpeaking}
                    screenSharing={screenSharing}
                    isSpot={false}
                    isHost={isHost}
                    onSpotlight={() => {}}
                  />
                </div>
                {remoteEntries.filter(([sid]) => sid !== spotlightId).map(([sid, { stream, userName }]) => {
                  const ms = peerMediaState[sid] || {};
                  return (
                    <div key={sid} className="w-44 flex-shrink-0 h-full">
                      <VideoTile
                        stream={stream}
                        label={userName || 'Participant'}
                        isLocal={false}
                        socketId={sid}
                        vidOff={ms.videoEnabled === false}
                        audOff={ms.audioEnabled === false}
                        handUp={!!raisedHands[sid]}
                        speaking={false}
                        screenSharing={false}
                        isSpot={false}
                        isHost={false}
                        onSpotlight={(s) => { setSpotlightId((p) => p === s ? null : s); setLayout('spotlight'); }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              <VideoTile
                stream={localStream}
                label={`${user.name} (You)`}
                isLocal
                socketId={null}
                vidOff={!videoEnabled}
                audOff={!audioEnabled}
                handUp={handRaised}
                speaking={isSpeaking}
                screenSharing={screenSharing}
                isSpot={false}
                isHost={isHost}
                onSpotlight={() => {}}
              />
              {remoteEntries.map(([sid, { stream, userName }]) => {
                const ms = peerMediaState[sid] || {};
                return (
                  <VideoTile
                    key={sid}
                    stream={stream}
                    label={userName || 'Participant'}
                    isLocal={false}
                    socketId={sid}
                    vidOff={ms.videoEnabled === false}
                    audOff={ms.audioEnabled === false}
                    handUp={!!raisedHands[sid]}
                    speaking={false}
                    screenSharing={false}
                    isSpot={sid === spotlightId}
                    isHost={false}
                    onSpotlight={(s) => { setSpotlightId((p) => p === s ? null : s); setLayout('spotlight'); }}
                  />
                );
              })}
            </>
          )}
        </div>

        {/* Control bar */}
        <div className="flex-shrink-0 py-3 px-4" style={{ ...GLASS_DARK, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center justify-center gap-2 flex-wrap">

            <CtrlBtn onClick={toggleAudio} active={!audioEnabled} activeColor="rgba(239,68,68,0.80)" label={audioEnabled ? 'Mute' : 'Unmute'}>
              {audioEnabled ? <MicIcon/> : <MicOffIcon/>}
            </CtrlBtn>
            <CtrlBtn onClick={toggleVideo} active={!videoEnabled} activeColor="rgba(239,68,68,0.80)" label={videoEnabled ? 'Camera' : 'No Cam'}>
              {videoEnabled ? <VideoIcon/> : <VideoOffIcon/>}
            </CtrlBtn>
            <CtrlBtn onClick={toggleScreenShare} active={screenSharing} activeColor="rgba(99,102,241,0.80)" label={screenSharing ? 'Sharing' : 'Share'}>
              <ScreenShareIcon/>
            </CtrlBtn>
            <CtrlBtn onClick={toggleHand} active={handRaised} activeColor="rgba(245,158,11,0.80)" label={handRaised ? 'Lower' : 'Hand'}>
              <span className="text-lg leading-none">{handRaised ? '✋' : '🙋'}</span>
            </CtrlBtn>
            <ReactPicker onPick={sendReaction}/>
            <CtrlBtn onClick={() => { togglePanel('chat'); setUnreadCount(0); }} active={panel === 'chat'} activeColor="rgba(99,102,241,0.70)" label="Chat" badge={panel !== 'chat' && unreadCount > 0 ? unreadCount : null}>
              <ChatIcon/>
            </CtrlBtn>
            <CtrlBtn onClick={() => togglePanel('participants')} active={panel === 'participants'} activeColor="rgba(99,102,241,0.70)" label="People" badge={1 + totalPeers}>
              <UsersIcon/>
            </CtrlBtn>
            <CtrlBtn onClick={() => togglePanel('settings')} active={panel === 'settings'} activeColor="rgba(99,102,241,0.70)" label="Settings">
              <SettingsIcon/>
            </CtrlBtn>
            <CtrlBtn onClick={() => setIsRecording((v) => !v)} active={isRecording} activeColor="rgba(220,38,38,0.75)" label={isRecording ? 'Stop Rec' : 'Record'}>
              <span className={`text-sm font-bold ${isRecording ? 'text-red-300' : 'text-white/70'}`}>REC</span>
            </CtrlBtn>

            <div className="w-px h-10 mx-1" style={{ background: 'rgba(255,255,255,0.12)' }}/>

            <button onClick={leaveSession} title={isHost ? 'End Session' : 'Leave'} className="flex flex-col items-center gap-1 group">
              <span className="w-14 h-12 rounded-2xl flex items-center justify-center text-white transition-all duration-200 hover:scale-110 active:scale-95"
                style={{ background: 'rgba(220,38,38,0.85)', border: '1px solid rgba(239,68,68,0.4)', boxShadow: '0 0 20px rgba(220,38,38,0.35)' }}>
                <PhoneOffIcon/>
              </span>
              <span className="text-[10px] text-red-400 group-hover:text-red-300 font-medium">{isHost ? 'End' : 'Leave'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      {panel && (
        <div className="w-72 flex-shrink-0 flex flex-col" style={{ ...GLASS, borderLeft: '1px solid rgba(255,255,255,0.08)' }}>

          {/* Chat */}
          {panel === 'chat' && (<>
            <SBHeader title="In-call Chat" icon={<ChatIcon/>} onClose={() => setPanel(null)}/>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {chatMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <span className="text-3xl">💬</span>
                  <p className="text-xs text-white/40">No messages yet. Say hi!</p>
                </div>
              )}
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex flex-col gap-0.5 ${msg.isSelf ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] text-white/30 px-1">{msg.isSelf ? 'You' : msg.userName}</span>
                  <div className="max-w-[90%] px-3 py-2 rounded-2xl text-sm text-white break-words"
                    style={{ background: msg.isSelf ? 'rgba(99,102,241,0.55)' : 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {msg.message}
                  </div>
                </div>
              ))}
              <div ref={chatBottomRef}/>
            </div>
            <form onSubmit={sendChatMessage} className="p-3 flex gap-2 flex-shrink-0"
              style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <input value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 outline-none"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}/>
              <button type="submit" className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 flex-shrink-0"
                style={{ background: 'rgba(99,102,241,0.75)' }}>
                <SendIcon/>
              </button>
            </form>
          </>)}

          {/* Participants */}
          {panel === 'participants' && (<>
            <SBHeader title="Participants" icon={<UsersIcon/>} badge={1 + totalPeers} onClose={() => setPanel(null)}/>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              
              {isHost && pendingApprovals.length > 0 && (
                 <div className="mb-4">
                    <SBSection>Waiting Room ({pendingApprovals.length})</SBSection>
                    {pendingApprovals.map((p, i) => (
                       <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-amber-500/5 border border-amber-500/10 mb-2">
                          <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center font-bold text-amber-500 text-xs">{(p.name || '').charAt(0)}</div>
                             <span className="text-xs text-white/80 font-semibold">{p.name || 'Anonymous'}</span>
                          </div>
                          <button onClick={() => onApprove(p._id || p)} className="bg-emerald-600 hover:bg-emerald-500 px-3 py-1 rounded-lg text-[10px] font-bold text-white transition-all active:scale-95">Approve</button>
                       </div>
                    ))}
                    <div className="w-full h-px bg-white/5 my-3" />
                 </div>
              )}

              <PRow name={user.name} role={isHost ? 'Host · You' : 'You'} grad="linear-gradient(135deg,#4f46e5,#7c3aed)"
                audioOff={!audioEnabled} videoOff={!videoEnabled} handUp={handRaised} highlight={isHost}/>
              {remoteEntries.map(([sid, { userName }]) => {
                const ms = peerMediaState[sid] || {};
                return <PRow key={sid} name={userName || 'Participant'} role="Participant" grad="linear-gradient(135deg,#2563eb,#4f46e5)"
                  audioOff={ms.audioEnabled === false} videoOff={ms.videoEnabled === false} handUp={!!raisedHands[sid]}/>;
              })}
              {totalPeers === 0 && (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <span className="text-2xl">👋</span>
                  <p className="text-xs text-white/40">Waiting for others to join</p>
                </div>
              )}
            </div>
            {isHost && totalPeers > 0 && (
              <div className="p-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <button onClick={muteAll} className="w-full py-2 rounded-xl text-sm font-semibold text-red-300 transition-all hover:bg-red-500/20"
                  style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}>
                  Mute Everyone
                </button>
              </div>
            )}
          </>)}

          {/* Settings */}
          {panel === 'settings' && (<>
            <SBHeader title="Settings" icon={<SettingsIcon/>} onClose={() => setPanel(null)}/>
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              <div>
                <SBSection>Layout</SBSection>
                <div className="grid grid-cols-2 gap-2">
                  {[{ k:'grid', l:'Grid', d:'All equal tiles' }, { k:'spotlight', l:'Spotlight', d:'Focus speaker' }].map(({ k, l, d }) => (
                    <button key={k} onClick={() => { setLayout(k); if(k==='grid') setSpotlightId(null); }}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all"
                      style={{ background: layout===k ? 'rgba(99,102,241,0.20)' : 'rgba(255,255,255,0.04)', border: layout===k ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.08)' }}>
                      <span className="text-white text-xs font-semibold">{l}</span>
                      <span className="text-[10px] text-white/40">{d}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <SBSection>Connection</SBSection>
                <div className="space-y-2">
                  {[
                    { label:'Video Quality', value: videoEnabled?'HD (720p)':'Off',  dot:'bg-emerald-400' },
                    { label:'Audio Quality', value: audioEnabled?'48 kHz':'Muted', dot:'bg-emerald-400' },
                    { label:'Protocol',      value:'WebRTC P2P',                    dot:'bg-indigo-400'  },
                    { label:'Encryption',    value:'DTLS-SRTP',                     dot:'bg-purple-400'  },
                  ].map(({ label, value, dot }) => <IRow key={label} label={label} value={value} dot={dot}/>)}
                </div>
              </div>
              <div>
                <SBSection>Session</SBSection>
                <div className="space-y-2">
                  {[
                    { label:'Participants',  value: 1 + totalPeers },
                    { label:'Duration',      value: formatDuration(duration) },
                    { label:'Your Role',     value: isHost ? '👑 Host' : 'Participant' },
                    { label:'Raised Hands',  value: Object.keys(raisedHands).length + (handRaised ? 1 : 0) },
                  ].map(({ label, value }) => <IRow key={label} label={label} value={value}/>)}
                </div>
              </div>
            </div>
          </>)}
        </div>
      )}
    </div>
  );
};

/* --- Helper sub-components ----------------------------------------------- */
const CtrlBtn = ({ onClick, active, activeColor, label, children, badge }) => (
  <button onClick={onClick} className="flex flex-col items-center gap-1 group">
    <span className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 active:scale-95 relative"
      style={{ background: active ? activeColor : 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)' }}>
      {children}
      {badge != null && (
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
          style={{ background: 'rgba(99,102,241,0.9)' }}>{badge}</span>
      )}
    </span>
    <span className="text-[10px] text-white/40 group-hover:text-white/70 transition-colors">{label}</span>
  </button>
);

const ReactPicker = ({ onPick }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative flex flex-col items-center">
      {open && (
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex gap-1 p-2 rounded-2xl z-50"
          style={{ background: 'rgba(15,15,40,0.95)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(20px)' }}>
          {REACTION_EMOJIS.map((e) => (
            <button key={e} onClick={() => { onPick(e); setOpen(false); }}
              className="text-2xl hover:scale-125 transition-transform active:scale-110 p-0.5">{e}</button>
          ))}
        </div>
      )}
      <CtrlBtn onClick={() => setOpen((v) => !v)} active={open} activeColor="rgba(99,102,241,0.70)" label="React">
        <span className="text-xl leading-none">😊</span>
      </CtrlBtn>
    </div>
  );
};

const SBHeader = ({ title, icon, badge, onClose }) => (
  <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
    style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
    <div className="flex items-center gap-2 text-white font-semibold text-sm">
      {icon}<span>{title}</span>
      {badge != null && <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ background: 'rgba(99,102,241,0.7)' }}>{badge}</span>}
    </div>
    <button onClick={onClose} className="text-white/40 hover:text-white p-1 transition-colors"><XIcon/></button>
  </div>
);

const SBSection = ({ children }) => (
  <p className="text-xs font-semibold mb-3" style={{ color: 'rgba(148,163,184,0.7)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{children}</p>
);

const IRow = ({ label, value, dot }) => (
  <div className="flex items-center justify-between px-3 py-2.5 rounded-xl"
    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
    <span className="text-xs text-white/60">{label}</span>
    <div className="flex items-center gap-1.5">
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dot}`}/>}
      <span className="text-xs text-white font-medium">{value}</span>
    </div>
  </div>
);

const PRow = ({ name, role, grad, audioOff, videoOff, handUp, highlight }) => (
  <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
    style={{ background: highlight ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.04)', border: highlight ? '1px solid rgba(99,102,241,0.2)' : '1px solid rgba(255,255,255,0.08)' }}>
    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: grad }}>
      {name.charAt(0).toUpperCase()}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-white truncate">{name}</p>
      <p className="text-[10px]" style={{ color: 'rgba(148,163,184,0.6)' }}>{role}</p>
    </div>
    <div className="flex items-center gap-1 flex-shrink-0">
      {handUp && <span className="text-base">✋</span>}
      {audioOff && <div className="w-4 h-4 rounded-full bg-red-500/70 flex items-center justify-center"><MicOffIcon/></div>}
      {videoOff && <div className="w-4 h-4 rounded-full bg-red-500/70 flex items-center justify-center"><VideoOffIcon/></div>}
      {!audioOff && !videoOff && !handUp && <div className="w-2 h-2 rounded-full bg-emerald-400"/>}
    </div>
  </div>
);

export default VideoPlayer;