export interface User {
  user_id: string;
  email: string;
  username: string;
  displayName?: string;
  bio?: string;
  avatar_url?: string;
  slug: string;
}

export interface Track {
  id: string;
  title: string;
  description?: string;
  user_id: string;
  duration_seconds: number;
  cover_url?: string;
  stream_url: string;
}

export interface Playlist {
  id: string;
  title: string;
  description?: string;
  user_id: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  updateUser: (user: User) => void;
}

export interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  queue: Track[];
  play: (track: Track) => void;
  pause: () => void;
  resume: () => void;
  setVolume: (volume: number) => void;
  seek: (time: number) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  addToQueue: (track: Track) => void;
  setQueue: (tracks: Track[]) => void;
  playFromQueue: (index: number) => void;
  removeFromQueue: (trackId: string) => void;
  clearQueue: () => void;
  loop: boolean;
  toggleLoop: () => void;
}