import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Music, PlusCircle, Library } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { path: '/', icon: Home, label: t('home') },
    { path: '/tracks', icon: Music, label: t('tracks') },
    { path: '/playlists', icon: Library, label: t('playlists') },
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
            {t('upload_track')}
          </Button>
        </Link>
      </div>
      <div className="absolute left-0 bottom-0 w-full p-4">
        <div className="flex gap-2 justify-center">
          <button onClick={() => i18n.changeLanguage('ru')} className="px-2 py-1 bg-gray-700 text-white rounded">RU</button>
          <button onClick={() => i18n.changeLanguage('en')} className="px-2 py-1 bg-gray-700 text-white rounded">EN</button>
        </div>
      </div>
    </aside>
  );
};