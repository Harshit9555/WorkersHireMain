const { validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Worker = require('../models/Worker');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { workerId, service, description, scheduledDate, duration, address, notes } = req.body;

    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    if (!worker.availability) {
      return res.status(400).json({ success: false, message: 'Worker is not available' });
    }

    if (worker.user.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot book yourself' });
    }

    const totalAmount = worker.hourlyRate * duration;

    const booking = await Booking.create({
      client: req.user._id,
      worker: worker._id,
      service,
      description,
      scheduledDate,
      duration,
      totalAmount,
      address,
      notes,
    });

    await booking.populate([
      { path: 'client', select: 'name email avatar' },
      { path: 'worker', populate: { path: 'user', select: 'name email avatar' } },
    ]);

    res.status(201).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings for the current client
// @route   GET /api/bookings/client
// @access  Private
const getClientBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { client: req.user._id };
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Booking.countDocuments(query);

    const bookings = await Booking.find(query)
      .populate('worker', 'category hourlyRate rating')
      .populate({ path: 'worker', populate: { path: 'user', select: 'name email avatar' } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / Number(limit)), bookings });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings for the current worker
// @route   GET /api/bookings/worker
// @access  Private
const getWorkerBookings = async (req, res, next) => {
  try {
    const workerProfile = await Worker.findOne({ user: req.user._id });
    if (!workerProfile) {
      return res.status(404).json({ success: false, message: 'Worker profile not found' });
    }

    const { status, page = 1, limit = 10 } = req.query;
    const query = { worker: workerProfile._id };
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Booking.countDocuments(query);

    const bookings = await Booking.find(query)
      .populate('client', 'name email avatar phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / Number(limit)), bookings });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const workerProfile = await Worker.findOne({ user: req.user._id });

    const isClient = booking.client.toString() === req.user._id.toString();
    const isWorker = workerProfile && booking.worker.toString() === workerProfile._id.toString();

    if (!isClient && !isWorker && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this booking' });
    }

    // Business logic: clients can only cancel, workers can confirm/start/complete
    if (isClient && status !== 'cancelled') {
      return res.status(403).json({ success: false, message: 'Clients can only cancel bookings' });
    }

    booking.status = status;

    // Update worker earnings on completion
    if (status === 'completed' && workerProfile) {
      await Worker.findByIdAndUpdate(booking.worker, {
        $inc: { totalEarnings: booking.totalAmount },
      });
    }

    await booking.save();

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a review to a completed booking
// @route   POST /api/bookings/:id/review
// @access  Private
const addReview = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { rating, comment } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the client can leave a review' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Can only review completed bookings' });
    }

    if (booking.review) {
      return res.status(400).json({ success: false, message: 'Booking already has a review' });
    }

    booking.review = { rating, comment, createdAt: new Date() };
    await booking.save();

    // Recalculate worker rating
    const allBookings = await Booking.find({
      worker: booking.worker,
      'review.rating': { $exists: true },
    });

    const totalRating = allBookings.reduce((sum, b) => sum + b.review.rating, 0);
    const avgRating = totalRating / allBookings.length;

    await Worker.findByIdAndUpdate(booking.worker, {
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: allBookings.length,
    });

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a booking
// @route   DELETE /api/bookings/:id
// @access  Private
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const isClient = booking.client.toString() === req.user._id.toString();
    const workerProfile = await Worker.findOne({ user: req.user._id });
    const isWorker = workerProfile && booking.worker.toString() === workerProfile._id.toString();

    if (!isClient && !isWorker && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    if (['completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: `Cannot cancel a ${booking.status} booking` });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ success: true, message: 'Booking cancelled', booking });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getClientBookings,
  getWorkerBookings,
  updateBookingStatus,
  addReview,
  cancelBooking,
};
