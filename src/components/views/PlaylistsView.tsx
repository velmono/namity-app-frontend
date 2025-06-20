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

export const PlaylistsView: React.FC = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

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
        title: 'Failed to load playlists',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistTitle.trim()) {
      toast({
        title: 'Title is required',
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
        title: 'Playlist created',
        description: 'Your new playlist has been created',
      });
    } catch (error) {
      console.error('Failed to create playlist:', error);
      toast({
        title: 'Failed to create playlist',
        description: 'Please try again',
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
        <h1 className="text-2xl font-bold text-white">Your Playlists</h1>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Playlist
        </Button>
      </div>

      {playlists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlists.map((playlist) => (
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
            <h3 className="text-xl font-semibold text-white mb-2">No playlists yet</h3>
            <p className="text-gray-400 mb-6">Create your first playlist to get started</p>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Playlist
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Playlist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-white">Title</Label>
              <Input
                id="title"
                value={newPlaylistTitle}
                onChange={(e) => setNewPlaylistTitle(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Enter playlist title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">Description (optional)</Label>
              <Textarea
                id="description"
                value={newPlaylistDescription}
                onChange={(e) => setNewPlaylistDescription(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Enter playlist description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsCreateDialogOpen(false)}
              className="text-gray-300 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreatePlaylist}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 