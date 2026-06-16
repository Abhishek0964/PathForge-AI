import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - attach access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor - handle token refresh
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else if (token) resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    (window as any).isBackendOffline = false;
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Detect network / connection issues
    if (!error.response || error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      (window as any).isBackendOffline = true;
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post<{ accessToken: string }>('/auth/refresh-token');
        const { accessToken } = data;
        localStorage.setItem('accessToken', accessToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        // If in guest mode, don't force redirect
        if (localStorage.getItem('isGuest') !== 'true') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const message = (error.response?.data as { message?: string })?.message || 'Something went wrong';
    if (error.response?.status !== 401 && localStorage.getItem('isGuest') !== 'true') toast.error(message);
    return Promise.reject(error);
  }
);

export default api;
