import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../services/api';
import toast from 'react-hot-toast';
import Spinner from '../components/common/Spinner';
import { FaLock, FaCheckCircle } from 'react-icons/fa';

const stripePromise = loadStripe(
  process.env.REACT_APP_STRIPE_PUBLIC_KEY || 'pk_test_placeholder'
);

const CARD_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#374151',
      '::placeholder': { color: '#9CA3AF' },
    },
    invalid: { color: '#EF4444' },
  },
};

const CheckoutForm = ({ booking, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    const createIntent = async () => {
      try {
        const { data } = await api.post('/payments/create-intent', {
          bookingId: booking._id,
        });
        setClientSecret(data.clientSecret);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to initialize payment');
      }
    };
    if (booking) createIntent();
  }, [booking]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;

    setLoading(true);
    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        await api.post('/payments/confirm', {
          paymentIntentId: paymentIntent.id,
          bookingId: booking._id,
        });
        toast.success('Payment successful! 🎉');
        onSuccess();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Card Details</label>
        <div className="border border-gray-300 rounded-xl p-4 bg-white focus-within:ring-2 focus-within:ring-blue-400">
          <CardElement options={CARD_OPTIONS} />
        </div>
        <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
          <FaLock size={10} /> Secured by Stripe. Test card: 4242 4242 4242 4242
        </p>
      </div>
      <button
        type="submit"
        disabled={!stripe || !clientSecret || loading}
        className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <FaLock />
        {loading ? 'Processing...' : `Pay $${booking?.price}`}
      </button>
    </form>
  );
};

const Payment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const { data } = await api.get(`/bookings/${bookingId}`);
        setBooking(data);
        if (data.paymentStatus === 'paid') setPaid(true);
      } catch {
        toast.error('Booking not found');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId, navigate]);

  if (loading) return <Spinner center />;

  if (paid) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Confirmed!</h2>
        <p className="text-gray-500 mb-6">Your booking has been confirmed. The worker will arrive on time.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment</h1>
      <p className="text-gray-500 mb-8">Complete your booking by paying securely with Stripe.</p>

      {/* Booking Summary */}
      <div className="bg-gray-50 rounded-2xl p-5 mb-6 border border-gray-200">
        <h3 className="font-bold text-gray-700 mb-3">Order Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Worker</span>
            <span className="font-medium">{booking?.workerId?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Service</span>
            <span>{booking?.workerId?.category}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Date</span>
            <span>{new Date(booking?.date).toLocaleDateString()} at {booking?.time}</span>
          </div>
          <div className="border-t border-gray-300 mt-2 pt-2 flex justify-between font-bold">
            <span>Total Amount</span>
            <span className="text-blue-700 text-lg">${booking?.price}</span>
          </div>
        </div>
      </div>

      {/* Stripe Form */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <Elements stripe={stripePromise}>
          <CheckoutForm booking={booking} onSuccess={() => setPaid(true)} />
        </Elements>
      </div>
    </div>
  );
};

export default Payment;
