import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { postAPI } from '../services/api';

/* ── Icons ── */
const I = {
  heartF: <svg className="w-4 h-4" fill="currentColor" stroke="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>,
  heartE: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>,
  comment:<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h6m-6 4h4M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-3.9-.793L3 21l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>,
  trash:  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/><polyline points="3 6 5 6 21 6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  send:   <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13" strokeLinecap="round" strokeLinejoin="round"/><polygon points="22 2 15 22 11 13 2 9 22 2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};

const timeAgo = (date) => {
  const m = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)  return `${d}d ago`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const PostCard = ({ post, onDelete, onUpdate }) => {
  const { user } = useAuth();
  const [liked,        setLiked]        = useState(post.likes?.includes(user?._id));
  const [likeCount,    setLikeCount]    = useState(post.likes?.length || 0);
  const [commentText,  setCommentText]  = useState('');
  const [comments,     setComments]     = useState(post.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [submitting,   setSubmitting]   = useState(false);
  const [anim,         setAnim]         = useState(false);

  const handleLike = async () => {
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount(c => wasLiked ? c - 1 : c + 1);
    if (!wasLiked) { setAnim(true); setTimeout(() => setAnim(false), 300); }
    try { await postAPI.likePost(post._id); }
    catch { setLiked(wasLiked); setLikeCount(c => wasLiked ? c + 1 : c - 1); }
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

  const del = async () => {
    if (!window.confirm('Delete post?')) return;
    try { await postAPI.deletePost(post._id); if (onDelete) onDelete(post._id); } catch {}
  };

  const isOwner = user?._id === post.userId?._id;

  return (
    <article className="card card-hover" style={{ overflow: 'hidden' }}>
      <div className="divider-brand w-full" />
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '16px 20px 12px' }}>
        <Link to={`/profile/${post.userId?._id}`} style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          {post.userId?.profilePicture ? (
            <img src={post.userId.profilePicture} className="avatar-md" style={{ border: '1px solid var(--border)' }} alt={post.userId.name} />
          ) : (
            <div className="avatar-md" style={{ background: 'var(--brand)', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {post.userId?.name?.[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14 }}>{post.userId?.name}</p>
            <p className="caption">{timeAgo(post.createdAt)}</p>
          </div>
        </Link>
        {isOwner && (
          <button onClick={del} className="btn-ghost" style={{ padding: 6, color: 'var(--text-muted)' }} onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}>
            {I.trash}
          </button>
        )}
      </div>

      {/* Content */}
      {post.content && (
        <div style={{ padding: '0 20px 12px' }}>
          <p className="body-sm">{post.content}</p>
        </div>
      )}

      {/* Media */}
      {post.image && <img src={post.image} style={{ width: '100%', maxHeight: 400, objectFit: 'cover', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }} />}
      {post.video && <video src={post.video} controls style={{ width: '100%', maxHeight: 400, borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }} />}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, padding: '12px 16px', borderTop: '1px solid var(--border-2)' }}>
        <button onClick={handleLike} className="btn-ghost btn-sm" style={{ color: liked ? '#ef4444' : 'var(--text-secondary)', background: liked ? 'rgba(239,68,68,0.1)' : 'transparent', transform: anim ? 'scale(1.15)' : 'scale(1)', transition: 'transform 0.2s cubic-bezier(0.16,1,0.3,1)' }}>
          <span className="flex">{liked ? I.heartF : I.heartE}</span>
          {likeCount > 0 && <span>{likeCount}</span>} <span className="hidden sm:inline">Like</span>
        </button>
        <button onClick={() => setShowComments(!showComments)} className="btn-ghost btn-sm" style={{ color: showComments ? 'var(--brand-light)' : 'var(--text-secondary)', background: showComments ? 'rgba(99,102,241,0.1)' : 'transparent' }}>
          <span className="flex">{I.comment}</span>
          {comments.length > 0 && <span>{comments.length}</span>} <span className="hidden sm:inline">Comment</span>
        </button>
      </div>

      {/* Comments Area */}
      {showComments && (
        <div style={{ padding: '16px 20px', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid var(--border)' }}>
          {comments.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
              {comments.map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: 10 }}>
                  {c.userId?.profilePicture ? (
                    <img src={c.userId.profilePicture} className="avatar-xs" />
                  ) : (
                    <div className="avatar-xs" style={{ background: 'var(--brand)', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {c.userId?.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <div style={{ background: 'var(--surface)', padding: '8px 12px', borderRadius: 12, flex: 1, border: '1px solid var(--border)' }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{c.userId?.name}</p>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <form onSubmit={handleComment} style={{ display: 'flex', gap: 10 }}>
            <img src={user?.profilePicture} className="avatar-xs" style={{ display: user?.profilePicture ? 'block' : 'none' }} />
            {!user?.profilePicture && <div className="avatar-xs" style={{ background: 'var(--brand)', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{user?.name?.[0]}</div>}
            
            <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
              <input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Write a comment..." className="input" style={{ paddingRight: 40, height: '100%' }} />
              <button type="submit" disabled={submitting || !commentText.trim()} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--brand-light)', cursor: 'pointer', opacity: (!commentText.trim() || submitting) ? 0.4 : 1 }}>
                {I.send}
              </button>
            </div>
          </form>
        </div>
      )}
    </article>
  );
};

export default PostCard;
