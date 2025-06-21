import React, { useEffect, useState } from 'react';
import { Search, Music, User, ListMusic } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { TrackCard } from '../tracks/TrackCard';
import { Track, User as UserType, Playlist } from '../../types';
import { trackService } from '../../services/tracks';
import { profileService } from '../../services/profiles';
import { playlistService } from '../../services/playlists';
import { useToast } from '../../hooks/use-toast';
import { Link } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface SearchViewProps {
  initialQuery?: string;
}

export const SearchView: React.FC<SearchViewProps> = ({ initialQuery = '' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (query.trim()) {
      performSearch();
    } else {
      setTracks([]);
      setUsers([]);
      setPlaylists([]);
    }
  }, [query]);

  // Синхронизация query с initialQuery при изменении пропса (например, при переходе из хедера)
  React.useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const performSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const [tracksResult, usersResult, playlistsResult] = await Promise.all([
        trackService.searchTracks(query),
        profileService.searchProfiles(query),
        playlistService.searchPlaylists(query),
      ]);

      setTracks(tracksResult);
      setUsers(usersResult);
      setPlaylists(playlistsResult);
    } catch (error) {
      console.error('Search failed:', error);
      toast({
        title: 'Search failed',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const EmptyState = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="p-12 text-center">
        <Icon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-white">Search</h1>
        <div className="relative max-w-2xl">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search for tracks, artists, or playlists..."
            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {query.trim() ? (
        <Tabs defaultValue="tracks" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800 border-gray-700">
            <TabsTrigger value="tracks" className="text-gray-300 data-[state=active]:text-white">
              Tracks ({tracks.length})
            </TabsTrigger>
            <TabsTrigger value="artists" className="text-gray-300 data-[state=active]:text-white">
              Artists ({users.length})
            </TabsTrigger>
            <TabsTrigger value="playlists" className="text-gray-300 data-[state=active]:text-white">
              Playlists ({playlists.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tracks" className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              </div>
            ) : (Array.isArray(tracks) && tracks.length > 0) ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {(Array.isArray(tracks) ? tracks : []).map((track) => (
                  <TrackCard key={track.id} track={track} showActions={false} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Music}
                title="No tracks found"
                description={`No tracks match "${query}"`}
              />
            )}
          </TabsContent>

          <TabsContent value="artists" className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              </div>
            ) : (Array.isArray(users) && users.length > 0) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(Array.isArray(users) ? users : []).map((user) => (
                  <Card key={user.user_id} className="bg-gray-800 border-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <Link to={`/profile/${user.slug}`} className="shrink-0">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={user.avatar_url || undefined} alt={user.displayName || user.slug || user.email} />
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold">
                              {(user.displayName || user.slug || user.email).charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </Link>
                        <div className="min-w-0 flex-1">
                          <Link to={`/profile/${user.slug}`} className="hover:underline">
                            <h3 className="text-white font-medium truncate">{user.displayName || user.slug || user.email}</h3>
                          </Link>
                          <p className="text-gray-400 text-sm truncate">@{user.slug}</p>
                          {user.bio && (
                            <p className="text-gray-500 text-sm truncate mt-1">{user.bio}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={User}
                title="No artists found"
                description={`No artists match "${query}"`}
              />
            )}
          </TabsContent>

          <TabsContent value="playlists" className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              </div>
            ) : (Array.isArray(playlists) && playlists.length > 0) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(Array.isArray(playlists) ? playlists : []).map((playlist) => (
                  <Card key={playlist.id} className="bg-gray-800 border-gray-700 hover:ring-2 hover:ring-purple-500 transition">
                    <Link to={`/playlists/${playlist.id}`} className="block">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                            <ListMusic className="w-6 h-6 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-white font-medium truncate">{playlist.title}</h3>
                            {/* Найти владельца плейлиста среди users */}
                            {(() => {
                              const owner = (Array.isArray(users) ? users : []).find(u => u.user_id === playlist.user_id);
                              if (owner) {
                                return (
                                  <Link to={`/profile/${owner.slug}`} className="text-gray-400 text-sm truncate hover:underline">
                                    @{owner.displayName || owner.slug || owner.email}
                                  </Link>
                                );
                              }
                              return <span className="text-gray-400 text-sm truncate">@{playlist.user_id}</span>;
                            })()}
                            {playlist.description && (
                              <p className="text-gray-500 text-sm truncate mt-1">{playlist.description}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={ListMusic}
                title="No playlists found"
                description={`No playlists match "${query}"`}
              />
            )}
          </TabsContent>
        </Tabs>
      ) : null}
    </div>
  );
};