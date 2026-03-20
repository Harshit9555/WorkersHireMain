const express = require('express');
const router = express.Router();
const { handleAIQuery, getRecommendations } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.post('/query', protect, handleAIQuery);
router.post('/recommend', getRecommendations);

module.exports = router;
