import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import { userAPI, postAPI, exchangeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const MessageIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const ExchangeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 16V4m0 0L3 8m4-4l4 4"/><path d="M17 8v12m0 0l4-4m-4 4l-4-4"/>
  </svg>
);
const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const GraduateIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
  </svg>
);
const UsersIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const StarIcon = ({ filled }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill={filled ? '#f59e0b' : 'none'} stroke="#f59e0b" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const PostIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
  </svg>
);
const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const glass = { background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 16 };
const inputStyle = { width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '10px 14px', color: '#e2e8f0', fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' };

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser, updateUserInContext } = useAuth();
  const { isUserOnline } = useSocket();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followed, setFollowed] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [exchangeForm, setExchangeForm] = useState({ skillOffered: '', skillRequested: '', message: '' });
  const [exchangeLoading, setExchangeLoading] = useState(false);
  const [exchangeSuccess, setExchangeSuccess] = useState('');

  const isOwnProfile = id === currentUser?._id;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [profileRes, feedRes] = await Promise.all([
          userAPI.getProfile(id),
          postAPI.getFeed(1),
        ]);
        const p = profileRes.data.data;
        setProfile(p);
        setFollowed(p.followers?.some((f) => f._id === currentUser?._id || f === currentUser?._id));
        const allPosts = feedRes.data.data || [];
        setPosts(allPosts.filter((p) => p.userId?._id === id || p.userId === id));
      } catch {}
      setLoading(false);
    };
    fetchData();
  }, [id, currentUser?._id]);

  const handleFollow = async () => {
    setFollowLoading(true);
    try {
      await userAPI.followUser(id);
      const nowFollowing = !followed;
      setFollowed(nowFollowing);
      setProfile((prev) => ({
        ...prev,
        followers: followed
          ? prev.followers.filter((f) => f._id !== currentUser._id && f !== currentUser._id)
          : [...prev.followers, currentUser._id],
      }));
      // Update logged-in user's following list so it shows on their own profile
      const updatedFollowing = nowFollowing
        ? [...(currentUser.following || []), id]
        : (currentUser.following || []).filter((f) => (f._id || f) !== id);
      updateUserInContext({ following: updatedFollowing });
    } catch {}
    setFollowLoading(false);
  };

  const handleSendExchange = async (e) => {
    e.preventDefault();
    setExchangeLoading(true);
    try {
      await exchangeAPI.sendExchange({ receiverId: id, ...exchangeForm });
      setExchangeSuccess('Exchange request sent!');
      setTimeout(() => { setShowExchangeModal(false); setExchangeSuccess(''); }, 1800);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send request');
    }
    setExchangeLoading(false);
  };

  const inputFocus = (e) => { e.target.style.borderColor = 'rgba(99,102,241,0.6)'; };
  const inputBlur = (e) => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#060b18 0%,#0d1526 40%,#0f0c29 100%)', color: '#e2e8f0', fontFamily: 'Inter,system-ui,sans-serif' }}>
        <Navbar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
          <div style={{ width: 36, height: 36, border: '3px solid rgba(99,102,241,0.3)', borderTopColor: '#818cf8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (!profile) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#060b18 0%,#0d1526 40%,#0f0c29 100%)', color: '#e2e8f0', fontFamily: 'Inter,system-ui,sans-serif' }}>
      <Navbar />
      <div style={{ textAlign: 'center', padding: '80px 16px', color: 'rgba(148,163,184,0.6)' }}>
        <p style={{ fontSize: 16 }}>User not found.</p>
      </div>
    </div>
  );

  const avgRating = profile.avgRating || 0;
  const online = isUserOnline(profile._id);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#060b18 0%,#0d1526 40%,#0f0c29 100%)', color: '#e2e8f0', fontFamily: 'Inter,system-ui,sans-serif', position: 'relative', overflow: 'hidden' }}>
      {/* Orbs */}
      <div style={{ position: 'fixed', top: '-20%', left: '-15%', width: 550, height: 550, borderRadius: '50%', background: 'radial-gradient(circle,rgba(37,99,235,0.13) 0%,transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-20%', right: '-10%', width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.10) 0%,transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <Navbar />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 760, margin: '0 auto', padding: '24px 16px 60px' }}>

        {/* ── Profile Card ─────────────────────────────────────────────── */}
        <div style={{ ...glass, padding: '28px 28px 24px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              {profile.profilePicture ? (
                <img src={profile.profilePicture} alt={profile.name} style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(99,102,241,0.5)' }} />
              ) : (
                <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 700, color: '#fff', border: '3px solid rgba(99,102,241,0.4)' }}>
                  {profile.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
              {online && <span style={{ position: 'absolute', bottom: 4, right: 4, width: 16, height: 16, borderRadius: '50%', background: '#22c55e', border: '2.5px solid #060b18' }} />}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>{profile.name}</h1>
                {online && <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }}>Online</span>}
              </div>

              {profile.college && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(148,163,184,0.75)', fontSize: 13, marginBottom: 8 }}>
                  <GraduateIcon />
                  {profile.college}{profile.branch ? ` · ${profile.branch}` : ''}{profile.year ? ` · ${profile.year} Year` : ''}
                </div>
              )}

              {profile.bio && <p style={{ fontSize: 13, color: 'rgba(148,163,184,0.85)', margin: '0 0 12px', lineHeight: 1.6 }}>{profile.bio}</p>}

              {/* Stats row */}
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                <div>
                  <span style={{ fontSize: 17, fontWeight: 700, color: '#93c5fd' }}>{profile.followers?.length || 0}</span>
                  <span style={{ fontSize: 12, color: 'rgba(148,163,184,0.6)', marginLeft: 5 }}>followers</span>
                </div>
                <div>
                  <span style={{ fontSize: 17, fontWeight: 700, color: '#93c5fd' }}>{profile.following?.length || 0}</span>
                  <span style={{ fontSize: 12, color: 'rgba(148,163,184,0.6)', marginLeft: 5 }}>following</span>
                </div>
                <div>
                  <span style={{ fontSize: 17, fontWeight: 700, color: '#93c5fd' }}>{posts.length}</span>
                  <span style={{ fontSize: 12, color: 'rgba(148,163,184,0.6)', marginLeft: 5 }}>posts</span>
                </div>
                {avgRating > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ display: 'flex', gap: 2 }}>{[1,2,3,4,5].map((i) => <StarIcon key={i} filled={i <= Math.round(avgRating)} />)}</div>
                    <span style={{ fontSize: 12, color: '#fbbf24', fontWeight: 600 }}>{avgRating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
              {isOwnProfile ? (
                <Link to="/profile/edit" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#e2e8f0', fontSize: 13, fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                ><EditIcon />Edit Profile</Link>
              ) : (
                <>
                  <button onClick={handleFollow} disabled={followLoading}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, background: followed ? 'rgba(255,255,255,0.07)' : 'linear-gradient(135deg,#2563eb,#4f46e5)', border: followed ? '1px solid rgba(255,255,255,0.12)' : 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                  >
                    <UsersIcon />{followLoading ? '...' : followed ? 'Unfollow' : 'Follow'}
                  </button>
                  <Link to={`/chat/${profile._id}`} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#e2e8f0', fontSize: 13, fontWeight: 600, textDecoration: 'none', textAlign: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                  ><MessageIcon />Message</Link>
                  <button onClick={() => setShowExchangeModal(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(124,58,237,0.3)', color: '#c4b5fd', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(124,58,237,0.28)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(124,58,237,0.18)'}
                  ><ExchangeIcon />Exchange</button>
                </>
              )}
            </div>
          </div>

          {/* Skills */}
          {(profile.skillsOffered?.length > 0 || profile.skillsWanted?.length > 0) && (
            <div style={{ marginTop: 22, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 28, flexWrap: 'wrap' }}>
              {profile.skillsOffered?.length > 0 && (
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 8px' }}>Can Teach</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {profile.skillsOffered.map((s) => (
                      <span key={s} style={{ padding: '4px 11px', borderRadius: 99, background: 'rgba(37,99,235,0.18)', border: '1px solid rgba(37,99,235,0.3)', color: '#93c5fd', fontSize: 12, fontWeight: 600 }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {profile.skillsWanted?.length > 0 && (
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#c4b5fd', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 8px' }}>Wants to Learn</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {profile.skillsWanted.map((s) => (
                      <span key={s} style={{ padding: '4px 11px', borderRadius: 99, background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(124,58,237,0.3)', color: '#c4b5fd', fontSize: 12, fontWeight: 600 }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Posts ──────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span style={{ color: '#93c5fd' }}><PostIcon /></span>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Posts</h2>
          <span style={{ fontSize: 12, color: 'rgba(148,163,184,0.5)', marginLeft: 2 }}>({posts.length})</span>
        </div>

        {posts.length === 0 ? (
          <div style={{ ...glass, padding: '40px 16px', textAlign: 'center', color: 'rgba(148,163,184,0.45)' }}>
            <PostIcon />
            <p style={{ margin: '10px 0 0', fontSize: 14 }}>{isOwnProfile ? 'You haven\'t posted yet.' : 'No posts yet.'}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {posts.map((p) => <PostCard key={p._id} post={p} />)}
          </div>
        )}
      </div>

      {/* ── Exchange Modal ──────────────────────────────────────────── */}
      {showExchangeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99, padding: 16 }} onClick={(e) => e.target === e.currentTarget && setShowExchangeModal(false)}>
          <div style={{ ...glass, padding: '28px 28px 24px', width: '100%', maxWidth: 460, boxShadow: '0 24px 60px rgba(0,0,0,0.6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, background: 'linear-gradient(90deg,#93c5fd,#c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                Send Skill Exchange
              </h3>
              <button onClick={() => setShowExchangeModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', padding: 4, transition: 'color 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#e2e8f0'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
              ><XIcon /></button>
            </div>

            {exchangeSuccess ? (
              <div style={{ padding: '20px 16px', textAlign: 'center', color: '#34d399' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>✓</div>
                <p style={{ margin: 0, fontWeight: 600 }}>{exchangeSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleSendExchange} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(148,163,184,0.8)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Skill You Offer</label>
                  <input value={exchangeForm.skillOffered} onChange={(e) => setExchangeForm({ ...exchangeForm, skillOffered: e.target.value })} onFocus={inputFocus} onBlur={inputBlur} placeholder="e.g. Python Programming" style={inputStyle} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(148,163,184,0.8)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Skill You Request</label>
                  <input value={exchangeForm.skillRequested} onChange={(e) => setExchangeForm({ ...exchangeForm, skillRequested: e.target.value })} onFocus={inputFocus} onBlur={inputBlur} placeholder="e.g. Spanish Language" style={inputStyle} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(148,163,184,0.8)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Message <span style={{ textTransform: 'none', fontWeight: 400 }}>(optional)</span></label>
                  <textarea value={exchangeForm.message} onChange={(e) => setExchangeForm({ ...exchangeForm, message: e.target.value })} onFocus={inputFocus} onBlur={inputBlur} placeholder="Tell them about your proposal..." rows={3} style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 }} />
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button type="button" onClick={() => setShowExchangeModal(false)}
                    style={{ flex: 1, padding: '11px 0', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                  >Cancel</button>
                  <button type="submit" disabled={exchangeLoading}
                    style={{ flex: 2, padding: '11px 0', borderRadius: 10, background: 'linear-gradient(135deg,#2563eb,#4f46e5,#7c3aed)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: exchangeLoading ? 'not-allowed' : 'pointer', opacity: exchangeLoading ? 0.7 : 1 }}
                  >{exchangeLoading ? 'Sending...' : 'Send Request'}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        input::placeholder,textarea::placeholder{color:rgba(148,163,184,0.4)}
      `}</style>
    </div>
  );
};

export default Profile;

