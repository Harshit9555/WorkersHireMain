import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Spinner from '../components/common/Spinner';
import { FaCalendarAlt, FaCheckCircle, FaClock, FaTimesCircle, FaMoneyBillWave } from 'react-icons/fa';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  'in-progress': 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const StatusIcon = ({ status }) => {
  if (status === 'completed') return <FaCheckCircle className="text-green-500" />;
  if (status === 'cancelled') return <FaTimesCircle className="text-red-500" />;
  if (status === 'confirmed') return <FaCheckCircle className="text-blue-500" />;
  return <FaClock className="text-yellow-500" />;
};

const Dashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await api.get('/bookings');
        setBookings(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    completed: bookings.filter((b) => b.status === 'completed').length,
    paid: bookings.filter((b) => b.paymentStatus === 'paid').length,
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.name}! 👋</h1>
        <p className="text-gray-500 mt-1">Manage your bookings and track your hired workers.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Total Bookings', value: stats.total, color: 'bg-blue-50 text-blue-700', icon: <FaCalendarAlt /> },
          { label: 'Pending', value: stats.pending, color: 'bg-yellow-50 text-yellow-700', icon: <FaClock /> },
          { label: 'Completed', value: stats.completed, color: 'bg-green-50 text-green-700', icon: <FaCheckCircle /> },
          { label: 'Paid', value: stats.paid, color: 'bg-purple-50 text-purple-700', icon: <FaMoneyBillWave /> },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.color} rounded-2xl p-5 flex flex-col gap-2`}>
            <div className="text-2xl">{stat.icon}</div>
            <div className="text-3xl font-bold">{stat.value}</div>
            <div className="text-sm font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="flex flex-wrap gap-3 mb-10">
        <Link to="/services" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition">
          Browse Workers
        </Link>
        <Link to="/ai-chat" className="bg-purple-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-purple-700 transition">
          AI Recommendations
        </Link>
      </div>

      {/* Bookings */}
      <h2 className="text-2xl font-bold text-gray-800 mb-5">My Bookings</h2>
      {loading ? (
        <Spinner center />
      ) : bookings.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">No bookings yet.</p>
          <Link to="/services" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition">
            Book a Worker
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
                  {booking.workerId?.name?.charAt(0) || '?'}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{booking.workerId?.name}</h3>
                  <p className="text-sm text-gray-500">{booking.workerId?.category}</p>
                  <p className="text-sm text-gray-400">
                    {new Date(booking.date).toLocaleDateString()} at {booking.time}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors[booking.status]}`}>
                  <span className="flex items-center gap-1">
                    <StatusIcon status={booking.status} />
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </span>
                <span className="font-bold text-gray-700">${booking.price}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {booking.paymentStatus === 'paid' ? '✓ Paid' : 'Unpaid'}
                </span>
                {booking.paymentStatus !== 'paid' && (
                  <Link
                    to={`/payment/${booking._id}`}
                    className="bg-green-600 text-white text-xs px-3 py-1.5 rounded-xl hover:bg-green-700 transition"
                  >
                    Pay Now
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
