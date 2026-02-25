import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const CameraIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);
const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const SaveIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
  </svg>
);
const UserIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const BrainIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.16"/>
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.16"/>
  </svg>
);
const ArrowLeftIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);

const glass = { background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 16 };
const inputStyle = { width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '10px 14px', color: '#e2e8f0', fontSize: 14, outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' };
const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(148,163,184,0.85)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' };

const EditProfile = () => {
  const { user, updateUserInContext } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef();

  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    college: user?.college || '',
    branch: user?.branch || '',
    year: user?.year || '',
    skillsOffered: user?.skillsOffered || [],
    skillsWanted: user?.skillsWanted || [],
  });

  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(user?.profilePicture || '');
  const [skillInput, setSkillInput] = useState({ offered: '', wanted: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const applyFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setProfilePic(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handlePicChange = (e) => applyFile(e.target.files[0]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    applyFile(e.dataTransfer.files[0]);
  }, []);

  const addSkill = (type) => {
    const val = skillInput[type].trim();
    if (!val) return;
    const key = type === 'offered' ? 'skillsOffered' : 'skillsWanted';
    if (!form[key].includes(val)) setForm({ ...form, [key]: [...form[key], val] });
    setSkillInput({ ...skillInput, [type]: '' });
  };

  const removeSkill = (type, skill) => {
    const key = type === 'offered' ? 'skillsOffered' : 'skillsWanted';
    setForm({ ...form, [key]: form[key].filter((s) => s !== skill) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        fd.append(key, Array.isArray(val) ? JSON.stringify(val) : val);
      });
      if (profilePic) fd.append('profilePicture', profilePic);
      const { data } = await userAPI.updateProfile(fd);
      updateUserInContext(data.data);
      setSuccess('Profile updated successfully!');
      setTimeout(() => navigate(`/profile/${user._id}`), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
    setLoading(false);
  };

  const inputFocus = (e) => { e.target.style.borderColor = 'rgba(99,102,241,0.6)'; };
  const inputBlur = (e) => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#060b18 0%,#0d1526 40%,#0f0c29 100%)', color: '#e2e8f0', fontFamily: 'Inter,system-ui,sans-serif', position: 'relative', overflow: 'hidden' }}>
      {/* Orbs */}
      <div style={{ position: 'fixed', top: '-20%', left: '-15%', width: 550, height: 550, borderRadius: '50%', background: 'radial-gradient(circle,rgba(37,99,235,0.12) 0%,transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-20%', right: '-10%', width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.10) 0%,transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <Navbar />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 680, margin: '0 auto', padding: '24px 16px 60px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#e2e8f0'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#94a3b8'; }}
          ><ArrowLeftIcon /></button>
          <h1 style={{ fontSize: 22, fontWeight: 700, background: 'linear-gradient(90deg,#93c5fd,#c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>Edit Profile</h1>
        </div>

        <form onSubmit={handleSubmit}>

          {/* ── Profile Picture ─────────────────────────────────────────── */}
          <div style={{ ...glass, padding: 24, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <span style={{ color: '#93c5fd' }}><CameraIcon /></span>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Profile Picture</h2>
            </div>
            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '18px 20px', borderRadius: 12, border: `2px dashed ${dragging ? 'rgba(99,102,241,0.7)' : 'rgba(255,255,255,0.12)'}`, background: dragging ? 'rgba(99,102,241,0.08)' : 'rgba(0,0,0,0.2)', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              <div style={{ position: 'relative', flexShrink: 0 }}>
                {preview ? (
                  <img src={preview} alt="Profile" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(99,102,241,0.5)' }} />
                ) : (
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700, color: '#fff', border: '3px solid rgba(99,102,241,0.4)' }}>
                    {user?.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', border: '2px solid rgba(15,12,41,0.8)' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                </div>
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', margin: '0 0 4px' }}>Click or drag & drop a photo</p>
                <p style={{ fontSize: 12, color: 'rgba(148,163,184,0.65)', margin: 0 }}>JPG, PNG, GIF · Max 10 MB</p>
                {profilePic && <p style={{ fontSize: 11, color: '#34d399', margin: '6px 0 0' }}>✓ {profilePic.name} selected</p>}
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handlePicChange} style={{ display: 'none' }} />
          </div>

          {/* ── Basic Info ──────────────────────────────────────────────── */}
          <div style={{ ...glass, padding: 24, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <span style={{ color: '#93c5fd' }}><UserIcon /></span>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Basic Information</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} onFocus={inputFocus} onBlur={inputBlur} style={inputStyle} placeholder="Your name" />
              </div>
              <div>
                <label style={labelStyle}>Bio <span style={{ color: 'rgba(148,163,184,0.45)', textTransform: 'none', fontWeight: 400, letterSpacing: 0 }}>{form.bio.length}/500</span></label>
                <textarea name="bio" value={form.bio} onChange={handleChange} onFocus={inputFocus} onBlur={inputBlur} rows={3} maxLength={500} placeholder="Tell others about yourself..." style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>College</label>
                  <input type="text" name="college" value={form.college} onChange={handleChange} onFocus={inputFocus} onBlur={inputBlur} style={inputStyle} placeholder="e.g. MIT" />
                </div>
                <div>
                  <label style={labelStyle}>Branch</label>
                  <input type="text" name="branch" value={form.branch} onChange={handleChange} onFocus={inputFocus} onBlur={inputBlur} style={inputStyle} placeholder="e.g. Computer Science" />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Year</label>
                <select name="year" value={form.year} onChange={handleChange} onFocus={inputFocus} onBlur={inputBlur} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">Select year</option>
                  {['1st', '2nd', '3rd', '4th', 'Graduate'].map((y) => (
                    <option key={y} value={y} style={{ background: '#0d1526' }}>{y} Year</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ── Skills ──────────────────────────────────────────────────── */}
          <div style={{ ...glass, padding: 24, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <span style={{ color: '#93c5fd' }}><BrainIcon /></span>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Skills</h2>
            </div>

            {[
              { type: 'offered', label: 'Skills I Can Teach', accent: '#93c5fd', bg: 'rgba(37,99,235,0.18)', border: 'rgba(37,99,235,0.3)', items: form.skillsOffered },
              { type: 'wanted', label: 'Skills I Want to Learn', accent: '#c4b5fd', bg: 'rgba(124,58,237,0.18)', border: 'rgba(124,58,237,0.3)', items: form.skillsWanted },
            ].map(({ type, label, accent, bg, border, items }) => (
              <div key={type} style={{ marginBottom: type === 'offered' ? 20 : 0 }}>
                <label style={{ ...labelStyle, color: accent }}>{label}</label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  <input
                    type="text"
                    value={skillInput[type]}
                    onChange={(e) => setSkillInput({ ...skillInput, [type]: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill(type))}
                    placeholder={`Add a skill & press Enter`}
                    style={{ ...inputStyle, flex: 1 }}
                    onFocus={inputFocus} onBlur={inputBlur}
                  />
                  <button type="button" onClick={() => addSkill(type)}
                    style={{ width: 40, flexShrink: 0, borderRadius: 10, background: bg, border: `1px solid ${border}`, color: accent, fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = bg.replace('0.18', '0.3'); }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = bg; }}
                  >+</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {items.map((s) => (
                    <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 99, background: bg, border: `1px solid ${border}`, color: accent, fontSize: 12, fontWeight: 600 }}>
                      {s}
                      <button type="button" onClick={() => removeSkill(type, s)} style={{ display: 'flex', alignItems: 'center', color: accent, opacity: 0.6, background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'opacity 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                      ><XIcon /></button>
                    </span>
                  ))}
                  {items.length === 0 && <p style={{ fontSize: 12, color: 'rgba(148,163,184,0.4)', margin: 0 }}>None added yet</p>}
                </div>
              </div>
            ))}
          </div>

          {/* Feedback */}
          {success && (
            <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.35)', color: '#34d399', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              {success}
            </div>
          )}
          {error && (
            <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" onClick={() => navigate(-1)}
              style={{ flex: 1, padding: '13px 0', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = '#e2e8f0'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#94a3b8'; }}
            >Cancel</button>
            <button type="submit" disabled={loading}
              style={{ flex: 2, padding: '13px 0', borderRadius: 12, background: loading ? 'rgba(37,99,235,0.5)' : 'linear-gradient(135deg,#2563eb,#4f46e5,#7c3aed)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: loading ? 'none' : '0 4px 14px rgba(37,99,235,0.4)', transition: 'all 0.2s' }}
            >
              {loading ? (
                <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.5)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Saving...</>
              ) : (
                <><SaveIcon />Save Changes</>
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        input::placeholder, textarea::placeholder { color: rgba(148,163,184,0.4); }
        select option { background: #0d1526; color: #e2e8f0; }
      `}</style>
    </div>
  );
};

export default EditProfile;

