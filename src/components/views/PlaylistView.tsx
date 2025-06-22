import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { TrackCard } from '@/components/tracks/TrackCard';
import { playlistService } from '@/services/playlists';
import { trackService } from '@/services/tracks';
import { Playlist, Track } from '../../types';
import { useToast } from '@/hooks/use-toast';
import { usePlayer } from '../../contexts/PlayerContext';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '../../contexts/AuthContext';

export const PlaylistView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const { toast } = useToast();
  const { setQueue } = usePlayer();
  const { t } = useTranslation();
  const { user } = useAuth();

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

  // --- удаление трека из плейлиста ---
  const handleRemoveTrack = async (track: Track) => {
    if (!id) return;
    try {
      await playlistService.removeTrackFromPlaylist(id, track.id);
      setTracks((prev) => prev.filter((t) => t.id !== track.id));
      toast({ title: t('track_removed_from_playlist'), description: t('track_removed_from_playlist_desc') });
    } catch {
      toast({ title: t('error'), description: t('failed_delete_track'), variant: 'destructive' });
    }
  };

  const handleEdit = () => {
    setEditTitle(playlist?.title || '');
    setEditDescription(playlist?.description || '');
    setIsEditDialogOpen(true);
  };
  const handleEditSave = async () => {
    if (!id) return;
    try {
      const updated = await playlistService.updatePlaylist(id, { title: editTitle, description: editDescription });
      setPlaylist(updated);
      setIsEditDialogOpen(false);
      toast({ title: t('edit_playlist'), description: t('profile_updated_desc') });
    } catch {
      toast({ title: t('error'), description: t('failed_update_profile'), variant: 'destructive' });
    }
  };
  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };
  const handleDeleteConfirm = async () => {
    if (!id) return;
    try {
      await playlistService.deletePlaylist(id);
      setIsDeleteDialogOpen(false);
      toast({ title: t('playlist_deleted'), description: t('playlist_deleted_desc') });
      // TODO: редирект или обновление списка
    } catch {
      toast({ title: t('error'), description: t('failed_delete_playlist'), variant: 'destructive' });
    }
  };

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
        <CardContent className="p-6 relative">
          <h1 className="text-2xl font-bold text-white mb-2">{playlist.title}</h1>
          {playlist.description && <p className="text-gray-400 mb-4">{playlist.description}</p>}
          {tracks.length > 0 && (
            <button
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition mb-2"
              onClick={() => setQueue(tracks)}
            >
              {t('play_playlist')}
            </button>
          )}
          {/* Кнопки справа снизу только для владельца */}
          {user && user.user_id === playlist.user_id && (
            <div className="absolute right-6 bottom-6 flex gap-2">
              <Button variant="secondary" onClick={handleEdit}>{t('edit')}</Button>
              <Button variant="destructive" onClick={handleDelete}>{t('delete')}</Button>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Модальное окно редактирования */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white mb-2">{t('edit_playlist')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Label className="text-white">{t('title')}</Label>
            <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="bg-gray-700 border-gray-600 text-white" />
            <Label className="text-white">{t('description_optional')}</Label>
            <Textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} className="bg-gray-700 border-gray-600 text-white" />
          </div>
          <DialogFooter className="mt-6 flex gap-2 justify-end">
            <Button onClick={handleEditSave} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">{t('save')}</Button>
            <DialogClose asChild>
              <Button variant="secondary" className="bg-gray-700 text-white">{t('cancel')}</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Модальное окно подтверждения удаления */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white mb-2">{t('delete_playlist')}</DialogTitle>
          </DialogHeader>
          <div className="mb-4 text-gray-300">{t('delete_playlist_confirm')}</div>
          <DialogFooter className="mt-6 flex gap-2 justify-end">
            <Button variant="destructive" onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700 text-white">{t('delete')}</Button>
            <DialogClose asChild>
              <Button variant="secondary" className="bg-gray-700 text-white">{t('cancel')}</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">{t('playlist_tracks')}</h2>
        {Array.isArray(tracks) && tracks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Array.isArray(tracks) ? tracks : []).map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                onDelete={user && user.user_id === playlist.user_id ? handleRemoveTrack : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="text-gray-400 text-center py-8">No tracks in this playlist yet</div>
        )}
      </div>
    </div>
  );
};