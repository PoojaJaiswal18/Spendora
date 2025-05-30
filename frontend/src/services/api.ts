import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'react-toastify';


const API_CONFIG = {
  DEV_BASE_URL: 'http://localhost:8080/api',
  PROD_BASE_URL: 'https://your-production-api.com/api',
  
  get isDevelopment() {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.hostname.includes('dev');
  },
  
  get baseURL() {
    return this.isDevelopment ? this.DEV_BASE_URL : this.PROD_BASE_URL;
  }
};


declare module 'axios' {
  interface AxiosRequestConfig {
    metadata?: {
      startTime?: Date;
      [key: string]: any;
    };
  }
  
  interface InternalAxiosRequestConfig {
    metadata?: {
      startTime?: Date;
      [key: string]: any;
    };
  }
}


interface ApiErrorResponse {
  message?: string;
  code?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  status?: number;
}


const api = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    
    config.metadata = { startTime: new Date() };
    
  
    const token = localStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (API_CONFIG.isDevelopment) {
      console.log(`🚀 Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    if (API_CONFIG.isDevelopment) {
      console.error('❌ Request Error:', error);
    }
    return Promise.reject(error);
  }
);


api.interceptors.response.use(
  (response: AxiosResponse) => {
 
    const endTime = new Date();
    const duration = response.config.metadata?.startTime 
      ? endTime.getTime() - response.config.metadata.startTime.getTime()
      : 0;
    
    if (API_CONFIG.isDevelopment) {
      console.log(`✅ Response: ${response.status} ${response.config.url} (${duration}ms)`);
    }
    
    return response;
  },
  (error: AxiosError<ApiErrorResponse>) => {
 
    const endTime = new Date();
    const duration = error.config?.metadata?.startTime 
      ? endTime.getTime() - error.config.metadata.startTime.getTime()
      : 0;
    
 
    if (API_CONFIG.isDevelopment) {
      console.error(`❌ Response Error: ${error.response?.status} ${error.config?.url} (${duration}ms)`);
    }
    
 
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          toast.error(data?.message || 'Bad request. Please check your input.');
          break;
        case 401:
          toast.error('Session expired. Please login again.');
      
          localStorage.removeItem('authToken');
          window.location.href = '/login';
          break;
        case 403:
          toast.error('Access denied. You do not have permission to perform this action.');
          break;
        case 404:
          toast.error('Resource not found.');
          break;
        case 422:
       
          if (data?.errors && Array.isArray(data.errors)) {
            data.errors.forEach((err) => {
              toast.error(`${err.field}: ${err.message}`);
            });
          } else {
            toast.error(data?.message || 'Validation failed.');
          }
          break;
        case 429:
          toast.error('Too many requests. Please try again later.');
          break;
        case 500:
          toast.error('Server error. Please try again later.');
          break;
        default:
          toast.error(data?.message || 'An unexpected error occurred.');
      }
    } else if (error.request) {
     
      toast.error('Network error. Please check your internet connection.');
    } else {
      
      toast.error('Request failed. Please try again.');
    }
    
    return Promise.reject(error);
  }
);


export const apiUtils = {
  
  async get<T>(url: string, config?: any): Promise<T> {
    try {
      const response = await api.get<T>(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async post<T>(url: string, data?: any, config?: any): Promise<T> {
    try {
      const response = await api.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async put<T>(url: string, data?: any, config?: any): Promise<T> {
    try {
      const response = await api.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  
  async patch<T>(url: string, data?: any, config?: any): Promise<T> {
    try {
      const response = await api.patch<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async delete<T>(url: string, config?: any): Promise<T> {
    try {
      const response = await api.delete<T>(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async upload<T>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void,
    additionalData?: Record<string, any>
  ): Promise<T> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
     
      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }

      const response = await api.post<T>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(progress);
          }
        },
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async download(url: string, filename?: string): Promise<void> {
    try {
      const response = await api.get(url, {
        responseType: 'blob',
      });

     
      const blob = new Blob([response.data]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename || 'download';
      
     
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      
      window.URL.revokeObjectURL(link.href);
    } catch (error) {
      throw error;
    }
  },

  setAuthToken(token: string): void {
    localStorage.setItem('authToken', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  removeAuthToken(): void {
    localStorage.removeItem('authToken');
    delete api.defaults.headers.common['Authorization'];
  },

  getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  },

  
  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  },
};

export default api;
