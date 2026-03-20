const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

// @desc    Create Stripe payment intent
// @route   POST /api/payments/create-intent
// @access  Private
const createPaymentIntent = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Create Stripe payment intent (amount in cents)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.price * 100),
      currency: 'usd',
      metadata: {
        bookingId: bookingId,
        userId: req.user._id.toString(),
      },
    });

    // Create pending payment record in DB
    const payment = await Payment.create({
      userId: req.user._id,
      bookingId,
      amount: booking.price,
      paymentMethod: 'stripe',
      paymentStatus: 'pending',
      stripePaymentIntentId: paymentIntent.id,
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Confirm payment success and update records
// @route   POST /api/payments/confirm
// @access  Private
const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, bookingId } = req.body;

    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment not successful' });
    }

    // Update payment record
    const payment = await Payment.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntentId },
      {
        paymentStatus: 'success',
        transactionId: paymentIntentId,
      },
      { new: true }
    );

    // Update booking payment status
    await Booking.findByIdAndUpdate(bookingId, {
      paymentStatus: 'paid',
      status: 'confirmed',
    });

    res.json({ message: 'Payment confirmed successfully', payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get payment history for user
// @route   GET /api/payments
// @access  Private
const getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id })
      .populate('bookingId')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get payment by ID
// @route   GET /api/payments/:id
// @access  Private
const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('bookingId');
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    if (payment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createPaymentIntent, confirmPayment, getPaymentHistory, getPaymentById };
