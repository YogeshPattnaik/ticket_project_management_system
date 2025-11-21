import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getServiceUrl, isApiGatewayMode, getApiGatewayUrl } from './service-router';

// Get API Gateway URL if enabled, otherwise use dynamic routing
const getApiBaseUrl = (): string | null => {
  // Check if API Gateway mode is enabled
  if (isApiGatewayMode()) {
    console.log('isApiGatewayMode', isApiGatewayMode());
    console.log('isApiGatewayUrl', getApiGatewayUrl());
    return getApiGatewayUrl();
  }
  
  // In dynamic routing mode, baseURL will be set per request
  return null;
};

const API_BASE_URL = getApiBaseUrl();

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL || undefined, // Will be set dynamically per request if not using gateway
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and route to correct service
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Dynamic service routing (only if not using API Gateway)
    if (!API_BASE_URL && config.url) {
      // Get the full URL (baseURL + url)
      const fullUrl = config.baseURL 
        ? `${config.baseURL}${config.url.startsWith('/') ? config.url : `/${config.url}`}`
        : config.url;
      
      // Get the correct service URL based on the path
      const serviceBaseUrl = getServiceUrl(fullUrl);
      
      console.log('=== API CLIENT: Routing request ===');
      console.log('Original URL:', config.url);
      console.log('Full URL:', fullUrl);
      console.log('Service Base URL:', serviceBaseUrl);
      
      // Update baseURL for this request
      config.baseURL = serviceBaseUrl;
      
      // Ensure URL is relative
      if (config.url.startsWith('http')) {
        try {
          const urlObj = new URL(config.url);
          config.url = urlObj.pathname + urlObj.search;
        } catch {
          // Invalid URL, keep as is
        }
      }
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
          // Use dynamic routing for refresh endpoint
          const refreshServiceUrl = getServiceUrl('/api/v1/auth/refresh');
          const response = await axios.post(`${refreshServiceUrl}/api/v1/auth/refresh`, {
            refreshToken,
          });
          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);
          if (error.config) {
            error.config.headers.Authorization = `Bearer ${accessToken}`;
            return apiClient.request(error.config);
          }
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
