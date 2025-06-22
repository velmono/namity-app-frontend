import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Track, PlayerContextType } from '../types';
import { trackService } from '../services/tracks';

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

const QUEUE_STORAGE_KEY = 'namity_player_queue';
const INDEX_STORAGE_KEY = 'namity_player_index';

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [queue, setQueue] = useState<Track[]>(() => {
    try {
      const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(INDEX_STORAGE_KEY);
      return stored ? parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  });
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loop, setLoop] = useState(false);

  // Сохраняем очередь и индекс в localStorage
  useEffect(() => {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
  }, [queue]);
  useEffect(() => {
    localStorage.setItem(INDEX_STORAGE_KEY, String(currentIndex));
  }, [currentIndex]);

  // Следим за изменением очереди и индекса, обновляем currentTrack
  useEffect(() => {
    if (queue.length === 0) {
      setCurrentTrack(null);
      setIsPlaying(false);
      setCurrentIndex(0);
    } else if (currentIndex >= 0 && currentIndex < queue.length) {
      setCurrentTrack(queue[currentIndex]);
    }
  }, [queue, currentIndex]);

  // --- refs для актуальных значений ---
  const queueRef = useRef(queue);
  const currentIndexRef = useRef(currentIndex);
  const isPlayingRef = useRef(isPlaying);

  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  // Инициализация audio
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (loop) {
        audio.currentTime = 0;
        audio.play();
      } else {
        // Используем актуальные значения из ref
        const queue = queueRef.current;
        const idx = currentIndexRef.current;
        if (queue.length === 0) return;
        if (idx + 1 < queue.length) {
          setCurrentIndex(idx + 1);
          setIsPlaying(true);
        } else {
          setIsPlaying(false);
          // Не сбрасываем индекс на 0, оставляем на последнем треке
        }
      }
    };
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, [loop]);

  // Воспроизведение трека при изменении currentTrack
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    audio.src = trackService.getStreamUrl(currentTrack.id);
  }, [currentTrack]);

  // Управление play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Управление громкостью — отдельный эффект
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Воспроизведение трека при изменении currentTrack, если isPlaying
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    }
  }, [currentTrack, isPlaying]);

  const play = (track?: Track) => {
    if (track) {
      const idx = queue.findIndex(t => t.id === track.id);
      if (idx !== -1) {
        setCurrentIndex(idx);
      } else {
        setQueue(prev => {
          const newQueue = [...prev, track];
          setCurrentIndex(newQueue.length - 1);
          return newQueue;
        });
      }
    }
    setIsPlaying(true);
  };

  const pause = () => setIsPlaying(false);
  const resume = () => setIsPlaying(true);

  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // nextTrack теперь использует ref
  const nextTrack = () => {
    setCurrentIndex(prevIndex => {
      const queue = queueRef.current;
      if (queue.length === 0) {
        setIsPlaying(false);
        setCurrentTrack(null);
        return 0;
      }
      if (prevIndex + 1 < queue.length) {
        setIsPlaying(true);
        return prevIndex + 1;
      } else {
        setIsPlaying(false);
        setCurrentTrack(null);
        // Не сбрасываем индекс на 0, оставляем на последнем треке
        return prevIndex;
      }
    });
  };

  const previousTrack = () => {
    if (queue.length === 0) return;
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsPlaying(true);
    }
  };

  const addToQueue = (track: Track) => {
    setQueue(prev => [...prev, track]);
  };

  const setQueueTracks = (tracks: Track[]) => {
    setQueue(tracks);
    setCurrentIndex(0);
  };

  const playFromQueue = (index: number) => {
    if (index >= 0 && index < queue.length) {
      setCurrentIndex(index);
      setIsPlaying(true);
    }
  };

  const removeFromQueue = (trackId: string) => {
    setQueue(prev => {
      const idx = prev.findIndex(t => t.id === trackId);
      if (idx === -1) return prev;
      const newQueue = prev.filter(t => t.id !== trackId);
      if (newQueue.length === 0) {
        setCurrentIndex(0);
        setCurrentTrack(null);
        setIsPlaying(false);
        return newQueue;
      }
      if (idx < currentIndex) {
        setCurrentIndex(i => Math.max(0, i - 1));
      } else if (idx === currentIndex) {
        if (currentIndex >= newQueue.length) {
          setCurrentTrack(null);
          setIsPlaying(false);
        } else {
          setCurrentIndex(currentIndex);
        }
      }
      return newQueue;
    });
  };

  const clearQueue = () => {
    setQueue([]);
    setCurrentIndex(0);
    setCurrentTrack(null);
    setIsPlaying(false);
  };

  const toggleLoop = () => setLoop(l => !l);

  const value: PlayerContextType = {
    currentTrack,
    isPlaying,
    volume,
    currentTime,
    duration,
    queue,
    play,
    pause,
    resume,
    setVolume,
    seek,
    nextTrack,
    previousTrack,
    addToQueue,
    setQueue: setQueueTracks,
    playFromQueue,
    removeFromQueue,
    clearQueue,
    loop,
    toggleLoop,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
};