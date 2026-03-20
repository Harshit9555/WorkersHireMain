import React from 'react';
import { FaWrench, FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center space-x-2 text-white font-bold text-lg mb-3">
            <FaWrench className="text-yellow-400" />
            <span>WorkersHire</span>
          </div>
          <p className="text-sm">Your trusted platform to hire skilled workers — anytime, anywhere.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-yellow-400">Home</Link></li>
            <li><Link to="/services" className="hover:text-yellow-400">Services</Link></li>
            <li><Link to="/signup" className="hover:text-yellow-400">Get Started</Link></li>
            <li><Link to="/ai-chat" className="hover:text-yellow-400">AI Assistant</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Follow Us</h4>
          <div className="flex space-x-4 text-xl">
            <a href="#!" className="hover:text-blue-400"><FaFacebook /></a>
            <a href="#!" className="hover:text-sky-400"><FaTwitter /></a>
            <a href="#!" className="hover:text-pink-400"><FaInstagram /></a>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-700 text-center text-sm py-4 text-gray-500">
        &copy; {new Date().getFullYear()} WorkersHire. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
