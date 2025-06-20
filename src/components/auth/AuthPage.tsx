import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

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

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleMode = () => setIsLogin(!isLogin);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
      <div className="flex flex-col min-w-[350px] max-w-[420px] min-h-[500px] space-y-8 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 rounded-2xl shadow-xl p-8">
        {/* Logo */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">NAMITY</h1>
          <p className="text-gray-400">Discover and share amazing music</p>
        </div>

        {/* Auth form */}
        {isLogin ? (
          <LoginForm onToggleMode={toggleMode} />
        ) : (
          <RegisterForm onToggleMode={toggleMode} />
        )}
      </div>
    </div>
  );
};