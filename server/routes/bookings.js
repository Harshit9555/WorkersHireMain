const express = require('express');
const { body } = require('express-validator');
const {
  createBooking,
  getClientBookings,
  getWorkerBookings,
  updateBookingStatus,
  addReview,
  cancelBooking,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/',
  protect,
  [
    body('workerId').notEmpty().withMessage('Worker ID is required'),
    body('service').trim().notEmpty().withMessage('Service is required'),
    body('scheduledDate').isISO8601().withMessage('Valid scheduled date is required'),
    body('duration').isInt({ min: 1 }).withMessage('Duration must be at least 1 hour'),
  ],
  createBooking
);

router.get('/client', protect, getClientBookings);

router.get('/worker', protect, getWorkerBookings);

router.put('/:id/status', protect, updateBookingStatus);

router.post(
  '/:id/review',
  protect,
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().trim(),
  ],
  addReview
);

router.delete('/:id', protect, cancelBooking);

module.exports = router;
