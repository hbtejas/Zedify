import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { chatAPI } from '../services/api';

const GLASS_DARK = { background: 'rgba(0,0,0,0.30)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)' };

const ChatBox = ({ recipient }) => {
  const { user } = useAuth();
  const { socket, isUserOnline } = useSocket();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Fetch conversation
  useEffect(() => {
    if (!recipient?._id) return;
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const { data } = await chatAPI.getConversation(recipient._id);
        setMessages(data.data);
      } catch {}
      setLoading(false);
    };
    fetchMessages();
  }, [recipient?._id]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleReceive = (msg) => {
      const from = msg.senderId?._id || msg.senderId;
      const to   = msg.receiverId?._id || msg.receiverId;
      if (
        (from === recipient._id && to === user._id) ||
        (from === user._id     && to === recipient._id)
      ) {
        setMessages((prev) => {
          const filtered = prev.filter((m) => m.tempId !== msg.tempId);
          return [...filtered, msg];
        });
      }
    };

    const handleTyping     = ({ senderId }) => { if (senderId === recipient._id) setIsTyping(true); };
    const handleStopTyping = ({ senderId }) => { if (senderId === recipient._id) setIsTyping(false); };

    socket.on('receiveMessage', handleReceive);
    socket.on('messageSent',    handleReceive);
    socket.on('userTyping',     handleTyping);
    socket.on('userStopTyping', handleStopTyping);

    return () => {
      socket.off('receiveMessage', handleReceive);
      socket.off('messageSent',    handleReceive);
      socket.off('userTyping',     handleTyping);
      socket.off('userStopTyping', handleStopTyping);
    };
  }, [socket, recipient._id, user._id]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (socket) {
      socket.emit('typing', { senderId: user._id, receiverId: recipient._id });
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stopTyping', { senderId: user._id, receiverId: recipient._id });
      }, 1500);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const tempId = Date.now().toString();
    const optimistic = {
      tempId,
      senderId:   { _id: user._id, name: user.name, profilePicture: user.profilePicture },
      receiverId: { _id: recipient._id },
      message:    input.trim(),
      createdAt:  new Date(),
    };

    setMessages((prev) => [...prev, optimistic]);
    setInput('');
    setSending(true);

    try {
      if (socket) {
        socket.emit('sendMessage', {
          senderId:   user._id,
          receiverId: recipient._id,
          message:    optimistic.message,
          tempId,
        });
      }
      await chatAPI.sendMessage(recipient._id, optimistic.message);
    } catch {}
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) handleSend(e);
  };

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const online = isUserOnline(recipient._id);

  return (
    <div className="flex flex-col h-full">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0" style={{ ...GLASS_DARK, borderBottom: '1px solid rgba(255,255,255,0.07)', borderRadius: 0 }}>
        <div className="relative">
          {recipient.profilePicture ? (
            <img src={recipient.profilePicture} alt={recipient.name} className="w-10 h-10 rounded-xl object-cover"
              style={{ border: '1px solid rgba(255,255,255,0.15)' }} />
          ) : (
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
              style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
              {recipient.name?.charAt(0).toUpperCase()}
            </div>
          )}
          {online && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400"
              style={{ border: '2px solid rgba(6,11,24,0.9)' }} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-sm leading-tight truncate">{recipient.name}</p>
          <p className="text-xs mt-0.5" style={{ color: online ? '#34d399' : 'rgba(148,163,184,0.5)' }}>
            {online ? '● Online' : '● Offline'}
          </p>
        </div>
        {/* Video call shortcut */}
        <button className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          style={{ background: 'rgba(99,102,241,0.18)', border: '1px solid rgba(99,102,241,0.25)' }}
          title="Start video call">
          <svg className="w-4 h-4" style={{ color: '#a5b4fc' }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M4 8h8a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4a2 2 0 012-2z" />
          </svg>
        </button>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3" style={{ background: 'rgba(0,0,0,0.15)' }}>
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: '#4f46e5', borderTopColor: 'transparent' }} />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-4xl mb-2">👋</div>
            <p className="text-sm" style={{ color: 'rgba(148,163,184,0.5)' }}>Start a conversation with {recipient.name}</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const senderId = msg.senderId?._id || msg.senderId;
            const isMine   = senderId === user._id;
            return (
              <div key={msg._id || msg.tempId || idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                {!isMine && (
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mr-2 self-end mb-1"
                    style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}>
                    {recipient.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div
                  className="max-w-xs lg:max-w-md px-4 py-2.5 text-sm"
                  style={isMine
                    ? { background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', borderRadius: '18px 18px 4px 18px', color: '#fff' }
                    : { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '18px 18px 18px 4px', color: 'rgba(226,232,240,0.9)', backdropFilter: 'blur(10px)' }
                  }
                >
                  <p className="leading-relaxed">{msg.message}</p>
                  <p className="text-xs mt-1" style={{ color: isMine ? 'rgba(196,181,253,0.7)' : 'rgba(148,163,184,0.45)' }}>
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start items-end gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}>
              {recipient.name?.charAt(0).toUpperCase()}
            </div>
            <div className="px-4 py-3" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '18px 18px 18px 4px' }}>
              <div className="flex gap-1.5 items-center">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-2 h-2 rounded-full animate-bounce"
                    style={{ background: '#818cf8', animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ── */}
      <form onSubmit={handleSend} className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
        style={{ ...GLASS_DARK, borderTop: '1px solid rgba(255,255,255,0.07)', borderRadius: 0 }}>
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          className="flex-1 px-4 py-2.5 text-sm text-white rounded-xl outline-none transition-all"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', caretColor: '#818cf8' }}
          onFocus={(e) => { e.target.style.borderColor = 'rgba(99,102,241,0.4)'; e.target.style.boxShadow = '0 0 0 2px rgba(99,102,241,0.10)'; }}
          onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-150 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', boxShadow: '0 4px 14px rgba(79,70,229,0.4)' }}
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </form>

    </div>
  );
};

export default ChatBox;
