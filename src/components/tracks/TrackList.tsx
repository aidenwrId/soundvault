'use client';

import React from 'react';
import { Play, Pause, Share2, Music, Loader2 } from 'lucide-react';
import { useAudioPlayer } from '@/components/player/AudioPlayerProvider';
import { formatDuration, formatDate, formatFileSize, cn } from '@/lib/utils';
import type { Track } from '@/types';

interface TrackListProps {
  tracks: Track[];
  onShare?: (track: Track) => void;
  onClick?: (track: Track) => void;
}

export default function TrackList({ tracks, onShare, onClick }: TrackListProps) {
  const { state, actions } = useAudioPlayer();

  return (
    <div className="w-full">
      {/* Header */}
      <div className="grid grid-cols-[auto_1fr_1fr_100px_100px_80px] gap-4 px-4 py-2 text-xs text-vault-500 font-medium uppercase tracking-wider border-b border-vault-800/40">
        <div className="w-10" />
        <div>Title</div>
        <div className="hidden md:block">Artist</div>
        <div className="hidden sm:block">Duration</div>
        <div className="hidden lg:block">Size</div>
        <div className="text-right">Date</div>
      </div>

      {/* Rows */}
      {tracks.map((track, index) => {
        const isCurrentTrack = state.track?.id === track.id;
        const isPlaying = isCurrentTrack && state.isPlaying;
        const isLoading = isCurrentTrack && state.isLoading;

        return (
          <div
            key={track.id}
            onClick={() => onClick?.(track)}
            className={cn(
              'grid grid-cols-[auto_1fr_1fr_100px_100px_80px] gap-4 px-4 py-3 items-center',
              'cursor-pointer group transition-colors rounded-lg',
              isCurrentTrack
                ? 'bg-accent-blue/5 border-l-2 border-accent-blue'
                : 'hover:bg-vault-800/30 border-l-2 border-transparent'
            )}
          >
            {/* Play */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (track.status !== 'ready') return;
                if (isCurrentTrack && isPlaying) actions.pause();
                else if (isCurrentTrack) actions.resume();
                else actions.playTrack(track);
              }}
              className="w-10 h-10 rounded-lg bg-vault-800/60 flex items-center justify-center hover:bg-accent-blue/20 transition-colors"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 text-accent-blue animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-4 h-4 text-accent-blue" />
              ) : track.status === 'ready' ? (
                <Play className="w-4 h-4 text-vault-300 group-hover:text-accent-blue ml-0.5" />
              ) : (
                <Music className="w-4 h-4 text-vault-500" />
              )}
            </button>

            {/* Title */}
            <div className="min-w-0">
              <p className={cn(
                'text-sm font-medium truncate',
                isCurrentTrack ? 'text-accent-blue-light' : 'text-vault-100'
              )}>
                {track.title}
              </p>
              <p className="text-xs text-vault-500 md:hidden truncate">
                {track.artist || 'Unknown Artist'}
              </p>
            </div>

            {/* Artist */}
            <div className="hidden md:block">
              <p className="text-sm text-vault-400 truncate">{track.artist || 'Unknown Artist'}</p>
            </div>

            {/* Duration */}
            <div className="hidden sm:block text-sm text-vault-400 tabular-nums">
              {formatDuration(track.duration_seconds)}
            </div>

            {/* Size */}
            <div className="hidden lg:block text-sm text-vault-500">
              {formatFileSize(track.size_bytes)}
            </div>

            {/* Date + Actions */}
            <div className="flex items-center justify-end gap-2">
              {onShare && (
                <button
                  onClick={(e) => { e.stopPropagation(); onShare(track); }}
                  className="p-1 rounded text-vault-500 hover:text-vault-200 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              )}
              <span className="text-xs text-vault-500">{formatDate(track.created_at)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
