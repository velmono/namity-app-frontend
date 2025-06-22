import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { User, Camera } from 'lucide-react';
import profileService from '@/services/profileService';
import { useTranslation } from 'react-i18next';

export const SettingsView: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  // Profile settings
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [slug, setSlug] = useState(user?.slug || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Password settings
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  React.useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || user.username || '');
      setSlug(user.slug || '');
      setBio(user.bio || '');
    }
  }, [user]);

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
      const updatedData: { displayName: string; profileSlug?: string; bio?: string } = {
        displayName,
        bio,
      };
      if (slug && slug !== user?.slug) {
        updatedData.profileSlug = slug;
      }
      const updatedProfile = await profileService.updateProfile(updatedData);
      if (avatarFile) {
        await profileService.uploadAvatar(avatarFile);
      }
      updateUser({
        ...user!,
        displayName: updatedProfile.displayName,
        slug: updatedProfile.slug,
        bio: updatedProfile.bio,
      });
      toast({
        title: t('profile_updated'),
        description: t('profile_updated_desc'),
      });
    } catch (error) {
      toast({
        title: t('error'),
        description: t('failed_update_profile'),
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
        title: t('error'),
        description: t('passwords_do_not_match'),
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
        title: t('password_updated'),
        description: t('password_updated_desc'),
      });
    } catch (error) {
      toast({
        title: t('error'),
        description: t('failed_update_password'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 max-w-4xl mx-auto w-full space-y-8 p-6 pb-32">
        <h1 className="text-3xl font-bold text-white">{t('settings_title')}</h1>

        {/* Profile Settings */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">{t('profile_settings')}</h2>
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-xl text-white">{t('profile_settings')}</CardTitle>
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
                    <p className="text-sm text-gray-400">{t('upload_new_avatar')}</p>
                    <p className="text-xs text-gray-500">{t('avatar_hint')}</p>
                  </div>
                </div>

                {/* Display Name */}
                <div className="space-y-2 mt-6">
                  <label className="text-sm font-medium text-gray-300">{t('display_name')}</label>
                  <Input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder={t('display_name_placeholder')}
                  />
                </div>

                {/* Profile Slug */}
                <div className="space-y-2 mt-4">
                  <label className="text-sm font-medium text-gray-300">{t('profile_url')}</label>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400">namity.com/</span>
                    <Input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder={t('profile_url_placeholder')}
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2 mt-4">
                  <label className="text-sm font-medium text-gray-300">{t('bio_label')}</label>
                  <Input
                    type="text"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder={t('bio_placeholder')}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {isLoading ? t('saving') : t('save_changes')}
                </Button>
              </CardContent>
            </Card>
          </form>
        </div>

        {/* Password Settings */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">{t('password_settings')}</h2>
          <form onSubmit={handlePasswordUpdate} className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-xl text-white">{t('change_password')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">{t('current_password')}</label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder={t('current_password_placeholder')}
                  />
                </div>

                <div className="space-y-2 mt-4">
                  <label className="text-sm font-medium text-gray-300">{t('new_password')}</label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder={t('new_password_placeholder')}
                  />
                </div>

                <div className="space-y-2 mt-4">
                  <label className="text-sm font-medium text-gray-300">{t('confirm_new_password')}</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder={t('confirm_new_password_placeholder')}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {isLoading ? t('updating') : t('update_password')}
                </Button>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
};