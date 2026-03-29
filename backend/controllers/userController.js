const User = require('../models/User');
const Notification = require('../models/Notification');
const { uploadToCloudinary } = require('../config/cloudinary');
const { isDBConnected } = require('../config/db');
const { memUsers } = require('../config/memStore');
const { getIO, getOnlineUsers } = require('../socket/socketServer');

// @desc Get user profile
// @route GET /api/users/:id
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('followers', 'name profilePicture onlineStatus')
      .populate('following', 'name profilePicture onlineStatus')
      .populate('ratings.rater', 'name profilePicture');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update user profile
// @route PUT /api/users/update
const updateProfile = async (req, res) => {
  try {
    const { name, bio, college, branch, year, skillsOffered, skillsWanted } = req.body;
    let profilePicture;

    if (req.file) {
      // Check if Cloudinary is configured with real credentials
      const hasCloudinary =
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_KEY !== 'your_api_key' &&
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name';

      if (hasCloudinary) {
        try {
          const result = await uploadToCloudinary(req.file.buffer, 'zedify/avatars', 'image');
          profilePicture = result.secure_url;
        } catch (uploadErr) {
          console.warn('Cloudinary upload failed, skipping picture update:', uploadErr.message);
        }
      } else {
        // Fallback: convert image buffer to base64 data URL for local storage
        const base64 = req.file.buffer.toString('base64');
        profilePicture = `data:${req.file.mimetype};base64,${base64}`;
      }
    }

    const updateFields = {};
    if (name) updateFields.name = name;
    if (bio !== undefined) updateFields.bio = bio;
    if (college !== undefined) updateFields.college = college;
    if (branch !== undefined) updateFields.branch = branch;
    if (year !== undefined) updateFields.year = year;
    if (skillsOffered) updateFields.skillsOffered = Array.isArray(skillsOffered) ? skillsOffered : JSON.parse(skillsOffered);
    if (skillsWanted) updateFields.skillsWanted = Array.isArray(skillsWanted) ? skillsWanted : JSON.parse(skillsWanted);
    if (profilePicture) updateFields.profilePicture = profilePicture;

    const user = await User.findByIdAndUpdate(req.user._id, updateFields, { new: true, runValidators: true }).select('-password');

    res.json({ success: true, message: 'Profile updated', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Follow / Unfollow user
// @route POST /api/users/follow
const followUser = async (req, res) => {
  try {
    const { userId } = req.body;

    if (userId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot follow yourself' });
    }

    const targetUser = await User.findById(userId);
    const currentUser = await User.findById(req.user._id);

    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isFollowing = currentUser.following.includes(userId);

    if (isFollowing) {
      // Unfollow
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: userId } });
      await User.findByIdAndUpdate(userId, { $pull: { followers: req.user._id } });
      res.json({ success: true, message: 'Unfollowed successfully' });
    } else {
      // Follow
      await User.findByIdAndUpdate(req.user._id, { $addToSet: { following: userId } });
      await User.findByIdAndUpdate(userId, { $addToSet: { followers: req.user._id } });

      // Create notification
      const notification = await Notification.create({
        userId: targetUser._id,
        fromUser: req.user._id,
        type: 'follow',
        message: `${currentUser.name} started following you`,
        link: `/profile/${req.user._id}`,
      });

      // Emit real-time notification
      try {
        const io = getIO();
        const onlineUsers = getOnlineUsers();
        const targetSocketId = onlineUsers.get(userId);
        if (targetSocketId) {
          io.to(targetSocketId).emit('newNotification', notification);
        }
      } catch (_) {}

      res.json({ success: true, message: 'Followed successfully' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Search users
// @route GET /api/users/search?q=query
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!isDBConnected()) {
      const re = new RegExp(q, 'i');
      const results = [...memUsers.values()]
        .filter((u) => u._id !== req.user._id && (re.test(u.name) || re.test(u.college) ||
          (u.skillsOffered || []).some((s) => re.test(s)) ||
          (u.skillsWanted || []).some((s) => re.test(s))))
        .map(({ password: _pw, ...u }) => u)
        .slice(0, 20);
      return res.json({ success: true, data: results });
    }
    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { skillsOffered: { $in: [new RegExp(q, 'i')] } },
        { skillsWanted: { $in: [new RegExp(q, 'i')] } },
        { college: { $regex: q, $options: 'i' } },
      ],
      _id: { $ne: req.user._id },
    })
      .select('name profilePicture bio skillsOffered skillsWanted college onlineStatus')
      .limit(20);

    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get suggestions (users not yet followed)
// @route GET /api/users/suggestions
const getSuggestions = async (req, res) => {
  try {
    if (!isDBConnected()) {
      // In-memory: return other registered users
      const others = [...memUsers.values()]
        .filter((u) => u._id !== req.user._id)
        .map(({ password: _pw, ...u }) => u)
        .slice(0, 10);
      return res.json({ success: true, data: others });
    }
    const currentUser = await User.findById(req.user._id);
    const users = await User.find({
      _id: { $ne: req.user._id, $nin: currentUser.following },
    })
      .select('name profilePicture bio skillsOffered college onlineStatus')
      .limit(10);

    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get notifications
// @route GET /api/users/notifications
const getNotifications = async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res.json({ success: true, data: [] });
    }
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('fromUser', 'name profilePicture');
    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Mark notifications as read
// @route PUT /api/users/notifications/read
const markNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'Notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Rate a user (1-5 stars)
// @route POST /api/users/rate
const rateUser = async (req, res) => {
  try {
    const { userId, value } = req.body;

    if (!userId || !value || value < 1 || value > 5) {
      return res.status(400).json({ success: false, message: 'userId and value (1-5) are required' });
    }
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot rate yourself' });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });

    const existingIdx = targetUser.ratings.findIndex((r) => r.rater.toString() === req.user._id.toString());
    if (existingIdx > -1) {
      // Update existing rating
      targetUser.ratings[existingIdx].value = value;
    } else {
      targetUser.ratings.push({ rater: req.user._id, value });
    }
    await targetUser.save();

    // Notify the rated user
    try {
      const io = getIO();
      const onlineUsers = getOnlineUsers();
      const targetSocketId = onlineUsers.get(userId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('ratingReceived', {
          from: req.user.name,
          value,
          avgRating: targetUser.avgRating,
        });
      }
    } catch (_) {}

    res.json({ success: true, message: 'Rating submitted', avgRating: targetUser.avgRating, totalRatings: targetUser.ratings.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getUserProfile, updateProfile, followUser, searchUsers, getSuggestions, getNotifications, markNotificationsRead, rateUser };
