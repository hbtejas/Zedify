import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';

const BG = 'linear-gradient(135deg,#060b18 0%,#0d1526 40%,#0f0c29 100%)';
const GLASS = { background:'rgba(255,255,255,0.05)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.10)' };
const GLASS_DARK = { background:'rgba(0,0,0,0.25)', backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.08)' };

/* ── Icons ── */
const UserIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);
const UsersIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>);
const StarIcon = ({ filled, half }) => (<svg viewBox="0 0 24 24" fill={filled ? '#fbbf24' : (half ? 'url(#half)' : 'none')} stroke="#fbbf24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><defs><linearGradient id="half"><stop offset="50%" stopColor="#fbbf24"/><stop offset="50%" stopColor="transparent"/></linearGradient></defs><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>);
const HeartIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>);
const EditIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>);
const CheckIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="20 6 9 17 4 12"/></svg>);
const ArrowLeftIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>);

/* ── Star rating display ── */
const StarDisplay = ({ rating, size = 'md' }) => {
  const cls = size === 'lg' ? 'w-7 h-7' : size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((s) => (
        <svg key={s} viewBox="0 0 24 24"
          fill={rating >= s ? '#fbbf24' : rating >= s - 0.5 ? 'url(#halfGrad)' : 'none'}
          stroke="#fbbf24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={cls}>
          <defs>
            <linearGradient id="halfGrad" x1="0" x2="1" y1="0" y2="0">
              <stop offset="50%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  );
};

/* ── Interactive star picker ── */
const StarPicker = ({ value, onChange }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map((s) => (
        <button key={s} type="button"
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(s)}
          className="transition-transform hover:scale-125 active:scale-110">
          <svg viewBox="0 0 24 24"
            fill={(hover || value) >= s ? '#fbbf24' : 'none'}
            stroke="#fbbf24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </button>
      ))}
    </div>
  );
};

