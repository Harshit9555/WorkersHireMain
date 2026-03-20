import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FaPaperPlane, FaRobot, FaUser } from 'react-icons/fa';

const AIChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I\'m the WorkersHire AI Assistant. I can help you find the right worker, suggest pricing, and answer your questions. How can I help you today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (!user) {
      toast.error('Please login to use AI Chat');
      return;
    }

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/ai/query', { message: input });
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      toast.error('AI service unavailable');
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting. Please try again later.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    'I need an electrician in New York',
    'What\'s the average price for a plumber?',
    'Recommend a painter under $35/hr',
    'How do I book a carpenter?',
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <FaRobot className="text-purple-600 text-3xl" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800">AI Assistant</h1>
        <p className="text-gray-500 mt-1">Get instant worker recommendations powered by AI</p>
      </div>

      {/* Chat Window */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        {/* Messages */}
        <div className="h-96 overflow-y-auto p-5 space-y-4 bg-gray-50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start gap-2 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' ? 'bg-blue-500' : 'bg-purple-500'
                }`}>
                  {msg.role === 'user' ? <FaUser className="text-white text-xs" /> : <FaRobot className="text-white text-xs" />}
                </div>
                <div className={`px-4 py-3 rounded-2xl text-sm ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-white text-gray-800 shadow-sm rounded-tl-none border border-gray-100'
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                  <FaRobot className="text-white text-xs" />
                </div>
                <div className="bg-white shadow-sm border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-none">
                  <div className="flex space-x-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="px-5 py-3 border-t border-gray-100 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => setInput(s)}
                className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1.5 rounded-full hover:bg-purple-100 transition"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={user ? 'Ask me anything about workers...' : 'Please login to use AI chat'}
            disabled={!user || loading}
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-gray-50"
          />
          <button
            type="submit"
            disabled={!user || loading || !input.trim()}
            className="bg-purple-600 text-white px-5 py-2.5 rounded-xl hover:bg-purple-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            <FaPaperPlane />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIChat;
