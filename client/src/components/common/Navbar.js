import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaBars, FaTimes, FaWrench } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav className="bg-blue-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 text-xl font-bold">
          <FaWrench className="text-yellow-400" />
          <span>WorkersHire</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="hover:text-yellow-300 transition">Home</Link>
          <Link to="/services" className="hover:text-yellow-300 transition">Services</Link>
          {user && <Link to="/dashboard" className="hover:text-yellow-300 transition">Dashboard</Link>}
          {user && <Link to="/ai-chat" className="hover:text-yellow-300 transition">AI Chat</Link>}
          {user ? (
            <div className="flex items-center space-x-3">
              <span className="text-yellow-300 font-medium">{user.name}</span>
              <button
                onClick={handleLogout}
                className="bg-yellow-400 text-blue-900 px-4 py-1.5 rounded-full font-semibold hover:bg-yellow-300 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex space-x-3">
              <Link to="/login" className="hover:text-yellow-300 transition">Login</Link>
              <Link
                to="/signup"
                className="bg-yellow-400 text-blue-900 px-4 py-1.5 rounded-full font-semibold hover:bg-yellow-300 transition"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <div className="md:hidden bg-blue-800 px-4 pb-4 flex flex-col space-y-3">
          <Link to="/" onClick={() => setMenuOpen(false)} className="hover:text-yellow-300">Home</Link>
          <Link to="/services" onClick={() => setMenuOpen(false)} className="hover:text-yellow-300">Services</Link>
          {user && <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="hover:text-yellow-300">Dashboard</Link>}
          {user && <Link to="/ai-chat" onClick={() => setMenuOpen(false)} className="hover:text-yellow-300">AI Chat</Link>}
          {user ? (
            <button onClick={handleLogout} className="text-left text-yellow-300">Logout</button>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="hover:text-yellow-300">Login</Link>
              <Link to="/signup" onClick={() => setMenuOpen(false)} className="hover:text-yellow-300">Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
