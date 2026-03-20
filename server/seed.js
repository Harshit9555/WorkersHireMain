/**
 * Seed script to populate the database with sample workers.
 * Run with: node seed.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Worker = require('./models/Worker');

dotenv.config();

const workers = [
  { name: 'John Smith', category: 'Electrician', location: 'New York', pricePerHour: 45, rating: 4.8, totalReviews: 32, availability: true, experience: 8, description: 'Certified electrician with 8 years of residential & commercial experience.' },
  { name: 'Mike Johnson', category: 'Plumber', location: 'New York', pricePerHour: 40, rating: 4.7, totalReviews: 28, availability: true, experience: 6, description: 'Expert plumber for repairs, installations, and emergencies.' },
  { name: 'David Lee', category: 'Painter', location: 'Los Angeles', pricePerHour: 30, rating: 4.9, totalReviews: 45, availability: true, experience: 10, description: 'Professional painter specializing in interior and exterior painting.' },
  { name: 'Carlos Rivera', category: 'Carpenter', location: 'Chicago', pricePerHour: 50, rating: 4.6, totalReviews: 20, availability: true, experience: 12, description: 'Master carpenter for custom furniture, cabinets, and woodwork.' },
  { name: 'Robert Brown', category: 'Cleaner', location: 'Houston', pricePerHour: 25, rating: 4.5, totalReviews: 60, availability: true, experience: 5, description: 'Thorough cleaning services for homes and offices.' },
  { name: 'James Wilson', category: 'Mason', location: 'Phoenix', pricePerHour: 55, rating: 4.7, totalReviews: 18, availability: true, experience: 15, description: 'Expert mason for brickwork, stone, and concrete.' },
  { name: 'Tom Harris', category: 'AC Technician', location: 'Miami', pricePerHour: 60, rating: 4.8, totalReviews: 35, availability: true, experience: 9, description: 'Certified AC technician for installation, repair, and maintenance.' },
  { name: 'Alex Martinez', category: 'Welder', location: 'Dallas', pricePerHour: 65, rating: 4.6, totalReviews: 15, availability: false, experience: 11, description: 'Professional welder for structural and custom metal work.' },
  { name: 'Steve Clark', category: 'Electrician', location: 'Los Angeles', pricePerHour: 42, rating: 4.5, totalReviews: 22, availability: true, experience: 7, description: 'Licensed electrician for residential wiring and smart home setup.' },
  { name: 'Brian Taylor', category: 'Plumber', location: 'Chicago', pricePerHour: 38, rating: 4.4, totalReviews: 30, availability: true, experience: 5, description: 'Reliable plumber for drain cleaning, pipe repairs, and installations.' },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    await Worker.deleteMany({});
    console.log('Cleared existing workers');

    await Worker.insertMany(workers);
    console.log(`Seeded ${workers.length} workers`);

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

seedDB();
