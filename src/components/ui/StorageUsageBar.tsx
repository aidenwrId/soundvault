import React from 'react';
import { formatFileSize, cn } from '@/lib/utils';

interface StorageUsageBarProps { used: number; limit: number; className?: string; }

export default function StorageUsageBar({ used, limit, className }: StorageUsageBarProps) {
  const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const isHigh = pct > 80;
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-vault-300">Storage</span>
        <span className="text-vault-400">{formatFileSize(used)} / {formatFileSize(limit)}</span>
      </div>
      <div className="h-2 bg-vault-800 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-500', isHigh ? 'bg-accent-red' : 'bg-accent-blue')} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
