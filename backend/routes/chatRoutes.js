const express = require('express');
const router = express.Router();
const { getConversation, sendMessage, getConversations } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.get('/conversations', protect, getConversations);
router.get('/:userId', protect, getConversation);
router.post('/send', protect, sendMessage);

module.exports = router;
