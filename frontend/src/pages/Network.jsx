import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { userAPI, exchangeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

/* ─── Design Tokens ─── */
const BG    = 'linear-gradient(135deg,#060b18 0%,#0d1526 40%,#0f0c29 100%)';
const GLASS = { background:'rgba(255,255,255,0.05)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.10)' };
const GLASS_DARK = { background:'rgba(0,0,0,0.25)', border:'1px solid rgba(255,255,255,0.08)' };

/* ─── Icons ─── */
const SearchIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>);
const SwapIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4"><path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>);
const ConnectIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M20 8v6M23 11h-6"/></svg>);

const Network = () => {
  const { user } = useAuth();
  const { isUserOnline } = useSocket();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // Load suggestions initially
  useEffect(() => {
    const fetchInitial = async () => {
      setLoading(true);
      try {
        const { data } = await userAPI.getSuggestions();
        setUsers(data.data || []);
      } catch {}
      setLoading(false);
    };
    fetchInitial();
  }, []);

  // Search function
  const handleSearch = useCallback(async (q) => {
    setLoading(true);
    try {
      if (!q.trim()) {
        const { data } = await userAPI.getSuggestions();
        setUsers(data.data.filter(u => u._id !== user._id) || []);
      } else {
        const { data } = await userAPI.searchUsers(q);
        setUsers(data.data.filter(u => u._id !== user._id) || []);
      }
    } catch {}
    setLoading(false);
  }, [user._id]);

  useEffect(() => {
    const timer = setTimeout(() => handleSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  const handleFollow = async (id) => {
    setActionLoading(id);
    try {
      await userAPI.followUser(id);
      setUsers(prev => prev.map(u => {
        if (u._id === id) {
          const isFollowing = u.followers.includes(user._id);
          return {
            ...u,
            followers: isFollowing ? u.followers.filter(fid => fid !== user._id) : [...u.followers, user._id]
          };
        }
        return u;
      }));
    } catch {}
    setActionLoading(null);
  };

  const handleExchange = async (recipientId) => {
    setActionLoading(`req_${recipientId}`);
    try {
      await exchangeAPI.sendExchange({ recipientId, message: "Hi! I'd love to connect and exchange skills with you!" });
      alert("Exchange Request Sent!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send request.");
    }
    setActionLoading(null);
  };

  return (
    <div className="min-h-screen relative" style={{ background: BG }}>
      {/* Ambient backgrounds */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background:'radial-gradient(circle,rgba(79,70,229,0.12) 0%,transparent 70%)', filter:'blur(80px)' }} />
      <div className="fixed bottom-0 left-0 w-96 h-96 rounded-full pointer-events-none"
        style={{ background:'radial-gradient(circle,rgba(236,72,153,0.08) 0%,transparent 70%)', filter:'blur(60px)' }} />

      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 relative z-10 flex gap-6">
        <Sidebar />

        <main className="flex-1 min-w-0">
          {/* Header & Search */}
          <div className="mb-6 rounded-3xl p-6 relative overflow-hidden" style={GLASS}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
            <h1 className="text-2xl font-bold text-white mb-2">Connect & Network</h1>
            <p className="text-sm text-slate-400 mb-6 max-w-lg">
              Find students across campus to exchange skills, collaborate on projects, or just connect based on shared interests.
            </p>

            <div className="relative max-w-xl">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <SearchIcon />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, skills (e.g. React, Python), or college..."
                className="w-full pl-12 pr-4 py-3.5 bg-black/30 border border-white/10 rounded-2xl text-white outline-none transition-all placeholder:text-slate-500 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 text-sm"
              />
            </div>
          </div>

          {/* Results Grid */}
          {loading ? (
             <div className="flex justify-center items-center py-20">
               <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
             </div>
          ) : users.length === 0 ? (
             <div className="py-20 text-center rounded-3xl" style={GLASS}>
               <div className="text-6xl mb-4">🔍</div>
               <h3 className="text-xl font-bold text-white mb-2">No students found</h3>
               <p className="text-slate-400 text-sm">Try searching for different skills or names.</p>
             </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {users.map((u) => {
                const isFollowing = u.followers?.includes(user._id);

                return (
                  <div key={u._id} className="rounded-3xl p-5 flex flex-col group transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-indigo-500/20" style={GLASS}>
                    
                    <div className="flex items-start gap-3 mb-4">
                      {/* Avatar */}
                      <Link to={`/profile/${u._id}`} className="relative flex-shrink-0">
                        {u.profilePicture ? (
                          <img src={u.profilePicture} alt={u.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-500/30 group-hover:border-indigo-500/80 transition-colors" />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xl font-bold text-white border-2 border-white/10 group-hover:border-white/30 transition-colors">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {isUserOnline(u._id) && (
                          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-[3px] border-[#0a1023] rounded-full" />
                        )}
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0 pt-0.5">
                        <Link to={`/profile/${u._id}`} className="text-white font-bold text-base truncate block hover:text-indigo-400 transition-colors">
                          {u.name}
                        </Link>
                        <p className="text-xs text-slate-400 truncate mt-0.5" title={u.college || 'Student'}>
                          {u.college || 'Student'} {u.branch ? `· ${u.branch}` : ''}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md">
                            ★ {u.avgRating > 0 ? u.avgRating.toFixed(1) : 'New'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {u.followers?.length || 0} Followers
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Skills Display */}
                    <div className="flex-1 space-y-3 mb-5">
                      {u.skillsOffered?.length > 0 && (
                        <div>
                          <p className="text-[10px] uppercase font-bold text-indigo-300/80 tracking-wider mb-1.5">Can Teach</p>
                          <div className="flex flex-wrap gap-1.5">
                            {u.skillsOffered.slice(0, 3).map(s => (
                              <span key={s} className="text-xs text-indigo-200 bg-indigo-500/20 border border-indigo-500/30 px-2.5 py-1 rounded-lg truncate max-w-full">
                                {s}
                              </span>
                            ))}
                            {u.skillsOffered.length > 3 && (
                              <span className="text-xs text-indigo-300/50 px-1 py-1">+{u.skillsOffered.length - 3}</span>
                            )}
                          </div>
                        </div>
                      )}
                      {u.skillsWanted?.length > 0 && (
                        <div>
                          <p className="text-[10px] uppercase font-bold text-pink-300/80 tracking-wider mb-1.5">Wants to Learn</p>
                          <div className="flex flex-wrap gap-1.5">
                            {u.skillsWanted.slice(0, 3).map(s => (
                              <span key={s} className="text-xs text-pink-200 bg-pink-500/20 border border-pink-500/30 px-2.5 py-1 rounded-lg truncate max-w-full">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2 mt-auto">
                      <button 
                        onClick={() => handleFollow(u._id)}
                        disabled={actionLoading === u._id}
                        className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${isFollowing ? 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-500/30'}`}
                      >
                        {actionLoading === u._id ? (
                          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : isFollowing ? 'Following' : <><ConnectIcon /> Follow</>}
                      </button>

                      <button
                        onClick={() => handleExchange(u._id)}
                        disabled={actionLoading === `req_${u._id}`}
                        className="py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-1.5"
                      >
                        {actionLoading === `req_${u._id}` ? (
                          <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : <><SwapIcon /> Swap</>}
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Network;
