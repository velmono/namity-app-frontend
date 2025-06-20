import React, { useState } from 'react';
import { Search, User, Music, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onSearch: (query: string) => void;
  searchQuery: string;
}

const Logo = () => (
  <svg width="64" height="64" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="gradient-7" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="16%" style={{ stopColor: 'rgb(116, 105, 203)' }} />
        <stop offset="77.4%" style={{ stopColor: 'rgb(66, 49, 209)' }} />
      </linearGradient>
    </defs>
    <g>
      <rect x="241.5" y="145" width="17" height="210" fill="url(#gradient-7)" />
      <rect x="276.191" y="186" width="17" height="128" fill="url(#gradient-7)" />
      <rect x="308.289" y="225" width="17" height="50" fill="url(#gradient-7)" />
      <rect x="206.967" y="186" width="17" height="128" fill="url(#gradient-7)" />
      <rect x="174.468" y="225" width="17" height="50" fill="url(#gradient-7)" />
      <rect x="143.774" y="241.5" width="17" height="17" fill="url(#gradient-7)" />
      <rect x="338.769" y="239.983" width="17" height="17" fill="url(#gradient-7)" />
    </g>
  </svg>
);

export const Header: React.FC<HeaderProps> = ({ onSearch, searchQuery }) => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex items-center space-x-4">
              <Logo />
              <span className="text-3xl font-bold text-white">NAMITY</span>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search tracks, artists, playlists..."
                className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2 focus:outline-none"
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={user?.avatar_url} />
                <AvatarFallback className="bg-purple-600 text-white">
                  {user?.displayName?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
                </AvatarFallback>
              </Avatar>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5">
                <div className="py-1" role="menu" aria-orientation="vertical">
                  <button
                    onClick={() => {
                      navigate(`/profile/${user?.slug}`);
                      setIsProfileOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                    role="menuitem"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      navigate('/settings');
                      setIsProfileOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                    role="menuitem"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </button>
                  <button
                    onClick={logout}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                    role="menuitem"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};