import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ChatBox from '../components/ChatBox';
import { chatAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const I = {
  search: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/></svg>,
};

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
    const fetch = async () => {
      try { const { data } = await chatAPI.getConversations(); setConversations(data.data); } catch {}
      setLoading(false);
    };
    fetch();
  }, []);

  useEffect(() => {
    if (userId && conversations.length > 0) {
      const conv = conversations.find(c => c.user?._id === userId);
      if (conv) setSelectedUser(conv.user);
      else userAPI.getProfile(userId).then(({ data }) => setSelectedUser(data.data)).catch(() => {});
    }
  }, [userId, conversations]);

  const handleSearch = async (e) => {
    const q = e.target.value;
    setSearchQ(q);
    if (q.trim().length >= 2) {
      try { const { data } = await userAPI.searchUsers(q); setSearchResults(data.data.filter(u => u._id !== user._id)); } catch {}
    } else setSearchResults([]);
  };

  const handleSelectUser = (u) => {
    setSelectedUser(u);
    navigate(`/chat/${u._id}`);
    setSearchQ('');
    setSearchResults([]);
  };

  return (
    <div className="bg-app min-h-screen flex flex-col">
      <Navbar />
      
      <div className="page-wrapper relative z-10 flex-1 flex flex-col pt-0">
        <div className="card-glass flex flex-1 overflow-hidden" style={{ margin: '16px 0', minHeight: 0 }}>
          
          {/* ── Conversarions List ── */}
          <div className={`w-80 flex-shrink-0 flex flex-col border-r border-white/10 ${selectedUser ? 'hidden md:flex' : 'flex'}`} style={{ background: 'var(--surface)' }}>
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex-shrink-0">
              <h2 className="font-black text-white text-xl mb-4" style={{ fontFamily: "'Space Grotesk',sans-serif", letterSpacing: '-0.5px' }}>Messages</h2>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">{I.search}</span>
                <input
                  type="text"
                  value={searchQ}
                  onChange={handleSearch}
                  placeholder="Search students..."
                  className="input w-full"
                  style={{ paddingLeft: 36 }}
                />
              </div>

              {/* Search results dropdown */}
              {searchResults.length > 0 && (
                <div className="card absolute left-4 right-4 mt-2 z-20 max-h-60 overflow-y-auto shadow-2xl">
                  {searchResults.slice(0, 5).map((u) => (
                    <button key={u._id} onClick={() => handleSelectUser(u)} className="w-full flex items-center gap-3 p-3 text-left hover:bg-indigo-500/10 transition-colors border-b border-white/5 last:border-0">
                      {u.profilePicture ? (
                        <img src={u.profilePicture} className="avatar-sm border border-white/10" />
                      ) : (
                        <div className="avatar-sm bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold flex items-center justify-center">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{u.name}</p>
                        <p className="text-[11px] text-[var(--text-muted)] truncate">{u.college}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* List */}
            {loading ? (
              <div className="flex-1 flex justify-center items-center"><div className="spinner-sm border-t-brand" /></div>
            ) : conversations.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="text-4xl mb-2 opacity-50">💬</div>
                <p className="text-sm text-[var(--text-secondary)] font-medium">No conversations yet.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {conversations.map(({ user: cUser, lastMessage, unreadCount }) => cUser && (
                  <button
                    key={cUser._id}
                    onClick={() => handleSelectUser(cUser)}
                    className="w-full flex items-center gap-3 p-4 text-left transition-colors border-b border-white/5"
                    style={{ background: selectedUser?._id === cUser._id ? 'rgba(99,102,241,0.1)' : 'transparent', borderLeft: selectedUser?._id === cUser._id ? '3px solid var(--brand)' : '3px solid transparent' }}
                  >
                    <div className="relative flex-shrink-0">
                      {cUser.profilePicture ? (
                        <img src={cUser.profilePicture} className="avatar-md border border-white/10" />
                      ) : (
                        <div className="avatar-md bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold flex items-center justify-center">
                          {cUser.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {isUserOnline(cUser._id) && <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[var(--surface)] xl rounded-full" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline gap-1">
                        <p className="font-bold text-sm text-[var(--text-primary)] truncate">{cUser.name}</p>
                        {lastMessage && <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">{new Date(lastMessage.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>}
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">{lastMessage?.message || 'Start chatting'}</p>
                    </div>
                    {unreadCount > 0 && <span className="badge-brand flex-shrink-0" style={{ padding: '2px 6px', fontSize: 10 }}>{unreadCount}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Chat Area ── */}
          <div className={`flex-1 flex-col bg-black/20 ${!selectedUser ? 'hidden md:flex' : 'flex'} min-w-0`}>
            {selectedUser ? (
              <ChatBox recipient={selectedUser} />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="text-6xl mb-4 opacity-50">👋</div>
                <h2 className="text-xl font-black text-white" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>Your Messages</h2>
                <p className="text-sm text-[var(--text-muted)] mt-2">Select a conversation or start a new one</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Chat;
