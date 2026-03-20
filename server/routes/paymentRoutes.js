const express = require('express');
const router = express.Router();
const { createPaymentIntent, verifyPayment, getPaymentHistory } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/create-intent', protect, createPaymentIntent);
router.post('/verify', protect, verifyPayment);
router.get('/history', protect, getPaymentHistory);

module.exports = router;
