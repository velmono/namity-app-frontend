import React, { useEffect, useState } from 'react';
import { ListMusic, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Playlist } from '../../types';
import { playlistService } from '../../services/playlists';
import { useToast } from '../../hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const PlaylistsView: React.FC = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    try {
      setIsLoading(true);
      const userPlaylists = await playlistService.getMyPlaylists();
      setPlaylists(userPlaylists);
    } catch (error) {
      console.error('Failed to load playlists:', error);
      toast({
        title: t('failed_load_playlists'),
        description: t('loading'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistTitle.trim()) {
      toast({
        title: t('title_required'),
        variant: 'destructive',
      });
      return;
    }

    try {
      const newPlaylist = await playlistService.createPlaylist(newPlaylistTitle, newPlaylistDescription);
      setPlaylists([...playlists, newPlaylist]);
      setIsCreateDialogOpen(false);
      setNewPlaylistTitle('');
      setNewPlaylistDescription('');
      toast({
        title: t('playlist_created'),
        description: t('playlist_created_desc'),
      });
    } catch (error) {
      console.error('Failed to create playlist:', error);
      toast({
        title: t('failed_create_playlist'),
        description: t('loading'),
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">{t('your_playlists')}</h1>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('create_playlist')}
        </Button>
      </div>

      {Array.isArray(playlists) && playlists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(Array.isArray(playlists) ? playlists : []).map((playlist) => (
            <Card
              key={playlist.id}
              className="bg-gray-800 border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors"
              onClick={() => navigate(`/playlists/${playlist.id}`)}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                    <ListMusic className="w-6 h-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-white font-medium truncate">{playlist.title}</h3>
                    {playlist.description && (
                      <p className="text-gray-500 text-sm truncate mt-1">{playlist.description}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-12 text-center">
            <ListMusic className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">{t('no_playlists')}</h3>
            <p className="text-gray-400 mb-6">{t('create_first_playlist')}</p>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('create_playlist')}
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">{t('create_playlist')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-white">{t('title')}</Label>
              <Input
                id="title"
                value={newPlaylistTitle}
                onChange={(e) => setNewPlaylistTitle(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder={t('enter_playlist_title')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">{t('description_optional')}</Label>
              <Textarea
                id="description"
                value={newPlaylistDescription}
                onChange={(e) => setNewPlaylistDescription(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder={t('enter_playlist_description')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsCreateDialogOpen(false)}
              className="text-gray-300 hover:text-white"
            >
              {t('cancel')}
            </Button>
            <Button
              onClick={handleCreatePlaylist}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {t('create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};