const Worker = require('../models/Worker');

// @desc    Get all workers (with optional filters)
// @route   GET /api/workers
// @access  Public
const getWorkers = async (req, res) => {
  try {
    const { category, location, availability, minPrice, maxPrice, search } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (availability !== undefined) filter.availability = availability === 'true';
    if (minPrice || maxPrice) {
      filter.pricePerHour = {};
      if (minPrice) filter.pricePerHour.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerHour.$lte = Number(maxPrice);
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const workers = await Worker.find(filter).sort({ rating: -1, createdAt: -1 });
    res.json(workers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single worker by ID
// @route   GET /api/workers/:id
// @access  Public
const getWorkerById = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }
    res.json(worker);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new worker
// @route   POST /api/workers
// @access  Private/Admin
const createWorker = async (req, res) => {
  try {
    const worker = await Worker.create(req.body);
    res.status(201).json(worker);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update worker
// @route   PUT /api/workers/:id
// @access  Private/Admin
const updateWorker = async (req, res) => {
  try {
    const worker = await Worker.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }
    res.json(worker);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete worker
// @route   DELETE /api/workers/:id
// @access  Private/Admin
const deleteWorker = async (req, res) => {
  try {
    const worker = await Worker.findByIdAndDelete(req.params.id);
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }
    res.json({ message: 'Worker deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getWorkers, getWorkerById, createWorker, updateWorker, deleteWorker };
