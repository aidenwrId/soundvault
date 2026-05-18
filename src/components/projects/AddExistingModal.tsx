import React, { useState, useEffect } from 'react';
import { X, Loader2, Music, Plus, Check } from 'lucide-react';
import type { Track } from '@/types';

interface AddExistingModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onAdded: () => void;
}

export default function AddExistingModal({ isOpen, onClose, projectId, onAdded }: AddExistingModalProps) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTrackIds, setSelectedTrackIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('/api/tracks')
        .then(res => res.json())
        .then(data => {
          // Filter out tracks that are already in this project
          const availableTracks = (data.tracks || []).filter((t: Track) => t.project_id !== projectId);
          setTracks(availableTracks);
          setSelectedTrackIds(new Set());
          setLoading(false);
        });
    }
  }, [isOpen, projectId]);

  const handleToggleSelect = (trackId: string) => {
    const newSet = new Set(selectedTrackIds);
    if (newSet.has(trackId)) newSet.delete(trackId);
    else newSet.add(trackId);
    setSelectedTrackIds(newSet);
  };

  const handleAdd = async () => {
    if (selectedTrackIds.size === 0) return;
    setSaving(true);
    
    // Process sequentially or Promise.all. For simplicity, Promise.all.
    const promises = Array.from(selectedTrackIds).map(trackId => 
      fetch(`/api/tracks/${trackId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      })
    );

    await Promise.all(promises);
    
    setSaving(false);
    onAdded();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-vault-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-vault-900 border border-vault-700/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-vault-800/40">
          <h2 className="text-xl font-bold text-vault-50">Add Existing Tracks</h2>
          <button onClick={onClose} className="p-2 text-vault-400 hover:text-vault-100 hover:bg-vault-800 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 text-accent-blue animate-spin" /></div>
          ) : tracks.length === 0 ? (
            <div className="text-center py-8">
              <Music className="w-12 h-12 text-vault-600 mx-auto mb-3" />
              <p className="text-vault-400">No other tracks available to add.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tracks.map(track => {
                const isSelected = selectedTrackIds.has(track.id);
                return (
                  <div 
                    key={track.id} 
                    onClick={() => handleToggleSelect(track.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors border ${
                      isSelected ? 'bg-accent-blue/10 border-accent-blue/30' : 'bg-vault-800 border-transparent hover:bg-vault-700'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded flex items-center justify-center border ${isSelected ? 'bg-accent-blue border-accent-blue' : 'border-vault-600'}`}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-vault-100 truncate">{track.title}</p>
                      <p className="text-xs text-vault-400 truncate">{track.artist || 'Unknown Artist'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-vault-800/40 flex justify-end gap-3 bg-vault-900/50">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-vault-300 hover:text-vault-100 transition-colors">
            Cancel
          </button>
          <button 
            onClick={handleAdd} 
            disabled={saving || selectedTrackIds.size === 0}
            className="flex items-center gap-2 px-6 py-2.5 bg-accent-blue hover:bg-accent-blue-light text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {saving ? 'Adding...' : `Add ${selectedTrackIds.size} Track${selectedTrackIds.size !== 1 ? 's' : ''}`}
          </button>
        </div>

      </div>
    </div>
  );
}
