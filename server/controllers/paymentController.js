const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const { createPaymentIntent: stripeCreateIntent, retrievePaymentIntent, refundPayment } = require('../services/paymentService');

// @desc  Create a Stripe payment intent for a booking
// @route POST /api/payments/create-intent
const createPaymentIntent = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Stripe expects amount in the smallest currency unit (cents)
    const amountInCents = Math.round(booking.price * 100);

    const paymentIntent = await stripeCreateIntent(amountInCents, 'usd', {
      bookingId: bookingId.toString(),
      userId: req.user._id.toString(),
    });

    // Record the payment
    const payment = await Payment.create({
      userId: req.user._id,
      bookingId,
      amount: booking.price,
      currency: 'usd',
      stripePaymentIntentId: paymentIntent.id,
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Verify a Stripe payment and update booking/payment status
// @route POST /api/payments/verify
const verifyPayment = async (req, res) => {
  try {
    const { paymentIntentId, bookingId } = req.body;

    const paymentIntent = await retrievePaymentIntent(paymentIntentId);

    const paymentRecord = await Payment.findOne({ stripePaymentIntentId: paymentIntentId });
    if (!paymentRecord) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    if (paymentIntent.status === 'succeeded') {
      paymentRecord.paymentStatus = 'completed';
      paymentRecord.transactionId = paymentIntent.id;
      await paymentRecord.save();

      await Booking.findByIdAndUpdate(bookingId, {
        paymentStatus: 'paid',
        status: 'confirmed',
      });

      return res.status(200).json({ success: true, message: 'Payment verified successfully', payment: paymentRecord });
    }

    paymentRecord.paymentStatus = 'failed';
    await paymentRecord.save();

    res.status(400).json({ success: false, message: 'Payment not completed', status: paymentIntent.status });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get payment history for the authenticated user
// @route GET /api/payments/history
const getPaymentHistory = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { userId: req.user._id };
    const payments = await Payment.find(filter)
      .populate('bookingId')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: payments.length, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createPaymentIntent, verifyPayment, getPaymentHistory };
