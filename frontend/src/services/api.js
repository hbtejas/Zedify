import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('zedify_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('zedify_user');
      localStorage.removeItem('zedify_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ──────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (email, password) => api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me'),
};

// ─── Users ─────────────────────────────────────────────────────────────────
export const userAPI = {
  getProfile: (id) => api.get(`/users/${id}`),
  updateProfile: (formData) => api.put('/users/update', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  followUser: (userId) => api.post('/users/follow', { userId }),
  rateUser: (userId, value) => api.post('/users/rate', { userId, value }),
  searchUsers: (q) => api.get(`/users/search?q=${q}`),
  getSuggestions: () => api.get('/users/suggestions'),
  getNotifications: () => api.get('/users/notifications'),
  markNotificationsRead: () => api.put('/users/notifications/read'),
};

// ─── Posts ─────────────────────────────────────────────────────────────────
export const postAPI = {
  createPost: (formData) => api.post('/posts/create', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getFeed: (page = 1) => api.get(`/posts/feed?page=${page}`),
  getAIFeed: (page = 1) => api.get(`/posts/ai-feed?page=${page}`),
  getUserPosts: (userId, page = 1) => api.get(`/posts/user/${userId}?page=${page}`),
  likePost: (postId) => api.post('/posts/like', { postId }),
  commentPost: (postId, text) => api.post('/posts/comment', { postId, text }),
  deletePost: (id) => api.delete(`/posts/${id}`),
  getPost: (id) => api.get(`/posts/${id}`),
};

// ─── Chat ──────────────────────────────────────────────────────────────────
export const chatAPI = {
  getConversations: () => api.get('/chat/conversations'),
  getConversation: (userId, page = 1) => api.get(`/chat/${userId}?page=${page}`),
  sendMessage: (receiverId, message) => api.post('/chat/send', { receiverId, message }),
};

// ─── Video ─────────────────────────────────────────────────────────────────
export const videoAPI = {
  createSession: (skillName, description) => api.post('/video/create-session', { skillName, description }),
  getSession: (id) => api.get(`/video/session/${id}`),
  joinSession: (id) => api.post(`/video/join/${id}`),
  requestToJoin: (id) => api.post(`/video/request/${id}`),
  approveParticipant: (id, userId) => api.post(`/video/approve/${id}`, { userId }),
  endSession: (id) => api.put(`/video/end/${id}`),
  getActiveSessions: () => api.get('/video/sessions'),
};

// ─── Exchange ──────────────────────────────────────────────────────────────
export const exchangeAPI = {
  sendExchange: (data) => api.post('/exchange/send', data),
  respondExchange: (exchangeId, action) => api.put('/exchange/respond', { exchangeId, action }),
  getMyExchanges: () => api.get('/exchange/my'),
  completeExchange: (id) => api.put(`/exchange/complete/${id}`),
};

export default api;
