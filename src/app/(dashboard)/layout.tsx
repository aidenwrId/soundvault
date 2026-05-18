'use client';
import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import AudioPlayer from '@/components/player/AudioPlayer';
import { AudioPlayerProvider } from '@/components/player/AudioPlayerProvider';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <AudioPlayerProvider>
      <div className="min-h-screen bg-vault-950">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        <main className={cn('transition-all duration-300 pb-24', collapsed ? 'ml-16' : 'ml-60')}>
          {children}
        </main>
        <AudioPlayer />
      </div>
    </AudioPlayerProvider>
  );
}
