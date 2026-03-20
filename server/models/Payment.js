const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['stripe', 'razorpay', 'cash'],
      default: 'stripe',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'success', 'failed', 'refunded'],
      default: 'pending',
    },
    transactionId: {
      type: String,
      trim: true,
    },
    stripePaymentIntentId: {
      type: String,
      trim: true,
    },
    currency: {
      type: String,
      default: 'usd',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
