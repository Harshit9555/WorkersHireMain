import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import PrivateRoute from './components/common/PrivateRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Services from './pages/Services';
import Booking from './pages/Booking';
import Payment from './pages/Payment';
import AIChat from './pages/AIChat';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/services" element={<Services />} />
              <Route path="/ai-chat" element={<AIChat />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/booking/:workerId"
                element={
                  <PrivateRoute>
                    <Booking />
                  </PrivateRoute>
                }
              />
              <Route
                path="/payment/:bookingId"
                element={
                  <PrivateRoute>
                    <Payment />
                  </PrivateRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      </Router>
    </AuthProvider>
  );
}

export default App;
