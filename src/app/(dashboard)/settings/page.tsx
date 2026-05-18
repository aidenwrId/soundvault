'use client';
import React, { useState, useEffect } from 'react';
import { User, Save, Loader2 } from 'lucide-react';
import StorageUsageBar from '@/components/ui/StorageUsageBar';
import type { Profile } from '@/types';

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/profile');
      if (res.ok) { const data = await res.json(); setProfile(data.profile); setUsername(data.profile.username || ''); setDisplayName(data.profile.display_name || ''); }
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true); setMessage('');
    const res = await fetch('/api/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, displayName }) });
    if (res.ok) { const data = await res.json(); setProfile(data.profile); setMessage('Settings saved!'); }
    else { const data = await res.json(); setMessage(data.error || 'Failed to save'); }
    setSaving(false); setTimeout(() => setMessage(''), 3000);
  };

  if (loading) return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 text-accent-blue animate-spin" /></div>;

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-20 bg-vault-950/90 backdrop-blur-md border-b border-vault-800/40">
        <div className="px-6 py-4"><h1 className="text-xl font-bold text-vault-50">Settings</h1></div>
      </div>
      <div className="max-w-2xl mx-auto p-6 space-y-8">
        {/* Profile */}
        <div className="glass-card p-6 space-y-6">
          <h2 className="text-lg font-semibold text-vault-100 flex items-center gap-2"><User className="w-5 h-5 text-accent-blue" />Profile</h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-vault-700 flex items-center justify-center"><User className="w-8 h-8 text-vault-400" /></div>
            <div><p className="text-sm text-vault-100 font-medium">{profile?.email}</p><p className="text-xs text-vault-400">Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : ''}</p></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-sm text-vault-300 font-medium">Username</label><input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full mt-1 px-4 py-2.5 bg-vault-800 border border-vault-700/50 rounded-xl text-sm text-vault-100 focus:outline-none focus:border-accent-blue/50" /></div>
            <div><label className="text-sm text-vault-300 font-medium">Display Name</label><input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full mt-1 px-4 py-2.5 bg-vault-800 border border-vault-700/50 rounded-xl text-sm text-vault-100 focus:outline-none focus:border-accent-blue/50" /></div>
          </div>
          {message && <p className={`text-sm ${message.includes('saved') ? 'text-accent-green' : 'text-accent-red'}`}>{message}</p>}
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-accent-blue hover:bg-accent-blue-light text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50">
            <Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
        {/* Storage */}
        {profile && (
          <div className="glass-card p-6 space-y-4">
            <h2 className="text-lg font-semibold text-vault-100">Storage</h2>
            <StorageUsageBar used={profile.storage_used_bytes} limit={profile.storage_limit_bytes} />
          </div>
        )}
        {/* Plan */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-vault-100">Plan</h2>
          <p className="text-sm text-vault-400">You&apos;re on the <span className="text-accent-blue font-medium">Free</span> plan. Upgrade coming soon.</p>
        </div>
      </div>
    </div>
  );
}
