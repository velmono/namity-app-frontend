import axios from 'axios';
import { API_BASE } from '@/config';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Создаем экземпляр axios
const axiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const config: RequestInit = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.text();
      throw new ApiError(response.status, error || 'Request failed');
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  },

  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new ApiError(response.status, error || 'Upload failed');
    }

    return response.json();
  },

  get: <T>(url: string) => axiosInstance.get<T>(url).then(response => response.data),

  post: <T>(url: string, data?: any) => axiosInstance.post<T>(url, data).then(response => response.data),

  put: <T>(url: string, data?: any) => axiosInstance.put<T>(url, data).then(response => response.data),

  delete: <T>(url: string) => axiosInstance.delete<T>(url).then(response => response.data),
};