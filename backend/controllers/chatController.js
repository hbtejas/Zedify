const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { getIO, getOnlineUsers } = require('../socket/socketServer');

// @desc Get conversation between two users
// @route GET /api/chat/:userId
const getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({
      $or: [
        { senderId: req.user._id, receiverId: userId },
        { senderId: userId, receiverId: req.user._id },
      ],
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('senderId', 'name profilePicture')
      .populate('receiverId', 'name profilePicture');

    // Mark messages as read
    await Message.updateMany(
      { senderId: userId, receiverId: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({ success: true, data: messages.reverse() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Send a message
// @route POST /api/chat/send
const sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;

    if (!message || !receiverId) {
      return res.status(400).json({ success: false, message: 'Receiver and message are required' });
    }

    const newMessage = await Message.create({
      senderId: req.user._id,
      receiverId,
      message,
    });

    const populated = await Message.findById(newMessage._id)
      .populate('senderId', 'name profilePicture')
      .populate('receiverId', 'name profilePicture');

    // Emit via socket
    const io = getIO();
    const onlineUsers = getOnlineUsers();
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receiveMessage', populated);
    }

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get all conversations (chat list)
// @route GET /api/chat/conversations
const getConversations = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ senderId: req.user._id }, { receiverId: req.user._id }],
    }).sort({ createdAt: -1 });

    // Get unique users
    const userIds = new Set();
    messages.forEach((msg) => {
      const otherId =
        msg.senderId.toString() === req.user._id.toString()
          ? msg.receiverId.toString()
          : msg.senderId.toString();
      userIds.add(otherId);
    });

    const conversations = await Promise.all(
      Array.from(userIds).map(async (userId) => {
        const user = await User.findById(userId).select('name profilePicture onlineStatus');
        const lastMessage = await Message.findOne({
          $or: [
            { senderId: req.user._id, receiverId: userId },
            { senderId: userId, receiverId: req.user._id },
          ],
        })
          .sort({ createdAt: -1 })
          .limit(1);

        const unreadCount = await Message.countDocuments({
          senderId: userId,
          receiverId: req.user._id,
          isRead: false,
        });

        return { user, lastMessage, unreadCount };
      })
    );

    res.json({ success: true, data: conversations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getConversation, sendMessage, getConversations };
