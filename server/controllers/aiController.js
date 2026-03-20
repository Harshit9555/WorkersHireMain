const Worker = require('../models/Worker');
const { getWorkerRecommendations, handleChatQuery } = require('../services/aiService');

// @desc  Get AI-powered worker recommendations based on a user query
// @route POST /api/ai/recommendations
const getRecommendations = async (req, res) => {
  try {
    const { query, category, location } = req.body;

    if (!query) {
      return res.status(400).json({ success: false, message: 'Query is required' });
    }

    const filter = {};
    if (category) filter.category = category;
    if (location) filter.location = { $regex: location, $options: 'i' };
    filter.availability = true;

    const workers = await Worker.find(filter).sort({ rating: -1 }).limit(20);

    const recommendations = await getWorkerRecommendations(query, workers);

    res.status(200).json({ success: true, recommendations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Handle a natural language chat query about workers/services
// @route POST /api/ai/query
const chatQuery = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ success: false, message: 'Query is required' });
    }

    // Provide context about available categories and counts
    const workerStats = await Worker.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, avgRating: { $avg: '$rating' } } },
    ]);

    const context = {
      availableCategories: workerStats.map((s) => ({
        category: s._id,
        count: s.count,
        avgRating: parseFloat(s.avgRating.toFixed(2)),
      })),
      platform: 'WorkersHire — a platform for hiring skilled workers',
    };

    const response = await handleChatQuery(query, context);

    res.status(200).json({ success: true, response });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getRecommendations, chatQuery };
