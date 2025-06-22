import React, { useEffect, useState } from 'react';
import { Play, Pause, MoreHorizontal, Clock, User, ListMusic, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import { Track, Playlist } from '../../types';
import { usePlayer } from '../../contexts/PlayerContext';
import { playlistService } from '../../services/playlists';
import { useToast } from '../../hooks/use-toast';
import { Link } from 'react-router-dom';
import { profileService } from '../../services/profiles';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface TrackCardProps {
  track: Track;
  onAddToPlaylist?: (track: Track) => void;
  onDelete?: (track: Track) => void;
  showActions?: boolean;
}

export const TrackCard: React.FC<TrackCardProps> = ({ 
  track, 
  onDelete, 
  showActions = true 
}) => {
  const { currentTrack, isPlaying, play, addToQueue } = usePlayer();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const { toast } = useToast();
  const { t } = useTranslation();
  const { user } = useAuth();
  const isCurrentTrack = currentTrack?.id === track.id;
  const [author, setAuthor] = useState<{ displayName?: string; slug: string } | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(track.title);
  const [editDescription, setEditDescription] = useState(track.description || '');

  useEffect(() => {
    profileService.getProfileByUserId(track.user_id)
      .then(profile => setAuthor({ displayName: profile.displayName, slug: profile.slug }))
      .catch(() => setAuthor(null));
  }, [track.user_id]);

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    try {
      const userPlaylists = await playlistService.getMyPlaylists();
      setPlaylists(userPlaylists);
    } catch (error) {
      console.error('Failed to load playlists:', error);
      toast({
        title: 'Failed to load playlists',
        description: 'Please try again later',
        variant: 'destructive',
      });
    }
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    try {
      await playlistService.addTrackToPlaylist(playlistId, track.id);
      toast({
        title: 'Track added to playlist',
        description: 'The track has been added to your playlist',
      });
    } catch (error: any) {
      let message = 'Failed to add track to playlist';
      if (error && error.response && error.response.data && error.response.data.detail) {
        message = error.response.data.detail;
      } else if (error && error.message) {
        message = error.message;
      }
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const handlePlayPause = () => {
    play(track);
  };

  const handleAddToQueue = () => {
    addToQueue(track);
    toast({
      title: 'Added to queue',
      description: `Track "${track.title}" added to play queue`,
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleEdit = () => {
    setEditTitle(track.title);
    setEditDescription(track.description || '');
    setIsEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    try {
      await import('../../services/tracks').then(({ trackService }) =>
        trackService.updateTrack(track.id, { title: editTitle, description: editDescription })
      );
      setIsEditDialogOpen(false);
      toast({ title: t('track_updated'), description: t('track_updated_desc') });
    } catch {
      toast({ title: t('error'), description: t('failed_update_track'), variant: 'destructive' });
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors group">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">
                  {track.title.charAt(0).toUpperCase()}
                </span>
              </div>
              <Button
                variant="ghost"
                className="absolute inset-0 w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 hover:bg-black/70 rounded-lg transition-opacity"
                onClick={handlePlayPause}
                tabIndex={0}
              >
                {isCurrentTrack && isPlaying ? (
                  <Pause className="h-6 w-6 text-white" />
                ) : (
                  <Play className="h-6 w-6 text-white ml-0.5" />
                )}
              </Button>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-white font-medium truncate">{track.title}</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <User className="h-3 w-3" />
                {author ? (
                  <Link
                    to={`/profile/${author.slug}`}
                    className="hover:text-purple-400 transition-colors truncate"
                  >
                    {author.displayName || 'Anonymous'}
                  </Link>
                ) : (
                  <span>Anonymous</span>
                )}
              </div>
              {track.description && (
                <p className="text-gray-500 text-sm truncate mt-1">{track.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-gray-400 text-sm">
              <Clock className="h-3 w-3" />
              <span>{formatDuration(track.duration_seconds)}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-purple-400 hover:text-white"
              onClick={handleAddToQueue}
              title="Add to queue"
            >
              <Plus className="h-5 w-5" />
            </Button>
            
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="w-full text-left bg-gray-800 text-white hover:bg-gray-700 px-3 py-2 rounded-md flex items-center gap-2">
                      <Plus className="w-4 h-4 mr-1 text-purple-400" /> {t('add_to_playlist')}
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="bg-gray-800 text-white p-1 min-w-[200px]">
                      {playlists.length === 0 ? (
                        <div className="flex flex-col items-center py-4">
                          <ListMusic className="w-6 h-6 text-gray-500 mb-2" />
                          <span className="text-gray-400 text-sm">No playlists found</span>
                        </div>
                      ) : (
                        playlists.map((playlist) => (
                          <DropdownMenuItem
                            key={playlist.id}
                            onClick={() => handleAddToPlaylist(playlist.id)}
                            className="flex items-center gap-2 bg-gray-800 text-white hover:bg-purple-700 focus:bg-purple-700 rounded px-3 py-2 transition-colors"
                          >
                            <ListMusic className="w-4 h-4 text-purple-400" />
                            <span className="truncate">{playlist.title}</span>
                          </DropdownMenuItem>
                        ))
                      )}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  {/* Кнопка редактирования только для владельца */}
                  {user && user.user_id === track.user_id && (
                    <DropdownMenuItem onClick={handleEdit} className="text-blue-400">
                      {t('edit_track')}
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem onClick={() => onDelete(track)} className="text-red-400" aria-label={t('delete')}>
                      {t('delete')}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardContent>

      {/* Модальное окно редактирования трека */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white mb-2">{t('edit_track')}</DialogTitle>
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
    </Card>
  );
};