// Бэкап исходного PlayerContext.tsx перед рефакторингом
// Скопируйте содержимое этого файла обратно в PlayerContext.tsx для отката

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
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [queue, setQueue] = useState<Track[]>(() => {
    try {
      const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      // ignore
    }
    return [];
  });
  const [currentIndex, setCurrentIndex] = useState(() => {
    try {
      const stored = localStorage.getItem(INDEX_STORAGE_KEY);
      const q = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (stored && q) {
        const idx = parseInt(stored, 10);
        const arr = JSON.parse(q);
        if (!isNaN(idx) && idx >= 0 && idx < arr.length) return idx;
      }
    } catch (e) {}
    return 0;
  });
  const prevIndexRef = useRef<number>(currentIndex);
  const [loop, setLoop] = useState(false);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => {
      console.log('Трек закончился, вызываю nextTrack');
      nextTrack();
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
  }, []);

  // Сохраняем очередь и индекс в localStorage при изменении
  useEffect(() => {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    } catch (e) {}
  }, [queue]);
  useEffect(() => {
    try {
      localStorage.setItem(INDEX_STORAGE_KEY, String(currentIndex));
    } catch (e) {}
  }, [currentIndex]);

  // Сброс currentIndex, если очередь изменилась и индекс вне диапазона
  useEffect(() => {
    if (queue.length === 0) {
      setCurrentIndex(0);
      setCurrentTrack(null);
      setIsPlaying(false);
    } else if (currentIndex >= queue.length) {
      setCurrentIndex(0);
      // НЕ меняем currentTrack и isPlaying
    }
  }, [queue]);

  // Вспомогательная функция для воспроизведения трека без изменения очереди и индекса
  const playRaw = (track: Track | undefined, idx?: number) => {
    if (!track || !audioRef.current) return;
    const logIndex = typeof idx === 'number' ? idx : queue.findIndex(t => t.id === track.id);
    console.log('playRaw', track.title, 'currentIndex:', logIndex);
    setCurrentTrack(track);
    audioRef.current.src = trackService.getStreamUrl(track.id);
    audioRef.current.play().then(() => {
      console.log('audio.play() resolved for', track.title);
    }).catch(console.error);
  };

  // useEffect для проигрывания трека только после обновления очереди и индекса
  useEffect(() => {
    console.log('[PlayerEffect] queue:', queue.map(t => t.title), 'currentIndex:', currentIndex, 'currentTrack:', currentTrack?.title, 'isPlaying:', isPlaying);
    if (
      isPlaying &&
      queue.length > 0 &&
      currentIndex >= 0 &&
      currentIndex < queue.length &&
      queue[currentIndex] &&
      (!currentTrack || currentTrack.id !== queue[currentIndex].id)
    ) {
      playRaw(queue[currentIndex], currentIndex);
    }
  }, [queue, currentIndex, isPlaying]);

  const play = (track: Track) => {
    setQueue(prevQueue => {
      const idx = prevQueue.findIndex(t => t.id === track.id);
      if (idx !== -1) {
        console.log('[QUEUE_CHANGE] play: setCurrentIndex', idx, prevQueue.map(t => t.title));
        setCurrentIndex(idx);
        setIsPlaying(true);
        return prevQueue;
      } else {
        console.log('[QUEUE_CHANGE] play: addToQueue', track.title, [...prevQueue.map(t => t.title), track.title]);
        setCurrentIndex(prevQueue.length);
        setIsPlaying(true);
        return [...prevQueue, track];
      }
    });
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const resume = () => {
    setIsPlaying(true);
  };

  const setVolume = (newVolume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setVolumeState(newVolume);
    }
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Централизованная функция перехода к треку по индексу
  const goToTrack = (index: number) => {
    if (index >= 0 && index < queue.length) {
      setCurrentIndex(index);
      setIsPlaying(true);
      prevIndexRef.current = index;
    } else {
      return;
    }
  };

  const playFromQueue = (index: number) => {
    goToTrack(index);
  };

  const nextTrack = () => {
    console.log('[nextTrack] before', { currentIndex, queue: queue.map(t => t.title), isPlaying, currentTrack: currentTrack?.title });
    if (queue.length === 0) {
      setIsPlaying(false);
      setCurrentTrack(null);
      return;
    }
    if (currentIndex + 1 < queue.length) {
      setCurrentIndex(currentIndex + 1);
      setIsPlaying(true);
      // НЕ сбрасываем currentTrack
    } else {
      setIsPlaying(false);
      setCurrentTrack(null);
    }
    console.log('[nextTrack] after', { currentIndex, queue: queue.map(t => t.title), isPlaying, currentTrack: currentTrack?.title });
  };

  const previousTrack = () => {
    if (queue.length > 0 && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsPlaying(true);
    }
  };

  const addToQueue = (track: Track) => {
    console.log('[QUEUE_CHANGE] addToQueue', track.title);
    setQueue(prev => [...prev, track]);
  };

  const setQueueTracks = (tracks: Track[]) => {
    console.log('[QUEUE_CHANGE] setQueueTracks', tracks.map(t => t.title));
    setQueue(tracks);
    setCurrentIndex(0);
  };

  const removeFromQueue = (trackId: string) => {
    setQueue(prev => {
      const idx = prev.findIndex(t => t.id === trackId);
      if (idx === -1) return prev;
      const newQueue = prev.filter(t => t.id !== trackId);
      console.log('[QUEUE_CHANGE] removeFromQueue', trackId, newQueue.map(t => t.title));
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
          goToTrack(currentIndex);
        }
      }
      setCurrentIndex(i => {
        if (i >= newQueue.length) {
          setCurrentTrack(null);
          setIsPlaying(false);
          return 0;
        }
        if (i < 0) return 0;
        return i;
      });
      return newQueue;
    });
  };

  const clearQueue = () => {
    console.log('[QUEUE_CHANGE] clearQueue');
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
