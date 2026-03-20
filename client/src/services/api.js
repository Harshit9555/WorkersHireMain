import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
};

export const workerAPI = {
  getWorkers: (params) => api.get('/api/workers', { params }),
  getWorkerById: (id) => api.get(`/api/workers/${id}`),
  getCategories: () => api.get('/api/workers/categories'),
  createWorker: (data) => api.post('/api/workers', data),
};

export const bookingAPI = {
  createBooking: (data) => api.post('/api/bookings', data),
  getBookings: () => api.get('/api/bookings'),
  getBookingById: (id) => api.get(`/api/bookings/${id}`),
  updateStatus: (id, status) => api.put(`/api/bookings/${id}/status`, { status }),
  cancelBooking: (id) => api.put(`/api/bookings/${id}/cancel`),
};

export const paymentAPI = {
  createPaymentIntent: (bookingId) => api.post('/api/payments/create-intent', { bookingId }),
  verifyPayment: (data) => api.post('/api/payments/verify', data),
  getHistory: () => api.get('/api/payments/history'),
};

export const aiAPI = {
  query: (message) => api.post('/api/ai/query', { message }),
  getRecommendations: (category) => api.get('/api/ai/recommendations', { params: { category } }),
};

export default api;
