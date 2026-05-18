'use client';

import React, { useState, useEffect, use } from 'react';
import { notFound } from 'next/navigation';
import { User, Loader2, Music, Link as LinkIcon } from 'lucide-react';
import TrackCard from '@/components/tracks/TrackCard';
import { AudioPlayerProvider } from '@/components/player/AudioPlayerProvider';
import AudioPlayer from '@/components/player/AudioPlayer';
import DOMPurify from 'isomorphic-dompurify';
import type { Track } from '@/types';

interface PublicProfile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  banner_url: string;
  bio: string;
  socials: { platform: string; url: string }[];
  custom_css: string;
  custom_layout: string;
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

  const defaultLayout = '{profile}\n{bio}\n{socials}\n{showcase-tracks}';
  const layoutStr = profile.custom_layout || defaultLayout;
  const parts = layoutStr.split(/(\{profile\}|\{showcase-tracks\}|\{bio\}|\{socials\})/g);

  return (
    <AudioPlayerProvider>
      <div id="custom-profile-root" className="min-h-screen bg-vault-950 pb-24">
        {/* Safely inject Custom CSS scoped roughly to the page */}
        {profile.custom_css && (
          <style dangerouslySetInnerHTML={{ __html: profile.custom_css.replace(/<\/style>/gi, '') }} />
        )}

        {profile.banner_url ? (
          <div className="w-full h-56 md:h-72 lg:h-96 relative overflow-hidden bg-vault-900 profile-banner-module border-b border-vault-800/50">
            <img src={`/api/images/${profile.banner_url}`} alt="Banner" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-vault-950 via-vault-950/20 to-transparent" />
          </div>
        ) : (
          <div className="w-full h-32 md:h-48 relative overflow-hidden bg-vault-900 profile-banner-module border-b border-vault-800/50">
            <div className="absolute inset-0 bg-gradient-to-tr from-vault-800 to-vault-900" />
            <div className="absolute inset-0 bg-gradient-to-t from-vault-950 to-transparent" />
          </div>
        )}

        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-[-60px] md:mt-[-80px] relative z-10 flex flex-col gap-8 profile-content-container">
          {parts.map((part, index) => {
            if (part === '{profile}') {
              return (
                <div key={index} className="flex flex-col md:flex-row md:items-end gap-6 profile-header-module">
                  <div className="w-32 h-32 md:w-44 md:h-44 rounded-full overflow-hidden bg-vault-900 border-4 border-vault-950 shadow-2xl flex-shrink-0 relative group">
                    {profile.avatar_url ? (
                      <img src={`/api/images/${profile.avatar_url}`} alt={profile.display_name || profile.username} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-vault-800">
                        <User className="w-16 h-16 text-vault-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/10 pointer-events-none" />
                  </div>
                  <div className="text-center md:text-left space-y-1 mt-4 md:mt-0 flex-1 md:pb-4">
                    <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-md">{profile.display_name || profile.username}</h1>
                    <p className="text-vault-300 font-medium text-lg">@{profile.username}</p>
                  </div>
                </div>
              );
            }

            if (part === '{bio}') {
              if (!profile.bio) return null;
              return (
                <div key={index} className="glass-card p-6 rounded-2xl profile-bio-module">
                  <p className="text-vault-200 whitespace-pre-wrap leading-relaxed">{profile.bio}</p>
                </div>
              );
            }

            if (part === '{socials}') {
              if (!profile.socials || profile.socials.length === 0) return null;
              return (
                <div key={index} className="flex flex-wrap gap-3 profile-socials-module">
                  {profile.socials.map((social, i) => {
                    let Icon = <LinkIcon className="w-4 h-4" />;
                    if (social.platform === 'twitter') Icon = <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
                    if (social.platform === 'instagram') Icon = <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>;
                    if (social.platform === 'discord') Icon = <svg className="w-4 h-4 fill-current" viewBox="0 0 127.14 96.36"><path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a67.58,67.58,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.2,46,96.12,53,91.08,65.69,84.69,65.69Z"/></svg>;
                    if (social.platform === 'youtube') Icon = <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>;
                    if (social.platform === 'spotify') Icon = <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.24 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.781-.18-.6.18-1.2.78-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.481-1.02.6-1.56.3z"/></svg>;
                    if (social.platform === 'soundcloud') Icon = <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M11.67 12.02c-.06 0-.12-.02-.15-.06-.06-.07-.06-.18 0-.25l1.64-2.02c.07-.09.21-.09.28 0l1.45 2.02c.06.07.06.18 0 .25-.03.04-.09.06-.15.06h-3.07zm11.38 2.01c0 2.2-1.79 3.99-3.99 3.99H5.21c-2.88 0-5.21-2.33-5.21-5.21 0-2.61 1.93-4.78 4.43-5.15.53-2.65 2.86-4.66 5.66-4.66 2.45 0 4.54 1.5 5.39 3.65.25-.06.51-.1.78-.1 1.68 0 3.1 1.13 3.68 2.67 1.76.2 3.11 1.69 3.11 3.5v1.31zm-3.99-2.68c0-.66-.54-1.2-1.2-1.2s-1.2.54-1.2 1.2.54 1.2 1.2 1.2 1.2-.54 1.2-1.2zm-2.87 0c0-.66-.54-1.2-1.2-1.2s-1.2.54-1.2 1.2.54 1.2 1.2 1.2 1.2-.54 1.2-1.2zm-2.86 0c0-.66-.54-1.2-1.2-1.2s-1.2.54-1.2 1.2.54 1.2 1.2 1.2 1.2-.54 1.2-1.2zm-2.87 0c0-.66-.54-1.2-1.2-1.2s-1.2.54-1.2 1.2.54 1.2 1.2 1.2 1.2-.54 1.2-1.2z"/></svg>;
                    if (social.platform === 'snapchat') Icon = <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12.22 0C7.59 0 6.64 2.87 6.6 4.3c-.02.42.06.66.06.66-.41.04-1.07.28-1.5.88-.26.35-.41.87-.41 1.65 0 1.2.5 2.5 1.55 3.3.4.3.85.5 1.18.6-.26.65-.68 1.4-1.15 2.1-.6.8-1.3 1.5-1.9 1.95C2.6 16.7 1 16.6.7 16.6c-.35 0-.58.3-.49.65.1.4.37.98 1.24 1.5 1.35.8 4 1.45 6.3 1.45 1.05 0 2-.1 2.8-.25v.05h.01c.28.9.72 2.3 2.64 2.3 1.92 0 2.36-1.4 2.64-2.3h.01v-.05c.8.15 1.75.25 2.8.25 2.3 0 4.95-.65 6.3-1.45.87-.52 1.14-1.1 1.24-1.5.09-.35-.14-.65-.49-.65-.3 0-1.9.1-3.73-1.15-.6-.45-1.3-1.15-1.9-1.95-.47-.7-.89-1.45-1.15-2.1.33-.1.78-.3 1.18-.6 1.05-.8 1.55-2.1 1.55-3.3 0-.78-.15-1.3-.41-1.65-.43-.6-1.09-.84-1.5-.88 0 0 .08-.24.06-.66C17.8 2.87 16.85 0 12.22 0z"/></svg>;

                    return (
                      <a 
                        key={i} 
                        href={social.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-vault-800 hover:bg-vault-700 rounded-xl text-sm font-medium text-vault-200 hover:text-white transition-all shadow-sm border border-vault-700/50"
                      >
                        {Icon}
                        <span className="capitalize">{social.platform}</span>
                      </a>
                    );
                  })}
                </div>
              );
            }

            if (part === '{showcase-tracks}') {
              return (
                <div key={index} className="mt-4 profile-tracks-module">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <Music className="w-6 h-6 text-accent-blue" />
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
              );
            }

            // Render raw text/spacing
            if (part.trim() === '') return null;
            return <div key={index} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(part) }} />;
          })}
        </div>
      </div>
      <AudioPlayer />
    </AudioPlayerProvider>
  );
}
