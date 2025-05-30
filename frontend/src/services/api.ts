import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { toast } from 'react-toastify';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
const API_TIMEOUT = 30000; // 30 seconds

// Request/Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

// Create axios instance with default configuration
const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  // Request interceptor
  instance.interceptors.request.use(
    (config: AxiosRequestConfig) => {
      // Add authentication token
      const token = localStorage.getItem('authToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add request timestamp for debugging
      config.metadata = { startTime: new Date() };

      // Log request in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
          data: config.data,
          params: config.params,
        });
      }

      return config;
    },
    (error: AxiosError) => {
      console.error('❌ Request Error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      // Calculate request duration
      const endTime = new Date();
      const startTime = response.config.metadata?.startTime;
      const duration = startTime ? endTime.getTime() - startTime.getTime() : 0;

      // Log response in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`, {
          status: response.status,
          data: response.data,
        });
      }

      return response;
    },
    (error: AxiosError) => {
      const { response, request, config } = error;

      // Handle different error scenarios
      if (response) {
        // Server responded with error status
        const apiError: ApiError = {
          message: response.data?.message || 'An error occurred',
          status: response.status,
          code: response.data?.code,
          details: response.data,
        };

        // Handle specific status codes
        switch (response.status) {
          case 401:
            // Unauthorized - clear token and redirect to login
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            toast.error('Session expired. Please log in again.');
            break;
          case 403:
            toast.error('Access denied. You do not have permission to perform this action.');
            break;
          case 404:
            toast.error('Resource not found.');
            break;
          case 422:
            // Validation errors
            const validationErrors = response.data?.errors || [];
            if (validationErrors.length > 0) {
              validationErrors.forEach((err: string) => toast.error(err));
            } else {
              toast.error(apiError.message);
            }
            break;
          case 429:
            toast.error('Too many requests. Please try again later.');
            break;
          case 500:
            toast.error('Internal server error. Please try again later.');
            break;
          default:
            toast.error(apiError.message);
        }

        console.error(`❌ API Error: ${config?.method?.toUpperCase()} ${config?.url}`, apiError);
        return Promise.reject(apiError);
      } else if (request) {
        // Network error
        const networkError: ApiError = {
          message: 'Network error. Please check your connection.',
          status: 0,
        };
        toast.error(networkError.message);
        console.error('❌ Network Error:', networkError);
        return Promise.reject(networkError);
      } else {
        // Request setup error
        const setupError: ApiError = {
          message: 'Request configuration error.',
          status: 0,
        };
        console.error('❌ Setup Error:', setupError);
        return Promise.reject(setupError);
      }
    }
  );

  return instance;
};

// Create API instance
const api = createApiInstance();

// Utility functions for common API operations
export const apiUtils = {
  // Generic GET request
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await api.get<ApiResponse<T>>(url, config);
    return response.data.data;
  },

  // Generic POST request
  post: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await api.post<ApiResponse<T>>(url, data, config);
    return response.data.data;
  },

  // Generic PUT request
  put: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await api.put<ApiResponse<T>>(url, data, config);
    return response.data.data;
  },

  // Generic PATCH request
  patch: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await api.patch<ApiResponse<T>>(url, data, config);
    return response.data.data;
  },

  // Generic DELETE request
  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await api.delete<ApiResponse<T>>(url, config);
    return response.data.data;
  },

  // Upload file with progress
  upload: async <T>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void,
    additionalData?: Record<string, any>
  ): Promise<T> => {
    const formData = new FormData();
    formData.append('file', file);

    // Add additional data to form
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, typeof value === 'string' ? value : JSON.stringify(value));
      });
    }

    const response = await api.post<ApiResponse<T>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data.data;
  },

  // Download file
  download: async (url: string, filename?: string): Promise<void> => {
    const response = await api.get(url, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },
};

// Authentication utilities
export const authUtils = {
  setToken: (token: string): void => {
    localStorage.setItem('authToken', token);
  },

  getToken: (): string | null => {
    return localStorage.getItem('authToken');
  },

  removeToken: (): void => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('authToken');
  },
};

export default api;

