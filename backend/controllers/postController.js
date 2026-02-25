const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');
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
      const result = await uploadToCloudinary(req.file.buffer, 'skillswap/posts', resourceType);
      if (resourceType === 'image') image = result.secure_url;
      else video = result.secure_url;
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

        const io = getIO();
        const onlineUsers = getOnlineUsers();
        const targetSocketId = onlineUsers.get(post.userId.toString());
        if (targetSocketId) {
          io.to(targetSocketId).emit('newNotification', notification);
        }
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

      const io = getIO();
      const onlineUsers = getOnlineUsers();
      const targetSocketId = onlineUsers.get(post.userId.toString());
      if (targetSocketId) {
        io.to(targetSocketId).emit('newNotification', notification);
      }
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

module.exports = { createPost, getFeed, likePost, commentPost, deletePost, getPost };
