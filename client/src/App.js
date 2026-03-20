import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Services from './pages/Services';
import Booking from './pages/Booking';
import Payment from './pages/Payment';
import AIChat from './pages/AIChat';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { background: '#1e3a8a', color: '#fff' },
          success: { style: { background: '#16a34a', color: '#fff' } },
          error: { style: { background: '#dc2626', color: '#fff' } },
        }}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/services" element={<Services />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/book/:workerId" element={<PrivateRoute><Booking /></PrivateRoute>} />
        <Route path="/payment/:bookingId" element={<PrivateRoute><Payment /></PrivateRoute>} />
        <Route path="/ai-chat" element={<PrivateRoute><AIChat /></PrivateRoute>} />
      </Routes>
    </div>
  );
}
