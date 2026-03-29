const Exchange = require('../models/Exchange');
const Notification = require('../models/Notification');
const { getIO, getOnlineUsers } = require('../socket/socketServer');

// @desc Send exchange request
// @route POST /api/exchange/send
const sendExchange = async (req, res) => {
  try {
    const { receiverId, skillOffered, skillRequested, message } = req.body;

    if (!receiverId || !skillOffered || !skillRequested) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Check for existing pending request
    const existing = await Exchange.findOne({
      senderId: req.user._id,
      receiverId,
      status: 'pending',
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Exchange request already pending' });
    }

    const exchange = await Exchange.create({
      senderId: req.user._id,
      receiverId,
      skillOffered,
      skillRequested,
      message: message || '',
    });

    const populated = await Exchange.findById(exchange._id)
      .populate('senderId', 'name profilePicture skillsOffered')
      .populate('receiverId', 'name profilePicture skillsWanted');

    // Notification
    const notification = await Notification.create({
      userId: receiverId,
      fromUser: req.user._id,
      type: 'exchange_request',
      message: `${req.user.name} sent you a skill exchange request: ${skillOffered} ↔ ${skillRequested}`,
      link: `/exchange`,
    });

    try {
      const io = getIO();
      const onlineUsers = getOnlineUsers();
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('newNotification', notification);
        io.to(receiverSocketId).emit('newExchangeRequest', populated);
      }
    } catch (_) {}

    res.status(201).json({ success: true, message: 'Exchange request sent', data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Respond to exchange request
// @route PUT /api/exchange/respond
const respondExchange = async (req, res) => {
  try {
    const { exchangeId, action } = req.body;

    if (!['accepted', 'rejected'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Action must be accepted or rejected' });
    }

    const exchange = await Exchange.findById(exchangeId);
    if (!exchange) {
      return res.status(404).json({ success: false, message: 'Exchange not found' });
    }
    if (exchange.receiverId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    exchange.status = action;
    await exchange.save();

    const populated = await Exchange.findById(exchangeId)
      .populate('senderId', 'name profilePicture')
      .populate('receiverId', 'name profilePicture');

    // Notify sender
    const notificationType = action === 'accepted' ? 'exchange_accepted' : 'exchange_rejected';
    const notification = await Notification.create({
      userId: exchange.senderId,
      fromUser: req.user._id,
      type: notificationType,
      message: `${req.user.name} ${action} your skill exchange request`,
      link: `/exchange`,
    });

    try {
      const io = getIO();
      const onlineUsers = getOnlineUsers();
      const senderSocketId = onlineUsers.get(exchange.senderId.toString());
      if (senderSocketId) {
        io.to(senderSocketId).emit('newNotification', notification);
        io.to(senderSocketId).emit('exchangeResponded', populated);
      }
    } catch (_) {}

    res.json({ success: true, message: `Exchange ${action}`, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get my exchanges
// @route GET /api/exchange/my
const getMyExchanges = async (req, res) => {
  try {
    const exchanges = await Exchange.find({
      $or: [{ senderId: req.user._id }, { receiverId: req.user._id }],
    })
      .sort({ createdAt: -1 })
      .populate('senderId', 'name profilePicture')
      .populate('receiverId', 'name profilePicture');

    res.json({ success: true, data: exchanges });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Mark exchange as complete
// @route PUT /api/exchange/complete/:id
const completeExchange = async (req, res) => {
  try {
    const exchange = await Exchange.findById(req.params.id);
    if (!exchange) {
      return res.status(404).json({ success: false, message: 'Exchange not found' });
    }
    if (exchange.senderId.toString() !== req.user._id.toString() && exchange.receiverId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    if (exchange.status !== 'accepted') {
      return res.status(400).json({ success: false, message: 'Exchange must be accepted first' });
    }

    exchange.status = 'completed';
    await exchange.save();

    res.json({ success: true, message: 'Exchange marked as complete' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { sendExchange, respondExchange, getMyExchanges, completeExchange };
