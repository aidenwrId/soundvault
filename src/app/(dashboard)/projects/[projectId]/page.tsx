'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Share2, Loader2, Music, FolderOpen } from 'lucide-react';
import TrackCard from '@/components/tracks/TrackCard';
import UploadModal from '@/components/upload/UploadModal';
import ShareModal from '@/components/share/ShareModal';
import AddExistingModal from '@/components/projects/AddExistingModal';
import EmptyState from '@/components/ui/EmptyState';
import type { Project, Track } from '@/types';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [showAddExisting, setShowAddExisting] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [shareTrack, setShareTrack] = useState<Track | null>(null);

  const fetchProject = async () => {
    const res = await fetch(`/api/projects/${params.projectId}`);
    if (res.ok) { const data = await res.json(); setProject(data.project); setTracks(data.tracks || []); }
    setLoading(false);
  };

  useEffect(() => { fetchProject(); }, [params.projectId]);

  if (loading) return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 text-accent-blue animate-spin" /></div>;
  if (!project) return <div className="flex items-center justify-center h-96"><p className="text-vault-400">Project not found</p></div>;

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-20 bg-vault-950/90 backdrop-blur-md border-b border-vault-800/40">
        <div className="px-6 py-4">
          <button onClick={() => router.push('/projects')} className="flex items-center gap-1 text-sm text-vault-400 hover:text-vault-200 mb-2"><ArrowLeft className="w-4 h-4" />Projects</button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-vault-50">{project.title}</h1>
              {project.description && <p className="text-sm text-vault-400 mt-1">{project.description}</p>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowShare(true)} className="p-2 rounded-xl border border-vault-700 hover:bg-vault-800 text-vault-300"><Share2 className="w-4 h-4" /></button>
              <button onClick={() => setShowAddExisting(true)} className="flex items-center gap-2 px-4 py-2 bg-vault-800 hover:bg-vault-700 text-vault-100 text-sm font-medium rounded-xl border border-vault-700/50">Add Existing</button>
              <button onClick={() => setShowUpload(true)} className="flex items-center gap-2 px-4 py-2 bg-accent-blue hover:bg-accent-blue-light text-white text-sm font-medium rounded-xl"><Upload className="w-4 h-4" />Upload</button>
            </div>
          </div>
        </div>
      </div>
      <div className="p-6">
        {tracks.length === 0 ? (
          <EmptyState icon={<Music className="w-8 h-8 text-vault-500" />} title="No tracks in this project" description="Upload tracks to this project to get started." action={<button onClick={() => setShowUpload(true)} className="px-5 py-2.5 bg-accent-blue text-white text-sm font-medium rounded-xl flex items-center gap-2"><Upload className="w-4 h-4" />Upload</button>} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {tracks.map((t) => <TrackCard key={t.id} track={t} onShare={setShareTrack} onClick={(t) => router.push(`/track/${t.id}`)} />)}
          </div>
        )}
      </div>
      <UploadModal isOpen={showUpload} onClose={() => setShowUpload(false)} projects={[{ id: project.id, title: project.title }]} onUploadComplete={fetchProject} />
      <AddExistingModal isOpen={showAddExisting} onClose={() => setShowAddExisting(false)} projectId={project.id} onAdded={fetchProject} />
      <ShareModal isOpen={showShare} onClose={() => setShowShare(false)} resource={project} resourceType="project" />
      {shareTrack && <ShareModal isOpen={!!shareTrack} onClose={() => setShareTrack(null)} resource={shareTrack} resourceType="track" />}
    </div>
  );
}
