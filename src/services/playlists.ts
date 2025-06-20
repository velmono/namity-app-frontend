import { api } from './api';
import { Playlist } from '../types';

export const playlistService = {
  async createPlaylist(title: string, description?: string): Promise<Playlist> {
    return api.post<Playlist>('/playlists/', {
      title,
      description,
    });
  },

  async getMyPlaylists(): Promise<Playlist[]> {
    return api.get<Playlist[]>('/playlists/');
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
    return api.get<{ playlist_id: string; track_id: string }[]>(`/playlists/${playlistId}/tracks`);
  },

  async searchPlaylists(query: string, limit = 10, offset = 0): Promise<Playlist[]> {
    const params = new URLSearchParams({
      query,
      limit: limit.toString(),
      offset: offset.toString(),
    });
    return api.get<Playlist[]>(`/playlists/search?${params}`);
  },

  async getPlaylistById(playlistId: string): Promise<Playlist> {
    return api.get<Playlist>(`/playlists/${playlistId}`);
  },
};