'use client';
import React, { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';

interface CreateProjectModalProps { isOpen: boolean; onClose: () => void; onCreated?: () => void; }

export default function CreateProjectModal({ isOpen, onClose, onCreated }: CreateProjectModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, description }) });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      setTitle(''); setDescription(''); onCreated?.(); onClose();
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed'); }
    setLoading(false);
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-vault-900 border border-vault-700/50 rounded-2xl shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-vault-800/60">
          <h2 className="text-lg font-semibold text-vault-50 flex items-center gap-2"><FolderPlus className="w-5 h-5 text-accent-purple" />New Project</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-vault-800 text-vault-400"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div><label className="text-sm text-vault-300 font-medium">Title</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full mt-1 px-4 py-2.5 bg-vault-800 border border-vault-700/50 rounded-xl text-sm text-vault-100 focus:outline-none focus:border-accent-blue/50" required /></div>
          <div><label className="text-sm text-vault-300 font-medium">Description</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full mt-1 px-4 py-2.5 bg-vault-800 border border-vault-700/50 rounded-xl text-sm text-vault-100 focus:outline-none focus:border-accent-blue/50 resize-none" /></div>
          {error && <p className="text-sm text-accent-red">{error}</p>}
          <button type="submit" disabled={loading || !title.trim()} className="w-full py-2.5 bg-accent-purple hover:bg-accent-purple-light text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50">{loading ? 'Creating...' : 'Create Project'}</button>
        </form>
      </div>
    </div>
  );
}
