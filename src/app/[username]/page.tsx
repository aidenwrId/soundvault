'use client';

import React, { useState, useEffect, use } from 'react';
import { notFound } from 'next/navigation';
import { User, Loader2, Music } from 'lucide-react';
import TrackCard from '@/components/tracks/TrackCard';
import { AudioPlayerProvider } from '@/components/player/AudioPlayerProvider';
import AudioPlayer from '@/components/player/AudioPlayer';
import type { Track } from '@/types';

interface PublicProfile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
}

export default function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/profile/${username}`);
        if (!res.ok) {
          setError(true);
          return;
        }
        const data = await res.json();
        setProfile(data.profile);
        setTracks(data.tracks || []);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [username]);

  if (loading) {
    return <div className="min-h-screen bg-vault-950 flex items-center justify-center"><Loader2 className="w-8 h-8 text-accent-blue animate-spin" /></div>;
  }

  if (error || !profile) {
    return notFound();
  }

  return (
    <AudioPlayerProvider>
      <div className="min-h-screen bg-vault-950 pb-24">
        {/* Profile Header */}
        <div className="bg-vault-900 border-b border-vault-800/40 py-12 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-accent-blue/5 pointer-events-none" />
          <div className="max-w-5xl mx-auto relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-vault-800 border-4 border-vault-900 shadow-xl flex-shrink-0">
              {profile.avatar_url ? (
                <img src={`/api/images/${profile.avatar_url}`} alt={profile.display_name || profile.username} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-vault-800">
                  <User className="w-12 h-12 text-vault-400" />
                </div>
              )}
            </div>
            <div className="text-center md:text-left space-y-2">
              <h1 className="text-3xl font-bold text-vault-50">{profile.display_name || profile.username}</h1>
              <p className="text-vault-400">@{profile.username}</p>
            </div>
          </div>
        </div>

        {/* Showcased Tracks */}
        <div className="max-w-5xl mx-auto p-6 mt-8">
          <h2 className="text-xl font-bold text-vault-100 mb-6 flex items-center gap-2">
            <Music className="w-5 h-5 text-accent-blue" />
            Showcase
          </h2>

          {tracks.length === 0 ? (
            <div className="text-center py-12 bg-vault-900/50 rounded-2xl border border-vault-800/40">
              <Music className="w-12 h-12 text-vault-600 mx-auto mb-3" />
              <p className="text-vault-400">No showcased tracks yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {tracks.map(track => (
                <TrackCard key={track.id} track={track} />
              ))}
            </div>
          )}
        </div>
      </div>
      <AudioPlayer />
    </AudioPlayerProvider>
  );
}
