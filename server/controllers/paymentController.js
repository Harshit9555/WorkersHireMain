const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Worker = require('../models/Worker');

// @desc    Create a Stripe PaymentIntent for a booking
// @route   POST /api/payments/create-intent
// @access  Private
const createPaymentIntent = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'Booking is already paid' });
    }

    const amountInCents = Math.round(booking.totalAmount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: {
        bookingId: booking._id.toString(),
        clientId: req.user._id.toString(),
      },
    });

    booking.paymentIntentId = paymentIntent.id;
    await booking.save();

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm payment and record it
// @route   POST /api/payments/confirm
// @access  Private
const confirmPayment = async (req, res, next) => {
  try {
    const { paymentIntentId, bookingId } = req.body;

    if (!paymentIntentId || !bookingId) {
      return res.status(400).json({ success: false, message: 'paymentIntentId and bookingId are required' });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ success: false, message: `Payment not succeeded: ${paymentIntent.status}` });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    booking.paymentStatus = 'paid';
    booking.status = 'confirmed';
    booking.paymentIntentId = paymentIntentId;
    await booking.save();

    const chargeId = paymentIntent.latest_charge
      ? typeof paymentIntent.latest_charge === 'string'
        ? paymentIntent.latest_charge
        : paymentIntent.latest_charge.id
      : '';

    const payment = await Payment.create({
      booking: booking._id,
      client: booking.client,
      worker: booking.worker,
      amount: booking.totalAmount,
      currency: 'usd',
      stripePaymentIntentId: paymentIntentId,
      stripeChargeId: chargeId,
      status: 'succeeded',
      metadata: paymentIntent.metadata,
    });

    res.json({ success: true, payment, booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Handle Stripe webhook events
// @route   POST /api/payments/webhook
// @access  Public (Stripe)
const handleWebhook = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ success: false, message: `Webhook error: ${err.message}` });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object;
        const booking = await Booking.findOne({ paymentIntentId: pi.id });
        if (booking && booking.paymentStatus !== 'paid') {
          booking.paymentStatus = 'paid';
          booking.status = 'confirmed';
          await booking.save();

          const existingPayment = await Payment.findOne({ stripePaymentIntentId: pi.id });
          if (!existingPayment) {
            const chargeId = pi.latest_charge
              ? typeof pi.latest_charge === 'string'
                ? pi.latest_charge
                : pi.latest_charge.id
              : '';
            await Payment.create({
              booking: booking._id,
              client: booking.client,
              worker: booking.worker,
              amount: pi.amount / 100,
              currency: pi.currency,
              stripePaymentIntentId: pi.id,
              stripeChargeId: chargeId,
              status: 'succeeded',
              metadata: pi.metadata,
            });
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const pi = event.data.object;
        await Payment.findOneAndUpdate(
          { stripePaymentIntentId: pi.id },
          { status: 'failed' }
        );
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object;
        const payment = await Payment.findOne({ stripeChargeId: charge.id });
        if (payment) {
          payment.status = 'refunded';
          await payment.save();
          await Booking.findByIdAndUpdate(payment.booking, { paymentStatus: 'refunded' });
        }
        break;
      }

      default:
        break;
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment history for the current user
// @route   GET /api/payments/history
// @access  Private
const getPaymentHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query = { client: req.user._id };
    const total = await Payment.countDocuments(query);

    const payments = await Payment.find(query)
      .populate('booking', 'service scheduledDate status')
      .populate('worker', 'category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      payments,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createPaymentIntent, confirmPayment, handleWebhook, getPaymentHistory };
