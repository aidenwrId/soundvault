'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Play, Pause, Music2, Clock, Volume2, VolumeX, Loader2, AlertCircle, Download } from 'lucide-react';
import PasswordGate from '@/components/share/PasswordGate';
import WaveformDisplay from '@/components/tracks/WaveformDisplay';
import { formatDuration, cn } from '@/lib/utils';

interface ShareData {
  shareLink: { resource_type: string; allow_download: boolean; show_artist: boolean; slug: string; };
  resource: any;
  requiresPassword: boolean;
  isExpired: boolean;
}

export default function PublicSharePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [data, setData] = useState<ShareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/public-share/${slug}`);
      if (res.ok) setData(await res.json());
      else { const d = await res.json(); setError(d.error || 'Not found'); }
      setLoading(false);
    })();
  }, [slug]);

  const playTrack = async (trackId: string) => {
    if (!audioRef.current) return;
    try {
      const res = await fetch(`/api/tracks/${trackId}/play-url`, { headers: { 'x-share-token': slug } });
      if (!res.ok) return;
      const { url } = await res.json();
      audioRef.current.src = url;
      audioRef.current.volume = volume;
      await audioRef.current.play();
      setPlaying(true);
      setActiveTrackId(trackId);
    } catch { /* */ }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play(); setPlaying(true); }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration);
    const onEnd = () => setPlaying(false);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('ended', onEnd);
    return () => { audio.removeEventListener('timeupdate', onTime); audio.removeEventListener('loadedmetadata', onMeta); audio.removeEventListener('ended', onEnd); };
  }, []);

  if (loading) return <div className="min-h-screen bg-vault-950 flex items-center justify-center"><Loader2 className="w-8 h-8 text-accent-blue animate-spin" /></div>;
  if (error) return (
    <div className="min-h-screen bg-vault-950 flex items-center justify-center p-4">
      <div className="text-center"><AlertCircle className="w-12 h-12 text-accent-red mx-auto mb-4" /><h1 className="text-xl font-bold text-vault-50 mb-2">{error.includes('expired') ? 'Link Expired' : 'Not Found'}</h1><p className="text-sm text-vault-400">{error}</p></div>
    </div>
  );
  if (!data) return null;
  if (data.requiresPassword && !verified) return <PasswordGate slug={slug} onVerified={() => setVerified(true)} />;

  const { shareLink, resource } = data;
  const isSingleTrack = shareLink.resource_type === 'track';
  const tracks = isSingleTrack ? [resource] : (resource?.tracks || []);
  const progress = duration > 0 ? currentTime / duration : 0;

  return (
    <div className="min-h-screen bg-gradient-hero">
      <audio ref={audioRef} />
      {/* Header */}
      <div className="px-6 py-5 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-accent-blue/20 flex items-center justify-center"><Music2 className="w-4 h-4 text-accent-blue" /></div>
        <span className="text-sm font-bold text-vault-50">SoundVault</span>
      </div>
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">
        {/* Title */}
        <div className="text-center space-y-3">
          <div className="w-24 h-24 rounded-2xl bg-vault-800 flex items-center justify-center mx-auto"><Music2 className="w-10 h-10 text-vault-500" /></div>
          <h1 className="text-2xl font-bold text-vault-50">{isSingleTrack ? resource?.title : resource?.title}</h1>
          {shareLink.show_artist && resource?.artist && <p className="text-vault-300">{resource.artist}</p>}
          {!isSingleTrack && resource?.description && <p className="text-sm text-vault-400">{resource.description}</p>}
        </div>

        {/* Player / Playlist */}
        <div className="space-y-3">
          {tracks.map((track: any) => {
            const isActive = activeTrackId === track.id;
            return (
              <div key={track.id} className={cn('glass-card p-4 flex items-center gap-4 cursor-pointer', isActive && 'border-accent-blue/30')}>
                <button onClick={() => isActive ? togglePlay() : playTrack(track.id)} className="w-10 h-10 rounded-lg bg-vault-800 flex items-center justify-center flex-shrink-0 hover:bg-accent-blue/20 transition-colors">
                  {isActive && playing ? <Pause className="w-4 h-4 text-accent-blue" /> : <Play className="w-4 h-4 text-vault-300 ml-0.5" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-medium truncate', isActive ? 'text-accent-blue-light' : 'text-vault-100')}>{track.title}</p>
                  {shareLink.show_artist && track.artist && <p className="text-xs text-vault-400">{track.artist}</p>}
                </div>
                <span className="text-xs text-vault-500 tabular-nums">{formatDuration(track.duration_seconds)}</span>
              </div>
            );
          })}
        </div>

        {/* Active track waveform + controls */}
        {activeTrackId && (
          <div className="glass-card p-6 space-y-4">
            <WaveformDisplay progress={progress} height={60} />
            <div className="flex items-center gap-3">
              <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-accent-blue flex items-center justify-center">
                {playing ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white ml-0.5" />}
              </button>
              <div className="flex-1">
                <input type="range" min={0} max={duration || 100} value={currentTime} onChange={(e) => { if (audioRef.current) audioRef.current.currentTime = parseFloat(e.target.value); }}
                  className="w-full h-1" style={{ background: `linear-gradient(to right, var(--color-accent-blue) ${progress * 100}%, var(--color-vault-700) ${progress * 100}%)` }} />
                <div className="flex justify-between text-xs text-vault-500 mt-1"><span>{formatDuration(currentTime)}</span><span>{formatDuration(duration)}</span></div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => { const v = volume > 0 ? 0 : 0.8; setVolume(v); if (audioRef.current) audioRef.current.volume = v; }} className="p-1 text-vault-400">
                  {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <footer className="text-center py-8"><p className="text-xs text-vault-600">Shared via SoundVault</p></footer>
    </div>
  );
}
