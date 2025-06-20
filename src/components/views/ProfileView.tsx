import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '@/config';
import { TrackCard } from '@/components/tracks/TrackCard';
import { Track } from '@/types/track';

interface Profile {
  user_id: string;
  slug: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export const ProfileView: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Сначала загружаем профиль
        const profileResponse = await axios.get(`${API_URL}/api/profiles/${slug}`);
        setProfile(profileResponse.data);

        // После успешной загрузки профиля загружаем треки
        const tracksResponse = await axios.get(`${API_URL}/api/tracks/user/${profileResponse.data.user_id}`);
        setTracks(tracksResponse.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="flex items-center space-x-6 p-6 bg-gray-800 rounded-lg">
        <Avatar className="w-24 h-24">
          <AvatarImage src={profile.avatar_url || undefined} />
          <AvatarFallback className="bg-purple-600 text-white text-2xl">
            {profile.display_name?.charAt(0).toUpperCase() || <User className="w-8 h-8" />}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold text-white">{profile.display_name || 'Anonymous'}</h1>
          {profile.bio && <p className="mt-2 text-gray-400">{profile.bio}</p>}
          <p className="mt-2 text-sm text-gray-500">
            Member since {new Date(profile.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Tracks Section */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Uploaded Tracks</h2>
        {tracks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tracks.map((track) => (
              <TrackCard key={track.id} track={track} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            No tracks uploaded yet
          </div>
        )}
      </div>
    </div>
  );
}; 