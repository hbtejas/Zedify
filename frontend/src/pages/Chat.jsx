import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ChatBox from '../components/ChatBox';
import { chatAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const BG    = 'linear-gradient(135deg,#060b18 0%,#0d1526 40%,#0f0c29 100%)';
const GLASS = { background:'rgba(255,255,255,0.05)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.10)' };

const Chat = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const { isUserOnline } = useSocket();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data } = await chatAPI.getConversations();
        setConversations(data.data);
      } catch {}
      setLoading(false);
    };
    fetchConversations();
  }, []);

  useEffect(() => {
    if (userId && conversations.length > 0) {
      const conv = conversations.find((c) => c.user?._id === userId);
      if (conv) {
        setSelectedUser(conv.user);
      } else {
        userAPI.getProfile(userId).then(({ data }) => setSelectedUser(data.data)).catch(() => {});
      }
    }
  }, [userId, conversations]);

  const handleSearch = async (e) => {
    const q = e.target.value;
    setSearchQ(q);
    if (q.trim().length >= 2) {
      try {
        const { data } = await userAPI.searchUsers(q);
        setSearchResults(data.data.filter((u) => u._id !== user._id));
      } catch {}
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectUser = (u) => {
    setSelectedUser(u);
    navigate(`/chat/${u._id}`);
    setSearchQ('');
    setSearchResults([]);
  };

  return (
    <div className="min-h-screen" style={{ background: BG }}>
      {/* Ambient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute rounded-full" style={{ width: 600, height: 600, top: '-200px', left: '-200px', background: 'rgba(37,99,235,0.07)', filter: 'blur(80px)' }} />
        <div className="absolute rounded-full" style={{ width: 500, height: 500, bottom: '-150px', right: '-100px', background: 'rgba(124,58,237,0.07)', filter: 'blur(80px)' }} />
      </div>

      <div className="relative" style={{ zIndex: 1 }}>
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 pt-4" style={{ height: 'calc(100vh - 72px)' }}>
          <div className="flex gap-4 h-full">

            {/* ── Conversations list ── */}
            <div
              className={`w-80 flex-shrink-0 flex flex-col ${selectedUser ? 'hidden md:flex' : 'flex'}`}
              style={{ ...GLASS, borderRadius: 20, overflow: 'hidden' }}
            >
              {/* Header */}
              <div className="p-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <h2 className="font-bold text-white text-lg mb-3">Messages</h2>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(148,163,184,0.5)' }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
                  </svg>
                  <input
                    type="text"
                    value={searchQ}
                    onChange={handleSearch}
                    placeholder="Search students..."
                    className="w-full pl-9 pr-4 py-2.5 text-sm text-white rounded-xl outline-none transition-all"
                    style={{ background: 'rgba(0,0,0,0.30)', border: '1px solid rgba(255,255,255,0.08)', caretColor: '#818cf8' }}
                    onFocus={(e) => { e.target.style.borderColor = 'rgba(99,102,241,0.5)'; e.target.style.boxShadow = '0 0 0 2px rgba(99,102,241,0.12)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                {/* Search dropdown */}
                {searchResults.length > 0 && (
                  <div className="mt-2 rounded-xl overflow-hidden" style={{ background: 'rgba(13,21,38,0.98)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
                    {searchResults.slice(0, 5).map((u) => (
                      <button
                        key={u._id}
                        onClick={() => handleSelectUser(u)}
                        className="w-full flex items-center gap-3 p-3 text-left transition-colors"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.12)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        {u.profilePicture ? (
                          <img src={u.profilePicture} alt={u.name} className="w-8 h-8 rounded-xl object-cover" style={{ border: '1px solid rgba(255,255,255,0.12)' }} />
                        ) : (
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{u.name}</p>
                          <p className="text-xs truncate" style={{ color: 'rgba(148,163,184,0.55)' }}>{u.college}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* List body */}
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: '#4f46e5', borderTopColor: 'transparent' }} />
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 px-6 text-center py-12">
                  <div className="text-5xl mb-3">💬</div>
                  <p className="text-sm" style={{ color: 'rgba(148,163,184,0.55)' }}>No conversations yet. Search for students to start chatting!</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto">
                  {conversations.map(({ user: convUser, lastMessage, unreadCount }) =>
                    convUser && (
                      <button
                        key={convUser._id}
                        onClick={() => handleSelectUser(convUser)}
                        className="w-full flex items-center gap-3 p-4 transition-all duration-150 text-left"
                        style={{
                          background: selectedUser?._id === convUser._id ? 'rgba(99,102,241,0.14)' : 'transparent',
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                          borderLeft: selectedUser?._id === convUser._id ? '3px solid #818cf8' : '3px solid transparent',
                        }}
                        onMouseEnter={(e) => { if (selectedUser?._id !== convUser._id) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                        onMouseLeave={(e) => { if (selectedUser?._id !== convUser._id) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <div className="relative flex-shrink-0">
                          {convUser.profilePicture ? (
                            <img src={convUser.profilePicture} alt={convUser.name} className="w-11 h-11 rounded-xl object-cover"
                              style={{ border: '1px solid rgba(255,255,255,0.12)' }} />
                          ) : (
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold"
                              style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
                              {convUser.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          {isUserOnline(convUser._id) && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400"
                              style={{ border: '2px solid rgba(6,11,24,0.9)' }} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline gap-1">
                            <p className="font-semibold text-sm text-white truncate">{convUser.name}</p>
                            {lastMessage && (
                              <span className="text-xs flex-shrink-0" style={{ color: 'rgba(148,163,184,0.4)' }}>
                                {new Date(lastMessage.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                              </span>
                            )}
                          </div>
                          <p className="text-xs truncate mt-0.5" style={{ color: 'rgba(148,163,184,0.5)' }}>
                            {lastMessage?.message || 'Start chatting'}
                          </p>
                        </div>
                        {unreadCount > 0 && (
                          <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                            style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
                            {unreadCount}
                          </span>
                        )}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            {/* ── Chat area ── */}
            <div
              className={`flex-1 ${!selectedUser ? 'hidden md:flex' : 'flex'} flex-col`}
              style={{ ...GLASS, borderRadius: 20, overflow: 'hidden', minHeight: 0 }}
            >
              {selectedUser ? (
                <ChatBox recipient={selectedUser} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="text-6xl mb-4">💬</div>
                  <p className="font-semibold text-white text-lg">Select a conversation</p>
                  <p className="text-sm mt-1" style={{ color: 'rgba(148,163,184,0.5)' }}>Choose from your chats or search for students</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
