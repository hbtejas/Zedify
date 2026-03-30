import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { userAPI, exchangeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

/* ── Icons ── */
const I = {
  search:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>,
  swap:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4"><path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>,
  connect: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M20 8v6M23 11h-6"/></svg>,
  star:    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className="w-3 h-3"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
};

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
        setUsers((data.data || []).filter(u => u._id !== user._id));
      } else {
        const { data } = await userAPI.searchUsers(q);
        setUsers((data.data || []).filter(u => u._id !== user._id));
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
    <div className="bg-app min-h-screen">
      <Navbar />

      <div className="page-wrapper content-grid relative z-10">
        <Sidebar />

        <main className="main-col">
          {/* ── Header & Search ── */}
          <div className="grad-border mb-6">
            <div className="card-solid" style={{ padding: '32px 36px', overflow: 'hidden', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-60%', right: '-10%', width: 300, height: 300, background: 'radial-gradient(circle,rgba(99,102,241,0.2) 0%,transparent 70%)', filter: 'blur(40px)' }} />
              
              <div style={{ position: 'relative', zIndex: 10 }}>
                <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', marginBottom: 6, fontFamily: "'Space Grotesk',sans-serif" }}>Connect & Network</h1>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24, maxWidth: 500 }}>
                  Find students across campus to exchange skills, collaborate on projects, or connect based on shared interests.
                </p>

                <div style={{ position: 'relative', width: '100%', maxWidth: 500 }}>
                  <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>{I.search}</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, skills (e.g. React, Python), or college..."
                    className="input"
                    style={{ width: '100%', paddingLeft: 48, paddingRight: 16, paddingTop: 14, paddingBottom: 14 }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Results Grid ── */}
          {loading ? (
             <div style={{ padding: '80px 0', display: 'flex', justifyContent: 'center' }}>
               <div className="spinner-md border-t-brand" />
             </div>
          ) : users.length === 0 ? (
             <div className="card" style={{ padding: '60px 20px', textAlign: 'center' }}>
               <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
               <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 8 }}>No students found</h3>
               <p style={{ color: 'var(--text-secondary)' }}>Try searching for different skills or names.</p>
             </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {users.map((u) => {
                const isFollowing = u.followers?.includes(user._id);

                return (
                  <div key={u._id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', padding: 20 }}>
                    
                    {/* Top User Info */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
                      <Link to={`/profile/${u._id}`} style={{ position: 'relative', flexShrink: 0 }}>
                        {u.profilePicture ? (
                          <img src={u.profilePicture} alt={u.name} className="avatar-lg" style={{ border: '2px solid rgba(255,255,255,0.08)', objectFit: 'cover' }} />
                        ) : (
                          <div className="avatar-lg" style={{ background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#fff', border: '2px solid rgba(255,255,255,0.08)' }}>
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {isUserOnline(u._id) && (
                          <span style={{ position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, background: 'var(--success)', border: '2.5px solid var(--surface)', borderRadius: '50%' }} />
                        )}
                      </Link>

                      <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
                        <Link to={`/profile/${u._id}`} style={{ display: 'block', color: 'var(--text-primary)', fontWeight: 800, fontSize: 16, textDecoration: 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {u.name}
                        </Link>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>
                          {u.college || 'Student'} {u.branch ? `· ${u.branch}` : ''}
                        </p>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                          <span className="badge-green" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            {I.star} {u.avgRating > 0 ? u.avgRating.toFixed(1) : 'New'}
                          </span>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                            {u.followers?.length || 0} Followers
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Skills Display */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                      {u.skillsOffered?.length > 0 && (
                        <div>
                          <p style={{ fontSize: 10, fontWeight: 800, color: 'rgba(147,197,253,0.7)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Can Teach</p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {u.skillsOffered.slice(0, 3).map(s => (
                              <span key={s} className="skill-tag badge-brand">{s}</span>
                            ))}
                            {u.skillsOffered.length > 3 && (
                              <span className="skill-tag" style={{ background: 'transparent', color: 'var(--text-muted)' }}>+{u.skillsOffered.length - 3}</span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {u.skillsWanted?.length > 0 && (
                        <div>
                          <p style={{ fontSize: 10, fontWeight: 800, color: 'rgba(216,180,254,0.7)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Wants to Learn</p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {u.skillsWanted.slice(0, 3).map(s => (
                              <span key={s} className="skill-tag badge-purple">{s}</span>
                            ))}
                            {u.skillsWanted.length > 3 && (
                              <span className="skill-tag" style={{ background: 'transparent', color: 'var(--text-muted)' }}>+{u.skillsWanted.length - 3}</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                      <button 
                        onClick={() => handleFollow(u._id)}
                        disabled={actionLoading === u._id}
                        className={isFollowing ? 'btn-ghost' : 'btn-secondary'}
                        style={{ flex: 1, padding: '10px 0', fontSize: 13, gap: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        {actionLoading === u._id ? (
                          <div className="spinner-sm border-t-current" />
                        ) : isFollowing ? 'Following' : <span className="flex">{I.connect} <span style={{marginLeft:4}}>Follow</span></span>}
                      </button>

                      <button
                        onClick={() => handleExchange(u._id)}
                        disabled={actionLoading === `req_${u._id}`}
                        className="btn-primary"
                        style={{ flex: 1, padding: '10px 0', fontSize: 13, gap: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        {actionLoading === `req_${u._id}` ? (
                          <div className="spinner-sm border-t-white" />
                        ) : <span className="flex">{I.swap} <span style={{marginLeft:4}}>Swap</span></span>}
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
