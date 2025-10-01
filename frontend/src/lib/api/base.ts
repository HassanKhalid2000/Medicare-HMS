import axios from 'axios';
import { getSession } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Log the error for debugging
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
    });

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Try to refresh token or redirect to login
      const session = await getSession();
      if (!session) {
        window.location.href = '/auth/signin';
        return Promise.reject(error);
      }
    }

    // Enhanced error object with more details
    const enhancedError = new Error(
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred'
    );

    enhancedError.name = 'APIError';
    (enhancedError as any).status = error.response?.status;
    (enhancedError as any).url = error.config?.url;
    (enhancedError as any).method = error.config?.method;

    return Promise.reject(enhancedError);
  }
);

export default api;