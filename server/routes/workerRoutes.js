const express = require('express');
const router = express.Router();
const {
  getWorkers,
  getWorkerById,
  createWorker,
  updateWorker,
  deleteWorker,
  getCategories,
} = require('../controllers/workerController');
const { protect } = require('../middleware/auth');

// The /categories route must be declared before /:id to avoid being matched as an id
router.get('/categories', getCategories);

router.get('/', getWorkers);
router.get('/:id', getWorkerById);
router.post('/', protect, createWorker);
router.put('/:id', protect, updateWorker);
router.delete('/:id', protect, deleteWorker);

module.exports = router;
