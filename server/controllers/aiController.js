const OpenAI = require('openai');
const Worker = require('../models/Worker');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// @desc    Handle AI query for worker recommendations or pricing advice
// @route   POST /api/ai/query
// @access  Private
const handleAIQuery = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Get available workers for context
    const workers = await Worker.find({ availability: true }).limit(20);
    const workerSummary = workers
      .map((w) => `${w.name} (${w.category}) in ${w.location} - $${w.pricePerHour}/hr, rating: ${w.rating}`)
      .join('\n');

    const systemPrompt = `You are a helpful assistant for WorkersHire, a platform to hire skilled workers.
Available workers:
${workerSummary}

Help users find the right worker, suggest pricing, explain services, and provide booking advice.
Keep responses concise and helpful.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      max_tokens: 500,
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    // Graceful fallback if OpenAI key not configured
    if (error.status === 401 || error.code === 'invalid_api_key') {
      return res.json({
        reply: 'AI assistant is not configured yet. Please contact support or browse our workers directly in the Services section.',
      });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get AI-powered worker recommendations
// @route   POST /api/ai/recommend
// @access  Public
const getRecommendations = async (req, res) => {
  try {
    const { category, location, budget } = req.body;

    const filter = { availability: true };
    if (category) filter.category = category;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (budget) filter.pricePerHour = { $lte: Number(budget) };

    const workers = await Worker.find(filter).sort({ rating: -1 }).limit(5);

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      return res.json({ recommendations: workers, aiComment: 'Top rated workers matching your criteria.' });
    }

    const workerList = workers.map((w) => `${w.name}: ${w.category}, ${w.location}, $${w.pricePerHour}/hr`).join('\n');

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant for WorkersHire. Provide a brief recommendation comment (2-3 sentences).',
        },
        {
          role: 'user',
          content: `Recommend from these workers for ${category || 'any service'} in ${location || 'any location'} with budget $${budget || 'any'}/hr:\n${workerList}`,
        },
      ],
      max_tokens: 150,
    });

    res.json({
      recommendations: workers,
      aiComment: completion.choices[0].message.content,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { handleAIQuery, getRecommendations };
