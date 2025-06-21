import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { TrackCard } from '@/components/tracks/TrackCard';
import { playlistService } from '@/services/playlists';
import { trackService } from '@/services/tracks';
import { Playlist, Track } from '../../types';
import { useToast } from '@/hooks/use-toast';
import { usePlayer } from '../../contexts/PlayerContext';

export const PlaylistView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { setQueue } = usePlayer();

  useEffect(() => {
    if (!id) return;
    const fetchPlaylist = async () => {
      try {
        setIsLoading(true);
        // Получаем плейлист по id (теперь можно смотреть чужие)
        const playlist = await playlistService.getPlaylistById(id);
        setPlaylist(playlist);
        // Получаем id треков
        const playlistTracks = await playlistService.getPlaylistTracks(id);
        // Получаем полные данные по каждому треку
        const tracksData = await Promise.all(
          playlistTracks.map(async (pt) => {
            try {
              return await trackService.getTrack(pt.track_id);
            } catch {
              return null;
            }
          })
        );
        setTracks(tracksData.filter(Boolean) as Track[]);
      } catch (error) {
        toast({
          title: 'Failed to load playlist',
          description: 'Please try again later',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlaylist();
  }, [id, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="flex items-center justify-center h-64 text-white text-xl">
        Playlist not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold text-white mb-2">{playlist.title}</h1>
          {playlist.description && <p className="text-gray-400 mb-4">{playlist.description}</p>}
          {tracks.length > 0 && (
            <button
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition mb-2"
              onClick={() => setQueue(tracks)}
            >
              Play Playlist
            </button>
          )}
        </CardContent>
      </Card>
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Tracks</h2>
        {Array.isArray(tracks) && tracks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Array.isArray(tracks) ? tracks : []).map((track) => (
              <TrackCard key={track.id} track={track} />
            ))}
          </div>
        ) : (
          <div className="text-gray-400 text-center py-8">No tracks in this playlist yet</div>
        )}
      </div>
    </div>
  );
};