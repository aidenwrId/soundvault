'use client';

import React from 'react';
import {
  Play, Pause, Volume2, VolumeX, Repeat, SkipBack,
  Loader2, AlertCircle, Music
} from 'lucide-react';
import { useAudioPlayer } from './AudioPlayerProvider';
import { formatDuration, cn } from '@/lib/utils';

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export default function AudioPlayer() {
  const { state, actions } = useAudioPlayer();
  const { track, isPlaying, isLoading, currentTime, duration, volume, speed, isLooped, error } = state;

  if (!track) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-vault-700/50">
      <div className="max-w-screen-2xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Track Info */}
          <div className="flex items-center gap-3 min-w-0 w-64">
            <div className="w-11 h-11 rounded-lg bg-vault-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {track.cover_r2_key ? (
                <img src={`/api/images/${track.cover_r2_key}`} alt={track.title} className="w-full h-full object-cover" />
              ) : (
                <Music className="w-5 h-5 text-vault-400" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-vault-50 truncate">{track.title}</p>
              <p className="text-xs text-vault-400 truncate">{track.artist || 'Unknown Artist'}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex-1 flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-3">
              <button
                onClick={() => actions.seek(0)}
                className="p-1.5 text-vault-400 hover:text-vault-100 transition-colors"
                title="Restart"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={() => isPlaying ? actions.pause() : actions.resume()}
                disabled={isLoading}
                className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center transition-all',
                  'bg-accent-blue hover:bg-accent-blue-light text-white',
                  isLoading && 'opacity-60'
                )}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4 ml-0.5" />
                )}
              </button>

              <button
                onClick={actions.toggleLoop}
                className={cn(
                  'p-1.5 transition-colors',
                  isLooped ? 'text-accent-blue' : 'text-vault-400 hover:text-vault-100'
                )}
                title="Loop"
              >
                <Repeat className="w-4 h-4" />
              </button>
            </div>

            {/* Seek Bar */}
            <div className="w-full max-w-xl flex items-center gap-2">
              <span className="text-xs text-vault-400 w-10 text-right tabular-nums">
                {formatDuration(currentTime)}
              </span>
              <div className="flex-1 relative group">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={(e) => actions.seek(parseFloat(e.target.value))}
                  className="w-full h-1 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, var(--color-accent-blue) ${progress}%, var(--color-vault-700) ${progress}%)`,
                  }}
                />
              </div>
              <span className="text-xs text-vault-400 w-10 tabular-nums">
                {formatDuration(duration)}
              </span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3 w-52 justify-end">
            {/* Speed */}
            <select
              value={speed}
              onChange={(e) => actions.setSpeed(parseFloat(e.target.value))}
              className="bg-vault-800 text-vault-200 text-xs rounded-md px-2 py-1 border border-vault-700 focus:outline-none focus:border-accent-blue cursor-pointer"
            >
              {SPEED_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}x</option>
              ))}
            </select>

            {/* Volume */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => actions.setVolume(volume > 0 ? 0 : 0.8)}
                className="p-1 text-vault-400 hover:text-vault-100 transition-colors"
              >
                {volume === 0 ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => actions.setVolume(parseFloat(e.target.value))}
                className="w-20 h-1 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, var(--color-accent-blue) ${volume * 100}%, var(--color-vault-700) ${volume * 100}%)`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 mt-2 text-xs text-accent-red">
            <AlertCircle className="w-3 h-3" />
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
