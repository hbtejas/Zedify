const express = require('express');
const router = express.Router();
const { createPost, getFeed, getAIFeed, likePost, commentPost, deletePost, getPost } = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

router.post('/create', protect, upload.single('media'), createPost);
router.get('/feed', protect, getFeed);
router.get('/ai-feed', protect, getAIFeed);
router.post('/like', protect, likePost);
router.post('/comment', protect, commentPost);
router.get('/:id', protect, getPost);
router.delete('/:id', protect, deletePost);

module.exports = router;
