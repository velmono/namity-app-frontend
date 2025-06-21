import { api } from './api';
import { Playlist } from '../types';

function ensureArray<T>(data: any): T[] {
  return Array.isArray(data) ? data : [];
}

export const playlistService = {
  async createPlaylist(title: string, description?: string): Promise<Playlist> {
    return api.post<Playlist>('/playlists/', {
      title,
      description,
    });
  },

  async getMyPlaylists(): Promise<Playlist[]> {
    const data = await api.get<Playlist[]>('/playlists/');
    return ensureArray<Playlist>(data);
  },

  async updatePlaylist(playlistId: string, data: { title?: string; description?: string }): Promise<Playlist> {
    return api.put<Playlist>(`/playlists/${playlistId}`, data);
  },

  async deletePlaylist(playlistId: string): Promise<void> {
    await api.delete(`/playlists/${playlistId}`);
  },

  async addTrackToPlaylist(playlistId: string, trackId: string): Promise<{ playlist_id: string; track_id: string }> {
    return api.post(`/playlists/${playlistId}/tracks`, { track_id: trackId });
  },

  async removeTrackFromPlaylist(playlistId: string, trackId: string): Promise<void> {
    await api.delete(`/playlists/${playlistId}/tracks/${trackId}`);
  },

  async getPlaylistTracks(playlistId: string): Promise<{ playlist_id: string; track_id: string }[]> {
    const data = await api.get<{ playlist_id: string; track_id: string }[]>(`/playlists/${playlistId}/tracks`);
    return ensureArray<{ playlist_id: string; track_id: string }>(data);
  },

  async searchPlaylists(query: string, limit = 10, offset = 0): Promise<Playlist[]> {
    const params = new URLSearchParams({
      query,
      limit: limit.toString(),
      offset: offset.toString(),
    });
    const data = await api.get<Playlist[]>(`/playlists/search?${params}`);
    return ensureArray<Playlist>(data);
  },

  async getPlaylistById(playlistId: string): Promise<Playlist> {
    return api.get<Playlist>(`/playlists/${playlistId}`);
  },
};