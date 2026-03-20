const express = require('express');
const router = express.Router();
const {
  createPaymentIntent,
  confirmPayment,
  getPaymentHistory,
  getPaymentById,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/create-intent', protect, createPaymentIntent);
router.post('/confirm', protect, confirmPayment);
router.get('/', protect, getPaymentHistory);
router.get('/:id', protect, getPaymentById);

module.exports = router;
