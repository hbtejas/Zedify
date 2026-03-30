import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import PostCard from '../components/PostCard';
import { postAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

/* ── Minimalist Premium Icons ── */
const I = {
  plus:    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>,
  zap:     <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9z"/></svg>,
  users:   <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m12-16a4 4 0 11-8 0 4 4 0 018 0z"/></svg>,
  video:   <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M23 7l-7 5 7 5V7zM1 5h15v14H1V5z"/></svg>,
  swap:    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M7 16V4m0 0L3 8M7 4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/></svg>,
  home:    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>,
  search:  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>,
  image:   <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>,
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
  const [newNotice, setNewNotice] = useState(0);

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
    const h = ({ post }) => { if (post.userId?._id !== user._id && post.userId !== user._id) setNewNotice(n => n + 1); };
    socket.on('newPost', h);
    return () => socket.off('newPost', h);
  }, [socket, user._id]);

  const firstName = user?.name?.split(' ')[0] || 'Student';

  return (
    <div className="bg-app min-h-screen" style={{ background: '#02040a' }}>
      <Navbar />
      
      <div className="page-wrapper pt-24">
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 340px', gap: 32 }}>
          
          {/* ── Fixed Sidebar ── */}
          <aside className="sticky top-24 h-[calc(100vh-120px)] flex flex-col slide-up">
            <div className="glass-panel" style={{ padding: 24, borderRadius: 24, marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                {user?.profilePicture ? (
                  <img src={user.profilePicture} className="w-12 h-12 rounded-2xl object-cover border border-white/10" />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white">{user?.name?.[0]}</div>
                )}
                <div className="min-w-0">
                  <p style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 2, truncate: 'true' }}>{user?.name}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 600 }}>{user?.college || 'Student'}</p>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, textAlign: 'center' }}>
                <div style={{ padding: '12px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: 16 }}>
                  <p style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>{user?.followers?.length || 0}</p>
                  <p style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 4 }}>Peers</p>
                </div>
                <div style={{ padding: '12px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: 16 }}>
                  <p style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>{user?.following?.length || 0}</p>
                  <p style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 4 }}>Following</p>
                </div>
              </div>
            </div>

            <nav className="flex flex-col gap-2">
              {[
                { to: '/feed', i: I.home, l: 'Home Feed', a: true },
                { to: '/network', i: I.users, l: 'Campus Network' },
                { to: '/video', i: I.video, l: 'Study Rooms' },
                { to: '/exchange', i: I.swap, l: 'Skill Exchange' },
              ].map(n => (
                <Link key={n.to} to={n.to} style={{ 
                  display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderRadius: 16, textDecoration: 'none',
                  background: n.a ? 'rgba(99,102,241,0.08)' : 'transparent',
                  color: n.a ? '#fff' : 'var(--text-dim)',
                  border: n.a ? '1px solid rgba(99,102,241,0.15)' : '1px solid transparent',
                  transition: '0.2s'
                }}>
                  <span style={{ color: n.a ? 'var(--brand-glow)' : 'inherit' }}>{n.i}</span>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{n.l}</span>
                </Link>
              ))}
            </nav>
          </aside>

          {/* ── Main Feed (Refined Standard) ── */}
          <main className="flex flex-col min-w-0 slide-up">
            
            {/* Header / Greeting */}
            <header className="mb-10">
              <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: '-1px' }}>Welcome back, <span className="text-gradient">{firstName}.</span></h1>
              <p style={{ fontSize: 14, color: 'var(--text-dim)', marginTop: 4 }}>Discover insights from your university community.</p>
            </header>

            {/* Content Creator Bar */}
            <div className="glass-panel" style={{ padding: 10, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={user?.profilePicture} className="w-full h-full object-cover rounded-xl" />
              </div>
              <button 
                onClick={() => setPostBoxOpen(true)}
                style={{ flex: 1, height: 44, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 14, padding: '0 20px', textAlign: 'left', color: 'var(--text-dim)', fontSize: 14, cursor: 'pointer', fontWeight: 600 }}
              >
                Share an insight or skill journey...
              </button>
              <button onClick={() => setPostBoxOpen(true)} className="btn-primary" style={{ padding: '0 20px', height: 44, borderRadius: 14 }}>{I.plus}</button>
            </div>

            {/* Integrated Tabs */}
            <div style={{ display: 'flex', gap: 32, marginBottom: 24, borderBottom: '1.5px solid var(--border)' }}>
              {['for-you', 'following'].map(m => (
                <button key={m} onClick={() => setFeedMode(m)} style={{ 
                  padding: '0 0 16px', background: 'none', border: 'none', fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', position: 'relative',
                  color: feedMode === m ? '#fff' : 'var(--text-muted)'
                }}>
                  {m === 'for-you' ? 'Recommended' : 'Following'}
                  {feedMode === m && <div style={{ position: 'absolute', bottom: -1.5, left: 0, width: '100%', height: 2, background: 'var(--brand)' }} />}
                </button>
              ))}
            </div>

            {newNotice > 0 && (
              <button onClick={() => { setNewNotice(0); fetch(1); }} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: 24, height: 48, borderRadius: 16 }}>
                See {newNotice} new updates
              </button>
            )}

            {/* Feed Cards */}
            <div className="flex flex-col gap-6">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <div key={i} className="glass-panel h-60 skeleton" />)
              ) : posts.length === 0 ? (
                <div className="glass-panel" style={{ padding: 60, textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-dim)', fontWeight: 600 }}>Your network is quiet. Try following more peers!</p>
                </div>
              ) : posts.map(p => (
                <PostCard key={p._id} post={p} onDelete={id => setPosts(prev => prev.filter(x => x._id !== id))} onUpdate={upd => setPosts(prev => prev.map(x => x._id === upd._id ? upd : x))} />
              ))}
              {hasMore && <button onClick={() => { setPage(p => p+1); fetch(p+1); }} className="btn-secondary w-full py-4 text-xs font-black uppercase tracking-widest">Explore More Insights</button>}
            </div>
          </main>

          {/* ── Right Sidebar (Standard) ── */}
          <aside className="sticky top-24 h-fit flex flex-col gap-6 slide-up">
            <div className="glass-panel" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 13, fontWeight: 900, textTransform: 'uppercase', color: '#fff', marginBottom: 20 }}>Suggested Skills</h3>
              <div className="flex flex-col gap-4">
                {[
                  { n: 'Vite & React', p: '2K peers', i: '⚡' },
                  { n: 'Figma Design', p: '1.5K peers', i: '🎨' },
                  { n: 'Python AI', p: '3K peers', i: '🐍' },
                ].map((s, i) => (
                  <div key={i} className="card-hover" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 14px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', cursor: 'pointer' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{s.i}</div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{s.n}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{s.p}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: 24, background: 'rgba(99,102,241,0.03)', border: '1px solid rgba(99,102,241,0.1)' }}>
              <h4 style={{ fontSize: 11, color: 'var(--brand-glow)', fontWeight: 900, textTransform: 'uppercase', marginBottom: 8 }}>Weekly Spotlight</h4>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-dim)' }}>Most active skill sharers will get featured on the global discover map next week! 🚀</p>
            </div>
          </aside>

        </div>
      </div>

      {/* --- Simple Post Modal --- */}
      {postBoxOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="glass-panel w-full max-w-xl slide-up" style={{ padding: 32, borderRadius: 28 }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800 }}>Create New Update</h2>
                <button onClick={() => setPostBoxOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 24 }}>&times;</button>
             </div>
             <PostModalForm onClose={() => setPostBoxOpen(false)} onPost={p => { setPosts(prev => [p, ...prev]); setPostBoxOpen(false); }} />
          </div>
        </div>
      )}

    </div>
  );
};

