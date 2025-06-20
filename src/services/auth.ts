import { api } from './api';
import { User } from '../types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  message: string;
}

export const authService = {
  async login(credentials: LoginRequest): Promise<User> {
    await api.post('/auth/login', credentials);
    return api.get<User>('/profiles/me');
  },

  async register(data: RegisterRequest): Promise<void> {
    await api.post('/auth/register', data);
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async refresh(): Promise<User> {
    await api.post('/auth/refresh');
    return api.get<User>('/profiles/me');
  },

  async changePassword(old_password: string, new_password: string): Promise<void> {
    await api.post('/auth/password/change', {
      old_password,
      new_password,
    });
  },
};