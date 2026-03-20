const OpenAI = require('openai');

const SYSTEM_PROMPT =
  'You are a helpful assistant for WorkersHire, a platform connecting clients with skilled workers. ' +
  'Help users find workers, understand services, and answer questions about bookings and payments.';

// @desc    Send messages to OpenAI and return AI response
// @route   POST /api/ai/chat
// @access  Private
const chat = async (req, res, next) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, message: 'messages array is required' });
    }

    const sanitized = messages
      .filter((m) => m && typeof m.role === 'string' && typeof m.content === 'string')
      .map((m) => ({ role: m.role, content: m.content }));

    if (sanitized.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid messages provided' });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...sanitized],
      max_tokens: 500,
      temperature: 0.7,
    });

    const reply = completion.choices[0].message;

    res.json({
      success: true,
      message: reply,
      usage: completion.usage,
    });
  } catch (error) {
    if (error.status === 401) {
      return res.status(500).json({ success: false, message: 'AI service configuration error' });
    }
    if (error.status === 429) {
      return res.status(429).json({ success: false, message: 'AI service rate limit exceeded, please try again later' });
    }
    next(error);
  }
};

module.exports = { chat };
