const express = require('express');
const { body } = require('express-validator');
const {
  getWorkers,
  getWorker,
  createWorkerProfile,
  updateWorkerProfile,
  getTopWorkers,
} = require('../controllers/workerController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', getWorkers);

router.get('/top', getTopWorkers);

router.get('/:id', getWorker);

router.post(
  '/profile',
  protect,
  [
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('hourlyRate').isFloat({ min: 1 }).withMessage('Hourly rate must be a positive number'),
    body('skills').optional().isArray().withMessage('Skills must be an array'),
  ],
  createWorkerProfile
);

router.put(
  '/profile',
  protect,
  [
    body('category').optional().trim().notEmpty().withMessage('Category cannot be empty'),
    body('hourlyRate').optional().isFloat({ min: 1 }).withMessage('Hourly rate must be a positive number'),
    body('availability').optional().isBoolean().withMessage('Availability must be a boolean'),
  ],
  updateWorkerProfile
);

module.exports = router;
