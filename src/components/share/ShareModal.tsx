'use client';
import React, { useState } from 'react';
import { X, Link2, Copy, Check, Shield, Download, Eye, Clock, EyeOff } from 'lucide-react';
import { getAppUrl, copyToClipboard, cn } from '@/lib/utils';
import type { Track, Project } from '@/types';

interface ShareModalProps {
  isOpen: boolean; onClose: () => void;
  resource: Track | Project | null; resourceType: 'track' | 'project';
}

export default function ShareModal({ isOpen, onClose, resource, resourceType }: ShareModalProps) {
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [allowDownload, setAllowDownload] = useState(false);
  const [showArtist, setShowArtist] = useState(true);
  const [password, setPassword] = useState('');
  const [expiresIn, setExpiresIn] = useState('');
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!resource) return;
    setLoading(true); setError('');
    try {
      let expiresAt: string | undefined;
      if (expiresIn) { const d = new Date(); d.setDate(d.getDate() + parseInt(expiresIn)); expiresAt = d.toISOString(); }
      const res = await fetch('/api/share-links', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resourceType, resourceId: resource.id, allowDownload, showArtist, password: password || undefined, expiresAt }) });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      const { shareLink } = await res.json();
      setShareUrl(`${getAppUrl()}/s/${shareLink.slug}`);
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed'); }
    setLoading(false);
  };

  const handleCopy = async () => {
    if (await copyToClipboard(shareUrl)) { setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  if (!isOpen || !resource) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-vault-900 border border-vault-700/50 rounded-2xl shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-vault-800/60">
          <h2 className="text-lg font-semibold text-vault-50 flex items-center gap-2"><Link2 className="w-5 h-5 text-accent-blue" />Share</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-vault-800 text-vault-400"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-vault-300">Create a shareable link for <span className="text-vault-100 font-medium">{('title' in resource) ? resource.title : ''}</span></p>
          {!shareUrl ? (
            <>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 bg-vault-800/50 rounded-xl cursor-pointer">
                  <span className="flex items-center gap-2 text-sm text-vault-200"><Download className="w-4 h-4" />Allow downloads</span>
                  <input type="checkbox" checked={allowDownload} onChange={(e) => setAllowDownload(e.target.checked)} className="w-4 h-4 accent-accent-blue" />
                </label>
                <label className="flex items-center justify-between p-3 bg-vault-800/50 rounded-xl cursor-pointer">
                  <span className="flex items-center gap-2 text-sm text-vault-200"><Eye className="w-4 h-4" />Show artist name</span>
                  <input type="checkbox" checked={showArtist} onChange={(e) => setShowArtist(e.target.checked)} className="w-4 h-4 accent-accent-blue" />
                </label>
                <div className="p-3 bg-vault-800/50 rounded-xl space-y-2">
                  <span className="flex items-center gap-2 text-sm text-vault-200"><Shield className="w-4 h-4" />Password protection</span>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Optional password" className="w-full px-3 py-2 bg-vault-800 border border-vault-700/50 rounded-lg text-sm text-vault-100 focus:outline-none focus:border-accent-blue/50" />
                </div>
                <div className="p-3 bg-vault-800/50 rounded-xl space-y-2">
                  <span className="flex items-center gap-2 text-sm text-vault-200"><Clock className="w-4 h-4" />Expiration</span>
                  <select value={expiresIn} onChange={(e) => setExpiresIn(e.target.value)} className="w-full px-3 py-2 bg-vault-800 border border-vault-700/50 rounded-lg text-sm text-vault-200 focus:outline-none">
                    <option value="">Never expires</option>
                    <option value="1">1 day</option><option value="7">7 days</option><option value="30">30 days</option><option value="90">90 days</option>
                  </select>
                </div>
              </div>
              {error && <p className="text-sm text-accent-red">{error}</p>}
              <button onClick={handleCreate} disabled={loading} className="w-full py-2.5 bg-accent-blue hover:bg-accent-blue-light text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50">{loading ? 'Creating...' : 'Create Link'}</button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-vault-800 rounded-xl">
                <input type="text" value={shareUrl} readOnly className="flex-1 bg-transparent text-sm text-accent-blue-light focus:outline-none" />
                <button onClick={handleCopy} className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-all', copied ? 'bg-accent-green/20 text-accent-green' : 'bg-accent-blue/20 text-accent-blue hover:bg-accent-blue/30')}>
                  {copied ? <><Check className="w-3 h-3 inline mr-1" />Copied</> : <><Copy className="w-3 h-3 inline mr-1" />Copy</>}
                </button>
              </div>
              <button onClick={() => { setShareUrl(''); onClose(); }} className="w-full py-2.5 bg-vault-800 hover:bg-vault-700 text-vault-200 text-sm font-medium rounded-xl transition-all">Done</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
