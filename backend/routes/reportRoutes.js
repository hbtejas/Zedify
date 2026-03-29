const express = require('express');
const router = express.Router();
const { createReport, getMyReports, resolveReport } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create', protect, createReport);
router.get('/my', protect, getMyReports);
router.put('/resolve', protect, resolveReport); // Admin only should be here normally

module.exports = router;
