import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request automatically
api.interceptors.request.use((config) => {
  const token = Cookies.get('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh token on 401
// Auto-refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        const refreshToken = Cookies.get('refreshToken');
        if (!refreshToken) {
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // ✅ Body mein bhejo
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefresh } = response.data;
        Cookies.set('accessToken', accessToken, { expires: 1 });
        Cookies.set('refreshToken', newRefresh, { expires: 7 });

        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch {
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);

// ── Auth API ──────────────────────────────────────
export const authApi = {
  register: (data: {
    companyName: string;
    email: string;
    password: string;
  }) => api.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  logout: () => api.post('/auth/logout'),

  getMe: () => api.get('/auth/me'),
};

// ── Knowledge API ─────────────────────────────────
export const knowledgeApi = {
  list: () => api.get('/knowledge'),

  upload: (formData: FormData) =>
    api.post('/knowledge/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  addText: (data: { name: string; type: string; textContent: string }) =>
    api.post('/knowledge/text', data),

  getStatus: (id: string) => api.get(`/knowledge/${id}/status`),

  delete: (id: string) => api.delete(`/knowledge/${id}`),
};

// ── Chat API ──────────────────────────────────────
export const chatApi = {
  sendMessage: (
    apiKey: string,
    message: string,
    sessionId: string,
  ) =>
    api.post(
      '/chat/message',
      { message, sessionId },
      { headers: { 'x-api-key': apiKey } },
    ),
};