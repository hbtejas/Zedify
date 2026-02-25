const express = require('express');
const router = express.Router();
const { createSession, getSession, joinSession, endSession, getActiveSessions } = require('../controllers/videoController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create-session', protect, createSession);
router.get('/sessions', protect, getActiveSessions);
router.get('/session/:id', protect, getSession);
router.post('/join/:id', protect, joinSession);
router.put('/end/:id', protect, endSession);

module.exports = router;
