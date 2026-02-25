const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateProfile,
  followUser,
  searchUsers,
  getSuggestions,
  getNotifications,
  markNotificationsRead,
  rateUser,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

router.get('/search', protect, searchUsers);
router.get('/suggestions', protect, getSuggestions);
router.get('/notifications', protect, getNotifications);
router.put('/notifications/read', protect, markNotificationsRead);
router.put('/update', protect, upload.single('profilePicture'), updateProfile);
router.post('/follow', protect, followUser);
router.post('/rate', protect, rateUser);
router.get('/:id', protect, getUserProfile);

module.exports = router;
