const express = require('express');
const router = express.Router();
const { sendExchange, respondExchange, getMyExchanges, completeExchange } = require('../controllers/exchangeController');
const { protect } = require('../middleware/authMiddleware');

router.post('/send', protect, sendExchange);
router.put('/respond', protect, respondExchange);
router.get('/my', protect, getMyExchanges);
router.put('/complete/:id', protect, completeExchange);

module.exports = router;
