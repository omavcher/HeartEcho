import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE from '../config/api';

const apiClient = axios.create({
  baseURL: API_BASE.Url,
  timeout: 30000,
});

// Attach JWT token to every request
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('heartecho_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Auth ───────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  register: (data) => apiClient.post('/auth/register', data),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  verifyOTP: (email, otp) => apiClient.post('/auth/verify-otp', { email, otp }),
};

// ─── User ────────────────────────────────────────────────────────────────────
export const userAPI = {
  getProfile: () => apiClient.get('/user/profile'),
  updateProfile: (data) => apiClient.put('/user/profile', data),
  getUsers: () => apiClient.get('/user/all'),
  searchUsers: (query) => apiClient.get(`/user/search?q=${query}`),
};

// ─── AI / Bots ───────────────────────────────────────────────────────────────
export const botsAPI = {
  getChats: () => apiClient.get('/bots/chats'),
  getChatById: (chatId) => apiClient.get(`/bots/chat/${chatId}`),
  sendMessage: (chatId, message) =>
    apiClient.post(`/bots/chat/${chatId}/message`, { message }),
  createChat: (botId) => apiClient.post('/bots/create', { botId }),
  deleteChat: (chatId) => apiClient.delete(`/bots/chat/${chatId}`),
  getBotList: () => apiClient.get('/bots/list'),
};

// ─── AI (Gemini/Groq) ────────────────────────────────────────────────────────
export const aiAPI = {
  sendAIMessage: (data) => apiClient.post('/ai/chat', data),
};

// ─── Stories / Status ────────────────────────────────────────────────────────
export const storyAPI = {
  getStories: () => apiClient.get('/story/all'),
  getMyStory: () => apiClient.get('/story/mine'),
  createStory: (data) => apiClient.post('/story/create', data),
};

export const statusAPI = {
  getStatuses: () => apiClient.get('/status/all'),
  createStatus: (data) => apiClient.post('/status/create', data),
  viewStatus: (statusId) => apiClient.post(`/status/${statusId}/view`),
};

// ─── Live Story ───────────────────────────────────────────────────────────────
export const liveStoryAPI = {
  getAll: () => apiClient.get('/live-story/all'),
  getById: (id) => apiClient.get(`/live-story/${id}`),
  create: (data) => apiClient.post('/live-story/create', data),
};

export default apiClient;
