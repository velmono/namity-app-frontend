import React, { useEffect, useState } from 'react';
import { Music, Shuffle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { TrackCard } from '../tracks/TrackCard';
import { Track } from '../../types';
import { trackService } from '../../services/tracks';
import { useToast } from '../../hooks/use-toast';
import { useTranslation } from 'react-i18next';

export const HomePage: React.FC = () => {
  const [randomTracks, setRandomTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    const loadRandomTracks = async () => {
      try {
        setIsLoading(true);
        const tracks = await trackService.getRandomTracks(12);
        setRandomTracks(tracks);
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

    loadRandomTracks();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-8 text-white">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Music className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">{t('home_banner_title')}</h1>
            <p className="text-white/90">{t('home_banner_subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Featured Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/*
        <Card className="bg-gradient-to-br from-blue-600 to-purple-600 border-0 text-white">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-8 h-8" />
              <div>
                <h3 className="font-bold text-lg">Trending Now</h3>
                <p className="text-white/80">Latest popular tracks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        */}
        <Card className="bg-gradient-to-br from-green-600 to-teal-600 border-0 text-white">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Shuffle className="w-8 h-8" />
              <div>
                <h3 className="font-bold text-lg">{t('home_discover_title')}</h3>
                <p className="text-white/80">{t('home_discover_subtitle')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-600 to-red-600 border-0 text-white">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Music className="w-8 h-8" />
              <div>
                <h3 className="font-bold text-lg">{t('your_music')}</h3>
                <p className="text-white/80">{t('personal_collection')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Random Tracks */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">{t('discover_new_music')}</h2>
        {randomTracks.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {randomTracks.map((track) => (
              <TrackCard key={track.id} track={track} showActions={true} />
            ))}
          </div>
        ) : (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-8 text-center">
              <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">{t('no_tracks_available')}</p>
              <p className="text-gray-500 text-sm mt-2">{t('be_first_upload')}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};