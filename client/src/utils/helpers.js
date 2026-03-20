import React from 'react';

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
}

export function formatDate(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export function formatDateTime(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function getStatusColor(status) {
  const map = {
    pending: 'text-yellow-700 bg-yellow-100',
    confirmed: 'text-blue-700 bg-blue-100',
    completed: 'text-green-700 bg-green-100',
    cancelled: 'text-red-700 bg-red-100',
    paid: 'text-purple-700 bg-purple-100',
  };
  return map[(status || '').toLowerCase()] || 'text-gray-700 bg-gray-100';
}

export function getStatusBadge(status) {
  const colorClass = getStatusColor(status);
  return React.createElement(
    'span',
    { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}` },
    (status || 'unknown').charAt(0).toUpperCase() + (status || 'unknown').slice(1)
  );
}

export function getCategoryIcon(category) {
  const map = {
    painter: '🎨',
    electrician: '⚡',
    plumber: '🔧',
    carpenter: '🪚',
    cleaner: '🧹',
    gardener: '🌱',
    mechanic: '🔩',
    mason: '🧱',
    hvac: '❄️',
    locksmith: '🔑',
    pest: '🐛',
    mover: '📦',
    default: '🛠️',
  };
  const key = (category || '').toLowerCase();
  for (const [k, v] of Object.entries(map)) {
    if (key.includes(k)) return v;
  }
  return map.default;
}
