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
  camera:  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><circle cx="12" cy="13" r="3" /></svg>,
  send:    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>,
  sparkles: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" /></svg>,
  people:  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  video:   <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M4 8h8a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4a2 2 0 012-2z" /></svg>,
  swap:    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>,
  plus:    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>,
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
  const [newPosts, setNewPosts] = useState([]);
  
  const firstName = user?.name?.split(' ')[0] || 'there';

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
        setNewPosts(p => [post, ...p]);
      }
    };
    socket.on('newPost', h);
    return () => socket.off('newPost', h);
  }, [socket, user._id]);

  return (
    <div className="bg-app min-h-screen">
      <Navbar />
      
      <div className="page-wrapper content-grid relative z-10">
        <Sidebar />

        <main className="main-col">
          
          {/* ── High-Impact Hero ── */}
          <div className="grad-border mb-8 overflow-hidden rounded-[2rem]">
            <div className="card-solid relative overflow-hidden" style={{ background: 'var(--bg-2)', padding: '48px 40px' }}>
              {/* Dynamic light effect */}
              <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: 400, height: 400, background: 'radial-gradient(circle,rgba(99,102,241,0.2) 0%,transparent 70%)', filter: 'blur(60px)' }} />
              <div style={{ position: 'absolute', bottom: '-20%', left: '-5%', width: 300, height: 300, background: 'radial-gradient(circle,rgba(168,85,247,0.15) 0%,transparent 70%)', filter: 'blur(50px)' }} />

              <div style={{ position: 'relative', zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <span className="badge-brand" style={{ padding: '6px 14px', fontSize: 11, letterSpacing: '0.1em' }}>{I.sparkles} CAMPUS CONNECT</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>•</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
                
                <h1 style={{ fontSize: 44, fontWeight: 900, color: '#fff', letterSpacing: '-2px', lineHeight: 1.1, marginBottom: 12, fontFamily: "'Space Grotesk',sans-serif" }}>
                  What's on your mind,<br /><span className="text-gradient">{firstName}?</span>
                </h1>
                
                <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 32, maxWidth: 500, lineHeight: 1.6 }}>
                  {user?.college ? `Representing ${user.college}.` : 'Ready to build your campus legacy?'} Share an update or find a skill partner today.
                </p>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => setPostBoxOpen(true)} className="btn-primary" style={{ padding: '14px 28px', fontSize: 15 }}>
                    <span className="flex">{I.plus}</span> Create Update
                  </button>
                  <Link to="/network" className="btn-secondary" style={{ padding: '14px 28px', fontSize: 15 }}>
                    <span className="flex">{I.people}</span> Find Peers
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* ── Quick Stats/Actions ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
            {[
              { to: '/network', icon: I.people, label: 'Peer Network', desc: 'Connect & Learn', c: 'indigo' },
              { to: '/video', icon: I.video, label: 'Live Rooms', desc: 'Join Study Sessions', c: 'amber' },
              { to: '/exchange', icon: I.swap, label: 'Skill Swap', desc: 'Match your needs', c: 'emerald' },
            ].map((a) => (
              <Link key={a.label} to={a.to} className="card card-hover" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'left' }}>
                <div className={`badge-${a.c === 'indigo' ? 'brand' : a.c === 'amber' ? 'amber' : 'green'}`} style={{ width: 'fit-content', padding: 12, borderRadius: 16 }}>{a.icon}</div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 2 }}>{a.label}</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.desc}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* ── Feed Section ── */}
          <div className="flex items-center justify-between mb-6">
            <div style={{ display: 'flex', gap: 4, background: 'var(--surface)', padding: 4, borderRadius: 12, border: '1px solid var(--border)' }}>
              {['for-you', 'following'].map(m => (
                <button key={m} onClick={() => setFeedMode(m)} className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${feedMode === m ? 'text-white' : 'text-[var(--text-muted)]'}`} style={{ background: feedMode === m ? 'rgba(99,102,241,0.2)' : 'transparent', border: feedMode === m ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent' }}>
                  {m === 'for-you' ? 'For You' : 'Following'}
                </button>
              ))}
            </div>
            {newPosts.length > 0 && (
              <button onClick={() => { setPosts(p => [...newPosts, ...p]); setNewPosts([]); }} className="badge-brand animate-pulse" style={{ padding: '8px 16px', cursor: 'pointer' }}>
                {newPosts.length} new updates
              </button>
            )}
          </div>

          {loading ? (
            <div className="space-y-6"><div className="skeleton h-32" /><div className="skeleton h-60" /><div className="skeleton h-48" /></div>
          ) : (
            <div className="space-y-6">
              {posts.map(post => (
                <div key={post._id} className="page-fade-in" style={{ animationDuration: '0.4s' }}>
                  <PostCard post={post} onDelete={id => setPosts(p => p.filter(x => x._id !== id))} onUpdate={upd => setPosts(p => p.map(x => x._id === upd._id ? upd : x))} />
                </div>
              ))}
              {hasMore && (
                <button onClick={() => { setPage(p => p+1); fetch(page+1); }} className="btn-secondary w-full py-4 text-sm uppercase tracking-widest font-bold">
                  Load Older Posts
                </button>
              )}
            </div>
          )}

        </main>
      </div>

      {/* --- Floating Action Button (Mobile) --- */}
      <button onClick={() => setPostBoxOpen(true)} className="lg:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full btn-primary shadow-2xl flex items-center justify-center z-50">
        {I.plus}
      </button>

      {/* --- Post Modal (Overlay) --- */}
      {postBoxOpen && (
        <PostModal onClose={() => setPostBoxOpen(false)} onPost={p => { setPosts(prev => [p, ...prev]); setPostBoxOpen(false); }} />
      )}
    </div>
  );
};

/* ── New Post Modal ── */
const PostModal = ({ onClose, onPost }) => {
  const { user } = useAuth();
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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="card-solid w-full max-w-xl page-fade-in" style={{ padding: 0, position: 'relative' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: 18, fontWeight: 900, color: '#fff', fontFamily: "'Space Grotesk',sans-serif" }}>Create Update</h2>
          <button onClick={onClose} className="btn-ghost" style={{ padding: 8 }}>&times;</button>
        </div>
        <form onSubmit={submit} style={{ padding: 24 }}>
          <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
            <img src={user?.profilePicture} className="avatar-md" style={{ flexShrink: 0 }} />
            <textarea autoFocus value={content} onChange={e => setContent(e.target.value)} placeholder="What's going on at campus?" className="input" style={{ width: '100%', height: 120, background: 'transparent', border: 'none', padding: 0, fontSize: 18, resize: 'none' }} />
          </div>
          
          {preview && (
            <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', marginBottom: 20, border: '1px solid var(--border)' }}>
              {media.type.startsWith('image') ? <img src={preview} className="w-full max-h-80 object-cover" /> : <video src={preview} className="w-full max-h-80" controls />}
              <button onClick={() => { setMedia(null); setPreview(''); }} style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', padding: 8, borderRadius: '50%' }}>&times;</button>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 20, borderTop: '1px solid var(--border)' }}>
            <button type="button" onClick={() => fileRef.current.click()} className="btn-secondary" style={{ padding: '10px 20px', fontSize: 13, gap: 8 }}>
              <span className="flex">{I.camera}</span> Add Media
            </button>
            <input ref={fileRef} type="file" hidden accept="image/*,video/*" onChange={handleMedia} />
            
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={onClose} className="btn-ghost" style={{ fontSize: 14 }}>Cancel</button>
              <button type="submit" disabled={loading || (!content.trim() && !media)} className="btn-primary" style={{ padding: '10px 32px' }}>
                {loading ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Home;
