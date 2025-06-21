import { api } from './api';
import { Track } from '../types';

function ensureArray<T>(data: any): T[] {
  return Array.isArray(data) ? data : [];
}

export const trackService = {
  async uploadTrack(title: string, file: File, description?: string): Promise<Track> {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);
    if (description) {
      formData.append('description', description);
    }
    return api.upload<Track>('/tracks/', formData);
  },

  async getMyTracks(): Promise<Track[]> {
    const data = await api.get<Track[]>('/tracks/');
    return ensureArray<Track>(data);
  },

  async searchTracks(query: string, limit = 10, offset = 0): Promise<Track[]> {
    const params = new URLSearchParams({
      query,
      limit: limit.toString(),
      offset: offset.toString(),
    });
    const data = await api.get<Track[]>(`/tracks/search?${params}`);
    return ensureArray<Track>(data);
  },

  async getRandomTracks(limit = 10, offset = 0): Promise<Track[]> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    const data = await api.get<Track[]>(`/tracks/random?${params}`);
    return ensureArray<Track>(data);
  },

  async getTrack(trackId: string): Promise<Track> {
    return api.get<Track>(`/tracks/${trackId}`);
  },

  async updateTrack(trackId: string, data: { title?: string; description?: string }): Promise<Track> {
    return api.put<Track>(`/tracks/${trackId}`, data);
  },

  async deleteTrack(trackId: string): Promise<void> {
    await api.delete(`/tracks/${trackId}`);
  },

  getStreamUrl(trackId: string): string {
    return `/api/tracks/${trackId}/stream`;
  },
};