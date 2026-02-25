import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

/*  SVG Icons  */
const MicIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);
const MicOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);
const VideoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
  </svg>
);
const VideoOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"/><line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const ScreenShareIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M13 3H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3"/><polyline points="8 21 12 17 16 21"/><polyline points="17 8 21 4 17 0"/><line x1="21" y1="4" x2="9" y2="4"/>
  </svg>
);
const PhoneOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.42 19.42 0 0 1 3.07 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 2 2.18 12.72 12.72 0 0 0 2.7.93a2 2 0 0 1 .45-2.11L4.42 0"/><line x1="23" y1="1" x2="1" y2="23"/>
  </svg>
);
const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" className="w-4 h-4">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
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

/*  Styles  */
const BG = 'linear-gradient(135deg,#060b18 0%,#0d1526 40%,#0f0c29 100%)';
const GLASS = { background:'rgba(255,255,255,0.05)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.10)' };
const GLASS_DARK = { background:'rgba(0,0,0,0.35)', backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)', border:'1px solid rgba(255,255,255,0.08)' };

/*  Main Component  */
const VideoPlayer = ({ sessionId, isHost, onEnd }) => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const localVideoRef = useRef(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [localStream, setLocalStream] = useState(null);
  const peersRef = useRef({});
  const remoteVideoRefs = useRef({});

  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [error, setError] = useState('');
  const [duration, setDuration] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [layout, setLayout] = useState('grid'); // 'grid' | 'spotlight'

  /* session timer */
  useEffect(() => {
    const t = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const formatDuration = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  /* start media */
  useEffect(() => {
    const startMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        setParticipants([{ id: user._id, name: user.name, isHost, isLocal: true }]);
      } catch (err) {
        setError('Could not access camera/microphone: ' + err.message);
      }
    };
    startMedia();
    const peersSnapshot = peersRef;
    return () => {
      const peers = peersSnapshot.current;
      if (localStream) localStream.getTracks().forEach((t) => t.stop());
      Object.values(peers).forEach((pc) => pc.close());
    };
  }, []); // eslint-disable-line

  useEffect(() => {
    if (!localStream || !socket || !sessionId) return;
    socket.emit('joinVideoRoom', { roomId: sessionId, userId: user._id, userName: user.name });
  }, [localStream, socket, sessionId, user]);

  const createPeerConnection = useCallback((targetSocketId) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    if (localStream) localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
    pc.onicecandidate = (e) => {
      if (e.candidate && socket) socket.emit('iceCandidate', { candidate: e.candidate, targetSocketId, fromSocketId: socket.id });
    };
    pc.ontrack = (e) => {
      const [remoteStream] = e.streams;
      setRemoteStreams((prev) => ({ ...prev, [targetSocketId]: { ...prev[targetSocketId], stream: remoteStream } }));
    };
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setRemoteStreams((prev) => { const n = { ...prev }; delete n[targetSocketId]; return n; });
        delete peersRef.current[targetSocketId];
      }
    };
    peersRef.current[targetSocketId] = pc;
    return pc;
  }, [localStream, socket]);

  useEffect(() => {
    if (!socket) return;
    const handleUserJoined = async ({ userId, userName, socketId }) => {
      setRemoteStreams((prev) => ({ ...prev, [socketId]: { stream: null, userId, userName } }));
      setParticipants((prev) => prev.find((p) => p.id === userId) ? prev : [...prev, { id: userId, name: userName, isHost: false, isLocal: false }]);
      const pc = createPeerConnection(socketId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('videoOffer', { offer, roomId: sessionId, targetSocketId: socketId, fromSocketId: socket.id, fromUserId: user._id });
    };
    const handleVideoOffer = async ({ offer, fromSocketId, fromUserId, fromUserName }) => {
      setRemoteStreams((prev) => ({ ...prev, [fromSocketId]: { stream: null, userId: fromUserId, userName: fromUserName || '' } }));
      setParticipants((prev) => prev.find((p) => p.id === fromUserId) ? prev : [...prev, { id: fromUserId, name: fromUserName || 'Participant', isHost: false, isLocal: false }]);
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
    const handleIceCandidate = async ({ candidate, fromSocketId }) => {
      const pc = peersRef.current[fromSocketId];
      if (pc && candidate) { try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch {} }
    };
    const handleUserLeft = ({ socketId }) => {
      if (peersRef.current[socketId]) { peersRef.current[socketId].close(); delete peersRef.current[socketId]; }
      setRemoteStreams((prev) => { const n = { ...prev }; delete n[socketId]; return n; });
    };
    socket.on('userJoinedRoom', handleUserJoined);
    socket.on('videoOffer', handleVideoOffer);
    socket.on('videoAnswer', handleVideoAnswer);
    socket.on('iceCandidate', handleIceCandidate);
    socket.on('userLeftRoom', handleUserLeft);
    return () => {
      socket.off('userJoinedRoom', handleUserJoined);
      socket.off('videoOffer', handleVideoOffer);
      socket.off('videoAnswer', handleVideoAnswer);
      socket.off('iceCandidate', handleIceCandidate);
      socket.off('userLeftRoom', handleUserLeft);
    };
  }, [socket, createPeerConnection, sessionId, user._id]);

  useEffect(() => {
    Object.entries(remoteStreams).forEach(([socketId, { stream }]) => {
      const el = remoteVideoRefs.current[socketId];
      if (el && stream && el.srcObject !== stream) el.srcObject = stream;
    });
  }, [remoteStreams]);

  const toggleVideo = () => {
    if (localStream) {
      const t = localStream.getVideoTracks()[0];
      if (t) { t.enabled = !t.enabled; setVideoEnabled(t.enabled); }
    }
  };
  const toggleAudio = () => {
    if (localStream) {
      const t = localStream.getAudioTracks()[0];
      if (t) { t.enabled = !t.enabled; setAudioEnabled(t.enabled); }
    }
  };
  const toggleScreenShare = async () => {
    if (screenSharing) return;
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = screenStream.getVideoTracks()[0];
      Object.values(peersRef.current).forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
        if (sender) sender.replaceTrack(screenTrack);
      });
      if (localVideoRef.current) localVideoRef.current.srcObject = screenStream;
      setScreenSharing(true);
      socket?.emit('screenShareStarted', { roomId: sessionId, userId: user._id });
      screenTrack.onended = () => {
        const cameraTrack = localStream?.getVideoTracks()[0];
        Object.values(peersRef.current).forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
          if (sender && cameraTrack) sender.replaceTrack(cameraTrack);
        });
        if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
        setScreenSharing(false);
        socket?.emit('screenShareStopped', { roomId: sessionId, userId: user._id });
      };
    } catch {}
  };
  const leaveSession = () => {
    socket?.emit('leaveVideoRoom', { roomId: sessionId, userId: user._id, userName: user.name });
    localStream?.getTracks().forEach((t) => t.stop());
    Object.values(peersRef.current).forEach((pc) => pc.close());
    window.location.href = '/video';
  };

  const remoteEntries = Object.entries(remoteStreams);
  const totalPeers = remoteEntries.length;

  // spotlight: first remote occupies first row fully
  const gridClass = layout === 'spotlight' && totalPeers > 0
    ? 'grid-cols-1'
    : totalPeers === 0
    ? 'grid-cols-1'
    : totalPeers === 1
    ? 'grid-cols-1 md:grid-cols-2'
    : totalPeers <= 3
    ? 'grid-cols-2'
    : 'grid-cols-2 md:grid-cols-3';

  return (
    <div className="flex h-full relative overflow-hidden" style={{ background: BG, height:'100%' }}>

      {/* Ambient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background:'radial-gradient(circle,rgba(79,70,229,0.12) 0%,transparent 70%)', filter:'blur(60px)' }} />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full pointer-events-none"
        style={{ background:'radial-gradient(circle,rgba(37,99,235,0.10) 0%,transparent 70%)', filter:'blur(50px)' }} />

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-300"
            style={{ background:'rgba(220,38,38,0.2)', borderBottom:'1px solid rgba(220,38,38,0.3)' }}>
            <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Video grid */}
        <div className={`flex-1 p-3 grid gap-3 ${gridClass}`} style={{ minHeight: 0, gridAutoRows:'1fr', overflow:'hidden' }}>

          {/* Local tile */}
          <div className="relative rounded-2xl overflow-hidden group" style={{ ...GLASS_DARK }}>
            <video ref={localVideoRef} autoPlay muted playsInline className="absolute inset-0 w-full h-full object-cover" style={{ display:'block', transform: screenSharing ? 'none' : 'scaleX(-1)' }} />

            {/* camera-off overlay */}
            {!videoEnabled && (
              <div className="absolute inset-0 flex items-center justify-center" style={{ background:'rgba(10,10,30,0.92)' }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                  style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              </div>
            )}

            {/* name badge */}
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs text-white font-medium"
              style={{ background:'rgba(0,0,0,0.55)', backdropFilter:'blur(8px)' }}>
              {isHost && <CrownIcon />}
              {user.name} (You){screenSharing && <span className="ml-1 text-blue-300"> Screen</span>}
            </div>

            {/* audio indicator */}
            {!audioEnabled && (
              <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center bg-red-500/80">
                <MicOffIcon />
              </div>
            )}
          </div>

          {/* Remote tiles */}
          {remoteEntries.map(([socketId, { stream, userName }]) => (
            <div key={socketId} className="relative rounded-2xl overflow-hidden" style={{ ...GLASS_DARK }}>
              <video ref={(el) => { remoteVideoRefs.current[socketId] = el; }} autoPlay playsInline
                className="absolute inset-0 w-full h-full object-cover" style={{ display:'block' }} />
              {!stream && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2"
                  style={{ background:'rgba(10,10,30,0.88)' }}>
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white"
                    style={{ background:'linear-gradient(135deg,#2563eb,#4f46e5)' }}>
                    {(userName || 'P').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex gap-1">
                    {[0,1,2].map((i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"
                        style={{ animationDelay:`${i*0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}
              <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full text-xs text-white font-medium"
                style={{ background:'rgba(0,0,0,0.55)', backdropFilter:'blur(8px)' }}>
                {userName || 'Participant'}
              </div>
            </div>
          ))}
        </div>

        {/* Control bar */}
        <div className="flex-shrink-0 py-4 px-6" style={{ ...GLASS_DARK, borderTop:'1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center justify-center gap-4">

            {/* Mic */}
            <button
              onClick={toggleAudio}
              title={audioEnabled ? 'Mute' : 'Unmute'}
              className="flex flex-col items-center gap-1 group"
            >
              <span className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 active:scale-95"
                style={{ background: audioEnabled ? 'rgba(255,255,255,0.12)' : 'rgba(239,68,68,0.80)', border:'1px solid rgba(255,255,255,0.15)' }}>
                {audioEnabled ? <MicIcon /> : <MicOffIcon />}
              </span>
              <span className="text-[10px] text-white/40 group-hover:text-white/70 transition-colors">{audioEnabled ? 'Mute' : 'Unmute'}</span>
            </button>

            {/* Camera */}
            <button
              onClick={toggleVideo}
              title={videoEnabled ? 'Stop Video' : 'Start Video'}
              className="flex flex-col items-center gap-1 group"
            >
              <span className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 active:scale-95"
                style={{ background: videoEnabled ? 'rgba(255,255,255,0.12)' : 'rgba(239,68,68,0.80)', border:'1px solid rgba(255,255,255,0.15)' }}>
                {videoEnabled ? <VideoIcon /> : <VideoOffIcon />}
              </span>
              <span className="text-[10px] text-white/40 group-hover:text-white/70 transition-colors">{videoEnabled ? 'Camera' : 'No Cam'}</span>
            </button>

            {/* Screen Share */}
            <button
              onClick={toggleScreenShare}
              title={screenSharing ? 'Sharing Screen' : 'Share Screen'}
              className="flex flex-col items-center gap-1 group"
            >
              <span className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 active:scale-95"
                style={{ background: screenSharing ? 'rgba(99,102,241,0.80)' : 'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.15)' }}>
                <ScreenShareIcon />
              </span>
              <span className="text-[10px] text-white/40 group-hover:text-white/70 transition-colors">{screenSharing ? 'Sharing' : 'Share'}</span>
            </button>

            {/* Participants */}
            <button
              onClick={() => { setShowParticipants((v) => !v); setShowSettings(false); }}
              title="Participants"
              className="flex flex-col items-center gap-1 group"
            >
              <span className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 active:scale-95 relative"
                style={{ background: showParticipants ? 'rgba(99,102,241,0.70)' : 'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.15)' }}>
                <UsersIcon />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                  style={{ background:'rgba(99,102,241,0.9)' }}>
                  {participants.length + totalPeers}
                </span>
              </span>
              <span className="text-[10px] text-white/40 group-hover:text-white/70 transition-colors">People</span>
            </button>

            {/* Settings */}
            <button
              onClick={() => { setShowSettings((v) => !v); setShowParticipants(false); }}
              title="Settings"
              className="flex flex-col items-center gap-1 group"
            >
              <span className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 active:scale-95"
                style={{ background: showSettings ? 'rgba(99,102,241,0.70)' : 'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.15)' }}>
                <SettingsIcon />
              </span>
              <span className="text-[10px] text-white/40 group-hover:text-white/70 transition-colors">Settings</span>
            </button>

            {/* Divider */}
            <div className="w-px h-10 mx-1" style={{ background:'rgba(255,255,255,0.12)' }} />

            {/* End / Leave */}
            <button
              onClick={leaveSession}
              title={isHost ? 'End Session' : 'Leave Session'}
              className="flex flex-col items-center gap-1 group"
            >
              <span className="w-14 h-12 rounded-2xl flex items-center justify-center text-white transition-all duration-200 hover:scale-110 active:scale-95"
                style={{ background:'rgba(220,38,38,0.85)', border:'1px solid rgba(239,68,68,0.4)', boxShadow:'0 0 20px rgba(220,38,38,0.35)' }}>
                <PhoneOffIcon />
              </span>
              <span className="text-[10px] text-red-400 group-hover:text-red-300 transition-colors font-medium">{isHost ? 'End' : 'Leave'}</span>
            </button>

          </div>

          {/* Timer */}
          <div className="flex justify-center mt-2">
            <span className="text-xs font-mono" style={{ color:'rgba(255,255,255,0.25)' }}>
              <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse mr-1.5" />
              {formatDuration(duration)}
            </span>
          </div>
        </div>
      </div>

      {/* Participants sidebar */}
      {showParticipants && (        <div className="w-64 flex-shrink-0 flex flex-col" style={{ ...GLASS, borderLeft:'1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <UsersIcon />
              <span>Participants</span>
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                style={{ background:'rgba(99,102,241,0.7)' }}>
                {1 + totalPeers}
              </span>
            </div>
            <button onClick={() => setShowParticipants(false)} className="text-white/40 hover:text-white p-1 transition-colors">
              <XIcon />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {/* Self */}
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.2)' }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-[10px]" style={{ color:'rgba(148,163,184,0.7)' }}>{isHost ? 'Host  You' : 'You'}</p>
              </div>
              <div className="flex gap-1">
                {!audioEnabled && <div className="w-4 h-4 rounded-full bg-red-500/70 flex items-center justify-center"><MicOffIcon /></div>}
                {!videoEnabled && <div className="w-4 h-4 rounded-full bg-red-500/70 flex items-center justify-center"><VideoOffIcon /></div>}
              </div>
            </div>

            {/* Remote participants */}
            {remoteEntries.map(([socketId, { userName }]) => (
              <div key={socketId} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background:'linear-gradient(135deg,#2563eb,#4f46e5)' }}>
                  {(userName || 'P').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{userName || 'Participant'}</p>
                  <p className="text-[10px]" style={{ color:'rgba(148,163,184,0.6)' }}>Participant</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" title="Connected" />
              </div>
            ))}

            {totalPeers === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
                  style={{ background:'rgba(255,255,255,0.06)' }}>
                  <UsersIcon />
                </div>
                <p className="text-xs" style={{ color:'rgba(148,163,184,0.6)' }}>Waiting for others to join</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings panel */}
      {showSettings && (
        <div className="w-72 flex-shrink-0 flex flex-col" style={{ ...GLASS, borderLeft:'1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <SettingsIcon />
              <span>Settings</span>
            </div>
            <button onClick={() => setShowSettings(false)} className="text-white/40 hover:text-white p-1 transition-colors">
              <XIcon />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5">

            {/* Layout */}
            <div>
              <p className="text-xs font-semibold mb-3" style={{ color:'rgba(148,163,184,0.7)', letterSpacing:'0.06em', textTransform:'uppercase' }}>Layout</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key:'grid', label:'Grid', desc:'All equal tiles' },
                  { key:'spotlight', label:'Spotlight', desc:'Focus speaker' },
                ].map(({ key, label, desc }) => (
                  <button key={key} onClick={() => setLayout(key)}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-center transition-all"
                    style={{
                      background: layout === key ? 'rgba(99,102,241,0.20)' : 'rgba(255,255,255,0.04)',
                      border: layout === key ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.08)',
                    }}>
                    <div className="w-10 h-7 rounded-md flex items-center justify-center" style={{ background: layout === key ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)' }}>
                      {key === 'grid'
                        ? <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 text-white/70"><rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg>
                        : <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 text-white/70"><rect x="1" y="1" width="14" height="9" rx="1"/><rect x="1" y="12" width="6" height="3" rx="1"/><rect x="9" y="12" width="6" height="3" rx="1"/></svg>
                      }
                    </div>
                    <span className="text-white text-xs font-semibold">{label}</span>
                    <span className="text-[10px]" style={{ color:'rgba(148,163,184,0.5)' }}>{desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Audio/Video Quality */}
            <div>
              <p className="text-xs font-semibold mb-3" style={{ color:'rgba(148,163,184,0.7)', letterSpacing:'0.06em', textTransform:'uppercase' }}>Connection</p>
              <div className="space-y-2">
                {[
                  { label:'Video Quality', value: videoEnabled ? 'HD (720p)' : 'Off', dot:'bg-emerald-400' },
                  { label:'Audio Quality', value: audioEnabled ? '48 kHz' : 'Muted', dot:'bg-emerald-400' },
                  { label:'Protocol', value:'WebRTC P2P', dot:'bg-indigo-400' },
                  { label:'Encryption', value:'DTLS-SRTP', dot:'bg-purple-400' },
                ].map(({ label, value, dot }) => (
                  <div key={label} className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                    style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }}>
                    <span className="text-xs text-white/60">{label}</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                      <span className="text-xs text-white font-medium">{value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Session Info */}
            <div>
              <p className="text-xs font-semibold mb-3" style={{ color:'rgba(148,163,184,0.7)', letterSpacing:'0.06em', textTransform:'uppercase' }}>Session Info</p>
              <div className="space-y-2">
                {[
                  { label:'Participants', value: 1 + totalPeers },
                  { label:'Duration', value: formatDuration(duration) },
                  { label:'Your Role', value: isHost ? 'Host' : 'Participant' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                    style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }}>
                    <span className="text-xs text-white/60">{label}</span>
                    <span className="text-xs text-white font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;