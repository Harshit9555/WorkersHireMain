import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaWrench, FaBolt, FaPaintRoller, FaHammer, FaSearch } from 'react-icons/fa';
import api from '../services/api';
import WorkerCard from '../components/workers/WorkerCard';
import Spinner from '../components/common/Spinner';

const categories = [
  { name: 'Electrician', icon: <FaBolt />, color: 'bg-yellow-50 text-yellow-600 border-yellow-200' },
  { name: 'Plumber', icon: <FaWrench />, color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { name: 'Painter', icon: <FaPaintRoller />, color: 'bg-green-50 text-green-600 border-green-200' },
  { name: 'Carpenter', icon: <FaHammer />, color: 'bg-orange-50 text-orange-600 border-orange-200' },
];

const Home = () => {
  const [featuredWorkers, setFeaturedWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await api.get('/workers?availability=true');
        setFeaturedWorkers(data.slice(0, 6));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-500 text-white py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            Hire Skilled Workers <br />
            <span className="text-yellow-300">Instantly & Securely</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-10">
            Find trusted Electricians, Plumbers, Painters, Carpenters and more — powered by AI recommendations.
          </p>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row max-w-xl mx-auto gap-3">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by skill or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <Link
              to={`/services?search=${searchTerm}`}
              className="bg-yellow-400 text-blue-900 font-bold px-6 py-3 rounded-xl hover:bg-yellow-300 transition text-center"
            >
              Search
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-10">Popular Services</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={`/services?category=${cat.name}`}
                className={`flex flex-col items-center p-6 rounded-2xl border-2 ${cat.color} hover:shadow-md transition cursor-pointer`}
              >
                <span className="text-4xl mb-3">{cat.icon}</span>
                <span className="font-semibold text-lg">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Workers */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold text-gray-800">Top Workers</h2>
            <Link to="/services" className="text-blue-600 font-semibold hover:underline">
              View All →
            </Link>
          </div>
          {loading ? (
            <Spinner center />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredWorkers.map((worker) => (
                <WorkerCard key={worker._id} worker={worker} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-700 text-white py-16 px-6 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to hire the right worker?</h2>
        <p className="text-blue-200 mb-8">Get AI-powered recommendations and book instantly.</p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link
            to="/signup"
            className="bg-yellow-400 text-blue-900 font-bold px-8 py-3 rounded-full hover:bg-yellow-300 transition"
          >
            Get Started Free
          </Link>
          <Link
            to="/ai-chat"
            className="border-2 border-white text-white font-bold px-8 py-3 rounded-full hover:bg-white hover:text-blue-700 transition"
          >
            Try AI Chat
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
