import axios, { AxiosInstance } from 'axios';

// Get API URL - supports multiple environments
const getApiBaseUrl = (): string => {
  // Check for Vite environment variable
  try {
    if (typeof (globalThis as any).import !== 'undefined' && (globalThis as any).import.meta && (globalThis as any).import.meta.env) {
      const viteUrl = (globalThis as any).import.meta.env.VITE_API_URL || (globalThis as any).import.meta.env.NEXT_PUBLIC_API_URL;
      if (viteUrl) return viteUrl;
    }
  } catch (e) {
    // Ignore
  }
  
  // Check for Next.js / Node.js environment variable
  if (typeof process !== 'undefined' && process.env) {
    const nextUrl = process.env.NEXT_PUBLIC_API_URL;
    if (nextUrl) return nextUrl;
  }
  
  // Check for browser global (set via script tag or window)
  if (typeof window !== 'undefined') {
    const windowUrl = (window as any).__API_URL__ || (window as any).__ENV__?.API_URL;
    if (windowUrl) return windowUrl;
  }
  
  // Default fallback - point to auth service for now
  // In production, this should be an API Gateway
  return 'http://localhost:3001';
};

const API_BASE_URL = getApiBaseUrl();

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, try to refresh
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
            refreshToken,
          });
          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);
          error.config.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient.request(error.config);
        } catch (refreshError) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      }
    }
    return Promise.reject(error);
  }
);
