'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import type { Track, PlayerState, PlayerActions } from '@/types';

interface AudioPlayerContextType {
  state: PlayerState;
  actions: PlayerActions;
}

const initialState: PlayerState = {
  track: null,
  isPlaying: false,
  isLoading: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  speed: 1,
  isLooped: false,
  error: null,
  playbackUrl: null,
};

const AudioPlayerContext = createContext<AudioPlayerContextType | null>(null);

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within AudioPlayerProvider');
  }
  return context;
}

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PlayerState>(initialState);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Create audio element once
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    audio.addEventListener('timeupdate', () => {
      setState((s) => ({ ...s, currentTime: audio.currentTime }));
    });

    audio.addEventListener('loadedmetadata', () => {
      setState((s) => ({ ...s, duration: audio.duration, isLoading: false }));
    });

    audio.addEventListener('ended', () => {
      setState((s) => {
        if (s.isLooped) {
          audio.currentTime = 0;
          audio.play();
          return s;
        }
        return { ...s, isPlaying: false, currentTime: 0 };
      });
    });

    audio.addEventListener('error', () => {
      setState((s) => ({
        ...s,
        isPlaying: false,
        isLoading: false,
        error: 'Failed to load audio. The URL may have expired.',
      }));
    });

    audio.addEventListener('waiting', () => {
      setState((s) => ({ ...s, isLoading: true }));
    });

    audio.addEventListener('canplay', () => {
      setState((s) => ({ ...s, isLoading: false }));
    });

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  const fetchPlaybackUrl = useCallback(async (trackId: string): Promise<string | null> => {
    try {
      const res = await fetch(`/api/tracks/${trackId}/play-url`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.url || null;
    } catch {
      return null;
    }
  }, []);

  const playTrack = useCallback(async (track: Track, url?: string) => {
    const audio = audioRef.current;
    if (!audio) return;

    setState((s) => ({
      ...s,
      track,
      isLoading: true,
      isPlaying: false,
      error: null,
      currentTime: 0,
      duration: 0,
    }));

    let playbackUrl: string | null | undefined = url ?? null;
    if (!playbackUrl) {
      playbackUrl = await fetchPlaybackUrl(track.id);
    }

    if (!playbackUrl) {
      setState((s) => ({
        ...s,
        isLoading: false,
        error: 'Could not get playback URL',
      }));
      return;
    }

    audio.src = playbackUrl;
    audio.playbackRate = state.speed;
    audio.volume = state.volume;
    audio.loop = state.isLooped;

    try {
      await audio.play();
      setState((s) => ({
        ...s,
        isPlaying: true,
        isLoading: false,
        playbackUrl,
      }));
    } catch {
      setState((s) => ({
        ...s,
        isPlaying: false,
        isLoading: false,
        error: 'Playback failed',
      }));
    }
  }, [fetchPlaybackUrl, state.speed, state.volume, state.isLooped]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setState((s) => ({ ...s, isPlaying: false }));
  }, []);

  const resume = useCallback(async () => {
    try {
      await audioRef.current?.play();
      setState((s) => ({ ...s, isPlaying: true, error: null }));
    } catch {
      setState((s) => ({ ...s, error: 'Playback failed' }));
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setState((s) => ({ ...s, currentTime: time }));
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    setState((s) => ({ ...s, volume }));
  }, []);

  const setSpeed = useCallback((speed: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
    setState((s) => ({ ...s, speed }));
  }, []);

  const toggleLoop = useCallback(() => {
    setState((s) => {
      const newLoop = !s.isLooped;
      if (audioRef.current) {
        audioRef.current.loop = newLoop;
      }
      return { ...s, isLooped: newLoop };
    });
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';
    }
    setState(initialState);
  }, []);

  const actions: PlayerActions = {
    playTrack,
    pause,
    resume,
    seek,
    setVolume,
    setSpeed,
    toggleLoop,
    stop,
  };

  return (
    <AudioPlayerContext.Provider value={{ state, actions }}>
      {children}
    </AudioPlayerContext.Provider>
  );
}
