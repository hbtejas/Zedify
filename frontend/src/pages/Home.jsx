import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import { postAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

/* ── Minimalist Icons ── */
const I = {
  plus:    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>,
  spark:   <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>,
  users:    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m12-16a4 4 0 11-8 0 4 4 0 018 0z"/></svg>,
  stats:    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>,
  search:   <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>,
  media:    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>,
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
  const [stats, setStats] = useState({ totalUsers: 0, totalPosts: 0, activeRooms: 0 });

  const fetchStats = useCallback(async () => {
    try {
       // In a real app, this would be an API call for global metrics
       setStats({ totalUsers: 1420, totalPosts: 8500, activeRooms: 12 });
    } catch {}
  }, []);

  const fetchPosts = useCallback(async (p=1, mode) => {
    try {
      const { data } = (mode || feedMode) === 'for-you' ? await postAPI.getAIFeed(p) : await postAPI.getFeed(p);
      setPosts(prev => p === 1 ? data.data : [...prev, ...data.data]);
      setHasMore(data.pagination.page < data.pagination.pages);
    } catch {}
    setLoading(false);
  }, [feedMode]);

  useEffect(() => { setLoading(true); setPage(1); fetchStats(); fetchPosts(1, feedMode); }, [feedMode, fetchPosts, fetchStats]);

  const firstName = user?.name?.split(' ')[0] || 'Student';

  return (
    <div className="bg-app min-h-screen" style={{ background: '#02040a' }}>
      <Navbar />
      
      <div className="page-wrapper pt-24 pb-20">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr 1fr', gap: 32 }}>
          
          {/* ── Wing: Fast Stats ── */}
          <aside className="sticky top-24 h-fit flex flex-col gap-6 slide-up">
            <div className="glass-panel" style={{ padding: 24, borderRadius: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                 <span style={{ color: 'var(--brand-glow)' }}>{I.stats}</span>
                 <h3 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 900, color: '#fff' }}>Platform Metrics</h3>
              </div>
              <div className="flex flex-col gap-3">
                 {[
                   { l: 'Verified Students', v: stats.totalUsers, d: 'Growing daily' },
                   { l: 'Knowledge Swaps', v: stats.totalPosts, d: 'Shared insights' },
                   { l: 'Live Study Pods', v: stats.activeRooms, d: 'Joining now' },
                 ].map(s => (
                   <div key={s.l} style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 20 }}>
                      <p style={{ fontSize: 24, fontWeight: 900, color: 'var(--brand-glow)', lineHeight: 1 }}>{s.v}+</p>
                      <p style={{ fontSize: 13, fontWeight: 800, color: '#fff', marginTop: 4 }}>{s.l}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.d}</p>
                   </div>
                 ))}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: 24, background: 'rgba(99,102,241,0.02)', border: '1.5px dashed var(--brand)' }}>
               <h4 style={{ color: 'var(--brand-light)', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', marginBottom: 8 }}>Weekly Spotlight</h4>
               <p style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.6 }}>Our <strong>AI-Matchmaker</strong> has paired over 200 study partners this week alone. Are you next?</p>
            </div>
          </aside>

          {/* ── Wing: Core Interaction ── */}
          <main className="flex flex-col min-w-0 slide-up">
            
            <header className="mb-10 text-center">
              <h1 style={{ fontSize: 36, fontWeight: 900, color: '#fff', letterSpacing: '-1.5px', marginBottom: 4 }}>
                Ready to contribute, <span className="text-gradient">{firstName}?</span>
              </h1>
              <p style={{ fontSize: 14, color: 'var(--text-dim)', fontWeight: 600 }}>Your insights shape the campus collective.</p>
            </header>

            {/* Refined Quick Post */}
            <div className="glass-panel" style={{ padding: 20, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 16, background: 'var(--brand)', overflow: 'hidden' }}>
                <img src={user?.profilePicture} className="w-full h-full object-cover" />
              </div>
              <button 
                onClick={() => setPostBoxOpen(true)}
                style={{ flex: 1, height: 48, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 16, padding: '0 20px', textAlign: 'left', color: 'var(--text-dim)', fontSize: 14, cursor: 'pointer', fontWeight: 600 }}
              >
                Share what you're learning today...
              </button>
            </div>

            {/* Unified Feed Navigation */}
            <div style={{ display: 'flex', gap: 32, marginBottom: 24, borderBottom: '1.5px solid var(--border)', justifyContent: 'center' }}>
              {['for-you', 'following'].map(m => (
                <button key={m} onClick={() => setFeedMode(m)} style={{ 
                  padding: '0 8px 16px', background: 'none', border: 'none', fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', position: 'relative',
                  color: feedMode === m ? '#fff' : 'var(--text-muted)'
                }}>
                  {m === 'for-you' ? 'Global Collective' : 'Your Circle'}
                  {feedMode === m && <div style={{ position: 'absolute', bottom: -1.5, left: 0, width: '100%', height: 3, background: 'var(--brand)', boxShadow: '0 0 10px var(--brand-glow)' }} />}
                </button>
              ))}
            </div>

            {/* Posts */}
            <div className="flex flex-col gap-8">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <div key={i} className="glass-panel h-60 skeleton" />)
              ) : posts.map(p => (
                <div key={p._id} className="slide-up">
                   <PostCard post={p} onDelete={id => setPosts(prev => prev.filter(x => x._id !== id))} onUpdate={upd => setPosts(prev => prev.map(x => x._id === upd._id ? upd : x))} />
                </div>
              ))}
              {hasMore && <button onClick={() => { setPage(p => p+1); fetchPosts(p+1); }} className="btn-secondary w-full py-4 text-xs font-black tracking-widest">Discover More</button>}
            </div>
          </main>

          {/* ── Wing: Peer Awareness ── */}
          <aside className="sticky top-24 h-fit flex flex-col gap-6 slide-up">
            <div className="glass-panel" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h3 style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-dim)' }}>Live Peers</h3>
                <span className="badge-green animate-pulse" style={{ fontSize: 9 }}>REALTIME</span>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  { n: 'Arjun S.', l: 'IIT Bombay', i: '👨‍💻' },
                  { n: 'Nisha K.', l: 'Delhi University', i: '👩‍🎨' },
                  { n: 'Rahul V.', l: 'BITS Pilani', i: '👨‍🔬' },
                ].map((p, i) => (
                  <div key={i} className="card-hover" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 12, borderRadius: 20, background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{p.i}</div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{p.n}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{p.l}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/network" className="btn-secondary w-full mt-6 justify-center" style={{ fontSize: 12 }}>Explore Global Campus</Link>
            </div>

            <div className="glass-panel" style={{ padding: 24, border: '1px solid rgba(168,85,247,0.1)' }}>
               <h3 style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: 'var(--accent-glow)', marginBottom: 12 }}>Campus Fact</h3>
               <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-dim)' }}>Over <strong>75%</strong> of students on Zedify find a skill partner within 48 hours of posting an update.</p>
            </div>
          </aside>

        </div>
      </div>

      {/* --- Floating Fab --- */}
      <button onClick={() => setPostBoxOpen(true)} className="lg:hidden fixed bottom-8 right-8 w-16 h-16 rounded-full btn-primary z-50 shadow-2xl">
        {I.plus}
      </button>

      {/* --- Post Modal --- */}
      {postBoxOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(1,3,9,0.95)', backdropFilter: 'blur(32px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div className="glass-panel w-full max-w-2xl slide-up" style={{ padding: 48, background: 'var(--sub-bg)' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
                <h2 style={{ fontSize: 24, fontWeight: 900 }}>Craft Your Insight</h2>
                <button onClick={() => setPostBoxOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 28 }}>&times;</button>
             </div>
             <PostModalArea onClose={() => setPostBoxOpen(false)} onPost={p => { setPosts(prev => [p, ...prev]); setPostBoxOpen(false); }} />
          </div>
        </div>
      )}
    </div>
  );
};

