import React from 'react';
import { Track } from '@/types/index';
import { TrackItem } from './TrackItem';

interface TrackListProps {
  tracks: Track[];
}

export const TrackList: React.FC<TrackListProps> = ({ tracks }) => {
  return (
    <div className="space-y-2">
      {tracks.map((track) => (
        <TrackItem key={track.id} track={track} />
      ))}
    </div>
  );
};