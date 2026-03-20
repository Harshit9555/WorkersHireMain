const Review = require('../models/Review');
const Worker = require('../models/Worker');

// @desc    Create a review for a worker
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
  try {
    const { workerId, bookingId, rating, comment } = req.body;

    const existing = await Review.findOne({ userId: req.user._id, workerId });
    if (existing) {
      return res.status(400).json({ message: 'You have already reviewed this worker' });
    }

    const review = await Review.create({
      userId: req.user._id,
      workerId,
      bookingId,
      rating,
      comment,
    });

    // Update worker rating
    const reviews = await Review.find({ workerId });
    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

    await Worker.findByIdAndUpdate(workerId, {
      rating: Math.round(avgRating * 10) / 10,
      totalReviews: reviews.length,
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all reviews for a worker
// @route   GET /api/reviews/worker/:workerId
// @access  Public
const getWorkerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ workerId: req.params.workerId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createReview, getWorkerReviews };
