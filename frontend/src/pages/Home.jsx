import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import PostCard from '../components/PostCard';
import { postAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

/* Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Design tokens Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */
const BG = 'linear-gradient(135deg,#060b18 0%,#0d1526 40%,#0f0c29 100%)';
const GLASS = {
  background: 'rgba(255,255,255,0.05)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.10)',
};

/* Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Icons Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */
const IconCamera = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <circle cx="12" cy="13" r="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconSend = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <line x1="22" y1="2" x2="11" y2="13" strokeLinecap="round" strokeLinejoin="round" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconX = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
    <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
    <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
  </svg>
);
const IconSpark = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);
const IconSwap = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
  </svg>
);
const IconVideo = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M4 8h8a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4a2 2 0 012-2z" />
  </svg>
);
const IconChevronUp = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
  </svg>
);
const IconRefresh = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

/* Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Hero Section Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */
const HeroSection = ({ user, onOpenPost }) => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0] || 'there';

  const stats = [
    { label: 'Skills Offered', value: user?.skillsOffered?.length || 0 },
    { label: 'Skills Wanted',  value: user?.skillsWanted?.length  || 0 },
    { label: 'Followers',      value: user?.followers?.length     || 0 },
    { label: 'Following',      value: user?.following?.length     || 0 },
  ];

  return (
    <div className="relative rounded-3xl overflow-hidden mb-6" style={{ ...GLASS }}>
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg,transparent,rgba(99,102,241,0.6),rgba(124,58,237,0.5),transparent)' }} />
      <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle,rgba(79,70,229,0.18) 0%,transparent 70%)', filter: 'blur(50px)' }} />
      <div className="absolute -bottom-12 -left-12 w-56 h-56 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle,rgba(37,99,235,0.12) 0%,transparent 70%)', filter: 'blur(40px)' }} />

      <div className="relative px-6 py-7">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="relative flex-shrink-0">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt={user.name}
                className="w-20 h-20 rounded-2xl object-cover"
                style={{ border: '2px solid rgba(99,102,241,0.4)', boxShadow: '0 0 24px rgba(99,102,241,0.25)' }} />
            ) : (
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold"
                style={{ background: 'linear-gradient(135deg,#2563eb,#4f46e5,#7c3aed)', boxShadow: '0 0 24px rgba(99,102,241,0.3)' }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-400"
              style={{ border: '2px solid rgba(6,11,24,0.9)', boxShadow: '0 0 8px rgba(52,211,153,0.6)' }} />
          </div>

          <div className="flex-1">
            <p className="text-sm font-medium mb-0.5" style={{ color: 'rgba(148,163,184,0.7)' }}>{greeting},</p>
            <h1 className="text-white text-2xl sm:text-3xl font-bold tracking-tight leading-none mb-1">
              {firstName} 👋
            </h1>
            <p className="text-sm" style={{ color: 'rgba(148,163,184,0.6)' }}>
              {user?.college || 'Campus Student'}{user?.branch ? ` · ${user.branch}` : ''}{user?.year ? ` · Year ${user.year}` : ''}
            </p>
          </div>

          <button
            onClick={onOpenPost}
            className="flex-shrink-0 flex items-center gap-2 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
            style={{ background: 'linear-gradient(135deg,#2563eb,#4f46e5,#7c3aed)', boxShadow: '0 6px 20px rgba(99,102,241,0.4)' }}>
            <IconSend />
            Share Update
          </button>
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center gap-2.5 px-4 py-2 rounded-xl flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)' }}>
              <span className="text-white font-bold text-lg leading-none">{s.value}</span>
              <span className="text-xs font-medium" style={{ color: 'rgba(148,163,184,0.65)' }}>{s.label}</span>
            </div>
          ))}
        </div>

        {user?.skillsOffered?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {user.skillsOffered.slice(0, 6).map((skill) => (
              <span key={skill} className="text-xs font-medium text-white px-3 py-1 rounded-full"
                style={{ background: 'rgba(99,102,241,0.25)', border: '1px solid rgba(99,102,241,0.35)' }}>
                {skill}
              </span>
            ))}
            {user.skillsOffered.length > 6 && (
              <span className="text-xs font-medium px-3 py-1" style={{ color: 'rgba(148,163,184,0.5)' }}>
                +{user.skillsOffered.length - 6} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/* Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Quick Actions Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */
const QuickActions = () => (
  <div className="grid grid-cols-3 gap-3 mb-5">
    {[
      { to: '/exchange',  icon: <IconSwap />,  label: 'Find a Match',  grad: 'linear-gradient(135deg,#2563eb,#4f46e5)', glow: 'rgba(37,99,235,0.30)'  },
      { to: '/video',     icon: <IconVideo />, label: 'Live Sessions', grad: 'linear-gradient(135deg,#7c3aed,#db2777)', glow: 'rgba(124,58,237,0.30)' },
      { to: '/dashboard', icon: <IconSpark />, label: 'My Dashboard',  grad: 'linear-gradient(135deg,#059669,#0284c7)', glow: 'rgba(5,150,105,0.25)'  },
    ].map(({ to, icon, label, grad, glow }) => (
      <Link key={to} to={to}
        className="flex flex-col items-center gap-3 p-4 rounded-2xl transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
        style={{ ...GLASS }}>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white"
          style={{ background: grad, boxShadow: `0 6px 16px ${glow}` }}>
          {icon}
        </div>
        <span className="text-xs font-semibold text-center leading-tight"
          style={{ color: 'rgba(226,232,240,0.8)' }}>{label}</span>
      </Link>
    ))}
  </div>
);

/* Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Create Post Box Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */
const CreatePostBox = ({ onPost, isOpen, setIsOpen }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMedia(file);
    setMediaPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !media) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('content', content);
      if (media) fd.append('media', media);
      const { data } = await postAPI.createPost(fd);
      onPost(data.data);
      setContent('');
      setMedia(null);
      setMediaPreview('');
      setIsOpen(false);
    } catch {}
    setLoading(false);
  };

  return (
    <div className="rounded-2xl mb-5 overflow-hidden" style={{ ...GLASS }}>
      <div className="h-px w-full"
        style={{ background: 'linear-gradient(90deg,transparent,rgba(99,102,241,0.5),transparent)' }} />

      {!isOpen ? (
        <button onClick={() => setIsOpen(true)}
          className="w-full flex items-center gap-3 px-5 py-4 transition-colors hover:bg-white/[0.03] group">
          {user?.profilePicture ? (
            <img src={user.profilePicture} alt={user.name}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              style={{ border: '2px solid rgba(99,102,241,0.3)' }} />
          ) : (
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="flex-1 text-left text-sm rounded-xl px-4 py-2.5"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(148,163,184,0.5)' }}>
            What skill are you working on, {user?.name?.split(' ')[0]}?
          </span>
          <span className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8' }}>
            <IconCamera />
          </span>
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="p-5">
          <div className="flex gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                  style={{ border: '2px solid rgba(99,102,241,0.3)' }} />
              ) : (
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                  style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`What are you learning or teaching, ${user?.name?.split(' ')[0]}?`}
                rows={4}
                autoFocus
                className="w-full resize-none px-4 py-3 rounded-xl text-sm text-white outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  '--tw-placeholder-color': 'rgba(148,163,184,0.35)',
                }}
                onFocus={(e) => { e.target.style.borderColor = 'rgba(99,102,241,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; }}
                onBlur={(e)  => { e.target.style.borderColor = 'rgba(255,255,255,0.10)'; e.target.style.boxShadow = 'none'; }}
              />

              {mediaPreview && (
                <div className="mt-2 relative rounded-xl overflow-hidden"
                  style={{ border: '1px solid rgba(255,255,255,0.10)' }}>
                  {media?.type?.startsWith('image') ? (
                    <img src={mediaPreview} alt="preview" className="w-full max-h-56 object-cover" />
                  ) : (
                    <video src={mediaPreview} controls className="w-full max-h-56 no-mirror" />
                  )}
                  <button type="button" onClick={() => { setMedia(null); setMediaPreview(''); }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-white transition-colors hover:scale-110"
                    style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}>
                    <IconX />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between mt-4 pt-3"
                style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl transition-all hover:scale-[1.02]"
                  style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)', color: '#a5b4fc' }}>
                  <IconCamera />
                  Photo / Video
                </button>
                <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleFile} className="hidden" />

                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setIsOpen(false)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.6)' }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={loading || (!content.trim() && !media)}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl text-white text-sm font-bold transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50 disabled:scale-100"
                    style={{ background: 'linear-gradient(135deg,#2563eb,#4f46e5,#7c3aed)', boxShadow: '0 4px 14px rgba(99,102,241,0.4)' }}>
                    {loading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        PostingÃ¢â‚¬Â¦
                      </>
                    ) : (
                      <><IconSend /> Post</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

/* Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Skeleton loader Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */
const PostSkeleton = () => (
  <div className="rounded-2xl p-5 animate-pulse" style={{ ...GLASS }}>
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-xl flex-shrink-0" style={{ background: 'rgba(255,255,255,0.08)' }} />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 rounded-lg w-1/3" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <div className="h-3 rounded-lg w-1/4"   style={{ background: 'rgba(255,255,255,0.05)' }} />
      </div>
    </div>
    <div className="space-y-2 mb-4">
      <div className="h-3.5 rounded-lg w-full" style={{ background: 'rgba(255,255,255,0.07)' }} />
      <div className="h-3.5 rounded-lg w-5/6"  style={{ background: 'rgba(255,255,255,0.07)' }} />
      <div className="h-3.5 rounded-lg w-2/3"  style={{ background: 'rgba(255,255,255,0.05)' }} />
    </div>
    <div className="flex gap-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="h-7 w-16 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }} />
      <div className="h-7 w-16 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }} />
    </div>
  </div>
);

/* Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Empty state Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */
const EmptyFeed = ({ onOpenPost }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center rounded-3xl" style={{ ...GLASS }}>
    <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
      style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}>
      <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"
        style={{ color: '#818cf8' }}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    </div>
    <h3 className="font-bold text-white text-lg mb-2">Your feed is empty</h3>
    <p className="text-sm mb-6 max-w-xs" style={{ color: 'rgba(148,163,184,0.6)' }}>
      Follow students and share what you're learning. Your journey starts here!
    </p>
    <button onClick={onOpenPost}
      className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:scale-[1.03] active:scale-[0.97]"
      style={{ background: 'linear-gradient(135deg,#2563eb,#4f46e5,#7c3aed)', boxShadow: '0 6px 18px rgba(99,102,241,0.4)' }}>
      <IconSend />
      Create Your First Post
    </button>
  </div>
);

/* Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Main Page Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */
const REASON_LABELS = {
  'skill-match': { label: 'Skill Match', color: '#a5b4fc', bg: 'rgba(99,102,241,0.18)' },
  'trending':    { label: 'Trending',    color: '#fbbf24', bg: 'rgba(245,158,11,0.18)' },
  'following':   { label: 'Following',  color: '#34d399', bg: 'rgba(16,185,129,0.18)' },
  'recent':      { label: 'New',        color: '#67e8f9', bg: 'rgba(6,182,212,0.18)'  },
  'explore':     { label: 'Explore',    color: '#c4b5fd', bg: 'rgba(124,58,237,0.15)' },
};

const Home = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [feedMode, setFeedMode] = useState('for-you');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [postBoxOpen, setPostBoxOpen] = useState(false);
  const [newPostsBanner, setNewPostsBanner] = useState([]);

  const fetchFeed = useCallback(async (p = 1, mode) => {
    const m = mode !== undefined ? mode : feedMode;
    try {
      const { data } = m === 'for-you' ? await postAPI.getAIFeed(p) : await postAPI.getFeed(p);
      if (p === 1) setPosts(data.data);
      else setPosts((prev) => [...prev, ...data.data]);
      setHasMore(data.pagination.page < data.pagination.pages);
    } catch {}
    setLoading(false);
    setLoadingMore(false);
  }, [feedMode]);

  useEffect(() => {
    setLoading(true);
    setPosts([]);
    setPage(1);
    setHasMore(true);
    fetchFeed(1, feedMode);
  }, [feedMode]); // eslint-disable-line

  useEffect(() => {
    if (!socket) return;
    const handleNewPost = ({ post }) => {
      if (post.userId?._id === user._id || post.userId === user._id) return;
      setNewPostsBanner((prev) => [post, ...prev]);
    };
    socket.on('newPost', handleNewPost);
    return () => socket.off('newPost', handleNewPost);
  }, [socket, user._id]);

  const showNewPosts = () => {
    setPosts((prev) => [...newPostsBanner, ...prev]);
    setNewPostsBanner([]);
  };

  const handleNewPost  = (post)        => { setPosts((prev) => [post, ...prev]); setPostBoxOpen(false); };
  const handleDelete   = (postId)      => setPosts((prev) => prev.filter((p) => p._id !== postId));
  const handleUpdate   = (updatedPost) => setPosts((prev) => prev.map((p) => (p._id === updatedPost._id ? updatedPost : p)));

  const loadMore = () => {
    if (loadingMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    setLoadingMore(true);
    fetchFeed(nextPage);
  };

  return (
    <div className="min-h-screen" style={{ background: BG }}>
      <div className="fixed top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle,rgba(79,70,229,0.09) 0%,transparent 70%)', filter: 'blur(80px)' }} />
      <div className="fixed bottom-0 left-0 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle,rgba(37,99,235,0.07) 0%,transparent 70%)', filter: 'blur(60px)' }} />

      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 relative z-10">
        <div className="flex gap-6 items-start">
          <Sidebar />

          <main className="flex-1 min-w-0">
            <HeroSection user={user} onOpenPost={() => setPostBoxOpen(true)} />
            <QuickActions />
            <CreatePostBox onPost={handleNewPost} isOpen={postBoxOpen} setIsOpen={setPostBoxOpen} />

            {/* Feed mode tabs */}
            <div className="flex items-center gap-1 mb-4 p-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {[
                { key: 'for-you',   icon: '', label: 'For You',   aiLabel: true },
                { key: 'following', icon: '', label: 'Following', aiLabel: false },
              ].map(({ key, icon, label, aiLabel }) => {
                const active = feedMode === key;
                return (
                  <button key={key} onClick={() => setFeedMode(key)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                    style={active
                      ? { background: 'rgba(99,102,241,0.22)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.30)', boxShadow: '0 0 16px rgba(99,102,241,0.20)' }
                      : { color: 'rgba(148,163,184,0.55)', border: '1px solid transparent' }}>
                    {icon && <span>{icon}</span>}
                    <span>{label}</span>
                    {active && aiLabel && (
                      <span className="hidden sm:inline text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(99,102,241,0.3)', color: '#c4b5fd' }}>AI</span>
                    )}
                  </button>
                );
              })}
            </div>

            {newPostsBanner.length > 0 && (
              <button
                onClick={showNewPosts}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 mb-4 rounded-2xl text-sm font-bold text-white transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', boxShadow: '0 6px 24px rgba(99,102,241,0.45)', border: '1px solid rgba(124,58,237,0.4)' }}>
                <IconChevronUp />
                {newPostsBanner.length} new post{newPostsBanner.length !== 1 ? 's' : ''} — tap to load
              </button>
            )}

            {loading ? (
              <div className="space-y-4">
                <PostSkeleton /><PostSkeleton /><PostSkeleton />
              </div>
            ) : posts.length === 0 ? (
              <EmptyFeed onOpenPost={() => setPostBoxOpen(true)} />
            ) : (
              <div className="space-y-4">
                {posts.map((post) => {
                  const reason = post._aiReason;
                  const badge  = feedMode === 'for-you' && reason && reason !== 'own' ? REASON_LABELS[reason] : null;
                  return (
                    <div key={post._id}>
                      {badge && (
                        <div className="flex items-center gap-1.5 mb-1.5 ml-1">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: badge.bg, color: badge.color }}>
                            {badge.label}
                          </span>
                        </div>
                      )}
                      <PostCard post={post} onDelete={handleDelete} onUpdate={handleUpdate} />
                    </div>
                  );
                })}
                {hasMore && (
                  <button onClick={loadMore} disabled={loadingMore}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
                    style={{ ...GLASS }}>
                    {loadingMore
                      ? <><div className="w-4 h-4 border-2 border-white/20 border-t-white/70 rounded-full animate-spin" /><span style={{ color: 'rgba(148,163,184,0.7)' }}>Loading…</span></>
                      : <><IconRefresh /><span style={{ color: 'rgba(148,163,184,0.7)' }}>Load more posts</span></>
                    }
                  </button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Home;
