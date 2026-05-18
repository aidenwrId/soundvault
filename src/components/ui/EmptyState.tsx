import React from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps { icon: React.ReactNode; title: string; description: string; action?: React.ReactNode; className?: string; }

export default function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      <div className="w-16 h-16 rounded-2xl bg-vault-800/60 flex items-center justify-center mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-vault-200 mb-2">{title}</h3>
      <p className="text-sm text-vault-400 max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
}