const PostModalForm = ({ onClose, onPost }) => {
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
    <form onSubmit={submit}>
       <textarea 
          autoFocus 
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Share your latest skill achievement or question..." 
          style={{ width: '100%', height: 160, background: 'none', border: 'none', color: '#fff', fontSize: 18, fontWeight: 500, outline: 'none', resize: 'none', marginBottom: 20 }} 
       />
       
       {preview && (
         <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', marginBottom: 20, border: '1.5px solid var(--border)' }}>
           {media.type.startsWith('image') ? <img src={preview} className="w-full max-h-80 object-cover" /> : <video src={preview} className="w-full max-h-80" controls />}
           <button onClick={() => { setMedia(null); setPreview(''); }} style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', padding: 8, borderRadius: '50%' }}>&times;</button>
         </div>
       )}

       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 20 }}>
         <button type="button" onClick={() => fileRef.current.click()} className="btn-secondary" style={{ padding: '10px 16px', borderRadius: 12, height: 'fit-content' }}>
           {I.image}
         </button>
         <input ref={fileRef} type="file" hidden accept="image/*,video/*" onChange={handleMedia} />
         
         <div style={{ display: 'flex', gap: 12 }}>
           <button type="button" onClick={onClose} className="btn-ghost" style={{ fontWeight: 700 }}>Cancel</button>
           <button type="submit" disabled={loading || (!content.trim() && !media)} className="btn-primary" style={{ padding: '10px 32px', borderRadius: 14 }}>
             {loading ? 'Publishing...' : 'Share Now'}
           </button>
         </div>
       </div>
    </form>
  );
};

export default Home;
