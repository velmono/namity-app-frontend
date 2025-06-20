import { api } from './api';
import { User } from '../types';

export const profileService = {
  async getMyProfile(): Promise<User> {
    return api.get<User>('/profiles/me');
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    return api.put<User>('/profiles/me', {
      username: data.username,
      bio: data.bio,
    });
  },

  async uploadAvatar(file: File): Promise<User> {
    const formData = new FormData();
    formData.append('file', file);
    return api.upload<User>('/profiles/me/avatar', formData);
  },

  async searchProfiles(query: string, limit = 10, offset = 0): Promise<User[]> {
    const params = new URLSearchParams({
      query,
      limit: limit.toString(),
      offset: offset.toString(),
    });
    return api.get<User[]>(`/profiles/search?${params}`);
  },

  async getRandomProfiles(limit = 10, offset = 0): Promise<User[]> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    return api.get<User[]>(`/profiles/random?${params}`);
  },

  async getProfileBySlug(slug: string): Promise<User> {
    return api.get<User>(`/profiles/${slug}`);
  },

  async getProfileByUserId(userId: string): Promise<User> {
    const profile = await api.get<any>(`/profiles/user/${userId}`);
    // Преобразуем snake_case в camelCase
    return {
      ...profile,
      displayName: profile.display_name ?? profile.displayName,
      avatar_url: profile.avatar_url ?? profile.avatarUrl,
    };
  },
};