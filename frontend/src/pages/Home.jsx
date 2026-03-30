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
  lightning: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>,
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
      
      <div className="page-wrapper relative z-10">
        <div className="content-grid">
          
          {/* ── Left Sidebar (Global context) ── */}
          <div className="left-sidebar space-y-6">
            {/* Minimal User Info Card */}
            <div className="card-glass" style={{ padding: '24px 20px', textAlign: 'center' }}>
              <div style={{ position: 'relative', width: 'fit-content', margin: '0 auto 16px' }}>
                {user?.profilePicture ? (
                  <img src={user.profilePicture} className="avatar-xl" style={{ border: '3px solid var(--brand)' }} />
                ) : (
                  <div className="avatar-xl" style={{ background: 'linear-gradient(135deg,var(--brand),var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 900, color: '#fff' }}>{user?.name?.[0]}</div>
                )}
                <div style={{ position: 'absolute', bottom: 4, right: 4, width: 22, height: 22, background: 'var(--success)', borderRadius: '50%', border: '4px solid var(--surface)' }} />
              </div>
              <h2 style={{ fontSize: 20, marginBottom: 4 }}>{user?.name}</h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>{user?.college || 'Student'}</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                <div><p style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>{user?.followers?.length || 0}</p><p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Peers</p></div>
                <div><p style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>{user?.following?.length || 0}</p><p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Following</p></div>
              </div>
            </div>

            {/* Quick Links Overlay (Replaces traditional sidebar) */}
            <div className="space-y-3">
              {[
                { to: '/feed', icon: I.lightning, label: 'Activity Hub', active: true },
                { to: '/network', icon: I.people, label: 'Find a Mentor' },
                { to: '/video', icon: I.video, label: 'Live Study' },
                { to: '/exchange', icon: I.swap, label: 'Skill Market' },
              ].map(link => (
                <Link key={link.label} to={link.to} style={{ 
                  display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderRadius: 16, textDecoration: 'none',
                  transition: 'all 0.2s', background: link.active ? 'rgba(99,102,241,0.1)' : 'transparent',
                  color: link.active ? 'var(--brand-light)' : 'var(--text-secondary)',
                  border: link.active ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent'
                }}>
                  <span className="flex">{link.icon}</span>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{link.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* ── Main Feed (The Redesign) ── */}
          <main className="main-col page-fade-in">
            
            {/* ── Editorial Header ── */}
            <div className="mb-10">
              <span className="badge-brand" style={{ marginBottom: 16, display: 'inline-block' }}>GOOD MORNING, {firstName.toUpperCase()} 👋</span>
              <h1 style={{ fontSize: 44, color: '#fff', letterSpacing: '-2px', lineHeight: 1.1, marginBottom: 8 }}>
                The campus is <span className="text-gradient">awake.</span>
              </h1>
              <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 500 }}>
                {newPosts.length > 0 ? `${newPosts.length} new insights from your peers.` : "Here's what's happening at your university today."}
              </p>
            </div>

            {/* ── New Post Trigger ── */}
            <div className="card-glass" style={{ padding: '8px 8px 8px 24px', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
              <p style={{ fontSize: 15, color: 'var(--text-muted)', fontWeight: 600 }}>What's your focus today?</p>
              <button onClick={() => setPostBoxOpen(true)} className="btn-primary" style={{ marginLeft: 'auto', padding: '10px 24px' }}>
                Post Insight {I.lightning}
              </button>
            </div>

            {/* ── Feed Filter Tabs (Clean) ── */}
            <div style={{ display: 'flex', gap: 32, marginBottom: 24, borderBottom: '1px solid var(--border)' }}>
              {['for-you', 'following'].map(m => (
                <button key={m} onClick={() => setFeedMode(m)} style={{
                  padding: '0 4px 12px', background: 'none', border: 'none', color: feedMode === m ? '#fff' : 'var(--text-muted)',
                  fontSize: 14, fontWeight: 800, cursor: 'pointer', position: 'relative', transition: 'all 0.2s'
                }}>
                  {m === 'for-you' ? 'FOR YOU (AI)' : 'FOLLOWING'}
                  {feedMode === m && <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 3, background: 'var(--brand)', borderRadius: '99px' }} />}
                </button>
              ))}
            </div>

            {/* ── Posts ── */}
            {loading ? (
              <div className="space-y-8"><div className="skeleton h-40" /><div className="skeleton h-60" /><div className="skeleton h-32" /></div>
            ) : (
              <div className="space-y-8">
                {posts.map(post => (
                  <PostCard key={post._id} post={post} onDelete={id => setPosts(p => p.filter(x => x._id !== id))} onUpdate={upd => setPosts(p => p.map(x => x._id === upd._id ? upd : x))} />
                ))}
                {hasMore && (
                   <button onClick={() => { setPage(p => p+1); fetch(page+1); }} className="btn-secondary w-full py-4 text-xs font-black uppercase tracking-widest">
                     Explore More Activities
                   </button>
                )}
              </div>
            )}
          </main>

          {/* ── Right Sidebar (Dynamic Activity) ── */}
          <div className="right-sidebar space-y-6">
            {/* Active Peers Card */}
            <div className="card-solid" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <span className="badge-green" style={{ width: 8, height: 8, padding: 0, borderRadius: '50%' }} />
                <h3 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Live on Campus</h3>
              </div>
              <div className="space-y-4">
                {/* Mock live users/rooms - would be dynamic in real app */}
                {[
                  { n: 'React Study Group', p: '12 active', i: '⚛️' },
                  { n: 'Economics Prep', p: '5 active', i: '📉' },
                  { n: 'Design Sync', p: '8 active', i: '🎨' },
                ].map((room, i) => (
                  <div key={i} className="card-hover" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 16, background: 'rgba(255,255,255,0.03)', cursor: 'pointer' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{room.i}</div>
                    <div className="min-w-0">
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{room.n}</p>
                      <p style={{ fontSize: 11, color: 'var(--success)', fontWeight: 700 }}>{room.p}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Tip */}
            <div className="card-glass" style={{ padding: 24, border: '1px dashed var(--brand)', background: 'rgba(99,102,241,0.03)' }}>
              <h4 style={{ color: 'var(--brand-light)', fontSize: 11, textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.1em' }}>Pro Tip {I.sparkles}</h4>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-secondary)' }}>You can barter your **Python skills** for **Guitar lessons** in the Skill Market today. Check it out!</p>
            </div>
          </div>

        </div>
      </div>

      {/* --- Floating FAB --- */}
      <button onClick={() => setPostBoxOpen(true)} className="lg:hidden fixed bottom-6 right-6 w-16 h-16 rounded-full btn-primary shadow-2xl flex items-center justify-center z-50">
        {I.plus}
      </button>

      {/* --- New Post Overlay --- */}
      {postBoxOpen && (
        <PostModal onClose={() => setPostBoxOpen(false)} onPost={p => { setPosts(prev => [p, ...prev]); setPostBoxOpen(false); }} />
      )}
    </div>
  );
};

/* ── New Post Modal (Minimalist) ── */
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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(3,6,18,0.95)', backdropFilter: 'blur(10px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="card-glass w-full max-w-2xl page-fade-in" style={{ padding: 40, border: '1px solid var(--border-2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32 }}>
          <h2 style={{ fontSize: 24 }}>New Insight</h2>
          <button onClick={onClose} className="btn-ghost" style={{ fontSize: 24 }}>&times;</button>
        </div>
        <form onSubmit={submit}>
           <textarea autoFocus value={content} onChange={e => setContent(e.target.value)} placeholder="Share a skill update, a question, or a campus find..." style={{ 
             width: '100%', height: 180, background: 'transparent', border: 'none', color: '#fff', fontSize: 22, outline: 'none', resize: 'none', marginBottom: 24, padding: 0
           }} />
           
           {preview && (
             <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', marginBottom: 24, border: '1px solid var(--border)' }}>
               {media.type.startsWith('image') ? <img src={preview} className="w-full max-h-80 object-cover" /> : <video src={preview} className="w-full max-h-80" controls />}
               <button onClick={() => { setMedia(null); setPreview(''); }} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', padding: 10, borderRadius: '50%' }}>&times;</button>
             </div>
           )}

           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
             <button type="button" onClick={() => fileRef.current.click()} className="btn-secondary" style={{ borderRadius: 16, padding: '12px 24px' }}>
               {I.camera} Attach Media
             </button>
             <input ref={fileRef} type="file" hidden accept="image/*,video/*" onChange={handleMedia} />
             <button type="submit" disabled={loading || (!content.trim() && !media)} className="btn-primary" style={{ borderRadius: 16, padding: '12px 40px' }}>
               {loading ? 'Publishing...' : 'Share Now'}
             </button>
           </div>
        </form>
      </div>
    </div>
  );
};

export default Home;
