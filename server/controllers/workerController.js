const { validationResult } = require('express-validator');
const Worker = require('../models/Worker');

// @desc    Get all workers with optional filters
// @route   GET /api/workers
// @access  Public
const getWorkers = async (req, res, next) => {
  try {
    const { category, city, minRate, maxRate, search, sort, page = 1, limit = 12 } = req.query;

    const query = {};

    if (category) query.category = { $regex: category, $options: 'i' };
    if (city) query.city = { $regex: city, $options: 'i' };
    if (minRate || maxRate) {
      query.hourlyRate = {};
      if (minRate) query.hourlyRate.$gte = Number(minRate);
      if (maxRate) query.hourlyRate.$lte = Number(maxRate);
    }
    if (search) {
      query.$or = [
        { skills: { $in: [new RegExp(search, 'i')] } },
        { category: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOption = {};
    switch (sort) {
      case 'rating':
        sortOption = { rating: -1 };
        break;
      case 'rate_asc':
        sortOption = { hourlyRate: 1 };
        break;
      case 'rate_desc':
        sortOption = { hourlyRate: -1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      default:
        sortOption = { rating: -1, reviewCount: -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Worker.countDocuments(query);

    const workers = await Worker.find(query)
      .populate('user', 'name email avatar')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      workers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single worker by ID
// @route   GET /api/workers/:id
// @access  Public
const getWorker = async (req, res, next) => {
  try {
    const worker = await Worker.findById(req.params.id).populate(
      'user',
      'name email avatar phone location'
    );

    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    res.json({ success: true, worker });
  } catch (error) {
    next(error);
  }
};

// @desc    Create worker profile
// @route   POST /api/workers/profile
// @access  Private
const createWorkerProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const existing = await Worker.findOne({ user: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Worker profile already exists' });
    }

    const { skills, category, description, hourlyRate, location, city, portfolio } = req.body;

    const worker = await Worker.create({
      user: req.user._id,
      skills,
      category,
      description,
      hourlyRate,
      location,
      city,
      portfolio,
    });

    await worker.populate('user', 'name email avatar');

    res.status(201).json({ success: true, worker });
  } catch (error) {
    next(error);
  }
};

// @desc    Update worker profile
// @route   PUT /api/workers/profile
// @access  Private
const updateWorkerProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const worker = await Worker.findOne({ user: req.user._id });
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker profile not found' });
    }

    const allowedFields = [
      'skills', 'category', 'description', 'hourlyRate',
      'availability', 'location', 'city', 'portfolio',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        worker[field] = req.body[field];
      }
    });

    await worker.save();
    await worker.populate('user', 'name email avatar');

    res.json({ success: true, worker });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top-rated workers
// @route   GET /api/workers/top
// @access  Public
const getTopWorkers = async (req, res, next) => {
  try {
    const workers = await Worker.find({ rating: { $gt: 0 }, availability: true })
      .populate('user', 'name email avatar')
      .sort({ rating: -1, reviewCount: -1 })
      .limit(8);

    res.json({ success: true, workers });
  } catch (error) {
    next(error);
  }
};

module.exports = { getWorkers, getWorker, createWorkerProfile, updateWorkerProfile, getTopWorkers };
