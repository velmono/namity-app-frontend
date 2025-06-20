import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Music, PlusCircle, Library } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/tracks', icon: Music, label: 'Tracks' },
    { path: '/playlists', icon: Library, label: 'Playlists' },
  ];

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 p-4">
      <nav className="space-y-2">
        {navItems.map(({ path, icon: Icon, label }) => (
          <Link
            key={path}
            to={path}
            className={cn(
              'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors',
              isActive(path)
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            )}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-8">
        <Link to="/upload">
          <Button
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Upload Track
          </Button>
        </Link>
      </div>
    </aside>
  );
};