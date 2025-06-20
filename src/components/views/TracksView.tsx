import React, { useEffect, useState } from 'react';
import { Music, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TrackCard } from '../tracks/TrackCard';
import { TrackUpload } from '../tracks/TrackUpload';
import { Track } from '../../types';
import { trackService } from '../../services/tracks';
import { useToast } from '../../hooks/use-toast';

export const TracksView: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadTracks();
  }, []);

  const loadTracks = async () => {
    try {
      setIsLoading(true);
      const userTracks = await trackService.getMyTracks();
      setTracks(userTracks);
    } catch (error) {
      console.error('Failed to load tracks:', error);
      toast({
        title: 'Failed to load tracks',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadComplete = () => {
    setShowUpload(false);
    loadTracks();
  };

  const handleDeleteTrack = async (track: Track) => {
    try {
      await trackService.deleteTrack(track.id);
      setTracks(tracks.filter(t => t.id !== track.id));
      toast({
        title: 'Track deleted',
        description: 'The track has been removed from your library',
      });
    } catch (error) {
      console.error('Failed to delete track:', error);
      toast({
        title: 'Failed to delete track',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  if (showUpload) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Upload Track</h1>
          <Button
            variant="outline"
            onClick={() => setShowUpload(false)}
            className="border-gray-600 text-gray-300 hover:text-white"
          >
            Cancel
          </Button>
        </div>
        <TrackUpload onUploadComplete={handleUploadComplete} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Your Tracks</h1>
        <Button
          onClick={() => setShowUpload(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Upload Track
        </Button>
      </div>

      {tracks.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {tracks.map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              onDelete={handleDeleteTrack}
              showActions={true}
            />
          ))}
        </div>
      ) : (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-12 text-center">
            <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No tracks yet</h3>
            <p className="text-gray-400 mb-6">
              Upload your first track to get started
            </p>
            <Button
              onClick={() => setShowUpload(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Upload Your First Track
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};