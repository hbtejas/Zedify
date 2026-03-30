import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { chatAPI, videoAPI } from '../services/api';

const I = {
  video: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M4 8h8a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4a2 2 0 012-2z" /></svg>,
  send:  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>,
};

const ChatBox = ({ recipient }) => {
  const { user } = useAuth();
  const { socket, isUserOnline } = useSocket();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const [startingCall, setStartingCall] = useState(false);
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const handleVideoCall = async () => {
    if (!recipient || startingCall) return;
    setStartingCall(true);
    try {
      const { data } = await videoAPI.createSession(`Call with ${recipient.name}`, `Direct video call`);
      navigate(`/video/session/${data.data._id}`);
    } catch { navigate('/video'); }
    finally { setStartingCall(false); }
  };

  useEffect(() => {
    if (!recipient?._id) return;
    const fetch = async () => {
      setLoading(true);
      try { const { data } = await chatAPI.getConversation(recipient._id); setMessages(data.data); } catch {}
      setLoading(false);
    };
    fetch();
  }, [recipient?._id]);

  useEffect(() => {
    if (!socket) return;
    const handleReceive = (msg) => {
      const from = msg.senderId?._id || msg.senderId;
      const to   = msg.receiverId?._id || msg.receiverId;
      if ((from === recipient._id && to === user._id) || (from === user._id && to === recipient._id)) {
        setMessages(prev => [...prev.filter(m => m.tempId !== msg.tempId), msg]);
      }
    };
    const handleTyping     = ({ senderId }) => { if (senderId === recipient._id) setIsTyping(true); };
    const handleStopTyping = ({ senderId }) => { if (senderId === recipient._id) setIsTyping(false); };

    socket.on('receiveMessage', handleReceive); socket.on('messageSent', handleReceive);
    socket.on('userTyping', handleTyping);      socket.on('userStopTyping', handleStopTyping);

    return () => {
      socket.off('receiveMessage', handleReceive); socket.off('messageSent', handleReceive);
      socket.off('userTyping', handleTyping);      socket.off('userStopTyping', handleStopTyping);
    };
  }, [socket, recipient._id, user._id]);

  useEffect(() => { bottomRef.current?.scrollIntoView(); }, [messages, isTyping]);

  const handleInput = (e) => {
    setInput(e.target.value);
    if (socket) {
      socket.emit('typing', { senderId: user._id, receiverId: recipient._id });
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => socket.emit('stopTyping', { senderId: user._id, receiverId: recipient._id }), 1500);
    }
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || sending) return;

    const tempId = Date.now().toString();
    const optimistic = { tempId, senderId: { _id: user._id, name: user.name, profilePicture: user.profilePicture }, receiverId: { _id: recipient._id }, message: input.trim(), createdAt: new Date() };

    setMessages(prev => [...prev, optimistic]); setInput(''); setSending(true);

    try {
      if (socket) socket.emit('sendMessage', { senderId: user._id, receiverId: recipient._id, message: optimistic.message, tempId });
      await chatAPI.sendMessage(recipient._id, optimistic.message);
    } catch {}
    setSending(false);
  };

  const online = isUserOnline(recipient._id);

  return (
    <div className="flex flex-col h-full bg-transparent">
      
      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-6 py-4 flex-shrink-0 border-b border-white/10" style={{ background: 'var(--bg-2)' }}>
        <div className="relative">
          {recipient.profilePicture ? (
            <img src={recipient.profilePicture} className="avatar-md object-cover border border-white/10" />
          ) : (
            <div className="avatar-md bg-gradient-to-br from-indigo-500 to-purple-500 font-bold flex items-center justify-center text-white text-lg">
              {recipient.name?.charAt(0).toUpperCase()}
            </div>
          )}
          {online && <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-[2.5px] border-[var(--bg-2)]" />}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-base leading-tight truncate font-sans">{recipient.name}</p>
          <p className={`text-xs mt-0.5 font-bold uppercase tracking-wider ${online ? 'text-emerald-400' : 'text-[var(--text-muted)]'}`}>
            {online ? 'Online' : 'Offline'}
          </p>
        </div>

        <button onClick={handleVideoCall} disabled={startingCall} className="btn-secondary" style={{ padding: '8px 16px', background: 'rgba(99,102,241,0.1)' }} title="Start video call">
          {startingCall ? <div className="spinner-sm border-t-brand" /> : <><span className="text-[var(--brand-light)]">{I.video}</span> <span className="hidden sm:inline">Call</span></>}
        </button>
      </div>

      {/* ── Messages Area ── */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-full"><div className="spinner-md border-t-brand" /></div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-60">
            <div className="text-4xl mb-3">👋</div>
            <p className="text-sm font-bold text-white uppercase tracking-widest">Start a conversation</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMine = (msg.senderId?._id || msg.senderId) === user._id;
            return (
              <div key={msg._id || msg.tempId || idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                {!isMine && (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mr-3 self-end mb-1 bg-gradient-to-br from-indigo-500 to-purple-500 border border-white/10">
                    {recipient.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="max-w-[75%] px-4 py-3 text-sm shadow-lg leading-relaxed" style={isMine
                    ? { background: 'var(--brand)', borderRadius: '16px 16px 4px 16px', color: '#fff' }
                    : { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px 16px 16px 4px', color: 'rgba(235,240,245,0.95)' }
                }>
                  <p>{msg.message}</p>
                </div>
              </div>
            );
          })
        )}
        
        {isTyping && (
           <div className="flex justify-start items-end gap-3 mt-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 bg-gradient-to-br from-indigo-500 to-purple-500 border border-white/10">
                 {recipient.name?.charAt(0).toUpperCase()}
              </div>
              <div className="px-5 py-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px 16px 16px 4px' }}>
                 <div className="flex gap-1.5 items-center">
                    {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
                 </div>
              </div>
           </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Input Bar ── */}
      <form onSubmit={handleSend} className="px-6 py-4 flex-shrink-0 border-t border-white/5" style={{ background: 'var(--bg-2)' }}>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={handleInput}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend(e)}
            placeholder="Type a message..."
            className="input flex-1"
            style={{ paddingLeft: 20, paddingRight: 20, background: 'var(--bg)' }}
            autoComplete="off"
          />
          <button type="submit" disabled={!input.trim() || sending} className="btn-primary w-12 h-12 flex items-center justify-center rounded-xl disabled:opacity-50">
            {I.send}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatBox;
