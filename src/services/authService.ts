import axios from 'axios';
import { API_URL } from '@/config';

// Создаем экземпляр axios
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

const authService = {
  async login(data: { email: string; password: string }) {
    const response = await axiosInstance.post('/api/auth/login', {
      email: data.email,
      password: data.password,
    });
    return response.data;
  },

  async register(data: { email: string; password: string }) {
    const response = await axiosInstance.post('/api/auth/register', {
      email: data.email,
      password: data.password,
    });
    return response.data;
  },

  async logout() {
    try {
      await axiosInstance.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      window.location.href = '/';
    }
  },

  async refreshToken() {
    try {
      const response = await axiosInstance.post('/api/auth/refresh');
      return response.data;
    } catch (error) {
      window.location.href = '/';
      return Promise.reject(error);
    }
  },
};

export default authService; 