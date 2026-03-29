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

module.exports = { createSession, getSession, joinSession, endSession, getActiveSessions };
