import React, { useEffect, useState } from 'react';
import { Music, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TrackCard } from '../tracks/TrackCard';
import { TrackUpload } from '../tracks/TrackUpload';
import { Track } from '../../types';
import { trackService } from '../../services/tracks';
import { useToast } from '../../hooks/use-toast';
import { useTranslation } from 'react-i18next';

export const TracksView: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useTranslation();

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
        title: t('failed_load_tracks'),
        description: t('loading'),
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
        title: t('track_deleted'),
        description: t('track_removed'),
      });
    } catch (error) {
      console.error('Failed to delete track:', error);
      toast({
        title: t('failed_delete_track'),
        description: t('loading'),
        variant: 'destructive',
      });
    }
  };

  if (showUpload) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">{t('upload_track')}</h1>
          <Button
            variant="outline"
            onClick={() => setShowUpload(false)}
            className="border-gray-600 text-gray-300 hover:text-white"
          >
            {t('cancel')}
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
        <h1 className="text-2xl font-bold text-white">{t('your_tracks')}</h1>
        <Button
          onClick={() => setShowUpload(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('upload_track')}
        </Button>
      </div>

      {Array.isArray(tracks) && tracks.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {(Array.isArray(tracks) ? tracks : []).map((track) => (
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
            <h3 className="text-xl font-semibold text-white mb-2">{t('no_tracks')}</h3>
            <p className="text-gray-400 mb-6">
              {t('upload_first_track')}
            </p>
            <Button
              onClick={() => setShowUpload(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('upload_track')}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};