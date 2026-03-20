const Worker = require('../models/Worker');

const CATEGORIES = ['Painter', 'Electrician', 'Plumber', 'Carpenter', 'Cleaner', 'Mason', 'Welder', 'Gardener'];

// @desc  Get all workers with optional filters
// @route GET /api/workers
const getWorkers = async (req, res) => {
  try {
    const { category, location, availability } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (availability !== undefined) filter.availability = availability === 'true';

    const workers = await Worker.find(filter).sort({ rating: -1 });
    res.status(200).json({ success: true, count: workers.length, workers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get a single worker by ID
// @route GET /api/workers/:id
const getWorkerById = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }
    res.status(200).json({ success: true, worker });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Create a new worker (admin only)
// @route POST /api/workers
const createWorker = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied: admins only' });
    }

    const worker = await Worker.create(req.body);
    res.status(201).json({ success: true, worker });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Update a worker
// @route PUT /api/workers/:id
const updateWorker = async (req, res) => {
  try {
    const worker = await Worker.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    res.status(200).json({ success: true, worker });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Delete a worker
// @route DELETE /api/workers/:id
const deleteWorker = async (req, res) => {
  try {
    const worker = await Worker.findByIdAndDelete(req.params.id);
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }
    res.status(200).json({ success: true, message: 'Worker deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get list of available worker categories
// @route GET /api/workers/categories
const getCategories = async (req, res) => {
  res.status(200).json({ success: true, categories: CATEGORIES });
};

module.exports = { getWorkers, getWorkerById, createWorker, updateWorker, deleteWorker, getCategories };
