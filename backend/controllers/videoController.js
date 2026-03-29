const VideoSession = require('../models/VideoSession');
const { v4: uuidv4 } = require('uuid');

// @desc Create video session
// @route POST /api/video/create-session
const createSession = async (req, res) => {
  try {
    const { skillName, description, isPrivate, allowedUsers } = req.body;

    if (!skillName) {
      return res.status(400).json({ success: false, message: 'Skill name is required' });
    }

    const session = await VideoSession.create({
      sessionId: uuidv4(),
      hostId: req.user._id,
      skillName,
      description: description || '',
      status: 'waiting',
      isPrivate: isPrivate || false,
      allowedUsers: allowedUsers || [],
    });

    const populated = await VideoSession.findById(session._id).populate('hostId', 'name profilePicture');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get session by ID
// @route GET /api/video/session/:id
const getSession = async (req, res) => {
  try {
    const session = await VideoSession.findOne({ sessionId: req.params.id })
      .populate('hostId', 'name profilePicture')
      .populate('participants', 'name profilePicture');

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Join session
// @route POST /api/video/join/:id
const joinSession = async (req, res) => {
  try {
    const session = await VideoSession.findOne({ sessionId: req.params.id });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    if (session.status === 'ended') {
      return res.status(400).json({ success: false, message: 'Session has ended' });
    }

    // Permission check
    if (session.isPrivate && 
        session.hostId.toString() !== req.user._id.toString() && 
        !(session.allowedUsers || []).map(u => u.toString()).includes(req.user._id.toString())) {
      return res.status(403).json({ success: false, message: 'Access denied: this is a private session.' });
    }

    await VideoSession.findByIdAndUpdate(session._id, {
      $addToSet: { participants: req.user._id },
      status: 'live',
    });

    res.json({ success: true, message: 'Joined session', data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc End session
// @route PUT /api/video/end/:id
const endSession = async (req, res) => {
  try {
    const session = await VideoSession.findOne({ sessionId: req.params.id });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    if (session.hostId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only host can end session' });
    }

    session.status = 'ended';
    await session.save();

    res.json({ success: true, message: 'Session ended' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get all active sessions
// @route GET /api/video/sessions
const getActiveSessions = async (req, res) => {
  try {
    const sessions = await VideoSession.find({ status: { $in: ['waiting', 'live'] } })
      .sort({ createdAt: -1 })
      .populate('hostId', 'name profilePicture');
    res.json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Request to join a private session
// @route POST /api/video/request/:id
const requestToJoin = async (req, res) => {
  try {
    const session = await VideoSession.findOne({ sessionId: req.params.id });
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    
    await VideoSession.findByIdAndUpdate(session._id, {
      $addToSet: { waitingList: req.user._id }
    });
    
    res.json({ success: true, message: 'Request sent to host' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Approve a pending participant (Host only)
// @route POST /api/video/approve/:id
const approveParticipant = async (req, res) => {
  try {
    const { userId } = req.body;
    const session = await VideoSession.findOne({ sessionId: req.params.id });
    
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    if (session.hostId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only host can approve participants' });
    }
    
    await VideoSession.findByIdAndUpdate(session._id, {
      $pull: { waitingList: userId },
      $addToSet: { allowedUsers: userId }
    });
    
    res.json({ success: true, message: 'Participant approved' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update session settings (Host only)
// @route PUT /api/video/settings/:id
const updateSessionSettings = async (req, res) => {
  try {
    const { isLocked, isChatDisabled } = req.body;
    const session = await VideoSession.findOne({ sessionId: req.params.id });
    
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    if (session.hostId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only host can change settings' });
    }
    
    const updated = await VideoSession.findByIdAndUpdate(session._id, {
      isLocked: isLocked ?? session.isLocked,
      isChatDisabled: isChatDisabled ?? session.isChatDisabled
    }, { new: true });
    
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Approve all waiting users (Host only)
const approveAllParticipants = async (req, res) => {
  try {
    const session = await VideoSession.findOne({ sessionId: req.params.id });
    if (session.hostId.toString() !== req.user._id.toString()) return res.status(403).send('Denied');
    
    await VideoSession.findByIdAndUpdate(session._id, {
      $addToSet: { allowedUsers: { $each: session.waitingList } },
      $set: { waitingList: [] }
    });
    res.json({ success: true });
  } catch (error) { res.status(500).send(error.message); }
};

// @desc Remove participant (Host only)
const removeParticipant = async (req, res) => {
  try {
    const { userId } = req.body;
    const session = await VideoSession.findOne({ sessionId: req.params.id });
    if (session.hostId.toString() !== req.user._id.toString()) return res.status(403).send('Denied');
    
    await VideoSession.findByIdAndUpdate(session._id, {
      $pull: { allowedUsers: userId, participants: userId }
    });
    res.json({ success: true });
  } catch (error) { res.status(500).send(error.message); }
};

module.exports = { 
  createSession, 
  getSession, 
  joinSession, 
  endSession, 
  getActiveSessions,
  requestToJoin,
  approveParticipant,
  approveAllParticipants,
  removeParticipant,
  updateSessionSettings
};
