const OpenAI = require('openai');

// Lazily initialise the client so imports don't fail without an API key
const getOpenAI = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

/**
 * Ask OpenAI to recommend workers from the provided list based on the user's query.
 * @param {string} userQuery - Natural language description of what the user needs.
 * @param {Array}  workers   - Array of Worker documents to choose from.
 * @returns {Object} Parsed recommendation response from OpenAI.
 */
const getWorkerRecommendations = async (userQuery, workers) => {
  const workerSummaries = workers.map((w) => ({
    id: w._id,
    name: w.name,
    category: w.category,
    location: w.location,
    pricePerHour: w.pricePerHour,
    rating: w.rating,
    experience: w.experience,
    description: w.description,
  }));

  const prompt = `You are an AI assistant for WorkersHire, a platform for hiring skilled workers.
A user is looking for help with the following request: "${userQuery}"

Here are the available workers:
${JSON.stringify(workerSummaries, null, 2)}

Please recommend the most suitable workers for this request. For each recommendation:
1. Explain why the worker is a good fit.
2. Highlight relevant skills, experience, or location advantages.
3. Return your response as a JSON object with a "recommendations" array, where each item has:
   - workerId
   - name
   - reason (string explanation)
   - matchScore (number from 1–10)

Only return the JSON object, no extra text.`;

  const openai = getOpenAI();
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 1000,
  });

  const content = completion.choices[0].message.content.trim();

  try {
    return JSON.parse(content);
  } catch {
    // Return raw text if the model deviated from JSON format
    return { recommendations: [], rawResponse: content };
  }
};

/**
 * Handle a general natural language query about the WorkersHire platform.
 * @param {string} query   - The user's question or request.
 * @param {Object} context - Contextual data (e.g. worker stats, platform info).
 * @returns {string} The assistant's reply.
 */
const handleChatQuery = async (query, context) => {
  const systemPrompt = `You are a helpful AI assistant for WorkersHire, a platform that connects users with skilled workers.
You help users find the right workers, understand pricing, explain services, and answer questions about bookings.

Platform context:
${JSON.stringify(context, null, 2)}

Be concise, friendly, and helpful. If the user asks about something outside the platform's scope, politely redirect them.`;

  const openai = getOpenAI();
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: query },
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  return completion.choices[0].message.content.trim();
};

module.exports = { getWorkerRecommendations, handleChatQuery };
