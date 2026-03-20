import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

const categoryColors = {
  Electrician: 'bg-yellow-100 text-yellow-800',
  Plumber: 'bg-blue-100 text-blue-800',
  Painter: 'bg-green-100 text-green-800',
  Carpenter: 'bg-orange-100 text-orange-800',
  Cleaner: 'bg-teal-100 text-teal-800',
  Mason: 'bg-red-100 text-red-800',
  Welder: 'bg-gray-100 text-gray-800',
  'AC Technician': 'bg-cyan-100 text-cyan-800',
  Other: 'bg-purple-100 text-purple-800',
};

const WorkerCard = ({ worker }) => {
  const colorClass = categoryColors[worker.category] || categoryColors.Other;

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      {/* Header / Avatar */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 h-20 flex items-end px-4 pb-2">
        <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-blue-700 font-bold text-xl shadow">
          {worker.name.charAt(0)}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-gray-800 text-lg">{worker.name}</h3>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colorClass}`}>
              {worker.category}
            </span>
          </div>
          <div className="flex items-center space-x-1 text-yellow-500">
            <FaStar size={14} />
            <span className="text-sm font-semibold text-gray-700">{worker.rating.toFixed(1)}</span>
            <span className="text-xs text-gray-400">({worker.totalReviews})</span>
          </div>
        </div>

        <div className="mt-3 space-y-1 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <FaMapMarkerAlt className="text-blue-400" />
            <span>{worker.location}</span>
          </div>
          <div className="flex items-center space-x-1">
            <FaClock className="text-green-400" />
            <span>{worker.experience} yrs experience</span>
          </div>
        </div>

        {worker.description && (
          <p className="mt-2 text-sm text-gray-500 line-clamp-2">{worker.description}</p>
        )}

        <div className="mt-4 flex items-center justify-between">
          <span className="text-blue-700 font-bold text-lg">${worker.pricePerHour}/hr</span>
          <div className="flex items-center space-x-2">
            <span
              className={`w-2 h-2 rounded-full ${worker.availability ? 'bg-green-500' : 'bg-red-400'}`}
            />
            <span className="text-xs text-gray-500">{worker.availability ? 'Available' : 'Busy'}</span>
          </div>
        </div>

        <Link
          to={`/booking/${worker._id}`}
          className={`mt-4 block text-center py-2 rounded-xl font-semibold transition ${
            worker.availability
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none'
          }`}
        >
          {worker.availability ? 'Book Now' : 'Unavailable'}
        </Link>
      </div>
    </div>
  );
};

export default WorkerCard;
