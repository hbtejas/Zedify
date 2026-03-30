import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import PostCard from '../components/PostCard';
import { postAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

/* ── Icons ── */
const I = {
  camera:  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><circle cx="12" cy="13" r="3" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  send:    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13" strokeLinecap="round" strokeLinejoin="round"/><polygon points="22 2 15 22 11 13 2 9 22 2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  x:       <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>,
  video:   <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M4 8h8a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4a2 2 0 012-2z" /></svg>,
  swap:    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>,
  up:      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7"/></svg>,
  refresh: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>,
  people:  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
};

/* ── Hero ── */
const HeroSection = ({ user, onOpenPost }) => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const first = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="grad-border mb-6">
      <div className="card-solid" style={{ background: 'var(--bg-2)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: 400, height: 400, background: 'radial-gradient(circle,rgba(37,99,235,0.15) 0%,transparent 70%)', filter: 'blur(50px)' }} />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '32px 36px', zIndex: 10, position: 'relative' }}>
          <div style={{ position: 'relative' }}>
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt="Profile" className="avatar-xl" style={{ border: '2px solid rgba(255,255,255,0.1)', objectFit: 'cover' }} />
            ) : (
              <div className="avatar-xl" style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 900, color: '#fff' }}>{first[0]}</div>
            )}
            <div style={{ position: 'absolute', bottom: 4, right: 4, width: 20, height: 20, background: 'var(--success)', borderRadius: '50%', border: '4px solid var(--bg-2)' }} />
          </div>

          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--brand-light)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
              {greeting}
            </p>
            <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: '-1px', marginBottom: 4, fontFamily: "'Space Grotesk',sans-serif" }}>
              Stay hungry, <span className="text-gradient">{first}</span>.
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>
              {user?.college ? `Representing ${user.college}` : 'Building your campus network'}.
            </p>
            <button onClick={onOpenPost} className="btn-primary" style={{ padding: '10px 24px', fontSize: 14 }}>
              <span className="flex">{I.send}</span> Create Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Quick Actions ── */
