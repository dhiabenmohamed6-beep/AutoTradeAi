import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password) => api.post('/auth/register', { name, email, password }),
  getMe: () => api.get('/auth/me')
};

export const analysisAPI = {
  analyze: (formData) => api.post('/analysis/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getHistory: () => api.get('/analysis/history'),
  deleteAnalysis: (id) => api.delete(`/analysis/history/${id}`)
};

export const subscriptionAPI = {
  create: (data) => api.post('/subscription/create', data),
  getStatus: () => api.get('/subscription/status'),
  checkAccess: () => api.get('/subscription/check-access')
};

export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getStats: () => api.get('/admin/stats'),
  getAnalyses: () => api.get('/admin/analyses'),
  getContacts: () => api.get('/admin/contacts'),
  markContactRead: (id) => api.put(`/admin/contacts/${id}/read`),
  getPendingSubscriptions: () => api.get('/admin/subscriptions/pending'),
  approveSubscription: (id) => api.put(`/admin/subscriptions/${id}/approve`),
  rejectSubscription: (id) => api.put(`/admin/subscriptions/${id}/reject`)
};

export const contactAPI = {
  submit: (data) => api.post('/contact/submit', data)
};

export const supportAPI = {
  createTicket: (data) => api.post('/support', data),
  getUserTickets: () => api.get('/support/my-tickets'),
  getAllTickets: () => api.get('/support/all'),
  replyToTicket: (id, data) => api.post(`/support/${id}/reply`, data),
  closeTicket: (id) => api.put(`/support/${id}/close`)
};

export default api;
