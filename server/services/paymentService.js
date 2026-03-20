const Stripe = require('stripe');

// Lazily initialise Stripe so that tests/imports don't fail without the key
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set');
  }
  return Stripe(process.env.STRIPE_SECRET_KEY);
};

/**
 * Create a Stripe PaymentIntent.
 * @param {number} amount     - Amount in the smallest currency unit (e.g. cents).
 * @param {string} currency   - ISO currency code, e.g. 'usd'.
 * @param {Object} metadata   - Arbitrary key-value pairs to attach to the intent.
 * @returns {Stripe.PaymentIntent}
 */
const createPaymentIntent = async (amount, currency = 'usd', metadata = {}) => {
  const stripe = getStripe();
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    metadata,
    automatic_payment_methods: { enabled: true },
  });
  return paymentIntent;
};

/**
 * Retrieve an existing PaymentIntent by its ID.
 * @param {string} paymentIntentId
 * @returns {Stripe.PaymentIntent}
 */
const retrievePaymentIntent = async (paymentIntentId) => {
  const stripe = getStripe();
  return await stripe.paymentIntents.retrieve(paymentIntentId);
};

/**
 * Issue a full refund for a PaymentIntent.
 * @param {string} paymentIntentId
 * @returns {Stripe.Refund}
 */
const refundPayment = async (paymentIntentId) => {
  const stripe = getStripe();
  const refund = await stripe.refunds.create({ payment_intent: paymentIntentId });
  return refund;
};

module.exports = { createPaymentIntent, retrievePaymentIntent, refundPayment };
