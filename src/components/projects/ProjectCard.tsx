'use client';
import React from 'react';
import { FolderOpen, Music, Calendar } from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
import type { Project } from '@/types';

interface ProjectCardProps { project: Project; onClick?: (p: Project) => void; }

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  return (
    <div onClick={() => onClick?.(project)} className="glass-card p-5 cursor-pointer group">
      <div className="w-14 h-14 rounded-xl bg-accent-purple/10 flex items-center justify-center mb-4">
        <FolderOpen className="w-7 h-7 text-accent-purple" />
      </div>
      <h3 className="text-base font-semibold text-vault-50 truncate mb-1">{project.title}</h3>
      {project.description && <p className="text-xs text-vault-400 line-clamp-2 mb-3">{project.description}</p>}
      <div className="flex items-center gap-4 text-xs text-vault-500 pt-3 border-t border-vault-800/50">
        <span className="flex items-center gap-1"><Music className="w-3 h-3" />{project.track_count ?? 0} tracks</span>
        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(project.updated_at)}</span>
      </div>
    </div>
  );
}