const PostModalArea = ({ onClose, onPost }) => {
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
       <textarea autoFocus value={content} onChange={e => setContent(e.target.value)} placeholder="What's your focus today?" style={{ width: '100%', height: 180, background: 'none', border: 'none', color: '#fff', fontSize: 24, outline: 'none', resize: 'none', marginBottom: 32, fontWeight: 300 }} />
       
       {preview && (
         <div style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', marginBottom: 32, border: '1.5px solid var(--border)' }}>
           {media.type.startsWith('image') ? <img src={preview} className="w-full max-h-80 object-cover" /> : <video src={preview} className="w-full max-h-80" controls />}
           <button onClick={() => { setMedia(null); setPreview(''); }} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', padding: 8, borderRadius: '50%' }}>&times;</button>
         </div>
       )}

       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 32 }}>
         <button type="button" onClick={() => fileRef.current.click()} className="btn-secondary" style={{ padding: '12px 20px', borderRadius: 16 }}>{I.media} Attach</button>
         <input ref={fileRef} type="file" hidden accept="image/*,video/*" onChange={handleMedia} />
         <button type="submit" disabled={loading || (!content.trim() && !media)} className="btn-primary" style={{ padding: '14px 48px', borderRadius: 99 }}>{loading ? 'PUBLISHING...' : 'PUBLISH NOW'}</button>
       </div>
    </form>
  );
};

export default Home;
