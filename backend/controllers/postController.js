const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');
const { isDBConnected } = require('../config/db');
const { getIO, getOnlineUsers } = require('../socket/socketServer');
const { uploadToCloudinary } = require('../config/cloudinary');

// @desc Create post
// @route POST /api/posts/create
const createPost = async (req, res) => {
  try {
    const { content } = req.body;
    let image = '';
    let video = '';

    if (req.file) {
      const resourceType = req.file.mimetype.startsWith('video') ? 'video' : 'image';
      const hasCloudinary =
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_KEY !== 'your_api_key' &&
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name';

      if (hasCloudinary) {
        try {
          const result = await uploadToCloudinary(req.file.buffer, 'zedify/posts', resourceType);
          if (resourceType === 'image') image = result.secure_url;
          else video = result.secure_url;
        } catch (uploadErr) {
          console.warn('Cloudinary upload failed, using base64 fallback:', uploadErr.message);
          const base64 = req.file.buffer.toString('base64');
          const dataUrl = `data:${req.file.mimetype};base64,${base64}`;
          if (resourceType === 'image') image = dataUrl;
          else video = dataUrl;
        }
      } else {
        // Fallback: convert buffer to base64 data URL for local storage
        const base64 = req.file.buffer.toString('base64');
        const dataUrl = `data:${req.file.mimetype};base64,${base64}`;
        if (resourceType === 'image') image = dataUrl;
        else video = dataUrl;
      }
    }

    if (!content && !image && !video) {
      return res.status(400).json({ success: false, message: 'Post must have content, image, or video' });
    }

    const post = await Post.create({
      userId: req.user._id,
      content: content || '',
      image,
      video,
    });

    const populatedPost = await Post.findById(post._id).populate('userId', 'name profilePicture');

    // Broadcast to all connected users in real time
    try {
      const io = getIO();
      if (io) io.emit('newPost', { post: populatedPost });
    } catch {}

    res.status(201).json({ success: true, message: 'Post created', data: populatedPost });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get feed posts (from followed users + own posts)
// @route GET /api/posts/feed
const getFeed = async (req, res) => {
  try {
    // In-memory mode: no posts exist yet, return empty feed
    if (!isDBConnected()) {
      return res.json({
        success: true,
        data: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 },
      });
    }
    const currentUser = await User.findById(req.user._id);
    const feedUsers = [...currentUser.following, req.user._id];

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ userId: { $in: feedUsers } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name profilePicture')
      .populate('comments.userId', 'name profilePicture');

    const total = await Post.countDocuments({ userId: { $in: feedUsers } });

    res.json({
      success: true,
      data: posts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Like / Unlike post
// @route POST /api/posts/like
const likePost = async (req, res) => {
  try {
    const { postId } = req.body;

    if (!isDBConnected()) {
      return res.json({ success: true, message: 'Like noted (offline mode)' });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const isLiked = post.likes.includes(req.user._id);

    if (isLiked) {
      await Post.findByIdAndUpdate(postId, { $pull: { likes: req.user._id } });
      res.json({ success: true, message: 'Post unliked' });
    } else {
      await Post.findByIdAndUpdate(postId, { $addToSet: { likes: req.user._id } });

      // Notify post owner if not same user
      if (post.userId.toString() !== req.user._id.toString()) {
        const notification = await Notification.create({
          userId: post.userId,
          fromUser: req.user._id,
          type: 'like',
          message: `${req.user.name} liked your post`,
          link: `/post/${postId}`,
        });

        try {
          const io = getIO();
          const onlineUsers = getOnlineUsers();
          const targetSocketId = onlineUsers.get(post.userId.toString());
          if (targetSocketId) {
            io.to(targetSocketId).emit('newNotification', notification);
          }
        } catch (_) {}
      }

      res.json({ success: true, message: 'Post liked' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Comment on post
// @route POST /api/posts/comment
const commentPost = async (req, res) => {
  try {
    const { postId, text } = req.body;

    const post = await Post.findByIdAndUpdate(
      postId,
      { $push: { comments: { userId: req.user._id, text } } },
      { new: true }
    ).populate('comments.userId', 'name profilePicture');

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Notify post owner
    if (post.userId.toString() !== req.user._id.toString()) {
      const notification = await Notification.create({
        userId: post.userId,
        fromUser: req.user._id,
        type: 'comment',
        message: `${req.user.name} commented on your post`,
        link: `/post/${postId}`,
      });

      try {
        const io = getIO();
        const onlineUsers = getOnlineUsers();
        const targetSocketId = onlineUsers.get(post.userId.toString());
        if (targetSocketId) {
          io.to(targetSocketId).emit('newNotification', notification);
        }
      } catch (_) {}
    }

    res.json({ success: true, message: 'Comment added', data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete post
// @route DELETE /api/posts/:id
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    await post.deleteOne();
    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get single post
// @route GET /api/posts/:id
const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('userId', 'name profilePicture')
      .populate('comments.userId', 'name profilePicture');
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    res.json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  AI-powered personalized feed — Instagram-style algorithm
// @route GET /api/posts/ai-feed
const getAIFeed = async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res.json({ success: true, data: [], pagination: { page: 1, limit: 15, total: 0, pages: 0 }, meta: { algorithm: 'offline' } });
    }

    const currentUser = await User.findById(req.user._id);
    const followingIds = (currentUser.following || []).map((id) => id.toString());
    const userSkillsWanted  = (currentUser.skillsWanted  || []).map((s) => s.toLowerCase());
    const userSkillsOffered = (currentUser.skillsOffered || []).map((s) => s.toLowerCase());

    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 15;
    const POOL  = Math.min(limit * 12, 300);

    // ── 1. Candidate pool ──────────────────────────────────────────────────
    // Following posts (70% of pool)
    const followingPool = followingIds.length > 0
      ? await Post.find({ userId: { $in: followingIds } })
          .sort({ createdAt: -1 })
          .limit(Math.ceil(POOL * 0.7))
          .populate('userId', 'name profilePicture skillsOffered skillsWanted')
          .populate('comments.userId', 'name profilePicture')
          .lean()
      : [];

    // Own posts
    const ownPosts = await Post.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name profilePicture skillsOffered skillsWanted')
      .populate('comments.userId', 'name profilePicture')
      .lean();

    // Exploration: high-engagement posts from strangers (30% of pool)
    const excludeIds = [...followingIds.map((id) => new mongoose.Types.ObjectId(id)), req.user._id];
    const explorationRaw = await Post.aggregate([
      { $match: { userId: { $nin: excludeIds } } },
      { $addFields: { _engScore: { $add: [{ $size: '$likes' }, { $multiply: [{ $size: '$comments' }, 2] }] } } },
      { $sort: { _engScore: -1, createdAt: -1 } },
      { $limit: Math.floor(POOL * 0.3) },
    ]);
    const explorationPosts = await Post.populate(explorationRaw, [
      { path: 'userId', select: 'name profilePicture skillsOffered skillsWanted' },
      { path: 'comments.userId', select: 'name profilePicture' },
    ]);

    // Deduplicate
    const seen = new Set();
    const candidates = [...ownPosts, ...followingPool, ...explorationPosts].filter((p) => {
      const id = p._id.toString();
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    // ── 2. Score each candidate ────────────────────────────────────────────
    const now      = Date.now();
    const HOUR_MS  = 3600 * 1000;
    const DECAY    = Math.LN2 / 24; // half-life 24 h

    const scored = candidates.map((post) => {
      const authorId   = (post.userId?._id || post.userId)?.toString();
      const isFollowing = followingIds.includes(authorId);
      const isOwn       = authorId === req.user._id.toString();

      // Engagement (0–1, capped at 50 interactions)
      const eng    = (post.likes?.length || 0) + (post.comments?.length || 0) * 2;
      const engS   = Math.min(eng / 50, 1);

      // Recency — exponential decay
      const hoursAgo = (now - new Date(post.createdAt).getTime()) / HOUR_MS;
      const recencyS = Math.exp(-DECAY * Math.max(hoursAgo, 0));

      // Skill interest match (author's offered skills overlap user's wanted)
      const authorOffered = (post.userId?.skillsOffered || []).map((s) => s.toLowerCase());
      const authorWanted  = (post.userId?.skillsWanted  || []).map((s) => s.toLowerCase());
      const offerHits = authorOffered.filter((s) => userSkillsWanted.includes(s)).length;
      const wantHits  = authorWanted.filter((s) => userSkillsOffered.includes(s)).length;
      const denominator = Math.max(userSkillsWanted.length + userSkillsOffered.length, 1);
      const skillS  = Math.min((offerHits + wantHits) / denominator, 1);

      // Keyword match in post content
      const bodyLower  = (post.content || '').toLowerCase();
      const keywordS   = userSkillsWanted.some((sk) => bodyLower.includes(sk)) ? 0.12 : 0;

      // Boosts
      const followBoost = isFollowing ? 0.25 : 0;
      const ownBoost    = isOwn       ? 0.20 : 0;

      const score = engS * 0.30 + recencyS * 0.30 + skillS * 0.20 + followBoost + ownBoost + keywordS;

      // Reason tag
      let reason = null;
      if (isOwn) reason = 'own';
      else if (skillS > 0.3) reason = 'skill-match';
      else if (isFollowing && recencyS > 0.6) reason = 'following';
      else if (engS > 0.5) reason = 'trending';
      else if (recencyS > 0.85) reason = 'recent';
      else reason = 'explore';

      return { ...post, _aiScore: Math.round(score * 1000) / 1000, _aiReason: reason };
    });

    // ── 3. Sort ────────────────────────────────────────────────────────────
    scored.sort((a, b) => b._aiScore - a._aiScore);

    // ── 4. Diversity — max 3 posts per author ─────────────────────────────
    const userCount = {};
    const diverse = scored.filter((post) => {
      const aid = (post.userId?._id || post.userId)?.toString();
      if (!userCount[aid]) userCount[aid] = 0;
      if (userCount[aid] >= 3) return false;
      userCount[aid]++;
      return true;
    });

    // ── 5. Paginate ────────────────────────────────────────────────────────
    const total    = diverse.length;
    const paginated = diverse.slice((page - 1) * limit, page * limit);

    res.json({
      success: true,
      data: paginated,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      meta: { algorithm: 'engagement-recency-skill-match-v2', scored: scored.length },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get posts by a specific user
// @route GET /api/posts/user/:userId
const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip  = (page - 1) * limit;

    if (!isDBConnected()) {
      return res.json({ success: true, data: [], pagination: { page, limit, total: 0, pages: 0 } });
    }

    const posts = await Post.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name profilePicture')
      .populate('comments.userId', 'name profilePicture');

    const total = await Post.countDocuments({ userId });

    res.json({
      success: true,
      data: posts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createPost, getFeed, getAIFeed, likePost, commentPost, deletePost, getPost, getUserPosts };
