import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import WorkerCard from '../components/workers/WorkerCard';
import Spinner from '../components/common/Spinner';
import { FaSearch, FaFilter } from 'react-icons/fa';

const CATEGORIES = ['All', 'Electrician', 'Plumber', 'Painter', 'Carpenter', 'Cleaner', 'Mason', 'Welder', 'AC Technician', 'Other'];

const Services = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: params.get('search') || '',
    category: params.get('category') || 'All',
    availability: '',
    minPrice: '',
    maxPrice: '',
  });

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (filters.search) query.append('search', filters.search);
      if (filters.category && filters.category !== 'All') query.append('category', filters.category);
      if (filters.availability) query.append('availability', filters.availability);
      if (filters.minPrice) query.append('minPrice', filters.minPrice);
      if (filters.maxPrice) query.append('maxPrice', filters.maxPrice);

      const { data } = await api.get(`/workers?${query.toString()}`);
      setWorkers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchWorkers();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Find Workers</h1>
        <p className="text-gray-500 mt-1">Browse and hire from our verified professionals</p>
      </div>

      {/* Search & Filter Bar */}
      <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2 relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search workers..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select
            name="availability"
            value={filters.availability}
            onChange={handleFilterChange}
            className="border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">All Availability</option>
            <option value="true">Available</option>
            <option value="false">Busy</option>
          </select>
          <button
            type="submit"
            className="bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            <FaFilter /> Filter
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <input
            type="number"
            name="minPrice"
            value={filters.minPrice}
            onChange={handleFilterChange}
            placeholder="Min $/hr"
            className="border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="number"
            name="maxPrice"
            value={filters.maxPrice}
            onChange={handleFilterChange}
            placeholder="Max $/hr"
            className="border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </form>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setFilters((f) => ({ ...f, category: cat }));
              setTimeout(fetchWorkers, 50);
            }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
              filters.category === cat
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <Spinner center />
      ) : workers.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-xl">No workers found matching your criteria.</p>
        </div>
      ) : (
        <>
          <p className="text-gray-500 mb-4">{workers.length} workers found</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {workers.map((worker) => (
              <WorkerCard key={worker._id} worker={worker} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Services;
