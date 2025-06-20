import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthContextType } from '../types';
import { authService } from '../services/auth';
import { profileService } from '../services/profiles';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const profile = await profileService.getMyProfile();
        setUser(profile);
      } catch (error) {
        // Если не авторизован, пробуем refresh
        try {
          await authService.refresh();
          const profile = await profileService.getMyProfile();
          setUser(profile);
        } catch {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const user = await authService.login({ email, password });
    setUser(user);
  };

  const register = async (email: string, password: string) => {
    try {
      await authService.register({ email, password });
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      // Перенаправляем на страницу аутентификации
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Даже при ошибке очищаем состояние и перенаправляем
      setUser(null);
      window.location.href = '/';
    }
  };

  const updateUser = (userData: Partial<User>) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      return { ...prevUser, ...userData };
    });
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    loading,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};