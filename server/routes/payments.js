const express = require('express');
const {
  createPaymentIntent,
  confirmPayment,
  handleWebhook,
  getPaymentHistory,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/create-intent', protect, createPaymentIntent);

router.post('/confirm', protect, confirmPayment);

// Raw body required for Stripe webhook signature verification
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

router.get('/history', protect, getPaymentHistory);

module.exports = router;
