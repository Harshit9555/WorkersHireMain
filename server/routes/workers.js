const express = require('express');
const router = express.Router();
const {
  getWorkers,
  getWorkerById,
  createWorker,
  updateWorker,
  deleteWorker,
} = require('../controllers/workerController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getWorkers);
router.get('/:id', getWorkerById);
router.post('/', protect, adminOnly, createWorker);
router.put('/:id', protect, adminOnly, updateWorker);
router.delete('/:id', protect, adminOnly, deleteWorker);

module.exports = router;
