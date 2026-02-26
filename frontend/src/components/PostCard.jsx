import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { postAPI } from '../services/api';

/* â”€â”€â”€ Design tokens â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const GLASS = {
  background: 'rgba(255,255,255,0.05)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.10)',
};

/* â”€â”€â”€ Icons â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const IconHeart = ({ filled }) => (
  <svg className="w-4 h-4" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);
const IconComment = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M7 8h10M7 12h6m-6 4h4M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-3.9-.793L3 21l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);
const IconTrash = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <polyline points="3 6 5 6 21 6" strokeLinecap="round" strokeLinejoin="round" />
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" />
  </svg>
);
const IconSend = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <line x1="22" y1="2" x2="11" y2="13" strokeLinecap="round" strokeLinejoin="round" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)  return `${d}d ago`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/* â”€â”€â”€ PostCard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const PostCard = ({ post, onDelete, onUpdate }) => {
  const { user } = useAuth();
  const [liked,        setLiked]        = useState(post.likes?.includes(user?._id));
  const [likeCount,    setLikeCount]    = useState(post.likes?.length || 0);
  const [commentText,  setCommentText]  = useState('');
  const [comments,     setComments]     = useState(post.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [submitting,   setSubmitting]   = useState(false);
  const [likeAnim,     setLikeAnim]     = useState(false);

  const handleLike = async () => {
    // Optimistic update — show result immediately
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => wasLiked ? c - 1 : c + 1);
    if (!wasLiked) { setLikeAnim(true); setTimeout(() => setLikeAnim(false), 300); }
    try {
      await postAPI.likePost(post._id);
    } catch {
      // Revert on failure
      setLiked(wasLiked);
      setLikeCount((c) => wasLiked ? c + 1 : c - 1);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await postAPI.commentPost(post._id, commentText);
      setComments(data.data.comments);
      setCommentText('');
      if (onUpdate) onUpdate(data.data);
    } catch {}
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await postAPI.deletePost(post._id);
      if (onDelete) onDelete(post._id);
    } catch {}
  };

  const isOwner = user?._id === post.userId?._id;

  return (
    <article className="rounded-2xl overflow-hidden transition-all duration-200 hover:scale-[1.002]"
      style={{ ...GLASS }}>

      {/* Thin top accent line */}
      <div className="h-px w-full"
        style={{ background: 'linear-gradient(90deg,transparent,rgba(99,102,241,0.4),transparent)' }} />

      {/* â”€â”€ Header â”€â”€ */}
      <div className="flex items-start justify-between px-5 pt-4 pb-3">
        <Link to={`/profile/${post.userId?._id}`}
          className="flex items-center gap-3 hover:opacity-90 transition-opacity group">
          {post.userId?.profilePicture ? (
            <img src={post.userId.profilePicture} alt={post.userId.name}
              className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
              style={{ border: '1px solid rgba(99,102,241,0.3)' }} />
          ) : (
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#2563eb,#4f46e5,#7c3aed)' }}>
              {post.userId?.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-semibold text-white text-sm leading-tight group-hover:text-indigo-300 transition-colors">
              {post.userId?.name}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(148,163,184,0.55)' }}>{timeAgo(post.createdAt)}</p>
          </div>
        </Link>

        {isOwner && (
          <button onClick={handleDelete}
            className="p-1.5 rounded-lg transition-all duration-150 hover:scale-110"
            style={{ color: 'rgba(148,163,184,0.4)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(220,38,38,0.12)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(148,163,184,0.4)'; e.currentTarget.style.background = 'transparent'; }}>
            <IconTrash />
          </button>
        )}
      </div>

      {/* â”€â”€ Content â”€â”€ */}
      {post.content && (
        <div className="px-5 pb-3">
          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'rgba(226,232,240,0.85)' }}>
            {post.content}
          </p>
        </div>
      )}

      {/* â”€â”€ Media â”€â”€ */}
      {post.image && (
        <div className="overflow-hidden" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <img src={post.image} alt="Post media" className="w-full max-h-96 object-cover" />
        </div>
      )}
      {post.video && (
        <div className="overflow-hidden" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <video src={post.video} controls className="w-full max-h-96 no-mirror" />
        </div>
      )}

      {/* â”€â”€ Action bar â”€â”€ */}
      <div className="flex items-center gap-1 px-4 py-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <button onClick={handleLike}
          className={`flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-xl transition-all duration-150 ${likeAnim ? 'scale-125' : 'scale-100'}`}
          style={liked
            ? { color: '#f87171', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)' }
            : { color: 'rgba(148,163,184,0.6)', background: 'transparent', border: '1px solid transparent' }}
          onMouseEnter={(e) => { if (!liked) { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}}
          onMouseLeave={(e) => { if (!liked) { e.currentTarget.style.color = 'rgba(148,163,184,0.6)'; e.currentTarget.style.background = 'transparent'; }}}>
          <IconHeart filled={liked} />
          {likeCount > 0 && <span>{likeCount}</span>}
          <span className="hidden sm:inline">{liked ? 'Liked' : 'Like'}</span>
        </button>

        <button onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-xl transition-all duration-150"
          style={showComments
            ? { color: '#818cf8', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }
            : { color: 'rgba(148,163,184,0.6)', background: 'transparent', border: '1px solid transparent' }}
          onMouseEnter={(e) => { if (!showComments) { e.currentTarget.style.color = '#818cf8'; e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; }}}
          onMouseLeave={(e) => { if (!showComments) { e.currentTarget.style.color = 'rgba(148,163,184,0.6)'; e.currentTarget.style.background = 'transparent'; }}}>
          <IconComment />
          {comments.length > 0 && <span>{comments.length}</span>}
          <span className="hidden sm:inline">Comment</span>
        </button>
      </div>

      {/* â”€â”€ Comments panel â”€â”€ */}
      {showComments && (
        <div className="px-5 pb-4 space-y-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.15)' }}>

          {/* Existing comments */}
          {comments.length > 0 && (
            <div className="space-y-2.5 pt-3">
              {comments.map((c, i) => (
                <div key={i} className="flex gap-2.5">
                  {c.userId?.profilePicture ? (
                    <img src={c.userId.profilePicture} alt={c.userId.name}
                      className="w-7 h-7 rounded-lg object-cover flex-shrink-0 mt-0.5"
                      style={{ border: '1px solid rgba(255,255,255,0.12)' }} />
                  ) : (
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold text-white flex-shrink-0 mt-0.5"
                      style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
                      {c.userId?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 px-3 py-2 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p className="text-xs font-bold text-white leading-tight mb-0.5">{c.userId?.name}</p>
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(226,232,240,0.8)' }}>{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Comment input */}
          <form onSubmit={handleComment}
            className={`flex items-center gap-2 ${comments.length > 0 ? '' : 'pt-3'}`}>
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt={user.name}
                className="w-7 h-7 rounded-lg object-cover flex-shrink-0"
                style={{ border: '1px solid rgba(99,102,241,0.3)' }} />
            ) : (
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}
              onFocusCapture={(e) => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.10)'; }}
              onBlurCapture={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'; e.currentTarget.style.boxShadow = 'none'; }}>
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment…"
                className="flex-1 text-sm bg-transparent outline-none text-white"
                style={{ '--tw-placeholder-color': 'rgba(148,163,184,0.4)' }}
              />
              <button type="submit" disabled={submitting || !commentText.trim()}
                className="flex-shrink-0 p-1 rounded-lg transition-all disabled:opacity-30 hover:scale-110"
                style={{ color: '#818cf8' }}>
                <IconSend />
              </button>
            </div>
          </form>
        </div>
      )}
    </article>
  );
};

export default PostCard;
