const express = require('express');
const router = express.Router();
const { getRecommendations, chatQuery } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.post('/query', protect, chatQuery);
router.post('/recommendations', protect, getRecommendations);

module.exports = router;
