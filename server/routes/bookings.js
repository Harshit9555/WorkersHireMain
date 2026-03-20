const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
} = require('../controllers/bookingController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, createBooking);
router.get('/', protect, getMyBookings);
router.get('/all', protect, adminOnly, getAllBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id', protect, updateBookingStatus);
router.delete('/:id', protect, cancelBooking);

module.exports = router;
