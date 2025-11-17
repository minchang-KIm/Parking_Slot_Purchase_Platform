import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
};

// Parking Space API
export const parkingSpaceAPI = {
  getAll: (params) => api.get('/parking-spaces', { params }),
  getOne: (id) => api.get(`/parking-spaces/${id}`),
  create: (data) => api.post('/parking-spaces', data),
  update: (id, data) => api.put(`/parking-spaces/${id}`, data),
  delete: (id) => api.delete(`/parking-spaces/${id}`),
  getMy: () => api.get('/parking-spaces/my/spaces'),
};

// Booking API
export const bookingAPI = {
  getAll: (params) => api.get('/bookings', { params }),
  getOne: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post('/bookings', data),
  cancel: (id, reason) => api.put(`/bookings/${id}/cancel`, { reason }),
  confirm: (id) => api.put(`/bookings/${id}/confirm`),
  getMySpaceBookings: () => api.get('/bookings/my-spaces/bookings'),
};

// Payment API
export const paymentAPI = {
  getAll: (params) => api.get('/payments', { params }),
  getOne: (id) => api.get(`/payments/${id}`),
  create: (data) => api.post('/payments', data),
  complete: (id, data) => api.put(`/payments/${id}/complete`, data),
  refund: (id, reason) => api.put(`/payments/${id}/refund`, { reason }),
};

// Review API
export const reviewAPI = {
  create: (data) => api.post('/reviews', data),
  getParkingSpaceReviews: (parkingSpaceId, params) =>
    api.get(`/reviews/parking-space/${parkingSpaceId}`, { params }),
  getMy: () => api.get('/reviews/my'),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
  markHelpful: (id) => api.put(`/reviews/${id}/helpful`),
  addResponse: (id, text) => api.put(`/reviews/${id}/response`, { text }),
};

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getParkingSpaces: (params) => api.get('/admin/parking-spaces', { params }),
  updateSpaceStatus: (id, isActive) => api.put(`/admin/parking-spaces/${id}/status`, { isActive }),
  getBookings: (params) => api.get('/admin/bookings', { params }),
  getPayments: (params) => api.get('/admin/payments', { params }),
  updateReviewVisibility: (id, isVisible) => api.put(`/admin/reviews/${id}/visibility`, { isVisible }),
};

export default api;
