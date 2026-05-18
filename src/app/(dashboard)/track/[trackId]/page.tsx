'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Play, Pause, Share2, Download, Trash2, Music, Clock, ArrowLeft, Loader2, Star } from 'lucide-react';
import { useAudioPlayer } from '@/components/player/AudioPlayerProvider';
import WaveformDisplay from '@/components/tracks/WaveformDisplay';
import CoverUpload from '@/components/upload/CoverUpload';
import ShareModal from '@/components/share/ShareModal';
import ConfirmDeleteModal from '@/components/ui/ConfirmDeleteModal';
import { formatDuration, formatDate, formatFileSize, cn } from '@/lib/utils';
import type { Track as TrackType } from '@/types';

export default function TrackPage() {
  const params = useParams();
  const router = useRouter();
  const { state, actions } = useAudioPlayer();
  const [track, setTrack] = useState<TrackType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showShare, setShowShare] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isCurrentTrack = state.track?.id === track?.id;
  const isPlaying = isCurrentTrack && state.isPlaying;
  const progress = isCurrentTrack && state.duration > 0 ? state.currentTime / state.duration : 0;

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/tracks/${params.trackId}`);
      if (res.ok) { const data = await res.json(); setTrack(data.track); }
      setLoading(false);
    })();
  }, [params.trackId]);

  const handlePlay = () => {
    if (!track || track.status !== 'ready') return;
    if (isCurrentTrack && isPlaying) actions.pause();
    else if (isCurrentTrack) actions.resume();
    else actions.playTrack(track);
  };

  const handleDelete = async () => {
    if (!track) return; setDeleting(true);
    const res = await fetch(`/api/tracks/${track.id}`, { method: 'DELETE' });
    if (res.ok) router.push('/library');
    setDeleting(false);
  };

  const handleToggleShowcase = async () => {
    if (!track) return;
    const newStatus = !track.is_showcased;
    setTrack({ ...track, is_showcased: newStatus });
    try {
      await fetch(`/api/tracks/${track.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isShowcased: newStatus }),
      });
    } catch {
      // Revert on fail
      setTrack({ ...track, is_showcased: !newStatus });
    }
  };

  if (loading) return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 text-accent-blue animate-spin" /></div>;
  if (!track) return <div className="flex items-center justify-center h-96"><p className="text-vault-400">Track not found</p></div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <button onClick={() => router.push('/library')} className="flex items-center gap-1 text-sm text-vault-400 hover:text-vault-200 transition-colors"><ArrowLeft className="w-4 h-4" />Back to Library</button>

      {/* Track Header */}
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex-shrink-0 mx-auto sm:mx-0">
          <CoverUpload 
            trackId={track.id} 
            currentCoverKey={track.cover_r2_key} 
            onUploadComplete={(key) => setTrack({ ...track, cover_r2_key: key })} 
          />
        </div>
        <div className="flex-1 space-y-3 text-center sm:text-left">
          <h1 className="text-3xl font-bold text-vault-50">{track.title}</h1>
          <p className="text-lg text-vault-300">{track.artist || 'Unknown Artist'}</p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-vault-400 justify-center sm:justify-start">
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{formatDuration(track.duration_seconds)}</span>
            <span>{formatFileSize(track.size_bytes)}</span>
            <span>{formatDate(track.created_at)}</span>
            <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', track.status === 'ready' ? 'bg-accent-green/20 text-accent-green' : 'bg-accent-amber/20 text-accent-amber')}>{track.status}</span>
          </div>
          <div className="flex items-center gap-3 pt-2 justify-center sm:justify-start">
            <button onClick={handlePlay} disabled={track.status !== 'ready'} className="flex items-center gap-2 px-6 py-2.5 bg-accent-blue hover:bg-accent-blue-light text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50">
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}{isPlaying ? 'Pause' : 'Play'}
            </button>
            <button onClick={handleToggleShowcase} className={cn("p-2.5 rounded-xl border transition-all", track.is_showcased ? "bg-accent-amber/10 border-accent-amber text-accent-amber" : "border-vault-700 hover:bg-vault-800 text-vault-300 hover:text-vault-100")}>
              <Star className="w-4 h-4" fill={track.is_showcased ? "currentColor" : "none"} />
            </button>
            <button onClick={() => setShowShare(true)} className="p-2.5 rounded-xl border border-vault-700 hover:bg-vault-800 text-vault-300 hover:text-vault-100 transition-all"><Share2 className="w-4 h-4" /></button>
            <button onClick={() => setShowDelete(true)} className="p-2.5 rounded-xl border border-vault-700 hover:bg-accent-red/10 hover:border-accent-red/30 text-vault-300 hover:text-accent-red transition-all"><Trash2 className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Waveform */}
      <div className="bg-vault-900/50 rounded-2xl border border-vault-800/40 p-6">
        <WaveformDisplay progress={progress} height={80} />
      </div>

      <ShareModal isOpen={showShare} onClose={() => setShowShare(false)} resource={track} resourceType="track" />
      <ConfirmDeleteModal isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} title="Delete Track" description={`Are you sure you want to delete "${track.title}"? This action cannot be undone.`} loading={deleting} />
    </div>
  );
}
