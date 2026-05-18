'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Music, Upload, Grid3X3, List, ArrowUpDown, Search } from 'lucide-react';
import TrackCard from '@/components/tracks/TrackCard';
import TrackList from '@/components/tracks/TrackList';
import UploadModal from '@/components/upload/UploadModal';
import ShareModal from '@/components/share/ShareModal';
import EmptyState from '@/components/ui/EmptyState';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import type { Track, Project, ViewMode, SortOption } from '@/types';
import { cn } from '@/lib/utils';

export default function LibraryPage() {
  const router = useRouter();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sort, setSort] = useState<SortOption>('newest');
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [shareTrack, setShareTrack] = useState<Track | null>(null);

  const fetchTracks = useCallback(async () => {
    const params = new URLSearchParams();
    if (sort) params.set('sort', sort);
    if (search) params.set('search', search);
    const res = await fetch(`/api/tracks?${params}`);
    if (res.ok) { const data = await res.json(); setTracks(data.tracks || []); }
    setLoading(false);
  }, [sort, search]);

  const fetchProjects = useCallback(async () => {
    const res = await fetch('/api/projects');
    if (res.ok) { const data = await res.json(); setProjects(data.projects || []); }
  }, []);

  useEffect(() => { fetchTracks(); fetchProjects(); }, [fetchTracks, fetchProjects]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-vault-950/90 backdrop-blur-md border-b border-vault-800/40">
        <div className="px-6 py-4 flex items-center justify-between gap-4">
          <h1 className="text-xl font-bold text-vault-50">Library</h1>
          <div className="flex-1 max-w-md">
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-vault-500" />
              <input type="text" placeholder="Search tracks..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-vault-800/60 border border-vault-700/50 rounded-xl text-sm text-vault-100 placeholder:text-vault-500 focus:outline-none focus:border-accent-blue/50" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select value={sort} onChange={(e) => setSort(e.target.value as SortOption)} className="px-3 py-2 bg-vault-800/60 border border-vault-700/50 rounded-xl text-sm text-vault-200 focus:outline-none cursor-pointer">
              <option value="newest">Newest</option><option value="oldest">Oldest</option><option value="name">Name</option>
            </select>
            <div className="flex bg-vault-800/60 border border-vault-700/50 rounded-xl overflow-hidden">
              <button onClick={() => setViewMode('grid')} className={cn('p-2', viewMode === 'grid' ? 'bg-accent-blue/20 text-accent-blue' : 'text-vault-400 hover:text-vault-200')}><Grid3X3 className="w-4 h-4" /></button>
              <button onClick={() => setViewMode('list')} className={cn('p-2', viewMode === 'list' ? 'bg-accent-blue/20 text-accent-blue' : 'text-vault-400 hover:text-vault-200')}><List className="w-4 h-4" /></button>
            </div>
            <button onClick={() => setShowUpload(true)} className="flex items-center gap-2 px-4 py-2 bg-accent-blue hover:bg-accent-blue-light text-white text-sm font-medium rounded-xl transition-all">
              <Upload className="w-4 h-4" /><span className="hidden sm:inline">Upload</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <SkeletonLoader count={8} type={viewMode === 'grid' ? 'card' : 'row'} />
        ) : tracks.length === 0 ? (
          <EmptyState icon={<Music className="w-8 h-8 text-vault-500" />} title="No tracks yet" description="Upload your first track to get started. Drag and drop or click the upload button." action={<button onClick={() => setShowUpload(true)} className="px-5 py-2.5 bg-accent-blue hover:bg-accent-blue-light text-white text-sm font-medium rounded-xl transition-all flex items-center gap-2"><Upload className="w-4 h-4" />Upload Tracks</button>} />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {tracks.map((t) => <TrackCard key={t.id} track={t} onShare={setShareTrack} onClick={(t) => router.push(`/track/${t.id}`)} />)}
          </div>
        ) : (
          <div className="bg-vault-900/50 rounded-2xl border border-vault-800/40 overflow-hidden">
            <TrackList tracks={tracks} onShare={setShareTrack} onClick={(t) => router.push(`/track/${t.id}`)} />
          </div>
        )}
      </div>

      <UploadModal isOpen={showUpload} onClose={() => setShowUpload(false)} projects={projects} onUploadComplete={fetchTracks} />
      <ShareModal isOpen={!!shareTrack} onClose={() => setShareTrack(null)} resource={shareTrack} resourceType="track" />
    </div>
  );
}
