'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FolderPlus, FolderOpen } from 'lucide-react';
import ProjectCard from '@/components/projects/ProjectCard';
import CreateProjectModal from '@/components/projects/CreateProjectModal';
import EmptyState from '@/components/ui/EmptyState';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import type { Project } from '@/types';

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const fetchProjects = useCallback(async () => {
    const res = await fetch('/api/projects');
    if (res.ok) { const data = await res.json(); setProjects(data.projects || []); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-20 bg-vault-950/90 backdrop-blur-md border-b border-vault-800/40">
        <div className="px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-vault-50">Projects</h1>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-accent-purple hover:bg-accent-purple-light text-white text-sm font-medium rounded-xl transition-all">
            <FolderPlus className="w-4 h-4" />New Project
          </button>
        </div>
      </div>
      <div className="p-6">
        {loading ? <SkeletonLoader count={6} /> : projects.length === 0 ? (
          <EmptyState icon={<FolderOpen className="w-8 h-8 text-vault-500" />} title="No projects yet" description="Create a project to organize your tracks." action={<button onClick={() => setShowCreate(true)} className="px-5 py-2.5 bg-accent-purple hover:bg-accent-purple-light text-white text-sm font-medium rounded-xl transition-all flex items-center gap-2"><FolderPlus className="w-4 h-4" />Create Project</button>} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {projects.map((p) => <ProjectCard key={p.id} project={p} onClick={(p) => router.push(`/projects/${p.id}`)} />)}
          </div>
        )}
      </div>
      <CreateProjectModal isOpen={showCreate} onClose={() => setShowCreate(false)} onCreated={fetchProjects} />
    </div>
  );
}
