import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('sa_accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('sa_accessToken');
      Cookies.remove('sa_refreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getOrganizations: (params?: {
    page?: number;
    search?: string;
  }) => api.get('/admin/organizations', { params }),
  getOrganization: (id: string) =>
    api.get(`/admin/organizations/${id}`),
  suspend: (id: string) =>
    api.post(`/admin/organizations/${id}/suspend`),
  activate: (id: string) =>
    api.post(`/admin/organizations/${id}/activate`),
  delete: (id: string) =>
    api.delete(`/admin/organizations/${id}`),
};