const QuickActions = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
    {[
      { to: '/network',  icon: I.people, label: 'Find Peers',    b: 'rgba(236,72,153,0.15)', c: '#f472b6' },
      { to: '/video',    icon: I.video,  label: 'Live Sessions', b: 'rgba(245,158,11,0.15)', c: '#fbbf24' },
      { to: '/exchange', icon: I.swap,   label: 'Match Skills',  b: 'rgba(56,189,248,0.15)', c: '#7dd3fc' },
    ].map(({ to, icon, label, b, c }) => (
      <Link key={to} to={to} className="card card-hover" style={{ padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: b, color: c, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
      </Link>
    ))}
  </div>
);

/* ── Create Post Box ── */
const CreatePost = ({ onPost, open, setOpen }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [media, setMedia] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  const handleFile = e => {
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
      setContent(''); setMedia(null); setPreview(''); setOpen(false);
    } catch {}
    setLoading(false);
  };

  return (
    <div className="card" style={{ marginBottom: 24, overflow: 'hidden' }}>
      {!open ? (
        <button onClick={() => setOpen(true)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: 'none', border: 'none', textAlign: 'left' }}>
          {user?.profilePicture ? <img src={user.profilePicture} className="avatar-md" alt="Avatar" /> : <div className="avatar-md" style={{ background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>{user?.name?.[0]}</div>}
          <div className="input" style={{ flex: 1, color: 'var(--text-muted)', cursor: 'pointer' }}>What skill are you working on, {user?.name?.split(' ')[0]}?</div>
        </button>
      ) : (
        <form onSubmit={submit} style={{ padding: 20 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            {user?.profilePicture ? <img src={user.profilePicture} className="avatar-md" alt="Avatar" /> : <div className="avatar-md" style={{ background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>{user?.name?.[0]}</div>}
            <div style={{ flex: 1 }}>
              <textarea autoFocus value={content} onChange={e => setContent(e.target.value)} placeholder="What's going on?" className="input" style={{ height: 100, resize: 'none' }} />
              {preview && (
                <div style={{ position: 'relative', marginTop: 12, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
                  {media?.type?.startsWith('image') ? <img src={preview} className="w-full max-h-56 object-cover" /> : <video src={preview} controls className="w-full max-h-56" />}
                  <button type="button" onClick={() => { setMedia(null); setPreview(''); }} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', padding: 6, borderRadius: '50%', cursor: 'pointer' }}>{I.x}</button>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                <button type="button" onClick={() => fileRef.current?.click()} className="btn-secondary btn-sm" style={{ color: 'var(--brand-light)' }}><span className="flex">{I.camera}</span> Media</button>
                <input ref={fileRef} type="file" accept="image/*,video/*" hidden onChange={handleFile} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" onClick={() => setOpen(false)} className="btn-ghost btn-sm">Cancel</button>
                  <button type="submit" disabled={loading || (!content.trim() && !media)} className="btn-primary btn-sm">{loading ? 'Posting...' : 'Post'}</button>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

/* ── Feed ── */
const Home = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [feedMode, setFeedMode] = useState('for-you');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [postBoxOpen, setPostBoxOpen] = useState(false);
  const [newBanner, setNewBanner] = useState([]);

  const fetch = useCallback(async (p=1, mode) => {
    const m = mode || feedMode;
    try {
      const { data } = m === 'for-you' ? await postAPI.getAIFeed(p) : await postAPI.getFeed(p);
      setPosts(prev => p === 1 ? data.data : [...prev, ...data.data]);
      setHasMore(data.pagination.page < data.pagination.pages);
    } catch {}
    setLoading(false);
    setLoadingMore(false);
  }, [feedMode]);

  useEffect(() => { setLoading(true); setPage(1); fetch(1, feedMode); }, [feedMode, fetch]);

  useEffect(() => {
    if (!socket) return;
    const h = ({ post }) => { if (post.userId?._id !== user._id && post.userId !== user._id) setNewBanner(p => [post, ...p]); };
    socket.on('newPost', h);
    return () => socket.off('newPost', h);
  }, [socket, user._id]);

  const LABELS = {
    'skill-match': { l: 'Skill Match', c: 'badge-brand' },
    'trending':    { l: 'Trending',    c: 'badge-amber' },
    'following':   { l: 'Following',   c: 'badge-green' },
    'recent':      { l: 'New',         c: 'badge-cyan' },
    'explore':     { l: 'Explore',     c: 'badge-purple' },
  };

  return (
    <div className="bg-app min-h-screen">
      <Navbar />
      <div className="page-wrapper content-grid relative z-10">
        <Sidebar />
        <main className="main-col">
          <HeroSection user={user} onOpenPost={() => setPostBoxOpen(true)} />
          <QuickActions />
          <CreatePost open={postBoxOpen} setOpen={setPostBoxOpen} onPost={p => { setPosts(prev => [p, ...prev]); setPostBoxOpen(false); }} />

          {/* feed tabs */}
          <div className="card" style={{ display: 'flex', padding: 4, marginBottom: 16 }}>
            {['for-you', 'following'].map(k => (
              <button key={k} onClick={() => setFeedMode(k)} className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-all ${feedMode === k ? 'text-white' : 'text-[var(--text-muted)]'}`} style={{ background: feedMode === k ? 'rgba(99,102,241,0.2)' : 'transparent', border: feedMode === k ? '1px solid rgba(99,102,241,0.4)' : '1px solid transparent' }}>
                {k === 'for-you' ? 'For You' : 'Following'}
                {k === 'for-you' && feedMode === k && <span style={{ marginLeft: 6, fontSize: 10, background: 'var(--brand)', padding: '2px 6px', borderRadius: 999 }}>AI</span>}
              </button>
            ))}
          </div>

          {newBanner.length > 0 && (
            <button onClick={() => { setPosts(p => [...newBanner, ...p]); setNewBanner([]); }} className="btn-primary w-full py-3 mb-4 rounded-xl text-sm" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <span className="flex">{I.up}</span> {newBanner.length} new post(s)
            </button>
          )}

          {loading ? (
            <div className="space-y-4"><div className="skeleton h-32" /><div className="skeleton h-48" /></div>
          ) : posts.length === 0 ? (
            <div className="card-glass" style={{ padding: 60, textAlign: 'center' }}>
              <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>It's quiet here...</p>
              <p style={{ color: 'var(--text-secondary)' }}>Follow students or post what you're up to!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map(post => {
                const b = feedMode === 'for-you' && post._aiReason && post._aiReason !== 'own' ? LABELS[post._aiReason] : null;
                return (
                  <div key={post._id} className="page-fade-in" style={{ animationDuration: '0.3s' }}>
                    {b && <div style={{ marginBottom: 6, marginLeft: 4 }}><span className={b.c}>{b.l}</span></div>}
                    <PostCard post={post} onDelete={id => setPosts(p => p.filter(x => x._id !== id))} onUpdate={p => setPosts(prev => prev.map(x => x._id === p._id ? p : x))} />
                  </div>
                );
              })}
              {hasMore && (
                <button onClick={() => { setLoadingMore(true); setPage(p => p+1); fetch(page+1); }} className="btn-secondary w-full py-3" disabled={loadingMore}>
                  {loadingMore ? 'Loading...' : 'Load More'}
                </button>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Home;
