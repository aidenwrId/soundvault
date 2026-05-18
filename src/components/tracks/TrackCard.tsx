'use client';

import React from 'react';
import { Play, Pause, Share2, MoreHorizontal, Music, Clock, Loader2, Download } from 'lucide-react';
import { useAudioPlayer } from '@/components/player/AudioPlayerProvider';
import { formatDuration, formatDate, cn } from '@/lib/utils';
import type { Track } from '@/types';

interface TrackCardProps {
  track: Track;
  onShare?: (track: Track) => void;
  onPlay?: (track: Track) => void;
  onClick?: (track: Track) => void;
}

export default function TrackCard({ track, onShare, onPlay, onClick }: TrackCardProps) {
  const { state, actions } = useAudioPlayer();
  const isCurrentTrack = state.track?.id === track.id;
  const isPlaying = isCurrentTrack && state.isPlaying;
  const isLoading = isCurrentTrack && state.isLoading;

  const isAudio = !track.mime_type || track.mime_type.startsWith('audio/');

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (track.status !== 'ready') return;
    
    if (!isAudio) {
      // For zips and videos, open directly via play-url
      (async () => {
        try {
          const res = await fetch(`/api/tracks/${track.id}/play-url`);
          if (res.ok) {
            const { url } = await res.json();
            const a = document.createElement('a');
            a.href = url;
            a.target = '_blank';
            a.download = '';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }
        } catch {}
      })();
      return;
    }

    if (isCurrentTrack && state.isPlaying) {
      actions.pause();
    } else if (isCurrentTrack) {
      actions.resume();
    } else {
      onPlay ? onPlay(track) : actions.playTrack(track);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare?.(track);
  };

  return (
    <div
      onClick={() => onClick?.(track)}
      className={cn(
        'glass-card p-4 cursor-pointer group relative',
        isCurrentTrack && 'border-accent-blue/30 bg-accent-blue/5'
      )}
    >
      {/* Cover Art */}
      <div className="relative aspect-square rounded-xl bg-vault-800 mb-3 overflow-hidden flex items-center justify-center">
        {track.cover_r2_key ? (
          <img src={`/api/images/${track.cover_r2_key}`} alt={track.title} className="w-full h-full object-cover" />
        ) : (
          <Music className="w-10 h-10 text-vault-600" />
        )}
        
        {/* Play overlay */}
        {track.status === 'ready' && (
          <button
            onClick={handlePlay}
            className={cn(
              'absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity',
              isPlaying || isLoading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            )}
          >
            <div className="w-12 h-12 rounded-full bg-accent-blue flex items-center justify-center shadow-lg shadow-accent-blue/30">
              {isLoading ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : !isAudio ? (
                <Download className="w-5 h-5 text-white" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white ml-0.5" />
              )}
            </div>
          </button>
        )}

        {/* Status badge */}
        {track.status !== 'ready' && (
          <div className="absolute top-2 right-2">
            <span className={cn(
              'text-xs px-2 py-0.5 rounded-full font-medium',
              track.status === 'uploading' && 'bg-accent-amber/20 text-accent-amber',
              track.status === 'processing' && 'bg-accent-blue/20 text-accent-blue',
              track.status === 'failed' && 'bg-accent-red/20 text-accent-red',
            )}>
              {track.status}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-vault-50 truncate">{track.title}</h3>
        <p className="text-xs text-vault-400 truncate">{track.artist || 'Unknown Artist'}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-vault-800/60">
        <div className="flex items-center gap-1 text-xs text-vault-500">
          <Clock className="w-3 h-3" />
          <span>{formatDuration(track.duration_seconds)}</span>
        </div>
        <div className="flex items-center gap-1">
          {onShare && (
            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg text-vault-400 hover:text-vault-100 hover:bg-vault-700/50 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          )}
          <span className="text-xs text-vault-500">{formatDate(track.created_at)}</span>
        </div>
      </div>
    </div>
  );
}
