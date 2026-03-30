import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import PostCard from '../components/PostCard';
import { postAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

/* ── Minimalist Icons ── */
const I = {
  plus:    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>,
  spark:   <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>,
  users:   <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  video:   <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M4 8h8a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4a2 2 0 012-2z" /></svg>,
  swap:    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>,
  media:   <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>,
  x:       <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>,
  search:  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/></svg>,
};

const Home = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [feedMode, setFeedMode] = useState('for-you');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [postBoxOpen, setPostBoxOpen] = useState(false);
  const [newPostsNotice, setNewPostsNotice] = useState(0);
  
  const firstName = user?.name?.split(' ')[0] || 'Peer';

  const fetch = useCallback(async (p=1, mode) => {
    try {
      const m = mode || feedMode;
      const { data } = m === 'for-you' ? await postAPI.getAIFeed(p) : await postAPI.getFeed(p);
      setPosts(prev => p === 1 ? data.data : [...prev, ...data.data]);
      setHasMore(data.pagination.page < data.pagination.pages);
    } catch {}
    setLoading(false);
  }, [feedMode]);

  useEffect(() => { setLoading(true); setPage(1); fetch(1, feedMode); }, [feedMode, fetch]);

  useEffect(() => {
    if (!socket) return;
    const h = ({ post }) => {
      if (post.userId?._id !== user._id && post.userId !== user._id) {
        setNewPostsNotice(n => n + 1);
      }
    };
    socket.on('newPost', h);
    return () => socket.off('newPost', h);
  }, [socket, user._id]);

  const refreshFeed = () => { setNewPostsNotice(0); setPage(1); fetch(1); };

  return (
    <div className="bg-app min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />
      
      <div className="page-wrapper relative z-10" style={{ paddingTop: 100 }}>
        <div className="content-grid">
          
          {/* ── Left Sticky Panel ── */}
          <aside className="left-sidebar sticky top-24" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="card-glass" style={{ padding: 24, textAlign: 'center' }}>
              <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 16px' }}>
                {user?.profilePicture ? (
                  <img src={user.profilePicture} className="avatar-xl" style={{ border: '3px solid var(--brand)' }} />
                ) : (
                  <div className="avatar-xl" style={{ background: 'linear-gradient(135deg,var(--brand),var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 900, color: '#fff' }}>{user?.name?.[0]}</div>
                )}
                <div style={{ position: 'absolute', bottom: 4, right: 4, width: 14, height: 14, background: 'var(--success)', borderRadius: '50%', border: '3px solid var(--surface)' }} />
              </div>
              <h2 style={{ fontSize: 18, color: '#fff', marginBottom: 4 }}>{user?.name}</h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 24 }}>{user?.college || 'Zedify Student'}</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                <Link to="/network" style={{ textDecoration: 'none' }}>
                  <p style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>{user?.followers?.length || 0}</p>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Followers</p>
                </Link>
                <Link to="/network" style={{ textDecoration: 'none' }}>
                  <p style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>{user?.following?.length || 0}</p>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Following</p>
                </Link>
              </div>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { to: '/feed', i: I.spark, l: 'Activity Feed', active: true },
                { to: '/network', i: I.users, l: 'Student Network' },
                { to: '/video', i: I.video, l: 'Live Study Rooms' },
                { to: '/exchange', i: I.swap, l: 'Skill Exchange' },
              ].map(n => (
                <Link key={n.to} to={n.to} className="card-hover" style={{ 
                  display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderRadius: 16, textDecoration: 'none',
                  background: n.active ? 'rgba(99,102,241,0.1)' : 'transparent',
                  color: n.active ? '#fff' : 'var(--text-secondary)',
                  border: n.active ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
                  transition: '0.2s'
                }}>
                  <span style={{ color: n.active ? 'var(--brand-light)' : 'inherit' }}>{n.i}</span>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{n.l}</span>
                </Link>
              ))}
            </nav>
          </aside>

          {/* ── Main Dynamic Feed ── */}
          <main className="main-col">
            {/* Minimal Greeting Header */}
            <header className="mb-12" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <div>
                <h1 style={{ fontSize: 36, color: '#fff', letterSpacing: '-1.5px', marginBottom: 4 }}>Hello, <span className="text-gradient">{firstName}.</span></h1>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 600 }}>Explore what's happening at your university today.</p>
              </div>
              <button onClick={() => setPostBoxOpen(true)} className="btn-primary" style={{ height: 'fit-content' }}>
                <span className="flex">{I.plus}</span> NEW POST
              </button>
            </header>

            {/* Quick Actions Bar */}
            <div className="card-solid" style={{ padding: 12, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ padding: '0 12px', borderRight: '1px solid var(--border)', color: 'var(--text-muted)' }}>{I.search}</div>
              <input type="text" placeholder="Search insights or topics..." style={{ flex: 1, background: 'none', border: 'none', color: '#fff', outline: 'none', fontSize: 14 }} />
              <div style={{ display: 'flex', gap: 8 }}>
                {['for-you', 'following'].map(m => (
                  <button key={m} onClick={() => setFeedMode(m)} className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${feedMode === m ? 'badge-brand' : ''}`} style={{ border: 'none', cursor: 'pointer', background: feedMode === m ? '' : 'transparent', color: feedMode === m ? '' : 'var(--text-muted)' }}>
                    {m === 'for-you' ? 'FOR YOU' : 'FOLLOWING'}
                  </button>
                ))}
              </div>
            </div>

            {newPostsNotice > 0 && (
              <button onClick={refreshFeed} className="btn-primary w-full py-3 mb-6 animate-fadeIn" style={{ background: 'var(--brand)', boxShadow: '0 10px 20px rgba(99,102,241,0.3)' }}>
                ▲ View {newPostsNotice} New Insights
              </button>
            )}

            {/* Feed List */}
            {loading ? (
              <div className="space-y-6"><div className="skeleton h-40" /><div className="skeleton h-60" /></div>
            ) : (
              <div className="space-y-8">
                {posts.map(post => (
                  <div key={post._id} className="page-fade-in">
                    <PostCard post={post} onDelete={id => setPosts(p => p.filter(x => x._id !== id))} onUpdate={upd => setPosts(p => p.map(x => x._id === upd._id ? upd : x))} />
                  </div>
                ))}
                {hasMore && (
                   <button onClick={() => { setPage(p => p+1); fetch(page+1); }} className="btn-secondary w-full py-4 text-xs font-black tracking-widest">
                     LOAD MORE
                   </button>
                )}
              </div>
            )}
          </main>

          {/* ── Right Dynamic Activities ── */}
          <aside className="right-sidebar sticky top-24 space-y-6">
            <div className="card-glass" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 12, fontWeight: 900, color: 'var(--brand-light)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>Live Now</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { n: 'React 101 Study Room', p: '24 students', i: '⚛️' },
                  { n: 'Midterm Prep: Macroeconomics', p: '12 students', i: '📈' },
                  { n: 'UX Portfolio Review', p: '8 students', i: '🎨' },
                ].map((room, idx) => (
                  <div key={idx} className="card-hover" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 12, borderRadius: 16, background: 'rgba(255,255,255,0.03)', cursor: 'pointer' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{room.i}</div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{room.n}</p>
                      <p style={{ fontSize: 11, color: 'var(--success)', fontWeight: 700 }}>{room.p}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/video" className="btn-secondary w-full mt-6 justify-center" style={{ fontSize: 12, background: 'rgba(255,255,255,0.05)' }}>Explore Rooms</Link>
            </div>

            <div className="card-solid" style={{ padding: 24, borderStyle: 'dashed', borderColor: 'rgba(99,102,241,0.3)' }}>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>🚀 <strong>Daily Mission:</strong> Share one thing you're working on today to get 10 extra visibility points!</p>
            </div>
          </aside>

        </div>
      </div>

      {/* --- Global Post Modal --- */}
      {postBoxOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(3,6,18,0.98)', backdropFilter: 'blur(20px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card-glass w-full max-w-2xl page-fade-in" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border-2)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="badge-brand">SHARE INSIGHT</span>
              <button onClick={() => setPostBoxOpen(false)} className="btn-ghost" style={{ padding: 4 }}>{I.x}</button>
            </div>
            <PostForm onPost={p => { setPosts(prev => [p, ...prev]); setPostBoxOpen(false); }} />
          </div>
        </div>
      )}
    </div>
  );
};

const PostForm = ({ onPost }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [media, setMedia] = useState(null);
  const [preview, setPreview] = useState('');
  const fileRef = useRef();

  const handleMedia = e => {
    const f = e.target.files[0];
    if (f) { setMedia(f); setPreview(URL.createObjectURL(f)); }
  };

  const submit = async e => {
    e.preventDefault();
    if (!content.trim() && !media) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('content', content);
      if (media) fd.append('media', media);
      const { data } = await postAPI.createPost(fd);
      onPost(data.data);
    } catch {}
    setLoading(false);
  };

  return (
    <form onSubmit={submit} style={{ padding: 32 }}>
       <textarea autoFocus value={content} onChange={e => setContent(e.target.value)} placeholder="What's your focus today?" style={{ 
         width: '100%', height: 180, background: 'transparent', border: 'none', color: '#fff', fontSize: 24, outline: 'none', resize: 'none', marginBottom: 24, fontWeight: 300
       }} />
       
       {preview && (
         <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', marginBottom: 24, border: '1px solid var(--border)' }}>
           {media.type.startsWith('image') ? <img src={preview} className="w-full max-h-80 object-cover" /> : <video src={preview} className="w-full max-h-80" controls />}
           <button onClick={() => { setMedia(null); setPreview(''); }} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', padding: 8, borderRadius: '50%' }}>&times;</button>
         </div>
       )}

       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 24 }}>
         <button type="button" onClick={() => fileRef.current.click()} className="btn-secondary" style={{ borderRadius: 99, padding: '12px 24px' }}>
           {I.media}
         </button>
         <input ref={fileRef} type="file" hidden accept="image/*,video/*" onChange={handleMedia} />
         <button type="submit" disabled={loading || (!content.trim() && !media)} className="btn-primary" style={{ padding: '14px 48px', borderRadius: 99 }}>
           {loading ? 'PUBLISHING...' : 'POST INSIGHT'}
         </button>
       </div>
    </form>
  );
};

export default Home;