/* ── User card used in follow lists ── */
const UserCard = ({ person, currentUserId, onFollowToggle }) => {
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      await onFollowToggle(person._id);
      setFollowing((f) => !f);
    } catch {}
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 hover:scale-[1.005]" style={GLASS_DARK}>
      {person.profilePicture ? (
        <img src={person.profilePicture} alt={person.name}
          className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
          style={{ border:'1px solid rgba(255,255,255,0.12)' }} />
      ) : (
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
          style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
          {person.name?.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{person.name}</p>
        <p className="text-[11px] truncate" style={{ color:'rgba(148,163,184,0.6)' }}>
          {person.college || 'Zedify Member'}
          {person.skillsOffered?.length > 0 && ` · ${person.skillsOffered[0]}`}
        </p>
      </div>
      {person._id !== currentUserId && (
        <div className="flex items-center gap-2">
          {person.onlineStatus && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" title="Online" />
          )}
          <button
            onClick={handleToggle}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-60"
            style={following
              ? { background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.7)' }
              : { background:'linear-gradient(135deg,#4f46e5,#7c3aed)', border:'1px solid rgba(99,102,241,0.4)', color:'white', boxShadow:'0 4px 12px rgba(99,102,241,0.3)' }
            }>
            {loading ? (
              <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
            ) : following ? (
              <><CheckIcon /> Following</>
            ) : (
              'Follow'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

/* ── Main Settings Component ── */
const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('account');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingUserId, setRatingUserId] = useState('');
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [ratingSuccess, setRatingSuccess] = useState('');

  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await userAPI.getProfile(user._id);
      setProfile(data.data);
    } catch {}
    setLoading(false);
  }, [user._id]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleFollowToggle = async (userId) => {
    await userAPI.followUser(userId);
    fetchProfile();
  };

  const handleRateSubmit = async (e) => {
    e.preventDefault();
    if (!ratingUserId.trim() || !ratingValue) return;
    setRatingSubmitting(true);
    try {
      const res = await userAPI.rateUser(ratingUserId.trim(), ratingValue);
      setRatingSuccess(`Rating submitted! Avg: ${res.data.avgRating} ⭐ (${res.data.totalRatings} ratings)`);
      setRatingValue(0);
      setRatingUserId('');
      setTimeout(() => setRatingSuccess(''), 4000);
    } catch (err) {
      setRatingSuccess('Error: ' + (err.response?.data?.message || 'Failed'));
      setTimeout(() => setRatingSuccess(''), 3000);
    }
    setRatingSubmitting(false);
  };

  const avgRating = profile?.avgRating || 0;
  const totalRatings = profile?.ratings?.length || 0;

  const tabs = [
    { key:'account', label:'Account', icon: <UserIcon /> },
    { key:'following', label:`Following (${profile?.following?.length || 0})`, icon: <UsersIcon /> },
    { key:'followers', label:`Followers (${profile?.followers?.length || 0})`, icon: <HeartIcon /> },
    { key:'rating', label:'Rating', icon: <StarIcon /> },
  ];

  return (
    <div className="min-h-screen relative" style={{ background: BG }}>
      {/* Ambient orbs */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background:'radial-gradient(circle,rgba(79,70,229,0.10) 0%,transparent 70%)', filter:'blur(80px)' }} />
      <div className="fixed bottom-0 left-0 w-96 h-96 rounded-full pointer-events-none"
        style={{ background:'radial-gradient(circle,rgba(37,99,235,0.08) 0%,transparent 70%)', filter:'blur(60px)' }} />

      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">

        {/* Page header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white/60 hover:text-white transition-colors flex-shrink-0"
            style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.10)' }}>
            <ArrowLeftIcon />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <p className="text-sm mt-0.5" style={{ color:'rgba(148,163,184,0.6)' }}>Manage your account, connections and reputation</p>
          </div>
        </div>

        {/* Profile overview card */}
        {profile && (
          <div className="rounded-3xl p-5 mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-5" style={GLASS}>
            {/* Avatar */}
            {profile.profilePicture ? (
              <img src={profile.profilePicture} alt={profile.name}
                className="w-20 h-20 rounded-2xl object-cover flex-shrink-0"
                style={{ border:'2px solid rgba(99,102,241,0.4)', boxShadow:'0 0 24px rgba(99,102,241,0.2)' }} />
            ) : (
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white flex-shrink-0"
                style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed)', boxShadow:'0 0 24px rgba(99,102,241,0.3)' }}>
                {profile.name?.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-bold text-white">{profile.name}</h2>
              <p className="text-sm mt-0.5" style={{ color:'rgba(148,163,184,0.65)' }}>
                {profile.college || 'Zedify Member'}
                {profile.branch ? ` · ${profile.branch}` : ''}
                {profile.year ? ` · ${profile.year} Year` : ''}
              </p>

              {/* Rating row */}
              <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
                <StarDisplay rating={avgRating} size="sm" />
                <span className="text-sm font-bold" style={{ color:'#fbbf24' }}>{avgRating > 0 ? avgRating.toFixed(1) : '—'}</span>
                <span className="text-xs" style={{ color:'rgba(148,163,184,0.55)' }}>{totalRatings > 0 ? `${totalRatings} rating${totalRatings !== 1 ? 's' : ''}` : 'No ratings yet'}</span>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-3 mt-3 flex-wrap justify-center sm:justify-start">
                {[
                  { label:'Following', value: profile.following?.length || 0, color:'#818cf8' },
                  { label:'Followers', value: profile.followers?.length || 0, color:'#34d399' },
                  { label:'Skills Offered', value: profile.skillsOffered?.length || 0, color:'#60a5fa' },
                  { label:'Skills Wanted', value: profile.skillsWanted?.length || 0, color:'#f472b6' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex flex-col items-center px-3 py-1.5 rounded-xl"
                    style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}>
                    <span className="text-base font-bold" style={{ color }}>{value}</span>
                    <span className="text-[10px]" style={{ color:'rgba(148,163,184,0.55)' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Edit profile button */}
            <Link to="/profile/edit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98] flex-shrink-0"
              style={{ background:'rgba(99,102,241,0.25)', border:'1px solid rgba(99,102,241,0.35)' }}>
              <EditIcon /> Edit Profile
            </Link>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {tabs.map(({ key, label, icon }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200"
              style={activeTab === key
                ? { background:'linear-gradient(135deg,#4f46e5,#7c3aed)', color:'white', boxShadow:'0 4px 16px rgba(99,102,241,0.4)' }
                : { background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.10)', color:'rgba(255,255,255,0.65)' }
              }>
              {icon} {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          </div>
        ) : (
          <>
            {/* ── Account Tab ── */}
            {activeTab === 'account' && (
              <div className="space-y-4">
                <div className="rounded-3xl p-6" style={GLASS}>
                  <h3 className="text-white font-bold text-lg mb-4">Profile Information</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { label:'Name', value: profile?.name },
                      { label:'Email', value: user?.email },
                      { label:'College', value: profile?.college || '—' },
                      { label:'Branch', value: profile?.branch || '—' },
                      { label:'Year', value: profile?.year || '—' },
                      { label:'Bio', value: profile?.bio || '—' },
                    ].map(({ label, value }) => (
                      <div key={label} className="px-4 py-3 rounded-xl" style={GLASS_DARK}>
                        <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color:'rgba(148,163,184,0.55)' }}>{label}</p>
                        <p className="text-white text-sm font-medium truncate">{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Skills section */}
                  <div className="mt-5 space-y-3">
                    {[
                      { label:'Skills I Offer', skills: profile?.skillsOffered, color:'#60a5fa', bg:'rgba(96,165,250,0.12)', border:'rgba(96,165,250,0.25)' },
                      { label:'Skills I Want to Learn', skills: profile?.skillsWanted, color:'#f472b6', bg:'rgba(244,114,182,0.12)', border:'rgba(244,114,182,0.25)' },
                    ].map(({ label, skills, color, bg, border }) => (
                      <div key={label}>
                        <p className="text-xs font-semibold mb-2" style={{ color:'rgba(148,163,184,0.6)' }}>{label}</p>
                        <div className="flex flex-wrap gap-2">
                          {skills?.length > 0 ? skills.map((s) => (
                            <span key={s} className="px-3 py-1 rounded-full text-xs font-semibold"
                              style={{ background: bg, border:`1px solid ${border}`, color }}>
                              {s}
                            </span>
                          )) : (
                            <span className="text-xs" style={{ color:'rgba(148,163,184,0.45)' }}>None added</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 pt-5" style={{ borderTop:'1px solid rgba(255,255,255,0.08)' }}>
                    <Link to="/profile/edit"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                      style={{ background:'linear-gradient(135deg,#2563eb,#4f46e5)', boxShadow:'0 6px 18px rgba(99,102,241,0.35)' }}>
                      <EditIcon /> Edit Profile Information
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* ── Following Tab ── */}
            {activeTab === 'following' && (
              <div className="space-y-3">
                {profile?.following?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 rounded-3xl gap-3" style={GLASS}>
                    <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background:'rgba(99,102,241,0.12)' }}>
                      <UsersIcon />
                    </div>
                    <p className="text-white font-semibold">Not following anyone yet</p>
                    <p className="text-sm" style={{ color:'rgba(148,163,184,0.55)' }}>Discover and follow people to grow your network</p>
                    <Link to="/feed" className="px-5 py-2 rounded-xl text-sm font-semibold text-white"
                      style={{ background:'rgba(99,102,241,0.5)', border:'1px solid rgba(99,102,241,0.4)' }}>
                      Explore Feed
                    </Link>
                  </div>
                ) : (
                  profile.following.map((person) => (
                    <UserCard key={person._id} person={person} currentUserId={user._id} onFollowToggle={handleFollowToggle} />
                  ))
                )}
              </div>
            )}

            {/* ── Followers Tab ── */}
            {activeTab === 'followers' && (
              <div className="space-y-3">
                {profile?.followers?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 rounded-3xl gap-3" style={GLASS}>
                    <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background:'rgba(244,114,182,0.10)' }}>
                      <HeartIcon />
                    </div>
                    <p className="text-white font-semibold">No followers yet</p>
                    <p className="text-sm" style={{ color:'rgba(148,163,184,0.55)' }}>Share skills, post content and people will follow you</p>
                  </div>
                ) : (
                  profile.followers.map((person) => (
                    <UserCard key={person._id} person={person} currentUserId={user._id} onFollowToggle={handleFollowToggle} />
                  ))
                )}
              </div>
            )}

            {/* ── Rating Tab ── */}
            {activeTab === 'rating' && (
              <div className="space-y-5">
                {/* My rating stats */}
                <div className="rounded-3xl p-6" style={GLASS}>
                  <h3 className="text-white font-bold text-lg mb-5">Your Reputation</h3>
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* Big number */}
                    <div className="flex flex-col items-center">
                      <div className="text-6xl font-black" style={{ color: avgRating > 0 ? '#fbbf24' : 'rgba(148,163,184,0.3)' }}>
                        {avgRating > 0 ? avgRating.toFixed(1) : '—'}
                      </div>
                      <StarDisplay rating={avgRating} size="lg" />
                      <p className="text-xs mt-2" style={{ color:'rgba(148,163,184,0.55)' }}>
                        {totalRatings > 0 ? `Based on ${totalRatings} rating${totalRatings !== 1 ? 's' : ''}` : 'No ratings yet'}
                      </p>
                    </div>

                    {/* Bar chart breakdown */}
                    {totalRatings > 0 && (
                      <div className="flex-1 w-full space-y-2">
                        {[5,4,3,2,1].map((star) => {
                          const count = profile.ratings?.filter((r) => r.value === star).length || 0;
                          const pct = totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0;
                          return (
                            <div key={star} className="flex items-center gap-3">
                              <span className="text-xs text-white/60 w-4 text-right">{star}</span>
                              <svg viewBox="0 0 12 12" fill="#fbbf24" className="w-3 h-3 flex-shrink-0"><polygon points="6 1 7.55 4.13 11 4.64 8.5 7.08 9.09 10.53 6 8.89 2.91 10.53 3.5 7.08 1 4.64 4.45 4.13 6 1"/></svg>
                              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.08)' }}>
                                <div className="h-full rounded-full transition-all duration-500"
                                  style={{ width:`${pct}%`, background:'linear-gradient(90deg,#fbbf24,#f59e0b)' }} />
                              </div>
                              <span className="text-xs w-8 text-right" style={{ color:'rgba(148,163,184,0.55)' }}>{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Recent raters */}
                  {profile.ratings?.length > 0 && (
                    <div className="mt-6 pt-5" style={{ borderTop:'1px solid rgba(255,255,255,0.08)' }}>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color:'rgba(148,163,184,0.6)' }}>Recent Ratings</p>
                      <div className="space-y-2">
                        {profile.ratings.slice(-5).reverse().map((r, i) => (
                          <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-xl" style={GLASS_DARK}>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                              style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
                              {r.rater?.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <div className="flex-1">
                              <span className="text-sm text-white font-medium">{r.rater?.name || 'Anonymous'}</span>
                            </div>
                            <StarDisplay rating={r.value} size="sm" />
                            <span className="text-sm font-bold" style={{ color:'#fbbf24' }}>{r.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Rate a user section */}
                <div className="rounded-3xl p-6" style={GLASS}>
                  <h3 className="text-white font-bold text-lg mb-1">Rate Someone</h3>
                  <p className="text-sm mb-5" style={{ color:'rgba(148,163,184,0.6)' }}>Give feedback to users you've learned from or collaborated with</p>

                  <form onSubmit={handleRateSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color:'rgba(148,163,184,0.7)' }}>User ID or paste profile link</label>
                      <input
                        value={ratingUserId}
                        onChange={(e) => setRatingUserId(e.target.value)}
                        placeholder="Paste user ID here..."
                        style={{
                          width:'100%', padding:'11px 16px',
                          background:'rgba(255,255,255,0.06)',
                          border:'1px solid rgba(255,255,255,0.12)',
                          borderRadius:'12px', color:'#f1f5f9', fontSize:'14px', outline:'none',
                        }}
                        onFocus={(e) => { e.target.style.borderColor='rgba(99,102,241,0.6)'; e.target.style.boxShadow='0 0 0 3px rgba(99,102,241,0.15)'; }}
                        onBlur={(e) => { e.target.style.borderColor='rgba(255,255,255,0.12)'; e.target.style.boxShadow='none'; }}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-2" style={{ color:'rgba(148,163,184,0.7)' }}>Your Rating</label>
                      <StarPicker value={ratingValue} onChange={setRatingValue} />
                      {ratingValue > 0 && (
                        <p className="text-xs mt-1.5" style={{ color:'#fbbf24' }}>
                          {['','Poor','Fair','Good','Very Good','Excellent'][ratingValue]} — {ratingValue}/5 stars
                        </p>
                      )}
                    </div>

                    {ratingSuccess && (
                      <div className="px-4 py-3 rounded-xl text-sm font-medium"
                        style={{ background: ratingSuccess.startsWith('Error') ? 'rgba(220,38,38,0.15)' : 'rgba(34,197,94,0.15)',
                          border: `1px solid ${ratingSuccess.startsWith('Error') ? 'rgba(220,38,38,0.3)' : 'rgba(34,197,94,0.3)'}`,
                          color: ratingSuccess.startsWith('Error') ? '#f87171' : '#86efac' }}>
                        {ratingSuccess}
                      </div>
                    )}

                    <button type="submit" disabled={ratingSubmitting || !ratingValue || !ratingUserId.trim()}
                      className="w-full py-3 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100"
                      style={{ background:'linear-gradient(135deg,#f59e0b,#d97706)', boxShadow: ratingValue && ratingUserId ? '0 6px 18px rgba(245,158,11,0.35)' : 'none' }}>
                      {ratingSubmitting ? (
                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting</>
                      ) : (
                        <><svg viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth={1.5} className="w-4 h-4"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> Submit Rating</>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Settings;
