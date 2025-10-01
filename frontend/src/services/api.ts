import { getSession } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface RequestOptions extends RequestInit {
  body?: any;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  // Add auth token if available from NextAuth session
  if (typeof window !== 'undefined') {
    try {
      const session = await getSession();
      if (session && (session as any).accessToken) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${(session as any).accessToken}`,
        };
        console.log('API call with token for user:', session.user?.email);
      } else {
        console.warn('No session or access token available for API call');
      }
    } catch (error) {
      console.error('Error getting session for API call:', error);
    }
  }

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `HTTP error! status: ${response.status}`,
        response.status,
        errorData
      );
    }

    // Handle empty responses (like 204 No Content for DELETE)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null as any;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error occurred',
      0
    );
  }
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, data?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'POST', body: data }),

  put: <T>(endpoint: string, data?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'PUT', body: data }),

  patch: <T>(endpoint: string, data?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'PATCH', body: data }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};

export { ApiError };