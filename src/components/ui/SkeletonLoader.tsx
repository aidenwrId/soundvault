import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonLoaderProps { count?: number; type?: 'card' | 'row'; className?: string; }

export default function SkeletonLoader({ count = 6, type = 'card', className }: SkeletonLoaderProps) {
  if (type === 'row') {
    return <div className={cn('space-y-2', className)}>{Array.from({ length: count }).map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>;
  }
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl overflow-hidden">
          <div className="skeleton aspect-square" />
          <div className="p-4 space-y-2 bg-vault-800/30">
            <div className="skeleton h-4 rounded w-3/4" />
            <div className="skeleton h-3 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
