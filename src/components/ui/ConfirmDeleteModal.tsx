'use client';
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDeleteModalProps { isOpen: boolean; onClose: () => void; onConfirm: () => void; title: string; description: string; loading?: boolean; }

export default function ConfirmDeleteModal({ isOpen, onClose, onConfirm, title, description, loading }: ConfirmDeleteModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-vault-900 border border-vault-700/50 rounded-2xl shadow-2xl p-6 animate-slide-up">
        <div className="w-12 h-12 rounded-xl bg-accent-red/10 flex items-center justify-center mx-auto mb-4"><AlertTriangle className="w-6 h-6 text-accent-red" /></div>
        <h3 className="text-lg font-semibold text-vault-50 text-center mb-2">{title}</h3>
        <p className="text-sm text-vault-400 text-center mb-6">{description}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 bg-vault-800 hover:bg-vault-700 text-vault-200 text-sm font-medium rounded-xl transition-all">Cancel</button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 py-2.5 bg-accent-red hover:bg-red-500 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50">{loading ? 'Deleting...' : 'Delete'}</button>
        </div>
      </div>
    </div>
  );
}
