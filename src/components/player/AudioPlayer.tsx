import React, { useEffect, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Shuffle, Repeat, ListMusic, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { usePlayer } from '../../contexts/PlayerContext';
import { profileService } from '../../services/profiles';
import { Link } from 'react-router-dom';
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from '@/components/ui/dialog';

export const AudioPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    volume,
    currentTime,
    duration,
    play,
    pause,
    resume,
    setVolume,
    seek,
    nextTrack,
    previousTrack,
    queue,
    playFromQueue,
    removeFromQueue,
    clearQueue,
    loop,
    toggleLoop,
  } = usePlayer();

  const [isMuted, setIsMuted] = useState(false);
  const [author, setAuthor] = useState<{ displayName?: string; slug: string } | null>(null);
  const [queueOpen, setQueueOpen] = useState(false);
  const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleMute = () => {
    if (isMuted) {
      setVolume(0.5);
      setIsMuted(false);
    } else {
      setVolume(0);
      setIsMuted(true);
    }
  };

  const handleSeek = (value: number[]) => {
    seek(value[0]);
  };

  useEffect(() => {
    if (currentTrack?.user_id) {
      profileService.getProfileByUserId(currentTrack.user_id)
        .then((profile: { display_name?: string; slug: string }) => setAuthor({ displayName: profile.display_name, slug: profile.slug }))
        .catch(() => setAuthor(null));
    } else {
      setAuthor(null);
    }
  }, [currentTrack?.user_id]);

  if (!currentTrack) {
    return null;
  }

  return (
    <div className="bg-gray-900 border-t border-gray-800 p-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Track info */}
        <div className="flex items-center space-x-4 min-w-0 flex-1">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {currentTrack ? currentTrack.title.charAt(0).toUpperCase() : ''}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-white font-medium truncate">{currentTrack ? currentTrack.title : ''}</p>
            <div className="text-gray-400 text-sm truncate flex items-center space-x-1">
              <span>by</span>
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
          </div>
        </div>

        {/* Player controls */}
        <div className="flex flex-col items-center space-y-2 flex-1 max-w-md">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:text-purple-300"
              onClick={previousTrack}
            >
              <SkipBack className="h-5 w-5" />
            </Button>
            <Button
              variant={loop ? "secondary" : "ghost"}
              size="sm"
              className={loop ? "text-purple-400 bg-purple-900" : "text-white hover:text-purple-300"}
              onClick={toggleLoop}
              title={loop ? "Отключить повтор очереди" : "Включить повтор очереди"}
            >
              <Repeat className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:text-purple-300 bg-white/20 hover:bg-white/30 rounded-full w-10 h-10 shadow"
              onClick={isPlaying ? pause : resume}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:text-purple-300"
              onClick={nextTrack}
            >
              <SkipForward className="h-5 w-5" />
            </Button>
            <Dialog open={queueOpen} onOpenChange={setQueueOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-purple-400 hover:text-white ml-2"
                  title="Show queue"
                >
                  <ListMusic className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md w-full bg-gray-900 border border-gray-700">
                <DialogTitle className="mb-2 text-purple-400">Play Queue</DialogTitle>
                {queue.length > 0 && (
                  <div className="flex items-center justify-between mb-2 px-1">
                    <span className="text-xs text-gray-400">{queue.length} track{queue.length > 1 ? 's' : ''} in queue</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex items-center gap-2 px-3 py-1 text-white bg-red-600 hover:bg-red-700 rounded shadow"
                      onClick={clearQueue}
                      title="Clear queue"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Clear queue</span>
                    </Button>
                  </div>
                )}
                {queue.length === 0 ? (
                  <div className="text-gray-400 text-sm">Queue is empty</div>
                ) : (
                  <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
                    {queue.map((track, idx) => (
                      <div key={track.id} className="flex items-center group">
                        <button
                          className={`flex-1 text-left px-2 py-1 rounded transition-colors truncate ${idx === currentIndex ? 'bg-purple-700 text-white font-semibold' : 'hover:bg-gray-700 text-gray-200'}`}
                          onClick={() => { playFromQueue(idx); setQueueOpen(false); }}
                          disabled={idx === currentIndex}
                          title={track.title}
                        >
                          {track.title}
                        </button>
                        <button
                          className="ml-2 p-1 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeFromQueue(track.id)}
                          title="Remove from queue"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>

          {/* Progress bar */}
          <div className="flex items-center space-x-2 w-full">
            <span className="text-xs text-white/80 w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <div className="flex-1">
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                className="w-full"
                onValueChange={handleSeek}
              />
            </div>
            <span className="text-xs text-white/80 w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume control */}
        <div className="flex items-center space-x-2 flex-1 justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:text-purple-300"
            onClick={handleMute}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </Button>
          <div className="w-24">
            <Slider
              value={[volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};