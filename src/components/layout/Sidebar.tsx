'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Library, FolderOpen, Share2, Clock, Trash2, Settings,
  Music2, ChevronLeft, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/library', icon: Library, label: 'Library' },
  { href: '/projects', icon: FolderOpen, label: 'Projects' },
  { href: '/shared', icon: Share2, label: 'Shared Links' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full z-40 transition-all duration-300 ease-in-out',
        'bg-gradient-sidebar border-r border-vault-800/60',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-vault-800/40">
        <Link href="/library" className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent-blue/20 flex items-center justify-center flex-shrink-0">
            <Music2 className="w-4 h-4 text-accent-blue" />
          </div>
          {!collapsed && (
            <span className="text-base font-bold text-vault-50 tracking-tight whitespace-nowrap">
              SoundVault
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="p-2 mt-2 space-y-0.5">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                'group relative',
                isActive
                  ? 'bg-accent-blue/10 text-accent-blue-light'
                  : 'text-vault-300 hover:text-vault-100 hover:bg-vault-800/50'
              )}
              title={collapsed ? label : undefined}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent-blue rounded-r-full" />
              )}
              <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-accent-blue')} />
              {!collapsed && (
                <span className="text-sm font-medium">{label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className={cn(
          'absolute bottom-20 right-0 translate-x-1/2',
          'w-6 h-6 rounded-full bg-vault-800 border border-vault-700',
          'flex items-center justify-center',
          'text-vault-400 hover:text-vault-100 hover:bg-vault-700',
          'transition-all duration-200 z-50'
        )}
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>
    </aside>
  );
}
