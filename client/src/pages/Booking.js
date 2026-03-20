import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Spinner from '../components/common/Spinner';
import { FaStar, FaMapMarkerAlt } from 'react-icons/fa';

const Booking = () => {
  const { workerId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    date: '',
    time: '',
    hours: 1,
    address: '',
    notes: '',
  });

  useEffect(() => {
    const fetchWorker = async () => {
      try {
        const { data } = await api.get(`/workers/${workerId}`);
        setWorker(data);
      } catch {
        toast.error('Worker not found');
        navigate('/services');
      } finally {
        setLoading(false);
      }
    };
    fetchWorker();
  }, [workerId, navigate]);

  const handleChange = (e) => {
    const val = e.target.name === 'hours' ? Number(e.target.value) : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to book');
      navigate('/login');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post('/bookings', {
        workerId,
        ...form,
      });
      toast.success('Booking created! Proceed to payment.');
      navigate(`/payment/${data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner center />;
  if (!worker) return null;

  const totalPrice = worker.pricePerHour * form.hours;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Book a Worker</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Worker Info */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-2xl">
              {worker.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{worker.name}</h2>
              <span className="text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{worker.category}</span>
            </div>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-blue-400" />
              <span>{worker.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaStar className="text-yellow-400" />
              <span>{worker.rating.toFixed(1)} ({worker.totalReviews} reviews)</span>
            </div>
          </div>
          <div className="mt-4 bg-blue-50 rounded-xl p-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Rate</span>
              <span className="font-bold text-blue-700">${worker.pricePerHour}/hr</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-gray-600">Hours</span>
              <span className="font-bold">{form.hours}</span>
            </div>
            <div className="border-t border-blue-200 mt-3 pt-3 flex justify-between">
              <span className="font-bold text-gray-700">Total</span>
              <span className="font-bold text-blue-700 text-lg">${totalPrice}</span>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Booking Details</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input
                type="time"
                name="time"
                value={form.time}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hours Required</label>
              <select
                name="hours"
                value={form.hours}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((h) => (
                  <option key={h} value={h}>{h} hour{h > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Your address"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Any special instructions..."
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {submitting ? 'Booking...' : `Book & Pay $${totalPrice}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Booking;
