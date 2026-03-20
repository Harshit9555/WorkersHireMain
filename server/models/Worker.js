const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Worker name is required'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Painter', 'Electrician', 'Plumber', 'Carpenter', 'Cleaner', 'Mason', 'Welder', 'Gardener'],
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
  },
  pricePerHour: {
    type: Number,
    required: [true, 'Price per hour is required'],
    min: [0, 'Price cannot be negative'],
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot exceed 5'],
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
  availability: {
    type: Boolean,
    default: true,
  },
  description: {
    type: String,
    trim: true,
  },
  experience: {
    type: Number,
    default: 0,
    min: [0, 'Experience cannot be negative'],
  },
  image: {
    type: String,
  },
  phone: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Worker', workerSchema);
