import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PlayerProvider } from './contexts/PlayerContext';
import { AuthPage } from './components/auth/AuthPage';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { AudioPlayer } from './components/player/AudioPlayer';
import { HomePage } from './components/views/HomePage';
import { TracksView } from './components/views/TracksView';
import { SearchView } from './components/views/SearchView';
import { TrackUpload } from './components/tracks/TrackUpload';
import { PlaylistsView } from './components/views/PlaylistsView';
import { SettingsView } from '@/components/views/SettingsView';
import { ProfileView } from '@/components/views/ProfileView';
import { PlaylistView } from './components/views/PlaylistView';
import './App.css';
import './index.css';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center w-full">
        <AuthPage />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 w-full overflow-hidden">
      <Header onSearch={handleSearch} searchQuery={searchQuery} />
      <div className="flex">
        <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] z-30 bg-gray-900 border-r border-gray-800">
          <Sidebar />
        </aside>
        <main className="ml-64 w-[calc(100vw-16rem)] pb-24 h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="p-6">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/tracks" element={<TracksView />} />
              <Route path="/search" element={<SearchView initialQuery={searchQuery} />} />
              <Route path="/upload" element={<TrackUpload onUploadComplete={() => navigate('/tracks')} />} />
              <Route path="/playlists" element={<PlaylistsView />} />
              <Route path="/playlists/:id" element={<PlaylistView />} />
              <Route path="/settings" element={<SettingsView />} />
              <Route path="/profile/:slug" element={<ProfileView />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
        <div className="fixed left-64 bottom-0 right-0 h-24 z-40">
          <AudioPlayer />
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <PlayerProvider>
          <AppContent />
          <Toaster />
        </PlayerProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;