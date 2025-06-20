import React from 'react';
import { Track } from '@/types/track';
import { Play, Pause } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';

interface TrackItemProps {
  track: Track;
}

export const TrackItem: React.FC<TrackItemProps> = ({ track }) => {
  const { currentTrack, isPlaying, play, pause } = usePlayer();

  const isCurrentTrack = currentTrack?.id === track.id;

  const handlePlayPause = () => {
    if (isCurrentTrack) {
      if (isPlaying) {
        pause();
      } else {
        play(track as any);
      }
    } else {
      play(track as any);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
      onClick={handlePlayPause}
    >
      <div className="w-12 h-12 relative">
        <img
          src={track.cover_url || '/default-cover.png'}
          alt={track.title}
          className="w-full h-full object-cover rounded"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded opacity-0 hover:opacity-100 transition-opacity">
          {isCurrentTrack && isPlaying ? (
            <Pause className="w-6 h-6 text-white" />
          ) : (
            <Play className="w-6 h-6 text-white" />
          )}
        </div>
      </div>
      <div className="flex-1">
        <h3 className="text-white font-medium">{track.title}</h3>
        <p className="text-gray-400 text-sm">{track.artist}</p>
      </div>
      <div className="text-gray-400 text-sm">
        {formatDuration(track.duration)}
      </div>
    </div>
  );
};