const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Worker name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Painter', 'Electrician', 'Plumber', 'Carpenter', 'Cleaner', 'Mason', 'Welder', 'AC Technician', 'Other'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    pricePerHour: {
      type: Number,
      required: [true, 'Price per hour is required'],
      min: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    availability: {
      type: Boolean,
      default: true,
    },
    experience: {
      type: Number,
      default: 0,
      comment: 'Years of experience',
    },
    description: {
      type: String,
      trim: true,
    },
    profileImage: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Index for search and filter
workerSchema.index({ category: 1, location: 1, availability: 1 });

module.exports = mongoose.model('Worker', workerSchema);
