import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { User, Camera } from 'lucide-react';
import profileService from '@/services/profileService';

export const SettingsView: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Profile settings
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [slug, setSlug] = useState(user?.slug || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Password settings
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Проверяем, изменился ли slug и не пустой ли он
      const updatedData: { displayName: string; slug?: string } = {
        displayName,
      };

      // Добавляем slug только если он изменился и не пустой
      if (slug && slug !== user?.slug) {
        updatedData.slug = slug;
      }

      // Обновляем профиль
      const updatedProfile = await profileService.updateProfile(updatedData);

      // Если есть новая аватарка, загружаем её
      if (avatarFile) {
        await profileService.uploadAvatar(avatarFile);
      }

      // Обновляем состояние пользователя
      updateUser({
        ...user!,
        displayName: updatedProfile.displayName,
        slug: updatedProfile.slug,
      });

      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await profileService.updatePassword({
        currentPassword,
        newPassword,
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      toast({
        title: 'Password updated',
        description: 'Your password has been successfully updated.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update password. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 max-w-4xl mx-auto w-full space-y-8 p-6 pb-32">
        <h1 className="text-3xl font-bold text-white">Settings</h1>

        {/* Profile Settings */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-xl text-white">Profile Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={avatarPreview || user?.avatar_url} />
                      <AvatarFallback className="bg-purple-600 text-white text-2xl">
                        {user?.displayName?.charAt(0).toUpperCase() || <User className="w-8 h-8" />}
                      </AvatarFallback>
                    </Avatar>
                    <label
                      htmlFor="avatar-upload"
                      className="absolute bottom-0 right-0 p-1 bg-purple-600 rounded-full cursor-pointer hover:bg-purple-700"
                    >
                      <Camera className="w-4 h-4 text-white" />
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                    </label>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Upload a new profile picture</p>
                    <p className="text-xs text-gray-500">Recommended: Square image, max 2MB</p>
                  </div>
                </div>

                {/* Display Name */}
                <div className="space-y-2 mt-6">
                  <label className="text-sm font-medium text-gray-300">Display Name</label>
                  <Input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Enter your display name"
                  />
                </div>

                {/* Profile Slug */}
                <div className="space-y-2 mt-4">
                  <label className="text-sm font-medium text-gray-300">Profile URL</label>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400">namity.com/</span>
                    <Input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="your-profile-url"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>
          </form>
        </div>

        {/* Password Settings */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Password Settings</h2>
          <form onSubmit={handlePasswordUpdate} className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-xl text-white">Change Password</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Current Password</label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Enter your current password"
                  />
                </div>

                <div className="space-y-2 mt-4">
                  <label className="text-sm font-medium text-gray-300">New Password</label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Enter your new password"
                  />
                </div>

                <div className="space-y-2 mt-4">
                  <label className="text-sm font-medium text-gray-300">Confirm New Password</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Confirm your new password"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {isLoading ? 'Updating...' : 'Update Password'}
                </Button>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
};