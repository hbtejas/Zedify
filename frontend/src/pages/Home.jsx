import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import PostCard from '../components/PostCard';
import { postAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

/* ── Custom Icons ── */
const I = {
  plus:     <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>,
  sparkles: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/></svg>,
  zap:      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9z"/></svg>,
  users:    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m12-16a4 4 0 11-8 0 4 4 0 018 0z"/></svg>,
  video:    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M23 7l-7 5 7 5V7zM1 5h15v14H1V5z"/></svg>,
  swap:     <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M7 16V4m0 0L3 8M7 4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/></svg>,
  search:   <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>,
};

const Home = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [feedMode, setFeedMode] = useState('for-you');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [newCount, setNewCount] = useState(0);

  const fetch = useCallback(async (p=1, mode) => {
    try {
      const { data } = (mode || feedMode) === 'for-you' ? await postAPI.getAIFeed(p) : await postAPI.getFeed(p);
      setPosts(prev => p === 1 ? data.data : [...prev, ...data.data]);
      setHasMore(data.pagination.page < data.pagination.pages);
    } catch {}
    setLoading(false);
  }, [feedMode]);

  useEffect(() => { setLoading(true); setPage(1); fetch(1, feedMode); }, [feedMode, fetch]);

  useEffect(() => {
    if (!socket) return;
    const h = ({ post }) => { if (post.userId?._id !== user._id && post.userId !== user._id) setNewCount(n => n + 1); };
    socket.on('newPost', h);
    return () => socket.off('newPost', h);
  }, [socket, user._id]);

  const firstName = user?.name?.split(' ')[0] || 'Peer';

  return (
    <div className="bg-app min-h-screen">
      <Navbar />
      
      <div className="page-wrapper pt-24 pb-20">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(300px, 700px) 1.2fr', gap: 40 }}>
          
          {/* ── Left wing ── */}
          <aside className="sticky top-24 h-fit hidden xl:flex flex-col gap-8 slide-up">
            <div className="glass-panel" style={{ padding: 40, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ position: 'relative', width: 96, height: 96, marginBottom: 24 }}>
                {user?.profilePicture ? (
                  <img src={user.profilePicture} className="w-full h-full object-cover rounded-[32px] border-2 border-indigo-500/50 shadow-2xl" />
                ) : (
                  <div className="w-full h-full rounded-[32px] flex items-center justify-center text-3xl font-black text-white bg-gradient-to-br from-indigo-500 to-fuchsia-500 border-2 border-indigo-500/20 shadow-2xl">
                    {user?.name?.[0]}
                  </div>
                )}
                <div style={{ position: 'absolute', bottom: -4, right: -4, width: 28, height: 28, background: 'var(--success)', border: '6px solid var(--panel)', borderRadius: '50%' }} />
              </div>

              <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, color: '#fff', marginBottom: 4, letterSpacing: '-1px' }}>{user?.name}</h1>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{user?.college || 'Zedify University'}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="glass-card" style={{ padding: '16px 12px', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
                  <p style={{ fontSize: 24, fontWeight: 900, color: 'var(--brand-glow)', lineHeight: 1 }}>{user?.followers?.length || 0}</p>
                  <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', marginTop: 8, textTransform: 'uppercase' }}>Peers</p>
                </div>
                <div className="glass-card" style={{ padding: '16px 12px', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
                  <p style={{ fontSize: 24, fontWeight: 900, color: 'var(--accent-glow)', lineHeight: 1 }}>{user?.following?.length || 0}</p>
                  <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', marginTop: 8, textTransform: 'uppercase' }}>Following</p>
                </div>
              </div>
            </div>

            <nav className="flex flex-col gap-3">
              {[
                { to: '/feed', i: I.zap, l: 'Your Activity', a: true },
                { to: '/network', i: I.users, l: 'Find Peers' },
                { to: '/video', i: I.video, l: 'Live Study' },
                { to: '/exchange', i: I.swap, l: 'Skill Swap' },
              ].map(n => (
                <Link key={n.to} to={n.to} className="glass-card" style={{ 
                  display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px', textDecoration: 'none',
                  border: n.a ? '1.5px solid var(--brand)' : '1px solid var(--border)', background: n.a ? 'rgba(79,70,229,0.1)' : ''
                }}>
                  <span style={{ color: n.a ? 'var(--brand-glow)' : 'var(--text-muted)', display: 'flex' }}>{n.i}</span>
                  <span style={{ fontWeight: 800, fontSize: 14, color: n.a ? '#fff' : 'var(--text-dim)' }}>{n.l}</span>
                </Link>
              ))}
            </nav>
          </aside>

          {/* ── Center stage (The Feed) ── */}
          <main className="flex flex-col slide-up min-w-0">
            
            <header style={{ marginBottom: 48 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '8px 16px', marginBottom: 24, border: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ color: 'var(--brand-glow)' }}>{I.sparkles}</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>New campus insights available</span>
              </div>
              <h1 style={{ fontSize: 48, color: '#fff', letterSpacing: '-2px', lineHeight: 1.1 }}>
                Hey, <span className="text-gradient-vibrant">{firstName}.</span><br />
                Ready to learn something <span style={{ color: 'var(--brand-glow)' }}>new?</span>
              </h1>
            </header>

            {/* Quick Post & Search bar */}
            <div className="glass-panel" style={{ padding: 12, marginBottom: 40, border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ height: 44, width: 44, borderRadius: 14, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>{I.search}</div>
              <input onClick={() => setPostModalOpen(true)} type="text" readOnly placeholder="What skill are you working on today?" style={{ background: 'none', border: 'none', color: '#fff', fontSize: 15, fontWeight: 600, flex: 1, cursor: 'pointer' }} />
              <button onClick={() => setPostModalOpen(true)} className="btn-primary" style={{ padding: '10px 24px', fontSize: 13 }}>Share Insight {I.zap}</button>
            </div>

            {/* Feed Tabs Refined */}
            <div style={{ display: 'flex', gap: 40, marginBottom: 32, borderBottom: '2px solid rgba(255,255,255,0.04)' }}>
              {['for-you', 'following'].map(m => (
                <button key={m} onClick={() => setFeedMode(m)} style={{ 
                  padding: '0 0 16px', background: 'none', border: 'none', fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', position: 'relative', transition: 'all 0.3s',
                  color: feedMode === m ? '#fff' : 'var(--text-muted)'
                }}>
                  {m === 'for-you' ? 'Campus Intel (AI)' : 'Direct Network'}
                  {feedMode === m && <div style={{ position: 'absolute', bottom: -2, left: 0, width: '100%', height: 2, background: 'var(--brand)', boxShadow: '0 0 15px var(--brand-glow)' }} />}
                </button>
              ))}
            </div>

            {newCount > 0 && (
              <button onClick={() => { setNewCount(0); fetch(1); }} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: 24, background: 'rgba(99,102,241,0.2)', border: '1px solid var(--brand)', boxShadow: 'none' }}>
                View {newCount} New Posts
              </button>
            )}

            <div className="flex flex-col gap-6">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <div key={i} className="glass-card skeleton h-48" />)
              ) : posts.length === 0 ? (
                <div className="glass-card" style={{ padding: 80, textAlign: 'center' }}>
                  <div style={{ fontSize: 48, marginBottom: 20 }}>🌌</div>
                  <h3 style={{ fontSize: 20, color: '#fff', marginBottom: 8 }}>Quiet campus today...</h3>
                  <p style={{ color: 'var(--text-dim)' }}>Be the first to share an update or follow more peers!</p>
                </div>
              ) : posts.map(p => (
                <div key={p._id} className="slide-up">
                  <PostCard post={p} onDelete={id => setPosts(prev => prev.filter(x => x._id !== id))} onUpdate={upd => setPosts(prev => prev.map(x => x._id === upd._id ? upd : x))} />
                </div>
              ))}
              {hasMore && <button onClick={() => { setPage(p => p+1); fetch(p+1); }} className="btn-secondary w-full">Explore More</button>}
            </div>

          </main>

          {/* ── Right wing ── */}
          <aside className="sticky top-24 h-fit hidden xl:flex flex-col gap-8 slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="glass-panel" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h3 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#fff' }}>Trending Skills</h3>
                <span className="tag-indigo">Live Map</span>
              </div>
              <div className="flex flex-col gap-4">
                {[
                  { n: 'Three.js Mastery', p: '8 peers live', i: '🧊' },
                  { n: 'UI Micro-animations', p: '14 peers live', i: '✨' },
                  { n: 'Ethical Hacking', p: '22 peers live', i: '🛡️' },
                ].map((s, i) => (
                  <div key={i} className="glass-card" style={{ padding: 14, display: 'flex', gap: 14, cursor: 'pointer' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{s.i}</div>
                    <div className="min-w-0">
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{s.n}</p>
                      <p style={{ fontSize: 11, color: 'var(--success)', fontWeight: 800 }}>{s.p}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/network" className="btn-secondary w-full mt-6 flex justify-center text-xs">Browse All Skills</Link>
            </div>

            <div className="glass-panel" style={{ padding: 24, background: 'linear-gradient(135deg,rgba(99,102,241,0.05),rgba(217,70,239,0.05))' }}>
               <h3 style={{ fontSize: 11, fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 12 }}>Campus Wisdom</h3>
               <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-dim)', fontStyle: 'italic' }}>"Your best teacher is your last peer interaction."</p>
            </div>
          </aside>

        </div>
      </div>

      {/* --- Global Post Modal --- */}
      {postModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(1,3,9,0.98)', backdropFilter: 'blur(32px)', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div className="glass-panel w-full max-w-2xl slide-up" style={{ padding: 48, background: 'var(--panel)', border: '1.5px solid var(--border-bright)' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
                <div>
                   <h2 style={{ fontSize: 32, letterSpacing: '-1px', marginBottom: 8 }}>New Insight</h2>
                   <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Broadcast your focus to the whole campus.</p>
                </div>
                <button onClick={() => setPostModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
             </div>
             
             <textarea 
                autoFocus 
                placeholder="What skill-journey did you start today?" 
                style={{ width: '100%', height: 200, background: 'none', border: 'none', color: '#fff', fontSize: 26, outline: 'none', resize: 'none', marginBottom: 40, fontWeight: 300 }} 
                onChange={e => setPosts([{ message: e.target.value }]) /* This is just a placeholder for local state */}
             />

             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '2.5px solid rgba(255,255,255,0.03)', paddingTop: 40 }}>
                <div style={{ display: 'flex', gap: 12 }}>
                   <div className="glass-card" style={{ padding: 12, display: 'flex', color: 'var(--brand-glow)' }}><svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg></div>
                   <div className="glass-card" style={{ padding: 12, display: 'flex', color: 'var(--accent-glow)' }}><svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
                </div>
                <button className="btn-primary" style={{ padding: '16px 48px', fontSize: 16 }}>Broadcast Now</button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Home;
