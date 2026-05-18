'use client';

import React, { useState } from 'react';
import { Search, Upload, User, LogOut, ChevronDown } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface TopbarProps {
  onUploadClick: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function Topbar({ onUploadClick, searchQuery, onSearchChange }: TopbarProps) {
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-vault-800/40 bg-vault-950/80 backdrop-blur-md sticky top-0 z-30">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-vault-400" />
          <input
            type="text"
            placeholder="Search tracks, artists, projects..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-vault-800/60 border border-vault-700/50 rounded-xl text-sm text-vault-100 placeholder:text-vault-500 focus:outline-none focus:border-accent-blue/50 focus:bg-vault-800 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Upload Button */}
        <button
          onClick={onUploadClick}
          className="flex items-center gap-2 px-4 py-2 bg-accent-blue hover:bg-accent-blue-light text-white text-sm font-medium rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-accent-blue/20"
        >
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">Upload</span>
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-vault-800/60 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-vault-700 flex items-center justify-center">
              <User className="w-4 h-4 text-vault-300" />
            </div>
            <ChevronDown className="w-3 h-3 text-vault-400" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-2 w-48 bg-vault-800 border border-vault-700 rounded-xl shadow-xl z-50 py-1 animate-fade-in">
                <button
                  onClick={() => { setShowMenu(false); router.push('/settings'); }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-vault-200 hover:bg-vault-700/60 transition-colors"
                >
                  <User className="w-4 h-4" />
                  Settings
                </button>
                <hr className="border-vault-700 my-1" />
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-accent-red hover:bg-vault-700/60 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
