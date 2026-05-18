'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Link2, Copy, Check, ExternalLink, ToggleLeft, ToggleRight, Trash2, Share2 } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmDeleteModal from '@/components/ui/ConfirmDeleteModal';
import { getAppUrl, copyToClipboard, formatDate, cn } from '@/lib/utils';
import type { ShareLink } from '@/types';

export default function SharedLinksPage() {
  const [links, setLinks] = useState<ShareLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteLink, setDeleteLink] = useState<ShareLink | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchLinks = useCallback(async () => {
    const res = await fetch('/api/share-links');
    if (res.ok) { const data = await res.json(); setLinks(data.shareLinks || []); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchLinks(); }, [fetchLinks]);

  const handleCopy = async (link: ShareLink) => {
    if (await copyToClipboard(`${getAppUrl()}/s/${link.slug}`)) { setCopiedId(link.id); setTimeout(() => setCopiedId(null), 2000); }
  };

  const handleToggle = async (link: ShareLink) => {
    await fetch(`/api/share-links/${link.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !link.is_active }) });
    fetchLinks();
  };

  const handleDelete = async () => {
    if (!deleteLink) return; setDeleting(true);
    await fetch(`/api/share-links/${deleteLink.id}`, { method: 'DELETE' });
    setDeleteLink(null); setDeleting(false); fetchLinks();
  };

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-20 bg-vault-950/90 backdrop-blur-md border-b border-vault-800/40">
        <div className="px-6 py-4"><h1 className="text-xl font-bold text-vault-50">Shared Links</h1></div>
      </div>
      <div className="p-6">
        {loading ? <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-20 rounded-xl" />)}</div> : links.length === 0 ? (
          <EmptyState icon={<Share2 className="w-8 h-8 text-vault-500" />} title="No shared links" description="Share a track or project to create your first link." />
        ) : (
          <div className="space-y-3">
            {links.map((link) => (
              <div key={link.id} className={cn('glass-card p-4 flex items-center gap-4', !link.is_active && 'opacity-50')}>
                <div className="w-10 h-10 rounded-xl bg-accent-blue/10 flex items-center justify-center flex-shrink-0"><Link2 className="w-5 h-5 text-accent-blue" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', link.resource_type === 'track' ? 'bg-accent-blue/20 text-accent-blue' : 'bg-accent-purple/20 text-accent-purple')}>{link.resource_type}</span>
                    {link.password_hash && <span className="text-xs px-2 py-0.5 rounded-full bg-accent-amber/20 text-accent-amber">Protected</span>}
                    {link.expires_at && <span className="text-xs text-vault-500">Expires {formatDate(link.expires_at)}</span>}
                  </div>
                  <p className="text-sm text-vault-300 truncate">{getAppUrl()}/s/{link.slug}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => handleCopy(link)} className={cn('p-2 rounded-lg transition-colors', copiedId === link.id ? 'text-accent-green' : 'text-vault-400 hover:text-vault-200 hover:bg-vault-800')}>
                    {copiedId === link.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button onClick={() => handleToggle(link)} className="p-2 rounded-lg text-vault-400 hover:text-vault-200 hover:bg-vault-800 transition-colors">
                    {link.is_active ? <ToggleRight className="w-5 h-5 text-accent-green" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                  <button onClick={() => setDeleteLink(link)} className="p-2 rounded-lg text-vault-400 hover:text-accent-red hover:bg-vault-800 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <ConfirmDeleteModal isOpen={!!deleteLink} onClose={() => setDeleteLink(null)} onConfirm={handleDelete} title="Delete Share Link" description="This will permanently deactivate the link. Anyone with the URL will no longer be able to access the content." loading={deleting} />
    </div>
  );
}
